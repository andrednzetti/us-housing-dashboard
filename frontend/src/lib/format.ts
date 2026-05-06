/**
 * Formatadores numéricos com locale pt-BR.
 *
 * Mantém o mesmo comportamento do mock `data.jsx` do Handoff: vírgula
 * decimal, ponto como separador de milhar.
 *
 * Os helpers são puros e independentes — `fmtValue` é o dispatcher
 * declarativo que recebe um `FmtSpec` (campo `Indicator.fmtSpec`).
 */

import type { FmtSpec } from '../types';

/** Default decimals for `fmtPct` quando o spec não especifica. */
const PCT_DEFAULT_DECIMALS = 2;

/** Default decimals para `fmtNum` quando o spec não especifica. */
const NUM_DEFAULT_DECIMALS = 1;

/**
 * Formata um valor absoluto como percentual em locale pt-BR (vírgula
 * decimal). **Sem sinal** — `fmtPct` é para o valor presente do indicador
 * (ex.: taxa atual da mortgage). Para variações com sinal explícito, use
 * `fmtDelta`.
 *
 * @example
 *   fmtPct(0.18)     // '0,18%'
 *   fmtPct(-0.18)    // '-0,18%'    (sinal natural da locale)
 *   fmtPct(2.4, 1)   // '2,4%'
 *   fmtPct(0)        // '0,00%'
 *   fmtPct(6.3)      // '6,30%'
 */
export function fmtPct(value: number, decimals: number = PCT_DEFAULT_DECIMALS): string {
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted}%`;
}

/**
 * Formata um número com locale pt-BR (vírgula decimal, ponto milhar).
 *
 * @example
 *   fmtNum(1382)        // '1.382'
 *   fmtNum(218.4, 1)    // '218,4'
 *   fmtNum(0.5, 2)      // '0,5'  (trailing zero removido)
 */
export function fmtNum(value: number, decimals: number = NUM_DEFAULT_DECIMALS): string {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

/**
 * Formata um valor monetário em USD com prefixo `US$`.
 *
 * @example
 *   fmtUSD(412300)   // 'US$ 412.300'
 *   fmtUSD(0)        // 'US$ 0'
 */
export function fmtUSD(value: number): string {
  const number = value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return `US$ ${number}`;
}

/**
 * Formata um número usando sufixo `k` para milhares.
 * Valores < 1000 são exibidos como inteiros sem sufixo.
 *
 * @example
 *   fmtK(1382)   // '1.4k'
 *   fmtK(218)    // '218'
 *   fmtK(999)    // '999'
 *   fmtK(1000)   // '1.0k'
 */
export function fmtK(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
}

/**
 * Dispatcher declarativo: aplica a formatação correta com base no `FmtSpec`.
 *
 * Usado em todos os pontos do dashboard que precisam exibir um valor de
 * indicador (KPI, ledger, spotlight, eixos do gráfico).
 *
 * @example
 *   fmtValue(412300, { type: 'usd' })             // 'US$ 412.300'
 *   fmtValue(6.42,   { type: 'pct', decimals: 2 }) // '+6.42%'
 *   fmtValue(1382,   { type: 'k' })               // '1.4k'
 *   fmtValue(218.4,  { type: 'num', decimals: 1 }) // '218,4'
 */
export function fmtValue(value: number, spec: FmtSpec): string {
  switch (spec.type) {
    case 'pct':
      return fmtPct(value, spec.decimals);
    case 'usd':
      return fmtUSD(value);
    case 'num':
      return fmtNum(value, spec.decimals);
    case 'k':
      return fmtK(value);
  }
}

/**
 * Formata o delta de um indicador inline com unidade — espelha o `DDelta`
 * do handoff (variation-d.jsx linhas 85-95):
 *
 *   - Sinal: `+` quando positivo, `−` (U+2212) quando negativo, `±` quando zero.
 *     O caractere `−` (minus matemático, U+2212) é tipograficamente correto e
 *     bate com o tom editorial do produto. ASCII `-` (hífen) NÃO é usado.
 *   - Locale pt-BR (vírgula decimal).
 *   - Decimais: mínimo 1, máximo 2 — flexível com a precisão real do número.
 *   - Sem espaço entre número e unidade (ex.: `+0,18pp`, `−0,6m`, `±0,0pts`).
 *
 * Para a cor visual sentiment-aware, combine com `deltaColorFor(indicator)`
 * de `sentiment.ts`.
 *
 * @example
 *   fmtDelta(0.18, 'pp')     // '+0,18pp'
 *   fmtDelta(-0.6,  'm')     // '−0,6m'
 *   fmtDelta(0,     'pts')   // '±0,0pts'
 *   fmtDelta(0.66,  '% a.a.') // '+0,66% a.a.'
 */
export function fmtDelta(value: number, unit: string): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  const abs = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
  return `${sign}${abs}${unit}`;
}
