"""
Top metros do Sun Belt — preço mediano, YoY, dias no mercado, flag "hot".

Mock data inicial calibrada para "early 2026" (mock do Handoff, Variação D).
Substituir por scrape NAR Metro Reports / Realtor.com em fase posterior.

Última atualização manual: 2026-05-06
"""

METROS: list[dict] = [
    {"name": "Tampa, FL",      "price": 392000, "yoy":  6.8, "dom": 28, "hot": True},
    {"name": "Charlotte, NC",  "price": 384500, "yoy":  5.4, "dom": 32, "hot": True},
    {"name": "Phoenix, AZ",    "price": 458200, "yoy":  4.2, "dom": 41, "hot": False},
    {"name": "Atlanta, GA",    "price": 378900, "yoy":  3.9, "dom": 36, "hot": False},
    {"name": "Dallas, TX",     "price": 412700, "yoy":  2.1, "dom": 48, "hot": False},
    {"name": "Austin, TX",     "price": 488400, "yoy": -1.2, "dom": 67, "hot": False},
    {"name": "Miami, FL",      "price": 612300, "yoy":  4.8, "dom": 52, "hot": False},
    {"name": "Orlando, FL",    "price": 398100, "yoy":  5.1, "dom": 38, "hot": True},
]

assert len(METROS) >= 8, f"METROS deve conter pelo menos 8 cidades, encontrou {len(METROS)}"
