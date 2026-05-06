import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnexosSection } from './anexos-section';
import type { Metro, Region } from '../../types';

const REGIONS: Region[] = [
  { name: 'Northeast', price: 478200, yoy: 3.8, sales: 612, hot: false },
  { name: 'Midwest', price: 312400, yoy: 4.2, sales: 1041, hot: true },
];

const METROS: Metro[] = [
  { name: 'Tampa, FL', price: 392000, yoy: 6.8, dom: 28, hot: true },
  { name: 'Charlotte, NC', price: 384500, yoy: 5.4, dom: 32, hot: true },
];

describe('AnexosSection', () => {
  it('renderiza ambos os panels lado a lado', () => {
    const html = renderToStaticMarkup(<AnexosSection regions={REGIONS} metros={METROS} />);
    expect(html).toContain('Anexo I');
    expect(html).toContain('Anexo II');
    expect(html).toContain('Northeast');
    expect(html).toContain('Tampa, FL');
    expect(html).toMatchSnapshot();
  });

  it('grid template columns 1fr / 1fr (com minmax)', () => {
    const html = renderToStaticMarkup(<AnexosSection regions={REGIONS} metros={METROS} />);
    expect(html).toContain('minmax(0, 1fr) minmax(0, 1fr)');
  });

  it('ordem interna: Anexo I antes do Anexo II', () => {
    const html = renderToStaticMarkup(<AnexosSection regions={REGIONS} metros={METROS} />);
    const i = html.indexOf('Anexo I');
    const ii = html.indexOf('Anexo II');
    expect(i).toBeGreaterThan(0);
    expect(ii).toBeGreaterThan(i);
  });

  it('aria-label da section', () => {
    const html = renderToStaticMarkup(<AnexosSection regions={REGIONS} metros={METROS} />);
    expect(html).toContain('aria-label="Anexos do boletim — regiões e metros"');
  });

  it('respeita topN customizado para o Anexo II', () => {
    const fiveMetros: Metro[] = Array.from({ length: 5 }, (_, i) => ({
      name: `Metro-${i}`,
      price: 400000,
      yoy: 5,
      dom: 30,
      hot: false,
    }));
    const html = renderToStaticMarkup(
      <AnexosSection regions={REGIONS} metros={fiveMetros} topN={3} />,
    );
    // Stamp mostra total (5), mas só aparece 3 names
    expect(html).toContain('>5 cidades<');
    expect(html).toContain('Metro-0');
    expect(html).toContain('Metro-2');
    expect(html).not.toContain('Metro-3');
  });

  it('lida com payloads vazios (ambos panels mostram empty)', () => {
    const html = renderToStaticMarkup(<AnexosSection regions={[]} metros={[]} />);
    expect(html).toContain('>0 regiões<');
    expect(html).toContain('>0 cidades<');
  });
});
