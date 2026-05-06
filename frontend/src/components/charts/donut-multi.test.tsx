import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonutMulti } from './donut-multi';

describe('DonutMulti', () => {
  it('renderiza 3 segmentos com proporções diferentes', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[
          { id: 'a', value: 6, color: 'var(--group-taxas)' },
          { id: 'b', value: 3, color: 'var(--group-precos)' },
          { id: 'c', value: 7, color: 'var(--group-oferta)' },
        ]}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('renderiza 1 segment ocupando o anel quase inteiro', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[{ id: 'solo', value: 23, color: 'var(--accent)' }]}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('renderiza apenas o trilho quando segments=[]', () => {
    const html = renderToStaticMarkup(<DonutMulti segments={[]} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita centerLabel + centerSubLabel customizados', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[
          { id: 'a', value: 10, color: 'var(--accent)' },
          { id: 'b', value: 13, color: 'var(--ink)' },
        ]}
        centerLabel="23"
        centerSubLabel="indicadores"
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('respeita size, strokeWidth e gap customizados', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[
          { id: 'a', value: 1, color: '#a' },
          { id: 'b', value: 1, color: '#b' },
        ]}
        size={200}
        strokeWidth={24}
        gap={0}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('inclui <title> para a11y do segment quando label é fornecido', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[
          { id: 'taxas', value: 6, color: 'var(--group-taxas)', label: 'Taxas' },
        ]}
      />,
    );
    expect(html).toContain('<title>Taxas: 6</title>');
  });

  it('respeita aria-label customizado', () => {
    const html = renderToStaticMarkup(
      <DonutMulti
        segments={[{ id: 'x', value: 1, color: '#000' }]}
        ariaLabel="Composição por grupo, 23 indicadores"
      />,
    );
    expect(html).toContain('aria-label="Composição por grupo, 23 indicadores"');
  });
});
