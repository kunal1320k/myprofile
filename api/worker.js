// Cloudflare Worker for Spotify "Now Playing" API (Free, fast Edge deployment)
// Set environment secrets in your Cloudflare dashboard:
// SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

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
        service: "kunal-profile-services"
      }),
      { headers: corsHeaders }
    );
  },
};
