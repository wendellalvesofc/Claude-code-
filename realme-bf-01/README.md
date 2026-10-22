# realme | Black Friday 01 (Plaza Shopping Carapicuíba)

Reels/TikTok vertical, 1080×1920, 30 fps, 29,96 s. Gravação de loja com 4 apresentadoras, editada com motions no Remotion e com áudio mixado em Python.

## Entregáveis
- `out/realme_black_friday_01.mp4`: final (H.264 CRF 18 slow, yuv420p; AAC 320 kbps 48 kHz; +faststart). −15,9 LUFS, pico −1,1 dBFS.
- `out/legendas.srt` e `out/legendas.ass`: legendas (o .ass é karaokê, com valores em verde).

## Briefing escolhido (preferências do cliente)
| Item | Escolha |
|---|---|
| Formato | 9:16 Reels/TikTok |
| Duração | 30–60 s |
| Ritmo | cinematográfico (planos longos, Ken Burns) |
| Estilo | editado moderno (punch-ins, whip, motion sutil) |
| Legenda | karaokê, **branca com sombra preta sutil**, Inter Black |
| Valores (R$) | **verde #2EE66B + SFX de dinheiro** |
| Silêncios | corte suave |
| Trilha | original, gerada (124 BPM), ducking de −8 dB |
| SFX | só nos momentos de impacto |
| Cor | alto contraste/punchy (contraste +8%, saturação +10%) |
| CTA | "VEM PRA REALME" + "Plaza Shopping Carapicuíba" |

## Edição (EDL resumida, tempos finais)
| Tempo | Ação |
|---|---|
| 0,1–3,6 | gancho: "FONE OFICIAL POR R$ 1" (na compra do seu realme) |
| 5,73 | whip da câmera + whoosh, respiro de 1,8 s reduzido |
| 6,7 | card "A PRÉ-BLACK JÁ COMEÇOU" |
| 9,2 | card "✓ PREÇO GARANTIDO" + punch-in |
| 13,98 | "PIX DE R$ 1.000" com contador, impacto, dinheiro e tremida |
| 14,5 | flash de 2 frames (virada de assunto) |
| 14,95 | card "COMPRAS DE 15/10 A 27/11" |
| 16,5 | **corte da fala "no dia 15 de outubro ao dia 15 de novembro"** (data errada: o certo é até 27/11) |
| 18,0–23,1 | "FONE OFICIAL R$ 1" com riser, impacto e dinheiro; pulso na repetição |
| 23,8–30 | CTA, fachada com zoom lento e congelamento final de 1,8 s |

## Reproduzir
```bash
python3 scripts/make_base.py "$PWD"        # cortes (scripts/cuts.json) + grade + escala -> motion/public/base.mp4
python3 analysis/transcribe.py analysis/cut16k.wav analysis/transcript_cut.json   # (cut16k = voice_cut em 16 kHz mono)
python3 scripts/make_captions.py "$PWD"    # legendas -> motion/src/captions.ts, out/legendas.srt/.ass
python3 scripts/make_audio.py "$PWD"       # trilha, SFX e mix -> audio/mix.wav
cp audio/mix.wav motion/public/
cd motion && npm ci && npx remotion render src/index.ts RealmeBF01 ../out/remotion_raw.mp4 --codec=h264 --crf=12
cd .. && ffmpeg -i out/remotion_raw.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow \
  -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/realme_black_friday_01.mp4
```
