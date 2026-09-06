const LINKS = [
  { name: "github", handle: "/ kunal1320k", url: "https://github.com/kunal1320k" },
  { name: "reddit", handle: "/ Juicy-Jam-987", url: "https://www.reddit.com/user/Juicy-Jam-987/" },
  { name: "myanimelist", handle: "/ kunal1320k", url: "https://myanimelist.net/profile/kunal1320k" },
  { name: "telegram", handle: "/ kunal1320k", url: "https://t.me/kunal1320k" },
  { name: "youtube", handle: "/ @kunal1320k", url: "https://www.youtube.com/@kunal1320k" },
  { name: "steam", handle: "/ kunal1320k", url: "https://steamcommunity.com/id/kunal1320k/" },
  { name: "spotify", handle: "/ kunal1320k", url: "https://open.spotify.com/user/kunal1320k" },
];
// ── SPOTIFY & USER CONFIGURATION ──────────────────────────────────────────
const SPOTIFY_CONFIG = {
  // Option 1: Last.fm 24/7 Cloud Tracker (100% Free, Works Everywhere without any apps open!)
  lastfm: {
    username: "kunal1320k",
    apiKey: "8cb15a1d7dae6195b40a2f403fa6447f",
    pollIntervalMs: 3500
  },

  // Option 2: Discord ID for Lanyard real-time WebSocket / REST
  discordId: "1085524274774802515",

  // kunal1320k's Spotify Playlist
  playlist: {
    id: "14d7SJJHjhwEerGgKaUa4J",
    title: "angrexxxxi",
    artist: "kunal1320k • playlist",
    albumArt: "https://mosaic.scdn.co/640/ab67616d00001e028324db1ae37be249aed887e7ab67616d00001e02b1f8da74f225fa1225cdfaceab67616d00001e02c8e97cafeb2acb85b21a777eab67616d00001e02ef694f8a1e178963cf25c2b5",
    url: "https://open.spotify.com/playlist/14d7SJJHjhwEerGgKaUa4J?si=xpg45s19Ty6RTb1aWdBUdQ"
  }
};


const rawRoot = document.getElementById('raw-root');
const aestheticRoot = document.getElementById('aesthetic-root');
const dropBtn = document.getElementById('drop');
const waveRing = document.getElementById('wave-ring');
const treeCanvas = document.getElementById('tree-canvas');
const canvas = document.getElementById('leaves-canvas');
const treeCtx = treeCanvas.getContext('2d', { alpha: true });
const ctx = canvas.getContext('2d', { alpha: true });
const linksGrid = document.getElementById('links-grid');
const themeAudio = document.getElementById('theme-audio');
const muteBtn = document.getElementById('mute-btn');
const muteText = document.getElementById('mute-text');
const shuffleBtn = document.getElementById('shuffle-btn');

// Spotify & Visitor UI elements
const trackArt = document.getElementById('track-art');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const statusMsg = document.getElementById('status-msg');
const statusDot = document.getElementById('status-indicator-dot');
const livePill = document.getElementById('spotify-live-pill');
const liveStatusText = document.getElementById('live-status-text');
const equalizer = document.getElementById('equalizer');
const progressBarFill = document.getElementById('progress-bar-fill');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const spotifyListenLink = document.getElementById('spotify-listen-link');
const ytmusicListenLink = document.getElementById('ytmusic-listen-link');
const youtubeListenLink = document.getElementById('youtube-listen-link');
const youtubeListenText = document.getElementById('youtube-listen-text');
const toggleLyricsBtn = document.getElementById('toggle-lyrics-btn');
const toggleLyricsText = document.getElementById('toggle-lyrics-text');
const toggleEmbedBtn = document.getElementById('toggle-embed-btn');
const toggleEmbedText = document.getElementById('toggle-embed-text');
const mediaPanelContainer = document.getElementById('media-panel-container');
const lyricsView = document.getElementById('lyrics-view');
const embedView = document.getElementById('embed-view');
const lyricsScroll = document.getElementById('lyrics-scroll');
const lyricsStatusBadge = document.getElementById('lyrics-status-badge');
const rawSpotifyText = document.getElementById('raw-spotify-text');

let revealed = false;
let isMuted = false;
let isRevealing = false;

// ── SEEDED RANDOM GENERATOR FOR TREE RESIZING ──────────────────────────────
let randomSource = Math.random;
const treeSeed = Math.random() * 0xffffffff;

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// render links
LINKS.forEach(l => {
  const a = document.createElement('a');
  a.href = l.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.className = "link-row";
  a.dataset.key = l.name;
  a.innerHTML = `<span class="name">${l.name}</span><span class="handle">${l.handle}</span><span class="arrow">↗</span>`;
  linksGrid.appendChild(a);
});

// LEAVES - ADAPTIVE RENDERING, SMOOTH MOTION
const leafImgs = [];
const leafSrcs = ["data:image/webp;base64,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", "data:image/webp;base64,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", "data:image/webp;base64,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"];
let imagesLoaded = 0;
leafSrcs.forEach((src, i) => {
  const im = new Image();
  im.src = src;
  im.decoding = "async";
  im.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === leafSrcs.length) {
      buildFoliageBuffer();
      if (treeStarted) drawTree(treeProgress, true);
    }
  };
  leafImgs[i] = im;
});

// Canvas work is deliberately paused until the autumn scene is visible.
// The tree is resolution-aware, so its root stays anchored to the viewport's
// lower-right corner while its canopy reaches toward the upper-left.
let W = 0, H = 0, DPR = 1;
let leaves = [];
let treeBranches = [];
let treeLeafSites = [];
let foliageBuffer = null;
let treeFoliageRadius = 0;
let treeProgress = 0;
let treeDuration = 0;
let treeStarted = false;
let treeStartTime = 0;
let treeLastDrawn = -1;
let lastW = innerWidth;
let resizeTimeout;
let rafId = 0;
let sceneRunning = false;
let lastT = 0;
let lastLeafRender = 0;
let lastTreeRender = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isMobile() {
  return W < 768;
}

function getViewportHeight() {
  return window.visualViewport ? window.visualViewport.height : innerHeight;
}

function resizeCanvas() {
  const newW = innerWidth;
  let newH = innerHeight;
  if (newW < 768) {
    if (window.screen && window.screen.height && window.screen.width) {
      newH = innerHeight > innerWidth
        ? Math.max(window.screen.width, window.screen.height)
        : Math.min(window.screen.width, window.screen.height);
    } else {
      newH = Math.max(innerHeight, document.documentElement.clientHeight, getViewportHeight());
    }
  }
  const newDPR = newW < 768 ? 1 : Math.min(devicePixelRatio || 1, 2);

  if (W === newW && H === newH && DPR === newDPR) return false;

  W = newW;
  H = newH;
  DPR = newDPR;

  [canvas, treeCanvas].forEach((surface) => {
    surface.width = Math.round(W * DPR);
    surface.height = Math.round(H * DPR);
    surface.style.width = W + 'px';
    surface.style.height = H + 'px';
  });
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  treeCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // FIX: don't rebuild tree while clip-path is animating - this was causing the 1-frame full-leaf flash
  if (isRevealing) {
    return true;
  }
  buildTree();
  drawTree(treeProgress, true);
  return true;
}

function randomBetween(min, max) {
  return min + randomSource() * (max - min);
}

function jitterPoint(x, y, xAmount, yAmount) {
  return {
    x: x + randomBetween(-xAmount, xAmount),
    y: y + randomBetween(-yAmount, yAmount)
  };
}

function pointOnBranch(branch, progress) {
  const t = clamp(progress, 0, 1);
  const inverse = 1 - t;
  return {
    x: inverse * inverse * branch.start.x + 2 * inverse * t * branch.control.x + t * t * branch.end.x,
    y: inverse * inverse * branch.start.y + 2 * inverse * t * branch.control.y + t * t * branch.end.y
  };
}

function addBranchPath(context, branch, progress) {
  const amount = clamp(progress, 0, 1);
  const steps = Math.max(2, Math.ceil(18 * amount));
  const first = pointOnBranch(branch, 0);
  context.moveTo(first.x, first.y);
  for (let i = 1; i <= steps; i++) {
    const point = pointOnBranch(branch, amount * i / steps);
    context.lineTo(point.x, point.y);
  }
}

function createBranch(start, end, width, revealStart, revealEnd) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const curve = randomBetween(-0.16, 0.16) * length;
  const branch = {
    start,
    end,
    width,
    revealStart,
    revealEnd,
    control: {
      x: (start.x + end.x) / 2 - dy / length * curve,
      y: (start.y + end.y) / 2 + dx / length * curve
    }
  };
  treeBranches.push(branch);
  return branch;
}

function branchProgress(branch, sceneProgress) {
  return clamp(
    (sceneProgress - branch.revealStart) / (branch.revealEnd - branch.revealStart),
    0,
    1
  );
}

function buildTree() {
  randomSource = mulberry32(treeSeed);
  treeBranches = [];
  treeLeafSites = [];
  foliageBuffer = null;

  const minSide = Math.min(W, H);
  const xJitter = W * 0.022;
  const yJitter = H * 0.026;
  const point = (x, y) => jitterPoint(x, y, xJitter, yJitter);
  const trunkWidth = clamp(minSide * 0.075, 28, 68);
  treeFoliageRadius = clamp(minSide * 0.085, 27, 72);

  const root = { x: W * 1.055, y: H + 32 };
  const trunkOne = point(W * 0.87, H * 0.82);
  const trunkTwo = point(W * 0.70, H * 0.64);
  const trunkThree = point(W * 0.58, H * 0.45);
  const trunkFour = point(W * 0.47, H * 0.25);
  const trunkTip = point(W * 0.34, H * 0.055);

  const trunk = [
    createBranch(root, trunkOne, trunkWidth, 0.00, 0.16),
    createBranch(trunkOne, trunkTwo, trunkWidth * 0.78, 0.13, 0.32),
    createBranch(trunkTwo, trunkThree, trunkWidth * 0.59, 0.30, 0.51),
    createBranch(trunkThree, trunkFour, trunkWidth * 0.43, 0.49, 0.70),
    createBranch(trunkFour, trunkTip, trunkWidth * 0.27, 0.68, 0.90)
  ];

  const majorBranches = [
    createBranch(trunkOne, point(W * 0.49, H * 0.74), trunkWidth * 0.38, 0.16, 0.42),
    createBranch(trunkTwo, point(W * 0.34, H * 0.49), trunkWidth * 0.31, 0.32, 0.60),
    createBranch(trunkTwo, point(W * 0.83, H * 0.35), trunkWidth * 0.30, 0.33, 0.60),
    createBranch(trunkThree, point(W * 0.24, H * 0.24), trunkWidth * 0.25, 0.51, 0.78),
    createBranch(trunkThree, point(W * 0.72, H * 0.15), trunkWidth * 0.24, 0.52, 0.78),
    createBranch(trunkFour, point(W * 0.17, H * 0.075), trunkWidth * 0.18, 0.70, 0.96),
    createBranch(trunkFour, point(W * 0.60, H * 0.05), trunkWidth * 0.17, 0.70, 0.96)
  ];

  const sprout = (source, sourceProgress, angleOffset, lengthScale, widthScale) => {
    const start = pointOnBranch(source, sourceProgress);
    const direction = Math.atan2(source.end.y - source.start.y, source.end.x - source.start.x) + angleOffset;
    const length = minSide * lengthScale;
    const end = {
      x: clamp(start.x + Math.cos(direction) * length, W * 0.04, W * 0.96),
      y: clamp(start.y + Math.sin(direction) * length, H * 0.025, H * 0.92)
    };
    const revealStart = clamp(
      source.revealStart + (source.revealEnd - source.revealStart) * sourceProgress,
      0.08,
      0.92
    );
    return createBranch(
      start,
      end,
      Math.max(2.5, source.width * widthScale),
      revealStart,
      clamp(revealStart + randomBetween(0.13, 0.24), revealStart + 0.08, 0.99)
    );
  };

  const twigs = [];
  const twigSources = majorBranches.concat(trunk.slice(2));
  twigSources.forEach((source, index) => {
    const amount = index % 3 === 0 ? 2 : 1;
    for (let i = 0; i < amount; i++) {
      twigs.push(sprout(
        source,
        randomBetween(0.52, 0.88),
        randomBetween(-0.82, 0.82),
        randomBetween(0.075, 0.16),
        randomBetween(0.40, 0.58)
      ));
    }
  });

  const fineTwigs = [];
  twigs.forEach((source, index) => {
    if (index % 2 === 0) {
      fineTwigs.push(sprout(
        source,
        randomBetween(0.56, 0.92),
        randomBetween(-0.68, 0.68),
        randomBetween(0.045, 0.10),
        randomBetween(0.42, 0.56)
      ));
    }
  });

  const foliageBranches = majorBranches.concat(twigs, fineTwigs, trunk.slice(2));
  const leafCount = isMobile() ? 520 : 900;
  const sizeBase = clamp(minSide * (isMobile() ? 0.019 : 0.017), 6, 16);
  for (let i = 0; i < leafCount; i++) {
    const branch = foliageBranches[Math.floor(randomSource() * foliageBranches.length)];
    const branchPosition = randomBetween(0.28, 0.98);
    const anchor = pointOnBranch(branch, branchPosition);
    const angle = randomBetween(0, Math.PI * 2);
    const distance = treeFoliageRadius * (0.12 + Math.pow(randomSource(), 0.62) * 0.82);
    treeLeafSites.push({
      x: anchor.x + Math.cos(angle) * distance,
      y: anchor.y + Math.sin(angle) * distance * 0.62,
      size: sizeBase * randomBetween(0.46, 1.62),
      rot: randomBetween(-Math.PI, Math.PI),
      flip: randomSource() > 0.5 ? 1 : -1,
      imgIdx: Math.floor(randomSource() * leafImgs.length),
      opacity: randomBetween(0.46, 0.88),
      reveal: clamp(
        branch.revealStart + (branch.revealEnd - branch.revealStart) * branchPosition + randomBetween(0.01, 0.07),
        0,
        1
      )
    });
  }

  treeDuration = clamp(Math.round(Math.hypot(W, H) * 27), 18000, 34000);
  treeLastDrawn = -1;
  if (imagesLoaded === leafSrcs.length) buildFoliageBuffer();
  randomSource = Math.random;
}

