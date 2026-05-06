import { describe, it, expect, vi, afterEach } from 'vitest';
import { mockIndicator, mockIndicatorsFile } from '../test-utils/mock-data';
import {
  DEFAULT_TOP_METROS,
  QUADRO_INDICATOR_IDS,
  SPOTLIGHT_INDICATOR_ID,
  indicatorCountByGroup,
  selectQuadroIndicators,
  selectSpotlight,
  selectTopMetros,
} from './selectors';
import type { Metro } from '../types';

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

describe('indicatorCountByGroup', () => {
  it('conta indicators por grupo preservando todos os 5 grupos', () => {
    const file = mockIndicatorsFile({
      indicators: [
        mockIndicator({ id: 'mortgage30', group: 'taxas' }),
        mockIndicator({ id: 'mortgage15', group: 'taxas' }),
        mockIndicator({ id: 'cs_national', group: 'precos' }),
        mockIndicator({ id: 'months_supply', group: 'oferta' }),
      ],
    });
    expect(indicatorCountByGroup(file)).toEqual({
      taxas: 2,
      precos: 1,
      oferta: 1,
      sentimento: 0,
      macro: 0,
    });
  });

  it('grupos vazios têm count zero (não omitidos)', () => {
    const file = mockIndicatorsFile({ indicators: [] });
    expect(indicatorCountByGroup(file)).toEqual({
      taxas: 0,
      precos: 0,
      oferta: 0,
      sentimento: 0,
      macro: 0,
    });
  });

  it('soma dos counts iguala file.indicators.length', () => {
    const file = mockIndicatorsFile({
      indicators: [
        mockIndicator({ group: 'taxas' }),
        mockIndicator({ group: 'taxas' }),
        mockIndicator({ group: 'macro' }),
      ],
    });
    const counts = indicatorCountByGroup(file);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(file.indicators.length);
  });
});

const mockMetro = (overrides: Partial<Metro> = {}): Metro => ({
  name: 'Mock Metro, ST',
  price: 400000,
  yoy: 5.0,
  dom: 30,
  hot: false,
  ...overrides,
});

describe('selectTopMetros', () => {
  it('retorna primeiros 8 metros por default (preservando ordem)', () => {
    const metros: Metro[] = Array.from({ length: 12 }, (_, i) =>
      mockMetro({ name: `Metro-${i}` }),
    );
    const file = mockIndicatorsFile({ metros });
    expect(selectTopMetros(file)).toHaveLength(8);
    expect(selectTopMetros(file).map((m) => m.name)).toEqual([
      'Metro-0', 'Metro-1', 'Metro-2', 'Metro-3',
      'Metro-4', 'Metro-5', 'Metro-6', 'Metro-7',
    ]);
  });

  it('respeita topN customizado', () => {
    const metros: Metro[] = Array.from({ length: 8 }, (_, i) =>
      mockMetro({ name: `Metro-${i}` }),
    );
    const file = mockIndicatorsFile({ metros });
    expect(selectTopMetros(file, 3)).toHaveLength(3);
  });

  it('retorna todos quando topN excede metros.length', () => {
    const metros: Metro[] = [mockMetro({ name: 'Solo' })];
    const file = mockIndicatorsFile({ metros });
    expect(selectTopMetros(file, 10)).toEqual(metros);
  });

  it('preserva ordem do payload (NÃO sorteia por preço)', () => {
    // Ordem editorial Sun Belt: Tampa primeiro mesmo com preço menor
    const metros: Metro[] = [
      mockMetro({ name: 'Tampa, FL', price: 392000 }),
      mockMetro({ name: 'Phoenix, AZ', price: 458200 }),
      mockMetro({ name: 'Charlotte, NC', price: 384500 }),
    ];
    const file = mockIndicatorsFile({ metros });
    expect(selectTopMetros(file).map((m) => m.name)).toEqual([
      'Tampa, FL',     // mesmo com preço inferior, vem 1º (ordem do payload)
      'Phoenix, AZ',
      'Charlotte, NC',
    ]);
  });

  it('DEFAULT_TOP_METROS = 8', () => {
    expect(DEFAULT_TOP_METROS).toBe(8);
  });

  it('retorna [] em file sem metros', () => {
    expect(selectTopMetros(mockIndicatorsFile())).toEqual([]);
  });
});
