import { describe, expect, it } from 'vitest';

import { fmtDelta, fmtK, fmtNum, fmtPct, fmtPriceK, fmtUSD, fmtValue } from './format';

describe('fmtPct', () => {
  it('formata valor positivo SEM sinal e em pt-BR (vírgula)', () => {
    expect(fmtPct(0.18)).toBe('0,18%');
  });

  it('formata negativo com sinal natural da locale', () => {
    expect(fmtPct(-0.18)).toBe('-0,18%');
  });

  it('respeita decimals customizado', () => {
    expect(fmtPct(2.4, 1)).toBe('2,4%');
  });

  it('zero é exibido sem sinal', () => {
    expect(fmtPct(0)).toBe('0,00%');
  });

  it('decimals padrão é 2', () => {
    expect(fmtPct(3.14159)).toBe('3,14%');
  });

  it('decimals=0 produz inteiro sem casa decimal', () => {
    expect(fmtPct(5, 0)).toBe('5%');
  });

  it('valor típico Mortgage30 (6.3 com 2 decimais)', () => {
    expect(fmtPct(6.3)).toBe('6,30%');
  });
});

describe('fmtNum (locale pt-BR)', () => {
  it('separa milhar com ponto', () => {
    expect(fmtNum(1382)).toBe('1.382');
  });

  it('decimal usa vírgula', () => {
    expect(fmtNum(218.4, 1)).toBe('218,4');
  });

  it('valores < 1 são exibidos sem leading zeros sobressalentes', () => {
    expect(fmtNum(0.5, 2)).toBe('0,5');
  });

  it('decimals padrão é 1', () => {
    expect(fmtNum(3.14159)).toBe('3,1');
  });

  it('zero', () => {
    expect(fmtNum(0)).toBe('0');
  });

  it('número grande com decimais', () => {
    expect(fmtNum(1234567.89, 2)).toBe('1.234.567,89');
  });

  it('inteiro permanece inteiro mesmo com decimals > 0', () => {
    expect(fmtNum(1000, 2)).toBe('1.000');
  });
});

describe('fmtUSD', () => {
  it('formata com prefixo US$ e separadores pt-BR', () => {
    expect(fmtUSD(412300)).toBe('US$ 412.300');
  });

  it('zero', () => {
    expect(fmtUSD(0)).toBe('US$ 0');
  });

  it('valor pequeno sem milhares', () => {
    expect(fmtUSD(800)).toBe('US$ 800');
  });

  it('descarta casas decimais', () => {
    expect(fmtUSD(412300.99)).toBe('US$ 412.301');
  });
});

describe('fmtK', () => {
  it('valor >= 1000 ganha sufixo k com 1 decimal', () => {
    expect(fmtK(1382)).toBe('1.4k');
  });

  it('valor < 1000 não ganha sufixo', () => {
    expect(fmtK(218)).toBe('218');
  });

  it('borda de 999 (sem sufixo)', () => {
    expect(fmtK(999)).toBe('999');
  });

  it('borda de 1000 (com sufixo)', () => {
    expect(fmtK(1000)).toBe('1.0k');
  });

  it('zero', () => {
    expect(fmtK(0)).toBe('0');
  });
});

describe('fmtValue dispatcher', () => {
  it('despacha para fmtPct quando type=pct', () => {
    expect(fmtValue(6.42, { type: 'pct', decimals: 2 })).toBe('6,42%');
  });

  it('respeita decimals do spec pct', () => {
    expect(fmtValue(2.4, { type: 'pct', decimals: 1 })).toBe('2,4%');
  });

  it('pct sem decimals usa default 2', () => {
    expect(fmtValue(0.18, { type: 'pct' })).toBe('0,18%');
  });

  it('despacha para fmtUSD quando type=usd', () => {
    expect(fmtValue(412300, { type: 'usd' })).toBe('US$ 412.300');
  });

  it('despacha para fmtNum quando type=num com decimals', () => {
    expect(fmtValue(218.4, { type: 'num', decimals: 1 })).toBe('218,4');
  });

  it('num sem decimals usa default 1', () => {
    expect(fmtValue(1382.45, { type: 'num' })).toBe('1.382,5');
  });

  it('despacha para fmtK quando type=k', () => {
    expect(fmtValue(1382, { type: 'k' })).toBe('1.4k');
  });

  it('cobre os 4 variantes do FmtSpec', () => {
    // Smoke test garantindo que nenhum case do switch é unhandled
    expect(fmtValue(1, { type: 'pct' })).toContain('%');
    expect(fmtValue(1, { type: 'usd' })).toContain('US$');
    expect(fmtValue(1, { type: 'num' })).toBe('1');
    expect(fmtValue(1, { type: 'k' })).toBe('1');
  });
});

describe('fmtDelta', () => {
  it('formata delta positivo com sinal + e vírgula pt-BR', () => {
    expect(fmtDelta(0.18, 'pp')).toBe('+0,18pp');
  });

  it('formata delta negativo com sinal − (U+2212), não hífen ASCII', () => {
    expect(fmtDelta(-0.6, 'm')).toBe('−0,6m');
  });

  it('formata zero com símbolo ± e 1 decimal mínimo', () => {
    expect(fmtDelta(0, 'pts')).toBe('±0,0pts');
  });

  it('exibe até 2 decimais quando o valor precisa', () => {
    expect(fmtDelta(0.184, 'pp')).toBe('+0,18pp');
  });

  it('exibe 2 decimais para Mortgage30-like (0.07 pp)', () => {
    expect(fmtDelta(0.07, 'pp')).toBe('+0,07pp');
  });

  it('exibe até 2 decimais para % (3.46% → +3,46%)', () => {
    expect(fmtDelta(3.46, '%')).toBe('+3,46%');
  });

  it('lida com unidade composta (% a.a.) preservando 2 decimais', () => {
    expect(fmtDelta(0.66, '% a.a.')).toBe('+0,66% a.a.');
  });

  it('lida com idx/pt e outras unidades curtas (min 1 decimal)', () => {
    expect(fmtDelta(2, 'idx')).toBe('+2,0idx');
    expect(fmtDelta(-1, 'pt')).toBe('−1,0pt');
  });

  it('zero negativo (-0) também é tratado como zero (±)', () => {
    expect(fmtDelta(-0, 'pp')).toBe('±0,0pp');
  });

  it('Months Supply-like (-0.6 m) usa minus tipográfico', () => {
    expect(fmtDelta(-0.6, 'm')).toBe('−0,6m');
  });
});

describe('fmtPriceK', () => {
  it('formata preço típico de region/metro', () => {
    expect(fmtPriceK(478200)).toBe('$478k');
  });

  it('arredonda para múltiplo mais próximo de 1000', () => {
    expect(fmtPriceK(99500)).toBe('$100k');
    expect(fmtPriceK(99499)).toBe('$99k');
  });

  it('lida com zero', () => {
    expect(fmtPriceK(0)).toBe('$0k');
  });

  it('formata valor menor que 1000', () => {
    expect(fmtPriceK(800)).toBe('$1k');
  });

  it('milhões', () => {
    expect(fmtPriceK(1500000)).toBe('$1500k');
  });
});
