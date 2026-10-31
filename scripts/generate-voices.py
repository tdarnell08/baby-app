#!/usr/bin/env python3
"""Generate warm neural parentese clips for First Words using edge-tts."""

from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "voices"
WORDS_TS = ROOT / "src" / "data" / "words.ts"

# Warm, clear adult US English voice (caregiver-like, not cartoonish).
VOICE = "en-US-JennyNeural"
# Slightly slower and a touch higher for parentese.
WORD_RATE = "-25%"
WORD_PITCH = "+18Hz"
PHRASE_RATE = "-15%"
PHRASE_PITCH = "+12Hz"
PRAISE_RATE = "-10%"
PRAISE_PITCH = "+20Hz"

PRAISE = [
    "Yay!",
    "Great job!",
    "I love hearing you!",
    "Wow, good talking!",
    "Yay, you did it!",
]
FINAL_PRAISE = "Yay! You did it! I love talking with you!"


def extract_words(text: str) -> list[dict[str, str]]:
    start = text.index("export const firstWords")
    end = text.index("export const wordScience")
    block = text[start:end]
    words = []
    for match in re.finditer(
        r"\{\s*id:\s*'([^']+)'\s*,\s*word:\s*'([^']*)'\s*,\s*say:\s*'([^']*)'\s*,\s*phrase:\s*'([^']*)'",
        block,
    ):
        words.append({"id": match.group(1), "say": match.group(3), "phrase": match.group(4)})
    return words


async def save(text: str, path: Path, rate: str, pitch: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch)
    await communicate.save(str(path))


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    words = extract_words(WORDS_TS.read_text())
    if not words:
        raise SystemExit("No words parsed from words.ts")

    print(f"Generating {len(words)} words with {VOICE}...")
    for word in words:
        folder = OUT / word["id"]
        folder.mkdir(parents=True, exist_ok=True)
        await save(word["say"], folder / "say.mp3", WORD_RATE, WORD_PITCH)
        await save(word["phrase"], folder / "phrase.mp3", PHRASE_RATE, PHRASE_PITCH)
        print(f"  {word['id']}")

    praise_dir = OUT / "_praise"
    praise_dir.mkdir(parents=True, exist_ok=True)
    for i, line in enumerate(PRAISE):
        await save(line, praise_dir / f"{i}.mp3", PRAISE_RATE, PRAISE_PITCH)
    await save(FINAL_PRAISE, praise_dir / "final.mp3", PRAISE_RATE, PRAISE_PITCH)
    print("  praise clips")

    meta = {
        "voice": VOICE,
        "words": [w["id"] for w in words],
        "praiseCount": len(PRAISE),
    }
    (OUT / "manifest.json").write_text(json.dumps(meta, indent=2) + "\n")
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
