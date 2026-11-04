/* ─────────────────────────────────────────
   sahil.exe · portfolio script
   Dark/light theme · cursor trail · matrix
   uptime · draggable windows · skill bars
   ✳ = dino.exe runner game
   ───────────────────────────────────────── */

/* ══════════════════════════════════════
   REFS
══════════════════════════════════════ */
const terminal       = document.querySelector("#terminal");
const desktop        = document.querySelector("#portfolio");
const promptRow      = document.querySelector("#promptRow");
const countdown      = document.querySelector("#countdown");
const bootError      = document.querySelector("#bootError");
const clock          = document.querySelector("#clock");
const creativeToggle = document.querySelector("#creativeToggle");  // ✳ = dino launcher
const dockCaption    = document.querySelector(".dock-caption");
const themeToggle    = document.querySelector("#themeToggle");
const uptimeBadge    = document.querySelector("#uptime");

let started     = false;
let promptReady = false;
let windowLayer = 4;

/* ══════════════════════════════════════
   THEME  (dark / light)
══════════════════════════════════════ */
const THEME_KEY = "sahil-theme";

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

let currentTheme = getInitialTheme();

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) themeToggle.textContent = theme === "dark" ? "☾ DARK" : "☀ LIGHT";
}

applyTheme(currentTheme);
themeToggle?.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ══════════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════════ */
setTimeout(() => {
  promptReady = true;
  promptRow.classList.add("visible");
  terminal.focus();
}, 1750);

function openDesktop() {
  terminal.classList.add("done");
  desktop.classList.add("visible");
  document.body.style.background = "";
  window.scrollTo({ top: 0, behavior: "instant" });
  startUptimeCounter();
  startCursorTrail();
}

function boot() {
  if (started) return;
  started = true;
  let count = 3;
  addCountdownLine(`${count}..`);
  const timer = setInterval(() => {
    count -= 1;
    if (count > 0) { addCountdownLine(`${count}${count === 2 ? "." : ""}`); return; }
    clearInterval(timer);
    bootError.style.display = "block";
    terminal.classList.add("shake", "lag");
    setTimeout(openDesktop, 1150);
  }, 720);
}

function addCountdownLine(v) {
  const d = document.createElement("div");
  d.textContent = `visitor@sahil.portfolio: $ ${v}`;
  countdown.appendChild(d);
}

function handleEnter(e) {
  if (e.key !== "Enter" || e.repeat || !promptReady) return;
  e.preventDefault(); boot();
}
window.addEventListener("keydown", handleEnter);
// click anywhere on terminal = boot
terminal.addEventListener("click", () => { terminal.focus(); if (promptReady) boot(); });
// also boot on any keypress (space, arrow etc) not just Enter
terminal.addEventListener("keydown", e => {
  if (!promptReady) return;
  if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
    e.preventDefault(); boot();
  }
});

/* ══════════════════════════════════════
   UPTIME COUNTER
══════════════════════════════════════ */
function startUptimeCounter() {
  const start = Date.now();
  function tick() {
    const s   = Math.floor((Date.now() - start) / 1000);
    const d   = Math.floor(s / 86400);
    const h   = Math.floor((s % 86400) / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    uptimeBadge.textContent = `UPTIME: ${d}d ${h}h ${m}m ${sec}s`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════
   LIVE CLOCK
══════════════════════════════════════ */
function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("en", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);

/* ══════════════════════════════════════
   WINDOW MANAGEMENT
══════════════════════════════════════ */
function bringToFront(win) { win.style.zIndex = `${++windowLayer}`; }

function showWindow(id) {
  const t = document.querySelector(`#${id}`);
  if (!t) return;
  if (t.id === "computer-window") t.style.display = "block";
  t.classList.remove("minimizing");
  t.classList.add("open");
  bringToFront(t);
  // auto-start dino when its window opens
  if (id === "dino-window") setTimeout(initDino, 80);
}

document.querySelectorAll("[data-window]").forEach(c => {
  c.addEventListener("click", () => showWindow(c.dataset.window));
});

document.querySelectorAll(".window").forEach(w => {
  w.addEventListener("pointerdown", () => bringToFront(w));
});

document.querySelectorAll(".close-window").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const w = btn.closest(".window");
    w.classList.add("minimizing");
    // pause dino if its window closes
    if (w.id === "dino-window") dinoRunning = false;
    setTimeout(() => {
      w.classList.remove("minimizing");
      if (w.id === "computer-window") w.style.display = "none";
      else w.classList.remove("open");
    }, 220);
  });
});

/* ── Draggable windows ── */
function makeDraggable(win) {
  const bar = win.querySelector(".window-titlebar");
  if (!bar) return;
  let drag = false, ox = 0, oy = 0;

  bar.addEventListener("pointerdown", e => {
    if (e.target.closest(".close-window") || e.target.closest(".traffic-lights")) return;
    drag = true;
    bringToFront(win);
    const r = win.getBoundingClientRect();
    win.style.left = r.left + "px"; win.style.top = r.top + "px";
    win.style.right = "auto"; win.style.bottom = "auto";
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    bar.style.cursor = "grabbing";
    e.preventDefault();
  });

  window.addEventListener("pointermove", e => {
    if (!drag) return;
    let nx = e.clientX - ox, ny = e.clientY - oy;
    nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
    ny = Math.max(34, Math.min(ny, window.innerHeight - win.offsetHeight));
    win.style.left = nx + "px"; win.style.top = ny + "px";
  });

  window.addEventListener("pointerup", () => { drag = false; bar.style.cursor = "grab"; });
  bar.style.cursor = "grab";
}
document.querySelectorAll(".window").forEach(makeDraggable);

/* ══════════════════════════════════════
   ✳ BUTTON → OPEN DINO GAME
   (what it does: launches dino.exe window)
══════════════════════════════════════ */
creativeToggle?.addEventListener("click", () => {
  showWindow("dino-window");
});

/* ══════════════════════════════════════
   CURSOR PARTICLE TRAIL
══════════════════════════════════════ */
let trailCanvas, trailCtx, trailParticles = [];

function startCursorTrail() {
  trailCanvas = document.createElement("canvas");
  trailCanvas.id = "cursor-trail";
  document.body.appendChild(trailCanvas);

  function resize() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
    trailCtx = trailCanvas.getContext("2d");
  }
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("mousemove", e => {
    if (!desktop.classList.contains("visible")) return;
    const cols = currentTheme === "dark"
      ? ["#39f0c4","#f3bd62","#ff6659","#a8ff9c"]
      : ["#0d8c6e","#b07a10","#cc2a1e","#1a6a5a"];
    for (let i = 0; i < 3; i++) {
      trailParticles.push({
        x: e.clientX + (Math.random()-.5)*8,
        y: e.clientY + (Math.random()-.5)*8,
        vx: (Math.random()-.5)*1.5,
        vy: (Math.random()-1)*1.5,
        life: 1, decay: .04+Math.random()*.04,
        size: 2+Math.random()*3,
        color: cols[Math.floor(Math.random()*cols.length)],
      });
    }
  });

  (function renderTrail() {
    if (trailCtx) {
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailParticles = trailParticles.filter(p => p.life > 0);
      for (const p of trailParticles) {
        trailCtx.globalAlpha = p.life;
        trailCtx.fillStyle   = p.color;
        trailCtx.beginPath();
        trailCtx.arc(p.x, p.y, p.size*p.life, 0, Math.PI*2);
        trailCtx.fill();
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      }
      trailCtx.globalAlpha = 1;
    }
    requestAnimationFrame(renderTrail);
  })();
}

