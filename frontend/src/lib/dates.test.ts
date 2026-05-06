import { describe, it, expect } from 'vitest';
import {
  nextTuesday,
  formatPtBrEditorial,
  formatPtBrNumeric,
  PT_BR_MONTHS_ABBR,
} from './dates';

describe('nextTuesday', () => {
  it('quando base é terça, retorna a próxima terça (7 dias depois)', () => {
    // 2026-05-05 = terça
    const tue = new Date('2026-05-05T00:00:00Z');
    const next = nextTuesday(tue);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-12');
  });

  it('quando base é segunda, retorna a terça seguinte (+1d)', () => {
    const mon = new Date('2026-05-04T00:00:00Z');
    const next = nextTuesday(mon);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-05');
  });

  it('quando base é quarta, retorna a terça seguinte (+6d)', () => {
    const wed = new Date('2026-05-06T00:00:00Z');
    const next = nextTuesday(wed);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-12');
  });

  it('quando base é domingo, retorna a terça seguinte (+2d)', () => {
    const sun = new Date('2026-05-10T00:00:00Z');
    const next = nextTuesday(sun);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-12');
  });

  it('quando base é sábado, retorna a terça seguinte (+3d)', () => {
    const sat = new Date('2026-05-09T00:00:00Z');
    const next = nextTuesday(sat);
    expect(next.toISOString().slice(0, 10)).toBe('2026-05-12');
  });

  it('preserva hora/minuto/segundo da base', () => {
    const wed = new Date('2026-05-06T17:44:11Z');
    const next = nextTuesday(wed);
    expect(next.toISOString()).toBe('2026-05-12T17:44:11.000Z');
  });
});

describe('formatPtBrEditorial', () => {
  it('formata data típica em DD.MMM.AAAA', () => {
    expect(formatPtBrEditorial(new Date('2026-05-12T14:00:00Z'))).toBe('12.MAI.2026');
  });

  it('formata janeiro corretamente', () => {
    expect(formatPtBrEditorial(new Date('2026-01-03T00:00:00Z'))).toBe('03.JAN.2026');
  });

  it('formata dezembro corretamente', () => {
    expect(formatPtBrEditorial(new Date('2026-12-22T23:00:00Z'))).toBe('22.DEZ.2026');
  });

  it('retorna placeholder em data inválida', () => {
    expect(formatPtBrEditorial(new Date('not-a-date'))).toBe('—');
  });
});

describe('formatPtBrNumeric', () => {
  it('formata data típica em DD.MM.AAAA', () => {
    expect(formatPtBrNumeric(new Date('2026-05-06T17:44:11Z'))).toBe('06.05.2026');
  });

  it('zero-padda dia e mês', () => {
    expect(formatPtBrNumeric(new Date('2026-01-03T00:00:00Z'))).toBe('03.01.2026');
  });

  it('retorna placeholder em data inválida', () => {
    expect(formatPtBrNumeric(new Date('not-a-date'))).toBe('—');
  });
});

describe('PT_BR_MONTHS_ABBR', () => {
  it('tem exatamente 12 entradas', () => {
    expect(PT_BR_MONTHS_ABBR).toHaveLength(12);
  });

  it('todas em uppercase de 3 letras', () => {
    PT_BR_MONTHS_ABBR.forEach((m) => {
      expect(m).toMatch(/^[A-Z]{3}$/);
    });
  });
});
