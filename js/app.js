import {
  WORLD,
  EVENT_ART,
  CHAR_ART,
  nodePos,
  edgeColor,
  typeHi
} from "./meta.js";

const $ = (s) => document.querySelector(s);

const state = {
  events: [],
  characters: [],
  cam: { x: 0, y: 0, k: 0.42 },
  dragging: false,
  moved: 0,
  last: { x: 0, y: 0 },
  selected: null,
  seen: new Set(),
  muted: false,
  drone: null,
  voice: null,
  speaking: false,
  player: null,
  instrument: "tanpura"
};

function byId(list, id) {
  return list.find((x) => x.id === id);
}

function sorted() {
  return [...state.events].sort((a, b) => a.tellingOrder - b.tellingOrder);
}

function artOf(ev) {
  return EVENT_ART[ev.id] || {};
}

function devNum(n) {
  return String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[d]);
}

function stepLabel(ev) {
  return `कथा-बिन्दु ${devNum(ev.tellingOrder)} / ${devNum(state.events.length)}`;
}

async function load() {
  const [ej, cj] = await Promise.all([
    fetch("data/events.json").then((r) => r.json()),
    fetch("data/characters.json").then((r) => r.json())
  ]);
  state.events = ej.events;
  state.characters = cj.characters;
  pickVoice();
  fitCam();
  drawMap();
}

function pickVoice() {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const choose = () => {
    const vs = synth.getVoices();
    state.voice =
      vs.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
      vs.find((v) => /hindi/i.test(v.name)) ||
      null;
  };
  choose();
  synth.addEventListener("voiceschanged", choose);
}

function fitCam() {
  const wrap = $("#map-wrap");
  const k = Math.min(wrap.clientWidth / WORLD.w, wrap.clientHeight / WORLD.h) * 0.98;
  state.cam.k = Math.max(0.32, k);
  state.cam.x = (wrap.clientWidth - WORLD.w * state.cam.k) / 2;
  state.cam.y = (wrap.clientHeight - WORLD.h * state.cam.k) / 2;
  applyCam();
}

function applyCam() {
  $("#world").style.transform = `translate(${state.cam.x}px, ${state.cam.y}px) scale(${state.cam.k})`;
}

function drawMap() {
  const seals = $("#seals");
  const svg = $("#inks");
  seals.innerHTML = "";
  const chips = $("#chips");
  chips.innerHTML = "";
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${WORLD.w} ${WORLD.h}`);

  for (const ev of state.events) {
    for (const c of ev.causes || []) {
      if (c.importance !== "spine") continue;
      const a = byId(state.events, c.fromId);
      if (!a) continue;
      const p1 = nodePos(a);
      const p2 = nodePos(ev);
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 - 40;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`);
      path.setAttribute("class", "ink");
      path.setAttribute("stroke", edgeColor(c.type));
      path.dataset.from = a.id;
      path.dataset.to = ev.id;
      svg.appendChild(path);
      const chip = document.createElement("div");
      chip.className = "cause-chip " + (c.type === "curse" ? "curse" : c.type === "vow/revenge" ? "revenge" : "birth");
      chip.style.left = mx + "px";
      chip.style.top = my + "px";
      chip.innerHTML = `<i></i><span>${typeHi(c.type)}</span>`;
      chips.appendChild(chip);
    }
  }

  for (const ev of state.events) {
    const p = nodePos(ev);
    const wrapEl = document.createElement("div");
    wrapEl.className = "seal-wrap" + (ev.tellingOrder === 1 ? " first" : "");
    wrapEl.style.left = p.x + "px";
    wrapEl.style.top = p.y + "px";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "seal";
    b.style.backgroundImage = `url("${artOf(ev).scene}")`;
    b.dataset.id = ev.id;
    b.setAttribute("aria-label", `${stepLabel(ev)} · ${ev.titleHi}`);
    const num = document.createElement("span");
    num.className = "seal-num";
    num.textContent = devNum(ev.tellingOrder);
    const name = document.createElement("span");
    name.className = "seal-name";
    name.textContent = ev.titleHi;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.moved > 10) return;
      openEvent(ev.id);
    });
    b.addEventListener("pointerenter", () => highlight(ev.id));
    b.addEventListener("pointerleave", () => highlight(null));
    wrapEl.appendChild(b);
    wrapEl.appendChild(num);
    wrapEl.appendChild(name);
    seals.appendChild(wrapEl);
  }
}