function buildFoliageBuffer() {
  if (!treeLeafSites.length || imagesLoaded !== leafSrcs.length) return;

  const bufferScale = isMobile() ? 1 : Math.min(DPR, 1.5);
  const surface = document.createElement('canvas');
  surface.width = Math.round(W * bufferScale);
  surface.height = Math.round(H * bufferScale);
  const bufferCtx = surface.getContext('2d', { alpha: true });
  bufferCtx.setTransform(bufferScale, 0, 0, bufferScale, 0, 0);

  for (let i = 0; i < treeLeafSites.length; i++) {
    const leaf = treeLeafSites[i];
    const image = leafImgs[leaf.imgIdx];
    if (!image || !image.complete) continue;
    const h = leaf.size * (image.height / image.width || 1);
    bufferCtx.save();
    bufferCtx.globalAlpha = leaf.opacity;
    bufferCtx.translate(leaf.x, leaf.y);
    bufferCtx.rotate(leaf.rot);
    bufferCtx.scale(leaf.flip, 1);
    bufferCtx.drawImage(image, -leaf.size / 2, -h / 2, leaf.size, h);
    bufferCtx.restore();
  }

  foliageBuffer = surface;
}

function drawFoliageMask(progress) {
  let drew = false;
  treeCtx.beginPath();
  for (let i = 0; i < treeBranches.length; i++) {
    const branch = treeBranches[i];
    const local = branchProgress(branch, progress);
    if (local > 0.001) {
      addBranchPath(treeCtx, branch, local);
      drew = true;
    }
  }
  if (!drew) return false;
  treeCtx.globalAlpha = 1;
  treeCtx.lineCap = 'round';
  treeCtx.lineJoin = 'round';
  treeCtx.lineWidth = treeFoliageRadius * 2;
  treeCtx.strokeStyle = '#000';
  treeCtx.stroke();
  return true;
}

function drawOrganicBranch(branch, progress) {
  const local = branchProgress(branch, progress);
  if (!local) return;

  treeCtx.beginPath();
  addBranchPath(treeCtx, branch, local);
  treeCtx.lineCap = 'round';
  treeCtx.lineJoin = 'round';
  treeCtx.globalAlpha = 0.96;
  treeCtx.strokeStyle = '#633a25';
  treeCtx.lineWidth = branch.width;
  treeCtx.stroke();

  treeCtx.beginPath();
  addBranchPath(treeCtx, branch, local);
  treeCtx.globalAlpha = 0.35;
  treeCtx.strokeStyle = '#bd7950';
  treeCtx.lineWidth = Math.max(1.25, branch.width * 0.18);
  treeCtx.stroke();
}

function drawTree(progress, force) {
  if (!force && Math.abs(progress - treeLastDrawn) < 0.001) return;
  treeCtx.clearRect(0, 0, W, H);
  if (!treeBranches.length) return;

  // FIX: prevent full-foliage flash at progress ~0
  // The old code did destination-in with empty mask, which left full foliage visible for 1 frame
  if (foliageBuffer && progress > 0.02) {
    treeCtx.save();
    treeCtx.globalAlpha = 1;
    treeCtx.globalCompositeOperation = 'source-over';
    treeCtx.drawImage(foliageBuffer, 0, 0, W, H);
    treeCtx.globalCompositeOperation = 'destination-in';
    const hasMask = drawFoliageMask(progress);
    if (!hasMask) {
      treeCtx.clearRect(0, 0, W, H);
    }
    treeCtx.restore();
  }

  for (let i = 0; i < treeBranches.length; i++) {
    drawOrganicBranch(treeBranches[i], progress);
  }

  treeCtx.globalAlpha = 1;
  treeLastDrawn = progress;
}

function resetLeaf(leaf, initial) {
  let source = null;
  if (!initial && treeProgress > 0.22 && treeLeafSites.length && Math.random() < 0.56) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = treeLeafSites[Math.floor(Math.random() * treeLeafSites.length)];
      if (candidate.reveal <= treeProgress) {
        source = candidate;
        break;
      }
    }
  }

  if (source) {
    leaf.x = source.x + (Math.random() - 0.5) * 22;
    leaf.y = source.y + (Math.random() - 0.5) * 12;
  } else {
    leaf.x = Math.random() * W;
    leaf.y = initial ? Math.random() * H - H : -90 - Math.random() * 200;
  }
  leaf.vx = (Math.random() - 0.5) * 0.7;
}

function initLeaves() {
  const count = isMobile() ? 22 : 38;
  leaves = [];
  for (let i = 0; i < count; i++) {
    const leaf = {
      x: 0,
      y: 0,
      size: (isMobile() ? 14 : 19) + Math.random() * (isMobile() ? 20 : 30),
      vx: 0,
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
    };
    resetLeaf(leaf, true);
    leaves.push(leaf);
  }
}

function drawLeaves(dt, t) {
  const wind = Math.sin(t * 0.00032) * 1.1 + Math.sin(t * 0.00078) * 0.55 + Math.cos(t * 0.00019) * 0.35;

  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    leaf.wobble += leaf.wobbleSpeed * dt;
    leaf.vx += (wind * 0.0065 + Math.sin(leaf.wobble) * 0.007) * dt;
    leaf.vx *= Math.pow(0.9965, dt);
    leaf.x += (leaf.vx + Math.cos(leaf.wobble) * leaf.wobbleAmp * 0.46 + wind * 0.38) * dt;
    leaf.y += leaf.vy * (0.7 + leaf.depth * 0.6) * dt;
    leaf.rot += (leaf.rotSpeed + Math.sin(leaf.wobble * 0.6) * 0.006) * dt;

    if (leaf.y > H + 90) resetLeaf(leaf, false);
    if (leaf.x < -120) leaf.x = W + 80;
    if (leaf.x > W + 120) leaf.x = -80;

    const image = leafImgs[leaf.imgIdx];
    if (!image || !image.complete) continue;
    ctx.save();
    ctx.globalAlpha = Math.min(leaf.opacity * leaf.depth, 1);
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rot);
    ctx.scale(leaf.flip, 1);
    if (!isMobile()) {
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 8 * leaf.depth;
      ctx.shadowOffsetY = 4 * leaf.depth;
    }
    const h = leaf.size * (image.height / image.width || 1);
    ctx.drawImage(image, -leaf.size * 0.5, -h * 0.5, leaf.size, h);
    ctx.restore();
  }
}

function frame(t) {
  if (!sceneRunning) return;

  // Keep the original 60 fps feel, while avoiding duplicate paints on 90/120 Hz phones.
  const leafInterval = 1000 / 60;
  if (!lastLeafRender || t - lastLeafRender >= leafInterval) {
    const dt = Math.min((t - lastT) / 16.666, 3);
    lastT = t;
    lastLeafRender = t;
    drawLeaves(dt, t);
  }

  if (treeStarted && treeProgress < 1 && (!lastTreeRender || t - lastTreeRender >= 1000 / 30)) {
    treeProgress = clamp((t - treeStartTime) / treeDuration, 0, 1);
    lastTreeRender = t;
    drawTree(treeProgress, false);
  }
  rafId = requestAnimationFrame(frame);
}

function startScene() {
  if (sceneRunning || document.hidden) return;
  sceneRunning = true;
  lastT = performance.now();
  lastLeafRender = 0;
  lastTreeRender = 0;
  rafId = requestAnimationFrame(frame);
}

function stopScene() {
  sceneRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

function startTree() {
  if (!treeStarted) {
    treeStarted = true;
    treeStartTime = performance.now();
    treeProgress = 0;
    drawTree(treeProgress, true);
  }
  startScene();
}

function scheduleCanvasResize() {
  if (isRevealing) return; // FIX: don't rebuild during wipe
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (isRevealing) return;
    const widthChanged = innerWidth !== lastW;
    const didResize = resizeCanvas();
    if (didResize && widthChanged) {
      lastW = innerWidth;
      initLeaves();
    }
  }, 140);
}

resizeCanvas();
initLeaves();
addEventListener('resize', scheduleCanvasResize, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', scheduleCanvasResize, { passive: true });
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopScene();
  } else if (revealed) {
    startScene();
  }
});
addEventListener('pagehide', stopScene, { passive: true });

// ── SPOTIFY REAL-TIME TRACKING & VISITOR COUNTER ───────────────────────────

