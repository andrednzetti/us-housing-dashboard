import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RegioesPanel } from './regioes-panel';
import type { Region } from '../../types';

const FOUR_REGIONS: Region[] = [
  { name: 'Northeast', price: 478200, yoy: 3.8, sales: 612, hot: false },
  { name: 'Midwest', price: 312400, yoy: 4.2, sales: 1041, hot: true },
  { name: 'South', price: 401300, yoy: 5.1, sales: 1456, hot: true },
  { name: 'West', price: 612900, yoy: 2.4, sales: 884, hot: false },
];

describe('RegioesPanel', () => {
  it('renderiza Anexo I com 4 regiões', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    expect(html).toContain('Anexo I');
    expect(html).toContain('Por região censitária');
    expect(html).toContain('>4 regiões<');
    expect(html).toContain('Northeast');
    expect(html).toContain('Midwest');
    expect(html).toContain('South');
    expect(html).toContain('West');
    expect(html).toMatchSnapshot();
  });

  it('marca regiões hot com dot accent na 1ª célula', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    // Midwest e South são hot → 2 dots
    const hotDotMatches = html.match(/background:var\(--accent\);flex-shrink:0/g);
    expect(hotDotMatches?.length).toBe(2);
  });

  it('renderiza 4 progressbars (uma por região)', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    expect(html.match(/role="progressbar"/g)?.length).toBe(4);
  });

  it('formata preços via fmtPriceK ($XXXk)', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    expect(html).toContain('$478k');
    expect(html).toContain('$312k');
    expect(html).toContain('$401k');
    expect(html).toContain('$613k');
  });

  it('formata deltas YoY com cor sentiment-aware', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    expect(html).toContain('+3,8%');
    expect(html).toContain('+4,2%');
    expect(html).toContain('+5,1%');
    expect(html).toContain('+2,4%');
    // Todos positivos → cor pos (verde marca)
    expect(html.match(/color:var\(--pos\)/g)?.length).toBe(4);
  });

  it('renderiza progressbar role com aria-valuenow correto', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={FOUR_REGIONS} />);
    expect(html).toContain('aria-valuenow="612"');
    expect(html).toContain('aria-valuenow="1041"');
    expect(html).toContain('aria-valuemax="2000"');
  });

  it('lida com region única (singular "região" no stamp)', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={[FOUR_REGIONS[0]!]} />);
    expect(html).toContain('>1 região<');
    expect(html).not.toContain('>1 regiões<');
  });

  it('lida com regions vazio (header sem rows)', () => {
    const html = renderToStaticMarkup(<RegioesPanel regions={[]} />);
    expect(html).toContain('>0 regiões<');
    expect(html).not.toContain('Northeast');
    expect(html).toMatchSnapshot();
  });

  it('delta zero usa cor ink-mute', () => {
    const flatRegion: Region = {
      name: 'Test',
      price: 400000,
      yoy: 0,
      sales: 500,
      hot: false,
    };
    const html = renderToStaticMarkup(<RegioesPanel regions={[flatRegion]} />);
    expect(html).toContain('±0,0%');
    expect(html).toContain('color:var(--ink-mute)');
  });

  it('delta negativo usa cor neg + minus tipográfico', () => {
    const decliningRegion: Region = {
      name: 'Decline',
      price: 300000,
      yoy: -1.5,
      sales: 400,
      hot: false,
    };
    const html = renderToStaticMarkup(<RegioesPanel regions={[decliningRegion]} />);
    expect(html).toContain('−1,5%');
    expect(html).toContain('color:var(--neg)');
  });
});
