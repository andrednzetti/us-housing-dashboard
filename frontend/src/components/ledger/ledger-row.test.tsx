import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LedgerRow } from './ledger-row';
import { mockIndicator } from '../../test-utils/mock-data';

describe('LedgerRow', () => {
  it('renderiza row típica (delta positivo, upIsBad=false → cor pos)', () => {
    const ind = mockIndicator({
      id: 'cs_national',
      name: 'Case-Shiller Nacional',
      short: 'CASE-SHILLER',
      group: 'precos',
      value: 332.098,
      fmtSpec: { type: 'num', decimals: 1 },
      delta: 0.66,
      deltaUnit: '% a.a.',
      deltaPeriod: '12m',
      upIsBad: false,
    });
    const html = renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={false} onClick={() => {}} />,
    );
    expect(html).toMatchSnapshot();
  });

  it('renderiza upIsBad=true com delta positivo → cor neg (sparkline + delta)', () => {
    const ind = mockIndicator({
      id: 'mortgage30',
      name: 'Mortgage 30Y Fixa',
      short: '30Y MORTGAGE',
      group: 'taxas',
      value: 6.3,
      fmtSpec: { type: 'pct', decimals: 2 },
      delta: 0.07,
      deltaUnit: 'pp',
      deltaPeriod: 'sem',
      upIsBad: true,
    });
    const html = renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={false} onClick={() => {}} />,
    );
    expect(html).toMatchSnapshot();
  });

  it('aplica bg --rule-soft + aria-current quando isSelected=true', () => {
    const ind = mockIndicator({ id: 'mortgage30' });
    const html = renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={true} onClick={() => {}} />,
    );
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('var(--rule-soft)');
    expect(html).toMatchSnapshot();
  });

  it('omite aria-current quando isSelected=false', () => {
    const ind = mockIndicator({ id: 'cs_national' });
    const html = renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={false} onClick={() => {}} />,
    );
    expect(html).not.toContain('aria-current');
  });

  it('delta zero renderiza ± com cor neutral', () => {
    const ind = mockIndicator({
      id: 'nahb',
      name: 'NAHB Housing Market Index',
      short: 'NAHB HMI',
      group: 'sentimento',
      value: 38,
      fmtSpec: { type: 'num', decimals: 0 },
      delta: 0,
      deltaUnit: 'pts',
      deltaPeriod: 'mês',
    });
    const html = renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={false} onClick={() => {}} />,
    );
    expect(html).toContain('±0,0pts');
    expect(html).toContain('var(--ink-mute)');
    expect(html).toMatchSnapshot();
  });

  it('callback onClick é tipado e não invocado em SSR', () => {
    const onClick = vi.fn<() => void>();
    const ind = mockIndicator({});
    renderToStaticMarkup(
      <LedgerRow indicator={ind} isSelected={false} onClick={onClick} />,
    );
    expect(onClick).not.toHaveBeenCalled();
  });
});
