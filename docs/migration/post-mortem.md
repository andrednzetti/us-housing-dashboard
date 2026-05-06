# Post-mortem: Migração v1 → v2 (vanilla → React)

> Status: rascunho — datado de 2026-05-06, fechamento da Fase 4 e início da
> Fase 5. Será atualizado no PR 5c quando a tag `v2.0.0` for aplicada.

## Contexto

Dashboard interno da Dissenha Moulding para acompanhar o mercado imobiliário
americano (real estate residencial). Versão original em vanilla HTML/JS +
Chart.js, 18 indicadores, hospedada em GitHub Pages com pipeline Python
semanal alimentando um único `data/indicators.json`.

A migração para React 18 + TypeScript strict + Vite seguiu o design
**Variação D** do handoff editorial (banda escura verde marca, tipografia
Source Serif 4, paleta invoice/boletim). O schema foi expandido para v2
com 23 indicadores, regions, metros e events; a pipeline ganhou derivados
(`affordability`, `cpi_shelter_yoy`) e fallback last-known-good.

## Cronograma

A migração foi executada **em um único dia** — 6 de maio de 2026 (UTC-3) —
com sessão concentrada de implementação assistida. Marcos principais:

| Hora (BRT) | Marco |
|---|---|
| 11:22 | Tag `v1-vanilla-final` + housekeeping Fase 0 (PR #1) |
| 11:30–14:00 | Fase 1 — pipeline Python expandida (PRs #2 e #3) |
| 14:33 | Fase 2 — bootstrap React + Vite (PR #4) |
| 15:19 | Fase 3 PR 3a — domain layer (PR #5) |
| 16:34 | Fase 3 PR 3b — chart primitives (PR #6) |
| 16:59 | Fase 4 PR 4a — Shell editorial (PR #7) |
| 17:32 | Fase 4 PR 4b — Quadro Resumido (PR #8) |
| 17:39 | Hotfix `fmtPct` (PR #9) |
| 17:48 | Fase 4 PR 4c-1 — Spotlight card (PR #10) |
| 18:25 | Fase 4 PR 4c-2 — Ledger interativo (PR #11) |
| 18:51 | Fase 4 PR 4c-3 — Spotlight asides + DonutMulti (PR #12) |
| 19:10 | Fase 4 PR 4d — Anexos (PR #13) — encerra estrutural Fase 4 |
| 19:45 | Housekeeping pré-Fase 5 — X axis + load_dotenv (PR #14) |
| 20:02 | Fix `1A == 5A` + frequency no schema (PR #15) |
| 20:10+ | Início da Fase 5 (cutover) — este post-mortem |

## Métricas finais (PR 5a)

| Item | Valor |
|---|---|
| PRs mergeados (Fase 0–4 + housekeeping) | 15 |
| Testes (Vitest) | 304 |
| Cobertura (statements / branches / funcs / lines) | 98.91 % / 96.14 % / 95.87 % / 99.42 % |
| Bundle gzip | 56.33 KB (target ≤ 200 KB) |
| Linhas de TypeScript (sem comentários) | 5 245 (80 arquivos) |
| Linhas de testes | 2 687 |
| Componentes React | 24 |
| CSS | 146 linhas (`tokens.css` + `globals.css`) |
| Indicators | 23 |
| Regions | 4 |
| Metros | 8 |
| Events | 5 |
| Vulnerabilidades npm audit | 0 |

## Decisões arquiteturais que valeram

1. **Pinning estrito de versões** (`~` em todas as deps de `frontend/package.json`,
   `==` em `requirements.txt`). Zero drift silencioso ao longo da migração;
   nenhum debug por upgrade não-intencional.
2. **Domain layer rigoroso**: `types/` puro, `lib/format.ts`, `lib/sentiment.ts`,
   `lib/selectors.ts`, `lib/series.ts`, `lib/dates.ts`. Função pura por padrão,
   testável sem mocks. Resultou em coverage altíssimo na camada de regra de negócio
   sem testes de integração caros.
3. **Snapshot tests via `react-dom/server` + `renderToStaticMarkup`** —
   sem jsdom, sem `@testing-library/react`. Ambiente Node puro, suite roda em
   ~3.4s. Trade-off: handlers (`onClick`, etc.) não são invocados; cobertos via
   `vi.fn()` typing checks. Aceitável dada a velocidade.
4. **Backwards-compat verificada via snapshots inalterados**. Quando estendi o
   `AreaChart` com `showGrid`/`showAxis` na PR #10 e depois com `showXAxis`/
   `xLabels` na PR #14, os 7 snapshots originais permaneceram bit-exact —
   confirmando que defaults preservavam comportamento.
5. **Race condition prevention** (após PR #8): verificar push completo em
   `git rev-list --left-right --count <branch>...origin/<branch>` antes de
   `gh pr create`. PR #8 mergeou antes do meu hotfix do `fmtPct` chegar no
   remote, virando o PR #9 órfão. Padrão depois mantido em todos os PRs.
6. **Decomposição preventiva** quando o PR fica > 800 linhas / > 15 arquivos.
   PR 4c original (Spotlight + Ledger + Aside) foi decomposto em 4c-1 / 4c-2 /
   4c-3, cada um digerível e validável independentemente.
7. **Pause-and-ask quando o prompt diverge do handoff/plano-mestre**.
   Identificou ≥ 5 conflitos materiais (PRs 4a/4b/4c/4d/5) — todos resolvidos
   em favor do handoff/plano consolidado, com decisões registradas em commit
   message + PR body.
8. **Pipeline Python intocada** durante toda a Fase 2–4. Único toque pós-Fase
   1 foi o PR #14 (`load_dotenv` em `fetch_fred.py`) e o PR #15
   (`POINTS_BY_FREQUENCY` em `merge_data.py`), ambos com aprovação prévia
   explícita. Discípulo da regra "não toque na pipeline fora da Fase 1".
9. **Tag de safety `v1-vanilla-final`** aplicada em `main` antes do bootstrap
   React (Fase 0). Não usada — mas estava lá. Custo: 1 comando `git tag`.

## Surpresas (em ordem cronológica)

1. **`additionalProperties: false` no schema** (Fase 1 PR 1b): adicionar campo
   novo no JSON output sem antes adicionar `properties.<nome>` no schema
   trava a validação. Gotcha óbvio em retrospecto.
2. **`fmtPct` adicionando sinal automaticamente** (Fase 3 PR 3a, descoberto na
   PR 4b): bug residual de "delta-style formatter pretendendo ser
   value-formatter". Hotfix #9 separou responsabilidades: `fmtPct` para valor
   absoluto (sem sinal), `fmtDelta` para variação (sinal explícito).
3. **Schema, types e prompt do user divergindo**: o plano-mestre tinha
   `nahb_hmi`, mas o pipeline real usou `nahb`. Ajuste silencioso; mencionado
   nos commits.
4. **HBarSimple (Fase 3 PR 3b) virou redesign vs handoff**: o handoff original
   era thin progress div; o prompt da PR 3b prescrevia SVG full-row com label.
   Implementei o prescrito mas não foi usado em produção — na PR 4d (Anexos)
   o handoff prescrevia thin de 5px novamente, render inline (não usa o
   primitivo). Débito técnico anotado.
5. **Bug `1A == 5A` no Spotlight** descoberto pelo usuário no review visual da
   PR #14. Causa raiz não era o frontend — era o backend Python truncando
   tudo em 52 pontos. Fix na PR #15 com extensão do schema (`frequency` +
   `POINTS_BY_FREQUENCY`).
6. **Race condition Vercel ↔ GitHub webhook** (após merge do PR #13): Vercel
   não disparou rebuild de produção automaticamente. Causa exata desconhecida;
   redeploy manual via Vercel Dashboard resolveu.
7. **Permission engine bloqueou `gh pr create --body-file`** uma vez por
   timing (file recém-criado no mesmo turno). Retry imediato funcionou.

## Débito técnico remanescente

1. **`HBarSimple` da Fase 3 PR 3b não-usado em produção**. Existe como primitivo
   versionado mas nunca foi consumido. Avaliar remoção pós-Fase 5 ou achar uso
   em features futuras.
2. **Inconsistência de idioma nos `indicator.name`**: alguns nomes em PT-BR
   ("Mortgage 30Y Fixa", "Construções Residenciais"), outros em EN ("NAHB
   Housing Market Index"). Issue de copy-editing — não bloqueia produção.
   Decisão editorial: revisar a wording dos 23 nomes de uma vez em PR
   dedicado, evitar diff barulhento durante a Fase 5.
3. **Indicators com histórico curto**: `existing_sales` (13 obs raw),
   `nahb` (~11 obs raw), `mba_purch`/`mba_refi` (26 obs raw — limite do
   scraping). Period 5A neles renderiza plano. Comportamento honesto.
4. **`load_dotenv` apenas em `fetch_fred.py`**. `fetch_scraped.py`,
   `merge_data.py`, `compute_derived.py`, `indicators_meta.py` não usam env
   vars hoje, mas se passarem a usar a chamada será necessária. Nada
   bloqueante.
5. **Hot dots em regions/metros são hardcoded** em `scripts/static_data/`.
   Avaliar se vira regra dinâmica (ex.: `yoy > 5%` ⇒ hot) ou continua
   curadoria editorial.
6. **`coverage/` e `node_modules/` no working tree** das sessões locais —
   gitignored, mas vale revisar `.gitignore` no encerramento da Fase 5 para
   garantir que nada acidental entrou versionado.

## Lições aprendidas

1. **Plano-mestre vale ouro**. Ter o `migration-plan.md` consolidado com
   decisões arquiteturais antes de começar fez a sessão de implementação
   correr em ~12 horas para 15 PRs. Cada PR tinha um escopo claro e um
   critério de aceitação verificável; a entrega ficou previsível.
2. **Working agreement > checklist**. As regras (commitar atômico, pause-and-
   ask em conflitos, push-antes-de-PR, snapshots como contrato visual)
   evitaram retrabalho mais do que listas de tarefas teriam evitado.
3. **Decisões "small" (cor de Sparkline, label de filter)** somam 30 % do
   tempo de PR. Padrão prático: quando handoff e prompt-user divergem em
   detalhe cosmético, **sigo handoff e documento no PR body**. Em conflito
   substantivo (escopo, layout, contrato), **paro e pergunto** — exatamente
   o padrão que a tabela de "decisões alinhadas" no body de cada PR registra.
4. **Velocidade tem limite no review humano**. Os 15 PRs em 12h só foram
   possíveis porque o André validou cada um rápido (visual no Vercel preview).
   Em equipes maiores, este ritmo seria inviável — e o decomposing em PRs
   menores (que pareceu desperdício no PR 4c → 4c-1/2/3) seria essencial.
5. **Backwards-compat por snapshot bit-exact** é a melhor barreira contra
   regressão silenciosa em primitivos. Funcionou no AreaChart (Fase 3 → 4
   → housekeeping), e funcionou de novo no PR #15 quando snapshots fallback
   continuaram intactos.

## Próximos passos (pós-v2.0.0)

- **PR 5b**: parar a geração de `data/indicators.legacy.json` em
  `merge_data.py`. Pipeline change cirúrgica.
- **PR 5c**: workflow novo para deploy do `frontend/dist/` em GitHub Pages,
  ajuste em `Settings → Pages`, tag `v2.0.0`, bump de
  `frontend/package.json` (sair de `0.0.0` para `2.0.0`). Encerramento da
  Fase 5.
- **Fora da Fase 5** (issues separados): copy-editing dos `indicator.name`,
  remoção do `HBarSimple` se confirmado não-uso, dark mode (tokens já
  preparados em `tokens.css`), substituição dos hardcoded `static_data/`
  por scrape NAR Regional Reports.
