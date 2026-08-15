"""Generate narration. Prefers Sarvam Bulbul (speaker=priya) if SARVAM_API_KEY is set."""
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


GAP = 0.22


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
    import urllib.error
    import urllib.request

    body = json.dumps(
        {
            "text": text[:2400],
            "language_code": "hi-IN",
            "speaker": "priya",
            "model": "bulbul:v3",
            "pace": 0.9,
            "temperature": 1.0,
            "output_audio_codec": "wav",
            "speech_sample_rate": 24000,
        }
    ).encode()
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
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode("utf-8", errors="replace"))
        raise
    return base64.b64decode("".join(data["audios"]))


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
    print("sarvam", dest.name, dest.stat().st_size, "lines=", len(lines), "sec=", round(t, 1))


async def edge(text, dest):
    import edge_tts

    comm = edge_tts.Communicate(text, "hi-IN-SwaraNeural", rate="-12%")
    await comm.save(str(dest))
    print("edge", dest.name, dest.stat().st_size)


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
