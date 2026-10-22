# HYPE CASH | Motion 01 F "Alto Impacto" (universal)

Anúncio vertical para Meta Ads: 1080×1920, 30 fps, 35,0 s. Inspirado nas referências potenzio e framehub:
- um objeto-metáfora por frase;
- fundo trocando de cor a cada batida;
- interruptor Espectador/Criador clicado;
- roleta de objeções;
- botão "Saiba mais" que inunda a tela.

As versões A–E continuam intactas. Sem preço e sem faixa etária.

## Arquivos
- `out/motion.mp4`: vídeo final (H.264, yuv420p, CRF 16; AAC 320 kbps 48 kHz; +faststart).
- `storyboard.md`: referências, copy e storyboard com batidas, fundos e som.
- `timing.json`: tempos por palavra da narração (faster-whisper medium).
- `src/`: palco e timeline GSAP única e pausada. O planeta, a poeira e o fio que se desenrola são desenhados de forma determinística a partir do tempo.
- `scripts/`: render, trilha, SFX, mix e verificação.
- `audio/narration.wav`: take 1 de 2 do ElevenLabs, sem edição.

## Reproduzir
```bash
npm ci
python3 scripts/make-audio.py "$PWD"
node scripts/render.mjs --stills 0,1.4,2.2,5.9,6.8,9.9,12.1,16.2,18.6,22.3,25.2,26.9,30.4,32.6
WORKERS=6 node scripts/render.mjs
```

## Nota de entrega
- **Verificações sobre o render final:**
  - ffprobe: 1050 quadros, 30 fps, 35,000 s.
  - Loudness: −14,6 LUFS e pico de −1,5 dBFS.
  - Grade de 1 quadro a cada 0,5 s.
  - Transcrição da mix final (`medium`): todas as palavras.
- **Correções feitas na revisão:**
  - O primeiro "vai" não aparecia, porque o tempo usado era o do segundo "vai" da narração.
  - O planeta parecia de brinquedo e ganhou mais continentes e nuvens.
  - O contador "1.000.000+" encostava nas bordas.
  - Os balões de busca mostravam números inventados e passaram a mostrar termos de busca.
- **Uso no Meta:** a narração pede "Toque em saiba mais", então use o botão de ação **Saiba mais**.
- **Validade:** criativo pré-lançamento; depois de 19/11/2026, trocar só a frase da data.
- **Limitação:** o ambiente não tem saída de áudio; a mix foi validada por medição e transcrição.
