import type { FmtSpec } from './fmt-spec';
import type { Group } from './group';

/**
 * Sentimento corrente de um indicador — leitura editorial,
 * não cálculo derivado de delta.
 *
 * 'positive': leitura favorável ao mercado imobiliário no momento atual
 * 'negative': leitura desfavorável
 * 'neutral':  leitura mista ou não-determinada
 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/** Unidade do delta. Espelha enum `properties.deltaUnit` do schema. */
export type DeltaUnit = 'pp' | '%' | '% a.a.' | 'pts' | 'pt' | 'm' | 'idx';

/** Janela do delta. Espelha enum `properties.deltaPeriod` do schema. */
export type DeltaPeriod = 'sem' | 'mês' | 'tri' | '12m' | '30d';

/**
 * Frequência nativa da série. Determina o truncamento aplicado em
 * `merge_data.py` (POINTS_BY_FREQUENCY) e a unidade de subtração para
 * os labels do X axis no Spotlight.
 *
 * Espelha `properties.frequency` em `data/schema.json`.
 */
export type IndicatorFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Daily';

/**
 * Indicador exibido no dashboard. Espelha exatamente o `$defs.Indicator`
 * em `data/schema.json`.
 *
 * O backend (Python) garante via `merge_data.build_v2_indicator` que todo
 * objeto serializado satisfaz esta interface — incluindo os 23 itens
 * obrigatórios do payload v2.
 */
export interface Indicator {
  /** snake_case lowercase, padrão `^[a-z][a-z0-9_]*$`. Ex.: `mortgage30`. */
  id: string;
  /** Grupo semântico de exibição. */
  group: Group;
  /** Nome completo (PT-BR). Ex.: `Mortgage 30Y Fixa`. */
  name: string;
  /** Label curto uppercase para ledger/KPI. Ex.: `30Y MORTGAGE`. */
  short: string;
  /** Valor mais recente da série. */
  value: number;
  /** Unidade textual (humana). Ex.: `%`, `idx`, `meses`. */
  unit: string;
  /** Especificação declarativa de formatação numérica. */
  fmtSpec: FmtSpec;
  /** Variação mais recente, na unidade `deltaUnit`. */
  delta: number;
  /** Unidade do delta. */
  deltaUnit: DeltaUnit;
  /** Janela temporal do delta. */
  deltaPeriod: DeltaPeriod;
  /**
   * Últimas N observações na frequência nativa do indicador.
   * Ordem cronológica ascendente (último elemento = mais recente).
   *
   * Truncada em 52 pontos no backend para sparkline (~1 ano semanal,
   * ~4 anos mensal). Pode ter menos pontos para séries quarterly/anual.
   *
   * Aviso: com `noUncheckedIndexedAccess`, `series[i]` retorna
   * `number | undefined`. Tratar essa possibilidade nos consumers.
   */
  series: number[];
  /**
   * Frequência nativa da série — populado pelo pipeline a partir do raw FRED
   * / scraped / derived. Optional para retrocompat com data antigo (pré
   * housekeeping pré-Fase 5).
   */
  frequency?: IndicatorFrequency;
  /** Atribuição editorial. Ex.: `Freddie Mac`, `BLS via FRED`. */
  source: string;
  /** Por que importa (1-2 frases, didático, PT-BR). */
  why: string;
  /** Sentimento corrente. */
  sentiment: Sentiment;
  /** True se alta é negativa para o mercado (ex.: mortgage rate, unemployment, lumber). */
  upIsBad?: boolean;
}
