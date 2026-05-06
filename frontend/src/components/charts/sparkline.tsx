/**
 * Sparkline — linha SVG simples para representar tendência de uma série.
 *
 * Geometria portada de `docs/handoff/dissenha_dashboard/charts.jsx` com adaptações:
 *   - props renomeadas (`data`→`series`, `w/h`→`width/height`, `color`→`accent`)
 *   - cores via CSS variables (suporte futuro a tema escuro)
 *   - edge cases (série vazia/único ponto) renderizam linha plana ao centro
 *     em vez de retornar `null` — não quebra layout do consumer
 *
 * @example
 *   <Sparkline series={[3.2, 3.8, 4.1, 4.5]} accent="var(--group-taxas)" />
 */

import type { JSX } from 'react';
import type { Period } from '../../types';

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 40;
const DEFAULT_STROKE_WIDTH = 1.5;

export interface SparklineProps {
  /** Pontos da série temporal (ordem cronológica ascendente). */
  series: number[];
  /** Cor do traço. Default: `var(--ink)`. */
  accent?: string;
  /** Largura do SVG em pixels. Default: 200. */
  width?: number;
  /** Altura do SVG em pixels. Default: 40. */
  height?: number;
  /** Espessura do stroke. Default: 1.5. */
  strokeWidth?: number;
  /** Período de referência — informativo, usado apenas no aria-label. */
  period?: Period;
  /** Override do aria-label. Default sensato baseado em `period`. */
  ariaLabel?: string;
}

export function Sparkline({
  series,
  accent = 'var(--ink)',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  period,
  ariaLabel,
}: SparklineProps): JSX.Element {
  const label = ariaLabel ?? (period ? `Sparkline (período ${period})` : 'Sparkline');

  // Edge: série vazia ou com 1 ponto → linha horizontal ao centro.
  // Valores idênticos (range = 0) também caem aqui via guarda `range || 1`.
  if (series.length < 2) {
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);

  const path = series
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
