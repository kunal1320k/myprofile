const LINKS = [
  { name: "github", handle: "/ kunal1320k", url: "https://github.com/kunal1320k" },
  { name: "instagram", handle: "/ kunal1320k", url: "https://www.instagram.com/kunal1320k/" },
  { name: "reddit", handle: "/ Juicy-Jam-987", url: "https://www.reddit.com/user/Juicy-Jam-987/" },
  { name: "myanimelist", handle: "/ kunal1320k", url: "https://myanimelist.net/profile/kunal1320k" },
  { name: "telegram", handle: "/ kunal1320k", url: "https://t.me/kunal1320k" },
  { name: "youtube", handle: "/ @kunal1320k", url: "https://www.youtube.com/@kunal1320k" },
  { name: "steam", handle: "/ kunal1320k", url: "https://steamcommunity.com/id/kunal1320k/" },
  { name: "spotify", handle: "/ kunal1320k", url: "https://open.spotify.com/user/kunal1320k" },
];
const PLAYLIST = "14d7SJJHjhwEerGgKaUa4J";
const PLAYLIST_URL = "https://open.spotify.com/playlist/14d7SJJHjhwEerGgKaUa4J?si=xpg45s19Ty6RTb1aWdBUdQ";

const rawRoot = document.getElementById('raw-root');
const aestheticRoot = document.getElementById('aesthetic-root');
const dropWrap = document.getElementById('drop-wrap');
const dropBtn = document.getElementById('drop');
const waveRing = document.getElementById('wave-ring');
const canvas = document.getElementById('leaves-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
const linksGrid = document.getElementById('links-grid');
const spotifyFrame = document.getElementById('spotify-frame');
const trackMeta = document.getElementById('track-meta');
const themeAudio = document.getElementById('theme-audio');
const muteBtn = document.getElementById('mute-btn');
const muteText = document.getElementById('mute-text');
const shuffleBtn = document.getElementById('shuffle-btn');

let revealed = false;
let isMuted = false;

// ── AUDIO ANALYSER (beat-reactive leaves) ─────────────────────────────────
let audioCtx = null;
let analyser = null;
let freqData = null;
let beatEnergy = 0;      // smoothed low-freq energy  0..1
let beatPeak  = 0;       // peak tracker for normalisation
let beatSmooth = 0;      // extra-smooth value for gentle sway

function initAudioAnalyser() {
  if (audioCtx) return;

  // Local file:// protocol blocks Web Audio media element readers due to CORS security policies.
  // We disable the analyser locally under file:// so the song can play directly through the element.
  if (window.location.protocol === 'file:') {
    console.warn(
      '🍂 Beat-reactive leaves are disabled locally under file:// due to browser CORS security restrictions.\n' +
      'To test the beat interaction locally, please run a local server (e.g. "python -m http.server 8000") or upload to GitHub Pages!'
    );
    return;
  }

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    freqData = new Uint8Array(analyser.frequencyBinCount);

    // Standard media element source (fully supported across Chrome, Firefox, Safari)
    const src = audioCtx.createMediaElementSource(themeAudio);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch (err) {
    console.warn('Audio analyser failed to initialize:', err);
    audioCtx = null;
    analyser = null;
    freqData = null;
  }
}

function updateBeat() {
  if (!analyser || !freqData) {
    beatEnergy = 0;
    beatSmooth = 0;
    return;
  }
  analyser.getByteFrequencyData(freqData);
  // Sum the first ~8 bins (bass ~20-300 Hz at 44100/256 ≈ 172 Hz/bin)
  let sum = 0;
  const bassBins = Math.min(8, freqData.length);
  for (let i = 0; i < bassBins; i++) sum += freqData[i];
  const raw = sum / (bassBins * 255); // 0..1

  // Dynamic peak normalisation
  beatPeak = Math.max(beatPeak * 0.9985, raw);
  const normalised = beatPeak > 0.02 ? Math.min(raw / beatPeak, 1) : raw;

  // Two smoothed values: snappy for burst, slow for ambient sway
  beatEnergy = beatEnergy * 0.55 + normalised * 0.45; // fast
  beatSmooth = beatSmooth * 0.88 + normalised * 0.12; // slow ambient
}

// render links
LINKS.forEach(l => {
  const a = document.createElement('a');
  a.href = l.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.className = "link-row";
  a.innerHTML = `<span class="name">${l.name}</span><span class="handle">${l.handle}</span><span class="arrow">↗</span>`;
  linksGrid.appendChild(a);
});

// LEAVES - UNCAPPED FPS, SMOOTH
const leafImgs = [];
const leafSrcs = ["data:image/webp;base64,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", "data:image/webp;base64,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", "data:image/webp;base64,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"];
let imagesLoaded = 0;
leafSrcs.forEach((src, i) => {
  const im = new Image();
  im.src = src;
  im.decoding = "async";
  im.onload = () => { imagesLoaded++ };
  leafImgs[i] = im;
});

// FIX: Use stable dimensions, handle Chrome address bar hide/show without flicker
let W = 0, H = 0, DPR = 1;
function getViewportHeight() {
  // visualViewport is more stable on Chrome mobile
  return window.visualViewport ? window.visualViewport.height : innerHeight;
}
function resizeCanvas() {
  const newW = innerWidth;
  // On mobile, use the largest height (lvh) to avoid resize flicker when URL bar hides
  const newH = window.innerWidth < 768 ? Math.max(innerHeight, document.documentElement.clientHeight, getViewportHeight()) : innerHeight;
  const newDPR = (newW < 768) ? 1 : Math.min(devicePixelRatio || 1, 2);

  // Only perform heavy canvas dimension resizing if size or scale actually changed
  if (W === newW && H === newH && DPR === newDPR) return;

  W = newW; H = newH; DPR = newDPR;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
let lastW = innerWidth;
resizeCanvas();

function isMobile() { return W < 768 }

let leaves = [];
function initLeaves() {
  const count = isMobile() ? 22 : 38;
  leaves = [];
  for (let i = 0; i < count; i++) {
    leaves.push({
      x: Math.random() * W,
      y: Math.random() * H - H,
      size: (isMobile() ? 14 : 19) + Math.random() * (isMobile() ? 20 : 30),
      vx: (Math.random() - 0.5) * 0.7,
      vy: 0.38 + Math.random() * 0.95,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.032,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.006 + Math.random() * 0.014,
      wobbleAmp: 0.7 + Math.random() * 1.7,
      depth: 0.55 + Math.random() * 0.9,
      imgIdx: Math.floor(Math.random() * 3),
      flip: Math.random() > 0.5 ? 1 : -1,
      opacity: 0.72 + Math.random() * 0.28
    });
  }
}
initLeaves();
// FIX: update canvas height on address-bar hide/show but don't re-init leaves (prevents flicker)
let resizeTimeout;
addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const newW = innerWidth;
    const widthChanged = newW !== lastW;
    // Always update canvas size to match viewport
    resizeCanvas();
    if (widthChanged) {
      lastW = newW;
      initLeaves();
    }
  }, 100);
}, { passive: true });
// Also listen to visualViewport resize (Chrome mobile)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    // Only resize canvas, not leaves
    resizeCanvas();
  }, { passive: true });
}

