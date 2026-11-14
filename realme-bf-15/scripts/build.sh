#!/bin/bash
# Vídeo 15: legendas de impacto + sons do CapCut (clique do mouse nas frases-chave, dinheiro nos valores). Cores BT.709 originais.
set -e; cd "$(dirname "$0")/.."; S=../realme-bf-02/sfx
ffmpeg -v error -y -i source/video15.mov -i $S/mouse.wav -i $S/dinheiro.wav \
 -filter_complex "[1:a]asplit=3[m1][m2][m3];[2:a]asplit=2[d1][d2];
  [m1]adelay=480|480,volume=0.6[a1];[m2]adelay=13680|13680,volume=0.6[a2];[m3]adelay=17180|17180,volume=0.6[a3];
  [d1]adelay=6580|6580,volume=0.45[a4];[d2]adelay=18840|18840,volume=0.45[a5];
  [0:a][a1][a2][a3][a4][a5]amix=inputs=6:duration=first:normalize=0,alimiter=limit=0.95:asc=1,apad=whole_dur=30.5[aout];
  [0:v]ass=out/legendas.ass:fontsdir=fonts[vout]" \
 -map "[vout]" -map "[aout]" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 320k -movflags +faststart out/realme_video_15.mp4
