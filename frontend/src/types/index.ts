/**
 * Re-exports da camada de tipos do domínio.
 *
 * Ponto único de entrada: `import type { Indicator, FmtSpec, ... } from './types';`
 *
 * Os tipos espelham `data/schema.json` (Schema v2.0) gerado pelo backend Python.
 */

export type {
  FmtSpec,
  FmtSpecK,
  FmtSpecNum,
  FmtSpecPct,
  FmtSpecUSD,
} from './fmt-spec';
export type { Group } from './group';
export type { Period } from './period';
export type {
  DeltaPeriod,
  DeltaUnit,
  Indicator,
  IndicatorFrequency,
  Sentiment,
} from './indicator';
export type { Region } from './region';
export type { Metro } from './metro';
export type { Event } from './event';
export type { IndicatorsFile } from './indicators-file';
