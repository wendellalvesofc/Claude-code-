# HYPE CASH v2: anúncio universal (Meta Ads, 9:16)

Peça de 31,6 s em 1080×1920 a 30 fps, com narração em pt-BR, trilha original e SFX sincronizados.

- `out/motion.mp4`: o vídeo final (H.264 yuv420p + AAC).
- `storyboard.md`: auditoria, copy, storyboard por cena e timeline de áudio.
- `audio/sfx-cues.json`: a lista exata de efeitos, com tempo e ganho de cada um, gerada pelo script.
- `timing.json`: timestamps por palavra, cenas e ênfases. É a fonte de todos os tempos.

## Como foi feito

**Imagem**
- HTML com uma timeline GSAP única e pausada.
- Camadas procedurais (chips de assunto, plateia, timecode, grão) são funções puras de `t`.
- `window.seek(t)` volta a timeline a 0 e avança até `t`, então o estado nunca depende do histórico.
- Captura quadro a quadro com Playwright e codificação com FFmpeg.

**Telas**
- Recortes dos prints reais em resolução nativa, por `scripts/make-assets.py`.
- Logo HQ recortado do fundo preto.

**Voz**
- ElevenLabs `eleven_v4`, voz "Gabriel — Friendly Brazilian Ad Voice", take 2 de 4.
- Usada inteira, sem alterar velocidade.

**Trilha**
- Original, sintetizada em `scripts/make-audio.py`: 120 BPM, Lá menor, com o drop alinhado ao "Hype Cash".
- Seções: intro → pulso → drop → breakdown em "não é promessa" → volta → acorde final.

**SFX**
- Arquivos de `audio/sfx`, sob a Pixabay Content License (uso comercial, ver `CREDITS.md`).
- Cada efeito é alinhado pelo próprio transiente ao cue visual.

**Mix**
- Música 12 dB abaixo da voz, com ducking por sidechain; SFX 8 dB abaixo da voz.
- Master em −14 LUFS e −1,5 dBTP.

## Renderizar de novo

Requisitos: Node 22+, Python 3 com Pillow e NumPy, FFmpeg e Chromium. O Chromium padrão é `/opt/pw-browsers/...`; para usar outro, defina `CHROME_PATH`.

```bash
npm install
python3 scripts/make-assets.py "$PWD"    # recortes reais, fundos, logo → src/img
python3 scripts/make-audio.py "$PWD"     # trilha + SFX + mix → audio/mix.wav
python3 scripts/check-audio.py "$PWD"    # inteligibilidade: voz × (música + SFX) por janela
node scripts/check-determinism.mjs       # mesmo instante ⇒ mesmo quadro (ordem direta × embaralhada)
node scripts/render.mjs --stills 0,7.8,12.6,19.4,23.4,28.9   # prévia → preview/contact_sheet.png
node scripts/render.mjs                  # out/frames → out/motion.mp4
```

Para trocar a narração: substitua `audio/narration.mp3`, atualize `timing.json` e rode `make-audio.py` e `render.mjs`. Animação e SFX acompanham os novos tempos.
