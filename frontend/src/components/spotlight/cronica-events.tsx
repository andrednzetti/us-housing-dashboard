/**
 * CronicaEvents — aside card com timeline editorial dos events.
 *
 * Portado de `docs/handoff/dissenha_dashboard/variation-d.jsx` linhas 280-298.
 * Estrutura:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ CRÔNICA DA SEMANA                  [N]   │  ← header (eyebrow + stamp count)
 *   ├──────────────────────────────────────────┤
 *   │ ●─── 05.MAI · FED · texto editorial...   │
 *   │ │                                          │
 *   │ ●─── 02.MAI · DADO · outro evento...      │
 *   │ │                                          │
 *   │ ●─── 28.ABR · NAHB · ...                  │
 *   └──────────────────────────────────────────┘
 *
 * Cor dos dots: o item mais recente (índice 0) recebe `--accent` (marcação
 * editorial); os demais ficam em `--bg-panel` com border `--rule`. Espelha
 * o handoff — não há mapping de cor por tag (a tag é codificada apenas no
 * stamp à direita da date).
 *
 * Empty state: mostra mensagem editorial quando não há events (o pipeline
 * Python tolera `events.json` vazio e emite `[]`).
 */

import type { CSSProperties, JSX } from 'react';
import type { Event as MarketEvent } from '../../types';
import { Stamp } from '../shell';
import { formatPtBrShort } from '../../lib/dates';

const cardStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: 'var(--border-card)',
  padding: 'var(--space-6)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  paddingBottom: 'var(--space-3)',
  marginBottom: 'var(--space-4)',
  borderBottom: 'var(--border-card)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--ink-mute)',
  textTransform: 'uppercase',
};

const timelineStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const itemBaseStyle: CSSProperties = {
  position: 'relative',
  paddingLeft: 22,
};

const dotStyle = (isFirst: boolean): CSSProperties => ({
  position: 'absolute',
  left: 4,
  top: 5,
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: isFirst ? 'var(--accent)' : 'var(--bg-panel)',
  border: `1.5px solid ${isFirst ? 'var(--accent)' : 'var(--rule)'}`,
  boxSizing: 'border-box',
});

const connectorStyle: CSSProperties = {
  position: 'absolute',
  left: 7,
  top: 14,
  bottom: -2,
  width: 0.5,
  background: 'var(--rule)',
};

const dateRowStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  alignItems: 'baseline',
  marginBottom: 3,
};

const dateStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-label-l)',
  color: 'var(--ink-mute)',
  letterSpacing: '0.06em',
};

const textStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-serif)',
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  color: 'var(--ink)',
};

const emptyStyle: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-serif)',
  fontStyle: 'italic',
  fontSize: 'var(--fs-body)',
  color: 'var(--ink-mute)',
};

export interface CronicaEventsProps {
  events: ReadonlyArray<MarketEvent>;
}

export function CronicaEvents({ events }: CronicaEventsProps): JSX.Element {
  return (
    <div style={cardStyle} aria-labelledby="cronica-title">
      <div style={headerStyle}>
        <span id="cronica-title" style={eyebrowStyle}>
          Crônica da semana
        </span>
        <Stamp>{String(events.length)}</Stamp>
      </div>

      {events.length === 0 ? (
        <p style={emptyStyle}>Nenhum evento esta semana.</p>
      ) : (
        <ol style={timelineStyle}>
          {events.map((event, i) => {
            const isFirst = i === 0;
            const isLast = i === events.length - 1;
            const itemStyle: CSSProperties = {
              ...itemBaseStyle,
              paddingBottom: isLast ? 0 : 'var(--space-4)',
            };
            const dateLabel = formatPtBrShort(new Date(event.date));
            return (
              <li key={`${event.date}-${i}`} style={itemStyle}>
                <span style={dotStyle(isFirst)} aria-hidden />
                {!isLast && <span style={connectorStyle} aria-hidden />}
                <div style={dateRowStyle}>
                  <span style={dateStyle}>{dateLabel}</span>
                  <Stamp>{event.tag}</Stamp>
                </div>
                <p style={textStyle}>{event.text}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
