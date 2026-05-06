/**
 * ComposicaoCarteira — aside em banda escura mostrando a distribuição dos
 * indicadores por grupo. Portado de `variation-d.jsx` linhas 300-325.
 *
 * Estrutura:
 *
 *   ┌──────────────────────────────────────┐    ⚙ (DSeal decorativo)
 *   │ COMPOSIÇÃO DA CARTEIRA                 │
 *   │                                          │
 *   │  ╭─────╮  ● Taxas & Crédito        6     │
 *   │ │  23  │ ● Preços                  3     │
 *   │ │      │ ● Oferta & Construção     7     │
 *   │  ╰─────╯  ● Sentimento             3     │
 *   │           ● Macro                  4     │
 *   └──────────────────────────────────────┘
 *
 * Banda escura usa `--bg-band` (verde marca) com texto `--ink-inverse`.
 * O DSeal (selo monograma) decora o canto superior direito com opacidade
 * baixa — espelha o handoff que adiciona um seal de fundo nesta section.
 *
 * O DonutMulti (86x86, thickness 11) tem 5 segments (1 por grupo) com
 * cores `GROUPS[g].accent`. Texto central: total = `file.indicators.length`
 * + sublabel "indicadores".
 */

import type { CSSProperties, JSX } from 'react';
import type { IndicatorsFile } from '../../types';
import { DonutMulti } from '../charts';
import { DissenhaSeal } from '../shell';
import { GROUPS, GROUP_ORDER } from '../../lib/groups';
import { indicatorCountByGroup } from '../../lib/selectors';

const cardStyle: CSSProperties = {
  background: 'var(--bg-band)',
  color: 'var(--ink-inverse)',
  padding: 'var(--space-6)',
  position: 'relative',
  overflow: 'hidden',
};

const sealWrapperStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 80,
  height: 80,
  opacity: 0.1,
  pointerEvents: 'none',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-4)',
};

const bodyStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-5)',
};

const listStyle: CSSProperties = {
  flex: 1,
  fontSize: '0.6875rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const listItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  marginBottom: 5,
};

const dotStyle = (color: string): CSSProperties => ({
  width: 7,
  height: 7,
  background: color,
  borderRadius: 1,
  flexShrink: 0,
});

const labelStyle: CSSProperties = {
  flex: 1,
  color: 'rgba(232, 230, 224, 0.75)',
};

const countStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  color: 'var(--accent)',
};

const DONUT_SIZE = 86;
const DONUT_STROKE = 11;

export interface ComposicaoCarteiraProps {
  file: IndicatorsFile;
}

export function ComposicaoCarteira({ file }: ComposicaoCarteiraProps): JSX.Element {
  const counts = indicatorCountByGroup(file);
  const segments = GROUP_ORDER.map((g) => ({
    id: g,
    value: counts[g],
    color: GROUPS[g].accent,
    label: GROUPS[g].label,
  }));
  const total = file.indicators.length;

  return (
    <div style={cardStyle} aria-labelledby="composicao-title">
      <div style={sealWrapperStyle} aria-hidden>
        <DissenhaSeal size={80} color="var(--accent)" />
      </div>

      <div id="composicao-title" style={eyebrowStyle}>
        Composição da carteira
      </div>

      <div style={bodyStyle}>
        <DonutMulti
          segments={segments}
          centerLabel={String(total)}
          centerSubLabel="indicadores"
          size={DONUT_SIZE}
          strokeWidth={DONUT_STROKE}
          ariaLabel={`Composição: ${total} indicadores em ${segments.length} grupos`}
        />
        <ul style={listStyle}>
          {GROUP_ORDER.map((g) => (
            <li key={g} style={listItemStyle}>
              <span style={dotStyle(GROUPS[g].accent)} aria-hidden />
              <span style={labelStyle}>{GROUPS[g].label}</span>
              <span style={countStyle}>{counts[g]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
