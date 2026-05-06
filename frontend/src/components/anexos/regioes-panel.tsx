/**
 * RegioesPanel — Anexo I da Variação D, "Por região censitária".
 * Portado de `variation-d.jsx` linhas 375-394.
 *
 * Estrutura:
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │ ANEXO I                                  [4 regiões] │
 *   │ Por região censitária                                │
 *   ├─────────────────────────────────────────────────────┤
 *   │ Northeast    ▰▰▰▰▰▰░░░░░░░       $478k    +3,8%      │
 *   │ Midwest ●    ▰▰▰▰▰▰▰▰▰▰▰░░       $312k    +4,2%      │
 *   │ South        ▰▰▰▰▰▰▰▰░░░░░       $401k    +5,1%      │
 *   │ West         ▰▰▰▰▰▰▰░░░░░░       $612k    +2,4%      │
 *   └─────────────────────────────────────────────────────┘
 *
 * **HBarSimple inline (thin div)**: o `HBarSimple` da PR 3b é a versão
 * SVG full-row (label + bar + value); aqui o handoff prescreve uma
 * versão thin de 5px com `width: 100%` que ocupa a célula 1fr. Como o
 * uso é específico desta panel (não há reuso esperado), implementamos
 * inline aqui via dois `<div>` em vez de estender `HBarSimple` ou
 * criar um componente compartilhado novo.
 *
 * Cor da barra: `var(--accent)` se `hot`, `var(--ink)` caso contrário —
 * espelha o handoff (linha 389) onde regiões "quentes" recebem accent.
 *
 * Sort: ordem do payload preservada (não sorteia por preço, sales ou yoy
 * — o backend Python entrega numa ordem editorial).
 */

import type { CSSProperties, JSX } from 'react';
import type { Region } from '../../types';
import { Stamp } from '../shell';
import { fmtDelta, fmtPriceK } from '../../lib/format';

const HBAR_MAX_SALES = 2000;
const HBAR_HEIGHT = 5;

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
  gridTemplateColumns: '110px 1fr 90px 70px',
  gap: 14,
  alignItems: 'center',
  padding: '14px 0',
  borderBottom: isLast ? 'none' : 'var(--border-card)',
});

const nameStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const hotDotStyle: CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--accent)',
  flexShrink: 0,
};

const hbarTrackStyle: CSSProperties = {
  width: '100%',
  height: HBAR_HEIGHT,
  background: 'var(--rule-soft)',
  borderRadius: HBAR_HEIGHT / 2,
  overflow: 'hidden',
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

export interface RegioesPanelProps {
  regions: ReadonlyArray<Region>;
}

export function RegioesPanel({ regions }: RegioesPanelProps): JSX.Element {
  return (
    <div style={cardStyle} aria-labelledby="regioes-title">
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Anexo I</div>
          <h3 id="regioes-title" style={titleStyle}>
            Por região censitária
          </h3>
        </div>
        <Stamp>{`${regions.length} ${regions.length === 1 ? 'região' : 'regiões'}`}</Stamp>
      </div>

      <ol style={listStyle}>
        {regions.map((region, i) => {
          const isLast = i === regions.length - 1;
          const ratio = Math.max(0, Math.min(1, region.sales / HBAR_MAX_SALES));
          const fillWidth = `${(ratio * 100).toFixed(2)}%`;
          const fillColor = region.hot ? 'var(--accent)' : 'var(--ink)';
          return (
            <li key={region.name} style={rowStyle(isLast)}>
              <span style={nameStyle}>
                {region.name}
                {region.hot && <span style={hotDotStyle} aria-hidden />}
              </span>
              <div
                style={hbarTrackStyle}
                role="progressbar"
                aria-label={`Vendas em ${region.name}: ${region.sales} mil unidades`}
                aria-valuenow={region.sales}
                aria-valuemin={0}
                aria-valuemax={HBAR_MAX_SALES}
              >
                <div
                  style={{
                    width: fillWidth,
                    height: '100%',
                    background: fillColor,
                  }}
                />
              </div>
              <span style={priceStyle}>{fmtPriceK(region.price)}</span>
              <span style={deltaStyle(region.yoy)}>{fmtDelta(region.yoy, '%')}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
