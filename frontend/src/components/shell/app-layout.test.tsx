import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  it('renderiza header, main com children e footer na ordem correta', () => {
    const html = renderToStaticMarkup(
      <AppLayout
        header={<div data-test="hdr">HEADER</div>}
        footer={<div data-test="ftr">FOOTER</div>}
      >
        <div data-test="main">CONTENT</div>
      </AppLayout>,
    );
    expect(html).toMatchSnapshot();
    // Sanidade: ordem é headerHtml < mainHtml < footerHtml
    const headerIdx = html.indexOf('HEADER');
    const mainIdx = html.indexOf('CONTENT');
    const footerIdx = html.indexOf('FOOTER');
    expect(headerIdx).toBeGreaterThanOrEqual(0);
    expect(mainIdx).toBeGreaterThan(headerIdx);
    expect(footerIdx).toBeGreaterThan(mainIdx);
  });

  it('renderiza com children vazios sem quebrar (loading state)', () => {
    const html = renderToStaticMarkup(
      <AppLayout header={<header>H</header>} footer={<footer>F</footer>}>
        {null}
      </AppLayout>,
    );
    expect(html).toMatchSnapshot();
  });
});
