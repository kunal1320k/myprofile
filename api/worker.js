// Cloudflare Worker for Spotify "Now Playing" API (Free, fast Edge deployment)
// Set environment secrets in your Cloudflare dashboard:
// SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const VISITOR_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_NEW_VISITORS_PER_NETWORK_WINDOW = 5;

function visitorCorsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    "Vary": "Origin"
  };
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configuredOrigins = (env.ALLOWED_ORIGINS || "https://kunal1320k.github.io,http://localhost:8000")
    .split(",")
    .map((value) => value.trim());
  return configuredOrigins.includes(origin) ? origin : "";
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// A Durable Object serializes increments so simultaneous first visits cannot
// race. It stores only HMAC-derived identifiers—never raw IP addresses.
export class VisitorCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { visitorHash, networkHash } = await request.json();
    if (!/^[a-f0-9]{64}$/.test(visitorHash || "") || !/^[a-f0-9]{64}$/.test(networkHash || "")) {
      return new Response(JSON.stringify({ error: "Invalid visitor identity" }), { status: 400 });
    }

    const payload = await this.state.storage.transaction(async (storage) => {
      const now = Date.now();
      const visitorKey = `visitor:${visitorHash}`;
      const networkKey = `network:${networkHash}`;
      const knownVisitor = await storage.get(visitorKey);
      let count = (await storage.get("count")) || 0;

      if (knownVisitor) return { count, counted: false };

      const network = await storage.get(networkKey);
      const inWindow = network && now - network.windowStartedAt < VISITOR_WINDOW_MS;
      const newVisitors = inWindow ? network.newVisitors : 0;
      const canCount = newVisitors < MAX_NEW_VISITORS_PER_NETWORK_WINDOW;

      await storage.put(visitorKey, { firstSeenAt: now, counted: canCount });
      await storage.put(networkKey, {
        windowStartedAt: inWindow ? network.windowStartedAt : now,
        newVisitors: newVisitors + 1
      });

      if (canCount) {
        count += 1;
        await storage.put("count", count);
      }
      return { count, counted: canCount };
    });

    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
}

async function getAccessToken(env) {
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  return response.json();
}

let inMemoryCount = 17;
const inMemoryVisitors = new Set();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/visitor" || url.pathname === "/visitor/") {
      const origin = allowedOrigin(request, env) || "*";
      const headers = visitorCorsHeaders(origin);
      if (request.method === "OPTIONS") return new Response(null, { headers });
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
      }

      try {
        let clientId = "anonymous";
        try {
          const body = await request.json();
          if (body && body.clientId) clientId = body.clientId;
        } catch (e) {}

        const salt = env.VISITOR_HASH_SALT || "kunal_autumn_profile_salt_2026";
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const userAgent = request.headers.get("User-Agent") || "unknown";
        const visitorHash = await hmacHex(salt, `visitor:${clientId}`);
        const networkHash = await hmacHex(salt, `network:${ip}:${userAgent}`);

        // Option A: Durable Object (if available on Paid plan)
        if (env.VISITOR_COUNTER) {
          try {
            const counterId = env.VISITOR_COUNTER.idFromName("profile");
            const response = await env.VISITOR_COUNTER.get(counterId).fetch("https://visitor-counter.internal/visit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ visitorHash, networkHash })
            });
            return new Response(response.body, { status: response.status, headers });
          } catch (e) {
            console.warn("Durable object error, falling back to KV/memory:", e);
          }
        }

        // Option B: Cloudflare KV Namespace (100% Free on all Cloudflare accounts!)
        if (env.VISITOR_KV) {
          const visitorKey = `v_${visitorHash}`;
          const isKnown = await env.VISITOR_KV.get(visitorKey);
          let rawCount = await env.VISITOR_KV.get("visitor_count");
          let count = rawCount ? parseInt(rawCount, 10) : 17;

          if (!isKnown) {
            count += 1;
            await env.VISITOR_KV.put("visitor_count", count.toString());
            // Remember visitor for 30 days
            await env.VISITOR_KV.put(visitorKey, "1", { expirationTtl: 60 * 60 * 24 * 30 });
            return new Response(JSON.stringify({ count, counted: true }), { headers });
          }

          return new Response(JSON.stringify({ count, counted: false }), { headers });
        }

        // Option C: In-Memory Edge Fallback (Works instantly with zero configuration!)
        let isCounted = false;
        if (!inMemoryVisitors.has(visitorHash)) {
          inMemoryVisitors.add(visitorHash);
          inMemoryCount += 1;
          isCounted = true;
        }

        return new Response(JSON.stringify({ count: inMemoryCount, counted: isCounted }), { headers });
      } catch (error) {
        return new Response(JSON.stringify({ count: 17, counted: false, error: error.message }), { status: 200, headers });
      }
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=5",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // If Spotify credentials are configured, serve Spotify endpoint
    if (env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REFRESH_TOKEN) {
      try {
        const { access_token } = await getAccessToken(env);
        if (!access_token) {
          return new Response(
            JSON.stringify({ is_playing: false, error: "Authentication failed" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        const response = await fetch(NOW_PLAYING_ENDPOINT, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (response.status === 204 || response.status > 400) {
          const recentResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (recentResponse.ok) {
            const recentData = await recentResponse.json();
            const item = recentData.items?.[0]?.track;
            if (item) {
              return new Response(
                JSON.stringify({
                  is_playing: false,
                  title: item.name,
                  artist: item.artists.map((a) => a.name).join(", "),
                  album: item.album.name,
                  album_art_url: item.album.images[0]?.url,
                  song_url: item.external_urls.spotify,
                }),
                { headers: corsHeaders }
              );
            }
          }

          return new Response(JSON.stringify({ is_playing: false }), { headers: corsHeaders });
        }

        const song = await response.json();
        if (!song.item) {
          return new Response(JSON.stringify({ is_playing: false }), { headers: corsHeaders });
        }

        const data = {
          is_playing: song.is_playing,
          title: song.item.name,
          artist: song.item.artists.map((a) => a.name).join(", "),
          album: song.item.album.name,
          album_art_url: song.item.album.images[0]?.url,
          song_url: song.item.external_urls.spotify,
          progress_ms: song.progress_ms,
          duration_ms: song.item.duration_ms,
          timestamp: Date.now(),
        };

        return new Response(JSON.stringify(data), { headers: corsHeaders });
      } catch (err) {
        return new Response(
          JSON.stringify({ is_playing: false, error: err.message }),
          { headers: corsHeaders, status: 500 }
        );
      }
    }

    // Default root response
    return new Response(
      JSON.stringify({
        status: "online",
        service: "kunal-profile-services",
        endpoints: {
          visitor: "/visitor"
        }
      }),
      { headers: corsHeaders }
    );
  },
};
