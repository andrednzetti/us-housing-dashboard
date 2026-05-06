# Handoff: Dashboard Mercado Imobiliário EUA — Variação D

## Visão geral
Dashboard semanal de mercado imobiliário americano para investidores brasileiros, da Dissenha Moulding. Apresenta 18 indicadores oficiais (Freddie Mac, FRED, Census, NAHB, MBA, S&P CoreLogic Case-Shiller) com filtros por categoria, drill-down em qualquer indicador, ranking regional e top metros do Sun Belt.

A "Variação D" usa a paleta da marca Dissenha Moulding em formato editorial-corporativo (estilo documento/boletim).

## Sobre os arquivos do bundle
Os arquivos `.jsx` e `.html` deste pacote são **referências de design** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar diretamente**. A tarefa é **recriar esses designs no ambiente do codebase de destino** (React, Next.js, Vue, etc.), usando os padrões e bibliotecas já estabelecidos. Se nenhum ambiente existir ainda, o desenvolvedor deve escolher o framework mais apropriado.

O protótipo roda standalone em `Dashboard.html` (React via Babel inline).

## Fidelidade
**Alta fidelidade (hifi)**: cores, tipografia, espaçamentos e interações finais. Recriar pixel-perfect usando as bibliotecas do codebase.

## Telas / Views

### 1. Dashboard principal (Variação D · Documento Corporativo)
- **Nome**: Boletim Semanal — Mercado Imobiliário EUA
- **Propósito**: visão consolidada dos 18 indicadores; investidor seleciona indicador para drill-down detalhado
- **Layout geral**: coluna única, largura fixa 1280px, com seções verticais empilhadas:
  1. Header escuro (verde marca) — wordmark + título + destinatário
  2. Quadro resumido (4 KPIs em row)
  3. Spotlight grid 1.7fr / 1fr — chart grande à esquerda, timeline + composição à direita
  4. Ledger (tabela de indicadores filtráveis)
  5. Anexos lado a lado — Regiões censitárias / Top metros
  6. Footer escuro (verde marca) — emissor / fontes / cadência

### Componentes principais

**Header (banda escura)**
- Background: `#0d3d2e` (verde marca)
- Linha superior: gradient horizontal de `#c5673f` (laranja) → transparente, 3px
- Padding: `32px 48px 28px`
- Wordmark "DISSENHA / MOULDING" — Inter 700 uppercase, letter-spacing 0.08em, cor `#c5673f`, duas linhas empilhadas
- Título principal: Source Serif 4, 46px, peso 400, letter-spacing -0.025em, line-height 1.05; "dos Estados Unidos" em itálico cor `#c5673f`
- Coluna direita com texto descritivo (Source Serif italic 14px) + dois "stamps" (badges com borda)

**Stamps/Badges**
- Borda 0.75px, padding `3px 8px`, border-radius 1px
- Texto JetBrains Mono 9px, letter-spacing 0.18em, uppercase
- Variantes: laranja (`#c5673f`) ou cinza claro (alpha 0.5 sobre verde)

**Quadro resumido (KPIs)**
- Card branco-creme `#fdfbf4` com borda 0.5px `#b8b6b0`
- 4 colunas iguais, divisores verticais 0.5px
- Cada KPI: label em mono uppercase 9px + valor em Source Serif 36px peso 400 + delta em mono 11px (verde `#0d3d2e` se positivo, vermelho `#a8432b` se negativo)
- Footer da seção em background `#c8c6c0` com texto mono 10px

**Spotlight (indicador em foco)**
- Card grande com chart de área SVG (240px altura)
- Valor principal: Source Serif 60px peso 400, letter-spacing -0.03em
- Botões de período (1M/3M/6M/1A/5A): mono 10px, padding `4px 10px`, ativo com background verde marca
- 4 stats inline (Mín/Máx/Média 52sem/Fonte): label mono 9px + valor Source Serif 16px
- Bloco "Nota explicativa": background `#c8c6c0`, borda esquerda 3px laranja, texto Source Serif italic 14px

**Ledger (tabela de 18 indicadores)**
- Cabeçalho da tabela com background `#c8c6c0` (cinza mais escuro)
- Cada linha: dot colorido (cor do grupo, 6px) + código mono 9px + nome serif 14px + valor mono 13px + delta + sparkline 18px altura
- Hover: background `#fbf8f0` (branco-creme leve)
- Selecionado: background `#c8c6c0`

**Anexos (Regiões + Metros)**
- Dois cards lado a lado com headers "Anexo I" e "Anexo II"
- Lista com h-bars (regiões) ou ranking numerado 01-08 (metros)
- Indicadores "hot" marcados com dot laranja `#c5673f`

**Footer (banda escura)**
- Background `#0d3d2e`, padding `28px 48px 24px`
- Linha superior: gradient horizontal de transparente → laranja → transparente, 1px
- 3 colunas: Emissor (Source Serif) / Fontes (mono uppercase) / Cadência (mono uppercase)
- Texto auxiliar em alpha 0.7 sobre verde

## Interações e comportamento

