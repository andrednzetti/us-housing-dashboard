import { describe, it, expect, vi, afterEach } from 'vitest';
import { mockIndicator, mockIndicatorsFile } from '../test-utils/mock-data';
import {
  QUADRO_INDICATOR_IDS,
  SPOTLIGHT_INDICATOR_ID,
  selectQuadroIndicators,
  selectSpotlight,
} from './selectors';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('selectQuadroIndicators', () => {
  it('retorna os 4 indicadores em ordem canônica quando todos presentes', () => {
    // Indicators na ordem "errada" no file — selector deve canonizar
    const file = mockIndicatorsFile({
      indicators: [
        mockIndicator({ id: 'nahb', group: 'sentimento' }),
        mockIndicator({ id: 'mortgage30', group: 'taxas' }),
        mockIndicator({ id: 'months_supply', group: 'oferta' }),
        mockIndicator({ id: 'cs_national', group: 'precos' }),
      ],
    });

    const result = selectQuadroIndicators(file);
    expect(result.map((i) => i.id)).toEqual([
      'mortgage30',
      'cs_national',
      'months_supply',
      'nahb',
    ]);
  });

  it('omite ids ausentes e loga warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const file = mockIndicatorsFile({
      indicators: [
        mockIndicator({ id: 'mortgage30' }),
        mockIndicator({ id: 'cs_national' }),
        // months_supply ausente
        mockIndicator({ id: 'nahb' }),
      ],
    });

    const result = selectQuadroIndicators(file);
    expect(result.map((i) => i.id)).toEqual(['mortgage30', 'cs_national', 'nahb']);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Indicator 'months_supply' not found"),
    );
  });

  it('retorna [] e loga 4 warnings quando file está vazio', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = selectQuadroIndicators(mockIndicatorsFile());
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(4);
  });

  it('preserva o objeto Indicator original (mesma referência)', () => {
    const mortgage = mockIndicator({ id: 'mortgage30' });
    const file = mockIndicatorsFile({ indicators: [mortgage] });
    const result = selectQuadroIndicators(file);
    expect(result[0]).toBe(mortgage);
  });
});

describe('QUADRO_INDICATOR_IDS', () => {
  it('tem exatamente 4 ids canônicos', () => {
    expect(QUADRO_INDICATOR_IDS).toHaveLength(4);
    expect(QUADRO_INDICATOR_IDS).toEqual([
      'mortgage30',
      'cs_national',
      'months_supply',
      'nahb',
    ]);
  });
});

describe('selectSpotlight', () => {
  it('retorna o indicador mortgage30 quando presente', () => {
    const mortgage = mockIndicator({ id: 'mortgage30', name: 'Mortgage 30Y Fixa' });
    const file = mockIndicatorsFile({
      indicators: [mockIndicator({ id: 'cs_national' }), mortgage],
    });
    expect(selectSpotlight(file)).toBe(mortgage);
  });

  it('retorna null quando mortgage30 está ausente', () => {
    const file = mockIndicatorsFile({
      indicators: [mockIndicator({ id: 'cs_national' })],
    });
    expect(selectSpotlight(file)).toBeNull();
  });

  it('retorna null em file vazio', () => {
    expect(selectSpotlight(mockIndicatorsFile())).toBeNull();
  });

  it('SPOTLIGHT_INDICATOR_ID é mortgage30', () => {
    expect(SPOTLIGHT_INDICATOR_ID).toBe('mortgage30');
  });
});
