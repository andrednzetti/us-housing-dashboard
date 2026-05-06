import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Gauge } from './gauge';

describe('Gauge', () => {
  it('renderiza valor típico com defaults (escala 0-100)', () => {
    const html = renderToStaticMarkup(<Gauge value={67} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com valor no mínimo (sem arco preenchido)', () => {
    const html = renderToStaticMarkup(<Gauge value={0} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com valor no máximo (arco completo)', () => {
    const html = renderToStaticMarkup(<Gauge value={100} />);
    expect(html).toMatchSnapshot();
  });

  it('clampa valores fora do range [min,max]', () => {
    const negativeHtml = renderToStaticMarkup(<Gauge value={-50} min={0} max={100} />);
    const overflowHtml = renderToStaticMarkup(<Gauge value={250} min={0} max={100} />);
    expect(negativeHtml).toMatchSnapshot('clamped-negative');
    expect(overflowHtml).toMatchSnapshot('clamped-overflow');
  });

  it('aceita escala custom (ex.: 0-5 para Likert)', () => {
    const html = renderToStaticMarkup(<Gauge value={3.4} min={0} max={5} centerLabel="3.4" />);
    expect(html).toMatchSnapshot();
  });

  it('aceita centerLabel customizado e accent', () => {
    const html = renderToStaticMarkup(
      <Gauge value={75} centerLabel="75/100" accent="var(--group-sentimento)" />,
    );
    expect(html).toMatchSnapshot();
  });

  it('respeita dimensões customizadas', () => {
    const html = renderToStaticMarkup(<Gauge value={50} width={240} height={140} />);
    expect(html).toMatchSnapshot();
  });
});
