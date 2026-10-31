import json,sys
from faster_whisper import WhisperModel
m=WhisperModel("medium",device="cpu",compute_type="int8")
import soundfile as sf
audio,_=sf.read(sys.argv[1],dtype="float32")
segs,_=m.transcribe(audio,language="pt",word_timestamps=True,vad_filter=False,beam_size=5)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text.strip(),"words":[{"w":w.word.strip(),"s":round(w.start,3),"e":round(w.end,3),"p":round(w.probability,2)} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
json.dump(out,open(sys.argv[2],"w"),ensure_ascii=False,indent=1)
