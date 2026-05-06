# Migration Master Plan — Dashboard Mercado Imobiliário EUA v2

> **Para:** Claude Code, sessão na raiz do repositório do dashboard.
> **De:** plano elaborado em colaboração com André (CFO Grupo Dissenha) + Claude (chat).
> **Status:** plano-mestre **consolidado** após sessão de aprovação. Decisões finais incorporadas em §1.4, §2, §3 e §4.

---

## 0. Como ler e usar este documento

Este é o **plano-mestre** da migração do dashboard "Mercado Imobiliário EUA" da arquitetura atual (vanilla HTML/JS + Python CI) para uma arquitetura **React 18 + TypeScript strict + Vite** baseada na **Variação D do Handoff de design**.

**Antes de codificar qualquer linha**, leia, nesta ordem:
1. Este documento por completo
2. `docs/migration/current-state-audit.md` (auditoria do estado atual)
3. Bundle do Handoff em `docs/handoff/dissenha_dashboard/` — `README.md`, `variation-d.jsx`, `data.jsx`, `charts.jsx`

A migração é executada em **6 fases sequenciais**, distribuídas em **11 Pull Requests**, com **aprovação humana entre fases**. Não combine fases. Não pule etapas. Se identificar problema, **pare e reporte antes de prosseguir**.

### Tabela de Conteúdo
1. Contexto e invariantes
2. Stack confirmada
3. Schema de dados (deltas) — decisões finais
4. Plano de migração — 6 fases / 11 PRs
5. Working agreement
6. Referências

---

## 1. Contexto

### 1.1 O que existe hoje (resumo da auditoria)
- **Frontend**: `index.html` + `app.js` (vanilla JS, IIFE, ~666 linhas) + `style.css` (shadcn-inspired dark theme)
- **Camada de dados**: 3 scripts Python em `scripts/` rodam toda terça 14h UTC via GitHub Actions, produzindo `data/indicators.json` (~16 séries efetivas, 18 esperadas)
- **Deploy**: GitHub Pages, branch `main`, root `/`, custo zero
- **Charts**: Chart.js 4.5.0 via CDN
- **Bugs conhecidos**: PHSI ausente no JSON atual (será corrigido na próxima execução); plugin `annotation` não carregado; seeds MBA aproximadas; sem `requirements.txt` (resolvido na Fase 0)

### 1.2 O que vai mudar
- Frontend reescrito em **React 18 + TypeScript strict + Vite**
- Schema de `indicators.json` expandido para `schemaVersion: "2.0"` (ver §3)
- 5 indicadores **novos** (4 FRED + 1 computado), 3 datasets **novos** (regions, metros, events)
- 6 indicadores **realocados** dentro dos grupos novos (ver §3.3)
- Charts vanilla SVG (primitivas do Handoff portadas para TS) substituem Chart.js — sem biblioteca externa de charts
- Tipografia: Source Serif 4 + Inter + JetBrains Mono

### 1.3 Invariantes — o que **NÃO** muda
- ❌ A pipeline Python **NÃO** será reescrita em Node/TS. Mantém Python no CI.
- ❌ A periodicidade (terça 14h UTC) e o GitHub Actions **NÃO** mudam (apenas estendem-se com novas séries).
- ❌ A `FRED_API_KEY` em GitHub Secrets continua sendo o único segredo.
- ❌ O deploy permanece em GitHub Pages, gratuito, estático.
- ❌ A URL pública atual deve continuar funcionando após cutover.
- ❌ Não fazer `git push --force` em `main` em hipótese alguma.

### 1.4 Decisões consolidadas (sessão de aprovação)

Resumo das decisões aprovadas pelo André após análise da proposta de plano:

1. **MBA**: manter `MBA_PURCH` e `MBA_REFI` separados em `taxas`. **Não** adicionar `mba_apps` composite.
2. **Lumber (WPU081)**: realocado para `macro` (não `sentimento`, não grupo `custos` novo).
3. **Quadro Resumido (4 KPIs do topo)**: Mortgage 30Y · Case-Shiller · Months of Supply · NAHB HMI (segue Handoff original; lumber permanece no ledger).
4. **Preview deploy**: Vercel free tier conectado à branch `migration/v2-react`. Setup feito na Fase 2 via dashboard Vercel.
5. **Total de indicadores**: 23 (não 24).
6. **`fhfa` (USSTHPI)**: já existe no pipeline — apenas renomear/reagrupar, sem novo request FRED.
7. **`MEFAINUSA672N`**: validar antes da Fase 1; fallback para `MEHOINUSA672N` se descontinuada.
8. **`events.json`**: lido com `try/except`, fallback `[]`, log de warning — nunca derrubar pipeline.
9. **Ledger title**: dinâmico (`Os ${indicators.length} indicadores`) na Fase 4.

