import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MetrosPanel } from './metros-panel';
import type { Metro } from '../../types';

const SUN_BELT_METROS: Metro[] = [
  { name: 'Tampa, FL', price: 392000, yoy: 6.8, dom: 28, hot: true },
  { name: 'Charlotte, NC', price: 384500, yoy: 5.4, dom: 32, hot: true },
  { name: 'Phoenix, AZ', price: 458200, yoy: 4.2, dom: 41, hot: false },
  { name: 'Atlanta, GA', price: 365000, yoy: 4.8, dom: 35, hot: true },
  { name: 'Austin, TX', price: 521000, yoy: 3.6, dom: 38, hot: false },
  { name: 'Nashville, TN', price: 412000, yoy: 5.1, dom: 30, hot: true },
  { name: 'Raleigh, NC', price: 398000, yoy: 4.5, dom: 33, hot: false },
  { name: 'Orlando, FL', price: 372000, yoy: 5.3, dom: 31, hot: true },
];

describe('MetrosPanel', () => {
  it('renderiza Anexo II com 8 metros (default topN=8)', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    expect(html).toContain('Anexo II');
    expect(html).toContain('Top metros · Sun Belt');
    expect(html).toContain('>8 cidades<');
    expect(html).toMatchSnapshot();
  });

  it('rankings zero-padded de 01 a 08 em ordem do payload', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    for (let i = 1; i <= 8; i += 1) {
      expect(html).toContain(`>${String(i).padStart(2, '0')}<`);
    }
    // Tampa (índice 0 do payload) é 01, não Phoenix (com maior preço)
    const tampaIdx = html.indexOf('Tampa, FL');
    const phoenixIdx = html.indexOf('Phoenix, AZ');
    expect(tampaIdx).toBeLessThan(phoenixIdx);
  });

  it('respeita topN customizado (5 metros, mas stamp ainda mostra total)', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} topN={5} />);
    // Stamp mostra metros.length total (8), mas só renderiza 5 rows
    expect(html).toContain('>8 cidades<');
    expect(html).toContain('Tampa, FL');
    expect(html).toContain('Atlanta, GA');
    expect(html).toContain('Austin, TX');
    expect(html).not.toContain('Raleigh, NC'); // 7º
    expect(html).not.toContain('Orlando, FL'); // 8º
    expect(html).toMatchSnapshot();
  });

  it('marca metros hot com dot accent (5 hot na fixture)', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    // Tampa, Charlotte, Atlanta, Nashville, Orlando = 5 hot
    const hotDotMatches = html.match(/background:var\(--accent\);flex-shrink:0/g);
    expect(hotDotMatches?.length).toBe(5);
  });

  it('formata preços via fmtPriceK', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    expect(html).toContain('$392k');
    expect(html).toContain('$521k');
    expect(html).toContain('$372k');
  });

  it('formata YoY com sinal e cor sentiment', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    expect(html).toContain('+6,8%');
    expect(html).toContain('+5,4%');
    // Todos os 8 são positivos
    expect(html.match(/color:var\(--pos\)/g)?.length).toBe(8);
  });

  it('formata DOM como "Nd"', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={SUN_BELT_METROS} />);
    expect(html).toContain('>28d<');
    expect(html).toContain('>41d<');
    expect(html).toContain('>30d<');
  });

  it('plural singular "1 cidade" quando metros.length===1', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={[SUN_BELT_METROS[0]!]} />);
    expect(html).toContain('>1 cidade<');
    expect(html).not.toContain('>1 cidades<');
  });

  it('lida com metros vazio (header sem rows)', () => {
    const html = renderToStaticMarkup(<MetrosPanel metros={[]} />);
    expect(html).toContain('>0 cidades<');
    expect(html).not.toContain('Tampa');
    expect(html).toMatchSnapshot();
  });

  it('delta negativo usa cor neg', () => {
    const declining: Metro[] = [
      { name: 'Decline, ST', price: 300000, yoy: -2.1, dom: 60, hot: false },
    ];
    const html = renderToStaticMarkup(<MetrosPanel metros={declining} />);
    expect(html).toContain('−2,1%');
    expect(html).toContain('color:var(--neg)');
  });
});
