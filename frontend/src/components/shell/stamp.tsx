/**
 * Stamp — badge editorial pequeno (mono uppercase com borda).
 *
 * Portado de `DStamp` em `variation-d.jsx`. Usado nos headers/footers
 * para etiquetas como "Confidencial", "Atualizado · Ter", "4 destaques".
 *
 * Variantes pré-prontas via prop `variant`:
 *   - 'accent' (default) — laranja sobre fundo escuro do header
 *   - 'muted'            — alpha 0.5 sobre verde, segunda etiqueta
 *
 * Para cores totalmente customizadas, passe `color` (override).
 *
 * @example
 *   <Stamp>Confidencial</Stamp>
 *   <Stamp variant="muted">Atualizado · Ter</Stamp>
 *   <Stamp color="var(--ink)">4 destaques</Stamp>
 */

import type { JSX, ReactNode } from 'react';

export type StampVariant = 'accent' | 'muted';

export interface StampProps {
  children: ReactNode;
  /** Variante de cor pré-definida. Default: 'accent'. */
  variant?: StampVariant;
  /** Override de cor (sobrescreve `variant`). */
  color?: string;
}

const VARIANT_COLOR: Record<StampVariant, string> = {
  accent: 'var(--accent)',
  muted: 'rgba(232, 230, 224, 0.5)',
};

export function Stamp({
  children,
  variant = 'accent',
  color,
}: StampProps): JSX.Element {
  const resolvedColor = color ?? VARIANT_COLOR[variant];

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-label)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: resolvedColor,
        border: `0.75px solid ${resolvedColor}`,
        padding: '3px 8px',
        borderRadius: 'var(--radius-stamp)',
        background: 'transparent',
        display: 'inline-block',
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
}
