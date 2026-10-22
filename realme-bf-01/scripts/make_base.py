# Corta, gradua e escala o vídeo original -> base.mp4 (1080x1920, 30 fps, sem áudio)
# e gera a voz cortada com os mesmos limites (voice_cut.wav, 48 kHz).
import json,subprocess,sys,os
root=sys.argv[1]; c=json.load(open(f"{root}/scripts/cuts.json")); fps=c["fps"]
src=f"{root}/source/video01.mov"
segs=[(round(a*fps)/fps,round(b*fps)/fps) for a,b in c["segments"]]
v=[];a=[]
for i,(s,e) in enumerate(segs):
    v.append(f"[0:v]trim=start={s}:end={e},setpts=PTS-STARTPTS,fps={fps}[v{i}]")
    a.append(f"[0:a]atrim=start={s}:end={e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={e-s-0.012}:d=0.012[a{i}]")
n=len(segs)
grade="scale=1080:1920:flags=lanczos,eq=contrast=1.08:saturation=1.10:gamma=0.98,unsharp=5:5:0.6,format=yuv420p"
fc=";".join(v+a)+";"+"".join(f"[v{i}]" for i in range(n))+f"concat=n={n}:v=1:a=0[vc];[vc]{grade},tpad=stop_mode=clone:stop_duration={c['freeze']}[vo];"+"".join(f"[a{i}]" for i in range(n))+f"concat=n={n}:v=0:a=1,aresample=48000[ao]"
os.makedirs(f"{root}/motion/public",exist_ok=True)
subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",fc,"-map","[vo]","-c:v","libx264","-crf","14","-preset","medium","-g","15","-an",f"{root}/motion/public/base.mp4","-map","[ao]","-ac","2",f"{root}/audio/voice_cut.wav"],check=True)
# mapa src->out para as legendas
out=0;m=[]
for s,e in segs: m.append({"src":[s,e],"out":out}); out+=e-s
json.dump({"segments":m,"cutEnd":out,"total":out+c["freeze"]},open(f"{root}/scripts/timeline.json","w"),indent=1)
print("cut",round(out,3),"total",round(out+c["freeze"],3))
