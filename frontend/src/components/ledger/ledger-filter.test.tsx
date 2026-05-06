import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LedgerFilter } from './ledger-filter';

describe('LedgerFilter', () => {
  it('renderiza 6 pills (TODOS + 5 grupos) com active=all default', () => {
    const html = renderToStaticMarkup(<LedgerFilter active="all" onChange={() => {}} />);
    expect(html).toMatchSnapshot();
    expect(html.match(/role="tab"/g)).toHaveLength(6);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/aria-selected="false"/g)).toHaveLength(5);
  });

  it('marca a pill correta quando active=taxas', () => {
    const html = renderToStaticMarkup(<LedgerFilter active="taxas" onChange={() => {}} />);
    expect(html).toMatchSnapshot();
    // Confere que a pill TAXAS aparece com aria-selected=true
    const taxasMatch = html.match(/<button[^>]*aria-selected="true"[^>]*>TAXAS<\/button>/);
    expect(taxasMatch).toBeTruthy();
  });

  it('marca todas as 5 grupos quando active varia', () => {
    for (const group of ['taxas', 'precos', 'oferta', 'sentimento', 'macro'] as const) {
      const html = renderToStaticMarkup(<LedgerFilter active={group} onChange={() => {}} />);
      expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    }
  });

  it('não invoca onChange durante render (handler tipado)', () => {
    const onChange = vi.fn<(v: 'all' | 'taxas' | 'precos' | 'oferta' | 'sentimento' | 'macro') => void>();
    renderToStaticMarkup(<LedgerFilter active="all" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});
