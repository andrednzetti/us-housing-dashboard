import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Spotlight } from './spotlight';
import { mockIndicator, mockIndicatorsFile } from '../../test-utils/mock-data';
import type { Event as MarketEvent, Group } from '../../types';

const sampleIndicator = mockIndicator({
  id: 'mortgage30',
  name: 'Mortgage 30Y Fixa',
  group: 'taxas',
  value: 6.3,
  fmtSpec: { type: 'pct', decimals: 2 },
  delta: 0.07,
  deltaUnit: 'pp',
  deltaPeriod: 'sem',
  series: Array.from({ length: 52 }, (_, i) => 5.5 + i * 0.02),
  source: 'Freddie Mac',
  why: 'Custo do financiamento residencial.',
  upIsBad: true,
});

const sampleEvents: MarketEvent[] = [
  { date: '2026-05-05', tag: 'FED', text: 'Fed mantém taxa.' },
  { date: '2026-05-02', tag: 'DADO', text: 'Mortgage apps sobem.' },
];

const sampleFile = mockIndicatorsFile({
  indicators: [
    mockIndicator({ id: 'mortgage30', group: 'taxas' }),
    mockIndicator({ id: 'cs_national', group: 'precos' }),
    mockIndicator({ id: 'months_supply', group: 'oferta' }),
  ],
});

describe('Spotlight (wrapper grid 2-col)', () => {
  it('renderiza grid 2-col com card + aside (Crônica + Composição)', () => {
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={sampleEvents} file={sampleFile} />,
    );
    expect(html).toMatchSnapshot();
    // Estrutura: section + aside
    expect(html).toContain('<section');
    expect(html).toContain('<aside');
    // Card principal: nome do indicator
    expect(html).toContain('Mortgage 30Y Fixa');
    // Crônica: eyebrow + tags
    expect(html).toContain('Crônica da semana');
    expect(html).toContain('>FED<');
    // Composição: eyebrow + grupo
    expect(html).toContain('Composição da carteira');
  });

  it('grid template columns usa 1.7fr / 1fr', () => {
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={sampleEvents} file={sampleFile} />,
    );
    expect(html).toContain('minmax(0, 1.7fr) minmax(0, 1fr)');
  });

  it('ordem interna: SpotlightCard antes do aside', () => {
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={sampleEvents} file={sampleFile} />,
    );
    const cardIdx = html.indexOf('Mortgage 30Y Fixa');
    const cronicaIdx = html.indexOf('Crônica da semana');
    const composicaoIdx = html.indexOf('Composição da carteira');
    expect(cardIdx).toBeGreaterThan(0);
    expect(cronicaIdx).toBeGreaterThan(cardIdx);
    expect(composicaoIdx).toBeGreaterThan(cronicaIdx);
  });

  it('events vazio: card e Composição renderizam normalmente, Crônica mostra empty state', () => {
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={[]} file={sampleFile} />,
    );
    expect(html).toContain('Mortgage 30Y Fixa');
    expect(html).toContain('Nenhum evento esta semana');
    expect(html).toContain('Composição da carteira');
  });

  it('aria-label da section', () => {
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={sampleEvents} file={sampleFile} />,
    );
    expect(html).toContain('aria-label="Indicador em foco e contexto"');
  });

  it('passa events corretamente para CronicaEvents (3 events visíveis)', () => {
    const threeEvents: MarketEvent[] = [
      { date: '2026-05-05', tag: 'FED', text: 'a' },
      { date: '2026-05-02', tag: 'DADO', text: 'b' },
      { date: '2026-04-28', tag: 'NAHB', text: 'c' },
    ];
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={threeEvents} file={sampleFile} />,
    );
    expect(html).toContain('05.MAI');
    expect(html).toContain('02.MAI');
    expect(html).toContain('28.ABR');
    // Stamp count = 3
    expect(html).toContain('>3<');
  });

  it('passa file corretamente para ComposicaoCarteira (counts refletem distribuição)', () => {
    const distFile = mockIndicatorsFile({
      indicators: [
        mockIndicator({ id: 't1', group: 'taxas' as Group }),
        mockIndicator({ id: 't2', group: 'taxas' as Group }),
        mockIndicator({ id: 'p1', group: 'precos' as Group }),
      ],
    });
    const html = renderToStaticMarkup(
      <Spotlight indicator={sampleIndicator} events={sampleEvents} file={distFile} />,
    );
    // total no centro = 3
    expect(html).toContain('>3<');
  });
});
