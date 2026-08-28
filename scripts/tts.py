"""Generate narration. Uses Sarvam Bulbul (speaker=aditya) with Edge TTS MadhurNeural fallback."""
import io
import json
import os
import re
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "art" / "audio"
EVENTS = json.loads((ROOT / "data" / "events.json").read_text(encoding="utf-8"))["events"]


def load_dotenv():
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


load_dotenv()
KEY = os.environ.get("SARVAM_API_KEY") or os.environ.get("SARVAM_API_SUBSCRIPTION_KEY")

GAP = 0.15


def sentences(text):
    parts = [
        p.strip()
        for p in re.split(r"(?<=[।?!…])\s*|\s*[—–]\s*", text.strip())
        if len(p.strip()) > 1
    ]
    out = []
    for part in parts:
        if out and len(part) < 14:
            out[-1] = f"{out[-1]} {part}"
        else:
            out.append(part)
    return out or [text.strip()]


def wav_duration(raw):
    with wave.open(io.BytesIO(raw), "rb") as r:
        return r.getnframes() / float(r.getframerate())


def sarvam_once(text):
    import base64
    import time
    import urllib.error
    import urllib.request

    body = json.dumps(
        {
            "text": text[:2400],
            "language_code": "hi-IN",
            "speaker": "aditya",
            "model": "bulbul:v3",
            "pace": 1.0,
            "temperature": 0.6,
            "output_audio_codec": "wav",
            "speech_sample_rate": 24000,
        }
    ).encode()
    
    for attempt in range(5):
        req = urllib.request.Request(
            "https://api.sarvam.ai/text-to-speech",
            data=body,
            headers={
                "api-subscription-key": KEY,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.loads(r.read().decode())
                time.sleep(1.2)  # stay under rate limit
                return base64.b64decode("".join(data["audios"]))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = 4 * (attempt + 1)
                print(f"Rate limited (429). Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print("HTTP", e.code, e.read().decode("utf-8", errors="replace"))
                raise
    raise RuntimeError("Failed after 5 retries due to rate limit")


def silence_wav(nframes, framerate, sampwidth, nchannels):
    frames = b"\x00" * (nframes * sampwidth * nchannels)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(nchannels)
        w.setsampwidth(sampwidth)
        w.setframerate(framerate)
        w.writeframes(frames)
    return buf.getvalue()


def concat_wav(blobs):
    params = None
    pcm = []
    for i, raw in enumerate(blobs):
        with wave.open(io.BytesIO(raw), "rb") as r:
            p = r.getparams()
            if params is None:
                params = p
            elif (p.nchannels, p.sampwidth, p.framerate) != (
                params.nchannels,
                params.sampwidth,
                params.framerate,
            ):
                raise RuntimeError("wav format mismatch")
            pcm.append(r.readframes(r.getnframes()))
        if i < len(blobs) - 1:
            gap = silence_wav(int(params.framerate * GAP), params.framerate, params.sampwidth, params.nchannels)
            with wave.open(io.BytesIO(gap), "rb") as g:
                pcm.append(g.readframes(g.getnframes()))
    out = io.BytesIO()
    with wave.open(out, "wb") as w:
        w.setnchannels(params.nchannels)
        w.setsampwidth(params.sampwidth)
        w.setframerate(params.framerate)
        w.writeframes(b"".join(pcm))
    return out.getvalue()


def sarvam(text, dest):
    lines = sentences(text)
    pieces = []
    starts = []
    t = 0.0
    for i, line in enumerate(lines):
        starts.append(round(t, 3))
        blob = sarvam_once(line)
        pieces.append(blob)
        t += wav_duration(blob)
        if i < len(lines) - 1:
            t += GAP
    raw = concat_wav(pieces) if pieces[0][:4] == b"RIFF" else b"".join(pieces)
    dest.write_bytes(raw)
    cues = dest.with_suffix(".cues.json")
    cues.write_text(
        json.dumps({"lines": lines, "starts": starts, "duration": round(t, 3)}, ensure_ascii=False),
        encoding="utf-8",
    )
    print("sarvam (aditya)", dest.name, dest.stat().st_size, "lines=", len(lines), "sec=", round(t, 1))


async def edge(text, dest):
    import edge_tts

    lines = sentences(text)
    comm = edge_tts.Communicate(text, "hi-IN-MadhurNeural", rate="+0%")
    await comm.save(str(dest))
    cues = dest.with_suffix(".cues.json")
    cues.write_text(
        json.dumps({"lines": lines, "starts": None, "duration": None}, ensure_ascii=False),
        encoding="utf-8",
    )
    print("edge (madhur)", dest.name, dest.stat().st_size)


def main():
    import asyncio

    OUT.mkdir(parents=True, exist_ok=True)
    for ev in EVENTS:
        text = ev.get("listenHi") or ev.get("summaryHi")
        dest = OUT / f"{ev['id']}.wav"
        if KEY:
            sarvam(text, dest)
        else:
            asyncio.run(edge(text, dest))


if __name__ == "__main__":
    main()

