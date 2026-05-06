import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { KpiCell } from './kpi-cell';
import { mockIndicator } from '../../test-utils/mock-data';

describe('KpiCell', () => {
  it('renderiza Mortgage30-like (delta positivo, upIsBad=true → vermelho)', () => {
    const ind = mockIndicator({
      id: 'mortgage30',
      name: 'Mortgage 30Y Fixa',
      group: 'taxas',
      value: 6.3,
      fmtSpec: { type: 'pct', decimals: 2 },
      delta: 0.07,
      deltaUnit: 'pp',
      deltaPeriod: 'sem',
      upIsBad: true,
    });
    const html = renderToStaticMarkup(<KpiCell indicator={ind} valueColor="var(--group-taxas)" />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza Case-Shiller-like (% a.a., 12m, delta positivo neutral upIsBad=false → verde)', () => {
    const ind = mockIndicator({
      id: 'cs_national',
      name: 'Case-Shiller Nacional',
      group: 'precos',
      value: 332.098,
      fmtSpec: { type: 'num', decimals: 1 },
      delta: 0.66,
      deltaUnit: '% a.a.',
      deltaPeriod: '12m',
      upIsBad: false,
    });
    const html = renderToStaticMarkup(<KpiCell indicator={ind} />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza Months of Supply-like (delta negativo, upIsBad=true → verde)', () => {
    const ind = mockIndicator({
      id: 'months_supply',
      name: 'Months of Supply',
      group: 'oferta',
      value: 8.5,
      fmtSpec: { type: 'num', decimals: 1 },
      delta: -0.6,
      deltaUnit: 'm',
      deltaPeriod: 'mês',
      upIsBad: true,
    });
    const html = renderToStaticMarkup(<KpiCell indicator={ind} />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza NAHB-like com delta zero (símbolo ±, cor neutral)', () => {
    const ind = mockIndicator({
      id: 'nahb',
      name: 'NAHB Housing Market Index',
      group: 'sentimento',
      value: 38,
      fmtSpec: { type: 'num', decimals: 0 },
      delta: 0,
      deltaUnit: 'pts',
      deltaPeriod: 'mês',
    });
    const html = renderToStaticMarkup(<KpiCell indicator={ind} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita valueColor customizado (destaque visual)', () => {
    const ind = mockIndicator({ id: 'highlighted', value: 99.9 });
    const html = renderToStaticMarkup(<KpiCell indicator={ind} valueColor="var(--accent)" />);
    expect(html).toMatchSnapshot();
  });
});
