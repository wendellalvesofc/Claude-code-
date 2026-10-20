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

## Relatório de qualidade (vídeo final)
**Arquivo**
- `out/motion.mp4`: H.264 High, yuv420p, 1080×1920, 30 fps, 30,000 s (900 quadros), AAC 48 kHz estéreo, 16,4 MB.

**Áudio**
- −14,6 LUFS integrado e pico de −1,4 dBFS.
- Voz sobre música + SFX, na faixa da fala (300 Hz–4 kHz): mediana de 28,8 dB.
- O ponto mais apertado da faixa cheia é o grave do impacto final sob "Hype Cash" (28,0 s), sem perda de inteligibilidade na faixa da fala.

**Imagem**, conferida em grade de 1 quadro por segundo (`preview/qc/grid.png`) e quadros em resolução cheia:
- O texto do gancho já está na tela no quadro 0.
- Os textos ficam dentro de y 220–1500.
- Títulos dos cards, checklist e ferramentas ficam legíveis no tamanho do celular.
- Não aparecem artefatos de transição.

**Sincronia:** todos os eventos de imagem e de SFX saem do mesmo `timing.json` (tempos por palavra), então a animação cai na palavra falada.

**Limitações**
- As telas são capturas reais do app rodando localmente, com o código de hoje do repositório. Não foram feitas na versão publicada na Vercel, mas o conteúdo bate com ela.
- O texto do checklist foi renderizado na cor que o iPhone mostra (azul do sistema), porque o app não define essa cor. Ver os achados da auditoria em `storyboard.md`.
- A trilha é sintetizada e original. A locução é IA (ElevenLabs).
- A mixagem foi validada por medição, não por audição humana. Vale ouvir no celular antes de subir na Meta.
