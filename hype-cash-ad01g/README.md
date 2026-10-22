# HYPE CASH | Motion 01 E "O Plano" (universal)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 37,0 s. Construído sobre o prompt universal, com a linguagem das 3 novas referências:
- cortes secos entre preto e branco;
- uma ideia por tela;
- psicologia reversa no gancho;
- "não é X, não é Y, é Z";
- fechamento binário.

As versões A–D continuam intactas (`../hype-cash-ad01c`, `ad01d`, `ad01e`, `ad01f`). Sem preço e sem faixa etária.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: análise das referências, mudanças de alto impacto, copy e storyboard com timecodes e som.
- `timing.json`: tempos por palavra da narração (faster-whisper medium).
- `src/`: palco e timeline GSAP única e pausada.
- `scripts/`: render (Playwright + FFmpeg), trilha, SFX e mix, verificação de voz.
- `audio/narration.wav`: take 1 de 2 do ElevenLabs, sem edição.

## Reproduzir
```bash
npm ci
python3 scripts/make-audio.py "$PWD"
node scripts/render.mjs --stills 0,3.6,5.8,9.7,14.2,15.5,20,24.6,31.3,36.5
WORKERS=6 node scripts/render.mjs
```

## Nota de entrega
- **Verificações sobre o render final:**
  - ffprobe: 1110 quadros, 30 fps, 37,000 s.
  - Loudness: −14,4 LUFS, pico de −1,4 dBFS (render com o gancho refeito).
  - Voz sobre o fundo: mediana de 22,8 dB na faixa da fala.
  - Grade de 1 quadro a cada 0,5 s.
  - Transcrição da mix final (`medium`): todas as palavras, com "Hype Cash" reconhecido corretamente.
- **Correções feitas na revisão:**
  - O primeiro quadro tinha só texto; ganhou um vídeo de GTA 6 tocando, com a barra de progresso correndo.
  - As pílulas de dor estavam pequenas e foram aumentadas.
  - Os riscos de "talento", "tempo" e "dinheiro fácil" apareciam como sublinhado, porque a posição era medida depois do deslocamento inicial da animação. Agora a medida é feita antes.
- **Validade:** criativo pré-lançamento. A frase da data vale até 19/11/2026.
- **Limitação:** o ambiente não tem saída de áudio; a mix foi validada por medição e transcrição.