/* ══════════════════════════════════════
   FINDER MENU — Matrix dropdown
══════════════════════════════════════ */
const matrixMenuBtn  = document.getElementById("matrixMenuBtn");
const matrixTrigger  = document.getElementById("matrixTrigger");
const matrixDropdown = document.getElementById("matrixDropdown");

// toggle dropdown on button click
matrixMenuBtn?.addEventListener("click", e => {
  e.stopPropagation();
  matrixMenuBtn.classList.toggle("open");
});

// click "System Override" → fire matrix
matrixTrigger?.addEventListener("click", e => {
  e.stopPropagation();
  matrixMenuBtn.classList.remove("open");
  toggleMatrix();
});

// close dropdown when clicking anywhere else
document.addEventListener("click", () => {
  matrixMenuBtn?.classList.remove("open");
});

/* ══════════════════════════════════════
   KONAMI CODE → MATRIX RAIN (keyboard fallback)
   ↑ ↑ ↓ ↓ ← → ← → B A
══════════════════════════════════════ */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiIdx = 0, matrixActive = false;
let matrixCanvas, matrixCtx2, matrixRAF, matrixCols, matrixDrops;

// listen on document so it works anywhere — only skip terminal input box
document.addEventListener("keydown", e => {
  if (e.target.id === "term-input") return;          // typing in terminal
  if (terminal && !terminal.classList.contains("done")) return; // boot screen
  if (e.key === KONAMI[konamiIdx]) {
    if (++konamiIdx === KONAMI.length) { konamiIdx = 0; toggleMatrix(); }
  } else { konamiIdx = 0; }
});

function toggleMatrix() { matrixActive = !matrixActive; matrixActive ? startMatrix() : stopMatrix(); }

function startMatrix() {
  matrixCanvas = document.createElement("canvas");
  matrixCanvas.id = "matrix-rain";
  matrixCanvas.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:auto;cursor:pointer;opacity:0;transition:opacity .4s;";
  document.body.appendChild(matrixCanvas);
  matrixCanvas.addEventListener("click", toggleMatrix);
  resizeMatrix();
  window.addEventListener("resize", resizeMatrix);
  requestAnimationFrame(() => { matrixCanvas.style.opacity = "1"; });
  const hint = document.createElement("div");
  hint.id = "matrix-hint";
  hint.textContent = "// SYSTEM OVERRIDE · click anywhere to exit //";
  hint.style.cssText = "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:10000;font:12px 'DM Mono',monospace;color:#39f0c4;pointer-events:none;letter-spacing:.12em;text-shadow:0 0 10px #39f0c4;";
  document.body.appendChild(hint);
  tickMatrix();
}
function resizeMatrix() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth; matrixCanvas.height = window.innerHeight;
  matrixCtx2 = matrixCanvas.getContext("2d");
  matrixCols = Math.floor(matrixCanvas.width / 14);
  matrixDrops = Array(matrixCols).fill(1);
}
function tickMatrix() {
  if (!matrixActive) return;
  const fs = 14, chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01ABCDEF!@#$%^&*<>{}[]";
  matrixCtx2.fillStyle = "rgba(3,9,11,.18)";
  matrixCtx2.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
  matrixCtx2.font = `${fs}px "DM Mono",monospace`;
  for (let i = 0; i < matrixDrops.length; i++) {
    const ch = chars[Math.floor(Math.random()*chars.length)];
    matrixCtx2.fillStyle = matrixDrops[i]*fs < 60 ? "#39f0c4" : `hsl(${155+Math.random()*20},90%,${45+Math.random()*25}%)`;
    matrixCtx2.fillText(ch, i*fs, matrixDrops[i]*fs);
    if (matrixDrops[i]*fs > matrixCanvas.height && Math.random()>.975) matrixDrops[i] = 0;
    matrixDrops[i]++;
  }
  matrixRAF = requestAnimationFrame(tickMatrix);
}
function stopMatrix() {
  if (matrixCanvas) { matrixCanvas.style.opacity="0"; setTimeout(()=>{ matrixCanvas?.remove(); matrixCanvas=null; },400); }
  document.getElementById("matrix-hint")?.remove();
  cancelAnimationFrame(matrixRAF);
  window.removeEventListener("resize", resizeMatrix);
}

/* ══════════════════════════════════════
   SKILL BARS
══════════════════════════════════════ */
function animateSkillBars(win) {
  win.querySelectorAll(".skill-bar-fill").forEach(bar => {
    const t = bar.dataset.pct || "0";
    bar.style.width = "0%";
    setTimeout(() => { bar.style.width = t + "%"; }, 80);
  });
}
const skillsWin = document.querySelector("#skills-window");
new MutationObserver(() => {
  if (skillsWin.classList.contains("open")) animateSkillBars(skillsWin);
}).observe(skillsWin, { attributes: true, attributeFilter: ["class"] });

/* ══════════════════════════════════════════════════════════════
   DINO.EXE  ——  FULL RUNNER GAME ENGINE
   ─────────────────────────────────────────────────────────────
   Controls:
     Space / ↑        → Jump (press again in air = double jump)
     ↓                → Duck (hold)
     Tap/Click canvas → Jump / Restart

   Obstacles:
     Cactus S/M/L/XL/Cluster  — jump over
     Bird low                  — jump over or duck under
     Bird high                 — duck under if close
     Boulder                   — MUST jump (rolls on ground)
     Stalactite                — MUST duck (hangs from ceiling)
     Pit (gap in ground)       — MUST jump

   Milestones: every 100 pts flash + speed message
   Day/Night cycle every 400 pts
══════════════════════════════════════════════════════════════ */

/* ─── state ─── */
let dinoRunning  = false;
let dinoStarted  = false;
let dinoRAF      = null;
let dinoScore    = 0;
let dinoHi       = parseInt(localStorage.getItem("dino-hi") || "0", 10);
let dinoSpeed    = 0;
let dinoFrame    = 0;
let dinoGameOver = false;
let doubleJumped = false;
let flashMsg     = "";
let flashTimer   = 0;
let nightCycle   = false;       // toggles every 400 pts
let lastNightAt  = -1;
let speedStage   = 0;           // 0–5, changes colour cues

let DC, DX;                     // canvas + context

/* ─── canvas constants ─── */
const GY      = 175;   // ground Y
const DINO_X  = 62;
const GRAVITY = 0.60;
const JUMP_V  = -12.5;
const DJUMP_V = -10.0;
const DUCK_H  = 22;
const STAND_H = 42;
const DINO_W  = 32;

/* ─── dino object ─── */
const dino = {
  y: GY, vy: 0,
  ducking: false, onGround: true,
  legFrame: 0, legTick: 0,
  hitFlash: 0,   // frames of red flash on near miss (unused, reserved)
};

