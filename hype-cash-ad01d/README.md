# HYPE CASH | Motion 01 B "A Busca" (teste A/B do Motion 01 universal)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 30,0 s. Mesmo objetivo do Motion 01 A (levar à página de vendas), com outro ângulo de copy, outra narração e outra linguagem visual. Sem preço e sem faixa etária. A versão A continua intacta em `../hype-cash-ad01c`.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: ângulo da versão B, comparação com a A, copy, storyboard com timecodes e plano de som.
- `timing.json`: tempos por palavra da narração (faster-whisper medium). É a fonte de todos os tempos.
- `src/index.html`, `src/main.js`: palco e timeline GSAP única e pausada (`window.__ready`, `window.seek(t)`).
- `scripts/render.mjs`: captura determinística (Playwright/Chromium) + FFmpeg. `scripts/make-audio.py`: trilha original, SFX e mix. `scripts/check-audio.py`: voz sobre o fundo.
- `audio/narration.wav`: take 3 de 4 do ElevenLabs (`audio/takes`), sem edição.

## Reproduzir
```bash
npm ci
python3 scripts/make-audio.py "$PWD"
node scripts/render.mjs --stills 0,3.3,6.3,11.3,15.4,18.3,20.8,25.4,28   # prévia
WORKERS=6 node scripts/render.mjs                                         # out/motion.mp4
```

## Nota de entrega
- **Verificações sobre o render final:** ffprobe (900 quadros, 30 fps, 30,000 s); −14,8 LUFS, pico −1,4 dBFS; grade de 1 quadro a cada 0,5 s; transcrição da mix final com todas as palavras do roteiro.
- **Correções feitas na revisão:**
  - título do gancho quebrando sobre a segunda linha;
  - buscas cobrindo "pesquisar";
  - logo sobre a rota de missões;
  - palavras gigantes se sobrepondo na troca;
  - placa "NO AR" acesa por pouco tempo;
  - texto do botão aparecendo por trás da busca;
  - mão cobrindo o nome no botão.
- **Limitações:** o ambiente não tem saída de áudio; a mix foi validada por medição e transcrição. O transcritor escreve "Hype Cash" como "Hypecash", que é limitação conhecida dele.