function formatMs(ms) {
  if (!ms || isNaN(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function trackSearchQuery(state = currentPlaybackState) {
  const title = (state.title || "").replace(/\s*\((?:feat\.|with|from).*?\)/gi, "").trim();
  const artist = (state.artist || "").split(/[\u2022;,\-|]/)[0].trim();
  return `${title} ${artist}`.trim();
}

function spotifyTrackUrl(state) {
  if (state.songUrl && /open\.spotify\.com\/track/i.test(state.songUrl)) return state.songUrl;
  return `https://open.spotify.com/search/${encodeURIComponent(trackSearchQuery(state))}`;
}

function liveElapsedSeconds() {
  if (!currentPlaybackState.isPlaying) return 0;
  return Math.max(0, Math.floor(getLiveProgress() / 1000));
}

function updateYouTubeLaunchUrl() {
  if (!youtubeListenLink || !currentPlaybackState.isPlaying) return;
  const query = `${trackSearchQuery()} official video`;
  youtubeListenLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&t=${liveElapsedSeconds()}s`;
}

let currentPlaybackState = {
  isPlaying: false,
  title: SPOTIFY_CONFIG.playlist.title,
  artist: SPOTIFY_CONFIG.playlist.artist,
  albumArt: SPOTIFY_CONFIG.playlist.albumArt,
  songUrl: SPOTIFY_CONFIG.playlist.url,
  progressMs: 0,
  durationMs: 0,
  updatedAt: Date.now(),
  timingSource: "none"
};

function playbackKey(state) {
  const title = (state.title || "").trim().toLowerCase();
  const artist = (state.artist || "").split(/[\u2022;,\-|]/)[0].trim().toLowerCase();
  return `${title}::${artist}`;
}

function getLiveProgress(state = currentPlaybackState) {
  const base = Math.max(0, Number(state.progressMs) || 0);
  const elapsed = Math.max(0, Date.now() - (Number(state.updatedAt) || Date.now()));
  const progress = base + elapsed;
  return state.durationMs > 0 ? Math.min(progress, state.durationMs) : progress;
}

function preservePreciseTiming(nextState) {
  const sameTrack = currentPlaybackState.isPlaying && playbackKey(currentPlaybackState) === playbackKey(nextState);
  const hasPreciseClock = currentPlaybackState.timingSource === "lanyard" || currentPlaybackState.timingSource === "api";

  // Last.fm establishes that a track is active, but does not expose its start
  // timestamp. Keep Lanyard/API timing when both services refer to this song.
  if (sameTrack && nextState.timingSource === "lastfm" && hasPreciseClock) {
    return {
      ...nextState,
      progressMs: getLiveProgress(currentPlaybackState),
      durationMs: currentPlaybackState.durationMs || nextState.durationMs,
      updatedAt: Date.now(),
      timingSource: currentPlaybackState.timingSource
    };
  }
  return nextState;
}

function renderSpotifyUI(state) {
  const isLive = state.isPlaying;
  const ytmusicListenLink = document.getElementById('ytmusic-listen-link');
  const spotifyHeading = document.getElementById('spotify-heading');

  if (isLive) {
    if (trackTitle) {
      trackTitle.textContent = state.title || "Playing Live";
      if (state.songUrl) trackTitle.href = state.songUrl;
    }
    if (trackArtist) trackArtist.textContent = state.artist || "Music";
    if (trackArt) {
      const isPlaceholder = !state.albumArt || state.albumArt.includes("2a96cbd8b46e442fc41c2b86b821562f") || state.albumArt.includes("default_album");
      if (!isPlaceholder) {
        trackArt.src = state.albumArt;
      } else {
        const expectedTrack = playbackKey(state);
        fetchArtworkAndDuration(state.title, state.artist).then(meta => {
          if (playbackKey(currentPlaybackState) !== expectedTrack) return;
          if (meta.artwork && trackArt) {
            trackArt.src = meta.artwork;
            currentPlaybackState.albumArt = meta.artwork;
          }
          if (meta.durationMs) {
            currentPlaybackState.durationMs = meta.durationMs;
            updateProgressBar();
          }
        });
      }
    }

    if (spotifyListenLink) {
      spotifyListenLink.href = spotifyTrackUrl(state);
      const listenText = document.getElementById('spotify-listen-text');
      if (listenText) listenText.textContent = "spotify";
    }

    if (ytmusicListenLink) {
      ytmusicListenLink.href = `https://music.youtube.com/search?q=${encodeURIComponent(trackSearchQuery(state))}`;
      ytmusicListenLink.style.display = "inline-flex";
    }

    if (youtubeListenLink) {
      updateYouTubeLaunchUrl();
      youtubeListenLink.style.display = "inline-flex";
    }

    if (livePill) {
      livePill.className = "live-pill";
      if (liveStatusText) liveStatusText.textContent = "live";
    }

    // Dynamic Platform Differentiation (Spotify vs YouTube Music vs General Music)
    const platform = state.source || (state.songUrl && state.songUrl.includes("spotify.com/track") ? "spotify" : "music");
    if (statusMsg) {
      if (platform === "spotify") {
        statusMsg.textContent = "Listening on Spotify";
      } else if (platform === "ytmusic") {
        statusMsg.textContent = "Listening on YouTube Music";
      } else {
        statusMsg.textContent = "Now Playing • Live Music";
      }
    }

    if (spotifyHeading) {
      if (platform === "spotify") {
        spotifyHeading.textContent = "now playing — spotify";
      } else if (platform === "ytmusic") {
        spotifyHeading.textContent = "now playing — youtube music";
      } else {
        spotifyHeading.textContent = "now playing — live music";
      }
    }

    if (statusDot && statusDot.parentElement) {
      statusDot.parentElement.className = `track-status-line ${platform}`;
    }
    if (equalizer) equalizer.classList.add("active");
    if (rawSpotifyText) rawSpotifyText.textContent = `${state.title} — ${state.artist}`;

    // Fetch live lyrics for currently playing track
    if (state.title) {
      fetchSyncedLyrics(state.title, state.artist, state.durationMs);
    }
  } else {
    // NOT PLAYING LIVE - SHOW YOUR PLAYLIST
    if (trackTitle) {
      trackTitle.textContent = SPOTIFY_CONFIG.playlist.title;
      trackTitle.href = SPOTIFY_CONFIG.playlist.url;
    }
    if (trackArtist) trackArtist.textContent = SPOTIFY_CONFIG.playlist.artist;
    if (trackArt) trackArt.src = SPOTIFY_CONFIG.playlist.albumArt;
    if (spotifyListenLink) {
      spotifyListenLink.href = SPOTIFY_CONFIG.playlist.url;
      const listenText = document.getElementById('spotify-listen-text');
      if (listenText) listenText.textContent = "open playlist";
    }
    if (ytmusicListenLink) {
      ytmusicListenLink.style.display = "none";
    }
    if (youtubeListenLink) {
      youtubeListenLink.style.display = "none";
    }

    if (spotifyHeading) spotifyHeading.textContent = "now playing — spotify";
    if (livePill) {
      livePill.className = "live-pill offline";
      if (liveStatusText) liveStatusText.textContent = "offline";
    }
    if (statusMsg) statusMsg.textContent = "Offline • Playlist";
    if (statusDot && statusDot.parentElement) statusDot.parentElement.className = "track-status-line offline";
    if (equalizer) equalizer.classList.remove("active");
    if (rawSpotifyText) rawSpotifyText.textContent = "[ playing nothing ]";

    if (lyricsScroll) {
      lyricsScroll.innerHTML = '<p class="lyric-line-placeholder">no track playing right now — start listening on spotify or yt music</p>';
    }
    if (lyricsStatusBadge) lyricsStatusBadge.textContent = "offline";
  }

  updateProgressBar();
}

function updateProgressBar() {
  if (!currentPlaybackState.isPlaying) {
    if (progressBarFill) progressBarFill.style.width = "0%";
    if (timeCurrent) timeCurrent.textContent = "0:00";
    if (timeTotal) timeTotal.textContent = "--:--";
    return;
  }

  const progress = getLiveProgress();

  if (!currentPlaybackState.durationMs || currentPlaybackState.durationMs <= 0) {
    if (progressBarFill) progressBarFill.style.width = "0%";
    if (timeCurrent) timeCurrent.textContent = formatMs(progress);
    if (timeTotal) timeTotal.textContent = "--:--";
    syncActiveLyric(progress);
    return;
  }

  const percent = Math.min(Math.max((progress / currentPlaybackState.durationMs) * 100, 0), 100);
  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (timeCurrent) timeCurrent.textContent = formatMs(progress);
  if (timeTotal) timeTotal.textContent = formatMs(currentPlaybackState.durationMs);

  // Sync active lyric line in real-time
  syncActiveLyric(progress);
}

// ── LIVE SYNCED LYRICS ENGINE (LRCLIB) ────────────────────────────────────
let currentLyrics = [];
let currentLyricsTrackKey = "";
let currentActiveLyricIndex = -1;
let currentLyricsRequestId = 0;

function parseLRC(lrc) {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const timeMs = (minutes * 60 + seconds) * 1000 + millis;
      const text = match[4].trim();
      if (text) {
        result.push({ timeMs, text });
      }
    }
  }
  return result.sort((a, b) => a.timeMs - b.timeMs);
}

async function fetchSyncedLyrics(title, artist, durationMs) {
  if (!title) return;
  const trackKey = `${title}_${artist}`.toLowerCase();
  
  // If we already have loaded lyrics for this track, re-sync immediately
  if (currentLyricsTrackKey === trackKey && currentLyrics.length > 0) {
    syncActiveLyric(getLiveProgress());
    return;
  }

  const requestId = ++currentLyricsRequestId;
  currentLyricsTrackKey = trackKey;
  currentLyrics = [];
  currentActiveLyricIndex = -1;

  if (lyricsScroll) {
    lyricsScroll.innerHTML = '<p class="lyric-line-placeholder">searching for live lyrics...</p>';
  }
  if (lyricsStatusBadge) lyricsStatusBadge.textContent = "fetching";

  const cleanTitle = title
    .replace(/\s*\(with.*?\)/gi, '')
    .replace(/\s*\[with.*?\]/gi, '')
    .replace(/\s*\(feat\..*?\)/gi, '')
    .replace(/\s*\[feat\..*?\]/gi, '')
    .replace(/\s*\(from.*?\)/gi, '')
    .replace(/\s*\[from.*?\]/gi, '')
    .replace(/\s*-\s*from\s+.*$/gi, '')
    .replace(/\s*\(movie.*?\)/gi, '')
    .replace(/\s*-\s*.*version.*/gi, '')
    .replace(/\s*-\s*.*remaster.*/gi, '')
    .replace(/\s*\(original.*?\)/gi, '')
    .trim();
  
  // Extract primary artist
  const cleanArtist = artist ? artist.split(/[\u2022;,\-\|]/)[0].trim() : "";

  try {
    let data = null;

    // 1. Try exact match get
    if (cleanArtist) {
      try {
        let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
        if (durationMs) url += `&duration=${Math.round(durationMs / 1000)}`;
        const res = await fetch(url);
        if (res.ok) data = await res.json();
      } catch (e) {}
    }

    // 2. Try search with clean title + clean artist
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      try {
        const query = cleanArtist ? `${cleanTitle} ${cleanArtist}` : cleanTitle;
        const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (searchRes.ok) {
          const list = await searchRes.json();
          if (list && list.length > 0) {
            data = list.find(item => item.syncedLyrics) || list[0];
          }
        }
      } catch (e) {}
    }

    // 3. Try search with full raw title + artist
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      try {
        const query = `${title} ${artist}`;
        const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (searchRes.ok) {
          const list = await searchRes.json();
          if (list && list.length > 0) {
            data = list.find(item => item.syncedLyrics) || list[0];
          }
        }
      } catch (e) {}
    }

    // 4. Try search with title only
    if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
      try {
        const titleSearchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`);
        if (titleSearchRes.ok) {
          const list = await titleSearchRes.json();
          if (list && list.length > 0) {
            data = list.find(item => item.syncedLyrics) || list[0];
          }
        }
      } catch (e) {}
    }

    // Guard against stale asynchronous responses when songs change
    if (requestId !== currentLyricsRequestId) return;

    if (data && data.duration && (!currentPlaybackState.durationMs || currentPlaybackState.durationMs === 210000)) {
      currentPlaybackState.durationMs = data.duration * 1000;
      if (timeTotal) timeTotal.textContent = formatMs(currentPlaybackState.durationMs);
    }

    if (data && data.syncedLyrics) {
      currentLyrics = parseLRC(data.syncedLyrics);
      renderLyricsLines(currentLyrics);
      if (lyricsStatusBadge) lyricsStatusBadge.textContent = "synced";
      
      syncActiveLyric(getLiveProgress());
    } else if (data && data.plainLyrics) {
      currentLyrics = data.plainLyrics.split('\n').filter(t => t.trim()).map(t => ({ timeMs: 0, text: t.trim() }));
      renderLyricsLines(currentLyrics);
      if (lyricsStatusBadge) lyricsStatusBadge.textContent = "plain text";
    } else {
      if (lyricsScroll) {
        lyricsScroll.innerHTML = '<p class="lyric-line-placeholder">no lyrics found for this track</p>';
      }
      if (lyricsStatusBadge) lyricsStatusBadge.textContent = "no lyrics";
    }
  } catch (err) {
    if (requestId !== currentLyricsRequestId) return;
    if (lyricsScroll) {
      lyricsScroll.innerHTML = '<p class="lyric-line-placeholder">lyrics temporarily unavailable</p>';
    }
    if (lyricsStatusBadge) lyricsStatusBadge.textContent = "no lyrics";
  }
}

function renderLyricsLines(lyrics) {
  if (!lyricsScroll) return;
  lyricsScroll.innerHTML = "";
  if (lyrics.length === 0) {
    lyricsScroll.innerHTML = '<p class="lyric-line-placeholder">no lyrics available</p>';
    return;
  }

  lyrics.forEach((line, idx) => {
    const p = document.createElement('p');
    p.className = 'lyric-line';
    p.dataset.index = idx;
    p.dataset.time = line.timeMs;
    p.textContent = line.text;
    p.addEventListener('click', () => {
      highlightLyricIndex(idx);
    });
    lyricsScroll.appendChild(p);
  });
}

function highlightLyricIndex(idx) {
  currentActiveLyricIndex = idx;
  const lines = lyricsScroll.querySelectorAll('.lyric-line');
  lines.forEach((l, i) => {
    if (i === idx) {
      l.className = 'lyric-line active';
      // Calculate exact offset of the line inside lyricsScroll to keep it vertically centered
      const scrollBoxRect = lyricsScroll.getBoundingClientRect();
      const lineRect = l.getBoundingClientRect();
      const relativeTop = lineRect.top - scrollBoxRect.top + lyricsScroll.scrollTop;
      const targetScrollTop = relativeTop - (lyricsScroll.clientHeight / 2) + (lineRect.height / 2);
      lyricsScroll.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } else if (i < idx) {
      l.className = 'lyric-line past';
    } else {
      l.className = 'lyric-line';
    }
  });

}

function syncActiveLyric(progressMs) {
  if (!currentLyrics || currentLyrics.length === 0 || !lyricsScroll) return;

  let activeIdx = -1;
  for (let i = 0; i < currentLyrics.length; i++) {
    if (currentLyrics[i].timeMs <= progressMs) {
      activeIdx = i;
    } else {
      break;
    }
  }

  if (activeIdx !== currentActiveLyricIndex) {
    if (activeIdx === -1) {
      currentActiveLyricIndex = -1;
      const lines = lyricsScroll.querySelectorAll('.lyric-line');
      lines.forEach(l => l.className = 'lyric-line');
      lyricsScroll.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      highlightLyricIndex(activeIdx);
    }
  }
}

// Update progress bar every second when live
setInterval(() => {
  if (currentPlaybackState.isPlaying) {
    updateProgressBar();
    updateYouTubeLaunchUrl();
  }
}, 1000);

if (youtubeListenLink) {
  // The timestamp is refreshed at the instant the visitor launches the video.
  youtubeListenLink.addEventListener('click', updateYouTubeLaunchUrl);
}

let lanyardSocket = null;
let heartbeatTimer = null;

function connectLanyard() {
  if (!SPOTIFY_CONFIG.discordId || SPOTIFY_CONFIG.discordId === "YOUR_DISCORD_USER_ID") {
    renderSpotifyUI(currentPlaybackState);
    return;
  }

  try {
    lanyardSocket = new WebSocket("wss://api.lanyard.rest/socket");

    lanyardSocket.onopen = () => {
      lanyardSocket.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: SPOTIFY_CONFIG.discordId }
      }));
    };

    lanyardSocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { op, t, d } = payload;

        if (op === 1) {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(() => {
            if (lanyardSocket && lanyardSocket.readyState === WebSocket.OPEN) {
              lanyardSocket.send(JSON.stringify({ op: 3 }));
            }
          }, d.heartbeat_interval);
        }

        if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
          handleLanyardData(d);
        }
      } catch (err) {
        console.warn("Lanyard message error:", err);
      }
    };

    lanyardSocket.onerror = () => {
      fetchLanyardRest();
    };

    lanyardSocket.onclose = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      setTimeout(connectLanyard, 5000);
    };
  } catch (e) {
    fetchLanyardRest();
  }
}

function handleLanyardData(data) {
  if (data && data.listening_to_spotify && data.spotify) {
    lanyardSocketActive = true;
    const s = data.spotify;
    const duration = s.timestamps ? (s.timestamps.end - s.timestamps.start) : 0;
    const progress = s.timestamps ? Math.max(0, Date.now() - s.timestamps.start) : 0;

    currentPlaybackState = {
      isPlaying: true,
      title: s.song,
      artist: `${s.artist} • ${s.album || "Spotify"}`,
      albumArt: s.album_art_url || SPOTIFY_CONFIG.playlist.albumArt,
      songUrl: s.track_id ? `https://open.spotify.com/track/${s.track_id}` : `https://open.spotify.com/search/${encodeURIComponent(s.song + ' ' + s.artist)}`,
      progressMs: progress,
      durationMs: duration,
      source: "spotify",
      updatedAt: Date.now(),
      timingSource: "lanyard"
    };
    renderSpotifyUI(currentPlaybackState);
  } else {
    lanyardSocketActive = false;
    // If Last.fm is currently active or was active recently, do NOT override with offline
    if (lastFmNowPlayingActive || (Date.now() - lastFmLastSeenPlaying < 25000)) {
      return;
    }

    currentPlaybackState = {
      isPlaying: false,
      title: SPOTIFY_CONFIG.playlist.title,
      artist: SPOTIFY_CONFIG.playlist.artist,
      albumArt: SPOTIFY_CONFIG.playlist.albumArt,
      songUrl: SPOTIFY_CONFIG.playlist.url,
      progressMs: 0,
      durationMs: 0,
      updatedAt: Date.now()
    };
    renderSpotifyUI(currentPlaybackState);
  }
}

