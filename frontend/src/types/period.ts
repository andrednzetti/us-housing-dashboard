/**
 * Período de visualização nos botões do Spotlight (Variação D).
 *
 * Não está no `data/schema.json` — é puramente um conceito do frontend.
 * Cada valor define quantos pontos da `series[]` são exibidos no AreaChart.
 *
 *   1M = 1 mês          (≈ 4 pontos para weekly, 1 ponto para monthly)
 *   3M = 3 meses        (≈ 13 pontos para weekly, 3 para monthly)
 *   6M = 6 meses        (≈ 26 pontos para weekly, 6 para monthly)
 *   1A = 1 ano          (≈ 52 pontos para weekly, 12 para monthly)
 *   5A = 5 anos / max   (todos os pontos disponíveis)
 */
export type Period = '1M' | '3M' | '6M' | '1A' | '5A';
