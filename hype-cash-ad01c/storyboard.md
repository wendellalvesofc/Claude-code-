# HYPE CASH | Motion 01 (universal): "O assunto pode ser o começo do seu projeto"
Meta Ads · 9:16 · 1080×1920 · 30 fps · 30,0 s · narração ElevenLabs existente · CTA para a página de vendas

Regras do dono do produto: **sem preço** e **sem faixa etária**.

## Auditoria
**Materiais encontrados**
- Repositório `gta-vi-cash` (Next.js).
- Capturas reais do app rodando localmente: `hype-cash-ad01/assets/captures`, com teste do checklist (0/4 → 4/4) e do progresso geral (14 %).
- Logo HQ.
- Narração ElevenLabs pronta deste anúncio: `hype-cash-ad01/audio/narration.wav`.
  - Voz "Gabriel — Friendly Brazilian Ad Voice", 28,4 s.
  - Tempos por palavra do Scribe.
- 5 vídeos de referência enviados pelo dono.
- Biblioteca de SFX da Pixabay.

**Usados**
- A narração existente, como áudio principal e sem nenhuma alteração.
- GSAP 3.12.5 (timeline única pausada).
- Playwright + Chromium (captura determinística quadro a quadro).
- FFmpeg (H.264 CRF 16, AAC 320 kbps, +faststart).
- faster-whisper `small` (instalado nesta sessão) para conferir a narração e a mixagem final.
- Recortes reais do playbook.

**Não usados, e por quê**
- librosa (não instalada): a trilha é original e sintetizada com uma grade de BPM conhecida, então não há batidas a detectar.
- HyperFrames: usado no vídeo anterior; aqui o pipeline pedido é GSAP + Playwright + FFmpeg.
- Nova voz no ElevenLabs: já existia narração, e a regra é preservá-la.

**Limitação de escuta:** o ambiente não tem saída de áudio, então não consigo ouvir. A mixagem foi verificada por medição de volume, por relação voz/fundo e por transcrição automática da mix final.

**Problemas das versões anteriores, evitados aqui**
- *v1:* celular dominante (~23 s), mesma composição o tempo todo, fundo desfocado repetido.
- *v2 ("A Rota"):* tipografia pesada em caixa alta, quatro cores neon ao mesmo tempo, sem objetos com volume nem desfoque de movimento.

**Direção desta versão, tirada das referências**
- Tipografia média, em caixa normal, com uma palavra destacada.
- Uma cor de destaque por cena.
- Ícones 3D brilhantes e cards de vidro.
- Desfoque de movimento em toda entrada.
- Respiros em fundo claro.
- Transições em que um objeto vira a próxima cena.
- Celular em um único momento curto.

## Três direções avaliadas
1. **"Do feed ao projeto" (escolhida):**
   - Objetos concretos contam a virada: um enxame de vídeos, um deles vira "seu", o logo, um fluxo "assunto → projeto", os cards reais das missões empilhando, o celular com telas reais, um caminho até a bandeira.
   - Casa exatamente com cada frase da narração.
   - Tem a linguagem das referências 1 e 3 (objeto 3D + palavra-chave).
2. **"Manifesto branco":** tudo em fundo claro com tipografia e ícones de traço (referência 4). Limpa, mas perde a energia gamer da marca.
3. **"Constelação de audiência":** pontos e conexões formando uma rede que cresce. Bonita, mas abstrata para "missões, checklist, progresso".

