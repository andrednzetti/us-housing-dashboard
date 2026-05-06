import { useEffect, useState, type CSSProperties } from 'react';
import type { IndicatorsFile } from './types';
import {
  AreaChart,
  Donut,
  Gauge,
  HBarSimple,
  Sparkline,
} from './components/charts';

/**
 * Hello world tokenizado da Fase 2 — prova quatro coisas de uma vez:
 *   1. tokens CSS estão sendo aplicados (var(--bg), var(--accent), etc.)
 *   2. Google Fonts carregaram (Source Serif 4 italic no "EUA", JetBrains Mono nos labels)
 *   3. fetch do JSON funciona e o tipo `IndicatorsFile` bate com o schema v2
 *   4. TypeScript strict não reclama
 *
 * Fase 3 PR 3a: tipo `IndicatorsFile` agora vem do módulo central de tipos
 * (`src/types/`), espelhando exatamente `data/schema.json`.
 *
 * Fase 3 PR 3b: a seção "Chart Primitives Demo" abaixo dos cards de contagem
 * renderiza os 5 SVG charts com mock data. Sanity check visual antes da Fase 4
 * compor estes mesmos componentes em cards reais alimentados por `indicators`.
 *
 * O dashboard real (Variação D completa) é construído da Fase 4 em diante;
 * este componente é descartado naquele momento.
 */

/** Mock series para a demo dos charts — 12 pontos típicos de uma variável % a.a. */
const MOCK_SERIES: number[] = [3.2, 3.8, 4.1, 4.5, 4.3, 4.9, 5.1, 5.0, 4.8, 4.6, 4.4, 4.2];

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

const demoSection: CSSProperties = {
  marginTop: 'var(--space-8)',
  paddingTop: 'var(--space-8)',
  borderTop: 'var(--border-soft)',
};

const demoSectionLabel: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  marginBottom: 'var(--space-4)',
};

const demoTitle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-section)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-section)',
  marginBottom: 'var(--space-6)',
};

const demoGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--space-6)',
};

const demoCard: CSSProperties = {
  padding: 'var(--space-5)',
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
};

const demoCardLabel: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
};

const demoCardName: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-card)',
  letterSpacing: 'var(--ls-card)',
  color: 'var(--ink)',
};

const demoCardBody: CSSProperties = {
  marginTop: 'var(--space-2)',
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

      <section style={demoSection} aria-labelledby="charts-demo-title">
        <div style={demoSectionLabel}>Fase 3 · PR 3b</div>
        <h2 id="charts-demo-title" style={demoTitle}>
          Chart Primitives Demo
        </h2>
        <div style={demoGrid}>
          <div style={demoCard}>
            <span style={demoCardLabel}>Sparkline</span>
            <span style={demoCardName}>Tendência inline (ledger)</span>
            <div style={demoCardBody}>
              <Sparkline series={MOCK_SERIES} accent="var(--group-taxas)" width={280} />
            </div>
          </div>

          <div style={demoCard}>
            <span style={demoCardLabel}>AreaChart</span>
            <span style={demoCardName}>Spotlight série temporal</span>
            <div style={demoCardBody}>
              <AreaChart series={MOCK_SERIES} accent="var(--group-taxas)" width={300} height={140} />
            </div>
          </div>

          <div style={demoCard}>
            <span style={demoCardLabel}>HBarSimple</span>
            <span style={demoCardName}>Ranking região / metro</span>
            <div style={demoCardBody}>
              <HBarSimple
                label="Northeast"
                value={418}
                max={1000}
                valueLabel="US$ 418k"
                accent="var(--group-precos)"
              />
            </div>
          </div>

          <div style={demoCard}>
            <span style={demoCardLabel}>Donut</span>
            <span style={demoCardName}>Score / composição single</span>
            <div style={demoCardBody}>
              <Donut value={34} accent="var(--group-oferta)" />
            </div>
          </div>

          <div style={demoCard}>
            <span style={demoCardLabel}>Gauge</span>
            <span style={demoCardName}>NAHB HMI estilo</span>
            <div style={demoCardBody}>
              <Gauge value={67} centerLabel="67" accent="var(--group-sentimento)" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