---

## 2. Stack confirmada

**Confirmada: React 18 + TypeScript strict + Vite.**

### Justificativa
| Critério | Resultado |
|---|---|
| Bundle final < 200 KB gzip | ✅ React+ReactDOM ≈ 46 KB; com app code ≈ 160-180 KB sem lib de charts |
| Build em < 30s no CI | ✅ Vite typical 10-15s |
| Deploy estático compatível com GH Pages | ✅ via `base` config |
| Type safety no schema dos 23 indicadores | ✅ central |
| HMR e DX | ✅ |

**Charts:** **não importar biblioteca externa.** Os 5 primitivos do `charts.jsx` (Sparkline, AreaChart, HBarSimple, Donut, Gauge) são SVG puro e serão portados como `.tsx` na Fase 3. Recharts/Visx adicionariam ~90 KB gzip e quebrariam o limite de bundle.

**Válvula de escape:** se a Fase 4 mostrar bundle estourando 200 KB, a saída é trocar React 18 por **Preact 10** (~4 KB gzip, API compatível). Não fazer agora — apenas registrado.

---

## 3. Schema de dados — deltas

### 3.1 Indicadores **novos** (a serem adicionados ao pipeline Python)

| ID novo | Nome | FRED Series ID | Implementação |
|---|---|---|---|
| `fed_funds` | Fed Funds Rate | `FEDFUNDS` | Adicionar em `fetch_fred.py` |
| `treasury10` | Treasury 10Y | `DGS10` | Adicionar em `fetch_fred.py` |
| `unemployment` | Taxa de Desemprego | `UNRATE` | Adicionar em `fetch_fred.py` |
| `cpi_shelter` | CPI Shelter (12m YoY) | `CUSR0000SAH1` | Buscar nível, **calcular YoY** em `compute_derived.py` |
| `affordability` | NAR Affordability Index | **Computado** (ver §3.4) | Novo `compute_derived.py` |

> `fhfa` (USSTHPI) **já existe** no pipeline — em Fase 1 apenas renomear/reagrupar em `merge_data.py`. Sem novo request FRED.

### 3.2 Datasets **novos**
- **`regions[]`**: 4 regiões censitárias (Northeast, Midwest, South, West) com `{ name, price, yoy, sales, hot }`
  - Fonte: NAR Regional Reports (mensal)
  - **Implementação inicial**: hardcoded a partir do mock do Handoff em `scripts/static_data/regions.py`. Substituir por scrape NAR em fase posterior (fora do escopo desta migração)
- **`metros[]`**: top 8 metros Sun Belt com `{ name, price, yoy, dom, hot }`
  - Fonte: NAR Metro Reports / Realtor.com
  - **Implementação inicial**: hardcoded em `scripts/static_data/metros.py`
- **`events[]`**: timeline de 5 eventos recentes com `{ date, tag, text }`
  - Fonte: editorial; alimentação manual via `data/events.json` editável direto no GitHub web UI
  - `merge_data.py` lê com `try/except`, fallback `[]`, log de warning — nunca derrubar pipeline (decisão 8 da §1.4)

### 3.3 Indicadores **realocados** — decisão final

Os 6 indicadores hoje no pipeline que **não aparecem** na Variação D do Handoff são **mantidos** e realocados conforme:

| ID atual | Grupo atual | → Grupo final | Justificativa |
|---|---|---|---|
| `MORTGAGE15US` | rates | `taxas` | Encaixe natural com Mortgage 30Y |
| `MBA_PURCH` | rates | `taxas` | Mantido como linha separada (não merged em mba_apps composite) |
| `MBA_REFI` | rates | `taxas` | Mantido como linha separada |
| `COMPUTSA` | supply | `oferta` | Completions completa o ciclo starts → completions → sales |
| `ACTLISCOUUS` | demand | `oferta` | Inventário ativo é leitura de oferta |
| `WPU081` (lumber) | sentiment | **`macro`** | Lumber é input cost. `macro` agrupa indicadores de contexto econômico (unemployment, cpi_shelter, affordability) — lumber se encaixa como cost driver |

