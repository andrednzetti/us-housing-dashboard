import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Stamp } from './stamp';

describe('Stamp', () => {
  it('renderiza variante accent (default)', () => {
    const html = renderToStaticMarkup(<Stamp>Confidencial</Stamp>);
    expect(html).toMatchSnapshot();
  });

  it('renderiza variante muted', () => {
    const html = renderToStaticMarkup(<Stamp variant="muted">Atualizado · Ter</Stamp>);
    expect(html).toMatchSnapshot();
  });

  it('respeita color override (cobre fallback de variant)', () => {
    const html = renderToStaticMarkup(<Stamp color="var(--ink)">4 destaques</Stamp>);
    expect(html).toMatchSnapshot();
  });
});
