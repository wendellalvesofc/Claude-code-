# HYPE CASH | Motion 01 C "Do caos à ordem" (teste A/B/C do Motion 01 universal)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 24,0 s. Terceiro criativo do teste (A em `../hype-cash-ad01c`, B em `../hype-cash-ad01d`, ambos intactos): mesmo objetivo (levar à página de vendas), com ângulo de dor ("não sabe por onde começar"), narração própria e linguagem gráfica chapada. Sem preço e sem faixa etária.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: comparação dos três criativos, copy, storyboard com timecodes e plano de som.
- `timing.json`: tempos por palavra da narração (faster-whisper medium). É a fonte de todos os tempos.
- `src/index.html`, `src/main.js`: palco e timeline GSAP única e pausada (`window.__ready`, `window.seek(t)`).
- `scripts/render.mjs`: captura determinística (Playwright/Chromium) + FFmpeg. `scripts/make-audio.py`: trilha original, SFX e mix. `scripts/check-audio.py`: voz sobre o fundo.
- `audio/narration.wav`: take 1 de 2 do ElevenLabs (`audio/takes`), sem edição.

## Reproduzir
```bash
npm ci
python3 scripts/make-audio.py "$PWD"
node scripts/render.mjs --stills 0,3.5,6.9,9.9,12.9,16.4,19.4,23   # prévia
WORKERS=6 node scripts/render.mjs                                         # out/motion.mp4
```

## Nota de entrega
- **Verificações sobre o render final:**
  - ffprobe: 720 quadros, 30 fps, 24,000 s.
  - Loudness: −14,7 LUFS e pico de −1,5 dBFS.
  - Voz sobre o fundo: mediana de 24 dB na faixa da fala.
  - Grade de 1 quadro a cada 0,5 s.
  - Transcrição da mix final: todas as palavras do roteiro.
- **Correções feitas na revisão:**
  - título do gancho quebrando sobre "começar?";
  - nó de rabisco encostando no título;
  - respostas das missões encostando no ✓.
  - Uma corrida no `render.mjs`: os workers paralelos reescreviam `src/timing.js` enquanto outra página o lia. Agora o script só grava o arquivo quando ele muda.
- **Limitações:** o ambiente não tem saída de áudio; a mix foi validada por medição e transcrição. O transcritor escreve "Hype Cash" como "Hypecash", limitação conhecida dele.
