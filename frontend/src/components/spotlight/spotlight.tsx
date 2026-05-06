/**
 * Spotlight — wrapper grid 2-col da section "indicador da semana" da
 * Variação D (`variation-d.jsx` linhas 224-327).
 *
 * Estrutura:
 *
 *   ┌──────────────────────────────────────┬─────────────────────────┐
 *   │                                       │   ┌─────────────────┐ │
 *   │                                       │   │ Crônica         │ │
 *   │     SpotlightCard (1.7fr)             │   │ da semana       │ │
 *   │                                       │   └─────────────────┘ │
 *   │     - header + period tabs            │   ┌─────────────────┐ │
 *   │     - valor 60px + delta              │   │ Composição      │ │
 *   │     - AreaChart 720x240               │   │ da carteira     │ │
 *   │     - stats 4-col                     │   │ (banda escura)  │ │
 *   │     - nota explicativa                │   └─────────────────┘ │
 *   │                                       │           (1fr)        │
 *   └──────────────────────────────────────┴─────────────────────────┘
 *
 * O componente é puramente estrutural — toda a lógica fica nos filhos
 * (`SpotlightCard` controla period interno; `CronicaEvents` consome events;
 * `ComposicaoCarteira` calcula counts).
 *
 * Layout responsivo: o grid colapsa para 1 coluna abaixo de 1024px via
 * `gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)'` em telas largas.
 * (TODO: verificar comportamento real no preview e ajustar com media query
 * se necessário em iteração futura.)
 */

import type { CSSProperties, JSX } from 'react';
import type { Indicator, IndicatorsFile, Event as MarketEvent } from '../../types';
import { SpotlightCard } from './spotlight-card';
import { CronicaEvents } from './cronica-events';
import { ComposicaoCarteira } from './composicao-carteira';

const sectionStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)',
  gap: 'var(--space-7)',
  alignItems: 'start',
};

const asideStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
};

export interface SpotlightProps {
  indicator: Indicator;
  events: ReadonlyArray<MarketEvent>;
  file: IndicatorsFile;
}

export function Spotlight({ indicator, events, file }: SpotlightProps): JSX.Element {
  return (
    <section style={sectionStyle} aria-label="Indicador em foco e contexto">
      <SpotlightCard indicator={indicator} />
      <aside style={asideStyle}>
        <CronicaEvents events={events} />
        <ComposicaoCarteira file={file} />
      </aside>
    </section>
  );
}
