/**
 * Evento da timeline editorial ("Crônica da semana" na Variação D).
 * Espelha `$defs.Event` em `data/schema.json`.
 *
 * Alimentado manualmente via `data/events.json` editável no GitHub web UI.
 *
 * Importante: este tipo coexiste com a interface global `Event` do DOM.
 * Em consumers que importem ambos, prefira renomear no import:
 *   import type { Event as MarketEvent } from '../types';
 */
export interface Event {
  /** Data ISO 8601 (YYYY-MM-DD). */
  date: string;
  /** Tag uppercase, padrão `^[A-Z][A-Z0-9 _-]*$`. Ex.: `FED`, `NAHB`, `DADO`. */
  tag: string;
  /** Texto editorial em PT-BR. */
  text: string;
}
