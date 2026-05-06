import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HBarSimple } from './h-bar-simple';

describe('HBarSimple', () => {
  it('renderiza com label, valor e accent default', () => {
    const html = renderToStaticMarkup(<HBarSimple label="Northeast" value={418} max={1000} />);
    expect(html).toMatchSnapshot();
  });

  it('renderiza sem label (apenas barra + valor)', () => {
    const html = renderToStaticMarkup(<HBarSimple value={50} max={100} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com value=0 (sem fill, mas mostra trilho)', () => {
    const html = renderToStaticMarkup(<HBarSimple label="Idle" value={0} max={100} />);
    expect(html).toMatchSnapshot();
  });

  it('clampa value > max para 100% sem extrapolar', () => {
    const html = renderToStaticMarkup(<HBarSimple label="Overflow" value={250} max={100} />);
    expect(html).toMatchSnapshot();
  });

  it('lida com max=0 sem dividir por zero', () => {
    const html = renderToStaticMarkup(<HBarSimple label="Edge" value={5} max={0} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita dimensões, accent e valueLabel custom', () => {
    const html = renderToStaticMarkup(
      <HBarSimple
        label="Top Metro"
        value={875}
        max={1000}
        valueLabel="US$ 875k"
        accent="var(--group-precos)"
        width={420}
        height={48}
      />,
    );
    expect(html).toMatchSnapshot();
  });
});
