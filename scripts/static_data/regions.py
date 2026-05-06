"""
Regiões censitárias dos EUA — preço mediano, YoY, volume e flag "hot".

Mock data inicial calibrada para "early 2026" (mock do Handoff, Variação D).
Substituir por scrape NAR Regional Reports em fase posterior.

Última atualização manual: 2026-05-06
"""

REGIONS: list[dict] = [
    {
        "name": "Northeast",
        "price": 478200,
        "yoy": 3.8,
        "sales": 612,
        "hot": False,
    },
    {
        "name": "Midwest",
        "price": 312400,
        "yoy": 4.2,
        "sales": 1041,
        "hot": True,
    },
    {
        "name": "South",
        "price": 368900,
        "yoy": 1.4,
        "sales": 1928,
        "hot": False,
    },
    {
        "name": "West",
        "price": 612800,
        "yoy": 2.1,
        "sales": 699,
        "hot": False,
    },
]

assert len(REGIONS) == 4, f"REGIONS deve conter exatamente 4 regiões, encontrou {len(REGIONS)}"
