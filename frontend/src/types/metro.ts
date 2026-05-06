/**
 * Área metropolitana — top metros do Sun Belt na Variação D.
 * Espelha `$defs.Metro` em `data/schema.json`.
 *
 * Hoje há 8 metros hardcoded em `scripts/static_data/metros.py`.
 */
export interface Metro {
  /** Nome do metro. Ex.: `Tampa, FL`, `Charlotte, NC`. */
  name: string;
  /** Preço mediano em USD. */
  price: number;
  /** Variação YoY (%). */
  yoy: number;
  /** Days on Market — dias médios para venda. */
  dom: number;
  /** Indica metro "quente" — destaque visual com dot laranja. */
  hot: boolean;
}
