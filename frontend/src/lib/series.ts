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
import {
  formatPtBrMonth,
  formatPtBrMonthYearShort,
  formatPtBrShort,
  formatPtBrYear,
  subtractFrequency,
} from './dates';

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

/**
 * Quantidade alvo de ticks no X axis por período. Limitada pela quantidade
 * de pontos disponíveis no slice — para `1M` (4 pts), o máximo possível
 * são 4 ticks; subir para 5 forçaria duplicar uma posição sem ganho visual.
 */
const TICKS_BY_PERIOD: Record<Period, number> = {
  '1M': 4,
  '3M': 4,
  '6M': 4,
  '1A': 5,
  '5A': 6,
};

/** Formata uma `Date` no formato adequado a cada período. */
function formatLabelForPeriod(date: Date, period: Period): string {
  switch (period) {
    case '1M':
      return formatPtBrShort(date); // DD.MMM
    case '3M':
      return formatPtBrMonth(date); // MMM
    case '6M':
    case '1A':
      return formatPtBrMonthYearShort(date); // MMM/AA
    case '5A':
      return formatPtBrYear(date); // AAAA
  }
}

/**
 * Gera labels absolutos do X axis a partir do indicator + período + data
 * de geração. O último label corresponde à `generatedAt`; os demais são
 * datas históricas espaçadas igualmente, calculadas via `subtractFrequency`
 * em unidade compatível com `indicator.frequency`.
 *
 * Granularidade do label adapta ao período:
 *   - 1M → DD.MMM        ("07.ABR")
 *   - 3M → MMM           ("FEV")
 *   - 6M → MMM/AA        ("DEZ/25")
 *   - 1A → MMM/AA        ("MAI/25")
 *   - 5A → AAAA          ("2021")
 *
 * Fallback retro: se `indicator.frequency` for `undefined` (data antigo
 * sem o campo) ou se a `generatedAt` for inválida, retorna labels
 * relativos via `xAxisLabelsForPeriod` — preservando comportamento da
 * Fase 4 housekeeping.
 *
 * Edge: para séries muito curtas (length < 2), também usa fallback —
 * não faz sentido distribuir ticks numa série inferior à granularidade
 * do período.
 *
 * @example
 *   xAxisLabelsForIndicator(mortgage30, '1A', '2026-05-06T17:44:11Z')
 *   // → ['MAI/25', 'AGO/25', 'NOV/25', 'FEV/26', 'MAI/26']
 */
export function xAxisLabelsForIndicator(
  indicator: Indicator,
  period: Period,
  generatedAt: string,
): string[] {
  if (!indicator.frequency) {
    return xAxisLabelsForPeriod(period);
  }
  const baseDate = new Date(generatedAt);
  if (Number.isNaN(baseDate.getTime())) {
    return xAxisLabelsForPeriod(period);
  }

  const slicedSeries = sliceSeriesByPeriod(indicator, period);
  if (slicedSeries.length < 2) {
    return xAxisLabelsForPeriod(period);
  }

  const numTicks = Math.min(TICKS_BY_PERIOD[period], slicedSeries.length);
  const lastIndex = slicedSeries.length - 1;
  const labels: string[] = [];
  for (let i = 0; i < numTicks; i += 1) {
    const fraction = i / (numTicks - 1);
    const indexInSeries = Math.round(fraction * lastIndex);
    const pointsBack = lastIndex - indexInSeries;
    const date = subtractFrequency(baseDate, pointsBack, indicator.frequency);
    labels.push(formatLabelForPeriod(date, period));
  }
  return labels;
}
