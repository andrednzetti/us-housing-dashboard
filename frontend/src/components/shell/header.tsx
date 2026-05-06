/**
 * Header — banda escura no topo do dashboard (estilo boletim/invoice).
 *
 * Portado de `docs/handoff/dissenha_dashboard/variation-d.jsx` linhas 145-191.
 * Estrutura:
 *   - Banda `var(--bg-band)` com gradient accent gold no topo (3px)
 *   - Top row: wordmark Dissenha à esquerda + meta de boletim à direita
 *     ("Boletim · Nº 48 / Vol. 06" e data formatada do `generatedAt`)
 *   - Borda separadora gold sutil
 *   - Bottom row em grid 1fr 1fr:
 *       · "Boletim Semanal" + título "Mercado Imobiliário / dos Estados Unidos"
 *       · "Destinatário" + descritivo italic + 2 stamps (Confidencial / Atualizado·Ter)
 *
 * Acessibilidade: usa `<header>` semântico. Wordmark tem `aria-label` próprio.
 *
 * Boletim Nº/Vol. ainda hardcoded (Nº 48 / Vol. 06). Lógica de incremento
 * automático baseada em `generatedAt` é trabalho de housekeeping pós-Fase 5.
 */

import type { CSSProperties, JSX } from 'react';
import { PT_BR_MONTHS_ABBR } from '../../lib/dates';
import { DissenhaWordmark } from './dissenha-mark';
import { Stamp } from './stamp';

/** Formata `2026-05-06T17:44:11Z` → `06 · MAI · 2026` em UTC. */
function formatBoletimDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = PT_BR_MONTHS_ABBR[d.getUTCMonth()] ?? '—';
  const year = d.getUTCFullYear();
  return `${day} · ${month} · ${year}`;
}

const PLACEHOLDER = '—';

// TODO(housekeeping pós-Fase 5): derivar Nº e Vol. automaticamente a partir
// de `generatedAt` (ex.: contar terças desde a primeira execução do CI).
const BOLETIM_LABEL = 'Boletim · Nº 48 / Vol. 06';

const TOP_STRIPE_HEIGHT = 3;

const headerStyle: CSSProperties = {
  background: 'var(--bg-band)',
  color: 'var(--ink-inverse)',
  padding: 'var(--space-8) var(--space-12) var(--space-7)',
  position: 'relative',
};

const topStripeStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: TOP_STRIPE_HEIGHT,
  background:
    'linear-gradient(90deg, var(--accent) 0%, var(--accent) 35%, transparent 100%)',
};

const topRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 'var(--space-8)',
  alignItems: 'flex-start',
  marginBottom: 'var(--space-7)',
};

const metaRightStyle: CSSProperties = { textAlign: 'right' };

const metaLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label)',
  color: 'rgba(232, 230, 224, 0.55)',
  textTransform: 'uppercase',
};

const metaDateStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  color: 'var(--accent)',
  marginTop: 'var(--space-1)',
  letterSpacing: 'var(--ls-wordmk)',
};

const bottomRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--space-12)',
  paddingTop: 'var(--space-6)',
  borderTop: '0.5px solid rgba(184, 137, 58, 0.35)',
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label-l)',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-3)',
};

const heroStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-hero)',
  fontWeight: 400,
  letterSpacing: 'var(--ls-hero)',
  lineHeight: 'var(--lh-hero)',
  margin: 0,
};

const heroEmStyle: CSSProperties = {
  fontStyle: 'italic',
  color: 'var(--accent)',
  fontWeight: 400,
};

const recipientCopyStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'var(--fs-body)',
  fontStyle: 'italic',
  lineHeight: 'var(--lh-editorial)',
  color: 'rgba(232, 230, 224, 0.85)',
  margin: 0,
};

const stampsRowStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  marginTop: 'var(--space-4)',
};

export interface HeaderProps {
  /** Timestamp ISO 8601 da geração do payload (`indicators.json#generatedAt`). */
  generatedAt?: string | undefined;
  /** Versão do schema. Não é exibido textualmente no header — reservado pra evolução. */
  schemaVersion?: string | undefined;
}

// `schemaVersion` faz parte da API por simetria com Footer e fácil leitura
// do App.tsx; não é renderizado no header (a Variação D não pede). Marcamos
// como _ no destructure para evitar warning de noUnusedParameters quando
// chega via spread.
export function Header({ generatedAt, schemaVersion: _schemaVersion }: HeaderProps): JSX.Element {
  const dateLabel = generatedAt ? formatBoletimDate(generatedAt) : PLACEHOLDER;

  return (
    <header style={headerStyle}>
      <div style={topStripeStyle} aria-hidden />

      <div style={topRowStyle}>
        <DissenhaWordmark height={48} />
        <div style={metaRightStyle}>
          <div style={metaLabelStyle}>{BOLETIM_LABEL}</div>
          <div style={metaDateStyle}>{dateLabel}</div>
        </div>
      </div>

      <div style={bottomRowStyle}>
        <div>
          <div style={sectionLabelStyle}>Boletim Semanal</div>
          <h1 style={heroStyle}>
            Mercado Imobiliário
            <br />
            <em style={heroEmStyle}>dos Estados Unidos</em>
          </h1>
        </div>
        <div>
          <div style={sectionLabelStyle}>Destinatário</div>
          <p style={recipientCopyStyle}>
            Investidores brasileiros em real estate americano. Compilação semanal
            de 23 indicadores oficiais — FRED, Realtor.com, NAHB, NMHC, BLS e
            Census Bureau.
          </p>
          <div style={stampsRowStyle}>
            <Stamp>Confidencial</Stamp>
            <Stamp variant="muted">Atualizado · Ter</Stamp>
          </div>
        </div>
      </div>
    </header>
  );
}