function highlight(id) {
  const related = new Set();
  if (id) {
    related.add(id);
    for (const ev of state.events) {
      for (const c of ev.causes || []) {
        if (c.importance !== "spine") continue;
        if (ev.id === id) related.add(c.fromId);
        if (c.fromId === id) related.add(ev.id);
      }
    }
    const ev = byId(state.events, id);
    if (ev) $("#hud-where").textContent = `${stepLabel(ev)} · ${ev.titleHi}`;
  } else if ($("#cinema").hidden) {
    const ev = byId(state.events, state.selected);
    $("#hud-where").textContent = ev
      ? `${stepLabel(ev)} · मानचित्र`
      : "आस्तीक-उपाख्यान · मोहर चुनो";
  }
  document.querySelectorAll(".seal").forEach((el) => {
    const on = !id || related.has(el.dataset.id);
    el.classList.toggle("dim", Boolean(id) && !on);
    el.classList.toggle("hot", el.dataset.id === id);
    el.parentElement?.classList.toggle("dim", Boolean(id) && !on);
  });
  document.querySelectorAll(".ink").forEach((el) => {
    const on = !id || el.dataset.from === id || el.dataset.to === id;
    el.style.opacity = on ? "0.9" : "0.12";
  });
}

function openEvent(id) {
  const ev = byId(state.events, id);
  if (!ev) return;
  state.selected = id;
  const hint = $("#map-hint");
  if (hint) hint.hidden = true;
  document.querySelector(".seal-wrap.first")?.classList.remove("first");
  const newcomers = (ev.characterIds || [])
    .filter((cid) => CHAR_ART[cid] && !state.seen.has(cid));
  showCinema(ev, false).then(() => {
    if (newcomers.length) {
      newcomers.forEach((cid) => state.seen.add(cid));
      showReveal(ev, newcomers);
    }
    speakCurrent();
  });
}

function showReveal(ev, charIds) {
  const box = $("#reveal");
  $("#reveal-scene").src = artOf(ev).scene;
  $("#reveal-step").textContent = stepLabel(ev);
  $("#reveal-event").textContent = ev.titleHi;
  const row = $("#reveal-people");
  row.innerHTML = "";
  charIds.forEach((cid, i) => {
    const meta = CHAR_ART[cid];
    const ch = byId(state.characters, cid);
    const card = document.createElement("div");
    card.className = "person-card";
    card.style.animationDelay = `${0.08 * i}s`;
    card.innerHTML = `<img src="${meta.portrait}" alt="">
      <div><strong>${ch ? ch.nameHi : cid}</strong><em>${meta.hookHi}</em></div>`;
    row.appendChild(card);
  });
  const dust = $("#dust");
  dust.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.style.left = 5 + Math.random() * 90 + "%";
    s.style.top = 30 + Math.random() * 55 + "%";
    s.style.width = s.style.height = (3 + Math.random() * 4) + "px";
    s.style.animationDelay = Math.random() * 1.2 + "s";
    dust.appendChild(s);
  }
  box.hidden = false;
  const close = () => {
    box.hidden = true;
    box.removeEventListener("click", close);
  };
  box.addEventListener("click", close);
  window.setTimeout(() => {
    if (!box.hidden) close();
  }, 4500);
}

