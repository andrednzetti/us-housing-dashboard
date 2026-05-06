/**
 * AnexosSection — wrapper grid 2-col da última section da Variação D
 * (`variation-d.jsx` linhas 373-416). Envelopa Anexo I (Regiões) à
 * esquerda e Anexo II (Top Metros) à direita.
 *
 * Layout: grid 2-col `1fr 1fr` com gap 28px. Em telas mais estreitas o
 * `minmax(0, 1fr)` permite o grid colapsar via media-query (a ser
 * adicionada conforme necessidade — hoje os panels são responsivos
 * suficientes em desktop padrão).
 */

import type { CSSProperties, JSX } from 'react';
import type { Metro, Region } from '../../types';
import { RegioesPanel } from './regioes-panel';
import { MetrosPanel } from './metros-panel';

const sectionStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: 'var(--space-7)',
  alignItems: 'start',
};

export interface AnexosSectionProps {
  regions: ReadonlyArray<Region>;
  metros: ReadonlyArray<Metro>;
  /** topN do Anexo II. Default: 8. */
  topN?: number;
}

export function AnexosSection({
  regions,
  metros,
  topN,
}: AnexosSectionProps): JSX.Element {
  return (
    <section style={sectionStyle} aria-label="Anexos do boletim — regiões e metros">
      <RegioesPanel regions={regions} />
      <MetrosPanel metros={metros} {...(topN !== undefined ? { topN } : {})} />
    </section>
  );
}
