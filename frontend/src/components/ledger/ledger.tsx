/**
 * Ledger — tabela plana com 23 indicadores agrupados por filtro.
 * Portado de `variation-d.jsx` linhas 329-371.
 *
 * Estrutura:
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ DISCRIMINAÇÃO · 23 ITENS                  [TODOS][TAXAS][...]    │
 *   │ Os 23 indicadores                                                  │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │       CÓDIGO    INDICADOR        VALOR    VARIAÇÃO   TENDÊNCIA   │  ← header row (rule-soft)
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ ●    30Y MORT   Mortgage 30Y...  6,30%    +0,07pp   ━━━━━━━━━     │  ← LedgerRow (button)
 *   │ ●    15Y MORT   Mortgage 15Y...  ...      ...       ...           │
 *   │ ...                                                                │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * **Lista plana** — sem `<h3>` ou separadores entre grupos. O filtro
 * controla quais grupos aparecem. Ordem é a do `IndicatorsFile.indicators`
 * (que respeita a ordem canônica do `INDICATORS_META` no backend).
 *
 * Estado interno: `filter` (default `'all'`). O `selected` vem como prop —
 * o App.tsx é dono desse estado e o Spotlight reage à mesma fonte.
 */

import { useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import type { Indicator, IndicatorsFile } from '../../types';
import { LedgerFilter, type LedgerFilterValue } from './ledger-filter';
import { LedgerRow, LEDGER_GRID_COLUMNS } from './ledger-row';

const sectionStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  padding: 'var(--space-6) var(--space-7) var(--space-4)',
  borderBottom: 'var(--border-card)',
  gap: 'var(--space-4)',
  flexWrap: 'wrap',
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
  fontSize: '1.5rem',
  fontWeight: 500,
  letterSpacing: 'var(--ls-card)',
  margin: 'var(--space-1) 0 0',
};

const tableHeaderRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: LEDGER_GRID_COLUMNS,
  gap: 14,
  padding: '10px 22px',
  background: 'var(--rule-soft)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: '0.16em',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  borderBottom: 'var(--border-card)',
};

const headerCellRightStyle: CSSProperties = { textAlign: 'right' };

const emptyStateStyle: CSSProperties = {
  padding: 'var(--space-8) var(--space-7)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--ls-label)',
  textAlign: 'center',
};

function pluralizeItens(n: number): string {
  return `${n} ${n === 1 ? 'item' : 'itens'}`;
}

export interface LedgerProps {
  file: IndicatorsFile;
  /** Indicador atualmente em foco (espelhado pelo Spotlight). */
  selected: Indicator | null;
  /** Callback quando o usuário clica em uma linha. */
  onSelect: (indicator: Indicator) => void;
}

export function Ledger({ file, selected, onSelect }: LedgerProps): JSX.Element {
  const [filter, setFilter] = useState<LedgerFilterValue>('all');

  const filteredIndicators =
    filter === 'all' ? file.indicators : file.indicators.filter((i) => i.group === filter);

  const totalLabel = `Os ${file.indicators.length} indicadores`;

  return (
    <section style={sectionStyle} aria-labelledby="ledger-title">
      <div style={sectionHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>Discriminação · {pluralizeItens(filteredIndicators.length)}</div>
          <h2 id="ledger-title" style={titleStyle}>
            {totalLabel}
          </h2>
        </div>
        <LedgerFilter active={filter} onChange={setFilter} />
      </div>

      <div role="row" style={tableHeaderRowStyle}>
        <span aria-hidden />
        <span role="columnheader">Código</span>
        <span role="columnheader">Indicador</span>
        <span role="columnheader" style={headerCellRightStyle}>
          Valor
        </span>
        <span role="columnheader" style={headerCellRightStyle}>
          Variação
        </span>
        <span role="columnheader">Tendência 52s</span>
      </div>

      {filteredIndicators.length === 0 ? (
        <div style={emptyStateStyle}>Nenhum indicador no grupo selecionado</div>
      ) : (
        filteredIndicators.map((ind) => (
          <LedgerRow
            key={ind.id}
            indicator={ind}
            isSelected={selected?.id === ind.id}
            onClick={() => onSelect(ind)}
          />
        ))
      )}
    </section>
  );
}