/* ─── obstacle + scenery pools ─── */
let obstacles     = [];
let obsTimer      = 0;
let nextObsIn     = 100;
let clouds        = [];
let stars         = [];          // shown at night
let groundPits    = [];          // visual gaps in ground strip

/* ─── score / UI elements ─── */
let scoreEl, hiEl, hintEl;

/* ═══════════════════════════
   INIT — called on window open
═══════════════════════════ */
function initDino() {
  DC = document.getElementById("dino-canvas");
  if (!DC) return;
  DX = DC.getContext("2d");
  scoreEl = document.getElementById("dino-score");
  hiEl    = document.getElementById("dino-hi");
  hintEl  = document.getElementById("dino-hint");

  hiEl.textContent    = dinoHi;
  hintEl.textContent  = "PRESS SPACE / ↑ / TAP TO START";
  hintEl.style.display = "block";

  cancelAnimationFrame(dinoRAF);

  // full reset
  dinoRunning  = false;
  dinoStarted  = false;
  dinoGameOver = false;
  dinoScore    = 0;
  dinoSpeed    = 4.5;
  dinoFrame    = 0;
  doubleJumped = false;
  flashMsg     = "";
  flashTimer   = 0;
  nightCycle   = false;
  lastNightAt  = -1;
  speedStage   = 0;
  obstacles    = [];
  groundPits   = [];
  obsTimer     = 0;
  nextObsIn    = 100;
  dino.y       = GY;
  dino.vy      = 0;
  dino.ducking = false;
  dino.onGround = true;
  dino.legFrame = 0;
  dino.legTick  = 0;

  clouds = [
    { x:200, y:35, w:65, h:15 },
    { x:450, y:20, w:50, h:12 },
    { x:600, y:45, w:40, h:10 },
  ];
  stars = Array.from({length:40}, () => ({
    x: Math.random() * 700,
    y: Math.random() * 120,
    r: Math.random() < 0.3 ? 1.5 : 1,
  }));

  renderFrame();

  document.addEventListener("keydown", dinoKeyDown);
  DC.addEventListener("pointerdown", dinoTap);
}

/* ─── Input ─── */
function dinoKeyDown(e) {
  if (!document.querySelector("#dino-window")?.classList.contains("open")) return;
  if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault(); dinoJump();
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!dinoGameOver && dinoStarted) { dino.ducking = true; }
  }
}
window.addEventListener("keyup", e => {
  if (e.key === "ArrowDown") dino.ducking = false;
});
function dinoTap() { dinoJump(); }

function dinoJump() {
  if (dinoGameOver) { initDino(); dinoStart(); return; }
  if (!dinoStarted) { dinoStart(); return; }
  if (dino.onGround) {
    dino.vy       = JUMP_V;
    dino.onGround = false;
    dino.ducking  = false;
    doubleJumped  = false;
  } else if (!doubleJumped) {
    // double jump — slightly weaker
    dino.vy      = DJUMP_V;
    doubleJumped = true;
  }
}

function dinoStart() {
  if (dinoRunning) return;
  dinoStarted  = true;
  dinoRunning  = true;
  hintEl.style.display = "none";
  dinoLoop();
}

/* ═══════════════════════════
   GAME LOOP
═══════════════════════════ */
function dinoLoop() {
  if (!dinoRunning) return;
  dinoFrame++;
  updateGame();
  renderFrame();
  dinoRAF = requestAnimationFrame(dinoLoop);
}

/* ═══════════════════════════
   UPDATE
═══════════════════════════ */
function updateGame() {
  /* ── score ── */
  dinoScore = Math.floor(dinoFrame / 5);
  if (scoreEl) scoreEl.textContent = dinoScore;
  if (dinoScore > dinoHi) {
    dinoHi = dinoScore;
    localStorage.setItem("dino-hi", dinoHi);
    if (hiEl) hiEl.textContent = dinoHi;
  }

  /* ── speed curve ──
     Starts at 4.5, reaches ~14 around score 800.
     Smooth curve: speed = base + k * sqrt(score)          */
  dinoSpeed = 4.5 + 0.33 * Math.sqrt(dinoScore);

  /* ── speed stage (for colour shifts + messages) ── */
  const newStage = Math.min(5, Math.floor(dinoScore / 150));
  if (newStage > speedStage) {
    speedStage = newStage;
    flashMsg   = ["FASTER!", "SPEED UP!", "DANGER!", "CRITICAL!", "MAX SPEED!"][speedStage - 1] || "!!";
    flashTimer = 90;
  }

  /* ── milestone flash every 100 pts ── */
  if (dinoScore > 0 && dinoScore % 100 === 0 && flashTimer === 0) {
    flashMsg   = `${dinoScore}!`;
    flashTimer = 60;
  }
  if (flashTimer > 0) flashTimer--;

  /* ── day / night toggle every 400 pts ── */
  const nightPhase = Math.floor(dinoScore / 400);
  if (nightPhase !== lastNightAt) {
    lastNightAt = nightPhase;
    nightCycle  = !nightCycle;
  }

  /* ── physics ── */
  if (!dino.onGround) {
    dino.vy += GRAVITY;
    dino.y  += dino.vy;
    if (dino.y >= GY) {
      dino.y       = GY;
      dino.vy      = 0;
      dino.onGround = true;
      doubleJumped  = false;
    }
  }

  /* ── leg animation ── */
  if (dino.onGround && !dino.ducking) {
    if (++dino.legTick > Math.max(2, 7 - Math.floor(dinoSpeed / 3))) {
      dino.legFrame = 1 - dino.legFrame;
      dino.legTick  = 0;
    }
  }

  /* ── clouds ── */
  for (const c of clouds) c.x -= dinoSpeed * 0.25;
  clouds = clouds.filter(c => c.x + c.w > -10);
  if (clouds.length < 4 && Math.random() < 0.012) {
    clouds.push({
      x: DC.width + 30,
      y: 15 + Math.random() * 60,
      w: 38 + Math.random() * 55,
      h: 10 + Math.random() * 10,
    });
  }

  /* ── obstacles ── */
  obsTimer++;
  // minimum gap shrinks with score (harder)
  const minGap = Math.max(45, 110 - Math.floor(dinoScore / 12));
  if (obsTimer >= nextObsIn) {
    obsTimer  = 0;
    nextObsIn = minGap + Math.floor(Math.random() * 60);
    spawnObstacle();
  }
  for (const ob of obstacles) {
    ob.x -= dinoSpeed;
    // stalactites fall
    if (ob.type === "stala" && ob.falling) {
      ob.vy    = (ob.vy || 0) + 0.4;
      ob.fy    = (ob.fy || 0) + ob.vy;
      ob.drawY = ob.ceilY + ob.fy;
      if (ob.drawY + ob.h >= GY) { ob.drawY = GY - ob.h; ob.vy = 0; ob.fallen = true; }
    }
    // trigger stalactite fall when near dino
    if (ob.type === "stala" && !ob.falling && ob.x < DINO_X + 120 && ob.x > DINO_X - 40) {
      ob.falling = true;
    }
  }
  obstacles = obstacles.filter(ob => ob.x + ob.w > -20);

  /* ── collision ── */
  const dinoH   = dino.ducking ? DUCK_H : STAND_H;
  const dinoTop = dino.y - dinoH;
  const dx1     = DINO_X + 6,  dx2 = DINO_X + DINO_W - 6;
  const dy1     = dinoTop + 5, dy2 = dino.y - 2;

  for (const ob of obstacles) {
    const hb = getHitbox(ob);
    if (dx1 < hb.x2 && dx2 > hb.x1 && dy1 < hb.y2 && dy2 > hb.y1) {
      triggerGameOver(); return;
    }
    // pit collision — if dino is on ground AND centre of dino is over a pit
    if (ob.type === "pit") {
      const dinoMid = DINO_X + DINO_W / 2;
      if (dino.onGround && dinoMid > ob.x && dinoMid < ob.x + ob.w) {
        triggerGameOver(); return;
      }
    }
  }
}

