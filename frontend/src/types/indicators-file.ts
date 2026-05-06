import type { Event } from './event';
import type { Indicator } from './indicator';
import type { Metro } from './metro';
import type { Region } from './region';

/**
 * Payload completo servido em `data/indicators.json`.
 * Espelha o root object de `data/schema.json` (Schema v2.0).
 *
 * Garantias do backend (validadas via JSON Schema antes da escrita):
 *   - `indicators.length === 23` (exatamente)
 *   - `regions.length === 4`     (exatamente)
 *   - `metros.length >= 8`
 *   - `events.length >= 0`       (pode ser vazio se events.json estiver vazio)
 */
export interface IndicatorsFile {
  /** Versão do schema. Bump manual em mudanças incompatíveis. */
  schemaVersion: '2.0';
  /** Timestamp ISO 8601 da geração do payload. */
  generatedAt: string;
  /** 23 indicadores nos 5 grupos. */
  indicators: Indicator[];
  /** 4 regiões censitárias. */
  regions: Region[];
  /** 8+ metros (top Sun Belt na Variação D). */
  metros: Metro[];
  /** Timeline editorial de eventos recentes. */
  events: Event[];
}
