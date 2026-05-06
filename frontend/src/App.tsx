/**
 * App root — Variação D completa.
 *
 * Histórico:
 *   - Fase 2: hello world tokenizado provando tokens + fonts + JSON fetch
 *   - Fase 3 PR 3a: tipo `IndicatorsFile` e helpers do domain layer
 *   - Fase 3 PR 3b: 5 chart primitives SVG (demo descartável removida)
 *   - Fase 4 PR 4a: shell editorial + hook
 *   - Fase 4 PR 4b: QuadroResumido
 *   - Fase 4 PR 4c-1: Spotlight card principal
 *   - Fase 4 PR 4c-2: Ledger + estado `selected` lift
 *   - Fase 4 PR 4c-3: Spotlight aside (Crônica + Composição)
 *   - Fase 4 PR 4d: Anexos (Regiões + Metros) — encerra a Fase 4 (este arquivo)
 *
 * Próxima fase: cutover legacy → React (Fase 5 do plano-mestre).
 */

import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Indicator } from './types';
import { AnexosSection } from './components/anexos';
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
          <div style={sectionGapStyle}>
            <AnexosSection regions={data.regions} metros={data.metros} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