**WPU081 NÃO terá grupo `custos` próprio** (decisão consolidada). Justificativa: 1 indicador num grupo desbalancearia o filtro do ledger e o donut de composição. Em `macro` o grupo passa a ter 4 membros, equilibrado com os demais.

### 3.4 Affordability Index — calcular em vez de scraping

A NAR Affordability Index **não tem feed público no FRED**. Em vez de scrape (frágil), **computar** a partir de primitivas:

```
Affordability Index = (Median Family Income / Qualifying Income) × 100

onde:
  Qualifying Income     = (Monthly Mortgage Payment × 12) / 0.25
  Monthly Payment       = PMT(rate=mortgage30/12, periods=360, principal=median_price × 0.8)
  Median Family Income  = FRED MEFAINUSA672N (renda familiar mediana, anual)
                          → fallback MEHOINUSA672N (household, se MEFAINUSA672N estiver descontinuada)
```

**Inputs já presentes**:
- `median_price` (FRED `MSPUS`)
- `mortgage30` (FRED `MORTGAGE30US`)

**Adicionar**: FRED `MEFAINUSA672N` em `fetch_fred.py` (com validação de série ativa antes da Fase 1; fallback para `MEHOINUSA672N` se descontinuada).

**Implementar**: `scripts/compute_derived.py` (novo módulo). Saída: campo `affordability` no `indicators.json`.

**Nota sobre frequência**: a renda familiar do FRED é **anual**. Carry-forward da última observação anual durante o ano corrente é aceitável (NAR faz o mesmo). Sparkline terá poucos pontos de variação ao longo de 52 semanas — comportamento aceitável.

### 3.5 Distribuição final por grupo

| Grupo | Indicadores | Total |
|---|---|---|
| `taxas` | mortgage30, mortgage15, fed_funds, treasury10, mba_purch, mba_refi | **6** |
| `precos` | cs_national, median_price, fhfa | **3** |
| `oferta` | housing_starts, building_permits, new_home_sales, existing_sales, months_supply, computsa, actliscouus | **7** |
| `sentimento` | nahb, rmi, pending | **3** |
| `macro` | unemployment, cpi_shelter, affordability, lumber | **4** |
| **TOTAL** | | **23** |

### 3.6 Schema final do `indicators.json`

```typescript
type FmtSpec =
  | { type: 'pct'; decimals?: number }
  | { type: 'usd' }
  | { type: 'num'; decimals?: number }
  | { type: 'k' };  // milhares com sufixo k

type Group = 'taxas' | 'precos' | 'oferta' | 'sentimento' | 'macro';

type Indicator = {
  id: string;
  group: Group;
  name: string;
  short: string;            // label curto uppercase para ledger/KPI
  value: number;
  unit: string;
  fmtSpec: FmtSpec;         // serializável (vs função em data.jsx)
  delta: number;
  deltaUnit: string;        // 'pp', '%', 'pts', 'm', etc.
  deltaPeriod: 'sem' | 'mês' | 'tri' | '12m' | '30d';
  series: number[];         // últimas N observações na frequência nativa
  source: string;
  why: string;              // 1-2 frases — por que importa
  sentiment: 'positive' | 'neutral' | 'negative';
  upIsBad?: boolean;        // para indicadores onde alta = ruim (ex.: mortgage rate, unemployment, lumber)
};

type Region = { name: string; price: number; yoy: number; sales: number; hot: boolean };
type Metro  = { name: string; price: number; yoy: number; dom: number; hot: boolean };
type Event  = { date: string; tag: string; text: string };

type IndicatorsFile = {
  generatedAt: string;      // ISO timestamp
  schemaVersion: '2.0';
  indicators: Indicator[];   // length === 23
  regions: Region[];
  metros: Metro[];
  events: Event[];
};
```

