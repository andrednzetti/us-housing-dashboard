/**
 * App root — Variação D shell montado.
 *
 * Fase 4 PR 4a: aplica o esqueleto editorial do Handoff (header banda escura
 * + footer 3-col + AppLayout container) e troca o fetch inline pelo hook
 * `useIndicatorsFile`. O conteúdo do `<main>` é placeholder até PRs 4b
 * (KPI Quadro), 4c (Spotlight + Ledger) e 4d (Anexos + polimento) chegarem.
 *
 * Histórico:
 *   - Fase 2: hello world tokenizado provando tokens + fonts + JSON fetch
 *   - Fase 3 PR 3a: tipo `IndicatorsFile` e helpers do domain layer
 *   - Fase 3 PR 3b: 5 chart primitives SVG (demo descartável removida aqui)
 *   - Fase 4 PR 4a: shell + hook (este arquivo)
 */

import type { CSSProperties, JSX } from 'react';
import { AppLayout, Footer, Header } from './components/shell';
import { useIndicatorsFile } from './hooks/use-indicators-file';

const stateLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  marginBottom: 'var(--space-4)',
};

const placeholderTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-section)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-section)',
  margin: 0,
  marginBottom: 'var(--space-3)',
};

const placeholderCopyStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: 'var(--fs-body)',
  lineHeight: 'var(--lh-editorial)',
  color: 'var(--ink-soft)',
  maxWidth: '60ch',
  margin: 0,
};

const summaryRowStyle: CSSProperties = {
  marginTop: 'var(--space-7)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-6)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
};

const summaryItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
};

const summaryValueStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-medium)',
  color: 'var(--ink)',
  letterSpacing: 'var(--ls-medium)',
  textTransform: 'none',
  lineHeight: 1,
};

const errorBoxStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-table)',
  color: 'var(--neg)',
  padding: 'var(--space-5)',
  background: 'var(--bg-panel)',
  border: '0.5px solid var(--neg)',
};

export default function App(): JSX.Element {
  const { data, loading, error } = useIndicatorsFile();

  return (
    <AppLayout
      header={<Header generatedAt={data?.generatedAt} schemaVersion={data?.schemaVersion} />}
      footer={<Footer generatedAt={data?.generatedAt} schemaVersion={data?.schemaVersion} />}
    >
      <div style={stateLabelStyle}>Fase 4 · PR 4a</div>
      <h2 style={placeholderTitleStyle}>Conteúdo do dashboard em construção</h2>
      <p style={placeholderCopyStyle}>
        O miolo da Variação D — Quadro Resumido (4 KPIs), Spotlight, Ledger
        filtrável e Anexos de Regiões/Top Metros — chega nos PRs 4b, 4c e 4d.
        Este placeholder mostra apenas o shell + a contagem dos itens
        carregados pelo <code>useIndicatorsFile</code>.
      </p>

      {loading && (
        <div style={{ ...summaryRowStyle, color: 'var(--ink-mute)' }}>
          Carregando indicadores…
        </div>
      )}

      {error && (
        <div style={errorBoxStyle} role="alert">
          Erro ao carregar dados: {error.message}
        </div>
      )}

      {data && (
        <div style={summaryRowStyle}>
          <div style={summaryItemStyle}>
            <span>Indicadores</span>
            <span style={summaryValueStyle}>{data.indicators.length}</span>
          </div>
          <div style={summaryItemStyle}>
            <span>Regiões</span>
            <span style={summaryValueStyle}>{data.regions.length}</span>
          </div>
          <div style={summaryItemStyle}>
            <span>Metros</span>
            <span style={summaryValueStyle}>{data.metros.length}</span>
          </div>
          <div style={summaryItemStyle}>
            <span>Eventos</span>
            <span style={summaryValueStyle}>{data.events.length}</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
