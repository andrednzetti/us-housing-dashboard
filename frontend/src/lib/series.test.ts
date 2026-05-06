import { describe, it, expect } from 'vitest';
import { sliceSeriesByPeriod, seriesStats, xAxisLabelsForPeriod } from './series';
import type { Period } from '../types';
import { mockIndicator } from '../test-utils/mock-data';

describe('sliceSeriesByPeriod', () => {
  // Série de 52 pontos (1, 2, …, 52) para verificar slices exatos
  const longSeries = Array.from({ length: 52 }, (_, i) => i + 1);

  it('1M → últimos 4 pontos', () => {
    const ind = mockIndicator({ series: longSeries });
    expect(sliceSeriesByPeriod(ind, '1M')).toEqual([49, 50, 51, 52]);
  });

  it('3M → últimos 13 pontos', () => {
    const ind = mockIndicator({ series: longSeries });
    expect(sliceSeriesByPeriod(ind, '3M')).toHaveLength(13);
    expect(sliceSeriesByPeriod(ind, '3M').at(-1)).toBe(52);
  });

  it('6M → últimos 26 pontos', () => {
    const ind = mockIndicator({ series: longSeries });
    expect(sliceSeriesByPeriod(ind, '6M')).toHaveLength(26);
  });

  it('1A → últimos 52 pontos', () => {
    const ind = mockIndicator({ series: longSeries });
    expect(sliceSeriesByPeriod(ind, '1A')).toEqual(longSeries);
  });

  it('5A → série completa (mesmo se for só 11 pontos)', () => {
    const monthly = mockIndicator({ series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] });
    expect(sliceSeriesByPeriod(monthly, '5A')).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it('1A em série mais curta retorna a série inteira (sem padding)', () => {
    const short = mockIndicator({ series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] });
    expect(sliceSeriesByPeriod(short, '1A')).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });

  it('1M em série de 2 pontos retorna apenas 2 (não pads zeros)', () => {
    const sparse = mockIndicator({ series: [10, 20] });
    expect(sliceSeriesByPeriod(sparse, '1M')).toEqual([10, 20]);
  });

  it('série vazia retorna []', () => {
    const empty = mockIndicator({ series: [] });
    expect(sliceSeriesByPeriod(empty, '1A')).toEqual([]);
  });
});

describe('seriesStats', () => {
  it('calcula min/max/avg corretamente', () => {
    expect(seriesStats([1, 5, 3, 7, 4])).toEqual({ min: 1, max: 7, avg: 4 });
  });

  it('série com 1 elemento: todos iguais ao valor', () => {
    expect(seriesStats([42])).toEqual({ min: 42, max: 42, avg: 42 });
  });

  it('série plana: min=max=avg', () => {
    expect(seriesStats([3, 3, 3, 3])).toEqual({ min: 3, max: 3, avg: 3 });
  });

  it('série vazia retorna NaN para todos', () => {
    const stats = seriesStats([]);
    expect(stats.min).toBeNaN();
    expect(stats.max).toBeNaN();
    expect(stats.avg).toBeNaN();
  });

  it('valores negativos', () => {
    expect(seriesStats([-1, -5, -3])).toEqual({ min: -5, max: -1, avg: -3 });
  });

  it('avg correto para média não-inteira', () => {
    expect(seriesStats([1, 2]).avg).toBe(1.5);
  });
});

describe('xAxisLabelsForPeriod', () => {
  it('1M produz 5 labels semanais', () => {
    expect(xAxisLabelsForPeriod('1M')).toEqual(['−4S', '−3S', '−2S', '−1S', 'HOJE']);
  });

  it('3M produz 4 labels (≈trimestre em semanas)', () => {
    expect(xAxisLabelsForPeriod('3M')).toEqual(['−12S', '−8S', '−4S', 'HOJE']);
  });

  it('6M produz 4 labels mensais', () => {
    expect(xAxisLabelsForPeriod('6M')).toEqual(['−6M', '−4M', '−2M', 'HOJE']);
  });

  it('1A produz 5 labels trimestrais em meses', () => {
    expect(xAxisLabelsForPeriod('1A')).toEqual(['−12M', '−9M', '−6M', '−3M', 'HOJE']);
  });

  it('5A produz 6 labels anuais', () => {
    expect(xAxisLabelsForPeriod('5A')).toEqual(['−5A', '−4A', '−3A', '−2A', '−1A', 'HOJE']);
  });

  it('todos os períodos terminam em HOJE', () => {
    const periods: Period[] = ['1M', '3M', '6M', '1A', '5A'];
    for (const p of periods) {
      expect(xAxisLabelsForPeriod(p).at(-1)).toBe('HOJE');
    }
  });

  it('todos os períodos usam − (U+2212), não hífen ASCII', () => {
    const periods: Period[] = ['1M', '3M', '6M', '1A', '5A'];
    for (const p of periods) {
      const labels = xAxisLabelsForPeriod(p);
      // Pelo menos um label do passado deve ter o minus
      const pastLabels = labels.slice(0, -1);
      for (const label of pastLabels) {
        expect(label.startsWith('−')).toBe(true);
        expect(label.startsWith('-')).toBe(false);
      }
    }
  });
});
