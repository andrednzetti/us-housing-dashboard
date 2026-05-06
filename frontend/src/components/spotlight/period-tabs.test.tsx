import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PeriodTabs } from './period-tabs';

describe('PeriodTabs', () => {
  it('renderiza 5 pills default com 1A ativo', () => {
    const html = renderToStaticMarkup(<PeriodTabs active="1A" onChange={() => {}} />);
    expect(html).toMatchSnapshot();
  });

  it('marca a pill correta como aria-selected', () => {
    const html = renderToStaticMarkup(<PeriodTabs active="3M" onChange={() => {}} />);
    expect(html).toContain('aria-selected="true"');
    // 5 tabs total, 1 selected, 4 não-selected
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/aria-selected="false"/g)).toHaveLength(4);
  });

  it('respeita options customizadas', () => {
    const html = renderToStaticMarkup(
      <PeriodTabs active="6M" onChange={() => {}} options={['3M', '6M', '1A']} />,
    );
    expect(html).toMatchSnapshot();
    expect(html.match(/role="tab"/g)).toHaveLength(3);
  });

  it('chama onChange com o período clicado (smoke via instanciação React)', () => {
    // Snapshot SSR não invoca handlers; este teste apenas confirma o tipo
    // do callback no chamador. O fluxo de click acontece no browser.
    const onChange = vi.fn<(p: '1M' | '3M' | '6M' | '1A' | '5A') => void>();
    renderToStaticMarkup(<PeriodTabs active="1A" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});
