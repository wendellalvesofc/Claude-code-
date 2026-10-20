# HYPE CASH | AD 01: A oportunidade por trás do assunto
Meta Ads · 9:16 · 1080×1920 · 30 fps · 30,0 s (900 quadros) · CTA para a página de vendas

Regras deste anúncio, definidas pelo dono do produto:
- **Sem preço**, parcelas, desconto ou garantia. O anúncio leva à página de vendas, não ao checkout.
- **Sem faixa etária** do público.

## 1. Auditoria

### Testado (app rodando localmente: `next build` + `next start`, navegador em 430×932, DPR 3)
- **Build:** compila sem erros. Rotas:
  - `/` (vendas)
  - `/playbook` (início)
  - `/playbook/missoes`
  - `/playbook/missao/[id]` (7 missões)
  - `/playbook/ferramentas`
  - `/obrigado`, `/garantia`, `/contato`, páginas legais
  - `/api/webhook-kiwify`
- **Acesso ao playbook:** fica atrás de uma tela de senha. A senha certa libera e o desbloqueio é guardado no navegador.
- **Checklist da Missão 01:** marcar os 4 itens pela interface muda o contador (0/4 → 4/4), a barra da missão vai a 100 % e aparece o selo "✓ Missão Concluída".
- **Progresso geral:** no Mapa de Missões vai para 14 % e o card 01 passa a "CONCLUÍDA". O progresso continua ao navegar entre as páginas.
- Nenhum erro de JavaScript nas páginas visitadas.

### Visto nas telas
- Página de vendas: hero, oferta, problema, números do GTA, método, missões, FAQ.
- Playbook:
  - Início: "Transforme o hype do GTA VI em dinheiro."
  - Mapa de Missões: 01 a 06 + BÔNUS, com estado de cada uma.
  - Detalhe da missão: objetivo, investimento, tempo, perfil ideal, ferramentas, passo a passo, checklist.
  - Central de Ferramentas: 4 categorias, com selo GRATUITO ou FREEMIUM em cada ferramenta.
- Os prints enviados pelo dono (iPhone) batem com as capturas locais.

### Identificado só no código (não testado de ponta a ponta)
- **Conteúdo:** `data/missions.js` (7 missões, a 7ª marcada como PRO/bônus) e `data/tools.js`.
- **Oferta:** `data/config.js` traz preço, parcelas, garantia de 7 dias e checkout Kiwify. Não entra no anúncio, por decisão do dono.
- **Webhook Kiwify:** para compras aprovadas, envia um evento de conversão a um serviço externo de anúncios. Não foi exercitado.
- **Entrega da senha:** a tela diz que a senha é enviada por e-mail após a compra. O envio não está neste repositório.

### Incerto ou não verificado
- Se o fluxo compra → e-mail → acesso funciona em produção.
- Depoimentos, resultados de alunos e número de compradores: não existem no projeto e não aparecem no anúncio.
- Os números de mercado do GTA da página de vendas vêm de `MarketProofSection.js`. Não foram conferidos com fontes externas e não aparecem no anúncio.

### Achados para o dono (fora do escopo do anúncio)
1. **A senha do playbook está no código do navegador** (`components/auth/PasswordGate.js`). Qualquer pessoa consegue lê-la pelas ferramentas de desenvolvedor e entrar sem comprar.
2. **O texto do checklist fica quase ilegível fora do iPhone.** Os botões de `.checklistItem` não definem cor de texto. No Safari/iOS aparece o azul padrão do sistema (como nos prints do dono); no Chrome/Android aparece preto sobre fundo escuro.
   - As capturas do anúncio reproduzem a aparência do iPhone.
   - Correção sugerida: `color: inherit` (ou `var(--text-primary)`) em `.checklistItem`.
3. **O progresso fica salvo só no navegador** (`localStorage`). Quem troca de aparelho ou limpa os dados perde o progresso.
4. **O anúncio evita deixar legíveis frases sobre ganhar dinheiro.** O início do playbook diz "Transforme o hype do GTA VI em dinheiro." e o hero da página de vendas diz "comece a lucrar com o hype". O anúncio mostra só Mapa de Missões, Missão 01, checklist, progresso e Central de Ferramentas. Se a Meta reprovar por promessa de renda, essas frases na página de destino também podem pesar na revisão.

### Diferenciais que justificam o produto frente ao conteúdo gratuito, demonstrados no vídeo
- Uma **sequência**: 6 missões + bônus, em ordem, cada uma com objetivo, tempo e investimento estimados.
- **Execução guiada:** passo a passo e checklist que marca e conta (testado).
- **Progresso visível:** por missão e geral (testado).
- **Curadoria de ferramentas** ligadas a cada missão.

