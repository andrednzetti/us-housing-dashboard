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

  // ── Spotlight extension (Fase 4 PR 4c-1) ───────────────────────────
  // Snapshots dos cenários default acima continuam idênticos — confirma
  // backwards-compat. Os cenários abaixo cobrem as novas opt-ins.

  it('renderiza grid horizontal quando showGrid=true', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3, 4, 5]} showGrid />,
    );
    expect(html).toMatchSnapshot();
  });

  it('renderiza Y axis labels à direita quando showAxis=true', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3, 4, 5]} showAxis />,
    );
    expect(html).toMatchSnapshot();
  });

  it('combina grid + axis com formatY customizado', () => {
    const html = renderToStaticMarkup(
      <AreaChart
        series={[6.1, 6.2, 6.3, 6.4]}
        width={600}
        height={200}
        accent="var(--group-taxas)"
        showGrid
        showAxis
        formatY={(v) => `${v.toFixed(2)}%`}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('respeita gridLines customizado (gera gridLines+1 ticks)', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3, 4, 5]} showGrid gridLines={2} />,
    );
    expect(html).toMatchSnapshot();
  });

  it('grid/axis em série vazia: short-circuit sem ticks (linha plana só)', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[]} showGrid showAxis />,
    );
    expect(html).toMatchSnapshot();
  });

  // ── X axis (housekeeping pré-Fase 5) ───────────────────────────────

  it('renderiza X axis com tick marks + labels quando showXAxis=true', () => {
    const html = renderToStaticMarkup(
      <AreaChart
        series={[1, 2, 3, 4, 5]}
        showXAxis
        xLabels={['−4S', '−3S', '−2S', '−1S', 'HOJE']}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('combina grid + Y axis + X axis (cenário Spotlight completo)', () => {
    const html = renderToStaticMarkup(
      <AreaChart
        series={[6.1, 6.2, 6.3, 6.4, 6.5]}
        width={720}
        height={240}
        accent="var(--group-taxas)"
        showGrid
        showAxis
        showXAxis
        xLabels={['−12M', '−9M', '−6M', '−3M', 'HOJE']}
        formatY={(v) => `${v.toFixed(2)}%`}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('X axis silencia quando xLabels.length < 2 (precisa de pelo menos 2 ticks)', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3]} showXAxis xLabels={['HOJE']} />,
    );
    // Não tem linha de eixo X nem ticks — geometria igual ao default
    expect(html).not.toContain('xtick-');
    expect(html).not.toContain('xlabel-');
  });

  it('xLabels vazio (default) com showXAxis=true também silencia', () => {
    const html = renderToStaticMarkup(
      <AreaChart series={[1, 2, 3]} showXAxis />,
    );
    expect(html).not.toContain('xtick-');
  });
});
