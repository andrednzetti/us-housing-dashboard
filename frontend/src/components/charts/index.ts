/**
 * Barrel das primitivas de gráfico SVG da Variação D.
 *
 * Ponto único de import: `import { Sparkline, AreaChart, ... } from '../components/charts';`
 *
 * Componentes disponíveis (todos zero-deps externas):
 *   - Sparkline   — linha de tendência (uso: ledger, KPI cards)
 *   - AreaChart   — área preenchida + linha (uso: Spotlight)
 *   - HBarSimple  — barra horizontal com label/valor (uso: Anexos rankings)
 *   - Donut       — anel single-value 0-100% (uso: composição/score)
 *   - Gauge       — meio-arco 180° (uso: NAHB HMI, RMI)
 *
 * Geometria portada de `docs/handoff/dissenha_dashboard/charts.jsx`.
 * Sparkline e AreaChart preservam a geometria original; HBarSimple, Donut
 * e Gauge são redesigns prescritos pelo plano da Fase 3 PR 3b.
 */

export { Sparkline } from './sparkline';
export type { SparklineProps } from './sparkline';

export { AreaChart } from './area-chart';
export type { AreaChartProps } from './area-chart';

export { HBarSimple } from './h-bar-simple';
export type { HBarSimpleProps } from './h-bar-simple';

export { Donut } from './donut';
export type { DonutProps } from './donut';

export { Gauge } from './gauge';
export type { GaugeProps } from './gauge';