async function fetchLanyardRest() {
  if (!SPOTIFY_CONFIG.discordId) return;
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${SPOTIFY_CONFIG.discordId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        handleLanyardData(json.data);
      }
    }
  } catch (err) {
    console.warn("Lanyard REST error:", err);
  }
}


// ── SWITCHABLE MEDIA ACCORDION PANEL (Lyrics / Playlist Embed) ────
let currentActiveMediaView = ""; // "lyrics" | "playlist" | ""

function switchMediaView(viewName) {
  if (!mediaPanelContainer) return;

  // If clicking the active view, collapse the panel
  if (currentActiveMediaView === viewName && !mediaPanelContainer.classList.contains('collapsed')) {
    mediaPanelContainer.classList.add('collapsed');
    currentActiveMediaView = "";
    updateMediaButtonStates();
    return;
  }

  // Activate the selected view
  currentActiveMediaView = viewName;
  mediaPanelContainer.classList.remove('collapsed');

  // Hide all views first
  if (lyricsView) lyricsView.classList.add('hidden');
  if (embedView) embedView.classList.add('hidden');

  if (viewName === "lyrics") {
    if (lyricsView) lyricsView.classList.remove('hidden');
  } else if (viewName === "playlist") {
    if (embedView) embedView.classList.remove('hidden');
  }

  updateMediaButtonStates();
}

function updateMediaButtonStates() {
  const isCollapsed = !mediaPanelContainer || mediaPanelContainer.classList.contains('collapsed');
  if (toggleLyricsText) toggleLyricsText.textContent = (!isCollapsed && currentActiveMediaView === "lyrics") ? "hide lyrics" : "lyrics";
  if (toggleEmbedText) toggleEmbedText.textContent = (!isCollapsed && currentActiveMediaView === "playlist") ? "hide playlist" : "playlist";
}

if (toggleLyricsBtn) {
  toggleLyricsBtn.addEventListener('click', () => switchMediaView('lyrics'));
}

if (toggleEmbedBtn) {
  toggleEmbedBtn.addEventListener('click', () => switchMediaView('playlist'));
}

// ── LAST.FM REAL-TIME 24/7 SPOTIFY CLOUD TRACKER ─────────────────────────
let lastFmTrackStartTime = 0;
let lastFmCurrentTrackKey = "";
let lastFmNowPlayingActive = false;
let lastFmLastSeenPlaying = 0;
let lanyardSocketActive = false;
const artworkCache = new Map();

async function fetchArtworkAndDuration(title, artist) {
  const cacheKey = `${title}_${artist}`.toLowerCase();
  if (artworkCache.has(cacheKey)) return artworkCache.get(cacheKey);

  const cleanTitle = title
    .replace(/\s*\(feat\..*?\)/i, '')
    .replace(/\s*\[feat\..*?\]/i, '')
    .replace(/\s*\(from.*?\)/i, '')
    .replace(/\s*-\s*.*from.*/i, '')
    .replace(/\s*-\s*.*version.*/i, '')
    .replace(/\s*-\s*.*remaster.*/i, '')
    .trim();
  const cleanArtist = artist ? artist.split(/[;•,]/)[0].trim() : "";

  try {
    // 1. Try search with title + artist
    const term = `${cleanTitle} ${cleanArtist}`;
    let res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`);
    let data = res.ok ? await res.json() : null;

    // 2. If no result, try search with title only
    if (!data || data.resultCount === 0) {
      res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&entity=song&limit=1`);
      data = res.ok ? await res.json() : null;
    }

    if (data && data.resultCount > 0 && data.results[0]) {
      const item = data.results[0];
      let artwork = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : "";
      const durationMs = item.trackTimeMillis || 0;
      const result = { artwork, durationMs };
      artworkCache.set(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn("iTunes artwork search error:", e);
  }

  return { artwork: "", durationMs: 0 };
}

async function fetchLastFmNowPlaying() {
  if (!SPOTIFY_CONFIG.lastfm || !SPOTIFY_CONFIG.lastfm.username || !SPOTIFY_CONFIG.lastfm.apiKey) return;
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(SPOTIFY_CONFIG.lastfm.username)}&api_key=${SPOTIFY_CONFIG.lastfm.apiKey}&format=json&limit=1&_=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();

    if (data && data.recenttracks && data.recenttracks.track) {
      const tracks = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [data.recenttracks.track];
      const currentTrack = tracks[0];

      if (currentTrack && currentTrack['@attr'] && currentTrack['@attr'].nowplaying === "true") {
        lastFmLastSeenPlaying = Date.now();
        lastFmNowPlayingActive = true;

        const title = currentTrack.name || "Unknown Track";
        const artist = (currentTrack.artist && (currentTrack.artist['#text'] || currentTrack.artist.name)) || "Unknown Artist";
        const album = (currentTrack.album && (currentTrack.album['#text'] || currentTrack.album.name)) || "";
        
        let albumArt = "";
        if (currentTrack.image && Array.isArray(currentTrack.image)) {
          const img = currentTrack.image.find(i => i.size === "extralarge") || currentTrack.image.find(i => i.size === "large") || currentTrack.image[currentTrack.image.length - 1];
          if (img && img['#text'] && !img['#text'].includes("2a96cbd8b46e442fc41c2b86b821562f")) {
            albumArt = img['#text'];
          }
        }

        const trackKey = `${title}_${artist}`.toLowerCase();
        const isSameTrack = trackKey === lastFmCurrentTrackKey;
        if (!isSameTrack) {
          lastFmCurrentTrackKey = trackKey;
          lastFmTrackStartTime = Date.now();
        }

        const songUrl = currentTrack.url || `https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`;
        const elapsedMs = Math.max(0, Date.now() - lastFmTrackStartTime);

        let platform = "spotify";
        if (currentTrack.url && (currentTrack.url.includes("youtube") || currentTrack.url.includes("youtu.be"))) {
          platform = "ytmusic";
        }

        const lastFmState = {
          isPlaying: true,
          title: title,
          artist: album ? `${artist} • ${album}` : artist,
          albumArt: albumArt || SPOTIFY_CONFIG.playlist.albumArt,
          songUrl: songUrl,
          progressMs: elapsedMs,
          // Never borrow a prior song's duration. Last.fm has no dependable
          // now-playing duration, so metadata resolves this independently.
          durationMs: isSameTrack ? currentPlaybackState.durationMs : 0,
          source: platform,
          updatedAt: Date.now(),
          timingSource: "lastfm"
        };
        currentPlaybackState = preservePreciseTiming(lastFmState);

        renderSpotifyUI(currentPlaybackState);

        // Fetch duration & fallback artwork in background
        if (!albumArt || !currentPlaybackState.durationMs) {
          const expectedTrack = playbackKey(currentPlaybackState);
          fetchArtworkAndDuration(title, artist).then(meta => {
            if (playbackKey(currentPlaybackState) !== expectedTrack) return;
            if (meta.artwork && !albumArt && trackArt) {
              trackArt.src = meta.artwork;
              currentPlaybackState.albumArt = meta.artwork;
            }
            if (meta.durationMs) {
              currentPlaybackState.durationMs = meta.durationMs;
              updateProgressBar();
            }
          });
        }
        return;
      }
    }

    lastFmNowPlayingActive = false;

    // If Last.fm is not playing and Lanyard socket is not reporting a live song
    if (currentPlaybackState.isPlaying && !lanyardSocketActive && (Date.now() - lastFmLastSeenPlaying > 15000)) {
      currentPlaybackState = {
        isPlaying: false,
        title: SPOTIFY_CONFIG.playlist.title,
        artist: SPOTIFY_CONFIG.playlist.artist,
        albumArt: SPOTIFY_CONFIG.playlist.albumArt,
        songUrl: SPOTIFY_CONFIG.playlist.url,
        progressMs: 0,
        durationMs: 0,
        updatedAt: Date.now()
      };
      lastFmCurrentTrackKey = "";
      renderSpotifyUI(currentPlaybackState);
    }
  } catch (err) {
    console.warn("Last.fm tracker error:", err);
  }
}

// Sync button
if (shuffleBtn) {
  shuffleBtn.addEventListener('click', () => {
    const syncText = document.getElementById('sync-text');
    const syncIcon = document.getElementById('sync-icon');
    if (syncText) syncText.textContent = "syncing...";
    if (syncIcon) syncIcon.style.animation = "spin 0.7s linear";
    fetchLastFmNowPlaying();
    fetchLanyardRest();
    setTimeout(() => {
      if (syncText) syncText.textContent = "sync";
      if (syncIcon) syncIcon.style.animation = "";
    }, 700);
  });
}

