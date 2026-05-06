/**
 * MetrosPanel — Anexo II da Variação D, "Top metros · Sun Belt".
 * Portado de `variation-d.jsx` linhas 395-415.
 *
 * Estrutura:
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ ANEXO II                          [8 cidades]   │
 *   │ Top metros · Sun Belt                            │
 *   ├────────────────────────────────────────────────┤
 *   │ 01  Tampa, FL ●         $392k    +6,8%    28d   │
 *   │ 02  Charlotte, NC ●     $385k    +5,4%    32d   │
 *   │ 03  Phoenix, AZ         $458k    +4,2%    41d   │
 *   │ ...                                              │
 *   └────────────────────────────────────────────────┘
 *
 * Diferente do Anexo I (Regiões), aqui **não há HBarSimple** — o handoff
 * prescreve um ranking textual com 5 colunas: rank zero-padded · nome +
 * dot hot · preço · YoY · DOM. As proporções relativas dos preços
 * importam menos do que a ordem editorial Sun Belt (Tampa primeiro).
 *
 * Sort: ordem do payload preservada via `selectTopMetros` (que apenas
 * faz slice). O backend Python entrega já em ordem editorial.
 */

import type { CSSProperties, JSX } from 'react';
import type { Metro } from '../../types';
import { Stamp } from '../shell';
import { fmtDelta, fmtPriceK } from '../../lib/format';
import { DEFAULT_TOP_METROS } from '../../lib/selectors';

const cardStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  padding: 'var(--space-7)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: 'var(--space-5)',
  paddingBottom: 'var(--space-3)',
  borderBottom: 'var(--border-card)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '1.125rem',
  fontWeight: 500,
  margin: '2px 0 0',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const rowStyle = (isLast: boolean): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '20px 1fr 80px 60px 50px',
  gap: 12,
  alignItems: 'center',
  padding: '11px 0',
  borderBottom: isLast ? 'none' : '0.5px solid var(--rule-soft)',
});

const rankStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
};

const nameStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-body)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--ink)',
};

const hotDotStyle: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--accent)',
  flexShrink: 0,
};

const priceStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  textAlign: 'right',
  color: 'var(--ink)',
};

const deltaStyle = (yoy: number): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  textAlign: 'right',
  fontWeight: 500,
  color:
    yoy > 0 ? 'var(--pos)' : yoy < 0 ? 'var(--neg)' : 'var(--ink-mute)',
});

const domStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  color: 'var(--ink-mute)',
  textAlign: 'right',
};

export interface MetrosPanelProps {
  metros: ReadonlyArray<Metro>;
  /** Quantos metros mostrar. Default: 8 (constante `DEFAULT_TOP_METROS`). */
  topN?: number;
}

export function MetrosPanel({
  metros,
  topN = DEFAULT_TOP_METROS,
}: MetrosPanelProps): JSX.Element {
  // Preserva ordem do payload — slice apenas para limitar a topN.
  // O selector `selectTopMetros` (em src/lib/selectors.ts) tem a mesma
  // semântica e é destinado a usos externos que partem de IndicatorsFile.
  const top = metros.slice(0, topN);
  const totalCount = metros.length;
  const cidadesLabel = totalCount === 1 ? '1 cidade' : `${totalCount} cidades`;

  return (
    <div style={cardStyle} aria-labelledby="metros-title">
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Anexo II</div>
          <h3 id="metros-title" style={titleStyle}>
            Top metros · Sun Belt
          </h3>
        </div>
        <Stamp>{cidadesLabel}</Stamp>
      </div>

      <ol style={listStyle}>
        {top.map((metro, i) => {
          const isLast = i === top.length - 1;
          const rank = String(i + 1).padStart(2, '0');
          return (
            <li key={metro.name} style={rowStyle(isLast)}>
              <span style={rankStyle}>{rank}</span>
              <span style={nameStyle}>
                {metro.name}
                {metro.hot && <span style={hotDotStyle} aria-hidden />}
              </span>
              <span style={priceStyle}>{fmtPriceK(metro.price)}</span>
              <span style={deltaStyle(metro.yoy)}>{fmtDelta(metro.yoy, '%')}</span>
              <span style={domStyle}>{metro.dom}d</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