function sentences(text) {
  const parts = String(text)
    .split(/(?<=[।?!…])\s*|\s*[—–]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  const out = [];
  for (const part of parts) {
    if (out.length && part.length < 14) {
      out[out.length - 1] = `${out[out.length - 1]} ${part}`;
    } else {
      out.push(part);
    }
  }
  return out.length ? out : [String(text).trim()];
}

async function loadCues(ev) {
  try {
    const r = await fetch(`art/audio/${ev.id}.cues.json?v=7`);
    if (!r.ok) throw new Error("no cues");
    const cues = await r.json();
    if (Array.isArray(cues.lines) && cues.lines.length) return cues;
  } catch (_) {}
  return { lines: sentences(ev.listenHi || ev.summaryHi), starts: null };
}

function lineIndex(cues, t, duration) {
  const lines = cues.lines || [];
  if (!lines.length) return 0;
  const starts = cues.starts;
  if (Array.isArray(starts) && starts.length === lines.length) {
    let i = 0;
    while (i < starts.length - 1 && t >= starts[i + 1]) i += 1;
    return i;
  }
  const weights = lines.map((s) => Math.max(String(s).length, 8));
  const total = weights.reduce((a, b) => a + b, 0);
  const pos = duration ? (t / duration) * total : 0;
  let acc = 0;
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i];
    if (pos < acc) return i;
  }
  return lines.length - 1;
}