function getHitbox(ob) {
  if (ob.type === "bird") {
    return { x1: ob.x + 4, y1: ob.y + 3, x2: ob.x + ob.w - 2, y2: ob.y + ob.h - 3 };
  }
  if (ob.type === "stala") {
    const dy = ob.drawY ?? ob.ceilY;
    return { x1: ob.x + 4, y1: dy, x2: ob.x + ob.w - 4, y2: dy + ob.h };
  }
  if (ob.type === "boulder") {
    const r = ob.r;
    return { x1: ob.x - r + 4, y1: ob.y - r + 4, x2: ob.x + r - 4, y2: ob.y + r - 4 };
  }
  if (ob.type === "pit") {
    return { x1: ob.x, y1: GY, x2: ob.x + ob.w, y2: GY + 10 }; // handled separately
  }
  // cactus default
  return { x1: ob.x + 4, y1: ob.y + 3, x2: ob.x + ob.w - 4, y2: ob.y + ob.h };
}

/* ═══════════════════════════
   SPAWN OBSTACLE
   Weighted by score phase
═══════════════════════════ */
function spawnObstacle() {
  const W     = DC.width;
  const score = dinoScore;

  // weights: [cactusS, cactusM, cactusL, cluster, birdLow, birdHigh, boulder, stala, pit]
  const w = [
    30,                              // small cactus — always common
    20,                              // medium
    score > 80  ? 15 : 0,           // large
    score > 150 ? 12 : 0,           // cluster
    score > 60  ? 14 : 0,           // bird low
    score > 120 ? 8  : 0,           // bird high
    score > 200 ? 10 : 0,           // boulder
    score > 250 ? 8  : 0,           // stalactite
    score > 300 ? 6  : 0,           // pit
  ];

  const total = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (; idx < w.length - 1; idx++) { r -= w[idx]; if (r <= 0) break; }

  const types = ["cactusS","cactusM","cactusL","cluster","birdLow","birdHigh","boulder","stala","pit"];
  const chosen = types[idx];

  switch (chosen) {
    case "cactusS": {
      const h = 28 + Math.floor(Math.random() * 10);
      obstacles.push({ type:"cactus", variant:"S", x: W+20, y: GY-h, w: 14, h, count:1 });
      break;
    }
    case "cactusM": {
      const h = 38 + Math.floor(Math.random() * 14);
      obstacles.push({ type:"cactus", variant:"M", x: W+20, y: GY-h, w: 18, h, count:2 });
      break;
    }
    case "cactusL": {
      const h = 52 + Math.floor(Math.random() * 16);
      obstacles.push({ type:"cactus", variant:"L", x: W+20, y: GY-h, w: 22, h, count:2 });
      break;
    }
    case "cluster": {
      // 3 cacti packed together
      const h1 = 30 + Math.floor(Math.random()*12);
      const h2 = 42 + Math.floor(Math.random()*14);
      const h3 = 28 + Math.floor(Math.random()*10);
      obstacles.push({ type:"cactus", variant:"S", x: W+20,    y: GY-h1, w:13, h:h1, count:1 });
      obstacles.push({ type:"cactus", variant:"M", x: W+20+17, y: GY-h2, w:18, h:h2, count:2 });
      obstacles.push({ type:"cactus", variant:"S", x: W+20+40, y: GY-h3, w:13, h:h3, count:1 });
      break;
    }
    case "birdLow": {
      // must jump over OR duck (flies at jump-height)
      const birdY = GY - 48 - Math.floor(Math.random() * 10);
      obstacles.push({ type:"bird", x: W+20, y: birdY, w:36, h:22, wing:0, wingTick:0 });
      break;
    }
    case "birdHigh": {
      // flies high — must duck under
      const birdY = GY - 88 - Math.floor(Math.random() * 15);
      obstacles.push({ type:"bird", x: W+20, y: birdY, w:36, h:22, wing:0, wingTick:0 });
      break;
    }
    case "boulder": {
      const r = 14 + Math.floor(Math.random() * 8);
      obstacles.push({ type:"boulder", x: W+20+r, y: GY-r, r, angle:0 });
      break;
    }
    case "stala": {
      // stalactite hanging from ceiling — must duck
      const h = 40 + Math.floor(Math.random() * 30);
      const w = 16 + Math.floor(Math.random() * 10);
      obstacles.push({
        type:"stala",
        x: W+20, w, h,
        ceilY: 0,        // hangs from y=0
        drawY: 0,
        fy: 0, vy: 0,
        falling: false, fallen: false,
      });
      break;
    }
    case "pit": {
      const pw = 42 + Math.floor(Math.random() * 24);
      obstacles.push({ type:"pit", x: W+20, y: GY, w: pw, h: 10 });
      break;
    }
  }
}

/* ── game over ── */
function triggerGameOver() {
  dinoRunning  = false;
  dinoGameOver = true;
  hintEl.textContent   = "GAME OVER  ·  SPACE / TAP TO RESTART";
  hintEl.style.display = "block";
  renderFrame();
}

