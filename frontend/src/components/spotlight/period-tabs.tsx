/**
 * PeriodTabs — 5 pills (1M / 3M / 6M / 1A / 5A) que controlam o slice da
 * `series` exibida no Spotlight. Estilo portado de
 * `variation-d.jsx` linhas 235-245.
 *
 * Active = banda escura (`var(--bg-band)`) + texto inverse. Inactive =
 * transparente + ink-soft + border `var(--rule)`. Sem hover state porque
 * `renderToStaticMarkup` não captura `:hover` — o feedback de pointer
 * fica para uma futura iteração com CSS modules ou inline com classes.
 *
 * Acessibilidade: `role="tablist"` no container e `role="tab"` em cada
 * botão, com `aria-selected` refletindo o estado.
 */

import type { CSSProperties, JSX } from 'react';
import type { Period } from '../../types';

const DEFAULT_PERIODS: Period[] = ['1M', '3M', '6M', '1A', '5A'];

const tablistStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-1)',
};

const buttonBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: '0.06em',
  padding: '4px 10px',
  cursor: 'pointer',
  borderRadius: 'var(--radius-stamp)',
  lineHeight: 1,
};

const activeStyle: CSSProperties = {
  ...buttonBaseStyle,
  background: 'var(--bg-band)',
  color: 'var(--ink-inverse)',
  border: '0.5px solid var(--bg-band)',
};

const inactiveStyle: CSSProperties = {
  ...buttonBaseStyle,
  background: 'transparent',
  color: 'var(--ink-soft)',
  border: '0.5px solid var(--rule)',
};

export interface PeriodTabsProps {
  /** Período ativo. */
  active: Period;
  /** Callback chamado quando o usuário troca o período. */
  onChange: (period: Period) => void;
  /** Lista de períodos a exibir. Default: 1M, 3M, 6M, 1A, 5A. */
  options?: Period[];
}

export function PeriodTabs({
  active,
  onChange,
  options = DEFAULT_PERIODS,
}: PeriodTabsProps): JSX.Element {
  return (
    <div role="tablist" aria-label="Período do gráfico" style={tablistStyle}>
      {options.map((period) => {
        const isActive = period === active;
        return (
          <button
            key={period}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(period)}
            style={isActive ? activeStyle : inactiveStyle}
          >
            {period}
          </button>
        );
      })}
    </div>
  );
}
