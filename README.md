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

## Visitor Counter

The visitor counter is designed for a Cloudflare Worker with a Durable Object. It stores a stable browser identifier plus a network abuse guard only as HMAC hashes—never raw IP addresses. This gives a much stronger approximation of unique people than local storage alone, although anonymous websites cannot prove one browser equals one person.

### Deploy the counter

1. Install and sign in to Cloudflare Wrangler, then deploy this repository's Worker:

   ```bash
   npm install -g wrangler
   wrangler login
   wrangler deploy
   ```

2. Create a long random HMAC salt and save it as a Worker secret:

   ```bash
   wrangler secret put VISITOR_HASH_SALT
   ```

3. Set `VISITOR_COUNTER_CONFIG.endpoint` in [`index.js`](index.js) to your deployed Worker URL followed by `/visitor`.

4. If you use a custom portfolio domain, set `ALLOWED_ORIGINS` as a Worker variable to a comma-separated allowlist, such as `https://your-domain.example,https://kunal1320k.github.io`.

The Durable Object starts at `0` on its first request. Resetting it later is an administrative change, not a public browser action.

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
