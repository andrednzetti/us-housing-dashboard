/**
 * Snapshot tests para Sparkline.
 *
 * Usa `react-dom/server` em vez de jsdom — environment Node puro, mais rápido,
 * matches o setup de `vite.config.ts` (`environment: 'node'`).
 */

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Sparkline } from './sparkline';

describe('Sparkline', () => {
  it('renderiza série típica com defaults', () => {
    const html = renderToStaticMarkup(<Sparkline series={[1, 2, 3, 4, 5]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com série vazia desenhando linha plana', () => {
    const html = renderToStaticMarkup(<Sparkline series={[]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com ponto único desenhando linha plana', () => {
    const html = renderToStaticMarkup(<Sparkline series={[3.5]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com série plana (todos valores iguais)', () => {
    const html = renderToStaticMarkup(<Sparkline series={[2, 2, 2, 2]} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita dimensões e accent customizados', () => {
    const html = renderToStaticMarkup(
      <Sparkline
        series={[1, 5, 3, 7, 4]}
        width={400}
        height={80}
        accent="var(--group-taxas)"
        strokeWidth={2}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('inclui período no aria-label quando fornecido', () => {
    const html = renderToStaticMarkup(<Sparkline series={[1, 2, 3]} period="6M" />);
    expect(html).toMatchSnapshot();
  });

  it('respeita ariaLabel customizado quando fornecido', () => {
    const html = renderToStaticMarkup(
      <Sparkline series={[1, 2, 3]} ariaLabel="Mortgage 30Y, últimos 6 meses" />,
    );
    expect(html).toMatchSnapshot();
  });
});