// Mute theme
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  themeAudio.muted = isMuted;
  muteText.textContent = isMuted ? "unmute" : "mute theme";
  const muteIcon = document.getElementById('mute-icon');
  if (muteIcon) {
    muteIcon.innerHTML = isMuted
      ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`
      : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
  }
});

// Initialize on page load
fetchLastFmNowPlaying();
setInterval(fetchLastFmNowPlaying, SPOTIFY_CONFIG.lastfm.pollIntervalMs);
connectLanyard();
renderSpotifyUI(currentPlaybackState);

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
  isRevealing = true;
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const { cx, cy } = getDropCenter();

  // ensure aesthetic is at top (scroll 0) before measuring clip
  aestheticRoot.scrollTop = 0;

  const playPromise = themeAudio.play();

  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.catch((err) => {
      console.warn("themeAudio playback blocked or failed:", err);
    });
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
    // FIX: keep fixed positioning to avoid layout shift flicker
    aestheticRoot.style.clipPath = 'none';
    aestheticRoot.style.webkitClipPath = 'none';
    aestheticRoot.style.transition = 'none';
    aestheticRoot.style.webkitTransition = 'none';
    aestheticRoot.style.willChange = 'auto';
    document.body.classList.remove('raw');
    document.body.classList.add('aesthetic');
    // FIX: keep body fixed and let aesthetic-root scroll internally - prevents resize-triggered leaf pop
    document.body.style.position = 'fixed';
    document.body.style.inset = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    isRevealing = false;
    revealed = true;
    // FIX: fade canvases in after clip is done, prevents 1-frame flash
    requestAnimationFrame(() => {
      treeCanvas.classList.add('ready');
      canvas.classList.add('ready');
      startTree();
    });
  };

  const onEnd = (ev) => {
    if (ev.target !== aestheticRoot) return;
    if (ev.propertyName !== 'clip-path' && ev.propertyName !== '-webkit-clip-path' && ev.propertyName !== 'clipPath' && ev.propertyName !== 'clip-path') return;
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

// ══════════════════════════════════════════════════════════════════════════════
// ── INTERACTIVE ORGANIC TREE BRANCHING SYSTEM ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const branchTreeOverlay = document.getElementById('branch-tree-overlay');
const branchTreeSvg = document.getElementById('branch-tree-svg');
const branchNodesContainer = document.getElementById('branch-nodes-container');
const mobileBranchModal = document.getElementById('mobile-branch-modal');
const mobileBranchBackdrop = document.getElementById('mobile-branch-backdrop');
const mobileBranchClose = document.getElementById('mobile-branch-close');
const mobileBranchTitle = document.getElementById('mobile-branch-title');
const mobileBranchBadge = document.getElementById('mobile-branch-badge');
const mobileBranchContent = document.getElementById('mobile-branch-content');

// ── RICH BRANCH DATASET WITH KUNAL1320K REAL DATA ─────────────────────────
const BRANCH_DATA = {
  spotify: {
    title: "Spotify Playlists",
    badge: "Music",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#1ed760"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    profileUrl: "https://open.spotify.com/user/kunal1320k",
nodes: [
      {
        id: "sp-14d7SJJHjhwEerGgKaUa4J",
        title: "angrexxxxi 🥟",
        subtitle: "kunal1320k • 100 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/14d7SJJHjhwEerGgKaUa4J",
        subBranches: [
          { title: "Every Breath You Take", artist: "The Police", duration: "4:13", url: "https://open.spotify.com/track/1JSTJqkT5qHq8MDJnJbRE1" },
          { title: "Cry", artist: "Cigarettes After Sex", duration: "4:16", url: "https://open.spotify.com/track/7mDTvYD2ieE4Q28XFziMfJ" },
          { title: "Fluorescent Adolescent", artist: "Arctic Monkeys", duration: "3:03", url: "https://open.spotify.com/track/2x8evxqUlF0eRabbW2JBJd" },
          { title: "Ride It", artist: "Jay Sean", duration: "3:10", url: "https://open.spotify.com/track/2YSrlOiR9kyiqUURfYwDXI" },
          { title: "This Side of Paradise", artist: "Coyote Theory", duration: "4:02", url: "https://open.spotify.com/track/79EkGysjP2dL5GdpeQjRxT" },
          { title: "Pluto Projector", artist: "Rex Orange County", duration: "4:27", url: "https://open.spotify.com/track/4EWBhKf1fOFnyMtUzACXEc" },
          { title: "Fly Me to the Moon", artist: "The Macarons Project", duration: "2:35", url: "https://open.spotify.com/track/0flo3KqhjkcuoB1G6Mhq7s" },
          { title: "Glue Song", artist: "beabadoobee", duration: "2:15", url: "https://open.spotify.com/track/3iBgrkexCzVuPy4O9vx7Mf" }
        ]
      },
      {
        id: "sp-5xoSwzGB8S1xMJXhb6PABc",
        title: "casette",
        subtitle: "ishita • 87 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/5xoSwzGB8S1xMJXhb6PABc",
        subBranches: [
          { title: "My Own Summer (Shove It)", artist: "Deftones", duration: "3:34", url: "https://open.spotify.com/track/1158ckiB5S4cpsdYHDB9IF" },
          { title: "Change (In the House of Flies)", artist: "Deftones", duration: "4:59", url: "https://open.spotify.com/track/51c94ac31swyDQj9B3Lzs3" },
          { title: "Better", artist: "sign crushes motorist", duration: "1:38", url: "https://open.spotify.com/track/0Z94dtWElamDwU4NrcGoUR" },
          { title: "Good Looking", artist: "Suki Waterhouse", duration: "3:34", url: "https://open.spotify.com/track/0j3mqDTK4Z6lvrLzFCUUz6" },
          { title: "Passenger", artist: "Deftones", duration: "6:08", url: "https://open.spotify.com/track/7IoK6jZBxY7NMoQPoPXZCF" },
          { title: "Entombed", artist: "Deftones", duration: "4:59", url: "https://open.spotify.com/track/4bLCPfBLKlqiONo6TALTh5" },
          { title: "Rosemary", artist: "Deftones", duration: "6:53", url: "https://open.spotify.com/track/4FEr6dIdH6EqLKR0jB560J" },
          { title: "Kingston", artist: "Faye Webster", duration: "3:22", url: "https://open.spotify.com/track/5WbfFTuIldjL9x7W6y5l7R" }
        ]
      },
      {
        id: "sp-6zEcBH3X2RkTtSQI4fTn8v",
        title: "Coffeeee",
        subtitle: "sangam_shh • 100 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/6zEcBH3X2RkTtSQI4fTn8v",
        subBranches: [
          { title: "Girl in a Coffee Shop", artist: "Zach Seabaugh", duration: "2:15", url: "https://open.spotify.com/track/4t1zWwxBWH2xqpQgR6KTcq" },
          { title: "Make You Mine", artist: "PUBLIC", duration: "3:52", url: "https://open.spotify.com/track/5iFwAOB2TFkPJk8sMlxP8g" },
          { title: "Belong Together", artist: "Mark Ambor", duration: "2:28", url: "https://open.spotify.com/track/5uQ7de4EWjb3rkcFxyEOpu" },
          { title: "Carry You Home", artist: "Alex Warren", duration: "2:46", url: "https://open.spotify.com/track/4uzKAj0mIyYmyhsRRyPXaQ" },
          { title: "Those Eyes", artist: "New West", duration: "3:40", url: "https://open.spotify.com/track/50x1Ic8CaXkYNvjmxe3WXy" },
          { title: "Let's Fall in Love for the Night", artist: "FINNEAS", duration: "3:10", url: "https://open.spotify.com/track/4pfhgOylRLcBll5JjUsJZj" },
          { title: "The One", artist: "Kodaline", duration: "3:52", url: "https://open.spotify.com/track/0My8NPmENHrN5W7OfgZnZJ" },
          { title: "Perfect", artist: "Ed Sheeran", duration: "4:23", url: "https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v" }
        ]
      },
      {
        id: "sp-4ihgqKZzcjEJ6s7RY9bSWU",
        title: "the boy",
        subtitle: "ishita • 51 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/4ihgqKZzcjEJ6s7RY9bSWU",
        subBranches: [
          { title: "Mirrors", artist: "Justin Timberlake", duration: "8:05", url: "https://open.spotify.com/track/4rHZZAmHpZrA3iH5zx8frV" },
          { title: "Comfortable", artist: "H.E.R.", duration: "4:15", url: "https://open.spotify.com/track/3f3cliOygeuUpGRwdohy12" },
          { title: "melt", artist: "Kehlani", duration: "3:31", url: "https://open.spotify.com/track/1pCbBNRglGwlMLeUTOnqrO" },
          { title: "All of Me", artist: "John Legend", duration: "4:29", url: "https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a" },
          { title: "yours", artist: "Greyson Chance", duration: "3:46", url: "https://open.spotify.com/track/1FHy0U8vbNRJY6t9sk4rC2" },
          { title: "Tum Se Hi", artist: "Pritam, Mohit Chauhan, Irshad Kamil", duration: "5:21", url: "https://open.spotify.com/track/7eQl3Yqv35ioqUfveKHitE" },
          { title: "Liz On Top Of The World - From \"Pride & Prejudice\" Soundtrack", artist: "Dario Marianelli, Jean-Yves Thibaudet", duration: "1:22", url: "https://open.spotify.com/track/1nd0AX0VYGQb2pF442YqGj" },
          { title: "Je te laisserai des mots", artist: "Patrick Watson", duration: "2:40", url: "https://open.spotify.com/track/0V5cvmTKsYmF5FmGGEAfmS" }
        ]
      },
      {
        id: "sp-4WshYPCsLOlWNioo28hFsr",
        title: "in your head",
        subtitle: "ishita • 42 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/4WshYPCsLOlWNioo28hFsr",
        subBranches: [
          { title: "in your head", artist: "cloudyfield", duration: "2:50", url: "https://open.spotify.com/track/4o6xvp0vmdHMeS4Z5qeRQw" },
          { title: "My Girlfriend's Girlfriend", artist: "Type O Negative", duration: "3:48", url: "https://open.spotify.com/track/3yubyWatnRRLHkIsN1ZI2Q" },
          { title: "Bardo", artist: "trauma ray", duration: "3:24", url: "https://open.spotify.com/track/05eBPrTZPj0i0p9xsIlNPI" },
          { title: "Pandora", artist: "Wisp", duration: "4:21", url: "https://open.spotify.com/track/3SBhQh5X7tO8ejCMUdjSRu" },
          { title: "Your face", artist: "Wisp", duration: "3:47", url: "https://open.spotify.com/track/7ne2hzW4jaU5tacaCI4kJH" },
          { title: "Anesthesia", artist: "Type O Negative", duration: "6:41", url: "https://open.spotify.com/track/0c03LEUpwW0O2tmt0dfktG" },
          { title: "Be My Druidess", artist: "Type O Negative", duration: "5:25", url: "https://open.spotify.com/track/1ycz5DvATLtmn2pOU8u38C" },
          { title: "Garden", artist: "Pearl Jam", duration: "4:58", url: "https://open.spotify.com/track/3KcJEOyaLDLAERlOCBhmPA" }
        ]
      },
      {
        id: "sp-478BJCqpYQbRiykf7Eiyy3",
        title: "Himachal 💗",
        subtitle: "sangam_shh • 39 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/478BJCqpYQbRiykf7Eiyy3",
        subBranches: [
          { title: "Amma Puchhdi Sun Dhiye Meriye", artist: "Karnail Rana", duration: "9:04", url: "https://open.spotify.com/track/1nyKQwj2C1wIsQlssBwUng" },
          { title: "Chaska", artist: "Ajay Chauhan, Ajju Tomar", duration: "9:43", url: "https://open.spotify.com/track/2woe0OybftJUafAzk88p8b" },
          { title: "Rumatiye", artist: "Nati King Kuldeep Sharma", duration: "2:54", url: "https://open.spotify.com/track/1r7tlzmNtSp5YuvXzUM9Uk" },
          { title: "Dunge Naluye", artist: "Vicky Rajta", duration: "4:22", url: "https://open.spotify.com/track/0BlvgAcS6k9EoBeKhJorNX" },
          { title: "Rohru Jana DJ Nonstop Album", artist: "Nati King Kuldeep Sharma", duration: "21:33", url: "https://open.spotify.com/track/2sp2HiujUohPImG787Nu9e" },
          { title: "Nati Sirmour Waliye", artist: "Ajay Chauhan", duration: "4:53", url: "https://open.spotify.com/track/4rbv9ZnArAo9CHiw1igyDK" },
          { title: "Kunjoo Chanchalo", artist: "Karnail Rana, Anuradha Paudwal", duration: "9:15", url: "https://open.spotify.com/track/0VsDpce4sz4YeoTq6ISD0J" },
          { title: "Bangdiyan", artist: "Sunil Mastie, Sheetal Arora", duration: "4:21", url: "https://open.spotify.com/track/2CwQKr68yEwCCqPA1lrC8d" }
        ]
      },
      {
        id: "sp-0dTWmjqu1I9Wy8amnyCUPJ",
        title: "distortion",
        subtitle: "ishita • 37 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/0dTWmjqu1I9Wy8amnyCUPJ",
        subBranches: [
          { title: "Rummage (feat. Orbiting Human Circus)", artist: "quannnic, Orbiting Human Circus", duration: "3:50", url: "https://open.spotify.com/track/5VTggg4KikE3rBmKHD3i7t" },
          { title: "Enough for you", artist: "Wisp", duration: "3:05", url: "https://open.spotify.com/track/7CYPzawmBUJUN3tDGhQh1I" },
          { title: "Figure It Out", artist: "Royal Blood", duration: "3:03", url: "https://open.spotify.com/track/3MjrueDQKVr6xDDseZwhEd" },
          { title: "Chasing Light", artist: "aswekeepsearching", duration: "5:31", url: "https://open.spotify.com/track/5F0hIO08012qttN94QlO7k" },
          { title: "Toofaan", artist: "Karakoram", duration: "3:52", url: "https://open.spotify.com/track/2Xf7blEC0JC3DYeIvy011j" },
          { title: "life imitates life", artist: "quannnic", duration: "3:23", url: "https://open.spotify.com/track/5E9qBEUja2yAjUPhQO8Gx7" },
          { title: "Safe In Your Skin", artist: "Title Fight", duration: "2:34", url: "https://open.spotify.com/track/1acjIzGS1YUrx6nSuktnqU" },
          { title: "Downer", artist: "Nirvana", duration: "1:43", url: "https://open.spotify.com/track/4e0MJaiXSwXBhrQZHyoK8c" }
        ]
      },
      {
        id: "sp-6SJEodCZUtpAFFrRGtXz2M",
        title: "right in the feels",
        subtitle: "ishita • 26 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/6SJEodCZUtpAFFrRGtXz2M",
        subBranches: [
          { title: "Liar", artist: "Paramore", duration: "4:21", url: "https://open.spotify.com/track/7EUhSxz4srS8pqh1cENbLB" },
          { title: "Sextape", artist: "Deftones", duration: "4:01", url: "https://open.spotify.com/track/1EryAkZ0VHstC6haIxVBiE" },
          { title: "Show Me How", artist: "Men I Trust", duration: "3:35", url: "https://open.spotify.com/track/01TyFEZu6mHbffsVfxgrFn" },
          { title: "Scenery", artist: "Ashmute", duration: "4:34", url: "https://open.spotify.com/track/1PztXsxTLZE7rFNP0kUwgQ" },
          { title: "Aaftaab", artist: "The Local Train", duration: "3:53", url: "https://open.spotify.com/track/4LtSTc3xANVhYeeN69nscM" },
          { title: "Clair de lune", artist: "Claude Debussy, Alexis Weissenberg", duration: "5:47", url: "https://open.spotify.com/track/6kf7ZCJjEbjZXikivKOsvJ" },
          { title: "Gymnopédie No. 1", artist: "Erik Satie, Philippe Entremont", duration: "3:25", url: "https://open.spotify.com/track/5NGtFXVpXSvwunEIGeviY3" },
          { title: "Astronomy", artist: "Conan Gray", duration: "4:03", url: "https://open.spotify.com/track/0KmgJyW4GDgonqsoyx0CZ3" }
        ]
      },
      {
        id: "sp-1gHCUJSMJrMT4pClvoFcoV",
        title: "Unheard ",
        subtitle: "kunal1320k • 10 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/1gHCUJSMJrMT4pClvoFcoV",
        subBranches: [
          { title: "Don't You Want Me", artist: "The Human League", duration: "3:56", url: "https://open.spotify.com/track/3L7RtEcu1Hw3OXrpnthngx" },
          { title: "I Wanna Dance with Somebody (Who Loves Me)", artist: "Whitney Houston", duration: "4:52", url: "https://open.spotify.com/track/2tUBqZG2AbRi7Q0BIrVrEj" },
          { title: "Scar Tissue", artist: "Red Hot Chili Peppers", duration: "3:35", url: "https://open.spotify.com/track/1G391cbiT3v3Cywg8T7DM1" },
          { title: "Come Back to Me", artist: "David Cook", duration: "4:08", url: "https://open.spotify.com/track/55r33uTqnLglVMHb1qeWOd" },
          { title: "Always Be My Baby", artist: "Mariah Carey", duration: "4:18", url: "https://open.spotify.com/track/2aBxt229cbLDOvtL7Xbb9x" },
          { title: "Dekho Na", artist: "Sobit Tamang", duration: "3:47", url: "https://open.spotify.com/track/1tBFMrlbCnJIglzG9xroRp" },
          { title: "Magnolia", artist: "Magnolia Celebration", duration: "4:16", url: "https://open.spotify.com/track/3JkDuxcnIzBUngCk6peKZi" },
          { title: "Like You (feat. Ciara)", artist: "Bow Wow, Ciara", duration: "3:25", url: "https://open.spotify.com/track/3jEqrIfwKO0M8ALu3TGilF" }
        ]
      },
      {
        id: "sp-5rH0myoXIqZvoVLXJeliCL",
        title: "for headbanging",
        subtitle: "ishita • 41 songs",
        tag: "Playlist",
        url: "https://open.spotify.com/playlist/5rH0myoXIqZvoVLXJeliCL",
        subBranches: [
          { title: "KOOL KIDS", artist: "Måneskin", duration: "2:43", url: "https://open.spotify.com/track/2psPo5syHobyRjH1shxFsf" },
          { title: "IN NOME DEL PADRE", artist: "Måneskin", duration: "3:39", url: "https://open.spotify.com/track/2uKWInHih8UkVBwgH6zuUm" },
          { title: "LIVIDI SUI GOMITI", artist: "Måneskin", duration: "2:45", url: "https://open.spotify.com/track/1ITV1k9laGrWUpagayejMQ" },
          { title: "LA FINE", artist: "Måneskin", duration: "3:20", url: "https://open.spotify.com/track/6DPE8tGV9lzKALNnvuY9dS" },
          { title: "Figure It Out", artist: "Royal Blood", duration: "3:03", url: "https://open.spotify.com/track/3MjrueDQKVr6xDDseZwhEd" },
          { title: "ZITTI E BUONI", artist: "Måneskin", duration: "3:14", url: "https://open.spotify.com/track/776AftMmFFAWUIEAb3lHhw" },
          { title: "Mystify", artist: "INXS", duration: "3:16", url: "https://open.spotify.com/track/7LV9R3L1YfTSoefglhUyPD" },
          { title: "Break Stuff", artist: "Limp Bizkit", duration: "2:46", url: "https://open.spotify.com/track/5cZqsjVs6MevCnAkasbEOX" }
        ]
      }
    ]
  },
  github: {
    title: "GitHub Repositories",
    badge: "Code",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    profileUrl: "https://github.com/kunal1320k",
    nodes: [
      {
        id: "gh-spotifytoytmusic",
        title: "SpotifytoYTMusicSync",
        subtitle: "Transfer/sync Spotify playlists to ytm. Auto/manual playlists.",
        tag: "Python • ★ 13",
        url: "https://github.com/kunal1320k/SpotifytoYTMusicSync",
        subBranches: [
          { title: "★ 13 Stars • 1 Fork", artist: "Language: Python", duration: "Public", url: "https://github.com/kunal1320k/SpotifytoYTMusicSync" },
          { title: "High Accuracy Sync", artist: "Spotify to YouTube Music transfer", duration: "Repo ↗", url: "https://github.com/kunal1320k/SpotifytoYTMusicSync" },
          { title: "View on GitHub", artist: "Browse source code", duration: "github.com", url: "https://github.com/kunal1320k/SpotifytoYTMusicSync" }
        ]
      },
      {
        id: "gh-chemocr",
        title: "ChemOCR",
        subtitle: "Lite model OCR for chemical structures to standard formats",
        tag: "Python • ★ 2",
        url: "https://github.com/kunal1320k/ChemOCR",
        subBranches: [
          { title: "★ 2 Stars", artist: "Chemical Structure OCR", duration: "Python", url: "https://github.com/kunal1320k/ChemOCR" },
          { title: "Structure Formats", artist: "Export for computational chemistry", duration: "Repo ↗", url: "https://github.com/kunal1320k/ChemOCR" }
        ]
      },
      {
        id: "gh-exeiconchanger",
        title: "ExeIconChanger",
        subtitle: "C++ tool to change EXE icons with bicubic interpolation resizing",
        tag: "C++",
        url: "https://github.com/kunal1320k/ExeIconChanger",
        subBranches: [
          { title: "Bicubic Interpolation", artist: "High-performance smart resizing", duration: "C++", url: "https://github.com/kunal1320k/ExeIconChanger" },
          { title: "Auto Image-to-Icon", artist: "Direct PE header icon rewrite", duration: "Repo ↗", url: "https://github.com/kunal1320k/ExeIconChanger" }
        ]
      },
      {
        id: "gh-oneclicksort",
        title: "OneClickSort",
        subtitle: "Automatically move files into folders according to their file type",
        tag: "PowerShell",
        url: "https://github.com/kunal1320k/OneClickSort",
        subBranches: [
          { title: "Automated File Sorting", artist: "Organize files by extension", duration: "PowerShell", url: "https://github.com/kunal1320k/OneClickSort" },
          { title: "One-Click Execution", artist: "Clean up downloads & folders", duration: "Repo ↗", url: "https://github.com/kunal1320k/OneClickSort" }
        ]
      },
      {
        id: "gh-proxyswitcher",
        title: "Proxy-Switcher-Powershell",
        subtitle: "PowerShell script simplifying Windows proxy management",
        tag: "PowerShell",
        url: "https://github.com/kunal1320k/Proxy-Switcher-Powershell",
        subBranches: [
          { title: "Windows Proxy Manager", artist: "Fast network toggle script", duration: "PowerShell", url: "https://github.com/kunal1320k/Proxy-Switcher-Powershell" }
        ]
      },
      {
        id: "gh-myprofile",
        title: "myprofile",
        subtitle: "halo — Autumn aesthetic profile with live Spotify sync",
        tag: "JavaScript",
        url: "https://github.com/kunal1320k/myprofile",
        subBranches: [
          { title: "Interactive Canvas & Tree", artist: "Full personal portfolio", duration: "JavaScript", url: "https://github.com/kunal1320k/myprofile" },
          { title: "Commits & Updates", artist: "Live synced features", duration: "GitHub", url: "https://github.com/kunal1320k/myprofile/commits/main" }
        ]
      },
      {
        id: "gh-telegramuploader",
        title: "basic-telegram-file-uploader",
        subtitle: "Upload files from any drive location directly to telegram channel",
        tag: "Python",
        url: "https://github.com/kunal1320k/basic-telegram-file-uploader",
        subBranches: [
          { title: "Telegram Channel Bot", artist: "Drive to Telegram upload automation", duration: "Python", url: "https://github.com/kunal1320k/basic-telegram-file-uploader" }
        ]
      }
    ]
  },
  youtube: {
    title: "YouTube Channel",
    badge: "Video",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff0033"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    profileUrl: "https://www.youtube.com/@kunal1320k",
    nodes: [
      {
        id: "yt-channel",
        title: "YouTube Channel",
        subtitle: "@kunal1320k",
        tag: "Channel",
        url: "https://www.youtube.com/@kunal1320k",
        subBranches: [
          { title: "Visit @kunal1320k", artist: "Official YouTube Channel", duration: "Open ↗", url: "https://www.youtube.com/@kunal1320k" },
          { title: "Channel Playlists", artist: "Saved & Created Playlists", duration: "Playlists ↗", url: "https://www.youtube.com/@kunal1320k/playlists" }
        ]
      },
      {
        id: "yt-playlists",
        title: "Playlists & Music",
        subtitle: "kunal1320k Playlists",
        tag: "Playlists",
        url: "https://www.youtube.com/@kunal1320k/playlists",
        subBranches: [
          { title: "View All Playlists", artist: "@kunal1320k Playlists", duration: "YouTube", url: "https://www.youtube.com/@kunal1320k/playlists" }
        ]
      }
    ]
  },
  myanimelist: {
    title: "MyAnimeList",
    badge: "Anime",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#2e51a2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/></svg>`,
    profileUrl: "https://myanimelist.net/profile/kunal1320k",
    nodes: [
      {
        id: "mal-frieren",
        title: "Sousou no Frieren",
        subtitle: "Score: ★ 10/10 • 28/28 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/52991/Sousou_no_Frieren",
        subBranches: [
          { title: "Score: 10/10 (Masterpiece)", artist: "Watched: 28/28 episodes", duration: "Completed", url: "https://myanimelist.net/anime/52991" },
          { title: "Rank #1 on MAL", artist: "Adventure, Drama, Fantasy", duration: "MAL ↗", url: "https://myanimelist.net/anime/52991" }
        ]
      },
      {
        id: "mal-aot",
        title: "Shingeki no Kyojin",
        subtitle: "Score: ★ 10/10 • 25/25 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/16498/Shingeki_no_Kyojin",
        subBranches: [
          { title: "Score: 10/10 (Masterpiece)", artist: "Watched: 25/25 episodes", duration: "Completed", url: "https://myanimelist.net/anime/16498" },
          { title: "Attack on Titan", artist: "Action, Mystery, Drama", duration: "MAL ↗", url: "https://myanimelist.net/anime/16498" }
        ]
      },
      {
        id: "mal-aots3p2",
        title: "Shingeki no Kyojin S3 Part 2",
        subtitle: "Score: ★ 10/10 • 10/10 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/38524/Shingeki_no_Kyojin_Season_3_Part_2",
        subBranches: [
          { title: "Score: 10/10 (Masterpiece)", artist: "Watched: 10/10 episodes", duration: "Completed", url: "https://myanimelist.net/anime/38524" },
          { title: "Wit Studio", artist: "Action, Suspense", duration: "MAL ↗", url: "https://myanimelist.net/anime/38524" }
        ]
      },
      {
        id: "mal-steinsgate",
        title: "Steins;Gate",
        subtitle: "Score: ★ 9/10 • 24/24 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/9253/Steins_Gate",
        subBranches: [
          { title: "Score: 9/10 (Great)", artist: "Watched: 24/24 episodes", duration: "Completed", url: "https://myanimelist.net/anime/9253" },
          { title: "White Fox Animation", artist: "Sci-Fi, Psychological, Suspense", duration: "MAL ↗", url: "https://myanimelist.net/anime/9253" }
        ]
      },
      {
        id: "mal-eva",
        title: "Shinseiki Evangelion",
        subtitle: "Score: ★ 9/10 • 26/26 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/30/Shinseiki_Evangelion",
        subBranches: [
          { title: "Score: 9/10 (Great)", artist: "Watched: 26/26 episodes", duration: "Completed", url: "https://myanimelist.net/anime/30" },
          { title: "Neon Genesis Evangelion", artist: "Mecha, Psychological, Drama", duration: "MAL ↗", url: "https://myanimelist.net/anime/30" }
        ]
      },
      {
        id: "mal-violet",
        title: "Violet Evergarden",
        subtitle: "Score: ★ 8/10 • 13/13 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/33352/Violet_Evergarden",
        subBranches: [
          { title: "Score: 8/10 (Very Good)", artist: "Watched: 13/13 episodes", duration: "Completed", url: "https://myanimelist.net/anime/33352" },
          { title: "Kyoto Animation", artist: "Drama, Fantasy", duration: "MAL ↗", url: "https://myanimelist.net/anime/33352" }
        ]
      },
      {
        id: "mal-oshinoko",
        title: "[Oshi no Ko]",
        subtitle: "Score: ★ 7/10 • 11/11 eps",
        tag: "Completed",
        url: "https://myanimelist.net/anime/52034/Oshi_no_Ko",
        subBranches: [
          { title: "Score: 7/10 (Good)", artist: "Watched: 11/11 episodes", duration: "Completed", url: "https://myanimelist.net/anime/52034" },
          { title: "Doga Kobo", artist: "Drama, Supernatural", duration: "MAL ↗", url: "https://myanimelist.net/anime/52034" }
        ]
      }
    ]
  },
  reddit: {
    title: "Reddit",
    badge: "Reddit",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff4500"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-1.222 3.666 3.844-1.127C7.943 23.633 9.897 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.01 13c-.643 0-1.165-.521-1.165-1.165s.522-1.165 1.165-1.165c.644 0 1.165.521 1.165 1.165S17.654 13 17.01 13zm-10.02 0c-.643 0-1.165-.521-1.165-1.165s.522-1.165 1.165-1.165c.644 0 1.165.521 1.165 1.165S7.634 13 6.99 13zm8.385 3.328c-.856.856-2.222.92-3.375.92s-2.519-.064-3.375-.92c-.228-.228-.228-.598 0-.826.228-.228.598-.228.826 0 .616.616 1.713.682 2.549.682s1.933-.066 2.549-.682c.228-.228.598-.228.826 0 .228.228.228.598 0 .826z"/></svg>`,
    profileUrl: "https://www.reddit.com/user/Juicy-Jam-987/",
    nodes: [
      {
        id: "rd-profile",
        title: "u/Juicy-Jam-987",
        subtitle: "Reddit User Profile",
        tag: "User",
        url: "https://www.reddit.com/user/Juicy-Jam-987/",
        subBranches: [
          { title: "View Profile", artist: "u/Juicy-Jam-987", duration: "Reddit ↗", url: "https://www.reddit.com/user/Juicy-Jam-987/" },
          { title: "Submitted Posts", artist: "Reddit Submissions", duration: "Reddit ↗", url: "https://www.reddit.com/user/Juicy-Jam-987/submitted/" }
        ]
      }
    ]
  },
  steam: {
    title: "Steam Profile",
    badge: "Gaming",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.008l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.155-3.331-2.693L.437 14.8C1.849 20.084 6.641 24 12.333 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0z"/></svg>`,
    profileUrl: "https://steamcommunity.com/id/kunal1320k/",
    nodes: [
      {
        id: "st-profile",
        title: "kunal1320k",
        subtitle: "Level 4 • Steam Community Profile",
        tag: "Steam",
        url: "https://steamcommunity.com/id/kunal1320k/",
        subBranches: [
          { title: "Steam Profile", artist: "Level 4 • kunal1320k", duration: "Steam ↗", url: "https://steamcommunity.com/id/kunal1320k/" },
          { title: "Games & Badges", artist: "Community Activity", duration: "Steam ↗", url: "https://steamcommunity.com/id/kunal1320k/games/?tab=all" }
        ]
      }
    ]
  },
  telegram: {
    title: "Telegram Contact",
    badge: "Chat",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#229ed9"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.895-1.125 5.09-1.6 7.275-.201.923-.591 1.233-.967 1.264-.817.067-1.439-.54-2.23-1.058-1.238-.81-1.938-1.315-3.138-2.107-1.387-.915-.488-1.418.303-2.24.207-.215 3.805-3.488 3.875-3.787.009-.037.017-.178-.066-.252-.083-.074-.206-.049-.294-.029-.126.029-2.133 1.356-6.02 3.98-.569.391-1.085.582-1.547.572-.51-.011-1.49-.288-2.22-.525-.895-.292-1.607-.446-1.545-.941.032-.258.388-.522 1.067-.794 4.184-1.822 6.976-3.024 8.375-3.606 3.996-1.662 4.827-1.95 5.368-1.96.119-.002.385.028.558.168.146.118.186.277.205.389.019.112.043.364.024.564z"/></svg>`,
    profileUrl: "https://t.me/kunal1320k",
    nodes: [
      {
        id: "tg-direct",
        title: "@kunal1320k",
        subtitle: "Direct messaging & contact",
        tag: "Telegram",
        url: "https://t.me/kunal1320k",
        subBranches: [
          { title: "Chat on Telegram", artist: "@kunal1320k", duration: "Direct ↗", url: "https://t.me/kunal1320k" }
        ]
      }
    ]
  }
};

