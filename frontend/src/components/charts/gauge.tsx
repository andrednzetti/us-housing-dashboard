/**
 * Gauge — meio-arco (180°) representando valor numa escala [min, max].
 *
 * **Atenção**: este componente é um **redesign** vs `charts.jsx` do handoff,
 * que entregava uma barra horizontal divergente (negativo/positivo a partir
 * do centro). Aqui o formato é o medidor radial clássico — adequado para
 * scores 0-100 (ex.: NAHB HMI, RMI). Se a Fase 4 precisar do formato
 * divergente, vamos adicionar um `GaugeDiverging` ao lado.
 *
 * Geometria: arco semicircular de (cx-r, cy) até (cx+r, cy) passando pelo
 * topo. O fill é proporcional a `(value - min) / (max - min)`, clampado.
 *
 * @example
 *   <Gauge value={67} centerLabel="67" accent="var(--group-sentimento)" />
 *   <Gauge value={3.4} min={0} max={5} />
 */

import type { JSX } from 'react';

const DEFAULT_WIDTH = 180;
const DEFAULT_HEIGHT = 100;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STROKE_WIDTH = 12;
const CENTER_LABEL_RATIO = 0.28;
const LABEL_VERTICAL_OFFSET_RATIO = 0.18;

export interface GaugeProps {
  /** Valor atual. Clampado em `[min, max]`. */
  value: number;
  /** Mínimo da escala. Default: 0. */
  min?: number;
  /** Máximo da escala. Default: 100. */
  max?: number;
  /** Label central. Default: valor arredondado. */
  centerLabel?: string;
  /** Cor do arco preenchido. Default: `var(--accent)`. */
  accent?: string;
  /** Largura. Default: 180. */
  width?: number;
  /** Altura. Default: 100 (proporção 9:5 do meio-arco). */
  height?: number;
  /** Override do aria-label. */
  ariaLabel?: string;
}

export function Gauge({
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  centerLabel,
  accent = 'var(--accent)',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  ariaLabel,
}: GaugeProps): JSX.Element {
  const range = max - min || 1;
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / range;

  const strokeWidth = DEFAULT_STROKE_WIDTH;
  const radius = (width - strokeWidth) / 2;
  const cx = width / 2;
  const cy = height; // base do arco no fundo do viewBox

  // Arco completo (trilho): vai de (cx-r, cy) até (cx+r, cy) passando pelo topo.
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  // Arco parcial: termina em ângulo θ = π·ratio, medido a partir de (cx-r, cy)
  // varrendo no sentido horário (passando pelo topo).
  const theta = Math.PI * ratio;
  const fillEndX = cx - radius * Math.cos(theta);
  const fillEndY = cy - radius * Math.sin(theta);

  const trackPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  const fillPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${fillEndX} ${fillEndY}`;

  const display = centerLabel ?? String(Math.round(clamped));
  const fontSize = Math.min(width, height) * CENTER_LABEL_RATIO;
  const labelY = cy - radius * LABEL_VERTICAL_OFFSET_RATIO;
  const resolvedAriaLabel =
    ariaLabel ?? `Gauge: ${Math.round(clamped)} de ${min} a ${max}`;

  return (
    <svg
      role="img"
      aria-label={resolvedAriaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <path
        d={trackPath}
        fill="none"
        stroke="var(--bg-panel-alt)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {ratio > 0 && (
        <path
          d={fillPath}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--ink)"
        fontFamily="var(--font-serif)"
        fontSize={fontSize}
        fontWeight={400}
      >
        {display}
      </text>
    </svg>
  );
}
