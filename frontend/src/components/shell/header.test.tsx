import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from './header';

describe('Header', () => {
  it('renderiza estado loading (sem generatedAt) com placeholder', () => {
    const html = renderToStaticMarkup(<Header />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza com generatedAt formatando data em UTC pt-BR', () => {
    const html = renderToStaticMarkup(
      <Header generatedAt="2026-05-06T17:44:11Z" schemaVersion="2.0" />,
    );
    expect(html).toMatchSnapshot();
  });

  it('formata dezembro corretamente (DEZ)', () => {
    const html = renderToStaticMarkup(<Header generatedAt="2026-12-22T00:00:00Z" />);
    expect(html).toMatchSnapshot();
  });

  it('lida com timestamp inválido sem quebrar', () => {
    const html = renderToStaticMarkup(<Header generatedAt="not-a-date" />);
    expect(html).toMatchSnapshot();
  });
});
