/**
 * AreaChart — área preenchida + linha sobreposta para visualização de série.
 *
 * Geometria portada de `docs/handoff/dissenha_dashboard/charts.jsx`. Em
 * relação ao handoff, esta versão simplifica:
 *   - sem grid lines / Y ticks / labels textuais (responsabilidade do parent)
 *   - sem `last point dot` (visual mais clean para o Spotlight da Variação D)
 *   - fill via `fillOpacity` em vez de linearGradient (evita dependência de
 *     ID estável e mantém snapshots determinísticos)
 *
 * O Spotlight da Fase 4 envolve este componente em um wrapper que adiciona
 * eixos textuais e marcadores quando necessário.
 *
 * @example
 *   <AreaChart series={mortgage30.series} accent="var(--group-taxas)" />
 */

import type { JSX } from 'react';

const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 120;
const DEFAULT_FILL_OPACITY = 0.18;
const DEFAULT_STROKE_WIDTH = 1.5;

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
}

export function AreaChart({
  series,
  accent = 'var(--accent)',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  showLine = true,
  fillOpacity = DEFAULT_FILL_OPACITY,
  ariaLabel = 'Area chart',
}: AreaChartProps): JSX.Element {
  // Edge: série vazia ou com 1 ponto → linha horizontal ao centro,
  // sem área (não há o que preencher).
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
  const stepX = width / (series.length - 1);

  const points = series.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * height,
  }));

  const linePath = points
    .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

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
    </svg>
  );
}
