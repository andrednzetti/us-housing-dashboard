/**
 * Região censitária dos EUA. Espelha `$defs.Region` em `data/schema.json`.
 *
 * Hoje há 4 regiões (Northeast, Midwest, South, West) hardcoded em
 * `scripts/static_data/regions.py`; a substituição por scrape NAR
 * Regional Reports fica fora do escopo desta migração.
 */
export interface Region {
  /** Nome da região. Ex.: `Northeast`, `Midwest`, `South`, `West`. */
  name: string;
  /** Preço mediano em USD. */
  price: number;
  /** Variação YoY (%). */
  yoy: number;
  /** Volume de vendas em milhares (SAAR). */
  sales: number;
  /** Indica região "quente" — destaque visual com dot laranja. */
  hot: boolean;
}
