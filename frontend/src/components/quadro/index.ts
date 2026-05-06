/**
 * Barrel do Quadro Resumido (Variação D).
 *
 * Exporta o container e a célula. O container é o único consumido
 * diretamente pelo App.tsx; a célula fica disponível para casos de
 * reuso editorial fora da grid de 4.
 */

export { QuadroResumido } from './quadro-resumido';
export type { QuadroResumidoProps } from './quadro-resumido';

export { KpiCell } from './kpi-cell';
export type { KpiCellProps } from './kpi-cell';
