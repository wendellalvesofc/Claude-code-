# HYPE CASH | Filme 01: "A Rota"
Meta Ads · 9:16 · 1080×1920 · 30 fps · 25,0 s · sem locução · CTA para a página de vendas

Regras do dono do produto: **sem preço** e **sem faixa etária**. O CTA leva à página de vendas, não ao checkout.

## Auditoria (resumo)
- **Produto:** auditado na versão anterior (`../hype-cash-ad01/storyboard.md`).
  - O app foi rodado e testado localmente: senha, checklist 0/4 → 4/4, missão em 100 % e progresso geral em 14 %.
  - O que o HYPE CASH oferece de verdade: 6 missões + 1 bônus em sequência, cada uma com objetivo, tempo, passo a passo e checklist; progresso por missão e geral; Central de Ferramentas.
  - Nada além disso aparece no anúncio.
- **Recursos usados:**
  - HyperFrames 0.8.181 (plugin): skills `hyperframes`, `hyperframes-core`, `hyperframes-animation` (blueprints *kinetic-type-beats* e *overwhelm-surround*, regra *kinetic-beat-slam*) e `hyperframes-cli` (`check`, `snapshot`, `render`).
  - GSAP 3.12.5 (local).
  - Capturas reais do app.
  - SFX da Pixabay.
- **Consultado e não usado:**
  - Skills do Remotion: o HyperFrames já cobre o fluxo e os dois motores seriam redundantes.
  - Registry do HyperFrames: o conceito não precisava de blocos prontos e o briefing pedia evitar glitch e neon gratuitos.
  - Locução ElevenLabs: o filme é guiado por texto e trilha; a voz seria redundante e ocuparia o ritmo.
- **Defeitos da versão anterior, corrigidos aqui:**
  1. O celular era o protagonista: estava na tela em ~23 dos 30 s. Agora aparece só em 14,5–18,0 s (3,5 s).
  2. A composição era a mesma o tempo todo (texto em cima, celular no meio, fundo desfocado). Agora cada cena tem campo, cor, escala e movimento próprios.
  3. A narração era contínua, sem respiro. Agora não há voz; o ritmo é ditado pela trilha a 120 BPM, com pausas e impactos.
  4. As transições eram quase todas fades e blur. Agora:
     - os pills implodem num feed;
     - o corte seco vai para o campo lima;
     - o ponto de REC vira íris;
     - o mapa se inclina;
     - a rota se desenha e a câmera a acompanha;
     - o flash leva à logo;
     - o texto é empurrado para fora;
     - um flash abre o CTA.
  5. Faltavam metáforas visuais. Agora:
     - atenção = pills explodindo do assunto;
     - consumo = feed infinito e "assistir";
     - criar = REC;
     - projeto = rota num mapa;
     - missões = waypoints.

## Três direções avaliadas
1. **Onda de atenção:** a atenção como energia (partículas) que você canaliza. Bonita, mas abstrata: não explica o produto sem narração.
2. **A Rota (escolhida):** o assunto vira um mapa e as missões viram pontos de uma rota.
   - Vocabulário de jogo (mapa, pin "VOCÊ", waypoints) sem copiar a interface de ninguém.
   - Explica "missão por missão" visualmente, sem precisar do celular.
   - Funciona sem som.
3. **Manifesto tipográfico:** só batidas de texto em campos de cor. Forte no gancho, mas genérico e sem demonstração.