## 2. Conceito criativo: "Do outro lado da tela"
O GTA VI vai gerar uma enxurrada de vídeos, e quase todo mundo vai estar só **assistindo**. O anúncio mostra o mesmo celular dos dois lados:

1. Primeiro é o feed de quem consome: rolagem infinita, vídeos "assistidos".
2. Depois um desses vídeos sai da tela e passa a ser **seu** ("@seucanal · publicado por você").
3. O celular gira e mostra o outro lado: o HYPE CASH, com as telas reais do playbook.

**Por que funciona**
- O gancho fala com um comportamento que o público já tem ("você vai assistir centenas de vídeos").
- A virada convida a trocar de papel ("e se alguns deles fossem seus?"), sem prometer dinheiro.
- O produto aparece como **orientação**: missões, checklist, progresso, ferramentas.
- Antes do CTA, a frase "Sem promessa de dinheiro fácil" filtra quem procura atalho. Isso qualifica o clique e deixa o anúncio coerente com as políticas da Meta.
- Funciona para quem nunca ouviu falar do HYPE CASH: em 6 s a pessoa sabe o assunto (GTA VI), a proposta (criar conteúdo) e quem orienta (o produto).

**Gancho escolhido:** "Você vai assistir centenas de vídeos sobre GTA 6. E se alguns deles fossem seus?"
- A frase-base do briefing, "E se o próximo grande assunto dos games também fosse o começo do seu projeto digital?", é longa para os 2 primeiros segundos e abstrata ("projeto digital").
- A versão escolhida é concreta e tem imagem própria (o feed).
- A ideia do briefing continua presente em "transformar esse assunto num projeto de conteúdo".

## 3. Storyboard
Zona segura: o essencial fica entre y 220 e 1500.

| # | Tempo | Locução | Texto na tela | Visual e movimento | Som | Função |
|---|---|---|---|---|---|---|
| S1 Gancho | 0,00–3,40 | "Você vai assistir centenas de vídeos sobre GTA 6." | VOCÊ VAI ASSISTIR / **CENTENAS** / DE VÍDEOS SOBRE **GTA VI** | Celular 3D inclinado, já em movimento no quadro 0: um feed original (sem marca de terceiros) rola em "flicks" com inércia. Cards passados ganham barra de "assistido". Cada linha de texto entra batendo na palavra falada | 0,00 impacto grave · swish em cada flick · 0,80 pop · 2,32 grave + glitch curto · hats em ritmo de rolagem | Prender a atenção e criar identificação |
| S2 Virada | 3,40–6,20 | "E se alguns deles fossem seus?" | E SE ALGUNS DELES / FOSSEM **SEUS?** (sublinhado lima) | O feed para. Em "deles", um card sai da tela em 3D e o celular escurece. Em "seus", o autor vira "@seucanal · publicado por você", com selo VOCÊ e chip GRAVANDO | 3,45 clique suave · 4,54 whoosh · 5,30 notificação + pop · filtro da trilha abrindo | Curiosidade: passar de espectador a criador |
| S3 Revelação | 6,20–11,75 | "O Hype Cash é um playbook interativo pra transformar esse assunto num projeto de conteúdo." | [LOGO] · PLAYBOOK INTERATIVO · de um assunto / A UM **PROJETO** DE CONTEÚDO | O card volta para o celular, que gira 180°: do outro lado está o Mapa de Missões real. Flash + logo HQ com brilho. Destaque lima no selo real "PLAYBOOK INTERATIVO" da tela | riser → 6,42 whoosh cinemático → 6,44 impacto + brilho (**drop**) · 7,36 clique · 10,28 grave | Apresentar o produto e a proposta |
| S4 Missões | 11,75–19,30 | "Missão por missão: encontrar seu formato, publicar o primeiro vídeo, construir audiência e entender os caminhos de monetização." | MISSÃO POR **MISSÃO** · 01 ENCONTRE SEU FORMATO · 02 PUBLIQUE O 1º VÍDEO · 05 CONSTRUA AUDIÊNCIA · 06 CAMINHOS DE MONETIZAÇÃO | Câmera aproxima o celular (1,42×) e a tela real rola. Um contorno lima pula de card em card (01 Entre no Jogo → 02 Modo Gameplay → 05 Território Próprio → 06 Escala de Monetização), na palavra falada | clique + swish em cada etapa · groove completo | Mostrar a sequência real e o que se aprende |
| S5 Recursos | 19,30–22,95 | "Com checklist, progresso e uma central de ferramentas." | ✓ **CHECKLIST** · **PROGRESSO** · CENTRAL DE **FERRAMENTAS** | Navega para a Missão 01: o checklist real marca 1→4 (capturas reais de cada estado). Desliza para o Mapa: Progresso Geral 14 % destacado e card 01 "CONCLUÍDA". Desliza para a Central de Ferramentas, com rolagem lenta | 4 cliques nos checks · swish em cada troca · sino ao concluir | Provar que é interativo e organizado |
| S6 Sem promessa | 22,95–26,55 | "Sem promessa de dinheiro fácil. É um plano pra começar." | SEM PROMESSA DE / ~~DINHEIRO FÁCIL.~~ → É UM / **PLANO** / PRA COMEÇAR. | O celular recua e escurece. Risco rosa em "dinheiro fácil"; "plano" com sublinhado lima | Breakdown (pad filtrado) · glitch no risco · grave + volta da batida em "plano" | Qualificar o tráfego e afastar quem procura atalho |
| S7 CTA | 26,55–30,00 | "Conheça o Hype Cash." | [LOGO] · Um plano interativo para criar conteúdo com o hype do GTA VI · **Conheça o HYPE CASH →** · Toque em Saiba mais ↓ · aviso legal | O celular sai por baixo. Fundo da arte real da página de vendas (carro ao pôr do sol). Logo, botão em gradiente com pulso e brilho, toque visual no botão em 28,3 s | 26,80 impacto + brilho · pop no botão · 28,30 clique · acorde final | Converter em visita à página de vendas |

