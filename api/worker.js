// Cloudflare Worker for Spotify & Online Song History Storage
// Deployment: Cloudflare Workers (Edge global network)
// Endpoints:
//   GET  /song       -> Returns current/last played song, author, date & time, and online history
//   POST /song       -> Saves a newly played song to online storage
//   GET  /visitor    -> Visitor counter
//   POST /visitor    -> Visitor counter increment
//   GET  /           -> Root status or Spotify now-playing if credentials provided

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=kunal1320k&api_key=8cb15a1d7dae6195b40a2f403fa6447f&format=json&limit=10";

// In-memory Edge fallback cache (persists in worker edge instances)
let edgeLastPlayed = null;
let edgeSongHistory = [];
let inMemoryCount = 17;
const inMemoryVisitors = new Set();

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=5, s-maxage=5",
    ...extra
  };
}

function formatSongDateTime(dateInput) {
  if (!dateInput) return "";
  let d;
  if (typeof dateInput === 'number') {
    d = new Date(dateInput < 1e11 ? dateInput * 1000 : dateInput);
  } else if (typeof dateInput === 'string') {
    const num = Number(dateInput);
    if (!isNaN(num) && num > 0) {
      d = new Date(num < 1e11 ? num * 1000 : num);
    } else {
      d = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    return "";
  }
  if (isNaN(d.getTime())) return "";

  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
}

async function fetchOnlineLastFmTracks() {
  try {
    const res = await fetch(LASTFM_ENDPOINT);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.recenttracks && data.recenttracks.track) {
      const tracks = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track];
      if (tracks.length === 0) return null;

      const history = [];
      let liveSong = null;

      tracks.forEach((tr) => {
        const title = tr.name;
        const artist = (tr.artist && (tr.artist['#text'] || tr.artist.name)) || "";
        if (!title || !artist) return;

        let ts = Date.now();
        if (tr.date && tr.date.uts) {
          ts = parseInt(tr.date.uts, 10) * 1000;
        }

        const isLive = Boolean(tr['@attr'] && tr['@attr'].nowplaying === "true");
        const entry = {
          title: title.trim(),
          artist: artist.trim(),
          timestamp: ts,
          date_time: formatSongDateTime(ts),
          is_playing: isLive
        };

        if (isLive && !liveSong) {
          liveSong = entry;
        }
        history.push(entry);
      });

      const top = liveSong || history[0];
      return {
        latest: top,
        history: history.slice(0, 10)
      };
    }
  } catch (e) {
    console.warn("Worker Last.fm fallback error:", e);
  }
  return null;
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // ── 1. ONLINE SONG STORAGE ENDPOINTS (/song, /last-played, /history) ──────
    if (path === "/song" || path === "/last-played" || path === "/history") {
      // POST: Update the currently / last played song in online storage
      if (request.method === "POST") {
        try {
          const body = await request.json();
          if (!body || !body.title || !body.artist) {
            return new Response(
              JSON.stringify({ error: "Missing required fields: title, artist" }),
              { status: 400, headers: corsHeaders() }
            );
          }

          const title = body.title.trim();
          const artist = body.artist.trim();
          const ts = typeof body.timestamp === 'number' ? body.timestamp : Date.now();
          const dateTime = body.date_time || formatSongDateTime(ts);
          const isPlaying = Boolean(body.is_playing);

          const songEntry = {
            title,
            artist,
            timestamp: ts,
            date_time: dateTime,
            is_playing: isPlaying
          };

          // Update edge memory cache
          edgeLastPlayed = songEntry;
          edgeSongHistory = edgeSongHistory.filter(
            item => !(item.title.toLowerCase() === title.toLowerCase() && item.artist.toLowerCase() === artist.toLowerCase())
          );
          edgeSongHistory.unshift(songEntry);
          if (edgeSongHistory.length > 15) edgeSongHistory = edgeSongHistory.slice(0, 15);

          // Update Cloudflare KV if configured
          if (env && env.SONG_KV) {
            try {
              await env.SONG_KV.put("last_played_song", JSON.stringify(songEntry));
              await env.SONG_KV.put("song_history", JSON.stringify(edgeSongHistory));
            } catch (kvErr) {
              console.warn("KV put error:", kvErr);
            }
          }

          return new Response(
            JSON.stringify({
              success: true,
              stored: songEntry,
              history: edgeSongHistory
            }),
            { headers: corsHeaders({ "Cache-Control": "no-store" }) }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message || "Failed to parse JSON body" }),
            { status: 400, headers: corsHeaders() }
          );
        }
      }

      // GET: Retrieve the stored last song, author, date & time, and history
      try {
        let storedSong = null;
        let historyList = [];

        // 1. Try Cloudflare KV
        if (env && env.SONG_KV) {
          try {
            const rawSong = await env.SONG_KV.get("last_played_song", "json");
            const rawHist = await env.SONG_KV.get("song_history", "json");
            if (rawSong) storedSong = rawSong;
            if (Array.isArray(rawHist)) historyList = rawHist;
          } catch (kvErr) {
            console.warn("KV get error:", kvErr);
          }
        }

        // 2. Fall back to Edge memory
        if (!storedSong && edgeLastPlayed) {
          storedSong = edgeLastPlayed;
          historyList = edgeSongHistory;
        }

        // 3. Fall back to live 24/7 Last.fm cloud tracker
        if (!storedSong || historyList.length === 0) {
          const cloudData = await fetchOnlineLastFmTracks();
          if (cloudData) {
            storedSong = cloudData.latest;
            historyList = cloudData.history;
            edgeLastPlayed = storedSong;
            edgeSongHistory = historyList;

            // Seed KV if present
            if (env && env.SONG_KV) {
              try {
                await env.SONG_KV.put("last_played_song", JSON.stringify(storedSong));
                await env.SONG_KV.put("song_history", JSON.stringify(historyList));
              } catch (_) {}
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            title: storedSong ? storedSong.title : "",
            artist: storedSong ? storedSong.artist : "",
            timestamp: storedSong ? storedSong.timestamp : 0,
            date_time: storedSong ? storedSong.date_time : "",
            is_playing: storedSong ? Boolean(storedSong.is_playing) : false,
            history: historyList
          }),
          { headers: corsHeaders() }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    // ── 2. VISITOR COUNTER ENDPOINT (/visitor) ────────────────────────────────
    if (path === "/visitor") {
      if (request.method !== "POST" && request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders() });
      }

      try {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        let isNew = false;
        if (!inMemoryVisitors.has(ip)) {
          inMemoryVisitors.add(ip);
          inMemoryCount += 1;
          isNew = true;
        }

        return new Response(
          JSON.stringify({ count: inMemoryCount, counted: isNew }),
          { headers: corsHeaders({ "Cache-Control": "no-store" }) }
        );
      } catch (e) {
        return new Response(JSON.stringify({ count: 17, error: e.message }), { headers: corsHeaders() });
      }
    }

    // ── 3. SPOTIFY NOW PLAYING (if credentials configured in env) ─────────────
    if (env && env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REFRESH_TOKEN) {
      try {
        const { access_token } = await getAccessToken(env);
        if (!access_token) {
          return new Response(
            JSON.stringify({ is_playing: false, error: "Authentication failed" }),
            { headers: corsHeaders(), status: 500 }
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
                { headers: corsHeaders() }
              );
            }
          }

          return new Response(JSON.stringify({ is_playing: false }), { headers: corsHeaders() });
        }

        const song = await response.json();
        if (!song.item) {
          return new Response(JSON.stringify({ is_playing: false }), { headers: corsHeaders() });
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

        return new Response(JSON.stringify(data), { headers: corsHeaders() });
      } catch (err) {
        return new Response(
          JSON.stringify({ is_playing: false, error: err.message }),
          { headers: corsHeaders(), status: 500 }
        );
      }
    }

    // ── 4. DEFAULT ROOT RESPONSE ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        status: "online",
        service: "kunal-profile-services",
        endpoints: {
          song: "/song",
          last_played: "/last-played",
          history: "/history",
          visitor: "/visitor"
        }
      }),
      { headers: corsHeaders() }
    );
  },
};