// ── LIVE DYNAMIC UPDATES (GITHUB API + LOCAL DATA FILES) ────────────────────
async function syncRealDataSources() {
  // 1. Sync from local data files if present (data/myanimelist.json, data/spotify.json, data/github.json)
  try {
    const malRes = await fetch('data/myanimelist.json');
    if (malRes.ok) {
      const malJson = await malRes.json();
      if (malJson.anime && Array.isArray(malJson.anime) && malJson.anime.length > 0) {
        BRANCH_DATA.myanimelist.nodes = malJson.anime.slice(0, 8).map(a => ({
          id: `mal-${a.id}`,
          title: a.title,
          subtitle: a.subtitle || `Score: ${a.score}/10`,
          tag: a.status || "Completed",
          url: a.url,
          subBranches: [
            { title: `Score: ${a.score}/10`, artist: `Episodes: ${a.watched_episodes}/${a.total_episodes}`, duration: a.status || "MAL", url: a.url },
            { title: "View on MyAnimeList", artist: a.title, duration: "MAL ↗", url: a.url }
          ]
        }));
      }
    }
  } catch (_) {}

  try {
    const spRes = await fetch('data/spotify.json');
    if (spRes.ok) {
      const spJson = await spRes.json();
      if (spJson.playlists && Array.isArray(spJson.playlists) && spJson.playlists.length > 0) {
        BRANCH_DATA.spotify.nodes = spJson.playlists.map(p => ({
          id: `sp-${p.id}`,
          title: p.title,
          subtitle: p.subtitle,
          tag: "Playlist",
          url: p.url,
          subBranches: (p.songs || []).map(s => ({
            title: s.title,
            artist: s.artist,
            duration: s.duration || "play ↗",
            url: s.url
          }))
        }));
      }
    }
  } catch (_) {}

  // 2. Sync live GitHub repos directly from API
  try {
    const res = await fetch('https://api.github.com/users/kunal1320k/repos?sort=updated&per_page=10');
    if (res.ok) {
      const repos = await res.json();
      if (Array.isArray(repos) && repos.length > 0) {
        applyGitHubReposToBranch(repos);
      }
    }
  } catch (_) {}
}

