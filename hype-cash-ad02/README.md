# HYPE CASH | Motion 02 (gamer)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 24,0 s. CTA para a página de vendas; sem preço e sem faixa etária.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264 High, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: auditoria, direções criativas, storyboard com timecodes e plano de som.
- `timing.json`: tempos por palavra da narração (faster-whisper medium). É a fonte de todos os tempos.
- `src/index.html`, `src/main.js`: o palco (HTML/SVG/CSS) e a timeline GSAP única e pausada.
  - Expõe `window.__ready` (fontes e imagens carregadas) e `window.seek(t)`.
- `scripts/render.mjs`: captura determinística (Playwright/Chromium, página recarregada a cada quadro) e codificação com FFmpeg.
- `scripts/make-audio.py`: trilha original + SFX + mix com ducking. `scripts/check-audio.py` mede a relação voz/fundo.
- `audio/narration.wav`: narração ElevenLabs gerada para este anúncio (take 2 de 4, em `audio/takes`), sem alterações. `scripts/transcribe.py` gera os tempos por palavra (faster-whisper).

## Reproduzir
Requisitos: Node 22+, Python 3 com NumPy, FFmpeg e Chromium (`CHROME_PATH` para trocar o binário).

```bash
npm ci
python3 scripts/make-audio.py "$PWD"                 # audio/mix.wav
python3 scripts/check-audio.py "$PWD"                # voz sobre o fundo, por janela
node scripts/render.mjs --stills 0,1.8,4.2,7.9,12,15.6,17,20.3,22.6   # prévia → preview/contact_sheet.png
WORKERS=6 node scripts/render.mjs                    # out/frames → out/motion.mp4
```

## Nota de entrega
- **Ferramentas:** GSAP 3.12.5, Playwright + Chromium 141, FFmpeg 6.1, faster-whisper 1.2 (`small` e `medium`), ElevenLabs `eleven_v4` (voz), NumPy.
- **Verificações**, todas sobre o render final:
  - ffprobe: 720 quadros, 30 fps, 24,000 s.
  - Loudness: −14,6 LUFS e pico de −1,5 dBFS.
  - Grade de 1 quadro a cada 0,5 s.
  - Transcrição da mix final (50/50 palavras).
- **Limitações**
  - O ambiente não tem saída de áudio: a mixagem foi validada por medição e transcrição, não por audição humana.
  - O faster-whisper transcreve "Hype Cash" como "HypeCache" mesmo na voz isolada: é limitação do transcritor com o nome, não mascaramento da mix.
