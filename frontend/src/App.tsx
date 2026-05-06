/**
 * App root — Variação D shell + sections de conteúdo.
 *
 * Fase 4 PR 4a: shell editorial + hook.
 * Fase 4 PR 4b: QuadroResumido.
 * Fase 4 PR 4c-1: Spotlight (card principal — sem aside ainda).
 * Restante (Ledger 4c-2, Aside do Spotlight 4c-3, Anexos 4d) em PRs futuros.
 *
 * Histórico:
 *   - Fase 2: hello world tokenizado provando tokens + fonts + JSON fetch
 *   - Fase 3 PR 3a: tipo `IndicatorsFile` e helpers do domain layer
 *   - Fase 3 PR 3b: 5 chart primitives SVG (demo descartável removida)
 *   - Fase 4 PR 4a: shell + hook
 *   - Fase 4 PR 4b: QuadroResumido
 *   - Fase 4 PR 4c-1: Spotlight card principal (este arquivo)
 */

import type { CSSProperties, JSX } from 'react';
import { QuadroResumido } from './components/quadro';
import { AppLayout, Footer, Header } from './components/shell';
import { Spotlight } from './components/spotlight';
import { useIndicatorsFile } from './hooks/use-indicators-file';
import { selectSpotlight } from './lib/selectors';

const loadingStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  padding: 'var(--space-8) 0',
};

const errorBoxStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-table)',
  color: 'var(--neg)',
  padding: 'var(--space-5)',
  background: 'var(--bg-panel)',
  border: '0.5px solid var(--neg)',
};

const placeholderStyle: CSSProperties = {
  marginTop: 'var(--space-12)',
  paddingTop: 'var(--space-6)',
  borderTop: 'var(--border-soft)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
};

export default function App(): JSX.Element {
  const { data, loading, error } = useIndicatorsFile();

  return (
    <AppLayout
      header={<Header generatedAt={data?.generatedAt} schemaVersion={data?.schemaVersion} />}
      footer={<Footer generatedAt={data?.generatedAt} schemaVersion={data?.schemaVersion} />}
    >
      {loading && <div style={loadingStyle}>Carregando indicadores…</div>}

      {error && (
        <div style={errorBoxStyle} role="alert">
          Erro ao carregar dados: {error.message}
        </div>
      )}

      {data && (
        <>
          <QuadroResumido file={data} />
          {(() => {
            const spotlight = selectSpotlight(data);
            return spotlight ? (
              <div style={{ marginTop: 'var(--space-8)' }}>
                <Spotlight indicator={spotlight} />
              </div>
            ) : null;
          })()}
          <div style={placeholderStyle}>
            Ledger · Aside do Spotlight · Anexos — próximos PRs (4c-2 · 4c-3 · 4d)
          </div>
        </>
      )}
    </AppLayout>
  );
}
