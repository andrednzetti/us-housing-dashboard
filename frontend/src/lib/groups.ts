/**
 * Catálogo de groups — fonte única de verdade para labels visíveis e
 * cores de cada grupo no dashboard (Variação D).
 *
 * As cores `accent` referenciam tokens CSS definidos em
 * `src/styles/tokens.css` (--group-*), mantendo sintonia com o Handoff.
 */

import type { Group } from '../types';

export interface GroupMeta {
  /** ID interno (snake_case lowercase). */
  id: Group;
  /** Label completo em PT-BR para uso editorial. Ex.: `Taxas & Crédito`. */
  label: string;
  /** Label uppercase curto em PT-BR para botões/badges. Ex.: `TAXAS`. */
  short: string;
  /** Cor accent — referência a CSS var. Ex.: `var(--group-taxas)`. */
  accent: string;
}

/**
 * Catálogo principal. Acessado por chave ou via `GROUP_ORDER` para
 * iteração ordenada.
 */
export const GROUPS: Record<Group, GroupMeta> = {
  taxas: {
    id: 'taxas',
    label: 'Taxas & Crédito',
    short: 'TAXAS',
    accent: 'var(--group-taxas)',
  },
  precos: {
    id: 'precos',
    label: 'Preços',
    short: 'PREÇOS',
    accent: 'var(--group-precos)',
  },
  oferta: {
    id: 'oferta',
    label: 'Oferta & Construção',
    short: 'OFERTA',
    accent: 'var(--group-oferta)',
  },
  sentimento: {
    id: 'sentimento',
    label: 'Sentimento & Atividade',
    short: 'SENTIMENTO',
    accent: 'var(--group-sentimento)',
  },
  macro: {
    id: 'macro',
    label: 'Macro & Acessibilidade',
    short: 'MACRO',
    accent: 'var(--group-macro)',
  },
};

/**
 * Ordem canônica de exibição nos filtros do ledger e composição do donut.
 * Reflete a sequência editorial da Variação D.
 */
export const GROUP_ORDER: ReadonlyArray<Group> = [
  'taxas',
  'precos',
  'oferta',
  'sentimento',
  'macro',
];