> **Diferença crítica vs `data.jsx` do Handoff**: o Handoff usa `fmt: (v) => string` (função). Funções não serializam em JSON. Substituir por `fmtSpec` declarativo e centralizar dispatching de formatação no frontend (`frontend/src/lib/format.ts`).

> **Sobre `series[]`**: o design espera ~52 pontos por indicador (sparklines). Indicadores com cadência menor (quarterly: USSTHPI, RMI, MSPUS, affordability) terão arrays menores. **Não fazer upsampling artificial**. O componente Sparkline lida com qualquer N >= 2.

---

## 4. Plano de migração — 6 fases / 11 PRs

> **Working agreement**: aprovação humana entre fases. Cada fase tem critério de aceitação verificável. PR title segue conventional commits.
>
> **Decomposição em 11 PRs aprovada:** Fase 0 (1) · Fase 1 (2) · Fase 2 (1) · Fase 3 (2) · Fase 4 (4) · Fase 5 (1).

### Fase 0 — Preparação e housekeeping (1 PR)

**Objetivo**: deixar o repositório em estado seguro para migração.

**Tarefas**:
1. Aplicar tag `v1-vanilla-final` em `main` (rollback rápido se necessário) ✅
2. Criar branch `migration/v2-react` a partir de `main` ✅
3. Apagar arquivo `.tmp` órfão (`docs/migration/current-state-audit.md.tmp.*`) ✅
4. Renomear `docs/migration/migration_master_plan.md` → `docs/migration/migration-plan.md` (kebab-case) ✅
5. Atualizar conteúdo do plano com decisões consolidadas (este documento) ✅
6. Criar `requirements.txt` com versões fixadas:
   ```
   requests==2.32.3
   beautifulsoup4==4.12.3
   lxml==5.3.0
   ```
7. Atualizar `.github/workflows/update-data.yml` para usar `pip install -r requirements.txt`
8. Disparar workflow via `workflow_dispatch` (ou aguardar próxima execução agendada) e confirmar que `data/indicators.json` continua válido

**NÃO fazer**: nenhuma mudança em scripts Python (lógica), nenhuma mudança no front, nenhuma mudança de schema.

**Critério de aceitação**:
- [x] Tag `v1-vanilla-final` aponta para o commit mais recente de `main`
- [x] Branch `migration/v2-react` existe a partir de main
- [x] `.tmp` órfão removido
- [x] Plano renomeado e atualizado com decisões consolidadas
- [ ] `requirements.txt` na raiz, versões fixadas
- [ ] Workflow atualizado, executa sem erro
- [ ] PR title: `chore(migration): housekeeping fase 0`

**STOP após Fase 0**: aguardar aprovação humana explícita antes de iniciar Fase 1.

---

### Fase 1 — Expansão da camada de dados (2 PRs)

**Objetivo**: pipeline Python produz o novo schema `indicators.json` com **23 indicadores**, além de `regions`, `metros`, `events`.

#### PR 1a — Novos FRED series + lógica derivada
**Tarefas**:
1. Validar `MEFAINUSA672N` ativa no FRED (fallback `MEHOINUSA672N` se necessário)
2. Adicionar séries em `fetch_fred.py`: `FEDFUNDS`, `DGS10`, `UNRATE`, `CUSR0000SAH1`, `MEFAINUSA672N`
3. Criar `scripts/compute_derived.py`:
   - `affordability` via fórmula §3.4
   - `cpi_shelter` YoY a partir do nível
4. Criar `scripts/indicators_meta.py`: catálogo central com `name`, `short`, `why`, `sentiment`, `upIsBad`, `group`, `fmtSpec` por indicador (todos os 23)

**PR title**: `feat(data): novos FRED series e lógica derivada`

#### PR 1b — Schema v2, static data, validação e legacy file
**Tarefas**:
1. Atualizar `merge_data.py`:
   - Renomear grupos (`rates` → `taxas`, `supply`+`demand` → `oferta`, `prices` → `precos`, `sentiment` → `sentimento`)
   - Realocar WPU081 para `macro`
   - Computar `delta`, `deltaUnit`, `deltaPeriod` em Python (mover lógica de `app.js`)
   - Agregar `regions`, `metros` (importar de `scripts/static_data/`)
   - Agregar `events` (ler `data/events.json` com try/except → fallback `[]` → warning)
   - Emitir `schemaVersion: "2.0"` e `generatedAt`