Aviso legal na tela: "Produto digital independente, sem vínculo com a Rockstar Games. Resultados dependem da sua execução."

## 4. Locução e som
**Locução**
- **Texto:** "Você vai assistir centenas de vídeos sobre GTA seis. E se alguns deles fossem seus? O Hype Cash é um playbook interativo pra transformar esse assunto num projeto de conteúdo. Missão por missão: encontrar seu formato, publicar o primeiro vídeo, construir audiência e entender os caminhos de monetização. Com checklist, progresso e uma central de ferramentas. Sem promessa de dinheiro fácil: é um plano pra começar. Conheça o Hype Cash."
- **Voz:** ElevenLabs `eleven_v4`, "Gabriel — Friendly Brazilian Ad Voice" (a mesma do anúncio v2, por consistência de marca). Take 3 de 3.
- **Edição:** as duas pausas longas do gancho e a pausa antes do CTA foram encurtadas cortando só silêncio. A velocidade da fala não foi alterada. Duração final: 28,4 s.
- **Sincronia:** tempos por palavra do ElevenLabs Scribe, em `timing.json`. A transcrição confere com o texto, incluindo "GTA 6" e "Hype Cash".

**Trilha:** original, sintetizada em `scripts/make-audio.py`. Synthwave a 110 BPM em Ré menor (Dm–Bb–F–C), com a grade alinhada para o drop cair exatamente em "Hype Cash".
- Hook: pulso grave e hats de "rolagem".
- "E se…": filtro abrindo, de suspense.
- Drop: bateria, baixo em colcheias e arpejo.
- "Sem promessa": breakdown.
- "Plano": a batida volta.
- Final: acorde em "Hype Cash".

**SFX:** 44 efeitos da biblioteca Pixabay (licença comercial, `audio/sfx/CREDITS.md`). Cada um é alinhado pelo próprio transiente ao evento visual. A lista com tempo e ganho está em `audio/sfx-cues.json`.

**Mix**
- Música 11 dB abaixo da voz, com ducking por sidechain; SFX 8 dB abaixo da voz.
- Master em −14 LUFS e pico de −1,5 dBTP.
- Inteligibilidade (`scripts/check-audio.py`): na faixa da fala (300 Hz–4 kHz), a voz fica em mediana 28,8 dB acima do resto.

## 6. Qualidade e limitações
Ver a seção "Relatório de qualidade" no README.

## 7. Gancho alternativo para teste A/B
**"O GTA VI ainda nem saiu, e já tem gente montando o canal pra quando ele chegar."**
- **Visual:** um "timer" de contagem sem data inventada, só um relógio girando. O celular mostra o checklist da Missão 01 sendo marcado logo no gancho.
- **Hipótese:** urgência sem escassez falsa (antecipar-se ao lançamento), mostrando o produto já no 1º segundo.
- **Risco:** "já tem gente" é uma afirmação social que não dá para provar com dados do produto. Se for testar, prefira "Dá pra montar seu canal antes do GTA VI chegar."