/* ═══════════════════════════
   RENDER
═══════════════════════════ */
function renderFrame() {
  if (!DX || !DC) return;
  const W = DC.width, H = DC.height;
  const dark = currentTheme !== "light";

  /* ── palette (shifts at night) ── */
  const BG        = nightCycle
    ? (dark ? "#050e10" : "#c8dce2")
    : (dark ? "#0b1f22" : "#e8f5f2");
  const FG        = dark ? "#39f0c4" : "#0d4040";
  const FG2       = dark ? "#a8ff9c" : "#1a6a5a";
  const CACC      = nightCycle
    ? (dark ? "#ff9980" : "#b04030")
    : (dark ? "#ff6659" : "#cc2a1e");
  const BIRDC     = dark ? "#f3bd62" : "#b07a10";
  const BOULDC    = dark ? "#8ababa" : "#4a7878";
  const STALAC    = dark ? "#c0e8e0" : "#2a6060";
  const PITC      = dark ? "#020c0e" : "#9ababa";
  const GROUNDC   = nightCycle
    ? (dark ? "#1a3a40" : "#7aa0a8")
    : (dark ? "#315057" : "#8ab8b4");
  const CLOUDC    = nightCycle
    ? (dark ? "rgba(180,220,255,.08)" : "rgba(80,120,160,.14)")
    : (dark ? "rgba(57,240,196,.10)"  : "rgba(13,100,80,.10)");
  const STAR_C    = dark ? "rgba(200,255,240,.7)" : "rgba(100,160,140,.5)";

  /* ── background ── */
  DX.fillStyle = BG;
  DX.fillRect(0, 0, W, H);

  /* ── stars (night only) ── */
  if (nightCycle) {
    DX.fillStyle = STAR_C;
    for (const s of stars) {
      DX.beginPath();
      DX.arc(s.x, s.y, s.r, 0, Math.PI*2);
      DX.fill();
    }
  }

  /* ── clouds ── */
  DX.fillStyle = CLOUDC;
  for (const c of clouds) {
    DX.beginPath();
    DX.ellipse(c.x + c.w/2, c.y + c.h/2, c.w/2, c.h/2, 0, 0, Math.PI*2);
    DX.fill();
    DX.beginPath();
    DX.ellipse(c.x + c.w*0.3, c.y + c.h*0.3, c.w*0.25, c.h*0.6, 0, 0, Math.PI*2);
    DX.fill();
    DX.beginPath();
    DX.ellipse(c.x + c.w*0.72, c.y + c.h*0.25, c.w*0.22, c.h*0.55, 0, 0, Math.PI*2);
    DX.fill();
  }

  /* ── obstacles (behind ground) ── */
  for (const ob of obstacles) {
    if (ob.type === "pit") drawPit(ob, PITC, GROUNDC);
  }

  /* ── ground ── */
  DX.fillStyle = GROUNDC;
  DX.fillRect(0, GY + 1, W, 3);
  // running pebbles
  const pebOff = (dinoFrame * dinoSpeed * 0.5) % 35;
  for (let gx = -pebOff; gx < W; gx += 35) {
    DX.fillRect(Math.round(gx), GY + 6, 9, 2);
    DX.fillRect(Math.round(gx + 18), GY + 9, 5, 1);
  }

  /* ── obstacles (above ground) ── */
  for (const ob of obstacles) {
    if (ob.type === "cactus")  drawCactus(ob, CACC);
    if (ob.type === "bird")    drawBird(ob, BIRDC);
    if (ob.type === "boulder") drawBoulder(ob, BOULDC);
    if (ob.type === "stala")   drawStalactite(ob, STALAC);
  }

  /* ── dino ── */
  drawDino(FG, FG2);

  /* ── speed stage tint ── */
  if (speedStage >= 3) {
    const alpha = (speedStage - 2) * 0.04;
    DX.fillStyle = `rgba(255,80,50,${alpha})`;
    DX.fillRect(0, 0, W, H);
  }

  /* ── milestone / speed flash ── */
  if (flashTimer > 0) {
    DX.globalAlpha = Math.min(1, flashTimer / 30);
    DX.fillStyle   = dark ? "#39f0c4" : "#0d6050";
    DX.font        = `bold 18px "DM Mono",monospace`;
    DX.textAlign   = "center";
    DX.fillText(flashMsg, W / 2, 28);
    DX.globalAlpha = 1;
    DX.textAlign   = "left";
  }

  /* ── game over overlay ── */
  if (dinoGameOver) {
    DX.fillStyle = dark ? "rgba(255,80,60,.18)" : "rgba(180,30,10,.1)";
    DX.fillRect(0, 0, W, H);
  }
}

/* ═══════════════════════════
   DRAW HELPERS
═══════════════════════════ */

/* ── Dino ── */
function drawDino(col, col2) {
  const h   = dino.ducking ? DUCK_H : STAND_H;
  const top = dino.y - h;
  const x   = DINO_X;
  DX.fillStyle = col;

  if (dino.ducking) {
    pixR(x,    top,       DINO_W+10, DUCK_H);     // wide body
    pixR(x+DINO_W+2, top+3, 5, 5);               // head nub
    DX.fillStyle = col2;
    pixR(x+DINO_W+4, top+3, 3, 3);               // eye
    DX.fillStyle = col;
    // ducking legs alternate
    if (dino.legFrame===0){ pixR(x+5, dino.y-9, 9,9); pixR(x+19,dino.y-3,9,3); }
    else                  { pixR(x+5, dino.y-3, 9,3); pixR(x+19,dino.y-9,9,9); }
    return;
  }

  // standing / airborne
  // tail
  pixR(x-6, top+28, 12, 7);
  // body
  pixR(x+3, top+16, 20, 18);
  // neck
  pixR(x+7, top+8,  14, 10);
  // head
  pixR(x+9, top,    18, 14);
  // snout
  pixR(x+23,top+5,  6,  7);
  // eye socket (dark)
  DX.fillStyle = "#00000055";
  pixR(x+14,top+3,  6,  5);
  // eye (bright)
  DX.fillStyle = col2;
  pixR(x+15,top+4,  4,  3);
  DX.fillStyle = col;
  // arm nub
  pixR(x+20,top+24, 7,  5);

  // legs
  if (dino.onGround) {
    if (dino.legFrame===0){
      pixR(x+6,  dino.y-11, 7,11);   // back leg stride forward
      pixR(x+16, dino.y-4,  7,4);    // front leg back
    } else {
      pixR(x+6,  dino.y-4,  7,4);
      pixR(x+16, dino.y-11, 7,11);
    }
  } else {
    // airborne pose
    pixR(x+6,  dino.y-13, 7, 13);
    pixR(x+16, dino.y-7,  7, 7);
  }
}

/* ── Cactus (variant-aware) ── */
function drawCactus(ob, col) {
  DX.fillStyle = col;
  const { x, y, w, h, count } = ob;
  const midX = x + Math.floor(w/2) - 3;

  // trunk
  pixR(midX, y, 6, h);

  if (count >= 2) {
    const aY = y + Math.floor(h * 0.22);
    // left branch
    pixR(x,      aY+10, midX-x, 5);
    pixR(x,      aY,    5,  14);
    // left branch tip spike
    pixR(x,      aY-4,  5,  5);
    // right branch
    const rx = midX+6;
    pixR(rx, aY+10, x+w-rx, 5);
    pixR(x+w-5, aY,  5,  14);
    // right branch tip spike
    pixR(x+w-5, aY-4, 5,  5);
  }

  // top spike
  pixR(midX+1, y-6, 4, 7);
}

/* ── Bird ── */
function drawBird(ob, col) {
  if (++ob.wingTick > Math.max(3, 8 - Math.floor(dinoSpeed/3))) {
    ob.wing    = 1 - ob.wing;
    ob.wingTick = 0;
  }
  DX.fillStyle = col;
  const { x, y, w, h } = ob;
  // body
  pixR(x+9,  y+7,  w-16, h-10);
  // head
  pixR(x+w-11, y+4, 12, 11);
  // beak
  pixR(x+w,    y+7,  7,  3);
  // eye
  DX.fillStyle = "#00000090";
  pixR(x+w-7,  y+7,  3,  3);
  DX.fillStyle = col;
  // wing
  if (ob.wing===0){
    // up stroke
    pixR(x+7, y-1, w-16, 8);
  } else {
    // down stroke
    pixR(x+7, y+h-4, w-16, 8);
  }
  // tail feathers
  pixR(x+2, y+8, 8, 6);
}

