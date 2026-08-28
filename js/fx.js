// ================================================================
// महाभारत-कथाचक्र — Cinematic Story & Atmosphere Engine
// ================================================================

export class StoryFX {
  constructor() {
    this.gateCanvas = document.getElementById("gate-canvas");
    this.cinemaCanvas = document.getElementById("cinema-canvas");

    this.gCtx = this.gateCanvas ? this.gateCanvas.getContext("2d") : null;
    this.cCtx = this.cinemaCanvas ? this.cinemaCanvas.getContext("2d") : null;

    this.activeEvent = null;
    this.currentTime = 0;
    this.lineIndex = 0;
    this.isPlaying = false;
    this.rafId = null;

    // Atmospheric particles
    this.gateEmbers = [];
    this.ambientMotes = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.initGateEmbers();
    this.initAmbientMotes();
    this.startLoop();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.gateCanvas) {
      this.gateCanvas.width = w;
      this.gateCanvas.height = h;
    }
    if (this.cinemaCanvas) {
      this.cinemaCanvas.width = w;
      this.cinemaCanvas.height = h;
    }
  }

  initGateEmbers() {
    this.gateEmbers = [];
    const count = Math.min(45, Math.floor(window.innerWidth / 30));
    for (let i = 0; i < count; i++) {
      this.gateEmbers.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1.2 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.8,
        alpha: 0.15 + Math.random() * 0.45,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? "#f5d47a" : "#f0a23a"
      });
    }
  }

  initAmbientMotes() {
    this.ambientMotes = [];
    const count = 30;
    const w = window.innerWidth || 1920;
    const h = window.innerHeight || 1080;
    for (let i = 0; i < count; i++) {
      this.ambientMotes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        alpha: 0.1 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  setEvent(eventId) {
    this.activeEvent = eventId;
    this.currentTime = 0;
    this.lineIndex = 0;
    this.updateCameraFocalPoint(eventId, 0);
  }

  updateAudio(time, lineIdx, isPlaying) {
    this.currentTime = time;
    if (this.lineIndex !== lineIdx) {
      this.lineIndex = lineIdx;
      this.updateCameraFocalPoint(this.activeEvent, lineIdx);
    }
    this.isPlaying = isPlaying;
  }

  // ── Cinematic Focal Camera Pan & Zoom ────────────────────────────
  // Dynamically focuses on the character or action in the painting based on narrative lines
  updateCameraFocalPoint(eventId, lineIdx) {
    const bg = document.getElementById("cinema-bg");
    if (!bg) return;

    // Define refined camera focus points for each scene and line (pan and scale)
    const focalMap = {
      "parikshit-shamika": [
        { scale: 1.05, x: "50%", y: "50%" }, // Wide
        { scale: 1.15, x: "52%", y: "55%" }, // Parikshit approaching
        { scale: 1.20, x: "68%", y: "55%" }, // Shamika in samadhi
        { scale: 1.18, x: "60%", y: "52%" }, // Dead snake placed
        { scale: 1.25, x: "18%", y: "42%" }, // Shringin pronouncing curse
        { scale: 1.12, x: "50%", y: "50%" }  // Full scene resolution
      ],
      "takshaka-kills-parikshit": [
        { scale: 1.06, x: "50%", y: "50%" }, // Guarded palace
        { scale: 1.14, x: "35%", y: "45%" }, // Kashyapa turned back
        { scale: 1.22, x: "68%", y: "48%" }, // Takshaka striking
        { scale: 1.28, x: "65%", y: "50%" }, // Poison fire
        { scale: 1.12, x: "50%", y: "50%" }  // Young Janamejaya crowned
      ],
      "janamejaya-sarpa-satra": [
        { scale: 1.05, x: "50%", y: "50%" }, // Wide assembly
        { scale: 1.20, x: "18%", y: "55%" }, // Janamejaya under canopy
        { scale: 1.26, x: "50%", y: "70%" }, // Blazing sacrificial fire
        { scale: 1.22, x: "50%", y: "40%" }, // Serpents tumbling
        { scale: 1.12, x: "50%", y: "50%" }  // Assembly conclusion
      ],
      "kadru-vinata-wager": [
        { scale: 1.05, x: "50%", y: "50%" }, // Ocean shore
        { scale: 1.22, x: "42%", y: "48%" }, // Uchchaihshravas horse
        { scale: 1.25, x: "50%", y: "54%" }, // Tail deception
        { scale: 1.12, x: "50%", y: "50%" }  // Vinata enslaved
      ],
      "garuda-amrita": [
        { scale: 1.06, x: "50%", y: "50%" }, // Heavenly flight
        { scale: 1.24, x: "50%", y: "30%" }, // Garuda conquering gods
        { scale: 1.18, x: "50%", y: "65%" }, // Amrita on kusha grass
        { scale: 1.10, x: "50%", y: "50%" }  // Vinata freed
      ],
      "elapatra-prophecy": [
        { scale: 1.05, x: "50%", y: "50%" }, // Naga council
        { scale: 1.20, x: "45%", y: "50%" }, // Vasuki presiding
        { scale: 1.24, x: "55%", y: "45%" }, // Elapatra revealing prophecy
        { scale: 1.12, x: "50%", y: "50%" }  // Resolution
      ],
      "astika-born": [
        { scale: 1.05, x: "50%", y: "50%" }, // Jaratkaru ascetic
        { scale: 1.20, x: "35%", y: "45%" }, // Pitris hanging in abyss
        { scale: 1.22, x: "55%", y: "50%" }, // Marriage with naga maiden
        { scale: 1.14, x: "50%", y: "50%" }  // Astika's birth
      ],
      "astika-stops-satra": [
        { scale: 1.08, x: "50%", y: "50%" }, // Raging sacrifice
        { scale: 1.24, x: "40%", y: "60%" }, // Astika entering & praising
        { scale: 1.22, x: "65%", y: "45%" }, // Takshaka saved mid-air
        { scale: 1.10, x: "50%", y: "50%" }  // Sacrifice halted
      ],
      "naimisha-satra": [
        { scale: 1.05, x: "50%", y: "50%" }, // Naimisha grove
        { scale: 1.20, x: "35%", y: "50%" }, // Sauti arriving
        { scale: 1.22, x: "65%", y: "50%" }, // Shaunaka and sages listening
        { scale: 1.10, x: "50%", y: "50%" }  // Opening of Bharata
      ],
      "vyasa-vaishampayana": [
        { scale: 1.06, x: "50%", y: "50%" }, // Vyasa dictating
        { scale: 1.22, x: "38%", y: "45%" }, // Vyasa and Ganesha
        { scale: 1.20, x: "62%", y: "50%" }, // Vaishampayana reciting
        { scale: 1.10, x: "50%", y: "50%" }  // Eternal lineage
      ]
    };

    const points = focalMap[eventId] || [{ scale: 1.08, x: "50%", y: "50%" }];
    const focus = points[Math.min(lineIdx, points.length - 1)];

    bg.style.transition = "transform 6.5s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 6.5s cubic-bezier(0.25, 1, 0.5, 1)";
    bg.style.transformOrigin = `${focus.x} ${focus.y}`;
    bg.style.transform = `scale(${focus.scale})`;
  }

  startLoop() {
    const render = () => {
      this.renderGate();
      this.renderCinema();
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }

  // ── Gate / Home Ambient Lighting & Sacred Embers ────────────────
  renderGate() {
    if (!this.gCtx || !this.gateCanvas || this.gateCanvas.offsetParent === null) return;
    const ctx = this.gCtx;
    const w = this.gateCanvas.width;
    const h = this.gateCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Warm sacrificial altar glow at bottom
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.98, 30, w * 0.5, h * 0.98, w * 0.6);
    fireGrad.addColorStop(0, "rgba(230, 110, 30, 0.22)");
    fireGrad.addColorStop(0.6, "rgba(140, 45, 12, 0.08)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    // Rising delicate gold embers
    for (const p of this.gateEmbers) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.pulse) * 0.4;
      p.pulse += 0.025;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Cinema Scene: Atmospheric Golden Motes & Warm Lighting ───────
  renderCinema() {
    if (!this.cCtx || !this.cinemaCanvas) return;
    const ctx = this.cCtx;
    const w = this.cinemaCanvas.width;
    const h = this.cinemaCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle atmospheric dust particles floating in sacred light
    for (const m of this.ambientMotes) {
      m.y += m.vy;
      m.x += m.vx + Math.sin(m.pulse) * 0.3;
      m.pulse += 0.02;
      if (m.y < -10) {
        m.y = h + 10;
        m.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ffe082";
      ctx.globalAlpha = m.alpha * (0.6 + Math.sin(m.pulse) * 0.4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
