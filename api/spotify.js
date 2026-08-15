// Serverless Function for Spotify "Now Playing" API (Vercel / Netlify / Node)
// Set these environment variables in your Vercel/deployment dashboard:
// SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const getAccessToken = async () => {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });

  return response.json();
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");

  try {
    const { access_token } = await getAccessToken();

    if (!access_token) {
      return res.status(500).json({ is_playing: false, error: "Failed to obtain access token" });
    }

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (response.status === 204 || response.status > 400) {
      // Not currently playing, fetch recently played
      const recentResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        const item = recentData.items?.[0]?.track;
        if (item) {
          return res.status(200).json({
            is_playing: false,
            title: item.name,
            artist: item.artists.map((_artist) => _artist.name).join(", "),
            album: item.album.name,
            album_art_url: item.album.images[0]?.url,
            song_url: item.external_urls.spotify,
          });
        }
      }

      return res.status(200).json({ is_playing: false });
    }

    const song = await response.json();

    if (!song.item) {
      return res.status(200).json({ is_playing: false });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist) => _artist.name).join(", ");
    const album = song.item.album.name;
    const albumArtUrl = song.item.album.images[0]?.url;
    const songUrl = song.item.external_urls.spotify;
    const progressMs = song.progress_ms;
    const durationMs = song.item.duration_ms;

    return res.status(200).json({
      is_playing: isPlaying,
      title,
      artist,
      album,
      album_art_url: albumArtUrl,
      song_url: songUrl,
      progress_ms: progressMs,
      duration_ms: durationMs,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Spotify API error:", err);
    return res.status(500).json({ is_playing: false, error: err.message });
  }
}
