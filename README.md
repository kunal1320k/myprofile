# kunal1320k — autumn portfolio 🍂

Live site: [https://kunal1320k.github.io/myprofile/](https://kunal1320k.github.io/myprofile/)

An interactive autumn-themed portfolio with retro terminal raw landing, dynamic canvas leaves animation, and real-time Spotify "Now Playing" tracking.

---

## ✨ Features

- **Real-Time Spotify Now Playing**:
  - Live animated equalizer soundwaves
  - Real-time progress bar synced with track duration
  - Album artwork, track title, artist, and direct Spotify link
  - Dual integration support: **Lanyard (Discord Presence)** or **Direct Spotify API (Serverless)**
  - Seamless fallback to your custom Autumn Playlist (`14d7SJJHjhwEerGgKaUa4J`) with embed toggle
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
5. Open [`index.js`](index.js) and update `SPOTIFY_CONFIG`:
   ```javascript
   const SPOTIFY_CONFIG = {
     discordId: "YOUR_DISCORD_USER_ID_HERE",
     // ...
   };
   ```
6. Push to GitHub! Whenever you listen to Spotify, your website will automatically show the live track, album artwork, and animated equalizer in real time.

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
