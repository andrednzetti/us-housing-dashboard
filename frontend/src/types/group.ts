/**
 * Grupo semântico de um indicador. Espelha o enum `properties.group` do
 * `$defs.Indicator` em `data/schema.json`.
 *
 * Distribuição final (consolidada na Fase 1):
 *   taxas       (6) — mortgage30, mortgage15, fed_funds, treasury10, mba_purch, mba_refi
 *   precos      (3) — cs_national, median_price, fhfa
 *   oferta      (7) — housing_starts, building_permits, new_home_sales,
 *                     existing_sales, months_supply, completions, active_listings
 *   sentimento  (3) — nahb, rmi, pending
 *   macro       (4) — unemployment, cpi_shelter, affordability, lumber
 */
export type Group = 'taxas' | 'precos' | 'oferta' | 'sentimento' | 'macro';
