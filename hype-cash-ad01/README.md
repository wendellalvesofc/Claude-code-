# HYPE CASH | AD 01: A oportunidade por trás do assunto (Meta Ads, 9:16)

Anúncio de 30,0 s em 1080×1920 a 30 fps, com locução em pt-BR, trilha original e SFX sincronizados.

- **Objetivo:** levar visitantes qualificados à **página de vendas**.
- **O que fica de fora:** preço, parcelas e garantia; também não menciona faixa etária.

## Arquivos
- `out/motion.mp4`: o vídeo final (H.264 yuv420p + AAC).
- `storyboard.md`: auditoria, conceito, storyboard com timecodes, locução, plano de som e gancho para teste A/B.
- `timing.json`: tempos por palavra da locução e cenas. Todos os tempos de imagem e som saem daqui.
- `audio/sfx-cues.json`: lista de efeitos, com tempo e ganho de cada um.
- `assets/captures/`: capturas reais do app rodando localmente, com o log em `capture-log.json`.

## Como foi feito

**Telas**
- O app HYPE CASH (repositório `gta-vi-cash`) rodou localmente com `next build && next start`.
- `scripts/capture.mjs` navega no app como um celular (430×932, DPR 3): entra no playbook pela tela de senha e marca o checklist da Missão 01 item por item, salvando cada estado.
- `scripts/boxes.mjs` mede a posição real dos cards e seções, para que os destaques caiam em cima da interface verdadeira.

**Imagem**
- `src/index.html` + `src/main.js` em HTML/CSS 3D. Cada propriedade visual é uma função pura de `t`.
- O celular é um objeto 3D (moldura com espessura, reflexo que acompanha a rotação, sombra no chão), com as capturas reais na tela.
- `scripts/render.mjs` abre a página do zero a cada quadro, chama `seek(t)`, tira o print com o Chromium e codifica com o FFmpeg.

**Voz:** ElevenLabs `eleven_v4`, voz "Gabriel — Friendly Brazilian Ad Voice". Os tempos por palavra vêm do ElevenLabs Scribe.

**Trilha e SFX:** `scripts/make-audio.py`.
- Trilha original sintetizada (110 BPM).
- SFX com licença Pixabay (`audio/sfx/CREDITS.md`).
- Ducking da música sob a voz e master em −14 LUFS.

## Renderizar de novo
Requisitos: Node 22+, Python 3 com Pillow e NumPy, FFmpeg e Chromium (`CHROME_PATH` para trocar o binário).

```bash
npm install
# (opcional) recapturar as telas: com o app em http://localhost:3123
GATE_PASSWORD=... node scripts/capture.mjs && GATE_PASSWORD=... node scripts/boxes.mjs
python3 scripts/make-assets.py "$PWD"     # capturas e fundos → src/img
python3 scripts/make-audio.py "$PWD"      # trilha + SFX + mix → audio/mix.wav
python3 scripts/check-audio.py "$PWD"     # inteligibilidade da voz
node scripts/render.mjs --stills 0,5.3,8,14,20.1,24.5,28.4   # prévia → preview/contact_sheet.png
WORKERS=6 node scripts/render.mjs         # out/frames → out/motion.mp4
```
A senha do playbook não fica neste repositório: passe-a por `GATE_PASSWORD` só na hora de capturar.
