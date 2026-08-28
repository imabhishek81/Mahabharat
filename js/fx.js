// ================================================================
// महाभारत-कथाचक्र — Universal Canvas Story & Map FX Engine (All 10 Scenes)
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

    // Particle & animation state
    this.gateEmbers = [];
    this.mapSmoke = [];
    this.mapSparks = [];
    this.mapRipples = [];
    this.cinemaParticles = [];
    this.venomDrips = [];
    this.fallingSerpents = [];
    this.floatingGlyphs = [];
    this.lotusPetals = [];
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
    // Altar smoke particles (2800 x 1800)
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
    this.fallingSerpents = [];
    this.floatingGlyphs = [];
    this.lotusPetals = [];
    this.curseBeam = null;
    this.mandala = { radius: 0, alpha: 0, active: false };
    this.flashAlpha = 0;

    // Scene-specific initializations
    if (eventId === "janamejaya-sarpa-satra" || eventId === "astika-stops-satra") {
      this.initFallingSerpents();
    } else if (eventId === "elapatra-prophecy") {
      this.initGlyphs();
    } else if (eventId === "astika-born") {
      this.initLotusPetals();
    }
  }

  updateAudio(time, lineIdx, isPlaying) {
    this.currentTime = time;
    this.lineIndex = lineIdx;
    this.isPlaying = isPlaying;

    // Dynamic moments triggered by narrative lines
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
    } else if (this.activeEvent === "kadru-vinata-wager") {
      if (lineIdx >= 5 && this.flashAlpha === 0) {
        this.flashAlpha = 0.6;
      }
    }
  }

  initFallingSerpents() {
    this.fallingSerpents = [];
    const w = window.innerWidth;
    for (let i = 0; i < 18; i++) {
      this.fallingSerpents.push({
        x: 0.15 * w + Math.random() * 0.7 * w,
        y: -40 - Math.random() * 350,
        targetX: w * 0.5 + (Math.random() - 0.5) * (w * 0.35),
        length: 25 + Math.random() * 55,
        speed: 1.8 + Math.random() * 3.2,
        phase: Math.random() * Math.PI * 2,
        thickness: 2.5 + Math.random() * 3,
        alpha: 0.5 + Math.random() * 0.5,
        hue: Math.random() > 0.5 ? "rgba(240, 110, 30," : "rgba(100, 30, 160,"
      });
    }
  }

  initGlyphs() {
    this.floatingGlyphs = [];
    const glyphs = ["आस्तीक", "ब्रह्मवचन", "अभय", "शान्ति", "धर्म", "ऋत"];
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 15; i++) {
      this.floatingGlyphs.push({
        text: glyphs[i % glyphs.length],
        x: 0.2 * w + Math.random() * 0.6 * w,
        y: h * 0.8 - Math.random() * (h * 0.5),
        vy: -0.4 - Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        size: 16 + Math.random() * 14,
        alpha: 0.3 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  initLotusPetals() {
    this.lotusPetals = [];
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 22; i++) {
      this.lotusPetals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0.4 + Math.random() * 0.8,
        vy: 0.6 + Math.random() * 1.2,
        size: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        alpha: 0.4 + Math.random() * 0.5
      });
    }
  }

  spawnVenomBurst() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < 80; i++) {
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

    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.95, 20, w * 0.5, h * 0.95, w * 0.65);
    fireGrad.addColorStop(0, "rgba(240, 105, 25, 0.32)");
    fireGrad.addColorStop(0.5, "rgba(160, 45, 12, 0.15)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

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

    // A. Sacrificial Fire Altar (x: 640, y: 1070)
    ctx.save();
    const altarX = 640;
    const altarY = 1070;

    const altarAura = ctx.createRadialGradient(altarX, altarY, 20, altarX, altarY, 180);
    const pulseIntensity = 0.45 + Math.sin(time * 4) * 0.15;
    altarAura.addColorStop(0, `rgba(255, 120, 20, ${pulseIntensity})`);
    altarAura.addColorStop(0.6, `rgba(200, 40, 10, ${pulseIntensity * 0.5})`);
    altarAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = altarAura;
    ctx.beginPath();
    ctx.arc(altarX, altarY, 180, 0, Math.PI * 2);
    ctx.fill();

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

    // B. Living Undulating Serpents in Subterranean Ocean
    ctx.save();
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

      ctx.strokeStyle = "rgba(230, 255, 240, 0.7)";
      ctx.lineWidth = 2 * naga.scale;
      ctx.stroke();

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

    // C. Causal Karma Pulses along Lines
    ctx.save();
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
  // 3. CINEMA STORY SCENE ANIMATIONS (All 10 Events)
  // ════════════════════════════════════════════════════════════════
  renderCinema() {
    if (!this.cCtx || !this.cinemaCanvas) return;
    const ctx = this.cCtx;
    const w = this.cinemaCanvas.width;
    const h = this.cinemaCanvas.height;
    const time = Date.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(180, 50, 240, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.04);
    }

    switch (this.activeEvent) {
      case "parikshit-shamika":
        this.renderScene1_Shamika(ctx, w, h, time);
        break;
      case "takshaka-kills-parikshit":
        this.renderScene2_Takshaka(ctx, w, h, time);
        break;
      case "janamejaya-sarpa-satra":
        this.renderScene3_SarpaSatra(ctx, w, h, time);
        break;
      case "kadru-vinata-wager":
        this.renderScene4_Wager(ctx, w, h, time);
        break;
      case "garuda-amrita":
        this.renderScene5_Garuda(ctx, w, h, time);
        break;
      case "elapatra-prophecy":
        this.renderScene6_Elapatra(ctx, w, h, time);
        break;
      case "astika-born":
        this.renderScene7_AstikaBorn(ctx, w, h, time);
        break;
      case "astika-stops-satra":
        this.renderScene8_AstikaStops(ctx, w, h, time);
        break;
      case "naimisha-satra":
        this.renderScene9_Naimisha(ctx, w, h, time);
        break;
      case "vyasa-vaishampayana":
        this.renderScene10_Vyasa(ctx, w, h, time);
        break;
    }

    // Render general active particle pool
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

  // ── Event 1: Parikshit & Shamika's Hermitage ──────────────────────
  renderScene1_Shamika(ctx, w, h, time) {
    ctx.save();
    // Shringin's raised fist angry flare (x: 16%, y: 40%)
    const sx = w * 0.16;
    const sy = h * 0.4;
    const shringinAura = ctx.createRadialGradient(sx, sy, 15, sx, sy, 110);
    const pulse = 0.35 + Math.sin(time * 3) * 0.15;
    shringinAura.addColorStop(0, `rgba(255, 60, 40, ${pulse})`);
    shringinAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shringinAura;
    ctx.beginPath();
    ctx.arc(sx, sy, 110, 0, Math.PI * 2);
    ctx.fill();

    // Dead snake spirit shimmer on Shamika's neck (x: 68%, y: 55%)
    const snakeX = w * 0.68;
    const snakeY = h * 0.55;
    ctx.beginPath();
    ctx.arc(snakeX, snakeY, 42 + Math.sin(time * 2) * 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(140, 220, 255, ${0.4 + Math.sin(time * 2.5) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#80d8ff";
    ctx.stroke();

    // Crackling curse lightning beam
    if (this.curseBeam) {
      this.curseBeam.progress = Math.min(1, this.curseBeam.progress + 0.035);
      const tx = w * 0.52;
      const ty = h * 0.52;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const segments = 14;
      for (let i = 1; i <= segments * this.curseBeam.progress; i++) {
        const segRatio = i / segments;
        const lx = sx + (tx - sx) * segRatio + (Math.random() - 0.5) * 14;
        const ly = sy + (ty - sy) * segRatio + (Math.random() - 0.5) * 14;
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
    }
    ctx.restore();
  }

  // ── Event 2: Takshaka Slays Parikshit ────────────────────────────
  renderScene2_Takshaka(ctx, w, h, time) {
    ctx.save();
    const biteX = w * 0.69;
    const biteY = h * 0.47;

    // Toxic purple-green smoke curling from wound
    if (Math.random() > 0.35) {
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

    // Venom droplets dripping from fangs
    if (Math.random() > 0.6) {
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

    // Palace Oil Lamps Flickering
    const lamps = [
      { x: w * 0.25, y: h * 0.54 },
      { x: w * 0.08, y: h * 0.62 },
      { x: w * 0.96, y: h * 0.64 }
    ];
    for (const lamp of lamps) {
      const lGrad = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 45);
      lGrad.addColorStop(0, "rgba(255, 210, 100, 0.85)");
      lGrad.addColorStop(0.5, "rgba(255, 120, 20, 0.4)");
      lGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, 45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Event 3: Janamejaya's Snake Sacrifice ────────────────────────
  renderScene3_SarpaSatra(ctx, w, h, time) {
    ctx.save();
    // Blazing sacrificial fire pit at bottom
    const fireGrad = ctx.createRadialGradient(w * 0.5, h * 0.92, 40, w * 0.5, h * 0.92, w * 0.6);
    fireGrad.addColorStop(0, "rgba(255, 80, 10, 0.75)");
    fireGrad.addColorStop(0.5, "rgba(200, 40, 5, 0.4)");
    fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, w, h);

    // Falling serpents spiraling into fire
    for (const s of this.fallingSerpents) {
      s.y += s.speed;
      s.x += (s.targetX - s.x) * 0.015;
      s.phase += 0.08;

      if (s.y > h * 0.85) {
        s.y = -60;
        s.x = 0.15 * w + Math.random() * 0.7 * w;
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
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.hue + " 0.8)";
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Event 4: Kadru & Vinata's Wager ──────────────────────────────
  renderScene4_Wager(ctx, w, h, time) {
    ctx.save();
    // Divine white horse radiance (center-left x: 42%, y: 45%)
    const horseX = w * 0.42;
    const horseY = h * 0.45;
    const horseAura = ctx.createRadialGradient(horseX, horseY, 30, horseX, horseY, 200);
    horseAura.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    horseAura.addColorStop(0.6, "rgba(200, 230, 255, 0.15)");
    horseAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = horseAura;
    ctx.beginPath();
    ctx.arc(horseX, horseY, 200, 0, Math.PI * 2);
    ctx.fill();

    // Black shadow serpents coiling on tail (x: 48%, y: 52%)
    const tailX = w * 0.48;
    const tailY = h * 0.52;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const sw = Math.sin(time * 3 + k * 1.5) * 12;
      ctx.moveTo(tailX + sw, tailY - 20 + k * 10);
      ctx.lineTo(tailX - sw, tailY + 20 + k * 10);
    }
    ctx.strokeStyle = "rgba(20, 10, 30, 0.85)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Ocean waves at bottom
    ctx.beginPath();
    for (let x = 0; x < w; x += 20) {
      const y = h * 0.88 + Math.sin(time * 2 + x * 0.02) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(120, 200, 240, 0.45)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // ── Event 5: Garuda Fetches the Amrita ────────────────────────────
  renderScene5_Garuda(ctx, w, h, time) {
    ctx.save();
    const cx = w * 0.5;
    const cy = h * 0.25;

    // Divine golden rays
    const numRays = 12;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 + time * 0.15;
      const length = w * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - 0.08) * length, cy + Math.sin(angle - 0.08) * length);
      ctx.lineTo(cx + Math.cos(angle + 0.08) * length, cy + Math.sin(angle + 0.08) * length);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 215, 64, 0.05)";
      ctx.fill();
    }

    // Shimmering Amrita droplets
    if (Math.random() > 0.5) {
      this.cinemaParticles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + 30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.5 + Math.random() * 2,
        size: 3 + Math.random() * 4,
        alpha: 0.9,
        color: "#ffd700",
        decay: 0.025
      });
    }
    ctx.restore();
  }

  // ── Event 6: Elapatra's Prophecy in Naga Council ─────────────────
  renderScene6_Elapatra(ctx, w, h, time) {
    ctx.save();
    // Subterranean glowing crystals / prophecy glyphs
    ctx.font = "italic 20px 'Tiro Devanagari Hindi', serif";
    ctx.textAlign = "center";
    for (const g of this.floatingGlyphs) {
      g.y += g.vy;
      g.x += g.vx;
      g.pulse += 0.04;
      if (g.y < h * 0.2) {
        g.y = h * 0.8;
        g.x = 0.2 * w + Math.random() * 0.6 * w;
      }
      ctx.fillStyle = `rgba(100, 240, 200, ${g.alpha * (0.6 + Math.sin(g.pulse) * 0.4)})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#40ffaa";
      ctx.fillText(g.text, g.x, g.y);
    }
    ctx.restore();
  }

  // ── Event 7: Birth of Sage Astika ────────────────────────────────
  renderScene7_AstikaBorn(ctx, w, h, time) {
    ctx.save();
    // Golden Vedic halo over the newborn child (x: 50%, y: 50%)
    const cx = w * 0.5;
    const cy = h * 0.5;
    const childAura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
    childAura.addColorStop(0, "rgba(255, 235, 120, 0.45)");
    childAura.addColorStop(0.7, "rgba(255, 180, 50, 0.15)");
    childAura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = childAura;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();

    // Floating pink & gold lotus petals
    for (const p of this.lotusPetals) {
      p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.5;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 180, 200, 0.55)";
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ── Event 8: Astika Halts the Sacrifice ──────────────────────────
  renderScene8_AstikaStops(ctx, w, h, time) {
    ctx.save();
    // Expanding golden Vedic Shanti Mandala
    const cx = w * 0.5;
    const cy = h * 0.62;

    this.mandala.radius = Math.min(w * 0.65, this.mandala.radius + 3.5);
    const r = this.mandala.radius;
    const rot = time * 0.25;

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(245, 215, 120, ${this.mandala.alpha})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ffd54f";
    ctx.stroke();

    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (r * 0.5), Math.sin(angle) * (r * 0.5), r * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 235, 160, ${this.mandala.alpha * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Event 9: Naimisha Forest 12-Year Sattra ───────────────────────
  renderScene9_Naimisha(ctx, w, h, time) {
    ctx.save();
    // Sacred Ghee havan smoke drifting upward
    const hx = w * 0.45;
    const hy = h * 0.65;

    if (Math.random() > 0.4) {
      this.cinemaParticles.push({
        x: hx + (Math.random() - 0.5) * 30,
        y: hy,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.8 - Math.random() * 1.2,
        size: 10 + Math.random() * 18,
        alpha: 0.5,
        color: "rgba(255, 230, 180, 0.4)",
        decay: 0.015
      });
    }

    // Glowing forest fireflies
    for (let f = 0; f < 12; f++) {
      const fx = (w * 0.2) + (f * (w * 0.05)) + Math.sin(time * 2 + f) * 20;
      const fy = (h * 0.3) + Math.cos(time * 1.5 + f) * 30;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd54f";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffb300";
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Event 10: Vyasa, Vaishampayana & Transmission ────────────────
  renderScene10_Vyasa(ctx, w, h, time) {
    ctx.save();
    // Cosmic knowledge river flowing between the masters
    const vx = w * 0.35;
    const vy = h * 0.45;
    const disX = w * 0.65;
    const disY = h * 0.5;

    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(
      vx + 80, vy - 60 + Math.sin(time * 2) * 20,
      disX - 80, disY - 60 + Math.cos(time * 2) * 20,
      disX, disY
    );
    ctx.strokeStyle = "rgba(255, 215, 64, 0.65)";
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffd700";
    ctx.stroke();

    // Floating golden knowledge sparks along the stream
    for (let s = 0; s < 8; s++) {
      const prog = (time * 0.3 + s * 0.125) % 1;
      const sx = vx + (disX - vx) * prog;
      const sy = vy + (disY - vy) * prog + Math.sin(prog * Math.PI) * -40;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffd54f";
      ctx.fill();
    }
    ctx.restore();
  }
}
