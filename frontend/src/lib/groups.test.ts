import { describe, expect, it } from 'vitest';

import type { Group } from '../types';
import { GROUP_ORDER, GROUPS } from './groups';

describe('GROUPS catálogo', () => {
  it('contém exatamente os 5 grupos do schema v2', () => {
    const expected: Group[] = ['taxas', 'precos', 'oferta', 'sentimento', 'macro'];
    expect(Object.keys(GROUPS).sort()).toEqual([...expected].sort());
  });

  it('cada grupo expõe id/label/short/accent', () => {
    for (const id of Object.keys(GROUPS) as Group[]) {
      const meta = GROUPS[id];
      expect(meta.id).toBe(id);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.short.length).toBeGreaterThan(0);
      expect(meta.accent).toMatch(/^var\(--group-/);
    }
  });

  it('shorts são uppercase', () => {
    for (const meta of Object.values(GROUPS)) {
      expect(meta.short).toBe(meta.short.toUpperCase());
    }
  });
});

describe('GROUP_ORDER', () => {
  it('preserva a ordem editorial canônica da Variação D', () => {
    expect(GROUP_ORDER).toEqual(['taxas', 'precos', 'oferta', 'sentimento', 'macro']);
  });

  it('cobre todas as keys de GROUPS', () => {
    expect([...GROUP_ORDER].sort()).toEqual(Object.keys(GROUPS).sort());
  });
});
