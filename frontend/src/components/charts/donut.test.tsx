import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Donut } from './donut';

describe('Donut', () => {
  it('renderiza valor típico com defaults', () => {
    const html = renderToStaticMarkup(<Donut value={34} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com valor 0 (apenas trilho, sem arco preenchido)', () => {
    const html = renderToStaticMarkup(<Donut value={0} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com valor 100 (anel cheio)', () => {
    const html = renderToStaticMarkup(<Donut value={100} />);
    expect(html).toMatchSnapshot();
  });

  it('clampa valores fora do range [0,100]', () => {
    const negativeHtml = renderToStaticMarkup(<Donut value={-25} />);
    const overflowHtml = renderToStaticMarkup(<Donut value={142} />);
    expect(negativeHtml).toMatchSnapshot('clamped-negative');
    expect(overflowHtml).toMatchSnapshot('clamped-overflow');
  });

  it('respeita centerLabel customizado', () => {
    const html = renderToStaticMarkup(<Donut value={67} centerLabel="67/100" />);
    expect(html).toMatchSnapshot();
  });

  it('respeita size, strokeWidth e accent customizados', () => {
    const html = renderToStaticMarkup(
      <Donut value={75} size={180} strokeWidth={20} accent="var(--group-sentimento)" />,
    );
    expect(html).toMatchSnapshot();
  });
});
