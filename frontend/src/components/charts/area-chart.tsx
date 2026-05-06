/**
 * AreaChart — área preenchida + linha sobreposta para visualização de série.
 *
 * Geometria portada de `docs/handoff/dissenha_dashboard/charts.jsx`. Em
 * relação ao handoff, esta versão simplifica:
 *   - sem `last point dot` (visual mais clean para o Spotlight da Variação D)
 *   - fill via `fillOpacity` em vez de linearGradient (evita dependência de
 *     ID estável e mantém snapshots determinísticos)
 *
 * Grid, Y axis e X axis são **opt-in** (defaults `false`). Sem nenhuma das
 * flags ativas, o componente preserva a geometria exata da Fase 3 PR 3b —
 * os snapshots existentes continuam idênticos. Quando ativadas, o
 * Spotlight (Fase 4 PR 4c-1 + housekeeping pré-Fase 5) compõe um chart com
 * tom editorial: grid horizontal + labels Y à direita + tick marks e
 * labels relativas no eixo X.
 *
 * @example
 *   <AreaChart series={mortgage30.series} accent="var(--group-taxas)" />
 *   <AreaChart
 *     series={mortgage30.series}
 *     accent="var(--group-taxas)"
 *     showGrid showAxis showXAxis
 *     xLabels={['−12M', '−9M', '−6M', '−3M', 'HOJE']}
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

const X_AXIS_RESERVE_HEIGHT = 22;
const X_AXIS_TICK_LENGTH = 4;
const X_AXIS_LABEL_OFFSET_Y = 14;

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
  /**
   * Mostra eixo X (linha + tick marks + labels) abaixo do plot. Default: false.
   * Requer `xLabels` com pelo menos 2 entradas para ter efeito visual.
   */
  showXAxis?: boolean;
  /** Labels do eixo X distribuídas igualmente. Default: []. */
  xLabels?: ReadonlyArray<string>;
}

const defaultFormatY = (v: number): string => v.toFixed(2);

const DEFAULT_X_LABELS: ReadonlyArray<string> = [];

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
  showXAxis = false,
  xLabels = DEFAULT_X_LABELS,
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
  // Quando o eixo X é exibido (com labels suficientes), reservamos espaço
  // inferior. Quando ambos `showAxis=false` e `showXAxis=false` (defaults),
  // `innerW === width` e `innerH === height` — geometria idêntica à versão
  // original da Fase 3 PR 3b, snapshots existentes preservados.
  const xAxisActive = showXAxis && xLabels.length >= 2;
  const innerW = showAxis ? width - AXIS_RESERVE_WIDTH : width;
  const innerH = xAxisActive ? height - X_AXIS_RESERVE_HEIGHT : height;
  const stepX = innerW / (series.length - 1);

  const points = series.map((v, i) => ({
    x: i * stepX,
    y: innerH - ((v - min) / range) * innerH,
  }));

  const linePath = points
    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');
  const areaPath = `${linePath} L ${innerW} ${innerH} L 0 ${innerH} Z`;

  // Grid ticks: posições Y proporcionais entre min (y=innerH) e max (y=0).
  const ticks: { y: number; value: number }[] = [];
  if (showGrid || showAxis) {
    const safeLines = Math.max(1, gridLines);
    for (let i = 0; i <= safeLines; i += 1) {
      const t = i / safeLines;
      const value = min + range * t;
      const y = innerH - t * innerH;
      ticks.push({ y, value });
    }
  }

  // X axis ticks: posições X proporcionais entre 0 e innerW para os labels.
  const xTicks: { x: number; label: string }[] = [];
  if (xAxisActive) {
    const denom = xLabels.length - 1;
    xLabels.forEach((label, i) => {
      const x = (i / denom) * innerW;
      xTicks.push({ x, label });
    });
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
      {xAxisActive && (
        <line
          x1={0}
          y1={innerH}
          x2={innerW}
          y2={innerH}
          stroke="var(--rule)"
          strokeWidth={0.5}
        />
      )}
      {xAxisActive &&
        xTicks.map((tick, i) => (
          <line
            key={`xtick-${i}`}
            x1={tick.x}
            y1={innerH}
            x2={tick.x}
            y2={innerH + X_AXIS_TICK_LENGTH}
            stroke="var(--rule)"
            strokeWidth={0.5}
          />
        ))}
      {xAxisActive &&
        xTicks.map((tick, i) => {
          const isFirst = i === 0;
          const isLast = i === xTicks.length - 1;
          const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
          return (
            <text
              key={`xlabel-${i}`}
              x={tick.x}
              y={innerH + X_AXIS_LABEL_OFFSET_Y}
              textAnchor={anchor}
              fontFamily="var(--font-mono)"
              fontSize={AXIS_FONT_SIZE}
              fill="var(--ink-mute)"
              letterSpacing="0.06em"
            >
              {tick.label}
            </text>
          );
        })}
    </svg>
  );
}
