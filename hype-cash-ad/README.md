# HYPE CASH: anúncio Meta Ads (9:16)

Motion graphic publicitário de 24,6 s, em 1080×1920 a 30 fps, com narração masculina em pt-BR gerada no ElevenLabs. A composição é feita em HTML com uma timeline GSAP pausada, capturada quadro a quadro com Playwright e codificada com FFmpeg.

- `out/motion.mp4`: o anúncio final (H.264 yuv420p, CRF 17, preset slow, AAC 320 kbps, faststart).
- `storyboard.md`: as cenas com tempos, quadros, texto na tela, animação e objetivo de cada uma.
- `timing.json`: a duração do áudio, os timestamps por palavra, as pausas, as cenas e as palavras de ênfase. É a fonte de todos os tempos da animação.
- `preview/`: os quadros representativos e a contact sheet.

## Estrutura

```
assets/src/          prints reais do produto (entrada)
audio/narration.mp3  narração final (ElevenLabs, take 1), usada inteira e sem alteração de tempo
audio/takes/         as 3 takes geradas
audio/music.wav      trilha original sintetizada (sem samples de terceiros)
audio/mix.wav        mixagem final (voz + trilha com ducking, −14 LUFS, −1 dBTP)
src/index.html       composição (cenas, estilos, fontes locais)
src/timeline.js      timeline GSAP única, com window.seek(t)
src/img/             recortes dos prints reais (gerados por scripts/make-crops.py)
scripts/             recortes, áudio, renderização e teste de determinismo
```

## Renderizar de novo

Requisitos: Node 22+, Python 3 com Pillow e NumPy, FFmpeg e um Chromium. O Chromium padrão é `/opt/pw-browsers/...`; para usar outro, defina `CHROME_PATH`.

```bash
npm install
python3 scripts/make-crops.py "$PWD"     # recortes dos prints → src/img
python3 scripts/make-audio.py "$PWD"     # trilha + mix → audio/mix.wav
node scripts/check-determinism.mjs       # mesmo instante ⇒ mesmo quadro (ordem direta × embaralhada)
node scripts/render.mjs --stills 0,4.92,9.84,14.76,19.68,24.5   # prévia → preview/contact_sheet.png
node scripts/render.mjs                  # quadros → out/frames → out/motion.mp4
```

Para trocar a narração, substitua `audio/narration.mp3`, atualize `timing.json` (palavras, cenas e ênfases) e rode os dois últimos comandos. A animação se reposiciona sozinha a partir dos novos tempos.