function setListenLabel(on) {
  const btn = $("#btn-listen");
  btn.textContent = on ? "विराम" : "सुनो";
  btn.classList.toggle("playing", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
}

async function showCinema(ev, autoHear) {
  stopSpeech();
  document.body.classList.add("in-cinema");
  $("#cinema").hidden = false;
  $("#cinema-bg").src = artOf(ev).scene;
  $("#hud-where").textContent = `${stepLabel(ev)} · ${ev.titleHi}`;
  const cues = await loadCues(ev);
  state.cues = cues;
  const lines = cues.lines;
  const el = $("#sub-line");
  el.textContent = lines[0] || "";
  el.dataset.i = "0";
  setListenLabel(false);

  const causes = $("#cinema-causes");
  causes.innerHTML = "";
  for (const c of ev.causes || []) {
    const src = byId(state.events, c.fromId);
    if (!src) continue;
    const kind = typeHi(c.type);
    const note = (c.noteHi || "").trim();
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cause-seal";
    b.style.backgroundImage = `url("${artOf(src).scene}")`;
    b.title = note ? `${kind} — ${note}` : `${kind} · ${src.titleHi}`;
    const cap = document.createElement("span");
    cap.textContent = kind;
    b.appendChild(cap);
    b.addEventListener("click", () => openEvent(src.id));
    causes.appendChild(b);
  }

  const list = sorted();
  const idx = list.findIndex((e) => e.id === ev.id);
  const next = list[idx + 1];
  const cliff = $("#btn-next");
  if (next) {
    cliff.hidden = false;
    $("#cliff-img").src = artOf(next).scene;
    $("#cliff-text").textContent = artOf(ev).hookNextHi || next.titleHi;
    cliff.onclick = () => {
      openEvent(next.id);
    };
  } else {
    cliff.hidden = true;
  }
  if (autoHear) speakCurrent();
}

function droneLevel(kind) {
  if (state.instrument === "silence" || state.muted) return 0;
  if (kind === "speech") return 0.01;
  if (state.instrument === "bansuri") return 0.3;
  if (state.instrument === "mridang") return 0.34;
  return 0.18;
}

function resumeDroneCtx() {
  const ctx = state.drone?.ctx;
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

function duckDrone(on) {
  if (!state.drone) return;
  resumeDroneCtx();
  const g = state.drone.master.gain;
  const t = state.drone.ctx.currentTime;
  try {
    g.cancelScheduledValues(t);
    g.setTargetAtTime(droneLevel(on ? "speech" : "idle"), t, 0.06);
  } catch (_) {
    g.value = droneLevel(on ? "speech" : "idle");
  }
}

function stopSpeech() {
  state.speaking = false;
  window.speechSynthesis?.cancel();
  if (state.player) {
    state.player.pause();
    state.player.src = "";
    state.player = null;
  }
  duckDrone(false);
}

async function speakCurrent() {
  const el = $("#sub-line");
  if (state.speaking) {
    stopSpeech();
    setListenLabel(false);
    return;
  }
  const ev = byId(state.events, state.selected);
  if (!ev) return;

  const cues = state.cues?.lines?.length ? state.cues : await loadCues(ev);
  state.cues = cues;
  const lines = cues.lines || [];
  el.textContent = lines[0] || "";
  el.dataset.i = "0";

  state.speaking = true;
  setListenLabel(true);
  duckDrone(true);

  const player = new Audio(`art/audio/${ev.id}.wav?v=7`);
  state.player = player;
  player.playbackRate = 1;
  player.addEventListener("error", () => {
    if (state.player === player) speakBrowser(lines);
  });
  player.addEventListener("ended", () => {
    state.speaking = false;
    setListenLabel(false);
    duckDrone(false);
  });
  player.addEventListener("timeupdate", () => {
    if (!player.duration || !lines.length) return;
    const i = lineIndex(cues, player.currentTime, player.duration);
    if (el.dataset.i !== String(i)) {
      el.dataset.i = String(i);
      el.textContent = lines[i];
    }
  });
  const play = player.play();
  if (play && play.catch) {
    play.catch(() => speakBrowser(lines));
  }
}

function speakBrowser(lines) {
  const synth = window.speechSynthesis;
  const el = $("#sub-line");
  if (!synth) {
    el.textContent = lines[0] || "";
    state.speaking = false;
    setListenLabel(false);
    duckDrone(false);
    return;
  }
  pickVoice();
  let i = 0;
  const next = () => {
    if (!state.speaking || i >= lines.length) {
      state.speaking = false;
      setListenLabel(false);
      duckDrone(false);
      return;
    }
    el.textContent = lines[i];
    const u = new SpeechSynthesisUtterance(lines[i]);
    u.lang = "hi-IN";
    if (state.voice) u.voice = state.voice;
    u.rate = 0.92;
    u.onend = () => {
      i += 1;
      next();
    };
    u.onerror = () => {
      i += 1;
      next();
    };
    synth.speak(u);
  };
  next();
}

function stopDrone() {
  if (!state.drone) return;
  if (state.drone.timer != null) clearInterval(state.drone.timer);
  try {
    state.drone.master.gain.value = 0;
  } catch (_) {}
  try {
    state.drone.ctx.close();
  } catch (_) {}
  state.drone = null;
}

function setInstrument(name) {
  state.instrument = name;
  state.muted = name === "silence";
  document.querySelectorAll(".swar-bead").forEach((b) => {
    b.classList.toggle("on", b.dataset.swar === name);
  });
  stopDrone();
  if (name === "silence") return;

  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const master = ctx.createGain();
  master.gain.value = droneLevel(state.speaking ? "speech" : "idle");
  master.connect(ctx.destination);
  let timer = null;

  if (name === "tanpura") {
    const buzz = (freq, gain) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 1400;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(f);
      f.connect(g);
      g.connect(master);
      o.start();
    };
    buzz(130.81, 0.28);
    buzz(196.0, 0.22);
    buzz(261.63, 0.14);
    const cycle = [130.81, 196.0, 261.63, 196.0];
    let i = 0;
    const pluck = (freq) => {
      const n = Math.floor(ctx.sampleRate * 0.09);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < n; j++) data[j] = (Math.random() * 2 - 1) * (1 - j / n) ** 2;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = 14;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.55, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.1);
      src.connect(bp);
      bp.connect(g);
      g.connect(master);
      src.start();
    };
    pluck(cycle[0]);
    timer = window.setInterval(() => {
      i = (i + 1) % cycle.length;
      pluck(cycle[i]);
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    }, 820);
  }

  if (name === "bansuri") {
    const notes = [261.63, 293.66, 329.63, 392.0, 349.23, 293.66];
    let i = 0;
    const blow = () => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime;
      const freq = notes[i % notes.length];
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const air = ctx.createOscillator();
      air.type = "triangle";
      air.frequency.value = freq * 2;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.55, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.55);
      o.connect(g);
      air.connect(g);
      g.connect(lp);
      lp.connect(master);
      o.start(t);
      air.start(t);
      o.stop(t + 1.65);
      air.stop(t + 1.65);
      i += 1;
    };
    blow();
    timer = window.setInterval(blow, 1700);
  }

  if (name === "mridang") {
    const hit = () => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime;
      const n = Math.floor(ctx.sampleRate * 0.08);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < n; j++) data[j] = (Math.random() * 2 - 1) * (1 - j / n);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 180 + Math.random() * 50;
      bp.Q.value = 2.2;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.85, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      src.connect(bp);
      bp.connect(ng);
      ng.connect(master);
      src.start(t);
      const thump = ctx.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(120, t);
      thump.frequency.exponentialRampToValueAtTime(48, t + 0.2);
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.95, t);
      tg.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      thump.connect(tg);
      tg.connect(master);
      thump.start(t);
      thump.stop(t + 0.3);
    };
    hit();
    timer = window.setInterval(hit, 830);
  }

  state.drone = { ctx, master, timer };
}

