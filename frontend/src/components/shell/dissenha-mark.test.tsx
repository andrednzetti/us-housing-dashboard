import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DissenhaWordmark, DissenhaSeal } from './dissenha-mark';

describe('DissenhaWordmark', () => {
  it('renderiza com defaults', () => {
    const html = renderToStaticMarkup(<DissenhaWordmark />);
    expect(html).toMatchSnapshot();
  });

  it('respeita height customizado', () => {
    const html = renderToStaticMarkup(<DissenhaWordmark height={64} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita color customizado (uso fora da banda escura)', () => {
    const html = renderToStaticMarkup(<DissenhaWordmark color="var(--ink)" />);
    expect(html).toMatchSnapshot();
  });
});

describe('DissenhaSeal', () => {
  it('renderiza com defaults', () => {
    const html = renderToStaticMarkup(<DissenhaSeal />);
    expect(html).toMatchSnapshot();
  });

  it('respeita size customizado', () => {
    const html = renderToStaticMarkup(<DissenhaSeal size={64} />);
    expect(html).toMatchSnapshot();
  });

  it('respeita color customizado', () => {
    const html = renderToStaticMarkup(<DissenhaSeal color="var(--ink-inverse)" />);
    expect(html).toMatchSnapshot();
  });
});