/* ── Boulder ── */
function drawBoulder(ob, col) {
  ob.angle = (ob.angle || 0) + dinoSpeed * 0.05;
  const { x, y, r } = ob;
  DX.save();
  DX.translate(x, y);
  DX.rotate(ob.angle);
  // rough circle with facets
  DX.fillStyle = col;
  DX.beginPath();
  const sides = 8;
  for (let i = 0; i < sides; i++) {
    const a  = (i / sides) * Math.PI * 2;
    const fr = r * (0.82 + 0.18 * Math.sin(i * 2.3));
    i === 0 ? DX.moveTo(Math.cos(a)*fr, Math.sin(a)*fr)
            : DX.lineTo(Math.cos(a)*fr, Math.sin(a)*fr);
  }
  DX.closePath();
  DX.fill();
  // cracks / detail lines
  DX.strokeStyle = "rgba(0,0,0,.3)";
  DX.lineWidth   = 1.5;
  DX.beginPath();
  DX.moveTo(-r*0.3, -r*0.5);
  DX.lineTo( r*0.1,  r*0.2);
  DX.moveTo( r*0.2, -r*0.3);
  DX.lineTo(-r*0.1,  r*0.4);
  DX.stroke();
  DX.restore();
}

/* ── Stalactite ── */
function drawStalactite(ob, col) {
  DX.fillStyle = col;
  const dy = ob.drawY ?? 0;
  const { x, w, h } = ob;
  const midX = x + Math.floor(w/2) - 3;

  // main body
  pixR(x, dy, w, h - 10);
  // sharp point
  DX.beginPath();
  DX.moveTo(x, dy + h - 10);
  DX.lineTo(x + w, dy + h - 10);
  DX.lineTo(x + w/2, dy + h + 2);
  DX.closePath();
  DX.fill();

  // drip highlight
  DX.fillStyle = "rgba(255,255,255,.25)";
  pixR(x+3, dy+3, 3, h - 14);
}

/* ── Pit ── */
function drawPit(ob, pitCol, groundCol) {
  // make a gap in the ground by painting pit colour
  DX.fillStyle = pitCol;
  DX.fillRect(ob.x, GY + 1, ob.w, 30);
  // edge crumble pixels
  DX.fillStyle = groundCol;
  pixR(ob.x - 3,      GY + 1, 3, 3);
  pixR(ob.x + ob.w,   GY + 1, 3, 3);
  pixR(ob.x - 2,      GY + 4, 2, 2);
  pixR(ob.x + ob.w+1, GY + 4, 2, 2);
}

/* ── pixel rect helper ── */
function pixR(x, y, w, h) {
  DX.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}


/* ══════════════════════════════════════════════════════════════
   TERMINAL WINDOW — interactive portfolio explorer
   ──────────────────────────────────────────────────────────────
   Commands:
     help              list all commands
     ls / dir          list sections/files
     cd <section>      open a window
     cat <file>        print file contents
     whoami            about sahil
     skills            show tech stack
     projects          list projects
     open <project>    open project live link
     github            open github profile
     contact           show contact info
     clear / cls       clear terminal
     theme             toggle dark/light
     dino              launch dino game
     secret            hint for Konami code
     date              current date/time
     pwd               current path
══════════════════════════════════════════════════════════════ */

