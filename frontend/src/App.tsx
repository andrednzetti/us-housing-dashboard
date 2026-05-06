import { useEffect, useState, type CSSProperties } from 'react';
import type { IndicatorsFile } from './types';

/**
 * Hello world tokenizado da Fase 2 — prova quatro coisas de uma vez:
 *   1. tokens CSS estão sendo aplicados (var(--bg), var(--accent), etc.)
 *   2. Google Fonts carregaram (Source Serif 4 italic no "EUA", JetBrains Mono nos labels)
 *   3. fetch do JSON funciona e o tipo `IndicatorsFile` bate com o schema v2
 *   4. TypeScript strict não reclama
 *
 * Fase 3 PR 3a: tipo `IndicatorsFile` agora vem do módulo central de tipos
 * (`src/types/`), espelhando exatamente `data/schema.json`. O dashboard real
 * (Variação D completa) é construído da Fase 4 em diante; este componente
 * é descartado naquele momento.
 */

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: IndicatorsFile };

const layout: CSSProperties = {
  padding: 'var(--space-12)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  minHeight: '100vh',
  fontFamily: 'var(--font-sans)',
};

const heroStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-hero)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-hero)',
  lineHeight: 'var(--lh-hero)',
  marginBottom: 'var(--space-6)',
};

const accentItalic: CSSProperties = {
  color: 'var(--accent)',
  fontStyle: 'italic',
  fontWeight: 400,
};

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  marginBottom: 'var(--space-4)',
};

const counterRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-6)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-table)',
};

const counterCell: CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  minWidth: 140,
};

const counterLabel: CSSProperties = {
  display: 'block',
  fontSize: 'var(--fs-label)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  marginBottom: 'var(--space-1)',
};

const counterValue: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-medium)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-medium)',
  color: 'var(--ink)',
  lineHeight: 1,
};

const errorStyle: CSSProperties = {
  ...layout,
  color: 'var(--neg)',
  fontFamily: 'var(--font-mono)',
};

const muteStyle: CSSProperties = {
  ...layout,
  color: 'var(--ink-mute)',
  fontFamily: 'var(--font-mono)',
};

export default function App(): JSX.Element {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('./data/indicators.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<IndicatorsFile>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', error: String(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return <div style={muteStyle}>Carregando dados…</div>;
  }
  if (state.status === 'error') {
    return <div style={errorStyle}>Erro: {state.error}</div>;
  }

  const { data } = state;

  return (
    <main style={layout}>
      <h1 style={heroStyle}>
        Mercado Imobiliário <em style={accentItalic}>EUA</em>
      </h1>
      <div style={labelStyle}>
        Schema {data.schemaVersion} · gerado em {data.generatedAt}
      </div>
      <div style={counterRow} aria-label="Contagem de itens carregados">
        <div style={counterCell}>
          <span style={counterLabel}>Indicators</span>
          <span style={counterValue}>{data.indicators.length}</span>
        </div>
        <div style={counterCell}>
          <span style={counterLabel}>Regions</span>
          <span style={counterValue}>{data.regions.length}</span>
        </div>
        <div style={counterCell}>
          <span style={counterLabel}>Metros</span>
          <span style={counterValue}>{data.metros.length}</span>
        </div>
        <div style={counterCell}>
          <span style={counterLabel}>Events</span>
          <span style={counterValue}>{data.events.length}</span>
        </div>
      </div>
    </main>
  );
}
