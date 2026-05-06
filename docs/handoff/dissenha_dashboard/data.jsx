// Mock data for US Housing Dashboard
// Realistic values calibrated to ~early 2026 conditions

// Generate a sparkline series with mild trend + noise
function series(start, end, n = 52, noise = 0.02, seed = 1) {
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) - 0.5;
  };
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * t;
    out.push(base * (1 + rand() * noise * 2));
  }
  return out;
}

// Format helpers
const fmtPct = (v, d = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`;
const fmtNum = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const fmtUSD = (v) => `US$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
const fmtK = (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v.toFixed(0)}`;

// 18 indicators grouped semantically
const indicators = [
  // ── Taxas & Crédito ──
  {
    id: 'mortgage30',
    group: 'taxas',
    name: 'Mortgage 30Y Fixa',
    short: '30Y MORTGAGE',
    value: 6.42,
    unit: '%',
    fmt: (v) => `${v.toFixed(2)}%`,
    delta: -0.18,
    deltaUnit: 'pp',
    deltaPeriod: 'sem',
    series: series(7.1, 6.42, 52, 0.015, 11),
    source: 'Freddie Mac',
    why: 'Custo do financiamento residencial. Quanto menor, mais acessível a casa própria e maior a demanda.',
    sentiment: 'positive', // queda = bom para mercado
  },
  {
    id: 'fed_funds',
    group: 'taxas',
    name: 'Fed Funds Rate',
    short: 'FED FUNDS',
    value: 4.25,
    unit: '%',
    fmt: (v) => `${v.toFixed(2)}%`,
    delta: -0.25,
    deltaUnit: 'pp',
    deltaPeriod: '30d',
    series: series(5.33, 4.25, 52, 0.005, 12),
    source: 'FRED',
    why: 'Taxa básica do Fed. Direciona toda a curva de juros e o custo do crédito imobiliário.',
    sentiment: 'positive',
  },
  {
    id: 'treasury10',
    group: 'taxas',
    name: 'Treasury 10Y',
    short: '10Y UST',
    value: 4.08,
    unit: '%',
    fmt: (v) => `${v.toFixed(2)}%`,
    delta: -0.12,
    deltaUnit: 'pp',
    deltaPeriod: 'sem',
    series: series(4.55, 4.08, 52, 0.02, 13),
    source: 'FRED',
    why: 'Benchmark de longo prazo. Spread sobre 10Y define o pricing das mortgages.',
    sentiment: 'positive',
  },
  {
    id: 'mba_apps',
    group: 'taxas',
    name: 'MBA Mortgage Applications',
    short: 'MBA APPS',
    value: 218.4,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 4.2,
    deltaUnit: '%',
    deltaPeriod: 'sem',
    series: series(180, 218, 52, 0.04, 14),
    source: 'MBA · scrap',
    why: 'Volume de pedidos de financiamento. Indicador antecedente da demanda real.',
    sentiment: 'positive',
  },

  // ── Preços ──
  {
    id: 'cs_national',
    group: 'precos',
    name: 'Case-Shiller Nacional',
    short: 'CASE-SHILLER',
    value: 327.8,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 3.4,
    deltaUnit: '% a.a.',
    deltaPeriod: '12m',
    series: series(308, 327.8, 52, 0.008, 15),
    source: 'S&P/CoreLogic',
    why: 'Padrão-ouro de preços residenciais nos EUA. Atualizado mensalmente com 2 meses de defasagem.',
    sentiment: 'positive',
  },
  {
    id: 'median_price',
    group: 'precos',
    name: 'Preço Mediano (Existing)',
    short: 'MEDIAN PRICE',
    value: 412300,
    unit: 'US$',
    fmt: (v) => fmtUSD(v),
    delta: 2.1,
    deltaUnit: '% a.a.',
    deltaPeriod: '12m',
    series: series(395000, 412300, 52, 0.01, 16),
    source: 'NAR',
    why: 'Preço típico da casa usada vendida. Reflete realidade transacional, não estoque.',
    sentiment: 'neutral',
  },
  {
    id: 'fhfa',
    group: 'precos',
    name: 'FHFA House Price Index',
    short: 'FHFA HPI',
    value: 428.5,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 2.8,
    deltaUnit: '% a.a.',
    deltaPeriod: '12m',
    series: series(412, 428.5, 52, 0.006, 17),
    source: 'FHFA',
    why: 'Índice baseado em mortgages garantidas. Cobertura mais ampla que Case-Shiller.',
    sentiment: 'positive',
  },

  // ── Oferta & Construção ──
  {
    id: 'housing_starts',
    group: 'oferta',
    name: 'Housing Starts (SAAR)',
    short: 'STARTS',
    value: 1382,
    unit: 'k',
    fmt: (v) => `${fmtNum(v)}k`,
    delta: 1.8,
    deltaUnit: '%',
    deltaPeriod: 'mês',
    series: series(1280, 1382, 52, 0.03, 18),
    source: 'Census',
    why: 'Novas construções iniciadas. Sinal antecedente de oferta futura.',
    sentiment: 'positive',
  },
  {
    id: 'building_permits',
    group: 'oferta',
    name: 'Building Permits (SAAR)',
    short: 'PERMITS',
    value: 1442,
    unit: 'k',
    fmt: (v) => `${fmtNum(v)}k`,
    delta: 0.6,
    deltaUnit: '%',
    deltaPeriod: 'mês',
    series: series(1380, 1442, 52, 0.025, 19),
    source: 'Census',
    why: 'Autorizações para construir. Antecedem starts em ~30 dias.',
    sentiment: 'positive',
  },
  {
    id: 'new_home_sales',
    group: 'oferta',
    name: 'New Home Sales (SAAR)',
    short: 'NEW SALES',
    value: 712,
    unit: 'k',
    fmt: (v) => `${fmtNum(v)}k`,
    delta: 5.4,
    deltaUnit: '%',
    deltaPeriod: 'mês',
    series: series(640, 712, 52, 0.04, 20),
    source: 'Census',
    why: 'Vendas de casas novas. Mais volátil que existing, mas reflete pulse atual.',
    sentiment: 'positive',
  },
  {
    id: 'existing_sales',
    group: 'oferta',
    name: 'Existing Home Sales (SAAR)',
    short: 'EXISTING',
    value: 4280,
    unit: 'k',
    fmt: (v) => `${fmtNum(v)}k`,
    delta: 2.2,
    deltaUnit: '%',
    deltaPeriod: 'mês',
    series: series(4050, 4280, 52, 0.02, 21),
    source: 'NAR',
    why: 'Maior volume do mercado (~85% do total). Reflete liquidez real.',
    sentiment: 'positive',
  },
  {
    id: 'months_supply',
    group: 'oferta',
    name: 'Months of Supply',
    short: 'SUPPLY',
    value: 3.8,
    unit: 'meses',
    fmt: (v) => `${v.toFixed(1)} m`,
    delta: -0.2,
    deltaUnit: 'm',
    deltaPeriod: 'mês',
    series: series(4.2, 3.8, 52, 0.03, 22),
    source: 'NAR',
    why: 'Tempo para vender o estoque atual. < 6 meses indica mercado de vendedor.',
    sentiment: 'positive',
  },

  // ── Sentimento & Atividade ──
  {
    id: 'nahb',
    group: 'sentimento',
    name: 'NAHB Housing Market Index',
    short: 'NAHB HMI',
    value: 47,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 3,
    deltaUnit: 'pts',
    deltaPeriod: 'mês',
    series: series(38, 47, 52, 0.02, 23),
    source: 'NAHB',
    why: 'Sentimento de construtores. > 50 = otimismo predominante.',
    sentiment: 'positive',
  },
  {
    id: 'rmi',
    group: 'sentimento',
    name: 'Remodeling Market Index',
    short: 'RMI',
    value: 64,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 1,
    deltaUnit: 'pt',
    deltaPeriod: 'tri',
    series: series(58, 64, 52, 0.015, 24),
    source: 'NAHB · scrap',
    why: 'Reformas e renovações. Resiliente em mercados travados (lock-in effect).',
    sentiment: 'positive',
  },
  {
    id: 'pending',
    group: 'sentimento',
    name: 'Pending Home Sales',
    short: 'PENDING',
    value: 76.8,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 2.4,
    deltaUnit: '%',
    deltaPeriod: 'mês',
    series: series(70, 76.8, 52, 0.04, 25),
    source: 'NAR',
    why: 'Contratos assinados (não fechados). Antecede existing sales em 1-2 meses.',
    sentiment: 'positive',
  },

  // ── Macro & Acessibilidade ──
  {
    id: 'unemployment',
    group: 'macro',
    name: 'Taxa de Desemprego',
    short: 'UNEMPLOYMENT',
    value: 4.1,
    unit: '%',
    fmt: (v) => `${v.toFixed(1)}%`,
    delta: 0.0,
    deltaUnit: 'pp',
    deltaPeriod: 'mês',
    series: series(3.7, 4.1, 52, 0.01, 26),
    source: 'BLS · FRED',
    why: 'Renda e emprego sustentam capacidade de compra e adimplência.',
    sentiment: 'neutral',
  },
  {
    id: 'cpi_shelter',
    group: 'macro',
    name: 'CPI Shelter (12m)',
    short: 'CPI SHELTER',
    value: 4.6,
    unit: '%',
    fmt: (v) => `${v.toFixed(1)}%`,
    delta: -0.3,
    deltaUnit: 'pp',
    deltaPeriod: 'mês',
    series: series(5.5, 4.6, 52, 0.008, 27),
    source: 'BLS · FRED',
    why: 'Inflação de moradia. Componente mais pesado do CPI core.',
    sentiment: 'positive',
  },
  {
    id: 'affordability',
    group: 'macro',
    name: 'Affordability Index',
    short: 'AFFORDABILITY',
    value: 102.4,
    unit: 'idx',
    fmt: (v) => fmtNum(v),
    delta: 4.8,
    deltaUnit: 'pts',
    deltaPeriod: 'tri',
    series: series(94, 102.4, 52, 0.025, 28),
    source: 'NAR',
    why: '100 = renda mediana qualifica para casa mediana. Acima de 100 = acessível.',
    sentiment: 'positive',
  },
];

const groups = {
  taxas: { id: 'taxas', label: 'Taxas & Crédito', short: 'TAXAS', accent: '#c4664a' },
  precos: { id: 'precos', label: 'Preços', short: 'PREÇOS', accent: '#7a9b6e' },
  oferta: { id: 'oferta', label: 'Oferta & Construção', short: 'OFERTA', accent: '#6b87a8' },
  sentimento: { id: 'sentimento', label: 'Sentimento & Atividade', short: 'SENTIMENTO', accent: '#a88a4f' },
  macro: { id: 'macro', label: 'Macro & Acessibilidade', short: 'MACRO', accent: '#8a6a8a' },
};

// Regional breakdown (mock)
const regions = [
  { name: 'Northeast', price: 478200, yoy: 3.8, sales: 612, hot: false },
  { name: 'Midwest', price: 312400, yoy: 4.2, sales: 1041, hot: true },
  { name: 'South', price: 368900, yoy: 1.4, sales: 1928, hot: false },
  { name: 'West', price: 612800, yoy: 2.1, sales: 699, hot: false },
];

// Top metros (mock)
const metros = [
  { name: 'Tampa, FL', price: 392000, yoy: 6.8, dom: 28, hot: true },
  { name: 'Charlotte, NC', price: 384500, yoy: 5.4, dom: 32, hot: true },
  { name: 'Phoenix, AZ', price: 458200, yoy: 4.2, dom: 41, hot: false },
  { name: 'Atlanta, GA', price: 378900, yoy: 3.9, dom: 36, hot: false },
  { name: 'Dallas, TX', price: 412700, yoy: 2.1, dom: 48, hot: false },
  { name: 'Austin, TX', price: 488400, yoy: -1.2, dom: 67, hot: false },
  { name: 'Miami, FL', price: 612300, yoy: 4.8, dom: 52, hot: false },
  { name: 'Orlando, FL', price: 398100, yoy: 5.1, dom: 38, hot: true },
];

// Timeline of recent events
const events = [
  { date: '05 mai', tag: 'FED', text: 'FOMC mantém taxa em 4,25-4,50%. Tom dovish reforça expectativa de corte em jul.' },
  { date: '02 mai', tag: 'DADO', text: 'Mortgage apps sobem 4,2% s/s — quarta semana consecutiva de alta.' },
  { date: '28 abr', tag: 'NAHB', text: 'HMI sobe 3 pts para 47. Construtores otimistas com queda de juros.' },
  { date: '24 abr', tag: 'NAR', text: 'Existing sales +2,2% no mês. Inventário em 3,8 meses, ainda apertado.' },
  { date: '22 abr', tag: 'CENSUS', text: 'New home sales +5,4% — incentivos de builders sustentam demanda.' },
];

Object.assign(window, {
  housingData: { indicators, groups, regions, metros, events, fmtPct, fmtNum, fmtUSD, fmtK, series },
});