function applyGitHubReposToBranch(repos) {
  if (!BRANCH_DATA.github) return;
  const filtered = repos.filter(r => r.name);
  if (filtered.length > 0) {
    BRANCH_DATA.github.nodes = filtered.slice(0, 7).map(repo => ({
      id: `gh-${repo.name}`,
      title: repo.name,
      subtitle: repo.description || "kunal1320k repository",
      tag: repo.language ? `${repo.language}${repo.stargazers_count ? ` • ★ ${repo.stargazers_count}` : ''}` : (repo.stargazers_count ? `★ ${repo.stargazers_count}` : "Project"),
      url: repo.html_url,
      subBranches: [
        {
          title: `★ Stars: ${repo.stargazers_count || 0} • Forks: ${repo.forks_count || 0}`,
          artist: `Language: ${repo.language || 'Code'}`,
          duration: "Repo Info",
          url: repo.html_url
        },
        {
          title: "Browse Source Code",
          artist: `Updated: ${new Date(repo.updated_at).toLocaleDateString()}`,
          duration: "GitHub ↗",
          url: repo.html_url
        }
      ]
    }));
  }
}

// Dynamically augment active playlist with live playing track
function syncLivePlayingTrackToSpotifyBranch() {
  if (!BRANCH_DATA.spotify || !currentPlaybackState.isPlaying) return;
  const activePlaylist = BRANCH_DATA.spotify.nodes[0];
  if (!activePlaylist || !activePlaylist.subBranches) return;

  const currentTitle = currentPlaybackState.title;
  const currentArtist = currentPlaybackState.artist;
  const currentUrl = spotifyTrackUrl(currentPlaybackState);

  // Check if already present at top
  const exists = activePlaylist.subBranches.some(
    s => s.title.toLowerCase() === currentTitle.toLowerCase()
  );
  if (!exists && currentTitle) {
    activePlaylist.subBranches.unshift({
      title: currentTitle,
      artist: currentArtist,
      duration: "Now Playing 🟢",
      url: currentUrl
    });
  }
}

// ── DESKTOP ORGANIC TREE ENGINE (SVG BEZIER & COLLISION SAFE) ───────────────
let activeBranchKey = null;
let activeBranchSourceElem = null;
let branchHideTimeout = null;
let subBranchHideTimeout = null;
let activeSubBranchCard = null;

function clearBranchSvg() {
  if (branchTreeSvg) {
    while (branchTreeSvg.firstChild) {
      branchTreeSvg.removeChild(branchTreeSvg.firstChild);
    }
  }
}

function clearBranchNodes() {
  if (branchNodesContainer) {
    branchNodesContainer.innerHTML = '';
  }
  activeSubBranchCard = null;
}

function cancelBranchHide() {
  if (branchHideTimeout) {
    clearTimeout(branchHideTimeout);
    branchHideTimeout = null;
  }
}

function scheduleBranchHide(delay = 280) {
  cancelBranchHide();
  branchHideTimeout = setTimeout(() => {
    hideBranchTree();
  }, delay);
}

function hideBranchTree() {
  cancelBranchHide();
  if (branchTreeOverlay) branchTreeOverlay.classList.remove('active');
  clearBranchSvg();
  clearBranchNodes();
  document.querySelectorAll('.link-row.branch-active').forEach(el => {
    el.classList.remove('branch-active');
  });
  activeBranchKey = null;
  activeBranchSourceElem = null;
}

function updateBranchSvgDimensions() {
  if (!branchTreeSvg) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  branchTreeSvg.setAttribute("width", `${w}`);
  branchTreeSvg.setAttribute("height", `${h}`);
  branchTreeSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  branchTreeSvg.style.width = `${w}px`;
  branchTreeSvg.style.height = `${h}px`;
}