(function initTerminal() {
  // wait for DOM
  const winEl    = document.getElementById("terminal-window");
  const outputEl = document.getElementById("term-output");
  const inputEl  = document.getElementById("term-input");
  const bodyEl   = document.getElementById("term-body");

  if (!winEl || !outputEl || !inputEl) return;

  let cwd       = "~";
  let history   = [];
  let histIdx   = -1;

  /* ── filesystem map ── */
  const FS = {
    "~": ["about/", "skills/", "projects/", "documents/", "contact/", "dino.exe"],
    "~/about": ["readme.txt"],
    "~/skills": ["superpowers.txt", "stack.txt"],
    "~/projects": ["worknest/", "dino-history/", "alien-explorer/"],
    "~/projects/worknest":        ["info.txt"],
    "~/projects/dino-history":    ["info.txt"],
    "~/projects/alien-explorer":  ["info.txt"],
    "~/documents": ["experience.log", "leadership.md", "skills.txt"],
    "~/contact":   ["email.txt", "links.txt"],
  };

  /* ── file contents ── */
  const FILES = {
    "~/about/readme.txt": [
      { t:"ok",   v:"═══════════════════════════" },
      { t:"bold", v:" SAHIL NARULA / README.TXT" },
      { t:"ok",   v:"═══════════════════════════" },
      { t:"",     v:"" },
      { t:"bold", v:"Name    : Sahil Narula" },
      { t:"",     v:"Role    : Software Engineering Intern" },
      { t:"",     v:"Location: New Delhi, India" },
      { t:"",     v:"" },
      { t:"",     v:"I'm a CS student who enjoys turning ideas into" },
      { t:"",     v:"reliable, polished web experiences." },
      { t:"",     v:"" },
      { t:"",     v:"I work across frontend and backend — React," },
      { t:"",     v:"Node.js, SQLite, APIs, and deployment workflows." },
      { t:"",     v:"" },
      { t:"warn", v:"Lead a 15-member team at TechSpace Open Lab." },
      { t:"warn", v:"Delivered workshops for 80+ students." },
    ],
    "~/skills/superpowers.txt": [
      { t:"ok",   v:"TECH SUPERPOWERS" },
      { t:"dim",  v:"─────────────────" },
      { t:"bold", v:"BUILD  : React · TypeScript · JavaScript · HTML · CSS" },
      { t:"bold", v:"SHIP   : Node.js · REST APIs · SQLite · PostgreSQL" },
      { t:"bold", v:"TOOLS  : Git · GitHub · Netlify · Railway · AWS" },
      { t:"bold", v:"THINK  : Data structures · API integration · Debugging" },
      { t:"",     v:"" },
      { t:"warn", v:"BONUS  : Explaining complex ideas to new developers" },
    ],
    "~/skills/stack.txt": [
      { t:"ok",   v:"STACK.TXT" },
      { t:"dim",  v:"──────────" },
      { t:"",     v:"React / TypeScript   ████████████░░  90%" },
      { t:"",     v:"HTML / CSS / Design  ███████████████ 95%" },
      { t:"",     v:"Node.js / REST APIs  ████████████░░  85%" },
      { t:"",     v:"SQL / PostgreSQL     ███████████░░░  80%" },
      { t:"",     v:"Git / GitHub         ████████████░░  88%" },
      { t:"",     v:"AWS / Cloud          ██████████░░░░  72%" },
    ],
    "~/projects/worknest/info.txt": [
      { t:"ok",   v:"PROJECT: WorkNest" },
      { t:"dim",  v:"──────────────────" },
      { t:"",     v:"Stack : React · Bun · SQLite · Turborepo" },
      { t:"",     v:"Type  : Collaborative workspace monorepo" },
      { t:"",     v:"" },
      { t:"bold", v:"Live  : https://worknest-07.netlify.app" },
      { t:"bold", v:"Repo  : github.com/sahil-narula7/Worknest-collaborative-workspace" },
      { t:"",     v:"" },
      { t:"warn", v:"Tip: type  open worknest  to launch live site" },
    ],
    "~/projects/dino-history/info.txt": [
      { t:"ok",   v:"PROJECT: Dino History" },
      { t:"dim",  v:"──────────────────────" },
      { t:"",     v:"Stack : HTML · CSS · JavaScript" },
      { t:"",     v:"Type  : Interactive educational platform" },
      { t:"",     v:"" },
      { t:"bold", v:"Live  : https://sn-dinos.netlify.app" },
      { t:"bold", v:"Repo  : github.com/sahil-narula7/Dino-History" },
      { t:"",     v:"" },
      { t:"warn", v:"Tip: type  open dino-history  to launch live site" },
    ],
    "~/projects/alien-explorer/info.txt": [
      { t:"ok",   v:"PROJECT: Alien Explorer" },
      { t:"dim",  v:"────────────────────────" },
      { t:"",     v:"Stack : HTML · CSS · JavaScript" },
      { t:"",     v:"Type  : Browser-based educational space adventure" },
      { t:"",     v:"" },
      { t:"",     v:"Teaches Maths, Science, Logic, Reasoning, and" },
      { t:"",     v:"Applied Thinking through interactive quiz missions." },
      { t:"",     v:"" },
      { t:"bold", v:"Live  : alien-explorer-hackathon-2026.s3-website-us-east-1.amazonaws.com" },
      { t:"bold", v:"Repo  : github.com/sahil-narula7/Alien-Explorer" },
      { t:"",     v:"" },
      { t:"warn", v:"Tip: type  open alien-explorer  to launch live site" },
    ],
    "~/documents/experience.log": [
      { t:"ok",   v:"EXPERIENCE.LOG" },
      { t:"dim",  v:"───────────────" },
      { t:"bold", v:"[2026] Software Engineering Intern" },
      { t:"",     v:"       Full-stack development · React · Node.js · SQL" },
      { t:"",     v:"" },
      { t:"bold", v:"[2025] Technical Training" },
      { t:"",     v:"       APIs · Git · Database design · Deployment" },
    ],
    "~/documents/leadership.md": [
      { t:"ok",   v:"LEADERSHIP.MD" },
      { t:"dim",  v:"──────────────" },
      { t:"bold", v:"TechSpace Open Lab · 2024–2025" },
      { t:"",     v:"Team Lead — 15 members" },
      { t:"",     v:"" },
      { t:"",     v:"→ Delivered hands-on workshops for 80+ students" },
      { t:"",     v:"→ Coordinated technical projects end-to-end" },
      { t:"",     v:"→ Mentored junior developers" },
    ],
    "~/documents/skills.txt": [
      { t:"warn", v:"→ See ~/skills/superpowers.txt for full list" },
      { t:"dim",  v:"  type:  cd skills && cat superpowers.txt" },
    ],
    "~/contact/email.txt": [
      { t:"ok",   v:"EMAIL" },
      { t:"bold", v:"sahilnarula254@gmail.com" },
    ],
    "~/contact/links.txt": [
      { t:"ok",   v:"LINKS" },
      { t:"dim",  v:"──────" },
      { t:"bold", v:"LinkedIn : linkedin.com/in/sahil-narula7/" },
      { t:"bold", v:"GitHub   : github.com/sahil-narula7" },
      { t:"bold", v:"Live Site: sahilnarula.in" },
    ],
  };

  /* ── live URLs for open command ── */
  const OPEN_URLS = {
    "worknest":       "https://worknest-07.netlify.app",
    "dino-history":   "https://sn-dinos.netlify.app",
    "alien-explorer": "http://alien-explorer-hackathon-2026.s3-website-us-east-1.amazonaws.com",
    "github":         "https://github.com/sahil-narula7",
    "linkedin":       "https://www.linkedin.com/in/sahil-narula7/",
    "portfolio":      "https://sahilnarula.in",
  };

  /* ── window open aliases ── */
  const CD_ALIASES = {
    "about":    "about-window",
    "skills":   "skills-window",
    "projects": "work-window",
    "work":     "work-window",
    "contact":  "contact-window",
    "documents":"documents-window",
    "dino":     "dino-window",
    "home":     "computer-window",
    "~":        "computer-window",
  };

  /* ─── print helpers ─── */
  function print(text, type = "") {
    const line = document.createElement("div");
    line.className = "term-line" + (type ? ` term-${type}` : "");
    line.textContent = text;
    outputEl.appendChild(line);
    scrollBottom();
  }

  function printHTML(html) {
    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = html;
    outputEl.appendChild(line);
    scrollBottom();
  }

  function printBlank() { print(""); }

  function scrollBottom() {
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function printLines(lines) {
    lines.forEach(l => print(l.v, l.t || ""));
  }

  function printPromptEcho(cmd) {
    print(`visitor@sahil:${cwd}$ ${cmd}`, "cmd");
  }

  /* ─── command router ─── */
  function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // history
    history.unshift(trimmed);
    histIdx = -1;

    printPromptEcho(trimmed);

    const parts = trimmed.split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const arg   = parts.slice(1).join(" ").toLowerCase();

    switch (cmd) {

      case "help":
        print("──────────────────────────────────────────", "dim");
        print(" AVAILABLE COMMANDS", "ok");
        print("──────────────────────────────────────────", "dim");
        print("  help                  show this list", "");
        print("  ls  / dir             list current directory", "");
        print("  cd  <section>         navigate to section", "");
        print("  cat <file>            read a file", "");
        print("  pwd                   show current path", "");
        print("  clear / cls           clear terminal", "");
        print("──────────────────────────────────────────", "dim");
        print("  whoami                about Sahil", "");
        print("  skills                tech stack", "");
        print("  projects              list all projects", "");
        print("  open <project>        launch project in browser", "");
        print("  github                open GitHub profile", "");
        print("  contact               contact info", "");
        print("──────────────────────────────────────────", "dim");
        print("  theme                 toggle dark / light mode", "");
        print("  dino                  launch dino.exe game", "");
        print("  secret                ??", "");
        print("  date                  current date & time", "");
        print("──────────────────────────────────────────", "dim");
        print("  Tab                   autocomplete", "warn");
        print("  ↑ / ↓                 command history", "warn");
        break;

      case "ls":
      case "dir": {
        const items = FS[cwd === "~" ? "~" : cwd] || FS["~"];
        print(`total ${items.length}`, "dim");
        items.forEach(item => {
          if (item.endsWith("/")) print(`  drwx  ${item}`, "ok");
          else print(`  -rw-  ${item}`, "");
        });
        break;
      }

      case "pwd":
        print(cwd === "~" ? "/home/sahil" : `/home/sahil/${cwd.replace("~/","")}`, "ok");
        break;

      case "cd": {
        if (!arg || arg === "~" || arg === "/") {
          cwd = "~";
          print("~", "ok");
          // open home window
          if (typeof showWindow === "function") showWindow("computer-window");
          break;
        }
        if (arg === "..") {
          if (cwd === "~") { print("already at root", "warn"); break; }
          const parts2 = cwd.split("/");
          parts2.pop();
          cwd = parts2.join("/") || "~";
          print(cwd, "ok");
          break;
        }
        // check alias → open window
        const winAlias = CD_ALIASES[arg];
        if (winAlias) {
          cwd = `~/${arg}`;
          print(`cd: entering ${cwd}`, "ok");
          if (typeof showWindow === "function") showWindow(winAlias);
          break;
        }
        // check FS
        const target = cwd === "~" ? `~/${arg}` : `${cwd}/${arg}`;
        if (FS[target]) {
          cwd = target;
          print(cwd, "ok");
        } else {
          print(`cd: ${arg}: No such directory`, "err");
          print(`Tip: type  ls  to see what's here`, "dim");
        }
        break;
      }

      case "cat": {
        if (!arg) { print("cat: missing filename. Usage: cat <file>", "err"); break; }
        // resolve path
        const filePath = arg.startsWith("~/") ? arg : `${cwd}/${arg}`;
        if (FILES[filePath]) {
          printBlank();
          printLines(FILES[filePath]);
          printBlank();
        } else {
          print(`cat: ${arg}: No such file`, "err");
          print(`Tip: type  ls  to see files here`, "dim");
        }
        break;
      }

      case "whoami":
        printBlank();
        printLines(FILES["~/about/readme.txt"]);
        printBlank();
        break;

      case "skills":
        printBlank();
        printLines(FILES["~/skills/superpowers.txt"]);
        printBlank();
        break;

      case "projects":
        print("──────────────────────────────────────", "dim");
        print(" PROJECTS", "ok");
        print("──────────────────────────────────────", "dim");
        print("  01  WorkNest         worknest-07.netlify.app", "bold");
        print("  02  Dino History     sn-dinos.netlify.app", "bold");
        print("  03  Alien Explorer   alien-explorer on AWS S3", "bold");
        print("──────────────────────────────────────", "dim");
        print("  type:  open worknest        to launch", "warn");
        print("  type:  open dino-history    to launch", "warn");
        print("  type:  open alien-explorer  to launch", "warn");
        break;

      case "open": {
        if (!arg) { print("open: usage:  open <project>", "err"); break; }
        const url = OPEN_URLS[arg.replace(/\s+/g, "-")];
        if (url) {
          print(`opening ${url} ...`, "ok");
          window.open(url, "_blank", "noreferrer");
        } else {
          print(`open: '${arg}' not found`, "err");
          print("available: worknest, dino-history, alien-explorer, github, linkedin, portfolio", "dim");
        }
        break;
      }

      case "github":
        print("opening github.com/sahil-narula7 ...", "ok");
        window.open("https://github.com/sahil-narula7", "_blank", "noreferrer");
        break;

      case "contact":
        printBlank();
        print("─────────────────────────────────", "dim");
        print(" CONTACT", "ok");
        print("─────────────────────────────────", "dim");
        print("  Email    : sahilnarula254@gmail.com", "bold");
        print("  LinkedIn : linkedin.com/in/sahil-narula7/", "bold");
        print("  GitHub   : github.com/sahil-narula7", "bold");
        print("  Site     : sahilnarula.in", "bold");
        print("─────────────────────────────────", "dim");
        printBlank();
        break;

      case "clear":
      case "cls":
        outputEl.innerHTML = "";
        print("terminal cleared", "dim");
        break;

      case "theme":
        if (typeof applyTheme === "function") {
          applyTheme(currentTheme === "dark" ? "light" : "dark");
          print(`theme: switched to ${currentTheme} mode`, "ok");
        }
        break;

      case "dino":
        print("launching dino.exe ...", "ok");
        if (typeof showWindow === "function") showWindow("dino-window");
        break;

      case "date":
        print(new Date().toString(), "ok");
        break;

      case "secret":
        print("// try the Konami Code on the desktop //", "warn");
        print("↑ ↑ ↓ ↓ ← → ← → B A", "ok");
        break;

      case "exit":
      case "quit":
        print("closing terminal ...", "dim");
        setTimeout(() => {
          const w = document.getElementById("terminal-window");
          if (w) { w.classList.add("minimizing"); setTimeout(() => w.classList.remove("open"), 220); }
        }, 300);
        break;

      case "matrix":
        print("// use Konami Code for the real thing //", "dim");
        print("↑ ↑ ↓ ↓ ← → ← → B A", "warn");
        break;

      case "echo":
        print(parts.slice(1).join(" ") || "", "ok");
        break;

      case "uname":
        print("sahil.exe OS v2005.04 — Darwin/retro/arm64", "ok");
        break;

      case "ping":
        print(`PING ${arg || "sahilnarula.in"}: 64 bytes — time=1.2ms`, "ok");
        print(`PING ${arg || "sahilnarula.in"}: 64 bytes — time=0.9ms`, "ok");
        print(`PING ${arg || "sahilnarula.in"}: 64 bytes — time=1.1ms`, "ok");
        print(`--- 3 packets transmitted, 3 received, 0% packet loss ---`, "dim");
        break;

      default:
        print(`command not found: ${cmd}`, "err");
        print(`type  help  to see available commands`, "dim");
    }

    printBlank();
  }

  /* ─── Tab autocomplete ─── */
  function autocomplete(val) {
    const parts2 = val.trim().split(/\s+/);
    if (parts2.length === 1) {
      // complete command
      const cmds = ["help","ls","dir","cd","cat","pwd","clear","cls","whoami",
                    "skills","projects","open","github","contact","theme","dino",
                    "date","secret","exit","echo","uname","ping","matrix"];
      const match = cmds.filter(c => c.startsWith(val));
      if (match.length === 1) return match[0];
      if (match.length > 1) { print(match.join("  "), "dim"); return val; }
    }
    if (parts2.length === 2) {
      const base = parts2[0];
      const partial = parts2[1];
      // complete filenames from cwd
      const items = (FS[cwd] || []).map(i => i.replace("/",""));
      const match = items.filter(i => i.startsWith(partial));
      if (match.length === 1) return `${base} ${match[0]}`;
      if (match.length > 1) { print(match.join("  "), "dim"); return val; }
      // complete open targets
      if (base === "open") {
        const targets = Object.keys(OPEN_URLS);
        const m = targets.filter(t => t.startsWith(partial));
        if (m.length === 1) return `open ${m[0]}`;
        if (m.length > 1) { print(m.join("  "), "dim"); return val; }
      }
    }
    return val;
  }

  /* ─── Input events ─── */
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const val = inputEl.value;
      inputEl.value = "";
      runCommand(val);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      inputEl.value = autocomplete(inputEl.value);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        inputEl.value = history[histIdx];
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; inputEl.value = history[histIdx]; }
      else { histIdx = -1; inputEl.value = ""; }
      return;
    }
    // Ctrl+C
    if (e.key === "c" && e.ctrlKey) {
      print(`^C`, "err");
      inputEl.value = "";
      return;
    }
    // Ctrl+L = clear
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      outputEl.innerHTML = "";
      return;
    }
  });

  // click anywhere in term body = focus input
  bodyEl.addEventListener("click", () => inputEl.focus());

  // auto-focus when window opens
  const termWinObserver = new MutationObserver(() => {
    if (winEl.classList.contains("open")) {
      setTimeout(() => inputEl.focus(), 80);
    }
  });
  termWinObserver.observe(winEl, { attributes: true, attributeFilter: ["class"] });

})();
