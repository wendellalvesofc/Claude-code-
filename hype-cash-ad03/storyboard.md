# HYPE CASH | Motion 03 Não jogadores: "Você não precisa jogar para criar conteúdo."
Meta Ads · 9:16 · 1080×1920 · 30 fps · 22,5 s · narração ElevenLabs nova (20,2 s) · CTA para a página de vendas

Regras do dono do produto: **sem preço** e **sem faixa etária**.

## Auditoria
- **Narração:** não havia uma pronta para este anúncio (as existentes são do AD 01 e do AD 02, com outros textos). Gerei uma no ElevenLabs.
  - `eleven_v4`, voz "Gabriel — Friendly Brazilian Ad Voice", tom calmo e confiante, 4 takes; usei o take 3.
  - Arquivo usado inteiro, sem cortes nem mudança de velocidade.
- **Escolha do take:** os 4 foram transcritos com faster-whisper `medium`; todos leram o texto certo. O take 3 tem "pra" como no roteiro e as pausas mais naturais.
- **Materiais reaproveitados:**
  - Capturas reais do playbook: Mapa de Missões com progresso 14 %, checklist da Missão 01 completo, Central de Ferramentas.
  - Logo HQ.
  - SFX Pixabay.
  - Pipeline dos Motions 01 e 02: GSAP + Playwright + FFmpeg.
- **Fonte nova:** Instrument Serif (licença OFL, via `@fontsource/instrument-serif`), para a linguagem editorial.
- **Indisponível:**
  - librosa (não instalada).
  - Música licenciada pronta: o conector ElevenLabs só gera voz.
  - Escuta: o ambiente não tem saída de áudio.
- **Escolhas para não repetir as versões anteriores:**
  - Fundo claro de papel, em vez do escuro dos Motions 01 e 02.
  - Fonte serifada em itálico nas palavras-chave, em vez de só Poppins.
  - Cards com contorno de tinta e sombra sólida, em vez de vidro.
  - Desenhos de traço (risco, laço, sublinhado, bússola), em vez de ícones 3D o tempo todo.
  - Música calma, em vez de pulsante.

## Três direções
1. **Editorial (escolhida):**
   - O assunto vira a manchete de uma página impressa ("GTA VI" no estilo de cabeçalho de revista).
   - Formatos de conteúdo nascem de um único ponto rosa que viaja e se abre em cada card: notícias (linhas e foto), curiosidades ("?"), análises (barras e linha de tendência).
   - Fala com quem não joga sem nenhum código visual de videogame, a não ser o controle que cai da página no gancho.
2. **Controle riscado:** o controle riscado vira caneta e microfone. Usado só no gancho.
3. **Lupa:** uma lente revelando ângulos do assunto. Mais fraca para quebrar a objeção.

## Storyboard
| Tempo (s) | Locução | Tela | Composição e movimento | Transição | Som |
|---|---|---|---|---|---|
| 0,00–4,20 | "Você não precisa jogar GTA 6 pra criar conteúdo sobre ele." | PARA QUEM NÃO JOGA · Você não precisa / ~~*jogar*~~ / pra criar *conteúdo* / sobre ele. | Página de papel com o ícone 3D de controle já no quadro 0. "jogar" em serifa itálica gigante é riscado em rosa e perde a cor; o controle **cai da página**. "pra criar conteúdo" sobe palavra a palavra e é circulado por um laço desenhado à mão | A página rola para cima | Pop · swish · glitch curto no risco · whoosh na queda · pop |
| 3,85–9,50 | "O assunto vai estar em todo lugar: notícias, curiosidades, análises." | O ASSUNTO · **GTA VI** (cabeçalho de revista) · vai estar em *todo lugar* · 01 Notícias · 02 Curiosidades · 03 Análises | Página editorial com régua. Um ponto rosa viaja até cada espaço e explode no card: linhas de texto e foto se desenham, um "?" quica, barras sobem e uma linha de tendência se traça | Os cards dobram para o centro e um círculo escuro se abre a partir dali | Whoosh · pop em cada card · tecla, ping e clique em cada formato |
| 9,48–14,25 | "O Hype Cash é um playbook interativo que mostra, missão por missão, como começar…" | [LOGO] · PLAYBOOK INTERATIVO · Missão / por / missão · TELA REAL: Mapa de missões / Checklist / Ferramentas | Brilho roxo e logo em slam. Em "mostra", a logo vai para o canto e o **único celular do anúncio (~2,6 s)** entra pela direita em perspectiva: Mapa de Missões real (progresso 14 %) → checklist real completo → Central de Ferramentas real rolando. Rótulos à esquerda acompanham cada tela | O celular sai pela direita e uma folha de papel sobe | Grave suave + brilho · whooshes de navegação |
| 14,25–16,40 | "…um projeto de conteúdo com esse tema." | COMO COMEÇAR · um projeto de / *conteúdo* / com esse tema. | Volta ao papel: "conteúdo" em serifa rosa gigante e um sublinhado de caneta se desenha | A página desliza para a esquerda | Swish |
| 15,98–18,85 | "Sem promessa fácil: com direção." | Sem promessa ~~*fácil.*~~ · Com / *direção.* | Risco rosa em "fácil"; "direção" em serifa; uma bússola de traço gira e a agulha trava apontando para frente (elastic) | Círculo escuro abre a partir da bússola | Glitch curto · pop · clique quando a agulha trava |
| 18,85–22,50 | "Conheça o Hype Cash." | [LOGO] · O playbook interativo para criar conteúdo com o hype do GTA VI · **Conheça o HYPE CASH →** · aviso legal | Brilho rosa e roxo, logo, botão em gradiente com brilho, cursor clica | Fim | Grave suave · pop · clique |

Aviso: "Produto digital independente, sem vínculo com a Rockstar Games. Resultados dependem da sua execução."

## Som
- **Trilha:** original e sintetizada (`scripts/make-audio.py`).
  - 90 BPM em Ré menor, com piano macio em semínimas, pad quente e um shaker discreto.
  - Um kick suave entra no "Hype Cash"; a trilha afina em "Sem promessa" e resolve no fim.
- **Mix:** música 14 dB abaixo da voz com ducking por sidechain; 36 SFX 10 dB abaixo da voz; master em −14 LUFS e −1,5 dBTP.
- **Verificação:**
  - Relação voz/fundo na faixa da fala: mediana de 24,5 dB.
  - Transcrição da mix final: todas as palavras.
  - O nome "Hype Cash" sai como "HypeCache", a mesma limitação do transcritor já vista nos outros anúncios.