// uncapped RAF loop with delta
let lastT = performance.now();
let rafId;
function frame(t) {
  const dt = Math.min((t - lastT) / 16.666, 3); // normalize to 60fps base, but uncapped
  lastT = t;

  // ── Beat update ──────────────────────────────────────────────────────────
  updateBeat();
  // Beat multipliers applied to leaf physics
  const beatBurst   = beatEnergy;                        // 0..1, snappy
  const beatAmbient = beatSmooth;                        // 0..1, slow
  const speedBoost  = 1 + beatBurst  * 2.8;             // up to 3.8× fall speed
  const spinBoost   = 1 + beatBurst  * 4.0;             // extra spin on beat
  const wobbleBoost = 1 + beatAmbient * 1.4;            // gentle sway modulation
  const scaleBoost  = 1 + beatBurst  * 0.18;            // subtle size pulse

  ctx.clearRect(0, 0, W, H);
  const wind = Math.sin(t * 0.00032) * 1.1 + Math.sin(t * 0.00078) * 0.55 + Math.cos(t * 0.00019) * 0.35;

  for (let i = 0; i < leaves.length; i++) {
    const m = leaves[i];
    // Each leaf has a slightly different phase so they don't all move identically
    const leafBeat = beatBurst  * (0.7 + (i % 5) * 0.12);
    const leafAmb  = beatAmbient * (0.8 + (i % 3) * 0.1);

    m.wobble += m.wobbleSpeed * dt * (1 + leafAmb * 0.6);
    m.vx += (wind * 0.0065 + Math.sin(m.wobble) * 0.007) * dt;
    m.vx *= Math.pow(0.9965, dt);
    m.x += (m.vx + Math.cos(m.wobble) * m.wobbleAmp * wobbleBoost * 0.46 + wind * 0.38) * dt;
    // Beat makes leaves fall faster
    m.y += m.vy * (0.7 + m.depth * 0.6) * speedBoost * dt;
    // Beat increases rotation speed
    m.rot += (m.rotSpeed * spinBoost + Math.sin(m.wobble * 0.6) * 0.006) * dt;

    if (m.y > H + 90) { m.y = -90 - Math.random() * 200; m.x = Math.random() * W; m.vx = (Math.random() - 0.5) * 0.7; }
    if (m.x < -120) m.x = W + 80;
    if (m.x > W + 120) m.x = -80;

    const img = leafImgs[m.imgIdx];
    if (!img || !img.complete) continue;
    ctx.save();
    // Opacity pulses slightly on beat
    const opacityPulse = m.opacity + leafBeat * 0.22 * (1 - m.opacity);
    ctx.globalAlpha = Math.min(opacityPulse * m.depth, 1);
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rot);
    // Scale pulse: leaves briefly enlarge on beat drop
    ctx.scale(m.flip * scaleBoost, scaleBoost);
    // soft shadow only on desktop for perf
    if (!isMobile()) {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 8 * m.depth;
      ctx.shadowOffsetY = 4 * m.depth;
    }
    const h = m.size * (img.height / img.width || 1);
    ctx.drawImage(img, -m.size * 0.5, -h * 0.5, m.size, h);
    ctx.restore();
  }
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);

