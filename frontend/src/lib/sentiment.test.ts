import { describe, expect, it } from 'vitest';

import type { Indicator } from '../types';
import { deltaColorFor, deltaCssVar, resolveDeltaColor } from './sentiment';

describe('resolveDeltaColor — matriz delta × upIsBad', () => {
  it('delta positivo + upIsBad=false → pos (alta = bom)', () => {
    expect(resolveDeltaColor(+1.5, false)).toBe('pos');
  });

  it('delta negativo + upIsBad=false → neg', () => {
    expect(resolveDeltaColor(-1.5, false)).toBe('neg');
  });

  it('delta positivo + upIsBad=true → neg (alta = ruim)', () => {
    expect(resolveDeltaColor(+1.5, true)).toBe('neg');
  });

  it('delta negativo + upIsBad=true → pos (queda = bom)', () => {
    expect(resolveDeltaColor(-1.5, true)).toBe('pos');
  });

  it('delta zero + upIsBad=false → neutral', () => {
    expect(resolveDeltaColor(0, false)).toBe('neutral');
  });

  it('delta zero + upIsBad=true → neutral', () => {
    expect(resolveDeltaColor(0, true)).toBe('neutral');
  });

  it('delta positivo + upIsBad=undefined → pos (default upIsBad=false)', () => {
    expect(resolveDeltaColor(+1.5)).toBe('pos');
  });

  it('delta negativo + upIsBad=undefined → neg', () => {
    expect(resolveDeltaColor(-1.5)).toBe('neg');
  });
});

describe('resolveDeltaColor — edge cases numéricos', () => {
  it('valores fracionários muito pequenos (próximos de zero) ainda têm sinal', () => {
    expect(resolveDeltaColor(0.0001)).toBe('pos');
    expect(resolveDeltaColor(-0.0001)).toBe('neg');
  });

  it('valores grandes não afetam a lógica', () => {
    expect(resolveDeltaColor(1_000_000)).toBe('pos');
    expect(resolveDeltaColor(-1_000_000)).toBe('neg');
  });
});

describe('deltaColorFor — extração direta de Indicator', () => {
  function buildIndicator(delta: number, upIsBad: boolean | undefined): Indicator {
    const base: Indicator = {
      id: 'test',
      group: 'taxas',
      name: 'Test Indicator',
      short: 'TEST',
      value: 100,
      unit: 'idx',
      fmtSpec: { type: 'num', decimals: 1 },
      delta,
      deltaUnit: 'pp',
      deltaPeriod: 'sem',
      series: [99, 100],
      source: 'Mock',
      why: 'Indicador de teste.',
      sentiment: 'neutral',
    };
    if (upIsBad !== undefined) {
      return { ...base, upIsBad };
    }
    return base;
  }

  it('mortgage30-like (upIsBad=true, delta negativo) → pos', () => {
    const ind = buildIndicator(-0.18, true);
    expect(deltaColorFor(ind)).toBe('pos');
  });

  it('housing_starts-like (upIsBad=false, delta positivo) → pos', () => {
    const ind = buildIndicator(+1.8, false);
    expect(deltaColorFor(ind)).toBe('pos');
  });

  it('unemployment-like (upIsBad=true, delta positivo) → neg', () => {
    const ind = buildIndicator(+0.1, true);
    expect(deltaColorFor(ind)).toBe('neg');
  });

  it('indicator sem upIsBad com delta zero → neutral', () => {
    const ind = buildIndicator(0, undefined);
    expect(deltaColorFor(ind)).toBe('neutral');
  });
});

describe('deltaCssVar — mapping para tokens.css', () => {
  it('pos → var(--pos)', () => {
    expect(deltaCssVar('pos')).toBe('var(--pos)');
  });

  it('neg → var(--neg)', () => {
    expect(deltaCssVar('neg')).toBe('var(--neg)');
  });

  it('neutral → var(--ink-mute)', () => {
    expect(deltaCssVar('neutral')).toBe('var(--ink-mute)');
  });
});
