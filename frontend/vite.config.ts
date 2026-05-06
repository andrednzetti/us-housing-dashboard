// `defineConfig` vem de `vitest/config` (que reexporta o do Vite + tipos do test).
// Isso permite usar o bloco `test: { ... }` com type-safety completo.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/**
 * Vite + Vitest config para o frontend React/TS do Dashboard
 * Mercado Imobiliário EUA.
 *
 * - `base: '/'` → Vercel preview / GitHub Pages root.
 * - `viteStaticCopy` copia os arquivos JSON da raiz `data/` para
 *   `frontend/public/data/` no momento do build, garantindo que o frontend
 *   acesse `./data/indicators.json` e `./data/indicators.legacy.json` em
 *   runtime sem depender de cópia manual ou symlink.
 * - Bloco `test` configura Vitest para src test files.
 */
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    viteStaticCopy({
      // silent=true evita falhar build quando algum arquivo opcional não
      // existe (ex.: indicators.legacy.json antes do primeiro workflow run
      // pós-PR 1b commitar o arquivo no repo). Em produção/CI o
      // indicators.json sempre existe — se não existir, App.tsx mostra
      // "Erro ao carregar dados" em runtime.
      silent: true,
      targets: [
        // Lista explícita dos arquivos a copiar de data/ → dist/data/.
        // Glob '../data/*.json' pegaria intermediários gerados localmente
        // (fred_raw.json, scraped_raw.json — gitignored mas que ficam no
        // working tree após rodar fetch_*.py local).
        // Em dev (vite serve), o plugin sincroniza on-the-fly.
        { src: '../data/indicators.json', dest: 'data' },
        { src: '../data/indicators.legacy.json', dest: 'data' },
        { src: '../data/events.json', dest: 'data' },
        { src: '../data/schema.json', dest: 'data' },
      ],
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
    // Sinaliza no log o tamanho de cada chunk para validar critério < 200 KB gzip.
    reportCompressedSize: true,
  },
  test: {
    // describe/it/expect globais (sem precisar importar)
    globals: true,
    // Helpers puros — não precisam de jsdom
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/**/*.ts',
        'src/components/charts/**/*.tsx',
        'src/components/shell/**/*.tsx',
        'src/components/quadro/**/*.tsx',
      ],
      exclude: [
        'src/lib/**/*.test.ts',
        'src/components/charts/**/*.test.tsx',
        'src/components/charts/index.ts',
        'src/components/shell/**/*.test.tsx',
        'src/components/shell/index.ts',
        'src/components/quadro/**/*.test.tsx',
        'src/components/quadro/index.ts',
      ],
    },
  },
});
