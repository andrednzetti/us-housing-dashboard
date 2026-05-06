import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComposicaoCarteira } from './composicao-carteira';
import { mockIndicator, mockIndicatorsFile } from '../../test-utils/mock-data';
import type { Group } from '../../types';

function buildFile(distribution: Array<{ group: Group; count: number }>) {
  const indicators = distribution.flatMap((d) =>
    Array.from({ length: d.count }, (_, i) => mockIndicator({ id: `${d.group}_${i}`, group: d.group })),
  );
  return mockIndicatorsFile({ indicators });
}

describe('ComposicaoCarteira', () => {
  it('renderiza distribuição típica do dashboard (23 indicators)', () => {
    const file = buildFile([
      { group: 'taxas', count: 6 },
      { group: 'precos', count: 3 },
      { group: 'oferta', count: 7 },
      { group: 'sentimento', count: 3 },
      { group: 'macro', count: 4 },
    ]);
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    expect(html).toMatchSnapshot();
    // Total no centro do donut
    expect(html).toContain('>23<');
    // Lista lateral mostra todos os 5 grupos com counts corretos
    expect(html).toContain('Taxas &amp; Crédito');
    expect(html).toContain('Preços');
    expect(html).toContain('Oferta &amp; Construção');
    expect(html).toContain('Sentimento &amp; Atividade');
    expect(html).toContain('Macro &amp; Acessibilidade');
  });

  it('lista lateral preserva GROUP_ORDER independente da ordem dos indicators no file', () => {
    // Indicators na ordem inversa
    const file = mockIndicatorsFile({
      indicators: [
        mockIndicator({ id: 'm1', group: 'macro' }),
        mockIndicator({ id: 's1', group: 'sentimento' }),
        mockIndicator({ id: 'o1', group: 'oferta' }),
        mockIndicator({ id: 'p1', group: 'precos' }),
        mockIndicator({ id: 't1', group: 'taxas' }),
      ],
    });
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    // taxas aparece antes de precos antes de oferta etc. — ordem canônica
    const taxasIdx = html.indexOf('Taxas');
    const precosIdx = html.indexOf('Preços');
    const ofertaIdx = html.indexOf('Oferta');
    const sentimentoIdx = html.indexOf('Sentimento');
    const macroIdx = html.indexOf('Macro');
    expect(taxasIdx).toBeLessThan(precosIdx);
    expect(precosIdx).toBeLessThan(ofertaIdx);
    expect(ofertaIdx).toBeLessThan(sentimentoIdx);
    expect(sentimentoIdx).toBeLessThan(macroIdx);
  });

  it('mostra 0 para grupos vazios', () => {
    const file = buildFile([
      { group: 'taxas', count: 6 },
      { group: 'macro', count: 4 },
    ]);
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    // grupos sem indicators: precos=0, oferta=0, sentimento=0
    expect(html.match(/>0</g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('lida com file vazio (donut mostra 0 + lista mostra 0 em todos grupos)', () => {
    const file = mockIndicatorsFile({ indicators: [] });
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    // 5 grupos × 0 + 1 centerLabel=0 = 6 ocorrências de ">0<"
    expect(html.match(/>0</g)?.length).toBe(6);
    expect(html).toMatchSnapshot();
  });

  it('inclui DSeal decorativo (seal SVG no canto superior direito)', () => {
    const file = buildFile([{ group: 'taxas', count: 1 }]);
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    expect(html).toContain('viewBox="0 0 100 100"'); // DissenhaSeal viewBox
    expect(html).toContain('opacity:0.1'); // wrapper opacity
  });

  it('renderiza em banda escura com texto inverse', () => {
    const file = buildFile([{ group: 'taxas', count: 1 }]);
    const html = renderToStaticMarkup(<ComposicaoCarteira file={file} />);
    expect(html).toContain('background:var(--bg-band)');
    expect(html).toContain('color:var(--ink-inverse)');
  });
});