2. Criar `scripts/static_data/regions.py` e `metros.py` (hardcoded a partir do mock do Handoff)
3. Criar `data/events.json` com 5 eventos iniciais (do mock do Handoff, datas atualizadas)
4. Criar `data/schema.json` (JSON Schema) e validar `indicators.json` no CI antes do commit
5. **Compatibilidade temporária**: durante Fases 1-4, produzir **dois arquivos**:
   - `data/indicators.json` (novo schema v2.0)
   - `data/indicators.legacy.json` (formato antigo que `app.js` consome)
   - Frontend vanilla atual aponta para `indicators.legacy.json` (alteração mínima em `app.js`)

**Critério de aceitação Fase 1 (verificado no PR 1b)**:
- [ ] Workflow roda sem erro
- [ ] `indicators.json` valida contra `data/schema.json`
- [ ] `jq '.indicators | length' data/indicators.json` retorna `23`
- [ ] `jq '.regions | length'` retorna `4`, `.metros | length` retorna `8`, `.events | length >= 1`
- [ ] `WPU081` (lumber) está em `macro`
- [ ] Frontend vanilla atual continua funcionando lendo `indicators.legacy.json`

**PR title**: `feat(data): schema v2 + static data + legacy compat`

---

### Fase 2 — Bootstrap do frontend (1 PR)

**Objetivo**: ambiente React/Vite/TS instalado, build configurado para GitHub Pages, **deploy preview no Vercel**.

**Tarefas**:
1. Inicializar projeto Vite em `/frontend` (mantém Python e dados na raiz)
2. Configurar `vite.config.ts` com `base` apropriado para subpath de GH Pages (`/us-housing-dashboard/`)
3. TypeScript strict mode (`"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`)
4. Configurar fonts (Source Serif 4 com axes ital,opsz,wght + Inter + JetBrains Mono via Google Fonts no `index.html`)
5. Criar `frontend/src/styles/tokens.css` com **TODOS** os tokens da Variação D (ver `docs/handoff/dissenha_dashboard/README.md` §"Design tokens")
6. Componente "hello world" que faz `fetch('./data/indicators.json')` e exibe contagem de indicadores
7. **Vercel preview setup** (manual via dashboard Vercel):
   - Connect repo GitHub
   - Branch: `migration/v2-react`
   - Build command: `cd frontend && npm install && npm run build`
   - Output directory: `frontend/dist`
   - **Documentar URL de preview no PR**
8. **NÃO** mexer no GitHub Pages atual (que serve de `main`)

**Critério de aceitação**:
- [ ] `cd frontend && npm install && npm run build` passa local
- [ ] Vercel preview deploya com sucesso a cada push em `migration/v2-react`
- [ ] Hello world carrega `indicators.json` e exibe `23`
- [ ] Site original em produção continua **intacto**
- [ ] PR title: `feat(frontend): bootstrap react+vite+ts`

---

### Fase 3 — Domain layer + chart primitives (2 PRs)

**Objetivo**: lógica de domínio em TypeScript (sem UI ainda), com testes.

#### PR 3a — Tipos e helpers de domínio
**Tarefas**:
1. Tipos em `frontend/src/types/`: `Indicator`, `Region`, `Metro`, `Event`, `Group`, `Period`, `FmtSpec`
2. `frontend/src/lib/format.ts`: helpers (`fmtPct`, `fmtNum`, `fmtUSD`, `fmtK`) e dispatcher por `fmtSpec`. Locale `pt-BR`
3. `frontend/src/lib/groups.ts`: catálogo de grupos com `label`, `short`, `accent` (cores por grupo do README do Handoff)
4. `frontend/src/lib/sentiment.ts`: resolve cor de delta com awareness de `upIsBad` (ex.: queda em `mortgage30`/`unemployment`/`lumber` é positiva → verde)
5. Testes (Vitest):
   - Format helpers (todos os tipos de `fmtSpec`)
   - Sentiment resolver (matriz: delta positivo/negativo × upIsBad true/false)

**PR title**: `feat(frontend): tipos e helpers de domínio`

