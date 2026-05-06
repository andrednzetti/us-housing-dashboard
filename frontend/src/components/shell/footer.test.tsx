import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from './footer';

describe('Footer', () => {
  it('renderiza estado loading (sem props)', () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza com generatedAt + schemaVersion populados', () => {
    const html = renderToStaticMarkup(
      <Footer generatedAt="2026-05-06T17:44:11Z" schemaVersion="2.0" />,
    );
    expect(html).toMatchSnapshot();
  });

  it('formata timestamp completo dd/mm/yyyy · hh:mm UTC', () => {
    const html = renderToStaticMarkup(
      <Footer generatedAt="2026-12-22T03:07:00Z" schemaVersion="2.0" />,
    );
    expect(html).toMatchSnapshot();
  });

  it('lida com timestamp inválido com placeholder', () => {
    const html = renderToStaticMarkup(<Footer generatedAt="invalid" schemaVersion="2.0" />);
    expect(html).toMatchSnapshot();
  });
});
