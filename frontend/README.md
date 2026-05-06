# Frontend — Mercado Imobiliário EUA (v2)

Frontend novo da migração v2 do dashboard, em **React 18 + TypeScript strict + Vite**.
Convive em paralelo com o frontend legacy (`/app.js` + `/index.html` + `/style.css` na raiz)
até o cutover na Fase 5. Não substitui nada em produção ainda.

---

## Stack

| Item | Versão | Motivo |
|---|---|---|
| React | ~18.3.1 | Plano confirmado (sem Next.js) |
| TypeScript | ~5.7.2 | strict mode + rigor extra |
| Vite | ~6.4.x | Build rápido, base config para subpath, sem vulnerabilidades |
| `vite-plugin-static-copy` | ~2.3.x | Sincroniza `data/*.json` da raiz para o output do build |
| Tipografia | Google Fonts | Source Serif 4 + Inter + JetBrains Mono |

Charts são SVG primitivo (sem Recharts/Chart.js) — implementados na Fase 3.

---

## Como rodar local

Pré-requisitos: **Node 20+** e **npm 10+**.

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Hot module reload ativo.

### Build de produção

```bash
npm run build
# saída em frontend/dist/
```

### Type-check (sem build)

```bash
npm run typecheck
```

### Preview do build

```bash
npm run preview
# serve dist/ localmente em http://localhost:4173
```

---

## Como o data flow funciona

```
repo-root/data/indicators.json          (gerado pelo Python CI semanal)
         |
         v   (vite-plugin-static-copy)
frontend/dist/data/indicators.json      (cópia no output do build)
         |
         v   (fetch em runtime)
React App                               (consumido em App.tsx)
```

Em **dev** (`npm run dev`), o plugin intercepta pedidos para `/data/*.json` e
serve direto da raiz `../data/`.

Em **build** (`npm run build`), o plugin copia uma vez para `dist/data/` e
o output é estático.

A pipeline Python continua escrevendo apenas em `repo-root/data/` — o frontend
não toca nessa pasta.

---

## Vercel preview

Configurado manualmente no dashboard Vercel:

- **Repo**: `andrednzetti/us-housing-dashboard`
- **Root Directory**: `frontend`
- **Framework Preset**: Vite (auto-detectado)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

Preview URLs são geradas automaticamente para cada push em qualquer branch.
URL fixa do branch principal de migração: definida pelo Vercel após o setup.

---

## Estrutura

```
frontend/
├── index.html                  # entry HTML + Google Fonts
├── package.json
├── tsconfig.json               # composite (referencia app + node)
├── tsconfig.app.json           # strict mode completo
├── tsconfig.node.json          # config para vite.config.ts
├── vite.config.ts              # Vite + vite-plugin-static-copy
├── public/                     # assets estáticos (vazio inicialmente)
└── src/
    ├── main.tsx                # entry React
    ├── App.tsx                 # hello world tokenizado (Fase 2)
    ├── vite-env.d.ts           # ambient types Vite
    ├── styles/
    │   ├── tokens.css           # design tokens da Variação D
    │   └── globals.css          # reset + base + import tokens
    ├── lib/                     # populado em Fase 3 (format, sentiment, groups)
    └── components/              # populado em Fase 3-4 (charts, sections)
```

---

## TypeScript strict

`tsconfig.app.json` ativa todos os flags rigorosos:

- `strict: true`
- `noImplicitAny`
- `noUncheckedIndexedAccess` (pega bugs cedo em Fases 3-4)
- `noFallthroughCasesInSwitch`
- `noImplicitReturns`
- `exactOptionalPropertyTypes`
- `noUnusedLocals` / `noUnusedParameters`

`any` está proibido sem motivo explícito documentado.

---

## Próximas fases

- **Fase 3**: domain layer + chart primitives em TS (sem UI)
- **Fase 4**: dashboard Variação D completo (4 PRs incrementais)
- **Fase 5**: cutover — substitui legacy em produção
