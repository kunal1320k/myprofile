# kunal1320k — autumn portfolio 🍂

Live site: [https://kunal1320k.github.io/myprofile/](https://kunal1320k.github.io/myprofile/)

An interactive autumn-themed portfolio with retro terminal raw landing, dynamic canvas leaves animation, real-time Spotify "Now Playing" tracking, and live visitor counter.

---

## ✨ Features

- **Real-Time Spotify Now Playing**:
  - Live animated equalizer soundwaves
  - Real-time progress bar synced with track duration
  - Album artwork, track title, artist, and direct Spotify link
  - Dual integration support: **Lanyard (Discord Presence)** or **Direct Spotify API (Serverless)**
  - Seamless fallback to your custom Autumn Playlist (`14d7SJJHjhwEerGgKaUa4J`) with embed toggle
- **Live Website View Counter**:
  - Displays total page views on both Raw and Aesthetic views
  - Session-aware deduplication to prevent spam on rapid refreshes
  - Smooth roll-up number animation
- **Autumn Experience**:
  - Procedural autumn tree canvas with floating, fluttering leaves
  - Ambient background theme music (`nothing_new.mp3`) with mute/unmute control
  - High-performance responsive layouts for mobile and desktop

---

## 🎵 How to Set Up Real-Time Spotify

### Option 1: Lanyard (Zero Server, Instant & Free) — Recommended ⭐

If you already use Spotify on your computer or phone while logged into Discord, Lanyard provides real-time Spotify synchronization with zero backend required:

1. In Discord, go to **User Settings > Connections** and connect your Spotify account.
2. Ensure **"Display Spotify as your status"** is enabled.
3. Join the official Lanyard Discord server once: [discord.gg/lanyard](https://discord.gg/lanyard) (this allows Lanyard to monitor presence).
4. In Discord, enable **User Settings > Advanced > Developer Mode**, right-click your profile and select **Copy User ID**.
5. Open [`index.js`](file:///index.js) and update `SPOTIFY_CONFIG`:
   ```javascript
   const SPOTIFY_CONFIG = {
     discordId: "YOUR_DISCORD_USER_ID_HERE",
     // ...
   };
   ```
6. Push to GitHub! Whenever you listen to Spotify, your website will automatically show the live track, album artwork, and animated equalizer in real time.

---

### Option 2: Direct Spotify Web API (Serverless Function)

If you prefer direct Spotify OAuth without Discord:

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Set Redirect URI to `http://localhost:3000/callback` (or your authorization helper).
3. Get your `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and generate a `SPOTIFY_REFRESH_TOKEN` with scope `user-read-currently-playing,user-read-playback-state,user-read-recently-played`.
4. Deploy [`api/spotify.js`](file:///api/spotify.js) to **Vercel** or [`api/worker.js`](file:///api/worker.js) to **Cloudflare Workers**.
5. Set your deployed API URL in [`index.js`](file:///index.js):
   ```javascript
   const SPOTIFY_CONFIG = {
     apiEndpoint: "https://your-spotify-api.vercel.app/api/spotify",
     // ...
   };
   ```

---

## 👁️ Visitor View Counter

The view counter uses [CountAPI](https://countapi.mileshilliard.com) with the key `kunal1320k_portfolio_visits`.
It increments when a new visitor loads the page and stores session state to prevent false counts during reloads.

---

## 🚀 Local Development

To test locally:
```bash
# Using Python
python -m http.server 8000

# Or using Node / npx
npx -y serve .
```
Then visit `http://localhost:8000`.
