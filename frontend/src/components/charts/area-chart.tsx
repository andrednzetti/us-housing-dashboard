/**
 * AreaChart — área preenchida + linha sobreposta para visualização de série.
 *
 * Geometria portada de `docs/handoff/dissenha_dashboard/charts.jsx`. Em
 * relação ao handoff, esta versão simplifica:
 *   - sem `last point dot` (visual mais clean para o Spotlight da Variação D)
 *   - fill via `fillOpacity` em vez de linearGradient (evita dependência de
 *     ID estável e mantém snapshots determinísticos)
 *
 * Grid e Y axis são **opt-in** (defaults `false`). Sem nenhuma das flags
 * ativas, o componente preserva a geometria exata da Fase 3 PR 3b — os
 * snapshots existentes continuam idênticos. Quando `showGrid` ou `showAxis`
 * são ativados, o Spotlight (Fase 4 PR 4c-1) compõe um chart com tom
 * editorial: linhas de referência horizontais + labels formatados via
 * `formatY` na direita do plot.
 *
 * @example
 *   <AreaChart series={mortgage30.series} accent="var(--group-taxas)" />
 *   <AreaChart
 *     series={mortgage30.series}
 *     accent="var(--group-taxas)"
 *     showGrid showAxis
 *     formatY={(v) => fmtValue(v, mortgage30.fmtSpec)}
 *   />
 */

import type { JSX } from 'react';

const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 120;
const DEFAULT_FILL_OPACITY = 0.18;
const DEFAULT_STROKE_WIDTH = 1.5;
const DEFAULT_GRID_LINES = 4;

const AXIS_RESERVE_WIDTH = 48;
const AXIS_GUTTER = 6;
const AXIS_FONT_SIZE = 9;
const AXIS_LABEL_OFFSET_Y = 3;

export interface AreaChartProps {
  /** Pontos da série temporal (ordem cronológica ascendente). */
  series: number[];
  /** Cor do traço e fill. Default: `var(--accent)`. */
  accent?: string;
  /** Largura do SVG em pixels. Default: 360. */
  width?: number;
  /** Altura do SVG em pixels. Default: 120. */
  height?: number;
  /** Renderiza a linha sobre a área. Default: true. */
  showLine?: boolean;
  /** Opacidade do fill da área (0..1). Default: 0.18. */
  fillOpacity?: number;
  /** Override do aria-label. Default: 'Area chart'. */
  ariaLabel?: string;
  /** Mostra grid horizontal de referência. Default: false. */
  showGrid?: boolean;
  /** Mostra labels do eixo Y à direita do plot. Default: false. */
  showAxis?: boolean;
  /** Quantidade de linhas de grid (gera `gridLines + 1` ticks). Default: 4. */
  gridLines?: number;
  /** Formatador opcional para os labels do eixo Y. Default: `value.toFixed(2)`. */
  formatY?: (value: number) => string;
}

const defaultFormatY = (v: number): string => v.toFixed(2);

export function AreaChart({
  series,
  accent = 'var(--accent)',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  showLine = true,
  fillOpacity = DEFAULT_FILL_OPACITY,
  ariaLabel = 'Area chart',
  showGrid = false,
  showAxis = false,
  gridLines = DEFAULT_GRID_LINES,
  formatY = defaultFormatY,
}: AreaChartProps): JSX.Element {
  // Edge: série vazia ou com 1 ponto → linha horizontal ao centro.
  // Quando series < 2 não desenhamos grid/axis (não há escala significativa).
  if (series.length < 2) {
    return (
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={accent}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  // Quando o eixo Y é exibido, reservamos espaço à direita para os labels.
  // Quando `showAxis=false` (default), `innerW === width` — geometria idêntica
  // à versão original da Fase 3 PR 3b, snapshots existentes preservados.
  const innerW = showAxis ? width - AXIS_RESERVE_WIDTH : width;
  const stepX = innerW / (series.length - 1);

  const points = series.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height,
  }));

  const linePath = points
    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');
  const areaPath = `${linePath} L ${innerW} ${height} L 0 ${height} Z`;

  // Grid ticks: posições Y proporcionais entre min (y=height) e max (y=0).
  const ticks: { y: number; value: number }[] = [];
  if (showGrid || showAxis) {
    const safeLines = Math.max(1, gridLines);
    for (let i = 0; i <= safeLines; i += 1) {
      const t = i / safeLines;
      const value = min + range * t;
      const y = height - t * height;
      ticks.push({ y, value });
    }
  }

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      {showGrid &&
        ticks.map((tick, i) => (
          <line
            key={`grid-${i}`}
            x1={0}
            y1={tick.y}
            x2={innerW}
            y2={tick.y}
            stroke="var(--rule-soft)"
            strokeWidth={0.5}
          />
        ))}
      <path d={areaPath} fill={accent} fillOpacity={fillOpacity} stroke="none" />
      {showLine && (
        <path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {showAxis &&
        ticks.map((tick, i) => (
          <text
            key={`axis-${i}`}
            x={innerW + AXIS_GUTTER}
            y={tick.y + AXIS_LABEL_OFFSET_Y}
            fontFamily="var(--font-mono)"
            fontSize={AXIS_FONT_SIZE}
            fill="var(--ink-mute)"
            letterSpacing="0.06em"
          >
            {formatY(tick.value)}
          </text>
        ))}
    </svg>
  );
}
