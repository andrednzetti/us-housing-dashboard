import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CronicaEvents } from './cronica-events';
import type { Event as MarketEvent } from '../../types';

const REAL_EVENTS: MarketEvent[] = [
  { date: '2026-05-05', tag: 'FED', text: 'FOMC mantém taxa em 4,25-4,50%. Tom dovish.' },
  { date: '2026-05-02', tag: 'DADO', text: 'Mortgage apps sobem 4,2% s/s.' },
  { date: '2026-04-28', tag: 'NAHB', text: 'HMI sobe 3 pts para 47.' },
];

describe('CronicaEvents', () => {
  it('renderiza timeline com 3 events (1º em accent, demais com rule)', () => {
    const html = renderToStaticMarkup(<CronicaEvents events={REAL_EVENTS} />);
    expect(html).toMatchSnapshot();
    // Cabeçalho exibe count
    expect(html).toContain('Crônica da semana');
    expect(html).toContain('>3<');
    // Datas formatadas em pt-BR curto
    expect(html).toContain('05.MAI');
    expect(html).toContain('02.MAI');
    expect(html).toContain('28.ABR');
  });

  it('item mais recente (índice 0) recebe cor accent no dot', () => {
    const html = renderToStaticMarkup(<CronicaEvents events={REAL_EVENTS} />);
    // O dot accent aparece exatamente uma vez (o item 0)
    const accentDotMatches = html.match(/background:var\(--accent\);border:1\.5px solid var\(--accent\)/g);
    expect(accentDotMatches?.length).toBe(1);
  });

  it('renderiza connectors entre items mas não após o último', () => {
    const html = renderToStaticMarkup(<CronicaEvents events={REAL_EVENTS} />);
    // Para 3 events, deve haver 2 connectors (entre 0-1 e 1-2)
    const connectorMatches = html.match(/width:0\.5px;background:var\(--rule\)/g);
    expect(connectorMatches?.length).toBe(2);
  });

  it('renderiza empty state quando events=[]', () => {
    const html = renderToStaticMarkup(<CronicaEvents events={[]} />);
    expect(html).toContain('Nenhum evento esta semana');
    expect(html).toContain('>0<'); // stamp 0
    expect(html).toMatchSnapshot();
  });

  it('1 único evento: dot accent, sem connector', () => {
    const html = renderToStaticMarkup(
      <CronicaEvents events={[REAL_EVENTS[0]!]} />,
    );
    const accentDotMatches = html.match(/background:var\(--accent\);border:1\.5px solid var\(--accent\)/g);
    expect(accentDotMatches?.length).toBe(1);
    const connectorMatches = html.match(/width:0\.5px;background:var\(--rule\)/g);
    expect(connectorMatches).toBeNull();
    expect(html).toMatchSnapshot();
  });

  it('renderiza tags em uppercase via Stamp (não dependente de CSS)', () => {
    const html = renderToStaticMarkup(<CronicaEvents events={REAL_EVENTS} />);
    expect(html).toContain('>FED<');
    expect(html).toContain('>DADO<');
    expect(html).toContain('>NAHB<');
  });
});
