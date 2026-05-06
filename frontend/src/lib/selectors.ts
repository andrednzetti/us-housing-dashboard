/**
 * Selectors — funções puras que extraem subconjuntos do payload do dashboard.
 *
 * Centralizar aqui (em vez de inline nos componentes) facilita testar com mock
 * data e mantém componentes "presentation-only".
 */

import type { Indicator, IndicatorsFile } from '../types';

/**
 * IDs dos 4 indicadores que ocupam o Quadro Resumido na Variação D.
 *
 * Decisão consolidada (plano-mestre §1.4 dec 3): mortgage30, cs_national,
 * months_supply, nahb. Substituiu `affordability` do mock original do
 * handoff por `months_supply`, mantendo NAHB como leitura de sentimento.
 *
 * Ordem é canônica e respeitada pelo selector — não depende da ordem em
 * que `IndicatorsFile.indicators` foi serializado.
 */
export const QUADRO_INDICATOR_IDS = [
  'mortgage30',
  'cs_national',
  'months_supply',
  'nahb',
] as const;

/**
 * Seleciona, em ordem canônica, os indicadores prescritos para o Quadro
 * Resumido. Faz lookup O(N) por id; se algum id não existir no payload,
 * loga warning e omite o item (não throw — o dashboard precisa renderizar
 * mesmo com 1 indicador faltando).
 *
 * @example
 *   const items = selectQuadroIndicators(file);
 *   // items.length === 4 quando todos presentes
 *   // items[0]?.id === 'mortgage30'
 */
export function selectQuadroIndicators(file: IndicatorsFile): Indicator[] {
  const byId = new Map<string, Indicator>(file.indicators.map((i) => [i.id, i]));
  const result: Indicator[] = [];

  for (const id of QUADRO_INDICATOR_IDS) {
    const ind = byId.get(id);
    if (ind) {
      result.push(ind);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[selectQuadroIndicators] Indicator '${id}' not found in file`);
    }
  }

  return result;
}

/**
 * ID âncora do Spotlight ("indicador da semana"). Mortgage30 é o anchor
 * editorial da Variação D — o leitor entra no boletim já vendo a taxa.
 */
export const SPOTLIGHT_INDICATOR_ID = 'mortgage30';

/**
 * Seleciona o indicador em destaque (Spotlight). Implementação inicial
 * hardcoded em `mortgage30`.
 *
 * TODO(post-Fase 5): regra de negócio — escolher por |delta| normalizado
 * pela volatilidade histórica, ou via campo dedicado no schema (`spotlight: true`).
 *
 * @returns o indicador correspondente, ou `null` se ausente do payload.
 */
export function selectSpotlight(file: IndicatorsFile): Indicator | null {
  return file.indicators.find((i) => i.id === SPOTLIGHT_INDICATOR_ID) ?? null;
}
