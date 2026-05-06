/**
 * HBarSimple — barra horizontal com label + barra proporcional + valor.
 *
 * **Atenção**: este componente é um **redesign** vs `charts.jsx` do handoff,
 * que entregava apenas uma DIV thin de progresso (4px) sem label/valor.
 * A versão SVG aqui é o que será consumido pelos rankings dos Anexos
 * (Regions na Fase 4d e Top Metros) — composição mais rica, layout fixo:
 *
 *   ┌──────────────────────┬──────────────────────────┬───────────┐
 *   │ Label (sans-serif)   │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱     │ valor mono│
 *   └──────────────────────┴──────────────────────────┴───────────┘
 *
 * @example
 *   <HBarSimple label="Northeast" value={418} max={1000} accent="var(--group-precos)" />
 */

import type { JSX } from 'react';

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 32;
const BAR_THICKNESS = 8;
const LABEL_RATIO = 0.32;
const VALUE_RATIO = 0.18;
const SECTION_GUTTER = 8;
const TEXT_FONT_SIZE = 12;

export interface HBarSimpleProps {
  /** Valor a representar. */
  value: number;
  /** Máximo da escala. Se ≤ 0, barra é renderizada vazia. */
  max: number;
  /** Label à esquerda (opcional). */
  label?: string;
  /** Label do valor exibido à direita. Se omitido, usa `value` direto. */
  valueLabel?: string;
  /** Cor da barra preenchida. Default: `var(--ink)`. */
  accent?: string;
  /** Largura total do componente. Default: 280. */
  width?: number;
  /** Altura. Default: 32. */
  height?: number;
  /** Override do aria-label. */
  ariaLabel?: string;
}

export function HBarSimple({
  value,
  max,
  label,
  valueLabel,
  accent = 'var(--ink)',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  ariaLabel,
}: HBarSimpleProps): JSX.Element {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const labelWidth = label !== undefined ? width * LABEL_RATIO : 0;
  const valueWidth = width * VALUE_RATIO;
  const barX = labelWidth + (label !== undefined ? SECTION_GUTTER / 2 : 0);
  const barAvailable = Math.max(0, width - barX - valueWidth - SECTION_GUTTER / 2);
  const barFilled = barAvailable * ratio;
  const barY = height / 2 - BAR_THICKNESS / 2;
  const valueDisplay = valueLabel ?? String(value);

  const resolvedAriaLabel =
    ariaLabel ??
    (label !== undefined
      ? `${label}: ${valueDisplay} de ${max}`
      : `Barra: ${valueDisplay} de ${max}`);

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
      {label !== undefined && (
        <text
          x={0}
          y={height / 2}
          dominantBaseline="middle"
          fill="var(--ink-soft)"
          fontFamily="var(--font-sans)"
          fontSize={TEXT_FONT_SIZE}
        >
          {label}
        </text>
      )}
      <rect
        x={barX}
        y={barY}
        width={barAvailable}
        height={BAR_THICKNESS}
        fill="var(--bg-panel-alt)"
      />
      {barFilled > 0 && (
        <rect x={barX} y={barY} width={barFilled} height={BAR_THICKNESS} fill={accent} />
      )}
      <text
        x={width}
        y={height / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fill="var(--ink)"
        fontFamily="var(--font-mono)"
        fontSize={TEXT_FONT_SIZE}
      >
        {valueDisplay}
      </text>
    </svg>
  );
}