- **Filtro por categoria**: 6 botões (Todos + 5 categorias) acima da tabela ledger. Clicar filtra os indicadores e atualiza o contador. Botão ativo tem background verde marca, texto creme.
- **Seleção de indicador**: clicar em qualquer linha da tabela ledger atualiza o card Spotlight (chart, valor, delta, stats, nota explicativa). Linha selecionada destaca em cinza claro.
- **Botões de período**: 1M/3M/6M/1A/5A acima do chart Spotlight (visualmente funcional; lógica de re-amostragem fica a cargo do dev).
- **Tweak de densidade**: variável `dense` afeta paddings, alturas de sparklines, larguras de coluna do ledger. Valor controlado externamente; expor como prop.

## Gerenciamento de estado

- `selected: Indicator` — indicador atualmente em foco (default: primeiro da lista)
- `activeGroup: 'all' | 'taxas' | 'precos' | 'oferta' | 'sentimento' | 'macro'`
- `period: '1M' | '3M' | '6M' | '1A' | '5A'` (default: '1A')
- `dense: boolean`

Dados: array de 18 `Indicator` objects (ver `data.jsx` para shape completo). Cada indicator tem: `id, group, name, short, value, unit, fmt(v), delta, deltaUnit, deltaPeriod, series[52], source, why, sentiment`.

## Design tokens

### Cores
```
--bg              #d8d6d1   /* cinza claro quente — background página */
--bg-panel        #e8e6e0   /* cards */
--bg-panel-alt    #cfcdc7   /* divisores e backgrounds secundários */
--bg-band         #0d3d2e   /* verde marca — headers/footers escuros */
--bg-band-soft    #164a3a

--ink             #1a2a22   /* texto principal */
--ink-soft        #4a5a52   /* texto secundário */
--ink-mute        #8a8a83   /* labels, metadados */
--ink-inverse     #e8e6e0   /* texto sobre verde escuro */

--rule            #b8b6b0   /* divisores principais */
--rule-soft       #c8c6c0   /* divisores sutis */

--accent          #c5673f   /* laranja queimado — marca */
--accent-soft     #e8c4a8
--accent-dark     #a04f2a

--pos             #0d3d2e   /* deltas positivos = verde marca */
--neg             #a8432b   /* deltas negativos */

/* Cores por grupo de indicador (ledger dots) */
--group-taxas        #c4664a
--group-precos       #7a9b6e
--group-oferta       #6b87a8
--group-sentimento   #a88a4f
--group-macro        #8a6a8a
```

### Tipografia
- **Serif** (títulos, valores grandes, descrições editoriais): `Source Serif 4`, fallback `Georgia`
- **Sans** (UI, wordmark, copy): `Inter`, fallback `-apple-system`
- **Mono** (labels, códigos, números técnicos): `JetBrains Mono`, fallback `monospace`

Escala:
- Hero title: serif 46px / 400 / -0.025em / 1.05
- Section title: serif 24-28px / 500 / -0.02em
- Card title: serif 18-22px / 500 / -0.01em
- Value (big): serif 60px / 400 / -0.03em
- Value (medium): serif 36px / 400 / -0.02em
- Value (table): mono 13px / 500
- Body editorial: serif 14px / italic / 1.55
- Body UI: sans 13px / 400 / 1.45
- Label: mono 9-10px / uppercase / 0.16-0.22em letter-spacing
- Wordmark: sans 700 / uppercase / 0.08em

### Espaçamento
- Outer page padding: `48px` horizontal
- Section gap vertical: `32px`
- Card padding interno: `24-32px`
- Header padding: `32px 48px 28px`
- Grid gap (KPIs/anexos): `24-28px`

### Bordas e divisores
- Card border: `0.5px solid var(--rule)`
- Divisor interno: `0.5px solid var(--rule)` ou `var(--rule-soft)`
- Border-radius: `1-2px` (estilo documento, sem cantos arredondados pronunciados)

### Sombras
- Apenas cards selecionados: `0 4px 16px rgba(14,23,38,0.08)` (opcional)

## Assets
- Nenhum asset de imagem — logo é puro CSS/text (wordmark "DISSENHA / MOULDING")
- Ícones SVG inline (selo decorativo, opcional)

## Charts (componentes)
Ver `charts.jsx` para implementações de referência:
- `<Sparkline>` — linha SVG simples com opção de fill
- `<AreaChart>` — área com grid, eixos Y, gradient, último ponto destacado
- `<HBarSimple>` — barra horizontal de progresso
- `<Donut>` — donut com segmentos coloridos
- `<Gauge>` — gauge divergente

Recomendação: substituir por uma lib do codebase (Recharts, Visx, ECharts) preservando aparência (linhas finas 1-1.5px, cor do grupo, gradient sutil 0→25% opacity).

## Arquivos neste handoff
- `Dashboard.html` — entry point standalone
- `variation-d.jsx` — implementação completa da Variação D (referência principal)
- `data.jsx` — schema dos indicadores + mock data realista (18 indicators, 4 regiões, 8 metros, 5 eventos)
- `charts.jsx` — primitivas de chart SVG
- `design-canvas.jsx` — componente de canvas para apresentar variações (não necessário em produção)
- `tweaks-panel.jsx` — painel de tweaks para densidade (não necessário em produção)

## Conexão com dados reais
Os mocks em `data.jsx` seguem a estrutura ideal de uma API. Para conectar:
1. Endpoint sugerido: `GET /api/indicators` retornando array `Indicator[]`
2. Atualização semanal (terça 14:00 UTC) — o site original já usa GitHub Actions
3. Fontes públicas: FRED API (gratuita, oficial), Freddie Mac PMMS, NAHB (web scrape), MBA (web scrape)
