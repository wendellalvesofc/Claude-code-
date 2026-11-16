#!/bin/bash
# Melhora do áudio (mesma cadeia do 08/09), aplicada em cada take separado e normalizada a -14 LUFS por take,
# porque o take 2 foi gravado bem mais baixo que os outros. Emendas nos cortes do vídeo (11,2 s e 16,467 s).
set -e; cd "$1"
CH="adeclip,highpass=f=85,arnndn=m=models/sh.rnnn:mix=0.7,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2"
ffmpeg -v error -y -i source/video19.mov -vn -ac 2 -ar 48000 analysis/orig.wav
CUTS=(0 11.2 16.4667 99)
for k in 0 1 2; do
  a=${CUTS[$k]}; b=${CUTS[$((k+1))]}
  ffmpeg -v error -y -i analysis/orig.wav -af "atrim=$a:$b,asetpts=N/SR/TB,$CH" -ar 48000 analysis/take$k.wav
  J=$(ffmpeg -hide_banner -i analysis/take$k.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  II=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
  ffmpeg -v error -y -i analysis/take$k.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:$II:linear=true,afade=t=in:d=0.005" -ar 48000 analysis/take${k}_n.wav
done
ffmpeg -v error -y -i analysis/take0_n.wav -i analysis/take1_n.wav -i analysis/take2_n.wav -filter_complex "[0][1][2]concat=n=3:v=0:a=1" -ar 48000 analysis/voice_enh.wav
for k in 0 1 2; do ffmpeg -hide_banner -i analysis/take${k}_n.wav -af ebur128 -f null - 2>&1 | grep "^\s*I:" | tail -1; done
