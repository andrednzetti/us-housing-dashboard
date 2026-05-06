/**
 * Utilitários de mock para testes — `mockIndicator` e `mockIndicatorsFile`
 * permitem construir fixtures rapidamente sem repetir todos os campos
 * obrigatórios do schema v2.
 *
 * Os defaults reproduzem um indicador `mortgage30`-like (fonte FRED, %
 * com 2 decimais, delta semanal) — sirva como ponto de partida típico.
 */

import type { Indicator, IndicatorsFile } from '../types';

export function mockIndicator(overrides: Partial<Indicator> = {}): Indicator {
  return {
    id: 'mock_ind',
    group: 'taxas',
    name: 'Mock Indicator',
    short: 'MOCK',
    value: 6.85,
    unit: '%',
    fmtSpec: { type: 'pct', decimals: 2 },
    delta: 0.12,
    deltaUnit: 'pp',
    deltaPeriod: 'sem',
    series: [6.5, 6.6, 6.7, 6.8, 6.85],
    source: 'FRED',
    why: 'Mock indicator para testes.',
    sentiment: 'neutral',
    ...overrides,
  };
}

export function mockIndicatorsFile(
  overrides: Partial<IndicatorsFile> = {},
): IndicatorsFile {
  return {
    schemaVersion: '2.0',
    generatedAt: '2026-05-06T17:44:11Z',
    indicators: [],
    regions: [],
    metros: [],
    events: [],
    ...overrides,
  };
}