## Storyboard
| Tempo (s) | Cena | Texto na tela | Composição e movimento | Transição de saída | Som |
|---|---|---|---|---|---|
| 0,00–2,50 | Gancho | O PRÓXIMO GRANDE ASSUNTO · **GTA VI** · VAI DOMINAR SEU **FEED.** | "GTA VI" bate grande já no quadro 0, com um contorno lima que expande. 12 pills de assunto (Trailer 3?, Vazou?, Teoria do mapa…) explodem do centro para cima e para baixo (*overwhelm*). A frase entra palavra por palavra com giro em X | Tudo sobe e some | Impacto grave em 0,0 · pops nos pills · cliques palavra a palavra · pulso de kick |
| 2,50–5,00 | Feed | A MAIORIA · VAI SÓ · ▶ **ASSISTIR.** | Três colunas de feed rolando rápido (barra vermelha de "assistido"). Texto central com barra rosa de play que cresce da esquerda | Corte seco | Whoosh · hats em 16 avos ("rolagem") · grave em "VAI SÓ" · clique no play |
| 5,00–6,50 | Virada | E SE VOCÊ · **CRIASSE?** | Campo lima, tipografia preta gigante, ponto de REC que pisca | O REC cresce até cobrir a tela (íris) e vira o azul do mapa | Glitch curto e silêncio da trilha · grave + ping · riser + whoosh cinematográfico |
| 6,30–13,50 | A Rota | TRANSFORME O ASSUNTO / EM UM **PROJETO** / DE CONTEÚDO → [MISSÃO POR MISSÃO] · 01 ENCONTRE SEU FORMATO · 02 PUBLIQUE O 1º VÍDEO · 05 CONSTRUA AUDIÊNCIA · 06 MONETIZAÇÃO | Mapa urbano 3D (quarteirões gerados) que se inclina de 68° para 50°. O pin "VOCÊ" cai quicando. A rota lima se desenha pelas ruas e a câmera a segue. Cada waypoint abre um card na batida (números e títulos reais das missões) | No destino, anel de pulso e a câmera mergulha | **Drop** em 6,5 · whooshes nos textos · pop no pin · clique + pop em cada waypoint · groove completo |
| 13,00–14,60 | Revelação | [LOGO] · PLAYBOOK INTERATIVO | Brilho roxo radial, flash branco, a logo entra girando e escalando e "respira" | Corte para o estúdio do celular | Impacto grave forte · brilho · whoosh no subtítulo |
| 14,50–18,10 | Prova (único momento com celular) | ★ 6 MISSÕES + BÔNUS · ✓ CHECKLIST · % PROGRESSO · ⚒ FERRAMENTAS | Celular 3D realista entra por baixo girando. Tela real: checklist da Missão 01 marcando 1→4 (capturas reais de cada estado) e navegação para o Mapa real (Progresso Geral 14 % destacado, card 01 "CONCLUÍDA"). Chips orbitam o aparelho | O celular sai voando para cima | Whoosh · 4 cliques nos checks · pops nos chips · swish de navegação · sino de conclusão |
| 18,00–20,50 | Sem promessa | SEM PROMESSA DE / ~~DINHEIRO FÁCIL.~~ → É UM / **PLANO** / PRA COMEÇAR. | Campo roxo com listras diagonais em movimento. Risco rosa. O texto é empurrado para a esquerda e "PLANO" (gradiente) salta, com sublinhado lima | Flash para o CTA | Breakdown filtrado · glitch no risco · whoosh + grave em "plano" (a batida volta) |
| 20,50–25,00 | CTA | [LOGO] · O playbook interativo para criar conteúdo com o hype do GTA VI · **Conheça o HYPE CASH →** · Toque em Saiba mais ↓ · aviso legal | Arte real da página de vendas (carro ao pôr do sol) com zoom lento. Logo, linha de oferta, botão em gradiente com pulso e brilho, toque visual em 22,6 | Fim (segura) | Impacto + brilho · pop no botão · clique no toque · acorde final soando até o fim |

Aviso: "Produto digital independente, sem vínculo com a Rockstar Games. Resultados dependem da sua execução."

## Som
- **Trilha:** original, sintetizada (`scripts/make-audio.py`). 120 BPM em Mi menor (Em–C–G–D), com seções que seguem as cenas.
- **SFX:** 63 cues da biblioteca Pixabay (licença comercial, `audio/sfx/CREDITS.md`). Cada um é alinhado pelo próprio transiente.
- **Sincronia:** tempos e cues vêm do mesmo `beats.json` usado pela animação.
- **Mix:** −14 LUFS e −1,5 dBTP.

## Gancho alternativo para teste A/B
"TODO MUNDO VAI ASSISTIR. / VOCÊ PODE GRAVAR." Abre direto no campo lima com o REC, e o feed vira a 2ª cena.

## Entrega e qualidade
**Arquivo:** `renders/hype-cash-filme01.mp4`, renderizado pelo HyperFrames (`render --quality delivery --fps 30`, captura beginframe).
- H.264 yuv420p, 1080×1920, 30 fps, **25,0 s**, AAC 48 kHz estéreo, ~25 MB.
- Áudio: −14,2 LUFS e pico de −1,6 dBFS.

**`hyperframes check`**
- 31/31 checagens de contraste WCAG AA passam.
- Os avisos restantes são estruturais: o projeto está num único arquivo, sem sub-composições.
- Os sobreposições e saídas da tela apontados são intencionais (pills entrando, celular saindo de quadro).

**Revisão do render (grade de 1 quadro a cada 0,5 s + quadros em resolução cheia)**
- **1º render:** entre 13,0 s e 13,25 s o flash da logo aparecia antes da hora e lavava a tela de branco.
  - Causa: o estado inicial do `fromTo` era aplicado já no carregamento.
  - Correção: `immediateRender: false` nos dois flashes.
  - O vídeo foi renderizado de novo e conferido.
- **Ajustes antes do render:**
  - Pills reposicionados para não cobrir a frase do gancho (erro do `check`).
  - Animação de espaçamento entre letras trocada por escala (erro do `check`).
  - Rota do mapa estreitada para os cards ficarem no quadro.
  - Ícone do chip "6 missões + bônus" corrigido.

**Limitações**
- Trilha sintetizada e mixagem validadas por medição, não por audição humana.
- Render em GPU de software (mais lento, sem efeito no resultado).
- Durante o movimento da câmera no mapa, um card pode ficar parcialmente cortado na borda por alguns quadros.