// Generates an organic cubic bezier path from source (x0, y0) to target (x1, y1)
function createBranchPath(x0, y0, x1, y1, isSecondary = false) {
  const dx = x1 - x0;
  const dy = y1 - y0;

  // Natural organic tree-branch curvature with clean horizontal exit and entry tangents
  const cx1 = x0 + dx * (isSecondary ? 0.38 : 0.46);
  const cy1 = y0 + dy * 0.04;
  const cx2 = x0 + dx * (isSecondary ? 0.65 : 0.74);
  const cy2 = y1 - dy * 0.04;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`);
  path.setAttribute("class", `tree-branch-line ${isSecondary ? 'secondary' : ''}`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", isSecondary ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.88)");
  path.setAttribute("stroke-width", isSecondary ? "1.4" : "1.8");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  // Animated draw-in effect with guaranteed visibility
  const approxLength = Math.max(Math.ceil(Math.hypot(dx, dy) * 1.35) + 30, 80);
  path.style.strokeDasharray = `${approxLength}`;
  path.style.strokeDashoffset = `${approxLength}`;

  // Execute drawing animation via Web Animations API
  try {
    path.animate(
      [
        { strokeDashoffset: `${approxLength}`, opacity: 0.35 },
        { strokeDashoffset: '0', opacity: 1 }
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }
    );
  } catch (_) {}

  // Fallback to guarantee the white line is 100% visible
  setTimeout(() => {
    if (path.isConnected) {
      path.style.strokeDashoffset = '0';
      path.style.opacity = '1';
    }
  }, 320);

  return path;
}

// Clean solid joint dot at fork or node attachment (no brown outline)
function createBranchDot(x, y, isSecondary = false) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x.toFixed(1));
  circle.setAttribute("cy", y.toFixed(1));
  circle.setAttribute("r", isSecondary ? "2.5" : "3.2");
  circle.setAttribute("class", `tree-branch-node-dot ${isSecondary ? 'secondary' : ''}`);
  circle.setAttribute("fill", isSecondary ? "rgba(232, 226, 217, 0.8)" : "#ffffff");
  return circle;
}

// Layout primary branch nodes safely without EVER overlapping #spotify-card or links-grid
function computeSafeBranchPositions(sourceRect, nodeCount, key) {
  const spotifyCardElem = document.getElementById('spotify-card');
  const spRect = spotifyCardElem ? spotifyCardElem.getBoundingClientRect() : null;
  const linksGridElem = document.getElementById('links-grid');
  const gridRect = linksGridElem ? linksGridElem.getBoundingClientRect() : null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const cardW = 250;
  const cardH = 76;
  const maxNodes = Math.min(nodeCount, 4); // Display top 4 primary cards as shown in sketch

  // Horizontal position:
  // Must be strictly to the right of the links grid (min 36px clear of telegram / steam)
  const minSafeX = (gridRect ? gridRect.right : 340) + 36;
  // Align into the open column underneath the Spotify player card
  let targetX = spRect ? Math.max(minSafeX, spRect.left + 16) : minSafeX;
  if (targetX + cardW > vw - 24) {
    targetX = vw - cardW - 24;
  }
  if (targetX < minSafeX) {
    targetX = minSafeX;
  }

  // Vertical position:
  // Positioned directly below the Spotify player card in the open area
  const spBottom = spRect ? spRect.bottom : 260;
  let startY = spBottom + 20;

  // Dynamic vertical gap calculation to ensure zero overlap between cards
  const availableH = vh - startY - 24;
  let gapY = 16;
  if (availableH < maxNodes * cardH + (maxNodes - 1) * gapY) {
    gapY = Math.max(8, Math.floor((availableH - maxNodes * cardH) / Math.max(1, maxNodes - 1)));
  }

  // Viewport bottom boundary protection
  if (startY + maxNodes * cardH + (maxNodes - 1) * gapY > vh - 16) {
    startY = Math.max(spBottom + 10, vh - 16 - (maxNodes * cardH + (maxNodes - 1) * gapY));
  }

  const positions = [];
  for (let i = 0; i < maxNodes; i++) {
    // Organic stagger offset matching real tree branch leaves (as in user sketch)
    const staggerX = (i % 2 === 1) ? 22 : 0;
    const finalX = Math.min(targetX + staggerX, vw - cardW - 16);
    const finalY = startY + i * (cardH + gapY);
    positions.push({ x: finalX, y: finalY });
  }

  return positions;
}

// Render primary branch nodes and SVG lines
function renderPrimaryBranches(key, sourceElem) {
  const data = BRANCH_DATA[key];
  if (!data || !data.nodes || data.nodes.length === 0) return;

  updateBranchSvgDimensions();
  clearBranchSvg();
  clearBranchNodes();

  const sourceRect = sourceElem.getBoundingClientRect();
  const x0 = sourceRect.right;
  const y0 = sourceRect.top + sourceRect.height / 2;

  // Add clean origin joint dot directly on the hovered link
  const originDot = createBranchDot(x0, y0, false);
  branchTreeSvg.appendChild(originDot);

  const nodes = data.nodes;
  const positions = computeSafeBranchPositions(sourceRect, nodes.length, key);
  const cardH = 76;

  // Draw organic curves & place cards
  positions.forEach((pos, i) => {
    const node = nodes[i];
    if (!node) return;

    const x1 = pos.x;
    const y1 = pos.y + cardH / 2; // Attach branch to vertical middle-left of card

    // SVG Branch Path (Clean sharp white, no fuzzy glow)
    const branchPath = createBranchPath(x0, y0, x1, y1, false);
    branchTreeSvg.appendChild(branchPath);

    // Fork Dot at card attachment
    const dot = createBranchDot(x1, y1, false);
    branchTreeSvg.appendChild(dot);

    // Leaf Card Element
    const card = document.createElement('a');
    card.className = 'tree-leaf-card';
    card.href = node.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    card.style.animationDelay = `${i * 0.04}s`;
    card.dataset.nodeId = node.id;

    // Format clean details text without pills or brown boxes
    let detailText = '';
    if (key === 'github') {
      detailText = node.tag || '';
    } else if (key === 'spotify') {
      detailText = node.subtitle || (node.subBranches ? `${node.subBranches.length} songs` : 'Playlist');
    } else if (key === 'myanimelist') {
      detailText = node.subtitle || 'Completed';
    } else if (key === 'youtube') {
      detailText = node.subtitle || 'Channel';
    } else if (key === 'reddit' || key === 'steam' || key === 'telegram') {
      detailText = node.subtitle || node.tag || '';
    }

    card.innerHTML = `
      <div class="card-head">
        <span class="card-title">${escapeHtml(node.title)}</span>
        <span class="card-arrow">↗</span>
      </div>
      ${node.subtitle ? `<div class="card-desc">${escapeHtml(node.subtitle)}</div>` : ''}
      ${detailText && detailText !== node.subtitle ? `<div class="card-detail">${escapeHtml(detailText)}</div>` : ''}
    `;

    // Sub-branch interaction on primary node hover
    card.addEventListener('mouseenter', () => {
      cancelBranchHide();
      if (node.subBranches && node.subBranches.length > 0) {
        renderSubBranches(card, node.subBranches, key);
      } else {
        removeSubBranches();
      }
    });

    card.addEventListener('mouseleave', () => {
      // Small grace delay before removing sub-branch unless hovering into sub-branch
      subBranchHideTimeout = setTimeout(() => {
        if (!isCursorInSubBranches()) {
          removeSubBranches();
        }
      }, 180);
    });

    branchNodesContainer.appendChild(card);
  });
}

// Render secondary sub-branches (songs for playlist, commits for repo)
function renderSubBranches(parentCardElem, subList, key) {
  removeSubBranches();
  activeSubBranchCard = parentCardElem;

  const parentRect = parentCardElem.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const linksGridElem = document.getElementById('links-grid');
  const gridRect = linksGridElem ? linksGridElem.getBoundingClientRect() : null;

  const subCardW = 205;
  const subCardH = 46;
  const subGap = 8;
  const maxSubs = Math.min(subList.length, 4);

  // Determine sprout direction: right or flip to left if near edge
  let sproutRight = true;
  if (parentRect.right + 30 + subCardW > vw - 16) {
    sproutRight = false;
  }

  let subStartX;
  let sx0, sy0, targetAttachX;

  if (sproutRight) {
    sx0 = parentRect.right;
    sy0 = parentRect.top + parentRect.height / 2;
    subStartX = sx0 + 32;
    targetAttachX = subStartX;
  } else {
    sx0 = parentRect.left;
    sy0 = parentRect.top + parentRect.height / 2;
    subStartX = Math.max(gridRect ? gridRect.right + 20 : 20, sx0 - subCardW - 32);
    targetAttachX = subStartX + subCardW;
  }

  let startSubY = parentRect.top - 8;
  if (startSubY + maxSubs * (subCardH + subGap) > vh - 20) {
    startSubY = Math.max(20, vh - 20 - maxSubs * (subCardH + subGap));
  }

  subList.slice(0, maxSubs).forEach((sub, idx) => {
    const subY = startSubY + idx * (subCardH + subGap);
    const targetAttachY = subY + subCardH / 2;

    // Secondary curved branch line
    const subLine = createBranchPath(sx0, sy0, targetAttachX, targetAttachY, true);
    subLine.classList.add('active-sub-line');
    branchTreeSvg.appendChild(subLine);

    // Dot at sub-attachment
    const subDot = createBranchDot(targetAttachX, targetAttachY, true);
    subDot.classList.add('active-sub-dot');
    branchTreeSvg.appendChild(subDot);

    // Sub-leaf Card
    const subCard = document.createElement('a');
    subCard.className = 'tree-leaf-subcard active-sub-card';
    subCard.href = sub.url || '#';
    subCard.target = '_blank';
    subCard.rel = 'noopener noreferrer';
    subCard.style.left = `${subStartX}px`;
    subCard.style.top = `${subY}px`;
    subCard.style.animationDelay = `${idx * 0.04}s`;

    subCard.innerHTML = `
      <div class="sub-title">${escapeHtml(sub.title)}</div>
      ${sub.artist ? `<div class="sub-artist">${escapeHtml(sub.artist)}</div>` : ''}
      <div class="sub-meta">
        <span>${escapeHtml(sub.duration || '')}</span>
        <span>↗</span>
      </div>
    `;

    subCard.addEventListener('mouseenter', () => {
      cancelBranchHide();
      if (subBranchHideTimeout) clearTimeout(subBranchHideTimeout);
    });

    subCard.addEventListener('mouseleave', () => {
      scheduleBranchHide(240);
    });

    branchNodesContainer.appendChild(subCard);
  });
}

function removeSubBranches() {
  if (branchTreeSvg) {
    branchTreeSvg.querySelectorAll('.active-sub-line, .active-sub-dot').forEach(el => el.remove());
  }
  if (branchNodesContainer) {
    branchNodesContainer.querySelectorAll('.active-sub-card').forEach(el => el.remove());
  }
  activeSubBranchCard = null;
}

function isCursorInSubBranches() {
  const subCards = document.querySelectorAll('.active-sub-card:hover');
  return subCards.length > 0;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── MOBILE INTERACTIVE BRANCH DRAWER ENGINE ─────────────────────────────────
function openMobileBranchModal(key) {
  const data = BRANCH_DATA[key];
  if (!data) return;

  if (mobileBranchTitle) mobileBranchTitle.textContent = data.title;
  if (mobileBranchBadge) mobileBranchBadge.textContent = data.badge;

  if (mobileBranchContent) {
    mobileBranchContent.innerHTML = '';

    // Direct profile reachout button
    const directBtn = document.createElement('a');
    directBtn.className = 'spotify-btn primary-pill';
    directBtn.href = data.profileUrl || '#';
    directBtn.target = '_blank';
    directBtn.rel = 'noopener noreferrer';
    directBtn.style.alignSelf = 'flex-start';
    directBtn.style.marginBottom = '12px';
    directBtn.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        ${data.icon || ''}
        <span>Visit ${escapeHtml(data.badge)} Profile ↗</span>
      </span>
    `;
    mobileBranchContent.appendChild(directBtn);

    // List branches with expandable accordions
    data.nodes.forEach((node) => {
      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'mobile-branch-node-card';

      const hasSubs = node.subBranches && node.subBranches.length > 0;
      const expandIcon = hasSubs ? `<span class="mobile-expand-indicator" style="font-size:11px;color:rgba(232,226,217,0.55);margin-left:auto;">${node.subBranches.length} items ▾</span>` : `<span style="font-size:11px;opacity:0.6;margin-left:auto;">↗</span>`;

      nodeWrapper.innerHTML = `
        <div class="mobile-node-main" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:#ffffff;">${escapeHtml(node.title)}</div>
            <div style="font-size:11px;color:#b5aba0;margin-top:2px;">${escapeHtml(node.subtitle)}</div>
          </div>
          ${expandIcon}
        </div>
      `;

      if (hasSubs) {
        const subListElem = document.createElement('div');
        subListElem.className = 'mobile-sub-list';
        subListElem.style.display = 'flex'; // Expanded by default on mobile for easy browsing

        node.subBranches.forEach(sub => {
          const subA = document.createElement('a');
          subA.href = sub.url || '#';
          subA.target = '_blank';
          subA.rel = 'noopener noreferrer';
          subA.style.display = 'flex';
          subA.style.alignItems = 'center';
          subA.style.justifyContent = 'space-between';
          subA.style.padding = '6px 8px';
          subA.style.background = 'rgba(255,255,255,0.03)';
          subA.style.borderRadius = '6px';
          subA.style.textDecoration = 'none';
          subA.style.color = '#e8e2d9';
          subA.innerHTML = `
            <div>
              <span style="font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#ffffff;display:block;">${escapeHtml(sub.title)}</span>
              <span style="font-size:10px;color:#8c8276;">${escapeHtml(sub.artist || '')}</span>
            </div>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(232,226,217,0.55);">${escapeHtml(sub.duration || 'play ↗')}</span>
          `;
          subListElem.appendChild(subA);
        });

        // Toggle expand/collapse on header click
        const mainHeader = nodeWrapper.querySelector('.mobile-node-main');
        mainHeader.addEventListener('click', (e) => {
          e.preventDefault();
          const isCollapsed = subListElem.style.display === 'none';
          subListElem.style.display = isCollapsed ? 'flex' : 'none';
          const ind = mainHeader.querySelector('.mobile-expand-indicator');
          if (ind) ind.textContent = isCollapsed ? `${node.subBranches.length} items ▾` : `${node.subBranches.length} items ▸`;
        });

        nodeWrapper.appendChild(subListElem);
      } else {
        nodeWrapper.style.cursor = 'pointer';
        nodeWrapper.addEventListener('click', () => {
          window.open(node.url, '_blank', 'noopener,noreferrer');
        });
      }

      mobileBranchContent.appendChild(nodeWrapper);
    });
  }

  if (mobileBranchModal) {
    mobileBranchModal.classList.add('active');
    mobileBranchModal.setAttribute('aria-hidden', 'false');
  }
}

function closeMobileBranchModal() {
  if (mobileBranchModal) {
    mobileBranchModal.classList.remove('active');
    mobileBranchModal.setAttribute('aria-hidden', 'true');
  }
}

if (mobileBranchClose) mobileBranchClose.addEventListener('click', closeMobileBranchModal);
if (mobileBranchBackdrop) mobileBranchBackdrop.addEventListener('click', closeMobileBranchModal);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileBranchModal();
});

// ── HOOK INTO LINK ROWS & DESKTOP/MOBILE EVENT DISPATCHER ───────────────────
function initBranchTreeSystem() {
  const linkRows = document.querySelectorAll('.link-row');

  linkRows.forEach(row => {
    const key = row.dataset.key || row.querySelector('.name')?.textContent?.trim().toLowerCase();
    if (!key || !BRANCH_DATA[key]) return;

    // Desktop hover interactions
    row.addEventListener('mouseenter', () => {
      if (isMobile() || window.matchMedia('(pointer: coarse)').matches) return;
      cancelBranchHide();
      // Brief debounce for silky smooth feel
      setTimeout(() => {
        if (row.matches(':hover')) {
          activeBranchKey = key;
          activeBranchSourceElem = row;
          document.querySelectorAll('.link-row.branch-active').forEach(el => el.classList.remove('branch-active'));
          row.classList.add('branch-active');
          if (branchTreeOverlay) branchTreeOverlay.classList.add('active');
          syncLivePlayingTrackToSpotifyBranch();
          renderPrimaryBranches(key, row);
        }
      }, 35);
    });

    row.addEventListener('mouseleave', () => {
      if (isMobile() || window.matchMedia('(pointer: coarse)').matches) return;
      scheduleBranchHide(280);
    });

    // Mobile touch & hold / tap interactions
    let touchHoldTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;

    row.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      touchHoldTimer = setTimeout(() => {
        if (navigator.vibrate) {
          try { navigator.vibrate([40, 20, 40]); } catch (_) {}
        }
        openMobileBranchModal(key);
      }, 380);
    }, { passive: true });

    row.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (Math.abs(touch.clientX - touchStartX) > 12 || Math.abs(touch.clientY - touchStartY) > 12) {
        if (touchHoldTimer) {
          clearTimeout(touchHoldTimer);
          touchHoldTimer = null;
        }
      }
    }, { passive: true });

    row.addEventListener('touchend', () => {
      if (touchHoldTimer) {
        clearTimeout(touchHoldTimer);
        touchHoldTimer = null;
      }
    }, { passive: true });

    // Click fallback: on mobile devices, open the branch drawer
    row.addEventListener('click', (e) => {
      if (isMobile() || window.matchMedia('(pointer: coarse)').matches) {
        e.preventDefault();
        openMobileBranchModal(key);
      }
    });
  });

  // Keep branch alive when mouse hovers into SVG/Nodes container
  if (branchTreeOverlay) {
    branchTreeOverlay.addEventListener('mouseenter', cancelBranchHide);
    branchTreeOverlay.addEventListener('mouseleave', () => scheduleBranchHide(220));
  }

  // Handle window resize dynamically
  window.addEventListener('resize', () => {
    updateBranchSvgDimensions();
    if (activeBranchKey && activeBranchSourceElem && !isMobile()) {
      renderPrimaryBranches(activeBranchKey, activeBranchSourceElem);
    }
  }, { passive: true });

  // Hide branch when scrolling to prevent floating misalignment
  const onScrollHide = () => {
    if (activeBranchKey) {
      hideBranchTree();
    }
  };
  if (aestheticRoot) aestheticRoot.addEventListener('scroll', onScrollHide, { passive: true });
  window.addEventListener('scroll', onScrollHide, { passive: true });

  // Start background live sync across real data sources
  syncRealDataSources();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBranchTreeSystem);
} else {
  initBranchTreeSystem();
}

