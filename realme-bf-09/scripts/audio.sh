#!/bin/bash
# Melhora do áudio: corrige estouros, corta graves, reduz ruído de fundo com RNNoise (70%, para não soar artificial),
# limpa embolado (250 Hz), dá clareza à voz (3,2 kHz) e normaliza para -14 LUFS com pico máximo de -1,5 dBTP.
set -e; cd "$1"
CH="adeclip,highpass=f=85,arnndn=m=models/sh.rnnn:mix=0.7,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2"
ffmpeg -v error -y -i analysis/orig.wav -af "$CH" -ar 48000 analysis/stage1.wav
J=$(ffmpeg -hide_banner -i analysis/stage1.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
II=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i analysis/stage1.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:$II:linear=true" -ar 48000 analysis/voice_enh.wav