## Storyboard
| Tempo (s) | Locução | Tela | Composição e movimento | Transição de saída | Som |
|---|---|---|---|---|---|
| 0,00–3,86 | "Você vai assistir centenas de vídeos sobre GTA 6." | Você vai assistir / **centenas** (lima) / de vídeos sobre GTA VI | **Feed infinito** (versão 3 do gancho, escolhida como diretor): já no quadro 0 a tela inteira é uma parede inclinada de miniaturas em movimento (pôr do sol, cidade, palmeira, título grande como TRAILER 2, TEORIAS, MAPA COMPLETO e duração), sem ícone de play nem interface de plataforma. Em "centenas" a câmera dá um tranco e o feed dispara com desfoque de movimento; em "GTA 6" ele freia até parar, tudo escurece e um único vídeo rosa se solta da parede e vira para a câmera | O vídeo escolhido sobe e cresce até virar "o seu vídeo"; um círculo claro se abre atrás dele | Grave em 0,0 · swish · pop + whoosh em "centenas" · clique em "GTA" · pop no destaque |
| 3,86–6,38 | "E se alguns deles fossem seus?" | E se alguns deles / fossem **seus?** (rosa, sublinhado) | Fundo claro (respiro). O vídeo flutua com sombra e, em "seus", gira em 3D e vira "@seucanal · publicado por você". Ícone 3D de REC aparece | Círculo escuro se abre a partir do REC | Whoosh · pop + swish no giro · ping no REC · whoosh cinematográfico |
| 6,38–11,92 | "O Hype Cash é um playbook interativo pra transformar esse assunto num projeto de conteúdo." | [LOGO] · PLAYBOOK INTERATIVO · "de um assunto: GTA VI" → "a um projeto de **conteúdo**" | Brilho roxo e logo em slam com desfoque. Chip de vidro. Logo e chip sobem; card de vidro "assunto" entra com desfoque; linha pontilhada e ponto lima descem até o card "projeto de conteúdo" (borda lima) | Círculo roxo se abre a partir do card de projeto | Grave + brilho na logo · pop no chip · whoosh no card · clique no ponto · pop no projeto · whoosh |
| 11,92–19,62 | "Missão por missão: encontrar seu formato, publicar o primeiro vídeo, construir audiência e entender os caminhos de monetização." | Missão por missão · **seu formato** · **1º vídeo** · **audiência** · **monetização** | Campo roxo da marca com manchas de luz. Os cards reais das missões 01, 02, 05 e 06 (recortes do app) entram de baixo com rotação 3D e desfoque; os anteriores recuam para cima e para trás. Cada card ganha um ícone 3D (grade, play, pessoas, barras). A palavra-chave lima troca a cada frase | A cena inteira é empurrada para cima com desfoque | Swish + pop em cada card |
| 19,20–23,25 | "Com checklist, progresso e uma central de ferramentas." | ✓ Checklist · ◔ Progresso · 🔧 Ferramentas | **Único momento com celular (~3,5 s).** O aparelho entra pela direita girando com desfoque. Telas reais: checklist da Missão 01 marcando 1→4, Mapa com Progresso Geral 14 % destacado, Central de Ferramentas rolando. Etiquetas com ícones 3D entram na palavra | O celular sai voando para cima; um painel claro sobe de baixo | Whoosh · 4 cliques nos checks · pops nas etiquetas · swishes de navegação |
| 22,95–26,80 | "Sem promessa de dinheiro fácil: é um plano pra começar." | Sem promessa de / ~~dinheiro fácil.~~ → É um / **plano** / pra começar. | Fundo claro. Risco rosa em "dinheiro fácil" e o texto cai; "plano" em gradiente. Um pino lima e um caminho pontilhado se desenham até um ícone 3D de bandeira | Círculo escuro se abre a partir da bandeira | Glitch curto no risco · grave em "plano" · pop na bandeira · whoosh |
| 26,80–30,00 | "Conheça o Hype Cash." | [LOGO] · O playbook interativo para criar conteúdo com o hype do GTA VI · **Conheça o HYPE CASH →** · aviso legal | Brilho rosa e roxo, logo em slam e "respirando". Botão em gradiente com brilho; cursor entra e clica (ondulação) | Fim | Grave + brilho · pop no botão · clique |

Aviso: "Produto digital independente, sem vínculo com a Rockstar Games. Resultados dependem da sua execução."

## Som
- **Narração:** ElevenLabs original, intacta. É a referência de tempo de tudo (`timing.json`).
- **Trilha:** original e discreta (`scripts/make-audio.py`). 96 BPM em Ré menor, com pad, sub e pluck abafado.
  - Abre em "Hype Cash".
  - Afina em "Sem promessa".
  - Resolve no "Hype Cash" final.
  - Fica 14 dB abaixo da voz, com ducking por sidechain.
- **SFX:** 49 cues, 10 dB abaixo da voz, cada um alinhado pelo transiente.
- **Master:** −14 LUFS e −1,5 dBTP.