function startDrone() {
  setInstrument(state.instrument || "tanpura");
}

function bindMap() {
  const wrap = $("#map-wrap");
  wrap.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".seal")) return;
    state.dragging = true;
    state.moved = 0;
    state.last = { x: e.clientX, y: e.clientY };
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const dx = e.clientX - state.last.x;
    const dy = e.clientY - state.last.y;
    state.moved += Math.abs(dx) + Math.abs(dy);
    state.cam.x += dx;
    state.cam.y += dy;
    state.last = { x: e.clientX, y: e.clientY };
    applyCam();
  });
  wrap.addEventListener("pointerup", () => {
    state.dragging = false;
  });
  wrap.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const old = state.cam.k;
      const next = Math.min(1.6, Math.max(0.28, old * (e.deltaY > 0 ? 0.92 : 1.08)));
      const rect = wrap.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const wx = (px - state.cam.x) / old;
      const wy = (py - state.cam.y) / old;
      state.cam.k = next;
      state.cam.x = px - wx * next;
      state.cam.y = py - wy * next;
      applyCam();
    },
    { passive: false }
  );
  window.addEventListener("resize", fitCam);
}

$("#btn-open").addEventListener("click", () => {
  $("#gate").style.display = "none";
  $("#unfurl").classList.add("play");
  const hint = $("#map-hint");
  if (hint) hint.hidden = false;
  setInstrument("tanpura");
  window.setTimeout(() => {
    const first = sorted()[0];
    if (first) openEvent(first.id);
  }, 900);
});

function goMap(e) {
  e?.stopPropagation();
  stopSpeech();
  document.body.classList.remove("in-cinema");
  $("#reveal").hidden = true;
  $("#cinema").hidden = true;
  const ev = byId(state.events, state.selected);
  $("#hud-where").textContent = ev
    ? `${stepLabel(ev)} · मानचित्र`
    : "आस्तीक-उपाख्यान · मोहर चुनो";
  highlight(state.selected);
}

$("#swar").addEventListener("click", (e) => {
  const b = e.target.closest(".swar-bead");
  if (!b) return;
  setInstrument(b.dataset.swar);
});
$("#btn-map").addEventListener("click", goMap);
$("#btn-reveal-map").addEventListener("click", goMap);
$("#btn-listen").addEventListener("click", speakCurrent);

bindMap();
load();
