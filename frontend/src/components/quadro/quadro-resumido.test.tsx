import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuadroResumido } from './quadro-resumido';
import { mockIndicator, mockIndicatorsFile } from '../../test-utils/mock-data';

afterEach(() => {
  vi.restoreAllMocks();
});

const QUADRO_INDICATORS = [
  mockIndicator({
    id: 'mortgage30',
    name: 'Mortgage 30Y Fixa',
    group: 'taxas',
    value: 6.3,
    fmtSpec: { type: 'pct', decimals: 2 },
    delta: 0.07,
    deltaUnit: 'pp',
    deltaPeriod: 'sem',
    upIsBad: true,
  }),
  mockIndicator({
    id: 'cs_national',
    name: 'Case-Shiller Nacional',
    group: 'precos',
    value: 332.098,
    fmtSpec: { type: 'num', decimals: 1 },
    delta: 0.66,
    deltaUnit: '% a.a.',
    deltaPeriod: '12m',
    upIsBad: false,
  }),
  mockIndicator({
    id: 'months_supply',
    name: 'Months of Supply',
    group: 'oferta',
    value: 8.5,
    fmtSpec: { type: 'num', decimals: 1 },
    delta: -0.6,
    deltaUnit: 'm',
    deltaPeriod: 'mês',
    upIsBad: true,
  }),
  mockIndicator({
    id: 'nahb',
    name: 'NAHB Housing Market Index',
    group: 'sentimento',
    value: 38,
    fmtSpec: { type: 'num', decimals: 0 },
    delta: 0,
    deltaUnit: 'pts',
    deltaPeriod: 'mês',
  }),
];

describe('QuadroResumido', () => {
  it('renderiza section completa com 4 KpiCells em ordem canônica', () => {
    const file = mockIndicatorsFile({
      generatedAt: '2026-05-06T17:44:11Z',
      indicators: QUADRO_INDICATORS,
    });
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    expect(html).toMatchSnapshot();

    // Ordem canônica preservada
    const order = ['mortgage30', 'cs_national', 'months_supply', 'nahb'];
    let lastIdx = -1;
    for (const id of order) {
      const idx = html.indexOf(`kpi-${id}-label`);
      expect(idx).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it('inclui "Síntese · Posição em DD.MM.AAAA" formatado de generatedAt', () => {
    const file = mockIndicatorsFile({
      generatedAt: '2026-05-06T17:44:11Z',
      indicators: QUADRO_INDICATORS,
    });
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    expect(html).toContain('Posição em 06.05.2026');
  });

  it('calcula próxima terça-feira a partir de generatedAt', () => {
    // 2026-05-06 = quarta → próxima terça é 2026-05-12
    const file = mockIndicatorsFile({
      generatedAt: '2026-05-06T17:44:11Z',
      indicators: QUADRO_INDICATORS,
    });
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    expect(html).toContain('Próxima atualização · 12.MAI.2026');
  });

  it('mostra "N destaques" no stamp baseado em items presentes', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const file = mockIndicatorsFile({
      // Apenas mortgage30 + cs_national → 2 destaques
      indicators: QUADRO_INDICATORS.slice(0, 2),
    });
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    expect(html).toContain('2 destaques');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('renderiza com array vazio (loga 4 warnings, sem KpiCells)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const file = mockIndicatorsFile();
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    expect(html).toContain('0 destaques');
    expect(html).not.toContain('kpi-');
    expect(warnSpy).toHaveBeenCalledTimes(4);
  });

  it('lida com generatedAt inválido sem quebrar', () => {
    const file = mockIndicatorsFile({
      generatedAt: 'not-a-date',
      indicators: QUADRO_INDICATORS,
    });
    const html = renderToStaticMarkup(<QuadroResumido file={file} />);
    // Posição e próxima atualização ambos viram '—'
    expect(html).toContain('Posição em —');
    expect(html).toContain('Próxima atualização · —');
  });
});
