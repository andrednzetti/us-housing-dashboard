/**
 * Marcas Dissenha Moulding — wordmark e selo decorativo.
 *
 * Portados de `docs/handoff/dissenha_dashboard/variation-d.jsx` (componentes
 * `DLogo` e `DSeal`). Usados no Header (wordmark) e no Footer (selo).
 *
 * O selo é puramente decorativo (`role="presentation"` para evitar ruído em
 * leitores de tela). O wordmark usa texto real para manter selecionável,
 * pesquisável, e reflowable se a fonte demorar pra carregar.
 *
 * @example
 *   <DissenhaWordmark height={48} />
 *   <DissenhaSeal size={28} />
 */

import type { JSX } from 'react';

const DEFAULT_WORDMARK_HEIGHT = 42;
const DEFAULT_SEAL_SIZE = 36;
const WORDMARK_FONT_RATIO = 0.42;

export interface DissenhaWordmarkProps {
  /** Altura total do wordmark em px. Define fontSize via ratio interno. */
  height?: number;
  /** Cor das duas linhas. Default: `var(--accent)`. */
  color?: string;
}

export function DissenhaWordmark({
  height = DEFAULT_WORDMARK_HEIGHT,
  color = 'var(--accent)',
}: DissenhaWordmarkProps): JSX.Element {
  const fontSize = height * WORDMARK_FONT_RATIO;
  const lineStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color,
    textTransform: 'uppercase' as const,
    lineHeight: 1,
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1 }}
      aria-label="Dissenha Moulding"
    >
      <span style={lineStyle} aria-hidden>
        Dissenha
      </span>
      <span style={lineStyle} aria-hidden>
        Moulding
      </span>
    </div>
  );
}

export interface DissenhaSealProps {
  /** Lado do selo quadrado em px. Default: 36. */
  size?: number;
  /** Cor primária dos paths. Default: `var(--accent)`. */
  color?: string;
}

/**
 * Selo monograma estilizado — três formas angulares evocando aparas de
 * madeira (left wedge, central vertical+chevron, right wedge mirrored).
 * Decorativo: não precisa de aria-label.
 */
export function DissenhaSeal({
  size = DEFAULT_SEAL_SIZE,
  color = 'var(--accent)',
}: DissenhaSealProps): JSX.Element {
  return (
    <svg
      role="presentation"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block' }}
    >
      {/* Aparas esquerda */}
      <path d="M 8 38 L 30 34 L 26 50 L 4 54 Z" fill={color} />
      <path d="M 4 54 L 26 50 L 22 60 L 8 62 Z" fill={color} fillOpacity={0.75} />
      {/* Aparas direita (espelhada) */}
      <path d="M 92 38 L 70 34 L 74 50 L 96 54 Z" fill={color} />
      <path d="M 96 54 L 74 50 L 78 60 L 92 62 Z" fill={color} fillOpacity={0.75} />
      {/* Centro: barra vertical */}
      <rect x="46" y="18" width="8" height="46" fill={color} />
      {/* Centro: chevron base */}
      <path d="M 34 64 L 50 50 L 66 64 L 60 70 L 50 60 L 40 70 Z" fill={color} />
    </svg>
  );
}
