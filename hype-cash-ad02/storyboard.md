# HYPE CASH | Motion 02 Gamer: "Você já vai jogar. Pense além da partida."
Meta Ads · 9:16 · 1080×1920 · 30 fps · 24,0 s · narração ElevenLabs nova (22,2 s) · CTA para a página de vendas

Regras do dono do produto: **sem preço** e **sem faixa etária**.

## Auditoria
- **Narração:** não havia uma pronta para este anúncio (a existente é do AD 01, com outro texto). Gerei uma no ElevenLabs.
  - `eleven_v4`, voz "Gabriel — Friendly Brazilian Ad Voice", 4 takes; usei o take 2.
  - Arquivo usado inteiro, sem cortes nem mudança de velocidade.
- **Escolha do take:** os 4 foram transcritos localmente com faster-whisper.
  - Todos leram o texto certo, sem falar as marcações de tom.
  - O take 2 tem as pausas mais naturais e separa "Sem promessa fácil. / Com um plano."
- **Materiais reaproveitados:**
  - Capturas reais do playbook: checklist da Missão 01 em 5 estados e Mapa com progresso 14 %.
  - Logo HQ.
  - Nomes reais das missões 01, 02, 05 e 06 (`data/missions.js`).
  - Biblioteca de SFX Pixabay.
  - Pipeline do Motion 01: GSAP + Playwright + FFmpeg.
- **Indisponível:**
  - librosa (não instalada; a trilha é sintetizada com uma grade de BPM conhecida).
  - Música licenciada pronta: o conector ElevenLabs disponível não gera música.
  - Escuta: o ambiente não tem saída de áudio.
- **Falhas das versões anteriores, evitadas aqui:**
  - Celular dominante.
  - Fundo desfocado repetido.
  - Tipografia pesada em caixa alta.
  - Várias cores neon juntas.
  - Repetir a estrutura de contraste do AD 01 (nada de enxame de vídeos, cards de vidro empilhados ou caminho até bandeira).

## Três direções
1. **HUD de jogo original (escolhida):** a tela vira a interface de uma partida própria, sem copiar nenhum jogo.
   - Elementos: "PLAYER 1", relógio de tempo de jogo disparando, objetivo que é riscado e trocado, "+1 conteúdo" como XP, diário de missões com barra de progresso, minimapa com rota.
   - Fala direto com quem joga, e o playbook já é gamificado (missões, checklist, progresso).
2. **Controle → câmera:** o ícone de controle vira o botão REC. Usado como a virada dentro da direção 1.
3. **Tela dividida "jogar × criar":** clara, mas repete o contraste do AD 01.

## Storyboard
| Tempo (s) | Locução | Tela | Composição e movimento | Transição | Som |
|---|---|---|---|---|---|
| 0,00–2,80 | "Você já vai jogar GTA 6." | PLAYER 1 · TEMPO DE JOGO 03:12:40 → · Você já vai / **jogar** / GTA VI | Moldura de HUD lima nos cantos e ícone 3D de controle no quadro 0. O relógio de tempo de jogo dispara (uma sessão que não acaba). "jogar" em slam | — | Grave + tecla no 0,0 · pop em "jogar" · pulso de kick e pluck desde o início |
| 2,80–5,07 | "Então pensa além da partida." | Então pensa / **além** da partida · painel OBJETIVO ATUAL: "Zerar a história" → ~~riscado~~ → NOVO OBJETIVO: "Criar a partir do jogo" | Painel de vidro entra com desfoque. Em "além" os cantos do HUD voam para fora da tela (literalmente além da partida) e o objetivo é atualizado. O controle gira e vira o REC | Círculo lima abre a partir do REC | Whoosh · clique no risco · notificação no novo objetivo · whoosh cinematográfico |
| 5,07–9,25 | "Cada sessão pode virar conteúdo: gameplay, guia, react." | Cada sessão pode virar / **conteúdo** · Gameplay · Guia · React · "+1 conteúdo" | Campo lima (respiro e contraste). Três ícones 3D (play, livro, balão) entram na palavra com desfoque de movimento, cada um ganhando o selo "+1 conteúdo" como XP | Os ícones implodem para o centro; círculo escuro se abre | Pop + ping em cada ícone |
| 9,25–16,22 | "O Hype Cash é um playbook interativo, com missões pra você começar: formato, primeiro vídeo, audiência e monetização." | [LOGO] · PLAYBOOK INTERATIVO · DIÁRIO DE MISSÕES: 01 Entre no Jogo / formato · 02 Modo Gameplay / 1º vídeo · 05 Território Próprio / audiência · 06 Escala de Monetização / monetização · barra de progresso | Raios lima e rosa disparam com a logo (estilo "conquista"). Em "missões" a logo sobe e o diário de missões (painel de vidro) sobe em 3D. Cada linha acende na palavra: check, palavra-chave e barra avançando 25 % | O painel recua e desfoca | Grave + brilho · whoosh do painel · clique + ping em cada missão |
| 16,15–18,30 | "Com checklist e progresso." | ✓ Checklist · ◔ Progresso | **Único momento com celular (~2,1 s).** O aparelho sobe com desfoque. Tela real: checklist da Missão 01 marcando 1→4 e navegação para o Mapa real com Progresso Geral 14 % destacado | O celular cai para fora | Whoosh · 4 cliques nos checks · pops nas etiquetas |
| 18,25–20,80 | "Sem promessa fácil. Com um plano." | Sem promessa ~~fácil.~~ · Com um / **plano** | Minimapa original: radar com varredura, rota lima traçada até um waypoint rosa | O radar avança para a câmera | Glitch curto no risco · grave em "plano" · ping no waypoint |
| 20,75–24,00 | "Conheça o Hype Cash." | [LOGO] · O playbook interativo para criar conteúdo com o hype do GTA VI · **Conheça o HYPE CASH →** · aviso legal | Brilho rosa e roxo, logo em slam, botão em gradiente com brilho, cursor clica (ondulação) | Fim | Grave · pop no botão · clique |

Aviso: "Produto digital independente, sem vínculo com a Rockstar Games. Resultados dependem da sua execução."

## Som
- **Trilha:** original e sintetizada (`scripts/make-audio.py`).
  - 120 BPM em Ré menor, com plucks em colcheias e kick leve desde o primeiro quadro (energia de jogo).
  - Abre em "Hype Cash", afina em "Sem promessa" e resolve no "Hype Cash" final.
  - Os hats ficam de fora em volta das duas menções à marca, para não somar ruído ao "sh" de "Cash".
- **Mix:** música 14 dB abaixo da voz com ducking por sidechain; 52 SFX 10 dB abaixo da voz; master em −14 LUFS e −1,5 dBTP.
- **Verificação:**
  - Relação voz/fundo na faixa da fala: mediana de 27,6 dB.
  - Transcrição da mix final: 50/50 palavras.
  - "Hype Cash" sai como "HypeCache" no faster-whisper mesmo com a voz isolada e normalizada. É uma limitação do transcritor com esse nome, não um mascaramento da mix; o arquivo original sai "Hypecash".
