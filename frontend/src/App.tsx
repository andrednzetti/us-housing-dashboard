/**
 * App root — Variação D shell + sections de conteúdo.
 *
 * Fase 4 PR 4a: shell editorial + hook.
 * Fase 4 PR 4b: QuadroResumido.
 * Fase 4 PR 4c-1: Spotlight card principal isolado.
 * Fase 4 PR 4c-2: Ledger plano + interação Ledger ↔ Spotlight via lift do
 *                  estado `selected` neste componente.
 * Fase 4 PR 4c-3: Spotlight passa a ser wrapper grid 2-col (card + aside
 *                  com Crônica de eventos + Composição da carteira).
 * Restante (Anexos 4d) em PR futuro.
 *
 * Histórico:
 *   - Fase 2: hello world tokenizado provando tokens + fonts + JSON fetch
 *   - Fase 3 PR 3a: tipo `IndicatorsFile` e helpers do domain layer
 *   - Fase 3 PR 3b: 5 chart primitives SVG (demo descartável removida)
 *   - Fase 4 PR 4a: shell + hook
 *   - Fase 4 PR 4b: QuadroResumido
 *   - Fase 4 PR 4c-1: Spotlight card principal
 *   - Fase 4 PR 4c-2: Ledger + estado `selected`
 *   - Fase 4 PR 4c-3: Spotlight aside (Crônica + Composição) (este arquivo)
 */

import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Indicator } from './types';
import { Ledger } from './components/ledger';
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

const sectionGapStyle: CSSProperties = { marginTop: 'var(--space-8)' };

export default function App(): JSX.Element {
  const { data, loading, error } = useIndicatorsFile();
  // Lift estado: o Ledger atualiza este `selected` ao clicar numa linha,
  // e o Spotlight reage. Default é null — o `effectiveSelected` cai para
  // `selectSpotlight(data)` (mortgage30) enquanto não houve interação.
  const [selected, setSelected] = useState<Indicator | null>(null);
  const effectiveSelected =
    selected ?? (data ? selectSpotlight(data) : null);

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
          {effectiveSelected && (
            <div style={sectionGapStyle}>
              <Spotlight
                indicator={effectiveSelected}
                events={data.events}
                file={data}
              />
            </div>
          )}
          <div style={sectionGapStyle}>
            <Ledger
              file={data}
              selected={effectiveSelected}
              onSelect={setSelected}
            />
          </div>
          <div style={placeholderStyle}>
            Anexos (regiões + metros) — próximo PR (4d)
          </div>
        </>
      )}
    </AppLayout>
  );
}
