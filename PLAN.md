# महाभारत-कथाचक्र — plan

Interactive site to learn the **full** Mahābhārata as a causal graph (not only the 18 war days). Nested telling is first-class. Hindi is the reading language. Every decision keeps its causes; spines are drawn, minor causes sit in the panel.

## What Phase 1 is (and is not)

This ship is one **finished lesson**: *Āstīka-upākhyāna — why this tale is being told.*

After five minutes a reader should be able to say: Janamejaya’s snake rite avenges Parikṣit; an older nāga curse-and-prophecy line produces Āstīka, who can stop it; we hear all of this because Ugraśravas is reciting a recitation.

It is **not** Meghnā’s two YouTube videos in graph form. Prose is original, cited to Kisari Mohan Ganguli’s public-domain English translation of the Ādi Parva (1883–96). Hindi is a fresh retelling of that same traditional line, not a paraphrase of any modern script.

## Layout law (do not rewrite later)

- Three horizontal **bands**: Naimiṣa (outer hearing) / Janamejaya’s sattra (inner present) / Āstīka inner tale.
- Time left → right (`t` in data).
- Canvas draws only **spine** edges (`curse`, `vow/revenge`, `birth/lineage`). Minor causes are listed in the panel (toggle to draw them).
- Same JSON drives a stacked phone layout.
- Adding event 11 means new data (`band`, `t`, `tellingOrder`) — not new layout code.

## Phase 1 content (10 events)

**Telling order** (cinema / next-cliff) starts on the human wound, not the recitation. Nested frames are the ending twist.

| tellingOrder | id | Band (map) |
|---|---|---|
| 1 | `parikshit-shamika` | 1 |
| 2 | `takshaka-kills-parikshit` | 1 |
| 3 | `janamejaya-sarpa-satra` | 1 |
| 4 | `kadru-vinata-wager` | 2 |
| 5 | `garuda-amrita` | 2 |
| 6 | `elapatra-prophecy` | 2 |
| 7 | `astika-born` | 2 |
| 8 | `astika-stops-satra` | 1 |
| 9 | `naimisha-satra` | 0 |
| 10 | `vyasa-vaishampayana` | 0 |

Map still uses `band` + `t` (left → right inside each geographic strip).

Two spines meet at `astika-stops-satra`: nāga-doom (Kadru → Elapatra → birth → stop) and Kuru-revenge (insult → Takṣaka → sattra → stop).

## Later phases (ranked)

1. **Ādi spine people mean**: Śantanu–Gaṅgā–Satyavatī–Bhīṣma’s vow–Vyāsa’s niyoga–Pāṇḍava/Kaurava origin.
2. Graph readability only if 30+ nodes hurt (minor-cause toggle is already in P1).
3. **Sabhā / dice** (not “rest of Ādi”).
4. Vana + Udyoga batches.
5. War as **18 subgraphs** behind one Kurukṣetra hub.
6. Strī / Śānti / Aśvamedha / Svargārohaṇa.
7. Recorded or neural Hindi audio (Web Speech is an honest fallback, not “Indic kathā”).
8. Search, lineage overlay, geography.

## Legal / sources

- Text: Ganguli 1883–96 (PD). Do not paste modern Hindi books or YouTube wording.
- Art: local files only. Generated miniatures: [`docs/ASSET_PROMPTS.md`](docs/ASSET_PROMPTS.md). PD scans licensed in `data/art.json`. No hotlink, no serial stills, no Tomassetti.
- Audio: Sarvam Bulbul / Priya via `scripts/tts.py` (`.env` key, not committed). Browser `speechSynthesis` is the fallback if a wav fails.

## Phase 1 UI (after the article ship was rejected)

Illuminated-manuscript gate → parchment war-room map (wax seals, inked spines, pan/zoom) → first-appearance character cards → full-screen cinema (one subtitle + सुनो + cliff). Instruments: tanpura / bānsurī / mṛdaṅg / silence.

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.
