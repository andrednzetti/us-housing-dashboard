# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/),
versionamento [SemVer](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

Sem mudanças pendentes.

---

## [2.0.0] — 2026-05-06

Reescrita completa do frontend de vanilla HTML/JS para **React 18 + TypeScript
strict + Vite**, seguindo o design **Variação D** do handoff
(`docs/handoff/dissenha_dashboard/`). Pipeline Python expandida com novos
indicadores e derivados; schema v2 introduzido.

### Adicionado

- **Frontend React 18 + TypeScript + Vite** (camada de apresentação completa).
- **Schema v2** (`data/schema.json`) com 23 indicadores, regions, metros, events,
  validação JSON Schema no CI.
- **Domain layer**: `types/`, `lib/format.ts`, `lib/sentiment.ts`,
  `lib/selectors.ts`, `lib/series.ts`, `lib/dates.ts`, `lib/groups.ts`.
- **5 chart primitives** SVG nativos: Sparkline, AreaChart, HBarSimple,
  Donut, Gauge.
- **Primitivo `DonutMulti`** (multi-segment para Composição da carteira).
- **Quadro Resumido** invoice-style com 4 KPIs (Mortgage30 / Case-Shiller /
  Months of Supply / NAHB).
- **Spotlight grid 2-col** com card principal (área + grid + Y axis + X axis
  com datas absolutas + stats 4-col + nota explicativa via `indicator.why`)
  e aside (Crônica de eventos + Composição da carteira).
- **Ledger plano** com 23 indicadores filtráveis por grupo, header de tabela,
  rows clicáveis (button semântico), interação click-row → atualiza Spotlight.
- **Anexos** (Anexo I: Regiões com HBar thin · Anexo II: Top Metros Sun Belt).
- **Pipeline Python expandida**: 5 indicadores novos via FRED (`fed_funds`,
  `treasury10`, `unemployment`, `cpi_shelter`, `mefainusa672n`) + 2 derivados
  (`affordability`, `cpi_shelter_yoy`).
- **Schema v2 com `frequency`** (Weekly/Monthly/Quarterly/Daily) — habilita
  histórico estendido (até 5 anos por indicador) e X axis com datas reais.
- **Hot fallback** (`MAX_FALLBACK_AGE_DAYS = 14`) — se um indicador esperado
  estiver ausente após o merge raw, recupera do `indicators.json` anterior
  enquanto for fresco.
- **Vercel preview** automático para cada PR.
- **Tag `v1-vanilla-final`** aplicada em `main` antes da migração (rollback).
- 304 testes (Vitest) · coverage 99% statements / 96% branches / 96% functions
  / 99% lines · bundle 56 KB gzip.

### Mudado

- **Schema v1 → v2** com convivência durante a migração via dual output
  (`indicators.json` + `indicators.legacy.json`).
- **Pipeline Python** centraliza metadados em `scripts/indicators_meta.py`
  (catálogo declarativo dos 23 indicadores).
- **`USHMI` → scraping de NAHB Housing Market Index** (eyeonhousing.org).
- **`PHSI` → `PENLISCOUUS`** (Pending Home Sales via FRED).
- **Layout completamente redesenhado** — banda escura editorial, tipografia
  Source Serif 4 + JetBrains Mono, paleta verde marca + accent laranja.
- **Idioma do produto**: PT-BR (era PT-BR misto).
- **`fmtPct`** sem sinal automático (era `+6.30%`, agora `6,30%` em locale pt-BR).
- **`fmtDelta`** usa minus tipográfico `−` (U+2212), não hífen ASCII.

### Removido

- Arquivos vanilla v1 (`index.html`, `app.js`, `style.css`, `assets/`) movidos
  da raiz para `legacy/` — preservados mas não mais servidos em produção.
- Geração de `data/indicators.legacy.json` em `merge_data.py` — frontend React
  consome apenas `indicators.json` (schema v2). Snapshot histórico do legacy
  json continua acessível via tag `v1-vanilla-final`.
- Constantes legacy de v1 do `merge_data.py` (`LEGACY_V1_KEYS`,
  `LEGACY_KEY_ALIASES`, `V1_GROUP_ORDER`, `V1_GROUP_LABELS`,
  função `build_legacy_v1`).

### Adicionado (cutover)

- `.github/workflows/deploy-pages.yml` — workflow novo que builda `frontend/`
  e faz deploy para GitHub Pages via `actions/deploy-pages@v4`. Disparado em
  push em `main` quando `frontend/**`, `data/**` ou o próprio workflow muda.
- `frontend/package.json` versão bumpada de `0.0.0` para `2.0.0` (semver
  alinhado com a tag `v2.0.0` git).
- `legacy/` na raiz com a versão vanilla preservada.
- `docs/migration/post-mortem.md` com retrospectiva da migração.

### Corrigido (durante a migração)

- **Bug `1A == 5A` no Spotlight** (PR #15): truncamento de `MAX_SERIES_POINTS = 52`
  no backend fazia 1A e 5A renderizarem a mesma curva para indicadores weekly.
  Resolvido via `POINTS_BY_FREQUENCY` parametrizado e propagação de `frequency`
  no schema.
- **`fmtPct` com sinal indevido** (PR #9 hotfix do PR #8): `+6.30%` virou `6,30%`.
- **Race condition Vercel ↔ GitHub** após PR #13: webhook automático demorou.
  Mitigação: trigger manual via Dashboard.

---

## [1.x] — antes de 2026-05-06

Versão original em vanilla HTML/JS com Chart.js. 18 indicadores. Hosting
GitHub Pages, deploy direto da raiz do `main`. Pipeline Python básica
(FRED + scrapers, sem schema validado, sem derivados).

Tag `v1-vanilla-final` aponta para o último commit dessa série imediatamente
antes do bootstrap React (commit `c2d7da6`).

Conteúdo preservado em `legacy/` para auditoria histórica.

---

## Convenções

- **`Adicionado`** para funcionalidades novas.
- **`Mudado`** para mudanças em funcionalidades existentes.
- **`Deprecado`** para funcionalidades removidas em breve.
- **`Removido`** para funcionalidades já retiradas.
- **`Corrigido`** para correções de bugs.
- **`Segurança`** para correções de vulnerabilidades.

Versionamento: `MAJOR.MINOR.PATCH` (incompatible · backwards-compat · bugfix).
