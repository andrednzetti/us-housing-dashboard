import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SpotlightCard } from './spotlight-card';
import { mockIndicator } from '../../test-utils/mock-data';

describe('SpotlightCard', () => {
  it('renderiza Mortgage30-like com period default 1A', () => {
    const ind = mockIndicator({
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
      why: 'Custo do financiamento residencial. Quanto menor, mais acessível.',
      upIsBad: true,
    });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita initialPeriod=1M (slice menor da série)', () => {
    const ind = mockIndicator({
      id: 'mortgage30',
      series: Array.from({ length: 52 }, (_, i) => i + 1),
    });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} initialPeriod="1M" />);
    // 1M => 4 pontos; o path do AreaChart deve refletir só os últimos 4
    expect(html).toContain('Período do gráfico');
    expect(html).toMatchSnapshot();
  });

  it('respeita initialPeriod=5A (série completa)', () => {
    const ind = mockIndicator({
      series: Array.from({ length: 52 }, (_, i) => i + 1),
    });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} initialPeriod="5A" />);
    expect(html).toMatchSnapshot();
  });

  it('omite a Nota Explicativa quando indicator.why é vazio', () => {
    const ind = mockIndicator({ why: '' });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} />);
    expect(html).not.toContain('Nota explicativa');
    expect(html).toMatchSnapshot();
  });

  it('lida com series vazia (chart fallback + stats viram —)', () => {
    const ind = mockIndicator({ series: [] });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} />);
    // Stats numéricos devem aparecer como '—'
    expect(html).toContain('—');
    expect(html).toMatchSnapshot();
  });

  it('NAHB-like (group sentimento, fmtSpec num decimals 0)', () => {
    const ind = mockIndicator({
      id: 'nahb',
      name: 'NAHB Housing Market Index',
      group: 'sentimento',
      value: 38,
      fmtSpec: { type: 'num', decimals: 0 },
      delta: 0,
      deltaUnit: 'pts',
      deltaPeriod: 'mês',
      series: [40, 39, 41, 42, 38, 37, 38, 38, 39, 38, 38],
      source: 'NAHB · scrap',
      why: 'Sentimento de construtores. > 50 = otimismo predominante.',
    });
    const html = renderToStaticMarkup(<SpotlightCard indicator={ind} />);
    expect(html).toMatchSnapshot();
  });
});
