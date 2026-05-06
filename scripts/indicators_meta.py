"""
Catálogo central declarativo dos 23 indicadores finais (schema v2).

ATENÇÃO — este módulo é apenas referência declarativa para PR 1a.
Não é consumido por `merge_data.py` nem pelo frontend ainda; isso ocorre no PR 1b.

Estrutura de cada entrada:
  - fred_id:       ID da série no FRED (ou marcador para séries scraped/computadas)
  - group:         taxas | precos | oferta | sentimento | macro
  - name:          nome completo (PT-BR)
  - short:         label curto uppercase para ledger/KPI (Variação D)
  - unit:          unidade (símbolo ou descrição curta)
  - fmt_spec:      especificação declarativa de formatação (frontend faz dispatch)
  - delta_unit:    'pp' | '%' | 'pts' | 'm' | 'idx'
  - delta_period:  'sem' | 'mês' | 'tri' | '12m' | '30d'
  - source:        atribuição editorial
  - why:           1-2 frases explicando relevância (PT-BR, tom didático)
  - sentiment:     positive | neutral | negative — leitura do estado atual
  - up_is_bad:     True se alta do indicador é ruim para o mercado imobiliário

Distribuição final:
  taxas       (6): mortgage30, mortgage15, fed_funds, treasury10, mba_purch, mba_refi
  precos      (3): cs_national, median_price, fhfa
  oferta      (7): housing_starts, building_permits, new_home_sales,
                   existing_sales, months_supply, completions, active_listings
  sentimento  (3): nahb, rmi, pending
  macro       (4): unemployment, cpi_shelter, affordability, lumber
                                                                  TOTAL = 23
"""

from __future__ import annotations

from typing import TypedDict, Literal


class FmtSpecPct(TypedDict):
    type: Literal["pct"]
    decimals: int


class FmtSpecUSD(TypedDict):
    type: Literal["usd"]


class FmtSpecNum(TypedDict):
    type: Literal["num"]
    decimals: int


class FmtSpecK(TypedDict):
    type: Literal["k"]


FmtSpec = FmtSpecPct | FmtSpecUSD | FmtSpecNum | FmtSpecK


class IndicatorMeta(TypedDict):
    fred_id: str
    group: Literal["taxas", "precos", "oferta", "sentimento", "macro"]
    name: str
    short: str
    unit: str
    fmt_spec: FmtSpec
    delta_unit: str
    delta_period: Literal["sem", "mês", "tri", "12m", "30d"]
    source: str
    why: str
    sentiment: Literal["positive", "neutral", "negative"]
    up_is_bad: bool


