/**
 * LedgerRow — uma linha-item da tabela do Ledger. Portado de
 * `variation-d.jsx` linhas 97-122 (`DEntry`).
 *
 * Estrutura: grid 6-col (sem dividers verticais — só linha horizontal
 * no fundo), elementos:
 *
 *   ●  COD       Indicador name (serif 14)    valor mono     +0,07pp · sem    ▁▂▃▅▇
 *   dot mono                                   right          right            sparkline
 *
 * Render como `<button>` semântico (não `<div>` + `role=button`) para
 * herdar focusable nativo + Enter/Space handlers do browser. Reset visual
 * de button (border:none, bg:transparent, padding:0, text-align:left,
 * width:100%, cursor:pointer) — fica visualmente uma row, mas é
 * tecnicamente um button.
 *
 * Cor da Sparkline: usa `deltaColorFor(ind)` (sentiment-aware com
 * `upIsBad`), que diverge ligeiramente do handoff (que usa só
 * `delta >= 0 ? pos : neg`). Isso é mais semântico — para mortgage30
 * com delta+ (taxa subindo = ruim), a sparkline aparece em vermelho,
 * batendo com o delta colorido.
 *
 * Estado `isSelected=true`: bg `var(--rule-soft)` (espelha handoff).
 * Hover: skipado neste PR — `:hover` em inline styles não funciona;
 * follow-up em CSS classes futuras.
 */

import type { CSSProperties, JSX } from 'react';
import type { Indicator } from '../../types';
import { Sparkline } from '../charts';
import { fmtDelta, fmtValue } from '../../lib/format';
import { GROUPS } from '../../lib/groups';
import { deltaColorFor, deltaCssVar } from '../../lib/sentiment';

export const LEDGER_GRID_COLUMNS = '16px 110px 1fr 110px 130px 100px';

const SPARKLINE_W = 100;
const SPARKLINE_H = 18;
const SPARKLINE_STROKE = 1.1;

const rowBaseStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: LEDGER_GRID_COLUMNS,
  gap: 14,
  alignItems: 'center',
  padding: '12px 22px',
  borderBottom: '0.5px solid var(--rule)',
  background: 'transparent',
  border: 0,
  borderBottomWidth: 0.5,
  borderBottomStyle: 'solid',
  borderBottomColor: 'var(--rule)',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  color: 'var(--ink)',
  margin: 0,
};

const rowSelectedStyle: CSSProperties = {
  ...rowBaseStyle,
  background: 'var(--rule-soft)',
};

const dotStyle = (accent: string): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: accent,
  display: 'inline-block',
});

const codeCellStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  color: 'var(--ink-mute)',
  letterSpacing: '0.12em',
};

const nameCellStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-body)',
  color: 'var(--ink)',
};

const valueCellStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-table)',
  fontWeight: 500,
  color: 'var(--ink)',
  textAlign: 'right',
};

const deltaCellStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  fontWeight: 500,
  textAlign: 'right',
  whiteSpace: 'nowrap',
};

const deltaPeriodStyle: CSSProperties = {
  color: 'var(--ink-mute)',
  marginLeft: 'var(--space-1)',
  fontWeight: 400,
};

export interface LedgerRowProps {
  indicator: Indicator;
  isSelected: boolean;
  onClick: () => void;
}

export function LedgerRow({ indicator, isSelected, onClick }: LedgerRowProps): JSX.Element {
  const accent = GROUPS[indicator.group].accent;
  const valueLabel = fmtValue(indicator.value, indicator.fmtSpec);
  const deltaLabel = fmtDelta(indicator.delta, indicator.deltaUnit);
  const deltaCssColor = deltaCssVar(deltaColorFor(indicator));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isSelected ? 'true' : undefined}
      style={isSelected ? rowSelectedStyle : rowBaseStyle}
    >
      <span style={dotStyle(accent)} aria-hidden />
      <span style={codeCellStyle}>{indicator.short}</span>
      <span style={nameCellStyle}>{indicator.name}</span>
      <span style={valueCellStyle}>{valueLabel}</span>
      <span style={{ ...deltaCellStyle, color: deltaCssColor }}>
        {deltaLabel}
        <span style={deltaPeriodStyle}>· {indicator.deltaPeriod}</span>
      </span>
      <Sparkline
        series={indicator.series}
        accent={deltaCssColor}
        width={SPARKLINE_W}
        height={SPARKLINE_H}
        strokeWidth={SPARKLINE_STROKE}
        ariaLabel={`Tendência 52 semanas de ${indicator.name}`}
      />
    </button>
  );
}
