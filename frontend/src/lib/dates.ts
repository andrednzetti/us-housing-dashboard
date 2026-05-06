/**
 * Helpers de data compartilhados pela camada visual.
 *
 * Todos os formatters operam em UTC para evitar deriva de timezone entre
 * preview Vercel (servidor pode ter outro TZ) e o browser local. Os valores
 * vêm de `IndicatorsFile.generatedAt`, sempre ISO 8601 com sufixo `Z`.
 *
 * Mantém uma fonte única de meses abreviados em pt-BR. O `header.tsx`
 * importa `PT_BR_MONTHS_ABBR` deste módulo para a meta "DD · MMM · YYYY".
 */

/** Meses pt-BR abreviados uppercase, indexados por `Date#getUTCMonth()` (0..11). */
export const PT_BR_MONTHS_ABBR = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const;

const TUESDAY = 2; // Date#getUTCDay() — 0 = Sunday, 2 = Tuesday
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PLACEHOLDER = '—';

/**
 * Calcula a próxima terça-feira a partir de uma data base (em UTC).
 *
 * Se a base já for terça, retorna a próxima terça (7 dias depois) — comportamento
 * consistente para o footer "Próxima atualização", que sempre aponta para o
 * ciclo seguinte ao último `generatedAt`.
 *
 * @example
 *   nextTuesday(new Date('2026-05-06T00:00:00Z'))  // 2026-05-12 (Wed → próxima Tue)
 *   nextTuesday(new Date('2026-05-05T00:00:00Z'))  // 2026-05-12 (Tue → +7d)
 *   nextTuesday(new Date('2026-05-04T00:00:00Z'))  // 2026-05-05 (Mon → +1d)
 *   nextTuesday(new Date('2026-05-10T00:00:00Z'))  // 2026-05-12 (Sun → +2d)
 */
export function nextTuesday(base: Date): Date {
  const day = base.getUTCDay();
  // (9 - day) % 7 dá 0 quando hoje é terça (day=2); fallback para 7 garante "próxima"
  const delta = ((TUESDAY + DAYS_PER_WEEK - day) % DAYS_PER_WEEK) || DAYS_PER_WEEK;
  return new Date(base.getTime() + delta * MS_PER_DAY);
}

/**
 * Formata uma `Date` em UTC como `DD.MMM.AAAA` em pt-BR (mês abreviado uppercase).
 * Usado no footer da section Quadro Resumido ("Próxima atualização · 12.MAI.2026").
 *
 * @example
 *   formatPtBrEditorial(new Date('2026-05-12T14:00:00Z'))  // '12.MAI.2026'
 */
export function formatPtBrEditorial(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = PT_BR_MONTHS_ABBR[date.getUTCMonth()] ?? PLACEHOLDER;
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Formata uma `Date` em UTC como `DD.MM.AAAA` (numérico).
 * Usado no eyebrow da section Quadro Resumido ("Síntese · Posição em 06.05.2026").
 *
 * @example
 *   formatPtBrNumeric(new Date('2026-05-06T17:44:11Z'))  // '06.05.2026'
 */
export function formatPtBrNumeric(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Formata uma `Date` em UTC como `DD.MMM` (compacto, sem ano).
 * Usado nos eventos da Crônica da semana, onde o ano é redundante (mesmo
 * ano corrente para todos os items da timeline).
 *
 * @example
 *   formatPtBrShort(new Date('2026-05-05T00:00:00Z'))  // '05.MAI'
 */
export function formatPtBrShort(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = PT_BR_MONTHS_ABBR[date.getUTCMonth()] ?? PLACEHOLDER;
  return `${day}.${month}`;
}

/**
 * Formata uma `Date` em UTC como `MMM` (mês abreviado uppercase pt-BR).
 *
 * @example
 *   formatPtBrMonth(new Date('2026-02-01T00:00:00Z'))  // 'FEV'
 */
export function formatPtBrMonth(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  return PT_BR_MONTHS_ABBR[date.getUTCMonth()] ?? PLACEHOLDER;
}

/**
 * Formata uma `Date` em UTC como `MMM/AA` (mês + ano em 2 dígitos).
 *
 * @example
 *   formatPtBrMonthYearShort(new Date('2026-05-12T00:00:00Z'))  // 'MAI/26'
 */
export function formatPtBrMonthYearShort(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  const month = PT_BR_MONTHS_ABBR[date.getUTCMonth()] ?? PLACEHOLDER;
  const year2 = String(date.getUTCFullYear() % 100).padStart(2, '0');
  return `${month}/${year2}`;
}

/**
 * Formata uma `Date` em UTC como `AAAA` (ano completo).
 *
 * @example
 *   formatPtBrYear(new Date('2021-03-15T00:00:00Z'))  // '2021'
 */
export function formatPtBrYear(date: Date): string {
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;
  return String(date.getUTCFullYear());
}

/** Frequências de série suportadas para `subtractFrequency`. */
export type FrequencyUnit = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

/**
 * Subtrai `n` unidades de frequência (semanas, meses, etc.) de uma data UTC.
 * Operação imutável — retorna nova `Date`. Usa as setters UTC para evitar
 * deriva por DST.
 *
 * @example
 *   subtractFrequency(new Date('2026-05-06T00:00:00Z'), 3, 'Weekly')
 *   // → 2026-04-15T00:00:00Z (3 semanas antes)
 *   subtractFrequency(new Date('2026-05-06T00:00:00Z'), 6, 'Monthly')
 *   // → 2025-11-06T00:00:00Z
 */
export function subtractFrequency(
  date: Date,
  n: number,
  frequency: FrequencyUnit,
): Date {
  const result = new Date(date.getTime());
  if (Number.isNaN(result.getTime())) return result;
  switch (frequency) {
    case 'Daily':
      result.setUTCDate(result.getUTCDate() - n);
      break;
    case 'Weekly':
      result.setUTCDate(result.getUTCDate() - n * 7);
      break;
    case 'Monthly':
      result.setUTCMonth(result.getUTCMonth() - n);
      break;
    case 'Quarterly':
      result.setUTCMonth(result.getUTCMonth() - n * 3);
      break;
  }
  return result;
}
