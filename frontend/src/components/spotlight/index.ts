/**
 * Barrel da section Spotlight (Variação D, "indicador da semana").
 *
 * Estrutura desde a Fase 4 PR 4c-3:
 *   - Spotlight (wrapper grid 2-col) — o consumido pelo App.tsx
 *   - SpotlightCard (card principal 1.7fr) — disponível para reuso
 *   - PeriodTabs / CronicaEvents / ComposicaoCarteira — componentes auxiliares
 */

export { Spotlight } from './spotlight';
export type { SpotlightProps } from './spotlight';

export { SpotlightCard } from './spotlight-card';
export type { SpotlightCardProps } from './spotlight-card';

export { PeriodTabs } from './period-tabs';
export type { PeriodTabsProps } from './period-tabs';

export { CronicaEvents } from './cronica-events';
export type { CronicaEventsProps } from './cronica-events';

export { ComposicaoCarteira } from './composicao-carteira';
export type { ComposicaoCarteiraProps } from './composicao-carteira';
