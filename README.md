# महाभारत-कथाचक्र

An interactive site to **learn the full Mahābhārata** as a causal graph — not only the 18 war days. You open an illuminated manuscript: parchment, gold and saffron, wax-seal events, inked cause-lines, Hindi in the ear.

This repository is the **Āstīka lesson** (why the tale is being told). The war, the dice game, and Bhīṣma’s vow are later phases. See [`PLAN.md`](PLAN.md).

**Audience:** people who found the epic boring and quit. The site is built to *keep* them — nested story, cliffhangers, paintings, listen — not to dump Ganguli onto a webpage.

**Author:** Abhishek.

Live local:

```bash
python -m http.server 8080
```

Open http://localhost:8080

---

## What this website is

Mahābhārata is a story **inside** a story. Ugraśravas recites in Naimiṣa what Vaishampayana recited at Janamejaya’s snake sacrifice, which itself sits on an older nāga curse. The site treats that nesting as the product, not a footnote.

You do not start on a table of contents. You start on a wound:

> यह युद्ध नहीं। यह गुस्सा है।  
> एक मरा सर्प। एक राजा का अपमान। कथा वहीं से खुलती है।

Then a **war-room parchment map**: three geographic bands (hearing / fire / nāga tale), wax-seal nodes, inked spines. Click a seal → **cinema**: full-bleed miniature, one subtitle line, **सुनो**. First time a person appears → portrait cards over the scene. Next event is a cliff, not a “Next” button.

Inspiration for *nested telling* (Naimiṣa → Janamejaya) came from Meghnā’s YouTube intros. **Do not copy her script.** Hindi is original oral Hindustani; English gloss and citations point at Kisari Mohan Ganguli’s public-domain Ādi Parva (1883–96).

---

## How to walk it (now)

1. **कथा चलाओ** — parchment unfurls; tanpura (or bānsurī / mṛdaṅg / silence) under it.
2. First seal auto-opens: **Parikṣit insults Śamīka** (telling order 1).
3. Drag/zoom the map. Cause chips (शाप / बदला / जन्म) are jump-links.
4. **सुनो** plays Sarvam Priya Hindi; the plate tracks the spoken sentence.
5. Cliff thumbnail opens the next beat in *telling* order, not map-left-to-right.

### Telling order (lesson 1)

| # | id | What happens |
|---|---|---|
| 1 | `parikshit-shamika` | King hangs a dead snake on a silent sage |
| 2 | `takshaka-kills-parikshit` | Curse completed; child Janamejaya inherits the wound |
| 3 | `janamejaya-sarpa-satra` | Revenge becomes a genocide-yajña |
| 4 | `kadru-vinata-wager` | Older seed: wager, deceit, curse on the nāgas |
| 5 | `garuda-amrita` | Amṛta does not cancel the curse |
| 6 | `elapatra-prophecy` | Āstīka is named before he exists |
| 7 | `astika-born` | Birth as the only brake |
| 8 | `astika-stops-satra` | Two spines meet; the fire is held |
| 9 | `naimisha-satra` | Twist: we were always in a forest recitation |
| 10 | `vyasa-vaishampayana` | Twist: that recitation nested another |

Map bands still use geography (`band` + `t`), not telling order.

Two **spines** meet at `astika-stops-satra`:

- Nāga-doom: Kadru → Elapatra → birth → stop  
- Kuru-revenge: insult → Takṣaka → sattra → stop  

---

## Stack (no npm)

| Path | Role |
|---|---|
| `index.html` | Gate, map, character reveal, cinema |
| `css/theme.css` | Manuscript chrome |
| `js/app.js` | Pan/zoom, cinema, audio, instruments |
| `js/meta.js` | Layout, art paths, Hindi hooks |
| `data/events.json` | Events, causes, `listenHi`, Ganguli citations |
| `data/characters.json` | People |
| `data/frames.json` | Nested frames |
| `data/art.json` | PD painting licenses |
| `art/` | Miniatures, parchment, wav narration + cue files |
| `scripts/tts.py` | Sarvam / Edge TTS |
| `docs/ASSET_PROMPTS.md` | **Every image prompt used** |
| `PLAN.md` | Phases and what is not built yet |

Python 3 is enough. Static files only.

---

## Hindi audio

```bash
# optional, gitignored
echo SARVAM_API_KEY=your_key > .env
python scripts/tts.py
```

- With a [Sarvam](https://dashboard.sarvam.ai) key: Bulbul v3, speaker **priya**, temperature **1.0** (API maximum for emotion), pace 0.9.
- Each sentence of `listenHi` is its own clip, then concatenated. `art/audio/{id}.cues.json` stores line start times so subtitles match speech.
- Without a key: Microsoft Edge `hi-IN-SwaraNeural`.
- Cinema falls back to the browser’s `speechSynthesis` Hindi voice if the wav fails.

**Never commit `.env`.**

---

## Design that was locked (after the first ship failed)

First ship was a parchment **article + tiny graph**. It felt like a book. Redesign:

| Question | Decision |
|---|---|
| Open | Illuminated manuscript: unfurl, gold/saffron, tanpura |
| Graph | War-room map on aged parchment; wax-seal nodes; inked lines; pan/zoom |
| Character first appearance | Overlay on the event scene (cards), not a poster homepage |
| Click a seal | Full-screen cinema: painting + one subtitle + listen |
| Art | AI miniatures, one style bible (see prompts doc) |

Critics applied later: do **not** open on Naimiṣa; cold-open the insult; chips must be readable; scripts written for the ear; nested frames as the **ending** twist.

---

## Plan phases

### Phase 0 — intent (done)

Learn the **full** epic as causes, Hindi listen, old-painting world. Not war-days-only. Original prose + Ganguli PD citations.

### Phase 1 — Āstīka lesson (this repo)

Shipped, then rebuilt when the article UI failed:

1. Data: 10 events, 3 bands, two spines, original Hindi.
2. First UI: article + SVG graph (rejected).
3. Art: 1 map + 10 scenes + 10 portraits (prompts in [`docs/ASSET_PROMPTS.md`](docs/ASSET_PROMPTS.md)).
4. War-room map + unfurl + instruments.
5. Cinema + first-appearance reveal + cliff next.
6. Telling order flipped to human wound first.
7. Sarvam Priya narration; sentence-synced subtitles.

### Later phases (not built)

From [`PLAN.md`](PLAN.md), ranked:

1. **Ādi spine people mean:** Śantanu–Gaṅgā–Satyavatī–Bhīṣma’s vow–Vyāsa’s niyoga–Pāṇḍava/Kaurava origin.
2. Graph readability when 30+ nodes hurt.
3. **Sabhā / dice** (not “rest of Ādi”).
4. Vana + Udyoga batches.
5. War as **18 subgraphs** behind one Kurukṣetra hub.
6. Strī / Śānti / Aśvamedha / Svargārohaṇa.
7. Human kathāvāchak recording (TTS is a stand-in).
8. Search, lineage overlay, geography.

---

## Legal

- **Text:** retelling aligned to Ganguli 1883–96 (public domain). No modern Hindi books, no YouTube wording.
- **Generated art:** AI miniatures in `art/bg`, `art/scenes`, `art/characters`. Prompts documented for regeneration.
- **PD scans:** listed in `data/art.json`. Local files only; no hotlink.
- **Audio:** generated; not a traditional performer.

---

## License

Personal / educational project unless otherwise noted. Ganguli translation and the two Wikimedia paintings are public domain. Generated images and original Hindi belong to this project’s author.
