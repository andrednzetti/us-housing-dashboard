# Auditoria do Estado Atual — Dashboard Mercado Imobiliário EUA

**Data da auditoria:** 2026-05-06  
**Projeto:** `Indicadores_EUA`  
**Repositório:** GitHub Pages (branch `main`, root `/`)  
**Auditor:** Claude (Anthropic) — solicitado por André Dissenha Negendank  

---

## Índice

1. [Stack & Dependências](#1-stack--dependências)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Integrações de Dados](#3-integrações-de-dados)
4. [Automação GitHub Actions](#4-automação-github-actions)
5. [Tabela de Indicadores](#5-tabela-de-indicadores)
6. [Configuração de Deploy](#6-configuração-de-deploy)
7. [Abordagem de Estilização](#7-abordagem-de-estilização)
8. [Status de Saúde](#8-status-de-saúde)
9. [Riscos para Migração](#9-riscos-para-migração)

---

## 1. Stack & Dependências

### Frontend (runtime — carregado pelo browser)

| Dependência | Versão | Fonte | Uso |
|---|---|---|---|
| Chart.js | 4.5.0 | cdnjs CDN | Todos os gráficos (line + bar) |
| Inter | Google Fonts | CDN | Fonte principal de UI |
| JetBrains Mono | Google Fonts | CDN | Números, badges, tabela, eixos |

**Sem bundler.** Sem npm, sem TypeScript, sem React/Vue/Svelte. Tudo servido como arquivos estáticos.

### Backend (CI — executa apenas no GitHub Actions)

| Dependência | Versão | Uso |
|---|---|---|
| Python | 3.11 | Versão fixada no workflow |
| requests | última compatível | Chamadas à FRED API e scraping |
| beautifulsoup4 | última compatível | Parse de HTML (RMI, MBA) |
| lxml | última compatível | Parser HTML para BeautifulSoup |

**Sem `requirements.txt`.** Dependências instaladas via `pip install` direto no step do workflow — não há versões fixadas, o que pode causar quebras silenciosas por atualização de pacote.

### Variáveis de ambiente / segredos

| Nome | Onde configurar | Obrigatório |
|---|---|---|
| `FRED_API_KEY` | GitHub → Settings → Secrets → Actions | ✅ Sim |

---

## 2. Estrutura de Arquivos

```
Indicadores_EUA/
├── index.html                  # Página única (HTML semântico, sem template engine)
├── app.js                      # Toda a lógica frontend (IIFE, 666 linhas)
├── style.css                   # Design system shadcn-inspired (569 linhas)
├── .gitignore                  # Ignora __pycache__, .env, venv, data/fred_raw.json,
│                               #   data/scraped_raw.json, *.tmp.*
│
├── assets/
│   └── logo-dissenha.svg       # Logo horizontal Dissenha Moulding (viewBox 440×100)
│
├── data/
│   ├── indicators.json         # ⚠️  Arquivo gerado pela CI — commitado no repo
│   │                           #     116 KB, 16 séries, última atualização: 2026-03-31
│   ├── fred_raw.json           # Intermediário — no .gitignore (não commitado)
│   └── scraped_raw.json        # Intermediário — no .gitignore (não commitado)
│
├── scripts/
│   ├── fetch_fred.py           # Busca 15 séries do FRED API (295 linhas)
│   ├── fetch_scraped.py        # Scraping RMI + MBA (324 linhas)
│   └── merge_data.py           # Merge + metadados → indicators.json (115 linhas)
│
├── .github/
│   └── workflows/
│       └── update-data.yml     # Cron toda terça 14h UTC + workflow_dispatch
│
└── docs/
    └── migration/
        └── current-state-audit.md   # Este arquivo
```

**Observações sobre a estrutura:**

- `data/indicators.json` é um arquivo gerado que vive no repositório — arquitetura intencional para permitir GitHub Pages sem backend.
- `data/fred_raw.json` e `data/scraped_raw.json` são arquivos intermediários usados apenas durante a execução da CI; estão no `.gitignore` e não são expostos publicamente.
- Não há `package.json`, `tsconfig.json`, nem qualquer arquivo de configuração de bundler.
- Não há testes automatizados — toda a validação é implícita (CI falha se o script Python lança exceção).

---

## 3. Integrações de Dados

### 3.1 FRED API (`fetch_fred.py`)

- **Endpoint:** `https://api.stlouisfed.org/fred/series/observations`
- **Autenticação:** `FRED_API_KEY` via parâmetro de query
- **Observações desde:** `2020-01-01` (hardcoded como `OBSERVATION_START`)
- **Total de séries:** 15
- **Limite da API:** 500 requisições/dia (gratuito)
- **Retry logic:** 3 tentativas com backoff 2s → 4s → 8s por série
- **Delay entre chamadas:** 0.3s
- **Comportamento em falha:** Partial failure tolerado — `sys.exit(1)` apenas se **todas** as séries falharem
- **IDs FRED utilizados:**

| Chave | FRED Series ID | Grupo |
|---|---|---|
| MORTGAGE30US | MORTGAGE30US | rates |
| MORTGAGE15US | MORTGAGE15US | rates |
| HOUST | HOUST | supply |
| PERMIT | PERMIT | supply |
| COMPUTSA | COMPUTSA | supply |
| MSACSR | MSACSR | supply |
| HSN1F | HSN1F | demand |
| EXHOSLUSM495S | EXHOSLUSM495S | demand |
| PHSI | PHSI | demand |
| ACTLISCOUUS | ACTLISCOUUS | demand |
| CSUSHPISA | CSUSHPISA | prices |
| USSTHPI | USSTHPI | prices |
| MSPUS | MSPUS | prices |
| USHMI | USHMI | sentiment |
| WPU081 | WPU081 | sentiment |

> ⚠️ **Histórico de correção:** Os IDs `PENNSA` e `NAHBMMI` foram tentados inicialmente e retornavam HTTP 400. IDs corretos identificados e corrigidos: `PHSI` (Pending Home Sales) e `USHMI` (NAHB HMI).

### 3.2 Web Scraping (`fetch_scraped.py`)

| Indicador | Fonte de scraping | Fallback (seed data) |
|---|---|---|
| **RMI** | `eyeonhousing.org/tag/remodeling-market-index/` | `RMI_SEED` dict — 24 valores trimestrais (Q1 2020 → Q4 2025) |
| **MBA_PURCH** | `mortgagenewsdaily.com/data/mortgage-applications` | `MBA_PURCHASE_SEED` — 26 pontos semanais aproximados |
| **MBA_REFI** | `mortgagenewsdaily.com/data/mortgage-applications` | `MBA_REFI_SEED` — 26 pontos semanais aproximados |

**Estratégia de fallback:** Seed data é sempre carregado; scraping tenta adicionar/atualizar o ponto mais recente. Se o scraping falhar, o seed data garante que `fetch_scraped.py` sempre conclui com sucesso (sem `sys.exit(1)`).

**Fragilidades conhecidas:**
- Regex de parsing do RMI depende do formato de título dos artigos do Eye On Housing — pode quebrar com redesign do blog.
- MBA scraping usa regex simples em texto plano do HTML — mortgagenewsdaily.com é JavaScript-heavy; em muitas execuções o scraping falha silenciosamente e o seed data é usado.
- Seeds de MBA têm granularidade trimestral/bimestral (não semanal real).

### 3.3 Merge (`merge_data.py`)

- Lê `fred_raw.json` + `scraped_raw.json` (tolerante a arquivo ausente — retorna `{}`)
- Mescla os dois dicts (`scraped` sobrescreve `fred` em colisão de chave, mas não há overlap)
- Adiciona metadados: `last_updated` (UTC ISO-8601), `total_series`, `groups`
- Impõe limite de 2 MB no output; trunca observações antes de `2020-01-01` se exceder
- Escreve `data/indicators.json`
- `os.makedirs(exist_ok=True)` garante que o diretório `data/` é criado na CI (runner não tem a pasta pré-existente)

---

## 4. Automação GitHub Actions

**Arquivo:** `.github/workflows/update-data.yml`

### Configuração do workflow

```yaml
on:
  schedule:
    - cron: '0 14 * * 2'   # toda terça-feira às 14h00 UTC (11h00 BRT)
  workflow_dispatch:         # execução manual via interface do GitHub

permissions:
  contents: write            # necessário para git push

runs-on: ubuntu-latest
timeout-minutes: 15
python-version: '3.11'
```

### Pipeline de execução

```
checkout → setup-python 3.11 → pip install → fetch_fred.py → fetch_scraped.py → merge_data.py → git add + commit + push
```

### Lógica de commit

```bash
git add data/indicators.json
git diff --cached --quiet && echo "No data changes detected, skipping commit." \
  || (git commit -m "chore: update indicators $(date -u +%Y-%m-%d) [skip ci]" && git push)
```

- `[skip ci]` no commit message previne loop de triggers.
- `git diff --cached --quiet` detecta tanto arquivos modificados quanto novos (arquivos untracked são staged antes do diff).
- Falhas nas etapas de fetch são toleradas parcialmente (partial data commit é aceito); só `sys.exit(1)` em falha total do FRED ou tamanho acima do limite pós-truncagem.

### Histórico de bugs corrigidos no workflow

| Bug | Causa | Correção |
|---|---|---|
| `FileNotFoundError: data/fred_raw.json` | Diretório `data/` não existe no runner | `os.makedirs(exist_ok=True)` adicionado nos 3 scripts |
| `PENNSA` / `NAHBMMI` 400 Bad Request | IDs FRED incorretos | Corrigidos para `PHSI` e `USHMI` |
| Código antigo rodando na CI | Editor criava `.tmp.*` que foram commitados | Deletados; `*.tmp.*` adicionado ao `.gitignore` |
| `indicators.json` não commitado (arquivo novo) | `git diff --quiet` sem staging prévio não detecta arquivo untracked | Reescrito para `git add` primeiro, depois `git diff --cached` |
| Warning Node.js 20 deprecation | `actions/checkout@v4` usa Node 20 interno | Apenas aviso; não afeta funcionalidade |

---

## 5. Tabela de Indicadores

**Total de indicadores:** 18 (15 FRED + 3 scraped)

| # | Chave | Nome | Grupo | Frequência | Fonte | Unidade |
|---|---|---|---|---|---|---|
| 1 | MORTGAGE30US | 30-Year Fixed Mortgage Rate | rates | Weekly | Freddie Mac / FRED | % |
| 2 | MORTGAGE15US | 15-Year Fixed Mortgage Rate | rates | Weekly | Freddie Mac / FRED | % |
| 3 | MBA_PURCH | MBA Purchase Applications Index | rates | Weekly | MBA (seed + scraping) | Index |
| 4 | MBA_REFI | MBA Refinance Applications Index | rates | Weekly | MBA (seed + scraping) | Index |
| 5 | HOUST | Housing Starts (Total) | supply | Monthly | Census Bureau / FRED | Thousands SAAR |
| 6 | PERMIT | Building Permits (Total) | supply | Monthly | Census Bureau / FRED | Thousands SAAR |
| 7 | COMPUTSA | Housing Completions | supply | Monthly | Census Bureau / FRED | Thousands SAAR |
| 8 | MSACSR | Months' Supply of New Houses | supply | Monthly | Census Bureau / FRED | Months |
| 9 | HSN1F | New Home Sales | demand | Monthly | Census Bureau / FRED | Thousands SAAR |
| 10 | EXHOSLUSM495S | Existing Home Sales | demand | Monthly | NAR / FRED | Millions SAAR |
| 11 | PHSI | Pending Home Sales Index | demand | Monthly | NAR / FRED | Index (2001=100) |
| 12 | ACTLISCOUUS | Active Listing Count | demand | Monthly | Realtor.com / FRED | Count |
| 13 | CSUSHPISA | Case-Shiller National HPI | prices | Monthly | S&P / FRED | Index (Jan 2000=100) |
| 14 | USSTHPI | FHFA House Price Index | prices | Quarterly | FHFA / FRED | Index (1980 Q1=100) |
| 15 | MSPUS | Median Sales Price of Houses Sold | prices | Quarterly | Census Bureau / FRED | USD |
| 16 | USHMI | NAHB Housing Market Index (HMI) | sentiment | Monthly | NAHB / FRED | Index |
| 17 | WPU081 | Lumber PPI | sentiment | Monthly | BLS / FRED | Index (Dec 1981=100) |
| 18 | RMI | NAHB Remodeling Market Index | sentiment | Quarterly | NAHB (seed + scraping) | Index (>50 = positive) |

**Indicadores onde alta é negativa** (`UP_IS_BAD`):  
`MORTGAGE30US`, `MORTGAGE15US`, `MSACSR`, `WPU081`

**Linhas de referência** (`REF_LINES`):  
- USHMI e RMI: linha em 50 (neutro)  
- MORTGAGE30US: linha em 7%  
- MORTGAGE15US: linha em 6%

**Dados no `indicators.json` atual (2026-03-31):**  
16 de 18 séries presentes (PHSI estava ausente na última execução — ID acabava de ser corrigido e o workflow ainda não havia rodado com o novo ID commitado).

---

## 6. Configuração de Deploy

### GitHub Pages

| Parâmetro | Valor |
|---|---|
| Plataforma | GitHub Pages |
| Branch | `main` |
| Pasta servida | `/` (root) |
| URL pública | `https://<username>.github.io/<repo>/` |
| Atualização de dados | Automática (cron Actions) |
| Custo de hospedagem | **$0** |
| Custo de dados | **$0** (FRED API free tier) |

### Entrega de dados ao browser

```
GitHub Pages serve → data/indicators.json (arquivo estático)
     ↑
     └─ GitHub Actions commita indicators.json toda terça
```

O frontend faz `fetch("data/indicators.json")` — URL relativa, sem CORS, sem runtime server. Funciona localmente via `file://` com ressalva (browsers bloqueiam fetch local; requer `python -m http.server` ou Live Server).

### Limitações da arquitetura estática

- Dados atualizados somente 1×/semana (terça, 14h UTC)
- Sem filtros dinâmicos por data no servidor (toda filtragem é client-side)
- Sem WebSocket / push de dados em tempo real
- Se o workflow falha, os dados ficam desatualizados silenciosamente (não há alertas ao usuário)

---

## 7. Abordagem de Estilização

### Design system: shadcn-inspired (vanilla CSS)

**Arquivo:** `style.css` (569 linhas)  
**Fonts:** Inter (UI) + JetBrains Mono (dados numéricos) — carregadas via Google Fonts CDN

### Tokens CSS (`:root`)

Sistema de tokens HSL idêntico ao shadcn/ui dark theme:

```css
--background:       hsl(240 10% 3.9%)    /* #09090b — quase preto */
--foreground:       hsl(0 0% 98%)        /* #fafafa — quase branco */
--card:             hsl(240 10% 3.9%)    /* igual background */
--muted:            hsl(240 3.7% 15.9%) /* #27272a — cinza escuro */
--muted-foreground: hsl(240 5% 64.9%)   /* #a1a1aa — cinza médio */
--border:           hsl(240 3.7% 15.9%) /* #27272a */
--amber:            hsl(38 92% 50%)      /* #e69b1a — cor de destaque */
--emerald:          hsl(160 84% 39%)     /* #10b981 — positivo */
--red:              hsl(0 72% 51%)       /* #ef4444 — negativo */
--sky:              hsl(199 89% 48%)     /* #0ea5e9 — supply */
--violet:           hsl(263 70% 50%)     /* #8b5cf6 — sentiment */
```

### Componentes CSS implementados

| Componente | Padrão shadcn equivalente | Notas |
|---|---|---|
| `.tabs` + `.tab-btn` | `<Tabs>` | Pill container + active state com `box-shadow` |
| `.period-btns` + `.period-btn` | `<ToggleGroup>` | Mesmo padrão visual das tabs |
| `.export-btn` | `<Button variant="default">` | Background `--primary` (branco) |
| `.kpi-card` | `<Card>` | Hover com `--secondary` bg |
| `.chart-wrapper` | `<Card>` | `height: 420px; position: relative` — crítico para Chart.js |
| `.stat-box` | `<Card>` pequeno | Grid 4 colunas |
| `.context-block` | `<Alert>` | Border-left amber |
| `.error-banner` | `<Alert variant="destructive">` | `display: none` por padrão |
| `.skeleton` | `<Skeleton>` | Shimmer animation |
| `.freq-badge` | `<Badge>` | Pill, JetBrains Mono, cor sky |
| `.positive` / `.negative` | inline badge | Emerald/red com soft bg |
| `.data-table` | `<Table>` | Sticky header + frozen first column |

### Paleta de cores dos gráficos (hex — Chart.js)

```js
rates:     "#e69b1a"  /* amber */
supply:    "#0ea5e9"  /* sky */
demand:    "#10b981"  /* emerald */
prices:    "#ef4444"  /* red */
sentiment: "#8b5cf6"  /* violet */
```

> **Por que hex em vez de HSL?** Chart.js 4.x não converte strings HSL para `createLinearGradient()` — causava canvas transparente. A função `colorWithAlpha()` resolve ao anexar o canal alpha como 2 dígitos hex (`#rrggbbaa`).

### Responsividade

| Breakpoint | Ajustes |
|---|---|
| `≤ 768px` | Grid KPI `minmax(180px)`, chart height 320px, padding reduzido |
| `≤ 480px` | Grid 2 colunas forçado, h1 1.5rem, changes em coluna |

---

## 8. Status de Saúde

### ✅ Funcionando

- [x] Site carrega e renderiza em produção (GitHub Pages)
- [x] 16/18 indicadores com dados reais (dados de 2020 em diante)
- [x] Gráficos renderizam corretamente (line + bar)
- [x] Tabs por grupo e period buttons (1A / 2A / 3A / Max)
- [x] Cards KPI com variação m/m e a/a, sinalização positivo/negativo
- [x] Stats row (mínimo, máximo, atual, média) por série
- [x] Tabela de dados com últimos 24 meses + exportação CSV
- [x] Scroll para gráfico ao clicar no card KPI
- [x] Logo Dissenha Moulding no cabeçalho
- [x] Erro de carregamento não vaza para render errors (try/catch separados)
- [x] Workflow GitHub Actions executa sem erros

### ⚠️ Atenção / Melhorias pendentes

- [ ] **PHSI ausente no JSON atual** — na última execução o ID já havia sido corrigido, mas o workflow não tinha rodado ainda. Será corrigido automaticamente na próxima terça.
- [ ] **Seeds de MBA são aproximações** — valores históricos não são dados oficiais MBA; granularidade trimestral mascarada como semanal.
- [ ] **Sem versionamento de requirements.txt** — `pip install requests beautifulsoup4 lxml` sem versão fixa pode quebrar com releases futuros.
- [ ] **Sem notificação de falha de CI** — se o workflow falhar silenciosamente, os dados ficam desatualizados sem alerta visível ao usuário.
- [ ] **Node.js 20 deprecation warning** — `actions/checkout@v4` emite warning sobre Node 20; será endereçado automaticamente quando o GitHub atualizar o runner padrão (não afeta funcionalidade).
- [ ] **Sem annotation plugin Chart.js** — `REF_LINES` está configurado no código mas o plugin `chartjs-plugin-annotation` não está carregado; o guard `window.Chart.registry.plugins.get("annotation")` previne erro mas as linhas de referência nunca aparecem.
- [ ] **Logo SVG é uma recriação** — não é idêntica à logo original; criada geometricamente a partir de imagem de referência.
- [ ] **Textos sem acentuação** em vários contextos do frontend (ex.: "Precos", "Sentimento e Custos", strings de tooltip) — não afeta funcionalidade, mas está fora do padrão pt-BR correto.

### 🔴 Riscos ativos

- **Scraping RMI/MBA é frágil** — quebra silenciosa é esperada; o seed data mascara o problema.
- **`indicators.json` commitado como arquivo gerado** — `git history` acumula diffs semanais; o arquivo crescerá no histórico do Git ao longo do tempo.

---

## 9. Riscos para Migração

Esta seção documenta os riscos e pontos de atenção caso o projeto seja migrado para uma stack diferente (ex.: Next.js + TypeScript + shadcn/ui conforme stack padrão do Grupo Dissenha).

### 9.1 Dados e API

| Risco | Impacto | Mitigação sugerida |
|---|---|---|
| FRED API muda endpoint ou formato | Alto — quebra todo o pipeline | Adicionar teste de schema no `merge_data.py` (assert campos obrigatórios) |
| `FRED_API_KEY` expirar ou ser revogada | Alto — todo fetch falha | Monitorar uso no dashboard do FRED; não existe auto-renovação |
| Scraping RMI/MBA quebra por redesign | Baixo (seed data é fallback) | Substituir por fonte paga (Bloomberg, Refinitiv) se precisão for crítica |
| `indicators.json` > 2 MB | Médio — trunca observações | Revisar lógica de truncagem; considerar streaming ou paginação se histórico crescer |

### 9.2 Frontend / Chart.js

| Risco | Impacto | Mitigação sugerida |
|---|---|---|
| Chart.js 4.5.0 via CDN indisponível (cdnjs) | Alto — nenhum gráfico renderiza | Migrar para bundler (npm) com versão fixada |
| Google Fonts CDN bloqueado | Baixo (fallback system fonts) | Adicionar `font-display: swap` + self-host as fontes |
| `colorWithAlpha()` com hex strings > 6 chars | Médio — gradiente quebra para cores fora do padrão | Trocar por `rgba()` canônico via helper mais robusto |
| `annotation` plugin ausente | Baixo | Adicionar `chartjs-plugin-annotation` via CDN |

### 9.3 GitHub Actions / CI

| Risco | Impacto | Mitigação sugerida |
|---|---|---|
| `pip install` sem versão fixa quebra por update | Médio | Adicionar `requirements.txt` com hashes |
| Workflow falha silenciosamente | Médio (dados desatualizados) | Adicionar step de notificação (Slack, e-mail via SendGrid) em `on: failure` |
| Rate limit FRED (500 req/dia) | Baixo (15 séries × 1×/semana ≪ 500) | Sem ação necessária agora |
| Runner Ubuntu muda timezone / ferramentas | Baixo | Workflow explicitamente usa Python 3.11; suficientemente estável |

### 9.4 Portabilidade para Next.js (stack padrão Grupo Dissenha)

Se a migração para Next.js for realizada, os pontos críticos a preservar são:

1. **Arquitetura de dados:** Manter a lógica Python de fetch/merge como scripts de CI — não recriar em Node.js/TS sem motivo. Alternativa: mover para `route.ts` com `revalidate` (ISR).
2. **Paleta e tokens:** Os tokens CSS de `style.css` mapeiam 1:1 para `tailwind.config.ts` com `shadcn/ui` — migração visual é direta.
3. **Lógica de negócio do frontend:** `SERIES_ORDER`, `UP_IS_BAD`, `REF_LINES`, `CONTEXT` e `fmtValue()` em `app.js` devem ser extraídos como módulos TypeScript.
4. **Chart.js → Recharts:** Alternativa mais natural para Next.js/React; requer reescrita dos `buildChart()` como componentes React, mas preserva a lógica de dados.
5. **`colorWithAlpha()` não será necessária** em Recharts (usa `rgba()` nativamente).
6. **Dados estáticos vs. ISR:** `data/indicators.json` pode ser lido server-side via `fs.readFileSync` (SSG) ou via `fetch` com `revalidate: 3600` (ISR). A pipeline de CI continua igual.

### 9.5 Dependências externas sem SLA

| Serviço | Dependência | Risco de downtime |
|---|---|---|
| FRED API (stlouisfed.org) | Dados econômicos principais | Baixo (instituição governamental EUA) |
| cdnjs (Cloudflare) | Chart.js | Baixo (CDN global) |
| Google Fonts CDN | Inter + JetBrains Mono | Baixo (degradação graciosa com system fonts) |
| eyeonhousing.org | RMI scraping | Médio (blog; pode mudar estrutura) |
| mortgagenewsdaily.com | MBA scraping | Alto (JS-heavy; frequentemente falha) |
| GitHub Pages | Hospedagem | Baixo (SLA 99.9%) |
| GitHub Actions | CI/CD | Baixo (SLA 99.9%) |

---

*Fim do relatório de auditoria.*  
*Gerado por Claude (Anthropic) em 2026-05-06 para André Dissenha Negendank — Grupo Dissenha.*
