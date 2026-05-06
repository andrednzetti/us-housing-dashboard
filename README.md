# US Housing Dashboard

Boletim semanal automatizado do mercado imobiliário americano —
**23 indicadores oficiais** (FRED, NAHB, MBA, Realtor.com, Census)
com layout editorial e atualização semanal.

> **URL pública**: https://andrednzetti.github.io/us-housing-dashboard/
> **Cadência**: terça-feira 14:00 UTC (semanal automática)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript strict + Vite 6 |
| Charts | SVG primitivo (sem biblioteca externa) |
| Tipografia | Source Serif 4 + Inter + JetBrains Mono |
| Backend (data) | Python 3.11 (FRED API + scrapers) |
| CI/CD | GitHub Actions (semanal) |
| Hosting | GitHub Pages (produção) + Vercel (preview de PRs) |

## Estrutura do repositório

```
data/                         payload semanal (gerado pelo CI)
  ├── indicators.json         schema v2 — consumido pelo frontend React
  ├── indicators.legacy.json  schema v1 — consumido por legacy/ (será removido na PR 5b)
  ├── events.json             timeline editorial (manual via GitHub UI)
  └── schema.json             JSON Schema v2 (validador no CI)

frontend/                     React app (produção)
  ├── src/
  │   ├── components/         charts · shell · quadro · spotlight · ledger · anexos
  │   ├── lib/                domain layer: format · sentiment · selectors · series · dates
  │   ├── types/              Indicator, Region, Metro, Event, IndicatorsFile, ...
  │   ├── hooks/              useIndicatorsFile
  │   └── styles/             tokens.css + globals.css
  └── package.json            React 18, TS 5.7, Vite 6 — versões pinadas

scripts/                      pipeline Python
  ├── fetch_fred.py           FRED API → fred_raw.json
  ├── fetch_scraped.py        NAHB / MBA / Eye-on-Housing → scraped_raw.json
  ├── compute_derived.py      affordability index, CPI shelter YoY
  ├── indicators_meta.py      catálogo declarativo dos 23 indicadores
  ├── merge_data.py           junção + validação de schema → indicators.json
  └── static_data/            regions, metros (hardcoded)

legacy/                       v1 vanilla preservada (não mais servida em produção)
  ├── index.html
  ├── app.js                  consumia indicators.legacy.json
  ├── style.css
  └── assets/

docs/                         documentação do projeto
  ├── migration/              plano-mestre, post-mortem, auditorias
  └── handoff/                design system Variação D
```

## Setup local

Pré-requisitos: **Node 20+**, **npm 10+**, **Python 3.11**.

```bash
git clone https://github.com/andrednzetti/us-housing-dashboard.git
cd us-housing-dashboard

# 1. FRED API key (free, ~2 min) — https://fred.stlouisfed.org/docs/api/api_key.html
echo 'FRED_API_KEY=...' > .env

# 2. Python deps + primeira execução do pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/fetch_fred.py
python scripts/fetch_scraped.py
python scripts/merge_data.py     # gera data/indicators.json

# 3. Frontend
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

Se preferir não rodar a pipeline localmente, deixe `data/indicators.json` como
está versionado — o frontend funciona normalmente lendo o JSON commitado.

## Deploy

- **Produção**: GitHub Pages serve a build do `frontend/dist/` (configuração final
  na PR 5c; até lá, GH Pages serve a versão legacy raiz).
- **Preview**: cada PR ganha uma URL Vercel automática a partir do branch.
- **Atualização de dados**: GitHub Actions roda toda terça-feira 14:00 UTC,
  comita o JSON novo direto em `main` com `[skip ci]`.

## Adicionar um indicador

1. Encontre a série em https://fred.stlouisfed.org/ (ou identifique scraping target).
2. Adicione entrada em `scripts/fetch_fred.py` (ou `fetch_scraped.py`).
3. Adicione metadata em `scripts/indicators_meta.py` (`raw_key`, group, name, fmt_spec, why, sentiment, etc.).
4. Atualize o tipo em `frontend/src/types/group.ts` se for grupo novo.
5. Atualize `data/schema.json` se necessário (`minItems` / `maxItems`).
6. Rode o workflow manualmente para gerar o JSON atualizado.

## Fontes

- [FRED — Federal Reserve Bank of St. Louis](https://fred.stlouisfed.org/)
- [Freddie Mac Primary Mortgage Market Survey](https://www.freddiemac.com/pmms)
- [U.S. Census Bureau — New Residential Construction](https://www.census.gov/construction/nrc/)
- [National Association of Realtors](https://www.nar.realtor/research-and-statistics)
- [NAHB Housing Market Index / Remodeling Market Index](https://www.nahb.org/news-and-economics/housing-economics/)
- [MBA Weekly Applications Survey](https://www.mba.org/news-and-research/research-and-economics)
- [S&P CoreLogic Case-Shiller HPI](https://www.spglobal.com/spdji/en/index-family/indicators/sp-corelogic-case-shiller/)
- [FHFA House Price Index](https://www.fhfa.gov/data/hpi)
- [Realtor.com Active Listing Count](https://www.realtor.com/research/data/)

## Histórico

- **v2.x** — Atual. React + TypeScript + Vite. Layout Variação D (handoff editorial).
  Pipeline Python expandida (5 indicadores novos + 2 derivados). Histórico
  estendido (5 anos para weekly).
- **v1.x** — Vanilla HTML/JS + Chart.js, 18 indicadores. Preservada em `legacy/`.
  Tag `v1-vanilla-final` aponta para o último commit dessa série.

Detalhe completo em [`CHANGELOG.md`](CHANGELOG.md) e [`docs/migration/post-mortem.md`](docs/migration/post-mortem.md).

## Documentação

- [`docs/migration/migration-plan.md`](docs/migration/migration-plan.md) — plano-mestre v1 → v2
- [`docs/migration/current-state-audit.md`](docs/migration/current-state-audit.md) — auditoria pré-migração
- [`docs/migration/post-mortem.md`](docs/migration/post-mortem.md) — retrospectiva
- [`docs/handoff/dissenha_dashboard/`](docs/handoff/dissenha_dashboard/) — design system Variação D
- [`frontend/README.md`](frontend/README.md) — como rodar o app React

## Licença

MIT.
