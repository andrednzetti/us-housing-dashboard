/**
 * KpiCell — uma célula do Quadro Resumido (Variação D, "summary table"
 * invoice-style).
 *
 * Não é um card flutuante — é uma coluna de uma section única separada
 * por divider vertical. Sem chart embedded, sem setinhas: o handoff é
 * deliberadamente sóbrio aqui (`variation-d.jsx` linhas 209-216).
 *
 * Estrutura:
 *   ┌──────────────────────────────────┐
 *   │ EYEBROW (mono 9 uppercase ink-mute) │
 *   │                                    │
 *   │ valor (serif 36)  delta (mono 11)  │
 *   └──────────────────────────────────┘
 *
 * `valueColor` controla a cor do número — o handoff destaca apenas
 * `mortgage30` em accent (laranja) e os demais ficam em ink. O caller
 * (QuadroResumido) decide qual passa.
 *
 * @example
 *   <KpiCell indicator={mortgage30} valueColor="var(--group-taxas)" />
 *   <KpiCell indicator={cs_national} />
 */

import type { CSSProperties, JSX } from 'react';
import type { Indicator } from '../../types';
import { fmtDelta, fmtValue } from '../../lib/format';
import { deltaColorFor, deltaCssVar } from '../../lib/sentiment';

const cellStyle: CSSProperties = {
  padding: 'var(--space-5) var(--space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: '0.16em',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  margin: 0,
};

const valueRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
};

const valueBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-medium)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-medium)',
  lineHeight: 1,
};

const deltaPeriodStyle: CSSProperties = {
  color: 'var(--ink-mute)',
  marginLeft: 'var(--space-2)',
  fontWeight: 400,
};

export interface KpiCellProps {
  indicator: Indicator;
  /** Cor do número principal. Default: `var(--ink)`. */
  valueColor?: string;
}

export function KpiCell({
  indicator,
  valueColor = 'var(--ink)',
}: KpiCellProps): JSX.Element {
  const valueLabel = fmtValue(indicator.value, indicator.fmtSpec);
  const deltaLabel = fmtDelta(indicator.delta, indicator.deltaUnit);
  const deltaCssColor = deltaCssVar(deltaColorFor(indicator));
  const eyebrowId = `kpi-${indicator.id}-label`;

  return (
    <div style={cellStyle} role="group" aria-labelledby={eyebrowId}>
      <span id={eyebrowId} style={eyebrowStyle}>
        {indicator.name}
      </span>
      <div style={valueRowStyle}>
        <span style={{ ...valueBaseStyle, color: valueColor }}>{valueLabel}</span>
        <span
          style={{
            color: deltaCssColor,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {deltaLabel}
          <span style={deltaPeriodStyle}>· {indicator.deltaPeriod}</span>
        </span>
      </div>
    </div>
  );
}