#### PR 3b — Chart primitives
**Tarefas**:
1. Portar primitivas SVG do Handoff (`docs/handoff/dissenha_dashboard/charts.jsx`) como TS em `frontend/src/components/charts/`:
   - `Sparkline.tsx`, `AreaChart.tsx`, `HBarSimple.tsx`, `Donut.tsx`, `Gauge.tsx`
   - Props tipadas, **zero dependências externas**
2. Snapshot tests (Vitest) de cada primitive

**Critério de aceitação Fase 3**:
- [ ] `npm test` passa, cobertura > 80% em `lib/`
- [ ] Zero `any` em `frontend/src/`
- [ ] PR titles: `feat(frontend): tipos e helpers de domínio` e `feat(frontend): chart primitives em ts`

---

### Fase 4 — Componentes da Variação D (4 PRs)

**Objetivo**: dashboard funcional com layout da Variação D, **dados reais**, todas as interações.

#### PR 4a — Shell + Header + Footer + KPI Quadro
**Tarefas**:
1. Layout shell: container 1280px, page padding (48px H, 32px gap V)
2. Header band escuro: wordmark Dissenha/Moulding + título Source Serif 4 46px + 2 stamps + descritivo italic
3. Footer band escuro: 3 colunas (Emissor / Fontes / Cadência)
4. KPI Quadro Resumido (4 cards): mortgage30 · cs_national · months_supply · nahb_hmi (decisão 3 da §1.4)
5. Skeleton loading durante fetch; mensagem clara em erro

**Critério de aceitação visual**: header, footer e KPIs renderizam corretamente vs `variation-d.jsx`. Site sem dados ainda na seção de spotlight/ledger/anexos.

**PR title**: `feat(frontend): shell + header + footer + kpi quadro`

#### PR 4b — Spotlight (chart + estado + período)
**Tarefas**:
1. Estado: `selected`, `period` via Context API
2. AreaChart 240px (de Fase 3) integrado
3. Valor 60px serif + delta + 4 stats (Mín/Máx/Média 52sem/Fonte)
4. Nota explicativa (background `--bg-panel-alt`, borda esquerda 3px laranja)
5. Botões de período 1M/3M/6M/1A/5A — slice da `series` baseado em fração do array
6. Aside: timeline `events` + donut de composição (sem ranking ainda)

**Critério de aceitação visual**: spotlight muda dinamicamente conforme `selected` (default: primeiro indicador). Period buttons re-fatiam a série.

**PR title**: `feat(frontend): spotlight + período + timeline`

#### PR 4c — Ledger filtrável
**Tarefas**:
1. Estado: `activeGroup` via Context
2. 6 botões de filtro (Todos + 5 grupos)
3. Linhas: dot+código mono+nome serif+valor mono+delta+sparkline 18px
4. Hover/selected
5. Click em linha → atualiza `selected` (do PR 4b) → spotlight reage
6. Title dinâmico: `Os ${indicators.length} indicadores` (decisão 9 da §1.4)

**Critério de aceitação visual**: ledger renderiza os 23, filtros funcionam, contador atualiza, click atualiza spotlight.

**PR title**: `feat(frontend): ledger filtrável + interação com spotlight`

#### PR 4d — Anexos + dense mode + polimento final
**Tarefas**:
1. Anexo I (Regiões): 4 linhas com nome+preço+yoy+h-bar+dot "hot"
2. Anexo II (Top Metros): ranking 01-08 com nome/preço/yoy/dom/hot dot
3. Tweak `dense`: variável que afeta paddings/alturas
4. Estados finais (loading, error)
5. Lighthouse audit (> 90 Performance)
6. Substituir hello world pelo dashboard completo

**Critério de aceitação Fase 4 (verificado no PR 4d)**:
- [ ] Todos os 23 indicadores aparecem no ledger
- [ ] Filtros por grupo funcionam, contador atualiza corretamente
- [ ] Click em linha do ledger atualiza Spotlight
- [ ] Botões de período mudam o range visualizado
- [ ] Anexos renderizam regions e metros
- [ ] Lighthouse Performance > 90
- [ ] Visual confere com `variation-d.jsx` (review humano comparando lado a lado)

**PR title**: `feat(frontend): anexos + dense mode + polimento`

---

### Fase 5 — Cutover e decomissionamento (1 PR)

**Objetivo**: novo dashboard substitui o antigo na URL de produção; código legacy arquivado.