// MUSIC - NOW USES YOUR PLAYLIST ONLY
function shuffleTrack(auto = false) {
  // keep your playlist, don't switch to random tracks
  const url = `https://open.spotify.com/embed/playlist/${PLAYLIST}?utm_source=generator` + (auto ? "&autoplay=1" : "");
  // cache bust to force shuffle reload if needed
  const bust = auto ? `&t=${Date.now()}` : "";
  spotifyFrame.src = url + bust;
  trackMeta.textContent = `your playlist — ${PLAYLIST} • playing`;
  return PLAYLIST;
}
shuffleBtn.addEventListener('click', () => shuffleTrack(true));

// mute — also resume AudioContext if it was suspended before first gesture
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  themeAudio.muted = isMuted;
  muteText.textContent = isMuted ? "unmute" : "mute theme";
  // If user hits mute before drop, kick the AudioContext alive
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
});

// DROP - FIXED: circle MUST originate from button center
function getDropCenter() {
  // use the actual button, not wrapper (wrapper can shift due to leaf-hints)
  const rect = dropBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return { cx, cy };
}

let dropStarted = false;
function doDrop(e) {
  if (revealed || dropStarted) return;
  dropStarted = true;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const { cx, cy } = getDropCenter();

  // ensure aesthetic is at top (scroll 0) before measuring clip
  aestheticRoot.scrollTop = 0;

  // Start audio playback first so the tracks are initialized and active before we capture the stream.
  const playPromise = themeAudio.play();

  const setupAnalyser = () => {
    initAudioAnalyser();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };

  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.then(setupAnalyser).catch((err) => {
      console.warn("themeAudio playback blocked or failed:", err);
      setupAnalyser();
    });
  } else {
    setupAnalyser();
  }

  // 1. RESET to 0 circle EXACTLY at button - no transition
  aestheticRoot.style.transition = 'none';
  aestheticRoot.style.webkitTransition = 'none';
  // force to be visible layer
  aestheticRoot.style.display = 'block';
  aestheticRoot.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
  aestheticRoot.style.webkitClipPath = `circle(0px at ${cx}px ${cy}px)`;
  // double reflow to ensure browser registers start pos
  void aestheticRoot.offsetWidth;
  void aestheticRoot.offsetHeight;

  // 2. Animate to huge circle from SAME point
  requestAnimationFrame(() => {
    aestheticRoot.style.transition = 'clip-path 1.65s cubic-bezier(0.85,0,0.15,1), -webkit-clip-path 1.65s cubic-bezier(0.85,0,0.15,1)';
    aestheticRoot.style.webkitTransition = 'clip-path 1.65s cubic-bezier(0.85,0,0.15,1), -webkit-clip-path 1.65s cubic-bezier(0.85,0,0.15,1)';
    requestAnimationFrame(() => {
      // FIX: 150% is cheaper than 200vmax on Chrome mobile GPU
      aestheticRoot.style.clipPath = `circle(150% at ${cx}px ${cy}px)`;
      aestheticRoot.style.webkitClipPath = `circle(150% at ${cx}px ${cy}px)`;
    });
  });

  // wave ring from button center
  waveRing.style.left = cx + 'px';
  waveRing.style.top = cy + 'px';
  waveRing.style.transition = 'none';
  waveRing.style.webkitTransition = 'none';
  waveRing.style.transform = 'translate(-50%,-50%) scale(0)';
  waveRing.style.opacity = '1';
  void waveRing.offsetWidth;
  requestAnimationFrame(() => {
    waveRing.style.transition = 'transform 1.25s cubic-bezier(.22,1,.36,1), opacity 1.25s';
    waveRing.style.webkitTransition = 'transform 1.25s cubic-bezier(.22,1,.36,1), opacity 1.25s';
    requestAnimationFrame(() => {
      waveRing.style.transform = 'translate(-50%,-50%) scale(2.8)';
      waveRing.style.opacity = '0';
    });
  });

  dropBtn.style.pointerEvents = 'none';

  let ended = false;
  const finishReveal = () => {
    if (ended) return;
    ended = true;
    aestheticRoot.removeEventListener('transitionend', onEnd);
    rawRoot.style.display = 'none';
    aestheticRoot.classList.add('revealed');
    // FIX: clean up will-change and transitions to free GPU memory
    aestheticRoot.style.clipPath = 'none';
    aestheticRoot.style.webkitClipPath = 'none';
    aestheticRoot.style.transition = 'none';
    aestheticRoot.style.webkitTransition = 'none';
    aestheticRoot.style.willChange = 'auto';
    document.body.classList.remove('raw');
    document.body.classList.add('aesthetic');
    // FIX: let CSS class handle body styles, don't set inline to avoid Chrome repaint flash
    document.body.style.position = '';
    document.body.style.inset = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.height = '';
    revealed = true;
  };

  const onEnd = (ev) => {
    if (ev.propertyName !== 'clip-path' && ev.propertyName !== '-webkit-clip-path' && ev.propertyName !== 'clipPath') return;
    finishReveal();
  };
  aestheticRoot.addEventListener('transitionend', onEnd);
  // safety fallback if transitionend doesn't fire (iOS)
  setTimeout(finishReveal, 1800);
}

// FIX: use pointerdown which is more reliable on Chrome mobile, prevent double fire
dropBtn.addEventListener('click', doDrop);
dropBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  doDrop(e);
}, { passive: false });
// Prevent context menu / double-tap zoom flicker
dropBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });

// allow Enter key
addEventListener('keydown', (e) => { if (e.key === 'Enter' && !revealed) doDrop() });

// prevent scroll jank on mobile - ensure aesthetic scrollable after reveal
