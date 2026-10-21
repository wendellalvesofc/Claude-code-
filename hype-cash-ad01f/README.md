# HYPE CASH | Motion 01 D "A Estreia" (universal, persuasão máxima)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 34,0 s. Quarto criativo do teste (A `../hype-cash-ad01c`, B `../hype-cash-ad01d`, C `../hype-cash-ad01e`, todos intactos). Ângulo: prova social com número verificável (475 milhões de views em 24 h), urgência real (lançamento em 19/11/2026), identidade/escassez ("a maioria só vai assistir; poucos vão criar") e medo de começar atrasado. Sem preço e sem faixa etária.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: pesquisa com fontes, estratégia de persuasão, copy, storyboard com timecodes, plano de som e prazo de validade do criativo.
- `timing.json`: tempos por palavra da narração (faster-whisper medium).
- `src/index.html`, `src/main.js`: palco e timeline GSAP única e pausada. A multidão de pontos é desenhada num canvas de forma determinística a partir do tempo.
- `scripts/`: render (Playwright + FFmpeg), trilha/SFX/mix, verificação de voz.
- `audio/narration.wav`: take 1 de 2 do ElevenLabs (`audio/takes`), sem edição.

## Reproduzir
```bash
npm ci
python3 scripts/make-audio.py "$PWD"
node scripts/render.mjs --stills 0,2.2,6.4,9.3,12.4,17.4,20.4,24.7,29.9,33   # prévia
WORKERS=6 node scripts/render.mjs
```

## Nota de entrega
- **Verificações sobre o render final:**
  - ffprobe: 1020 quadros, 30 fps, 34,000 s.
  - Loudness: −14,8 LUFS e pico de −1,5 dBFS.
  - Grade de 1 quadro a cada 0,5 s.
  - Transcrição da mix final (modelo `medium`): todas as palavras do roteiro.
- **Correções feitas na revisão:**
  - as duas frases da cena "a maioria / poucos" se sobrepunham;
  - o flash do corte para a data deixava um quadro cinza inteiro;
  - a logo ficava 3 s parada antes do rolo de missões, que agora entra em "que te prepara";
  - o riser de 12 s caía em cima de "atenção" e foi movido.
- **Validade:** criativo pré-lançamento. Depois de 19/11/2026 a frase da data deixa de valer (ver `storyboard.md`).
- **Limitações:**
  - O ambiente não tem saída de áudio; a mix foi validada por medição e transcrição.
  - O modelo `small` do transcritor ouve "essa atenção" como "essa tensão" até na voz isolada; o `medium` acerta.
  - O número 475 milhões é a contagem multiplataforma divulgada pela Rockstar, e a fonte aparece na tela.
