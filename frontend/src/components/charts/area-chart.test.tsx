import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AreaChart } from './area-chart';

describe('AreaChart', () => {
  it('renderiza série típica com defaults', () => {
    const html = renderToStaticMarkup(<AreaChart series={[1, 2, 3, 4, 5]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com série vazia desenhando linha plana sem área', () => {
    const html = renderToStaticMarkup(<AreaChart series={[]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com ponto único desenhando linha plana sem área', () => {
    const html = renderToStaticMarkup(<AreaChart series={[42]} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com série plana renderizando área', () => {
    const html = renderToStaticMarkup(<AreaChart series={[3, 3, 3, 3]} />);
    expect(html).toMatchSnapshot();
  });

  it('omite a linha quando showLine=false', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3, 4]} showLine={false} fillOpacity={0.4} />,
    );
    expect(html).toMatchSnapshot();
  });

  it('respeita dimensões e accent customizados', () => {
    const html = renderToStaticMarkup(
      <AreaChart
        series={[10, 20, 15, 30, 25, 40]}
        width={600}
        height={200}
        accent="var(--group-precos)"
        fillOpacity={0.25}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('respeita ariaLabel customizado', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3]} ariaLabel="Mortgage 30Y, série 1 ano" />,
    );
    expect(html).toMatchSnapshot();
  });
});
