/**
 * DonutMulti — anel circular com múltiplos segmentos proporcionais.
 *
 * Portado de `docs/handoff/dissenha_dashboard/charts.jsx` (componente
 * `Donut` original com `segments[]`). Diferente do `Donut` single-value
 * adicionado na Fase 3 PR 3b: este aqui é a versão multi-segmento usada
 * na "Composição da carteira" (aside da banda escura no Spotlight).
 *
 * Implementação: cada segment é um `<circle>` com `strokeDasharray`
 * proporcional à sua fração do total. O acumulado da posição é
 * controlado via `strokeDashoffset`. O `transform="rotate(-90)"` em
 * cada circle inicia o desenho às 12h em vez de 3h (convenção SVG).
 *
 * `gap` (default 0.02 = ~2% do círculo) cria pequenos espaços entre
 * segments, melhor legibilidade quando há cores próximas.
 *
 * Edge: `segments=[]` renderiza apenas o trilho de fundo.
 *
 * @example
 *   <DonutMulti
 *     segments={GROUP_ORDER.map(g => ({
 *       id: g,
 *       value: counts[g],
 *       color: GROUPS[g].accent,
 *       label: GROUPS[g].label,
 *     }))}
 *   />
 */

import type { JSX } from 'react';

const DEFAULT_SIZE = 160;
const DEFAULT_STROKE_WIDTH = 16;
const DEFAULT_GAP = 0.02;
const CENTER_LABEL_RATIO = 0.18;
const CENTER_SUBLABEL_RATIO = 0.085;

export interface DonutMultiSegment {
  /** Identificador único — usado como key React. */
  id: string;
  /** Valor numérico do segmento (proporção computada vs total). */
  value: number;
  /** Cor do arco (CSS var ou hex). */
  color: string;
  /** Label opcional para a11y do segment. */
  label?: string;
}

export interface DonutMultiProps {
  segments: ReadonlyArray<DonutMultiSegment>;
  /** Texto central principal. Default: total dos segments. */
  centerLabel?: string;
  /** Texto secundário central, abaixo do principal. */
  centerSubLabel?: string;
  /** Tamanho do SVG (lado do quadrado). Default: 160. */
  size?: number;
  /** Espessura do anel. Default: 16. */
  strokeWidth?: number;
  /**
   * Gap proporcional entre segments (0..0.5). Default: 0.02 (2% do círculo).
   * 0 = sem gap.
   */
  gap?: number;
  /** Override do aria-label. */
  ariaLabel?: string;
}

export function DonutMulti({
  segments,
  centerLabel,
  centerSubLabel,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  gap = DEFAULT_GAP,
  ariaLabel,
}: DonutMultiProps): JSX.Element {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const display = centerLabel ?? String(total);
  const labelFontSize = size * CENTER_LABEL_RATIO;
  const subLabelFontSize = size * CENTER_SUBLABEL_RATIO;
  const resolvedAriaLabel = ariaLabel ?? `Donut multi-segmento: ${total} no total`;

  // Computa o offset acumulado para cada segment (em frações 0..1).
  let acc = 0;
  const renderedSegments = total > 0
    ? segments.map((segment) => {
        const frac = segment.value / total;
        const len = Math.max(0, circumference * frac - circumference * gap);
        const off = circumference * acc;
        acc += frac;
        return { segment, len, off };
      })
    : [];

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
        strokeOpacity={0.25}
      />
      {renderedSegments.map(({ segment, len, off }) => (
        <circle
          key={segment.id}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${len} ${circumference}`}
          strokeDashoffset={-off}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
        >
          {segment.label !== undefined && <title>{`${segment.label}: ${segment.value}`}</title>}
        </circle>
      ))}
      {centerLabel !== undefined || total > 0 ? (
        <text
          x={cx}
          y={centerSubLabel !== undefined ? cy - subLabelFontSize * 0.4 : cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ink-inverse)"
          fontFamily="var(--font-serif)"
          fontSize={labelFontSize}
          fontWeight={400}
        >
          {display}
        </text>
      ) : null}
      {centerSubLabel !== undefined && (
        <text
          x={cx}
          y={cy + labelFontSize * 0.55}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ink-inverse)"
          fontFamily="var(--font-mono)"
          fontSize={subLabelFontSize}
          letterSpacing="0.12em"
          opacity={0.7}
        >
          {centerSubLabel}
        </text>
      )}
    </svg>
  );
}
