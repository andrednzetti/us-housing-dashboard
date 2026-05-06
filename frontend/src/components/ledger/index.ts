/**
 * Barrel do Ledger — tabela plana de 23 indicadores filtrável.
 *
 * `Ledger` é o único consumido diretamente pelo App.tsx. `LedgerRow` e
 * `LedgerFilter` ficam disponíveis para reuso (ex.: futura tabela
 * compacta no mobile / lista resumida em outro contexto).
 */

export { Ledger } from './ledger';
export type { LedgerProps } from './ledger';

export { LedgerRow, LEDGER_GRID_COLUMNS } from './ledger-row';
export type { LedgerRowProps } from './ledger-row';

export { LedgerFilter } from './ledger-filter';
export type { LedgerFilterProps, LedgerFilterValue } from './ledger-filter';