**Tarefas**:
1. Configurar GitHub Pages para servir do build novo (Settings → Pages → Source) **OU** mergear `migration/v2-react` em `main` substituindo conteúdo
2. Mover arquivos vanilla para `legacy/`:
   - `legacy/index.html`, `legacy/app.js`, `legacy/style.css`, `legacy/assets/`
3. Atualizar `README.md` na raiz: descrição da nova arquitetura, como rodar local (`cd frontend && npm install && npm run dev`), como o pipeline funciona
4. Criar `CHANGELOG.md` documentando v1 → v2
5. Remover produção de `indicators.legacy.json` no `merge_data.py` (não é mais necessário)
6. Tag `v2.0.0` no merge final
7. `docs/migration/post-mortem.md`: lições aprendidas, surpresas, débitos técnicos

**Critério de aceitação**:
- [ ] URL de produção carrega novo dashboard
- [ ] Workflow semanal continua atualizando dados
- [ ] README na raiz cobre setup do zero
- [ ] Tag `v2.0.0` aplicada
- [ ] PR title: `chore(release): cutover v2.0.0`

---

## 5. Working agreement (regras para o Code)

1. **Leia primeiro**: este plano + `docs/migration/current-state-audit.md` + Handoff README + `data.jsx` (schema) + `variation-d.jsx` (referência visual)
2. **Proponha antes de executar**: se identificar algo que merece adjustment no plano, comente ANTES de codificar — não silenciosamente "improve"
3. **Uma fase por PR group**: nunca combine fases. Após PR mergeado, **aguarde aprovação verbal humana** antes de iniciar próxima fase. Dentro de uma fase com múltiplos PRs (1, 3, 4), aguarde aprovação entre PRs também.
4. **Commits atômicos**: cada commit faz uma coisa. Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
5. **Não toque na pipeline Python fora da Fase 1**. É a parte mais estável do sistema
6. **Verifique antes de afirmar "pronto"**: rode build local, valide schema, abra preview
7. **Reporte bloqueios cedo**: série FRED descontinuada, endpoint mudado, dependência incompatível → pare e reporte
8. **Preserve dados históricos**: nunca apague `indicators.json` ou faça `git push --force` em main
9. **Português** nas mensagens ao usuário (descrições de PR, comentários, docs); inglês nos commits e código

---

## 6. Referências

- Auditoria do estado atual: `docs/migration/current-state-audit.md`
- Handoff de design: `docs/handoff/dissenha_dashboard/`
  - `README.md` — design tokens completos, layout, componentes
  - `variation-d.jsx` — referência visual única (Variação D)
  - `data.jsx` — schema de indicadores e mocks de regions/metros/events
  - `charts.jsx` — primitivas SVG (já em React, portáveis para TS)
- API FRED: https://fred.stlouisfed.org/docs/api/fred/
- Conventional Commits: https://www.conventionalcommits.org

---

## Apêndice — log de decisões

| Item | Proposta inicial | Decisão final | Quem |
|---|---|---|---|
| Stack | React 18 + TS + Vite (default sugerido) | Confirmado | André |
| WPU081 grupo | `custos` (novo) | `macro` (4 membros) | André |
| MBA composite | `mba_apps` novo composite | Manter MBA_PURCH+MBA_REFI separados; sem mba_apps | André |
| Total de indicadores | 24 | **23** | André |
| KPIs do Quadro Resumido | mortgage30 · cs_national · nahb · affordability (Handoff) | mortgage30 · cs_national · months_supply · nahb_hmi | André |
| Preview deploy | gh-pages-preview branch | **Vercel free tier** | André |
| Decomposição em PRs | 6 PRs (1 por fase) | **11 PRs** (Fase 0:1 / 1:2 / 2:1 / 3:2 / 4:4 / 5:1) | André |
| `MEFAINUSA672N` | Adicionar direto | Validar antes; fallback `MEHOINUSA672N` | Code |
| `events.json` parsing | Não especificado | try/except + fallback `[]` + warning, nunca derrubar pipeline | Code |
| Ledger title | "Os 18 indicadores" (Handoff) | Dinâmico `Os ${indicators.length} indicadores` | Code |
| `fhfa` | "Adicionar" (§3.1 original) | Apenas renomear/reagrupar (já existe como USSTHPI) | Code |
