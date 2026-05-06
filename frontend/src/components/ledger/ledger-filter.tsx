/**
 * LedgerFilter — pills horizontais (`Todos` + 5 grupos) que ativam/desativam
 * o filtro do Ledger por `Group`. Portado de `variation-d.jsx` linhas 337-348.
 *
 * **Active = `var(--bg-band)` (verde marca)** — não a cor do grupo. Espelha
 * o handoff (botão ativo é uma "ação executada", não uma "marca de categoria").
 * O usuário consulta o feedback de qual grupo está sob foco lendo a label
 * iluminada, não confiando em diferentes acentos por grupo.
 *
 * Labels usam `GROUPS[g].short` (`TAXAS`, `PREÇOS`, etc.) para caber nas
 * pills — divergindo levemente do handoff que usava `GROUPS[g].label`
 * uppercase ("TAXAS & CRÉDITO" etc.). Os labels longos do produto real
 * estourariam a linha em telas com largura padrão.
 *
 * Acessibilidade: tablist + tab + aria-selected.
 */

import type { CSSProperties, JSX } from 'react';
import type { Group } from '../../types';
import { GROUPS, GROUP_ORDER } from '../../lib/groups';

export type LedgerFilterValue = Group | 'all';

interface FilterOption {
  value: LedgerFilterValue;
  label: string;
}

const FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: 'all', label: 'TODOS' },
  ...GROUP_ORDER.map((g) => ({ value: g, label: GROUPS[g].short })),
];

const tablistStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-1)',
  flexWrap: 'wrap',
};

const buttonBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: '0.08em',
  padding: '5px 11px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  borderRadius: 'var(--radius-stamp)',
  lineHeight: 1,
};

const activeStyle: CSSProperties = {
  ...buttonBaseStyle,
  background: 'var(--bg-band)',
  color: 'var(--ink-inverse)',
  border: '0.5px solid var(--bg-band)',
};

const inactiveStyle: CSSProperties = {
  ...buttonBaseStyle,
  background: 'transparent',
  color: 'var(--ink-soft)',
  border: '0.5px solid var(--rule)',
};

export interface LedgerFilterProps {
  active: LedgerFilterValue;
  onChange: (filter: LedgerFilterValue) => void;
}

export function LedgerFilter({ active, onChange }: LedgerFilterProps): JSX.Element {
  return (
    <div role="tablist" aria-label="Filtro de grupo do Ledger" style={tablistStyle}>
      {FILTER_OPTIONS.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            style={isActive ? activeStyle : inactiveStyle}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
