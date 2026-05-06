/**
 * QuadroResumido — section "Síntese · Posição em DD.MM.AAAA" da Variação D.
 *
 * **Não é uma grade de cards flutuantes** — é uma section única invoice-style
 * (`variation-d.jsx` linhas 193-222) com:
 *
 *   1. Header da section: eyebrow mono + h2 serif + stamp "N destaques"
 *   2. Grid `repeat(4, 1fr)` interno separado por dividers verticais
 *      (cada coluna é um `<KpiCell />`, não um card isolado)
 *   3. Footer da section: texto editorial summary à esquerda + "Próxima
 *      atualização · DD.MMM.AAAA · 14h00 UTC" à direita
 *
 * Indicadores cobertos (decisão consolidada do plano-mestre §1.4):
 *   - mortgage30 (taxas) → destacado com cor do grupo (laranja)
 *   - cs_national (precos), months_supply (oferta), nahb (sentimento) → ink
 *
 * O destaque do mortgage30 espelha o handoff (linhas 204, 212) — outros 3
 * mantêm a cor neutra para hierarquia visual: o leitor vai direto à taxa de
 * juros. Se quiser destacar outro item, basta adicionar o id ao
 * `HIGHLIGHTED_IDS`.
 *
 * @example
 *   <QuadroResumido file={data} />
 */

import type { CSSProperties, JSX } from 'react';
import type { IndicatorsFile } from '../../types';
import { GROUPS } from '../../lib/groups';
import {
  formatPtBrEditorial,
  formatPtBrNumeric,
  nextTuesday,
} from '../../lib/dates';
import { selectQuadroIndicators } from '../../lib/selectors';
import { Stamp } from '../shell/stamp';
import { KpiCell } from './kpi-cell';

const PLACEHOLDER = '—';

/** IDs que recebem cor accent no número (todos os outros ficam em ink). */
const HIGHLIGHTED_IDS = new Set<string>(['mortgage30']);

// TODO(post-Fase 5): derivar das regras de negócio dos 4 indicadores (sentimento agregado).
const EDITORIAL_SUMMARY = 'Demanda em recuperação · construtores otimistas · oferta apertada';

const sectionStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  position: 'relative',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  padding: 'var(--space-5) var(--space-7) var(--space-3)',
  borderBottom: 'var(--border-card)',
  gap: 'var(--space-4)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label-l)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
  margin: 0,
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-card)',
  fontWeight: 500,
  letterSpacing: 'var(--ls-card)',
  margin: 'var(--space-1) 0 0',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  borderBottom: 'var(--border-card)',
};

const sectionFooterStyle: CSSProperties = {
  padding: 'var(--space-3) var(--space-7)',
  background: 'var(--rule-soft)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: '0.1em',
  color: 'var(--ink-soft)',
  textTransform: 'uppercase',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-4)',
  flexWrap: 'wrap',
};

function pluralizeDestaques(n: number): string {
  return `${n} destaque${n === 1 ? '' : 's'}`;
}

/** Constrói as duas strings da footer-row a partir de `generatedAt`. */
function buildFooterDates(generatedAt: string | undefined): {
  position: string;
  next: string;
} {
  if (!generatedAt) return { position: PLACEHOLDER, next: PLACEHOLDER };
  const base = new Date(generatedAt);
  if (Number.isNaN(base.getTime())) return { position: PLACEHOLDER, next: PLACEHOLDER };
  return {
    position: formatPtBrNumeric(base),
    next: formatPtBrEditorial(nextTuesday(base)),
  };
}

export interface QuadroResumidoProps {
  file: IndicatorsFile;
}

export function QuadroResumido({ file }: QuadroResumidoProps): JSX.Element {
  const items = selectQuadroIndicators(file);
  const { position, next } = buildFooterDates(file.generatedAt);

  return (
    <section style={sectionStyle} aria-labelledby="quadro-resumido-title">
      <div style={sectionHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>Síntese · Posição em {position}</div>
          <h2 id="quadro-resumido-title" style={titleStyle}>
            Quadro resumido da semana
          </h2>
        </div>
        <Stamp>{pluralizeDestaques(items.length)}</Stamp>
      </div>

      <div style={gridStyle} role="list">
        {items.map((ind, i) => {
          const isLast = i === items.length - 1;
          const cellWrapperStyle: CSSProperties = {
            borderRight: isLast ? 'none' : 'var(--border-card)',
          };
          const valueColor = HIGHLIGHTED_IDS.has(ind.id)
            ? GROUPS[ind.group].accent
            : 'var(--ink)';
          return (
            <div key={ind.id} style={cellWrapperStyle} role="listitem">
              <KpiCell indicator={ind} valueColor={valueColor} />
            </div>
          );
        })}
      </div>

      <div style={sectionFooterStyle}>
        <span>{EDITORIAL_SUMMARY}</span>
        <span>Próxima atualização · {next} · 14h00 UTC</span>
      </div>
    </section>
  );
}
