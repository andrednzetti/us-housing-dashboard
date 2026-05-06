/**
 * Donut — anel circular representando uma fração 0..100% de um todo.
 *
 * **Atenção**: este componente é um **redesign single-value** vs `charts.jsx`
 * do handoff, que entregava um donut multi-segment (`segments[]`). A versão
 * aqui é mais focada — usada quando o consumer quer mostrar 1 valor (ex.: %
 * dos indicadores num determinado estado, score 0-100). Se a Fase 4 precisar
 * de composição multi-segment, vamos adicionar um `DonutMulti` ao lado.
 *
 * Implementação: dois `<circle>` concêntricos. Um trilho cinza, outro arco
 * preenchido via `strokeDasharray`. Inicia em 12h (rotate -90°).
 *
 * @example
 *   <Donut value={34} accent="var(--group-oferta)" />
 *   <Donut value={67} centerLabel="67/100" size={140} />
 */

import type { JSX } from 'react';

const DEFAULT_SIZE = 120;
const DEFAULT_STROKE_WIDTH = 12;
const CENTER_LABEL_RATIO = 0.22;

export interface DonutProps {
  /** Valor do segmento, percentagem 0..100. Valores fora são clampados. */
  value: number;
  /** Label central. Default: `${value}%`. */
  centerLabel?: string;
  /** Cor do arco preenchido. Default: `var(--accent)`. */
  accent?: string;
  /** Tamanho (lado do quadrado SVG). Default: 120. */
  size?: number;
  /** Espessura do anel. Default: 12. */
  strokeWidth?: number;
  /** Override do aria-label. */
  ariaLabel?: string;
}

export function Donut({
  value,
  centerLabel,
  accent = 'var(--accent)',
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  ariaLabel,
}: DonutProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (circumference * clamped) / 100;
  const remaining = circumference - filled;
  const display = centerLabel ?? `${Math.round(clamped)}%`;
  const fontSize = size * CENTER_LABEL_RATIO;
  const resolvedAriaLabel = ariaLabel ?? `Donut: ${Math.round(clamped)}%`;

  return (
    <svg
      role="img"
      aria-label={resolvedAriaLabel}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--bg-panel-alt)"
        strokeWidth={strokeWidth}
      />
      {clamped > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${remaining}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text
        x={cx}
        y={cy}
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
