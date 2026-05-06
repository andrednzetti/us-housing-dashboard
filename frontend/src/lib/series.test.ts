import { describe, it, expect } from 'vitest';
import { sliceSeriesByPeriod, seriesStats } from './series';
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
