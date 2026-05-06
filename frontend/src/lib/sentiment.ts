/**
 * Resolve a cor visual de um delta com awareness de `upIsBad`.
 *
 * Convenção padrão (upIsBad=false ou undefined):
 *   delta > 0  →  pos    (verde)
 *   delta < 0  →  neg    (vermelho)
 *   delta == 0 →  neutral
 *
 * Indicadores onde alta é ruim para o mercado (upIsBad=true) — ex.:
 * mortgage rate, unemployment, lumber PPI — invertem a polaridade:
 *   delta > 0  →  neg    (vermelho)
 *   delta < 0  →  pos    (verde)
 *   delta == 0 →  neutral
 *
 * As cores correspondentes vivem em `src/styles/tokens.css`:
 *   pos     → var(--pos)       (#0d3d2e — verde marca)
 *   neg     → var(--neg)       (#a8432b — vermelho tijolo)
 *   neutral → var(--ink-mute)  (#8a8a83 — cinza)
 */

import type { Indicator } from '../types';

/** Cor visual resolvida — abstração tripla acima das CSS vars. */
export type DeltaColor = 'pos' | 'neg' | 'neutral';

/**
 * Resolve `DeltaColor` a partir do valor do delta e da flag `upIsBad`.
 *
 * @param delta  Valor da variação (sinal indica direção).
 * @param upIsBad Flag opcional do indicador. Quando true, inverte a polaridade.
 *
 * @example
 *   resolveDeltaColor(+1.5, false)       // 'pos'  — alta = bom (default)
 *   resolveDeltaColor(-1.5, false)       // 'neg'
 *   resolveDeltaColor(+1.5, true)        // 'neg'  — alta = ruim
 *   resolveDeltaColor(-1.5, true)        // 'pos'
 *   resolveDeltaColor(0,    false)       // 'neutral'
 *   resolveDeltaColor(0,    true)        // 'neutral'
 *   resolveDeltaColor(+1.5)              // 'pos' (upIsBad undefined ≡ false)
 */
export function resolveDeltaColor(delta: number, upIsBad?: boolean): DeltaColor {
  if (delta === 0) return 'neutral';
  const isUp = delta > 0;
  if (upIsBad === true) return isUp ? 'neg' : 'pos';
  return isUp ? 'pos' : 'neg';
}

/**
 * Conveniência: extrai `DeltaColor` direto de um `Indicator`.
 * Equivalente a `resolveDeltaColor(ind.delta, ind.upIsBad)`.
 */
export function deltaColorFor(ind: Indicator): DeltaColor {
  return resolveDeltaColor(ind.delta, ind.upIsBad);
}

/**
 * Mapeia `DeltaColor` para a CSS var correspondente em `tokens.css`.
 * Use em `style={{ color: deltaCssVar(...) }}` ou em strings de styled.
 */
export function deltaCssVar(color: DeltaColor): string {
  switch (color) {
    case 'pos':
      return 'var(--pos)';
    case 'neg':
      return 'var(--neg)';
    case 'neutral':
      return 'var(--ink-mute)';
  }
}
