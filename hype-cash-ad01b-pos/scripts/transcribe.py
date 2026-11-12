import sys, json
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "small", device="cpu", compute_type="int8")
import subprocess, numpy as np
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True,check=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, info = m.transcribe(audio, language="pt", word_timestamps=True)
words = []
for s in segs:
    for w in s.words: words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
print(json.dumps({"lang": info.language, "words": words}, ensure_ascii=False))
