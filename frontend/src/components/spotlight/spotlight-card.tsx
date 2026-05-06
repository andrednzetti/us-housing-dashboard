/**
 * SpotlightCard — card principal do "indicador da semana" da Variação D.
 *
 * Portado de `docs/handoff/dissenha_dashboard/variation-d.jsx` linhas 224-290.
 * Compõe o lado esquerdo (1.7fr) do grid Spotlight; o aside (1fr) com
 * Crônica de eventos + Composição da carteira fica em `<Spotlight />`,
 * que envelopa este card.
 *
 * Estrutura:
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ ●  GRUPO · INDICADOR EM FOCO                       [PeriodTabs] │
 *   │ Indicator name (serif 28)                                        │
 *   │ ───────────────────────────────────────────────────────────────  │
 *   │ Valor (serif 60)   +0,07pp · sem                                 │
 *   │ ───────────────────────────────────────────────────────────────  │
 *   │ AreaChart 720x240 com grid + Y axis                              │
 *   │ ───────────────────────────────────────────────────────────────  │
 *   │ Mín 52 sem. │ Máx 52 sem. │ Média 52 sem. │ Fonte                 │
 *   │ ───────────────────────────────────────────────────────────────  │
 *   │ │ NOTA EXPLICATIVA                                                │
 *   │ │ Texto serif italic com indicator.why (do schema)                │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Estado interno: `period` (default `'1A'`) controla o slice da `series`
 * passada ao AreaChart. Stats (Mín/Máx/Média) usam a `series` completa,
 * espelhando o handoff (que rotula explicitamente "52 sem.").
 *
 * @example
 *   <SpotlightCard indicator={selectSpotlight(file)!} />
 */

import { useMemo, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Indicator, Period } from '../../types';
import { AreaChart } from '../charts';
import { fmtDelta, fmtValue } from '../../lib/format';
import { GROUPS } from '../../lib/groups';
import { deltaColorFor, deltaCssVar } from '../../lib/sentiment';
import { seriesStats, sliceSeriesByPeriod } from '../../lib/series';
import { PeriodTabs } from './period-tabs';

const PLACEHOLDER = '—';
const DEFAULT_PERIOD: Period = '1A';

const CHART_WIDTH = 720;
const CHART_HEIGHT = 240;

const sectionStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  padding: 'var(--space-8)',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 'var(--space-5)',
  gap: 'var(--space-6)',
  flexWrap: 'wrap',
};

const eyebrowRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  marginBottom: 'var(--space-2)',
};

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  display: 'inline-block',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-section)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-section)',
  margin: 'var(--space-1) 0 0',
};

const valueRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--space-5)',
  marginBottom: 'var(--space-6)',
  paddingBottom: 'var(--space-4)',
  borderBottom: 'var(--border-card)',
  flexWrap: 'wrap',
};

const bigValueStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-big)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-big)',
  lineHeight: 1,
  color: 'var(--ink)',
};

const deltaStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  fontWeight: 500,
  lineHeight: 1,
};

const deltaPeriodStyle: CSSProperties = {
  color: 'var(--ink-mute)',
  marginLeft: 'var(--space-2)',
  fontWeight: 400,
};

const statsGridStyle: CSSProperties = {
  marginTop: 'var(--space-6)',
  paddingTop: 'var(--space-5)',
  borderTop: 'var(--border-card)',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-6)',
};

const statLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: '0.14em',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-1)',
};

const statValueStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1rem',
  color: 'var(--ink)',
};

const noteBoxStyle: CSSProperties = {
  marginTop: 'var(--space-6)',
  padding: 'var(--space-5) var(--space-6)',
  background: 'var(--rule-soft)',
  borderLeft: '3px solid var(--accent)',
};

const noteEyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-2)',
};

const noteCopyStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-body)',
  fontStyle: 'italic',
  lineHeight: 'var(--lh-editorial)',
  color: 'var(--ink-soft)',
};

const chartWrapperStyle: CSSProperties = {
  overflowX: 'auto',
};

export interface SpotlightCardProps {
  indicator: Indicator;
  /** Período inicial. Default: `'1A'`. */
  initialPeriod?: Period;
}

export function SpotlightCard({
  indicator,
  initialPeriod = DEFAULT_PERIOD,
}: SpotlightCardProps): JSX.Element {
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const slicedSeries = useMemo(
    () => sliceSeriesByPeriod(indicator, period),
    [indicator, period],
  );
  const stats = useMemo(() => seriesStats(indicator.series), [indicator]);

  const groupMeta = GROUPS[indicator.group];
  const valueLabel = fmtValue(indicator.value, indicator.fmtSpec);
  const deltaLabel = fmtDelta(indicator.delta, indicator.deltaUnit);
  const deltaCssColor = deltaCssVar(deltaColorFor(indicator));
  const titleId = `spotlight-card-${indicator.id}-title`;

  // Stats têm 4 cells: Mín/Máx/Média (numéricos) + Fonte (texto).
  const statCells: { label: string; value: string }[] = [
    {
      label: 'Mín · 52 sem.',
      value: Number.isNaN(stats.min)
        ? PLACEHOLDER
        : fmtValue(stats.min, indicator.fmtSpec),
    },
    {
      label: 'Máx · 52 sem.',
      value: Number.isNaN(stats.max)
        ? PLACEHOLDER
        : fmtValue(stats.max, indicator.fmtSpec),
    },
    {
      label: 'Média 52 sem.',
      value: Number.isNaN(stats.avg)
        ? PLACEHOLDER
        : fmtValue(stats.avg, indicator.fmtSpec),
    },
    { label: 'Fonte', value: indicator.source },
  ];

  return (
    <section style={sectionStyle} aria-labelledby={titleId}>
      <div style={headerRowStyle}>
        <div>
          <div style={eyebrowRowStyle}>
            <span style={{ ...dotStyle, background: groupMeta.accent }} aria-hidden />
            <span style={eyebrowStyle}>
              {groupMeta.label} · indicador em foco
            </span>
          </div>
          <h2 id={titleId} style={titleStyle}>
            {indicator.name}
          </h2>
        </div>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      <div style={valueRowStyle}>
        <span style={bigValueStyle}>{valueLabel}</span>
        <span style={{ ...deltaStyle, color: deltaCssColor }}>
          {deltaLabel}
          <span style={deltaPeriodStyle}>· {indicator.deltaPeriod}</span>
        </span>
      </div>

      <div style={chartWrapperStyle}>
        <AreaChart
          series={slicedSeries}
          accent={groupMeta.accent}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          showGrid
          showAxis
          formatY={(v) => fmtValue(v, indicator.fmtSpec)}
          ariaLabel={`Série de ${indicator.name}, período ${period}`}
        />
      </div>

      <div style={statsGridStyle}>
        {statCells.map((cell) => (
          <div key={cell.label}>
            <div style={statLabelStyle}>{cell.label}</div>
            <div style={statValueStyle}>{cell.value}</div>
          </div>
        ))}
      </div>

      {indicator.why.length > 0 && (
        <div style={noteBoxStyle}>
          <div style={noteEyebrowStyle}>Nota explicativa</div>
          <p style={noteCopyStyle}>{indicator.why}</p>
        </div>
      )}
    </section>
  );
}
