/**
 * Helpers de manipulação de série temporal — slicing por período e
 * estatísticas básicas.
 *
 * Convenção: as séries do schema v2 são armazenadas em ordem cronológica
 * ascendente (último elemento = mais recente). Slicing por período pega
 * sempre os **N últimos pontos**.
 *
 * Mapping `Period → N pontos` assume frequência semanal (default da
 * maioria dos indicadores macro do dashboard). Para indicadores de
 * frequência diferente (mensal, trimestral, anual), o backend Python
 * trunca a `series` em ~52 pontos: o slice ainda mostra "os últimos N
 * pontos disponíveis", visualmente representando a janela temporal
 * pedida com a granularidade nativa do indicador.
 */

import type { Indicator, Period } from '../types';

/** Mapping `Period → quantidade aproximada de pontos semanais a mostrar`. */
const PERIOD_POINTS: Record<Period, number> = {
  '1M': 4,
  '3M': 13,
  '6M': 26,
  '1A': 52,
  '5A': Number.POSITIVE_INFINITY,
};

/**
 * Faz slice dos últimos `N` pontos da série do indicador conforme `period`.
 * Se a série tem menos pontos que o solicitado, retorna a série inteira.
 *
 * @example
 *   sliceSeriesByPeriod(mortgage30, '1M')  // últimos 4 pontos
 *   sliceSeriesByPeriod(mortgage30, '5A')  // série completa
 */
export function sliceSeriesByPeriod(indicator: Indicator, period: Period): number[] {
  const requested = PERIOD_POINTS[period];
  const n = Math.min(requested, indicator.series.length);
  return indicator.series.slice(-n);
}

/** Estatísticas agregadas de uma série numérica. */
export interface SeriesStats {
  min: number;
  max: number;
  avg: number;
}

/**
 * Calcula `min`, `max` e `avg` de uma série. Para série vazia, retorna
 * todos como `NaN` — o consumer deve tratar (ex.: render `'—'`).
 *
 * @example
 *   seriesStats([1, 5, 3, 7, 4])  // { min: 1, max: 7, avg: 4 }
 *   seriesStats([])               // { min: NaN, max: NaN, avg: NaN }
 */
export function seriesStats(series: number[]): SeriesStats {
  if (series.length === 0) {
    return { min: NaN, max: NaN, avg: NaN };
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const sum = series.reduce((acc, v) => acc + v, 0);
  return { min, max, avg: sum / series.length };
}

/**
 * Labels relativos para o eixo X do AreaChart, dado um período. O último
 * label é sempre `HOJE` — os anteriores são marcadores no passado em
 * unidade adequada à granularidade do período.
 *
 * Convenção:
 *   - 1M: granularidade semanal (`−4S … HOJE`)
 *   - 3M: granularidade quadrimestral em semanas (`−12S … HOJE`)
 *   - 6M: granularidade mensal (`−6M … HOJE`)
 *   - 1A: granularidade trimestral em meses (`−12M … HOJE`)
 *   - 5A: granularidade anual (`−5A … HOJE`)
 *
 * Os labels usam `−` (U+2212, minus tipográfico) para coerência com `fmtDelta`.
 *
 * @example
 *   xAxisLabelsForPeriod('1A')
 *   // ['−12M', '−9M', '−6M', '−3M', 'HOJE']
 */
export function xAxisLabelsForPeriod(period: Period): string[] {
  switch (period) {
    case '1M':
      return ['−4S', '−3S', '−2S', '−1S', 'HOJE'];
    case '3M':
      return ['−12S', '−8S', '−4S', 'HOJE'];
    case '6M':
      return ['−6M', '−4M', '−2M', 'HOJE'];
    case '1A':
      return ['−12M', '−9M', '−6M', '−3M', 'HOJE'];
    case '5A':
      return ['−5A', '−4A', '−3A', '−2A', '−1A', 'HOJE'];
  }
}
