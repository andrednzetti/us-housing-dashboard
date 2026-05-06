/**
 * Footer — banda escura no rodapé do dashboard (estilo invoice).
 *
 * Portado de `docs/handoff/dissenha_dashboard/variation-d.jsx` linhas 418-455.
 * Estrutura:
 *   - Banda `var(--bg-band)` com gradient accent gold sutil no topo (1px,
 *     transparente → laranja → transparente)
 *   - Grid 3-col fixo: Emissor / Fontes / Cadência
 *   - Bottom row: disclaimer mono + DissenhaSeal
 *
 * Conteúdo das 3 colunas é hardcoded — reflete o emissor/fontes/cadência
 * estáveis do produto. O `generatedAt` é mostrado na coluna Cadência quando
 * disponível, e `schemaVersion` aparece também ali para metadados técnicos.
 */

import type { CSSProperties, JSX } from 'react';
import { DissenhaSeal } from './dissenha-mark';

const PLACEHOLDER = '—';
const REPO_LABEL = 'andrednzetti/us-housing-dashboard';

/** Formata `2026-05-06T17:44:11Z` → `06/05/2026 · 17:44 UTC`. */
function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return PLACEHOLDER;
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} · ${hours}:${minutes} UTC`;
}

const footerStyle: CSSProperties = {
  background: 'var(--bg-band)',
  color: 'var(--ink-inverse)',
  padding: 'var(--space-7) var(--space-12) var(--space-6)',
  position: 'relative',
};

const topStripeStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  background:
    'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
};

const colsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--space-8)',
  marginBottom: 'var(--space-6)',
};

const colLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label-l)',
  color: 'var(--accent)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-2)',
};

const colSerifBodyStyle: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: '0.8125rem',
  lineHeight: 'var(--lh-editorial)',
  color: 'rgba(232, 230, 224, 0.85)',
  margin: 0,
};

const colMonoBodyStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  lineHeight: 'var(--lh-relaxed)',
  color: 'rgba(232, 230, 224, 0.7)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: 0,
};

const bottomRowStyle: CSSProperties = {
  paddingTop: 'var(--space-4)',
  borderTop: '0.5px solid rgba(184, 137, 58, 0.3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-4)',
};

const disclaimerStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label)',
  letterSpacing: 'var(--ls-label)',
  color: 'rgba(232, 230, 224, 0.5)',
  textTransform: 'uppercase',
};

export interface FooterProps {
  /** Timestamp ISO da geração — exibido na coluna Cadência se presente. */
  generatedAt?: string | undefined;
  /** Schema version — exibido abaixo do timestamp como metadado técnico. */
  schemaVersion?: string | undefined;
}

export function Footer({ generatedAt, schemaVersion }: FooterProps): JSX.Element {
  const dateLine = generatedAt ? formatGeneratedAt(generatedAt) : PLACEHOLDER;
  const schemaLine = schemaVersion ? `Schema v${schemaVersion}` : `Schema ${PLACEHOLDER}`;

  return (
    <footer style={footerStyle}>
      <div style={topStripeStyle} aria-hidden />

      <div style={colsStyle}>
        <div>
          <div style={colLabelStyle}>Emissor</div>
          <p style={colSerifBodyStyle}>
            Dissenha Moulding Ltda
            <br />
            União da Vitória · PR · Brasil
            <br />
            Análise Macro · 2026
          </p>
        </div>
        <div>
          <div style={colLabelStyle}>Fontes</div>
          <p style={colMonoBodyStyle}>
            FRED · Realtor.com · NAHB
            <br />
            NMHC · BLS · Census Bureau
          </p>
        </div>
        <div>
          <div style={colLabelStyle}>Cadência</div>
          <p style={colMonoBodyStyle}>
            Atualização semanal · Ter
            <br />
            {dateLine}
            <br />
            {schemaLine} · {REPO_LABEL}
          </p>
        </div>
      </div>

      <div style={bottomRowStyle}>
        <span style={disclaimerStyle}>
          Documento gerado automaticamente · Não constitui recomendação de investimento.
        </span>
        <DissenhaSeal size={28} />
      </div>
    </footer>
  );
}
