const PRM = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let canvas, ctx, dpr;
let running = false;
// Idle baseline so the visualizer is visible before any track plays.
// Ramps to ~1.0 on PLAY, back to IDLE on PAUSE/FINISH.
const IDLE_INTENSITY = 0.55;
let intensity = 0;        // 0..1, current amplitude
let intensityTarget = IDLE_INTENSITY;
let positionMs = 0;       // last reported playback position
let mouseX = 0.5, mouseY = 0.5;
let t0 = performance.now();

const BANDS = 48;         // pseudo-spectrum buckets
const phases = Array.from({ length: BANDS }, () => Math.random() * Math.PI * 2);
const speeds = Array.from({ length: BANDS }, () => 0.4 + Math.random() * 1.2);

function readBrandColors() {
  const cs = getComputedStyle(document.documentElement);
  const primary = cs.getPropertyValue('--primary').trim() || '#ff5500';
  const secondary = cs.getPropertyValue('--primary-hover').trim() || '#ff7700';
  // Derive an "accent" — slightly cooler/darker variant for back layer
  return { primary, secondary, accent: secondary };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function frame() {
  if (!running) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const t = (performance.now() - t0) / 1000;

  // Ease intensity toward target — fade in on play, fade out on pause
  intensity += (intensityTarget - intensity) * 0.04;

  ctx.clearRect(0, 0, w, h);

  if (intensity < 0.001) {
    requestAnimationFrame(frame);
    return;
  }

  const colors = readBrandColors();

  // Three parallax layers — back to front, each more reactive
  drawLayer(w, h, t, colors.accent,    0.20, 0.18 * intensity, 0.35);
  drawLayer(w, h, t, colors.secondary, 0.45, 0.28 * intensity, 0.65);
  drawLayer(w, h, t, colors.primary,   0.70, 0.38 * intensity, 1.00);

  requestAnimationFrame(frame);
}

// Draw one parallax band layer.
//   speedMul   — how fast this layer drifts (parallax depth)
//   alpha      — base opacity for this layer
//   reactivity — 0..1 multiplier on per-band amplitude
function drawLayer(w, h, t, color, speedMul, alpha, reactivity) {
  const baseY = h * 0.5;
  const bandWidth = w / BANDS;
  // Parallax offset from mouse — back layers move less
  const parallaxX = (mouseX - 0.5) * 40 * speedMul;
  const parallaxY = (mouseY - 0.5) * 24 * speedMul;

  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;

  for (let i = 0; i < BANDS; i++) {
    // Pseudo-spectrum: stacked sines with per-band phase + speed
    const phase = phases[i] + t * speeds[i] * speedMul;
    const noise =
      Math.sin(phase * 1.0) * 0.5 +
      Math.sin(phase * 2.3 + i * 0.31) * 0.3 +
      Math.sin(phase * 0.7 + i * 0.17) * 0.2;
    const amp = (0.5 + noise * 0.5) * reactivity;

    // Bell curve weighting — center bands are louder, like a real EQ
    const center = BANDS / 2;
    const bell = Math.exp(-Math.pow((i - center) / (BANDS * 0.35), 2));
    const barH = h * 0.55 * amp * bell;

    const x = i * bandWidth + parallaxX;
    const y = baseY - barH / 2 + parallaxY;

    // Rounded rectangle
    const bw = bandWidth * 0.6;
    const r = Math.min(bw / 2, 6);
    roundRect(ctx, x + (bandWidth - bw) / 2, y, bw, barH, r);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function roundRect(c, x, y, w, h, r) {
  if (h < 2 * r) r = h / 2;
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y,     x + w, y + h, r);
  c.arcTo(x + w, y + h, x,     y + h, r);
  c.arcTo(x,     y + h, x,     y,     r);
  c.arcTo(x,     y,     x + w, y,     r);
  c.closePath();
}

function start() {
  if (running) return;
  running = true;
  requestAnimationFrame(frame);
}

// Public API
export function initVisualizer() {
  if (PRM) return; // honor reduced-motion users — no animation
  canvas = document.getElementById('visualizer');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });
  // Touch parallax for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 0) return;
    mouseX = e.touches[0].clientX / window.innerWidth;
    mouseY = e.touches[0].clientY / window.innerHeight;
  }, { passive: true });
  start();
}

// Hook a SoundCloud widget iframe — must run AFTER the iframe is in DOM
// AND after w.soundcloud.com/player/api.js has loaded.
export function bindToSoundCloudWidget(iframeEl, opts = {}) {
  if (!iframeEl || !window.SC || !window.SC.Widget) return;
  const widget = window.SC.Widget(iframeEl);
  const Events = window.SC.Widget.Events;

  widget.bind(Events.PLAY,  () => { if (!PRM) intensityTarget = 1; });
  widget.bind(Events.PAUSE, () => { if (!PRM) intensityTarget = IDLE_INTENSITY; });
  widget.bind(Events.FINISH, () => {
    if (!PRM) intensityTarget = IDLE_INTENSITY;
    if (typeof opts.onFinish === 'function') opts.onFinish();
  });
  widget.bind(Events.PLAY_PROGRESS, (e) => {
    // Use position delta as a subtle modulation — long mixes still feel alive
    const newPos = e.currentPosition || 0;
    if (newPos !== positionMs) {
      positionMs = newPos;
      // Slight beat-like wobble: every ~2s nudge intensity
      const beat = Math.sin(positionMs / 500) * 0.08;
      intensityTarget = Math.max(0.85, Math.min(1.0, 0.92 + beat));
    }
  });
}
