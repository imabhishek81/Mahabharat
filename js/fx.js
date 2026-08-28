// ================================================================
// महाभारत-कथाचक्र — Dynamic Canvas Story & Map FX Engine
// ================================================================

export class StoryFX {
  constructor() {
    this.gateCanvas = document.getElementById("gate-canvas");
    this.mapCanvas = document.getElementById("map-canvas");
    this.cinemaCanvas = document.getElementById("cinema-canvas");

    this.gCtx = this.gateCanvas ? this.gateCanvas.getContext("2d") : null;
    this.mCtx = this.mapCanvas ? this.mapCanvas.getContext("2d") : null;
    this.cCtx = this.cinemaCanvas ? this.cinemaCanvas.getContext("2d") : null;

    this.activeEvent = null;
    this.currentTime = 0;
    this.lineIndex = 0;
    this.isPlaying = false;
    this.rafId = null;

    // Particle & animation pools
    this.gateEmbers = [];
    this.mapSmoke = [];
    this.mapSparks = [];
    this.mapRipples = [];
    this.cinemaParticles = [];
    this.venomDrips = [];
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
    this.initMapFX();
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
    const count = Math.min(70, Math.floor(window.innerWidth / 20));
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

  initMapFX() {
    // Altar smoke particles (native map coord space: 2800 x 1800)
    this.mapSmoke = [];
    for (let i = 0; i < 35; i++) {
      this.mapSmoke.push({
        x: 640 + (Math.random() - 0.5) * 60,
        y: 1040 - Math.random() * 500,
        vx: -0.35 - Math.random() * 0.4,
        vy: -1.2 - Math.random() * 1.6,
        size: 15 + Math.random() * 45,
        alpha: 0.1 + Math.random() * 0.35,
        growth: 0.15 + Math.random() * 0.25
      });
    }

    // Fire sparks
    this.mapSparks = [];
    for (let i = 0; i < 25; i++) {
      this.mapSparks.push({
        x: 640 + (Math.random() - 0.5) * 50,
        y: 1060 - Math.random() * 150,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1.8 - Math.random() * 2.2,
        size: 2 + Math.random() * 3,
        alpha: 0.4 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Ocean ripples
    this.mapRipples = [];
    for (let i = 0; i < 20; i++) {
      this.mapRipples.push({
        x: 300 + Math.random() * 2200,
        y: 1400 + Math.random() * 350,
        r: 10 + Math.random() * 40,
        maxR: 50 + Math.random() * 60,
        alpha: 0.1 + Math.random() * 0.4,
        speed: 0.4 + Math.random() * 0.6
      });
    }
  }

  setEvent(eventId) {
    this.activeEvent = eventId;
    this.currentTime = 0;
    this.lineIndex = 0;
    this.cinemaParticles = [];
    this.venomDrips = [];
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

    if (this.activeEvent === "parikshit-shamika") {
      if (lineIdx >= 4 && !this.curseBeam) {
        this.curseBeam = { progress: 0, active: true };
      }
    } else if (this.activeEvent === "takshaka-kills-parikshit") {
      if (lineIdx >= 5 && this.flashAlpha === 0) {
        this.flashAlpha = 0.9;
        this.spawnVenomBurst();
      }
    } else if (this.activeEvent === "astika-stops-satra") {
      if (lineIdx >= 4 && !this.mandala.active) {
        this.mandala.active = true;
        this.mandala.radius = 10;
        this.mandala.alpha = 0.95;
      }
    }
  }

  initSarpaSatra() {
    this.serpents = [];
    for (let i = 0; i < 16; i++) {
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
      length: 30 + Math.random() * 50,
      speed: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      thickness: 2.5 + Math.random() * 3,
      alpha: 0.6 + Math.random() * 0.4,
      hue: Math.random() > 0.5 ? "rgba(230, 100, 30," : "rgba(90, 20, 140,"
    });
  }

  spawnVenomBurst() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 9;
      this.cinemaParticles.push({
        x: w * 0.68,
        y: h * 0.48,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 8,
        alpha: 1,
        color: Math.random() > 0.5 ? "#40ff80" : "#b030f0",
        decay: 0.015 + Math.random() * 0.02
      });
    }
  }

  startLoop() {
    const render = () => {
      this.renderGate();
      this.renderMap();
      this.renderCinema();
      this.rafId = requestAnimationFrame(render);
    };
    this.rafId = requestAnimationFrame(render);
  }

  // ════════════════════════════════════════════════════════════════
  // 1. GATE / HOME ANIMATION
  // ════════════════════════════════════════════════════════════════
  renderGate() {
    if (!this.gCtx || !this.gateCanvas || this.gateCanvas.offsetParent === null) return;
    const ctx = this.gCtx;
    const w = this.gateCanvas.width;
    const h = this.gateCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Warm sacrificial fire glow at bottom center
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.95, 20, w * 0.5, h * 0.95, w * 0.65);
    fireGrad.addColorStop(0, "rgba(240, 105, 25, 0.32)");
    fireGrad.addColorStop(0.5, "rgba(160, 45, 12, 0.15)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    // Rising Sacred Embers
    for (const p of this.gateEmbers) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.pulse) * 0.6;
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

  // ════════════════════════════════════════════════════════════════
  // 2. MAP ANIMATION (Living Serpents, Sacrificial Fire, Causal Flows)
  // ════════════════════════════════════════════════════════════════
  renderMap() {
    if (!this.mCtx || !this.mapCanvas) return;
    const ctx = this.mCtx;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, 2800, 1800);

    // ── A. Animated Sacrificial Fire Altar (x: 640, y: 1070) ───────
    ctx.save();
    const altarX = 640;
    const altarY = 1070;

    // Altar base fiery pulsing aura
    const altarAura = ctx.createRadialGradient(altarX, altarY, 20, altarX, altarY, 180);
    const pulseIntensity = 0.45 + Math.sin(time * 4) * 0.15;
    altarAura.addColorStop(0, `rgba(255, 120, 20, ${pulseIntensity})`);
    altarAura.addColorStop(0.6, `rgba(200, 40, 10, ${pulseIntensity * 0.5})`);
    altarAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = altarAura;
    ctx.beginPath();
    ctx.arc(altarX, altarY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Procedural multi-flame licking
    const flames = 7;
    for (let f = 0; f < flames; f++) {
      const offset = (f - 3) * 14;
      const fTime = time * 5 + f * 1.2;
      const fh = 55 + Math.sin(fTime) * 25 + Math.cos(fTime * 1.5) * 15;
      const fGrad = ctx.createLinearGradient(altarX + offset, altarY, altarX + offset, altarY - fh);
      fGrad.addColorStop(0, "rgba(255, 240, 140, 0.9)");
      fGrad.addColorStop(0.4, "rgba(255, 130, 20, 0.8)");
      fGrad.addColorStop(1, "rgba(220, 30, 5, 0)");

      ctx.beginPath();
      ctx.moveTo(altarX + offset - 12, altarY);
      ctx.quadraticCurveTo(
        altarX + offset + Math.sin(fTime * 0.8) * 15,
        altarY - fh * 0.6,
        altarX + offset,
        altarY - fh
      );
      ctx.quadraticCurveTo(
        altarX + offset + Math.cos(fTime * 0.8) * 15,
        altarY - fh * 0.6,
        altarX + offset + 12,
        altarY
      );
      ctx.fillStyle = fGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff7700";
      ctx.fill();
    }

    // Billowing smoke particles drifting to top-left
    for (const sm of this.mapSmoke) {
      sm.x += sm.vx + Math.sin(time + sm.y * 0.01) * 0.4;
      sm.y += sm.vy;
      sm.size += sm.growth * 0.1;
      if (sm.y < 350) {
        sm.y = altarY - 20;
        sm.x = altarX + (Math.random() - 0.5) * 40;
        sm.size = 15 + Math.random() * 20;
      }
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(40, 25, 20, ${sm.alpha * (sm.y / 1000)})`;
      ctx.shadowBlur = 0;
      ctx.fill();
    }

    // Ascending sparks
    for (const sp of this.mapSparks) {
      sp.x += sp.vx + Math.sin(sp.pulse) * 0.8;
      sp.y += sp.vy;
      sp.pulse += 0.08;
      if (sp.y < 700) {
        sp.y = altarY - 30;
        sp.x = altarX + (Math.random() - 0.5) * 40;
      }
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd54f";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#ff9800";
      ctx.fill();
    }
    ctx.restore();

    // ── B. Living Undulating Serpents in Subterranean Ocean ────────
    ctx.save();
    // Naga positions in the painted ocean
    const nagas = [
      { x: 520, y: 1540, length: 180, scale: 1.1, phase: 0 },
      { x: 920, y: 1580, length: 190, scale: 1.15, phase: 2.1 },
      { x: 1860, y: 1610, length: 170, scale: 1.05, phase: 4.3 },
      { x: 2160, y: 1550, length: 160, scale: 1.0, phase: 1.5 }
    ];

    for (const naga of nagas) {
      const nTime = time * 1.6 + naga.phase;
      const swayX = Math.sin(nTime) * 22;
      const swayY = Math.cos(nTime * 1.2) * 12;

      // Serpent aura glow
      const aura = ctx.createRadialGradient(
        naga.x + swayX,
        naga.y + swayY - 40,
        15,
        naga.x + swayX,
        naga.y + swayY,
        130
      );
      aura.addColorStop(0, "rgba(80, 220, 160, 0.22)");
      aura.addColorStop(0.5, "rgba(40, 140, 100, 0.1)");
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(naga.x + swayX, naga.y + swayY, 130, 0, Math.PI * 2);
      ctx.fill();

      // Undulating ethereal spine lines following the painted serpent body
      ctx.beginPath();
      ctx.moveTo(naga.x + swayX, naga.y + swayY - 60);
      for (let s = 0; s < naga.length; s += 8) {
        const bodySway = Math.sin(nTime + s * 0.06) * 24;
        ctx.lineTo(naga.x + bodySway + swayX * 0.5, naga.y - 60 + s);
      }
      ctx.strokeStyle = "rgba(100, 240, 180, 0.4)";
      ctx.lineWidth = 6 * naga.scale;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#40ffaa";
      ctx.stroke();

      // Inner luminous core
      ctx.strokeStyle = "rgba(230, 255, 240, 0.7)";
      ctx.lineWidth = 2 * naga.scale;
      ctx.stroke();

      // Flickering snake tongue
      if (Math.sin(nTime * 4) > 0.65) {
        ctx.beginPath();
        const tx = naga.x + swayX + Math.sin(nTime) * 6;
        const ty = naga.y + swayY - 75;
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 6, ty - 18);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 6, ty - 18);
        ctx.strokeStyle = "#ff4081";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#f50057";
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
    }

    // Water wave ripples around serpents
    for (const rp of this.mapRipples) {
      rp.r += rp.speed;
      if (rp.r > rp.maxR) {
        rp.r = 10;
        rp.x = 300 + Math.random() * 2200;
        rp.y = 1420 + Math.random() * 320;
      }
      const alpha = rp.alpha * (1 - rp.r / rp.maxR);
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rp.r * 1.6, rp.r * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160, 220, 240, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(120, 200, 255, 0.4)";
      ctx.stroke();
    }
    ctx.restore();

    // ── C. Causal Karma Pulses along Lines ──────────────────────────
    ctx.save();
    // Flow 1: Parikshit (x: 938, y: 936) -> Takshaka (x: 1250, y: 936) -> Satra (x: 1560, y: 936) -> Astika Stops (x: 1960, y: 936)
    const spineNodes = [
      { x: 938, y: 936 },
      { x: 1250, y: 936 },
      { x: 1560, y: 936 },
      { x: 1960, y: 936 }
    ];
    for (let i = 0; i < spineNodes.length - 1; i++) {
      const p1 = spineNodes[i];
      const p2 = spineNodes[i + 1];
      const pProgress = (time * 0.4 + i * 0.25) % 1;
      const px = p1.x + (p2.x - p1.x) * pProgress;
      const py = p1.y + (p2.y - p1.y) * pProgress;

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd54f";
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#ffb300";
      ctx.fill();
    }
    ctx.restore();
  }

  // ════════════════════════════════════════════════════════════════
  // 3. CINEMA STORY SCENE ANIMATION
  // ════════════════════════════════════════════════════════════════
  renderCinema() {
    if (!this.cCtx || !this.cinemaCanvas) return;
    const ctx = this.cCtx;
    const w = this.cinemaCanvas.width;
    const h = this.cinemaCanvas.height;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    // Screen flash effect on dramatic events
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(180, 50, 240, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.04);
    }

    // Scene 1: Curse Beam & Forest Spirits (`parikshit-shamika`)
    if (this.activeEvent === "parikshit-shamika") {
      this.renderShamikaScene(ctx, w, h, time);
    }

    // Scene 2: Takshaka Venom Drips & Palace Torches (`takshaka-kills-parikshit`)
    if (this.activeEvent === "takshaka-kills-parikshit") {
      this.renderTakshakaBite(ctx, w, h, time);
    }

    // Scene 3 & 8: Sarpa Satra Fire & Nagas
    if (this.activeEvent === "janamejaya-sarpa-satra" || this.activeEvent === "astika-stops-satra") {
      this.renderSarpaSatra(ctx, w, h, time);
    }

    // Scene 5: Garuda Divine Sunbeams
    if (this.activeEvent === "garuda-amrita") {
      this.renderGarudaRays(ctx, w, h, time);
    }

    // Scene 8: Astika Shanti Mandala
    if (this.mandala.active) {
      this.renderMandala(ctx, w, h);
    }

    // Active particle pool
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

  // ── Cinema: Shamika & Shringin Curse Scene ───────────────────────
  renderShamikaScene(ctx, w, h, time) {
    ctx.save();
    // Shringin's angry aura (left character x: 16%, y: 40%)
    const sx = w * 0.16;
    const sy = h * 0.4;
    const shringinAura = ctx.createRadialGradient(sx, sy, 20, sx, sy, 110);
    const pulse = 0.35 + Math.sin(time * 3) * 0.15;
    shringinAura.addColorStop(0, `rgba(255, 60, 40, ${pulse})`);
    shringinAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shringinAura;
    ctx.beginPath();
    ctx.arc(sx, sy, 110, 0, Math.PI * 2);
    ctx.fill();

    // Dead snake spirit shimmer on Shamika's shoulder (x: 68%, y: 55%)
    const snakeX = w * 0.68;
    const snakeY = h * 0.55;
    ctx.beginPath();
    ctx.arc(snakeX, snakeY, 40 + Math.sin(time * 2) * 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(140, 220, 255, ${0.4 + Math.sin(time * 2.5) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#80d8ff";
    ctx.stroke();

    // Curse beam traveling
    if (this.curseBeam) {
      this.renderCurseBeam(ctx, w, h);
    }
    ctx.restore();
  }

  renderCurseBeam(ctx, w, h) {
    const sx = w * 0.16;
    const sy = h * 0.42;
    const tx = w * 0.52;
    const ty = h * 0.52;

    this.curseBeam.progress = Math.min(1, this.curseBeam.progress + 0.035);
    ctx.save();
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

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

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

  // ── Cinema: Takshaka Bite Scene ──────────────────────────────────
  renderTakshakaBite(ctx, w, h, time) {
    ctx.save();
    const biteX = w * 0.69;
    const biteY = h * 0.47;

    // Poisonous purple-emerald smoke rising from the bite wound
    if (Math.random() > 0.4) {
      this.cinemaParticles.push({
        x: biteX + (Math.random() - 0.5) * 20,
        y: biteY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.2 - Math.random() * 1.5,
        size: 8 + Math.random() * 14,
        alpha: 0.7,
        color: Math.random() > 0.5 ? "#40ff80" : "#a832e0",
        decay: 0.02
      });
    }

    // Animated venom droplets dripping from fangs
    if (Math.random() > 0.65) {
      this.venomDrips.push({
        x: biteX + (Math.random() - 0.5) * 10,
        y: biteY - 10,
        vy: 2.5 + Math.random() * 2,
        size: 2.5 + Math.random() * 2,
        alpha: 0.9
      });
    }

    for (let i = this.venomDrips.length - 1; i >= 0; i--) {
      const d = this.venomDrips[i];
      d.y += d.vy;
      if (d.y > biteY + 70) {
        this.venomDrips.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ff1744";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#d50000";
      ctx.fill();
    }

    // Palace Oil Lamps Flickering (Left sconce x: 25%, y: 55%; Right sconce x: 96%, y: 65%)
    const lamps = [
      { x: w * 0.25, y: h * 0.54 },
      { x: w * 0.08, y: h * 0.62 },
      { x: w * 0.96, y: h * 0.64 }
    ];
    for (const lamp of lamps) {
      const lTime = time * 6 + lamp.x;
      const lh = 18 + Math.sin(lTime) * 6;
      const lGrad = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 45);
      lGrad.addColorStop(0, "rgba(255, 210, 100, 0.8)");
      lGrad.addColorStop(0.5, "rgba(255, 120, 20, 0.4)");
      lGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Cinema: Sarpa Satra Fire Vortex ──────────────────────────────
  renderSarpaSatra(ctx, w, h, time) {
    ctx.save();
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.95, 30, w * 0.5, h * 0.95, w * 0.55);
    fireGrad.addColorStop(0, this.mandala.active ? "rgba(240, 200, 80, 0.4)" : "rgba(255, 70, 10, 0.65)");
    fireGrad.addColorStop(0.6, this.mandala.active ? "rgba(180, 140, 40, 0.2)" : "rgba(180, 30, 5, 0.35)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    for (const s of this.serpents) {
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

  // ── Cinema: Garuda Rays ──────────────────────────────────────────
  renderGarudaRays(ctx, w, h, time) {
    ctx.save();
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

  // ── Cinema: Astika Shanti Mandala ────────────────────────────────
  renderMandala(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.65;

    this.mandala.radius = Math.min(w * 0.6, this.mandala.radius + 3.5);
    const r = this.mandala.radius;
    const rot = Date.now() * 0.0008;

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(245, 215, 120, ${this.mandala.alpha})`;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#ffd54f";
    ctx.stroke();

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