INDICATORS_META: dict[str, IndicatorMeta] = {
    # ──────────────────────────────────────────────────────────────────
    # TAXAS & CRÉDITO  (6)
    # ──────────────────────────────────────────────────────────────────
    "mortgage30": {
        "fred_id": "MORTGAGE30US",
        "group": "taxas",
        "name": "Mortgage 30Y Fixa",
        "short": "30Y MORTGAGE",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 2},
        "delta_unit": "pp",
        "delta_period": "sem",
        "source": "Freddie Mac",
        "why": "Custo do financiamento residencial. Quanto menor, mais acessível a casa própria e maior a demanda.",
        "sentiment": "positive",
        "up_is_bad": True,
    },
    "mortgage15": {
        "fred_id": "MORTGAGE15US",
        "group": "taxas",
        "name": "Mortgage 15Y Fixa",
        "short": "15Y MORTGAGE",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 2},
        "delta_unit": "pp",
        "delta_period": "sem",
        "source": "Freddie Mac",
        "why": "Alternativa à 30Y para compradores de maior poder aquisitivo. Juros menores em troca de parcelas maiores; popular em refinanciamentos.",
        "sentiment": "neutral",
        "up_is_bad": True,
    },
    "fed_funds": {
        "fred_id": "FEDFUNDS",
        "group": "taxas",
        "name": "Fed Funds Rate",
        "short": "FED FUNDS",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 2},
        "delta_unit": "pp",
        "delta_period": "30d",
        "source": "Federal Reserve",
        "why": "Taxa básica do Fed. Direciona toda a curva de juros e o custo do crédito imobiliário.",
        "sentiment": "neutral",
        "up_is_bad": True,
    },
    "treasury10": {
        "fred_id": "DGS10",
        "group": "taxas",
        "name": "Treasury 10Y",
        "short": "10Y UST",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 2},
        "delta_unit": "pp",
        "delta_period": "sem",
        "source": "Federal Reserve",
        "why": "Benchmark de longo prazo. Spread sobre 10Y define o pricing das mortgages.",
        "sentiment": "neutral",
        "up_is_bad": True,
    },
    "mba_purch": {
        "fred_id": "MBA_PURCH",  # série scraped, sem FRED ID real
        "group": "taxas",
        "name": "MBA Purchase Applications",
        "short": "MBA PURCH",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "%",
        "delta_period": "sem",
        "source": "MBA · scrap",
        "why": "Volume de pedidos de financiamento exclusivamente para compra. Indicador antecedente direto da demanda transacional.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "mba_refi": {
        "fred_id": "MBA_REFI",  # série scraped, sem FRED ID real
        "group": "taxas",
        "name": "MBA Refinance Applications",
        "short": "MBA REFI",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "%",
        "delta_period": "sem",
        "source": "MBA · scrap",
        "why": "Volume de pedidos de refinanciamento. Sensível a quedas nas taxas — dispara em ciclos de afrouxamento.",
        "sentiment": "neutral",
        "up_is_bad": False,
    },

    # ──────────────────────────────────────────────────────────────────
    # PREÇOS  (3)
    # ──────────────────────────────────────────────────────────────────
    "cs_national": {
        "fred_id": "CSUSHPISA",
        "group": "precos",
        "name": "Case-Shiller Nacional",
        "short": "CASE-SHILLER",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "% a.a.",
        "delta_period": "12m",
        "source": "S&P CoreLogic via FRED",
        "why": "Padrão-ouro de preços residenciais nos EUA. Atualizado mensalmente com 2 meses de defasagem.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "median_price": {
        "fred_id": "MSPUS",
        "group": "precos",
        "name": "Preço Mediano de Vendas",
        "short": "MEDIAN PRICE",
        "unit": "US$",
        "fmt_spec": {"type": "usd"},
        "delta_unit": "% a.a.",
        "delta_period": "12m",
        "source": "U.S. Census Bureau via FRED",
        "why": "Preço típico da casa vendida nos EUA. Reflete realidade transacional, não estoque.",
        "sentiment": "neutral",
        "up_is_bad": False,
    },
    "fhfa": {
        "fred_id": "USSTHPI",
        "group": "precos",
        "name": "FHFA House Price Index",
        "short": "FHFA HPI",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "% a.a.",
        "delta_period": "12m",
        "source": "FHFA via FRED",
        "why": "Índice baseado em mortgages garantidas (Fannie/Freddie). Cobertura geográfica mais ampla que Case-Shiller.",
        "sentiment": "positive",
        "up_is_bad": False,
    },

    # ──────────────────────────────────────────────────────────────────
    # OFERTA & CONSTRUÇÃO  (7)
    # ──────────────────────────────────────────────────────────────────
    "housing_starts": {
        "fred_id": "HOUST",
        "group": "oferta",
        "name": "Housing Starts (SAAR)",
        "short": "STARTS",
        "unit": "k",
        "fmt_spec": {"type": "k"},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "U.S. Census Bureau via FRED",
        "why": "Novas construções iniciadas. Sinal antecedente da oferta futura de moradias.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "building_permits": {
        "fred_id": "PERMIT",
        "group": "oferta",
        "name": "Building Permits (SAAR)",
        "short": "PERMITS",
        "unit": "k",
        "fmt_spec": {"type": "k"},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "U.S. Census Bureau via FRED",
        "why": "Autorizações para construir. Antecedem starts em ~30 dias.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "new_home_sales": {
        "fred_id": "HSN1F",
        "group": "oferta",
        "name": "New Home Sales (SAAR)",
        "short": "NEW SALES",
        "unit": "k",
        "fmt_spec": {"type": "k"},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "U.S. Census Bureau via FRED",
        "why": "Vendas de casas novas. Mais voláteis que existing, mas refletem o pulse atual.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "existing_sales": {
        "fred_id": "EXHOSLUSM495S",
        "group": "oferta",
        "name": "Existing Home Sales (SAAR)",
        "short": "EXISTING",
        "unit": "k",
        "fmt_spec": {"type": "k"},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "NAR via FRED",
        "why": "Maior volume do mercado (~85% do total). Reflete liquidez real e sensibilidade ao crédito.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "months_supply": {
        "fred_id": "MSACSR",
        "group": "oferta",
        "name": "Months of Supply",
        "short": "SUPPLY",
        "unit": "meses",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "m",
        "delta_period": "mês",
        "source": "U.S. Census Bureau via FRED",
        "why": "Tempo para vender o estoque atual no ritmo corrente. < 6 meses indica mercado de vendedor.",
        "sentiment": "positive",
        "up_is_bad": True,
    },
    "completions": {
        "fred_id": "COMPUTSA",
        "group": "oferta",
        "name": "Housing Completions (SAAR)",
        "short": "COMPLETIONS",
        "unit": "k",
        "fmt_spec": {"type": "k"},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "U.S. Census Bureau via FRED",
        "why": "Unidades efetivamente entregues ao mercado. Fecha o ciclo starts → completions → vendas.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "active_listings": {
        "fred_id": "ACTLISCOUUS",
        "group": "oferta",
        "name": "Active Listings",
        "short": "LISTINGS",
        "unit": "count",
        "fmt_spec": {"type": "num", "decimals": 0},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "Realtor.com via FRED",
        "why": "Estoque disponível para compra agora. Estoque baixo pressiona preços; alto favorece compradores.",
        "sentiment": "neutral",
        "up_is_bad": False,
    },

    # ──────────────────────────────────────────────────────────────────
    # SENTIMENTO & ATIVIDADE  (3)
    # ──────────────────────────────────────────────────────────────────
    "nahb": {
        "fred_id": "USHMI",
        "group": "sentimento",
        "name": "NAHB Housing Market Index",
        "short": "NAHB HMI",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 0},
        "delta_unit": "pts",
        "delta_period": "mês",
        "source": "NAHB via FRED",
        "why": "Sentimento de construtores. > 50 = otimismo predominante.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "rmi": {
        "fred_id": "RMI",  # série scraped
        "group": "sentimento",
        "name": "Remodeling Market Index",
        "short": "RMI",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 0},
        "delta_unit": "pt",
        "delta_period": "tri",
        "source": "NAHB · scrap",
        "why": "Reformas e renovações. Resiliente em mercados travados (lock-in effect).",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "pending": {
        "fred_id": "PHSI",
        "group": "sentimento",
        "name": "Pending Home Sales",
        "short": "PENDING",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "NAR via FRED",
        "why": "Contratos assinados (ainda não fechados). Antecede existing sales em 1-2 meses.",
        "sentiment": "positive",
        "up_is_bad": False,
    },

    # ──────────────────────────────────────────────────────────────────
    # MACRO & ACESSIBILIDADE  (4)
    # ──────────────────────────────────────────────────────────────────
    "unemployment": {
        "fred_id": "UNRATE",
        "group": "macro",
        "name": "Taxa de Desemprego",
        "short": "UNEMPLOYMENT",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 1},
        "delta_unit": "pp",
        "delta_period": "mês",
        "source": "BLS via FRED",
        "why": "Renda e emprego sustentam capacidade de compra e adimplência das hipotecas.",
        "sentiment": "neutral",
        "up_is_bad": True,
    },
    "cpi_shelter": {
        "fred_id": "CUSR0000SAH1",  # nível bruto; YoY é derivado em compute_derived.py
        "group": "macro",
        "name": "CPI Shelter (12m YoY)",
        "short": "CPI SHELTER",
        "unit": "%",
        "fmt_spec": {"type": "pct", "decimals": 1},
        "delta_unit": "pp",
        "delta_period": "mês",
        "source": "BLS via FRED · derivado",
        "why": "Inflação de moradia. Componente mais pesado do CPI core; afeta política do Fed.",
        "sentiment": "positive",
        "up_is_bad": True,
    },
    "affordability": {
        "fred_id": "_computed_",  # marcador — série computada em compute_derived.py
        "group": "macro",
        "name": "Affordability Index",
        "short": "AFFORDABILITY",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "pts",
        "delta_period": "tri",
        "source": "Calculado (NAR-style)",
        "why": "100 = renda mediana qualifica para casa mediana. Acima de 100 = acessível, abaixo = restritivo.",
        "sentiment": "positive",
        "up_is_bad": False,
    },
    "lumber": {
        "fred_id": "WPU081",
        "group": "macro",
        "name": "Lumber PPI",
        "short": "LUMBER",
        "unit": "idx",
        "fmt_spec": {"type": "num", "decimals": 1},
        "delta_unit": "%",
        "delta_period": "mês",
        "source": "BLS via FRED",
        "why": "PPI de madeira serrada — proxy de custo de construção. Picos encarecem casa nova e pressionam margem do construtor.",
        "sentiment": "neutral",
        "up_is_bad": True,
    },
}


# Sanity check: este módulo é referência declarativa, então verificamos integridade.
assert len(INDICATORS_META) == 23, (
    f"INDICATORS_META deve conter 23 entradas, encontrou {len(INDICATORS_META)}"
)

_GROUP_COUNTS = {
    "taxas": 6,
    "precos": 3,
    "oferta": 7,
    "sentimento": 3,
    "macro": 4,
}

for _group, _expected in _GROUP_COUNTS.items():
    _actual = sum(1 for m in INDICATORS_META.values() if m["group"] == _group)
    assert _actual == _expected, (
        f"Grupo '{_group}' deve ter {_expected} indicadores, encontrou {_actual}"
    )


if __name__ == "__main__":
    # Print resumo para validação manual
    print(f"INDICATORS_META: {len(INDICATORS_META)} entradas")
    print()
    for group, expected in _GROUP_COUNTS.items():
        keys = [k for k, m in INDICATORS_META.items() if m["group"] == group]
        print(f"  {group:12s} ({len(keys)}/{expected}): {', '.join(keys)}")
    print()
    print("OK — catálogo íntegro.")
