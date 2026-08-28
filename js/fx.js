// ================================================================
// महाभारत-कथाचक्र — Dynamic Canvas Story Effects Engine (Audio-Synced)
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

    // Particle pools
    this.gateEmbers = [];
    this.cinemaParticles = [];
    this.serpents = [];
    this.curseBeam = null;
    this.mandala = { radius: 0, alpha: 0, active: false };
    this.flashAlpha = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.initGateEmbers();
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
    const count = Math.min(80, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < count; i++) {
      this.gateEmbers.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1.5 + Math.random() * 3.5,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.6 - Math.random() * 1.4,
        alpha: 0.2 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? "#f0a23a" : Math.random() > 0.5 ? "#d44a20" : "#f5d47a"
      });
    }
  }

  setEvent(eventId) {
    this.activeEvent = eventId;
    this.currentTime = 0;
    this.lineIndex = 0;
    this.cinemaParticles = [];
    this.serpents = [];
    this.curseBeam = null;
    this.mandala = { radius: 0, alpha: 0, active: false };
    this.flashAlpha = 0;

    if (eventId === "janamejaya-sarpa-satra" || eventId === "astika-stops-satra") {
      this.initSarpaSatra();
    }
  }

  updateAudio(time, lineIdx, isPlaying) {
    this.currentTime = time;
    this.lineIndex = lineIdx;
    this.isPlaying = isPlaying;

    // Trigger scene-specific moments based on narrative lines
    if (this.activeEvent === "parikshit-shamika") {
      // Line where Shringin curses: launch curse beam
      if (lineIdx >= 4 && !this.curseBeam) {
        this.curseBeam = { progress: 0, active: true };
      }
    } else if (this.activeEvent === "takshaka-kills-parikshit") {
      // Line where Takshaka strikes: trigger toxic flash & venom burst
      if (lineIdx >= 5 && this.flashAlpha === 0) {
        this.flashAlpha = 0.9;
        this.spawnVenomBurst();
      }
    } else if (this.activeEvent === "astika-stops-satra") {
      // Line where Astika halts the fire: expand shanti mandala
      if (lineIdx >= 4 && !this.mandala.active) {
        this.mandala.active = true;
        this.mandala.radius = 10;
        this.mandala.alpha = 0.95;
      }
    }
  }

  initSarpaSatra() {
    this.serpents = [];
    for (let i = 0; i < 14; i++) {
      this.spawnSerpent();
    }
  }

  spawnSerpent() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.serpents.push({
      x: 0.2 * w + Math.random() * 0.6 * w,
      y: -50 - Math.random() * 300,
      targetX: w * 0.5 + (Math.random() - 0.5) * (w * 0.3),
      targetY: h * 0.75 + Math.random() * (h * 0.2),
      length: 25 + Math.random() * 45,
      speed: 1.8 + Math.random() * 2.8,
      phase: Math.random() * Math.PI * 2,
      thickness: 2 + Math.random() * 3,
      alpha: 0.6 + Math.random() * 0.4,
      hue: Math.random() > 0.5 ? "rgba(220, 100, 30," : "rgba(80, 20, 120,"
    });
  }

  spawnVenomBurst() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.cinemaParticles.push({
        x: w * 0.5,
        y: h * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 7,
        alpha: 1,
        color: Math.random() > 0.5 ? "#50e680" : "#a832e0",
        decay: 0.015 + Math.random() * 0.02
      });
    }
  }

  startLoop() {
    const render = () => {
      this.renderGate();
      this.renderCinema();
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }

  // ── Render Gate / Home Scene ─────────────────────────────────────
  renderGate() {
    if (!this.gCtx || !this.gateCanvas || this.gateCanvas.offsetParent === null) return;
    const ctx = this.gCtx;
    const w = this.gateCanvas.width;
    const h = this.gateCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Warm sacrificial fire glow at bottom center
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.95, 20, w * 0.5, h * 0.95, w * 0.6);
    fireGrad.addColorStop(0, "rgba(230, 95, 25, 0.28)");
    fireGrad.addColorStop(0.5, "rgba(160, 45, 12, 0.12)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    // Rising Sacred Embers
    for (const p of this.gateEmbers) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.pulse) * 0.5;
      p.pulse += 0.03;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ── Render Cinema Story Moments ──────────────────────────────────
  renderCinema() {
    if (!this.cCtx || !this.cinemaCanvas) return;
    const ctx = this.cCtx;
    const w = this.cinemaCanvas.width;
    const h = this.cinemaCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Screen flash effect
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(180, 50, 240, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.04);
    }

    // 1. Curse Beam (`parikshit-shamika`)
    if (this.activeEvent === "parikshit-shamika" && this.curseBeam) {
      this.renderCurseBeam(ctx, w, h);
    }

    // 2. Sarpa Satra Fire & Nagas (`janamejaya-sarpa-satra` & `astika-stops-satra`)
    if (this.activeEvent === "janamejaya-sarpa-satra" || this.activeEvent === "astika-stops-satra") {
      this.renderSarpaSatra(ctx, w, h);
    }

    // 3. Garuda Divine Sunbeams (`garuda-amrita`)
    if (this.activeEvent === "garuda-amrita") {
      this.renderGarudaRays(ctx, w, h);
    }

    // 4. Astika Shanti Mandala (`astika-stops-satra`)
    if (this.mandala.active) {
      this.renderMandala(ctx, w, h);
    }

    // Render general active particles (explosions, sparks)
    for (let i = this.cinemaParticles.length - 1; i >= 0; i--) {
      const p = this.cinemaParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.cinemaParticles.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Curse beam traveling from Shringin (left) to Parikshit (center)
  renderCurseBeam(ctx, w, h) {
    const sx = w * 0.16; // Shringin's raised arm
    const sy = h * 0.42;
    const tx = w * 0.52; // Parikshit's neck/shoulder
    const ty = h * 0.52;

    this.curseBeam.progress = Math.min(1, this.curseBeam.progress + 0.035);
    const currX = sx + (tx - sx) * this.curseBeam.progress;
    const currY = sy + (ty - sy) * this.curseBeam.progress;

    ctx.save();
    // Glowing beam line with lightning jitter
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    const segments = 12;
    for (let i = 1; i <= segments * this.curseBeam.progress; i++) {
      const segRatio = i / segments;
      const lx = sx + (tx - sx) * segRatio + (Math.random() - 0.5) * 12;
      const ly = sy + (ty - sy) * segRatio + (Math.random() - 0.5) * 12;
      ctx.lineTo(lx, ly);
    }
    ctx.strokeStyle = "#e040fb";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#f50057";
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Inner bright core
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    // Impact ring at target
    if (this.curseBeam.progress >= 0.95) {
      const pulse = (Date.now() % 1000) / 1000;
      ctx.beginPath();
      ctx.arc(tx, ty, 20 + pulse * 40, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 64, 129, ${1 - pulse})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Sarpa Satra Fire Vortex & Falling Serpents
  renderSarpaSatra(ctx, w, h) {
    ctx.save();

    // Bottom fiery vortex glow
    const fireHeight = this.mandala.active ? h * 0.9 : h * 0.72;
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.95, 30, w * 0.5, h * 0.95, w * 0.55);
    fireGrad.addColorStop(0, this.mandala.active ? "rgba(240, 200, 80, 0.4)" : "rgba(255, 70, 10, 0.65)");
    fireGrad.addColorStop(0.6, this.mandala.active ? "rgba(180, 140, 40, 0.2)" : "rgba(180, 30, 5, 0.35)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    // Falling serpents
    for (const s of this.serpents) {
      // If mandala is active, serpents float gently upward instead of plunging into fire!
      if (this.mandala.active) {
        s.y -= 0.8;
      } else {
        s.y += s.speed;
        s.x += (s.targetX - s.x) * 0.015;
      }
      s.phase += 0.08;

      if (s.y > h * 0.85) {
        s.y = -60;
        s.x = 0.2 * w + Math.random() * 0.6 * w;
      }

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      for (let j = 0; j < s.length; j += 4) {
        const sx = s.x + Math.sin(s.phase + j * 0.18) * 8;
        const sy = s.y - j;
        ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = `${s.hue} ${s.alpha})`;
      ctx.lineWidth = s.thickness;
      ctx.shadowBlur = 8;
      ctx.shadowColor = s.hue + " 0.8)";
      ctx.stroke();
    }
    ctx.restore();
  }

  // Divine Golden Sunbeams for Garuda
  renderGarudaRays(ctx, w, h) {
    ctx.save();
    const time = Date.now() * 0.001;
    const cx = w * 0.5;
    const cy = h * 0.2;

    const numRays = 12;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + time * 0.15;
      const length = w * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - 0.08) * length, cy + Math.sin(angle - 0.08) * length);
      ctx.lineTo(cx + Math.cos(angle + 0.08) * length, cy + Math.sin(angle + 0.08) * length);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 215, 64, 0.04)";
      ctx.fill();
    }
    ctx.restore();
  }

  // Astika's Expanding Golden Shanti Mandala
  renderMandala(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.65;

    this.mandala.radius = Math.min(w * 0.6, this.mandala.radius + 3.5);
    const r = this.mandala.radius;
    const rot = Date.now() * 0.0008;

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Sacred concentric geometry
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(245, 215, 120, ${this.mandala.alpha})`;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#ffd54f";
    ctx.stroke();

    // 8-petal inner lotus geometry
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (r * 0.5), Math.sin(angle) * (r * 0.5), r * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 235, 160, ${this.mandala.alpha * 0.5})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }
}
