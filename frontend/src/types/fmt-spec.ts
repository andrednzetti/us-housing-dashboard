/**
 * Especificação declarativa de formatação para um valor numérico.
 *
 * Espelha exatamente o `$defs.FmtSpec` em `data/schema.json` (raiz do repo):
 * union discriminada por `type` com 4 variantes.
 *
 * Como o schema é serializável (JSON), preferimos uma especificação
 * declarativa em vez de função `fmt: (v) => string` (que não serializa).
 * O dispatching é centralizado em `lib/format.ts` (`fmtValue`).
 */

/** Percentual com sinal: `+0.18%`, `-2.40%`. */
export interface FmtSpecPct {
  type: 'pct';
  /** Casas decimais. Default: 2. */
  decimals?: number;
}

/** Valor monetário em USD: `US$ 412.300`. */
export interface FmtSpecUSD {
  type: 'usd';
}

/** Número com locale pt-BR: `1.382` ou `218,4`. */
export interface FmtSpecNum {
  type: 'num';
  /** Casas decimais máximas. Default: 1. */
  decimals?: number;
}

/** Sufixo k para milhares: `1.4k`, `218`. */
export interface FmtSpecK {
  type: 'k';
}

/** União discriminada de todas as especificações de formatação suportadas. */
export type FmtSpec = FmtSpecPct | FmtSpecUSD | FmtSpecNum | FmtSpecK;
