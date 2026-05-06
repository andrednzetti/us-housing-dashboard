#!/usr/bin/env python3
"""
Séries derivadas a partir de dados brutos do FRED.

Produz duas séries (uma por função pública):
  - affordability    — NAR-style index, cadência trimestral
  - cpi_shelter_yoy  — YoY 12 meses de CPI Shelter (CUSR0000SAH1)

Ambas em formato compatível com o schema v1 de `data/indicators.json`
(mesmas chaves usadas por `merge_data.py` para entradas FRED).

Funções públicas:
  pmt(rate_per_period, periods, principal)            — pagamento mensal amortizado
  affordability_index(...)                            — valor pontual do índice
  cpi_yoy(series_monthly)                             — lista de YoY mensais
  compute_affordability_series(fred_data) -> dict     — entrada pronta para merge_data
  compute_cpi_shelter_yoy(fred_data) -> dict          — entrada pronta para merge_data

Standalone (`python scripts/compute_derived.py`):
  Roda validação numérica do `affordability_index` contra valores esperados.
  Sai com código != 0 se a fórmula divergir mais de 5%.
"""

from __future__ import annotations

import sys
from typing import Optional


# ---------------------------------------------------------------------------
# Primitivas matemáticas
# ---------------------------------------------------------------------------

def pmt(rate_per_period: float, periods: int, principal: float) -> float:
    """
    Pagamento periódico de um empréstimo amortizado (fórmula PMT padrão).

    Para mortgage padrão dos EUA: rate_per_period = anual/12, periods = 360 (30 anos).
    """
    if rate_per_period == 0:
        return principal / periods
    factor = (1 + rate_per_period) ** periods
    return principal * (rate_per_period * factor) / (factor - 1)


def affordability_index(
    mortgage_rate_annual_pct: float,
    median_price: float,
    median_family_income_annual: float,
    down_payment_ratio: float = 0.20,
    qualifying_pti: float = 0.25,
    term_months: int = 360,
) -> float:
    """
    Affordability Index = (Median Family Income / Qualifying Income) × 100

    Convenção NAR:
      - Down payment de 20% (loan = 80% do preço)
      - Razão Pagamento/Renda qualificadora de 25%
      - Termo de 30 anos (360 meses)

    > 100 = renda mediana qualifica para casa mediana ⇒ acessível.
    < 100 = renda insuficiente ⇒ restritivo.

    Nota sobre unidades: A renda do FRED (MEFAINUSA672N) está em "2024 C-CPI-U
    Dollars". Para o ano de referência mais recente, isso equivale a USD nominais
    do mesmo ano — comparável diretamente ao monthly mortgage payment. Sem
    conversão de unidade necessária aqui.
    """
    loan_principal = median_price * (1 - down_payment_ratio)
    monthly_rate = mortgage_rate_annual_pct / 100 / 12
    monthly_pmt = pmt(monthly_rate, term_months, loan_principal)
    qualifying_income = (monthly_pmt * 12) / qualifying_pti
    if qualifying_income <= 0:
        return float("nan")
    return (median_family_income_annual / qualifying_income) * 100


def cpi_yoy(series_monthly: list[float]) -> list[Optional[float]]:
    """
    YoY = (level[t] / level[t-12] - 1) × 100

    Retorna lista do mesmo tamanho que a entrada; primeiros 12 valores são None
    (insufficient history). Posições onde o divisor é zero também viram None.
    """
    out: list[Optional[float]] = []
    for i, _ in enumerate(series_monthly):
        if i < 12:
            out.append(None)
            continue
        denom = series_monthly[i - 12]
        if denom == 0:
            out.append(None)
            continue
        out.append((series_monthly[i] / denom - 1) * 100)
    return out


# ---------------------------------------------------------------------------
# Helpers de alinhamento temporal entre séries de frequências diferentes
# ---------------------------------------------------------------------------

def latest_value_at_or_before(observations: list[dict], target_date: str) -> Optional[float]:
    """
    Carry-forward: retorna o valor da observação com `date <= target_date`
    mais recente. None se não existir nenhuma observação anterior.

    Espera observações ordenadas em ordem ascendente por `date` (formato 'YYYY-MM-DD').
    """
    candidates = [o["value"] for o in observations if o["date"] <= target_date]
    return candidates[-1] if candidates else None


# ---------------------------------------------------------------------------
# Construtores de entradas no schema v1
# ---------------------------------------------------------------------------

def compute_affordability_series(fred_data: dict) -> Optional[dict]:
    """
    Computa série de affordability alinhada às datas de MSPUS (trimestral).

    Inputs requeridos no `fred_data`:
      MORTGAGE30US (weekly), MSPUS (quarterly), MEFAINUSA672N (annual)

    Retorna entrada no schema v1, ou None se algum input faltar/estiver vazio.
    """
    required = {"MORTGAGE30US", "MSPUS", "MEFAINUSA672N"}
    missing = required - set(fred_data.keys())
    if missing:
        print(f"  [affordability] Inputs ausentes: {missing}. Pulando.")
        return None

    mortgage_obs = fred_data["MORTGAGE30US"].get("observations") or []
    price_obs = fred_data["MSPUS"].get("observations") or []
    income_obs = fred_data["MEFAINUSA672N"].get("observations") or []

    if not (mortgage_obs and price_obs and income_obs):
        print("  [affordability] Pelo menos uma série input está vazia. Pulando.")
        return None

    observations: list[dict] = []
    for q in price_obs:
        date = q["date"]
        median_price = q["value"]
        mortgage_rate = latest_value_at_or_before(mortgage_obs, date)
        income = latest_value_at_or_before(income_obs, date)
        if mortgage_rate is None or income is None or median_price <= 0:
            continue
        try:
            value = affordability_index(mortgage_rate, median_price, income)
        except (ValueError, ZeroDivisionError):
            continue
        if value != value:  # NaN check
            continue
        observations.append({"date": date, "value": round(value, 2)})

    if not observations:
        print("  [affordability] Nenhuma observação computável. Pulando.")
        return None

    latest_value = observations[-1]["value"]
    latest_date = observations[-1]["date"]

    # MoM (aqui QoQ pois a série é trimestral) e YoY (4 trimestres)
    mom_change = None
    yoy_change = None
    if len(observations) >= 2:
        prev = observations[-2]["value"]
        if prev:
            mom_change = round((latest_value - prev) / abs(prev) * 100, 2)
    if len(observations) >= 5:
        prev_yoy = observations[-5]["value"]
        if prev_yoy:
            yoy_change = round((latest_value - prev_yoy) / abs(prev_yoy) * 100, 2)

    print(
        f"  [affordability] OK — {len(observations)} obs trimestrais, "
        f"latest: {latest_value} ({latest_date})"
    )

    return {
        "id": "affordability",
        "name": "Affordability Index",
        "group": "macro",
        "unit": "Index (100 = qualifica)",
        "frequency": "Quarterly",
        "source": "Calculado (NAR-style)",
        "observations": observations,
        "latest_value": latest_value,
        "latest_date": latest_date,
        "mom_change": mom_change,
        "yoy_change": yoy_change,
    }


def compute_cpi_shelter_yoy(fred_data: dict) -> Optional[dict]:
    """
    Computa série YoY 12m a partir do nível de CUSR0000SAH1.

    Retorna entrada no schema v1, ou None se input ausente/insuficiente.
    """
    if "CUSR0000SAH1" not in fred_data:
        print("  [cpi_shelter_yoy] Input CUSR0000SAH1 ausente. Pulando.")
        return None

    raw = fred_data["CUSR0000SAH1"].get("observations") or []
    if len(raw) < 13:
        print(
            f"  [cpi_shelter_yoy] Histórico insuficiente "
            f"({len(raw)} obs, mínimo 13). Pulando."
        )
        return None

    levels = [o["value"] for o in raw]
    yoy_values = cpi_yoy(levels)

    observations = [
        {"date": raw[i]["date"], "value": round(yoy_values[i], 2)}
        for i in range(len(raw))
        if yoy_values[i] is not None
    ]

    if not observations:
        return None

    latest_value = observations[-1]["value"]
    latest_date = observations[-1]["date"]

    # Para YoY o delta natural é em pontos percentuais
    mom_change = None
    yoy_change = None
    if len(observations) >= 2:
        prev = observations[-2]["value"]
        if prev is not None:
            mom_change = round(latest_value - prev, 2)
    if len(observations) >= 13:
        prev_yoy = observations[-13]["value"]
        if prev_yoy is not None:
            yoy_change = round(latest_value - prev_yoy, 2)

    print(
        f"  [cpi_shelter_yoy] OK — {len(observations)} obs mensais, "
        f"latest: {latest_value}% ({latest_date})"
    )

    return {
        "id": "cpi_shelter_yoy",
        "name": "CPI Shelter (12m YoY)",
        "group": "macro",
        "unit": "% YoY",
        "frequency": "Monthly",
        "source": "BLS via FRED · derivado",
        "observations": observations,
        "latest_value": latest_value,
        "latest_date": latest_date,
        "mom_change": mom_change,
        "yoy_change": yoy_change,
    }


# ---------------------------------------------------------------------------
# Standalone — validação numérica
# ---------------------------------------------------------------------------

def _run_validation() -> bool:
    """
    Executa validação numérica do `affordability_index` contra valores esperados.

    Retorna True se ambos os casos cairem dentro da tolerância de 5%.
    """
    print("=" * 60)
    print("Validação numérica: affordability_index")
    print("=" * 60)

    cases = [
        # (mortgage_rate_pct, median_price, income, expected_lo, expected_hi)
        (6.42, 412300, 95000, 95.0, 96.0),
        (7.10, 395000, 90000, 88.0, 90.0),
    ]

    all_ok = True
    for rate, price, income, lo, hi in cases:
        v = affordability_index(rate, price, income)
        midpoint = (lo + hi) / 2
        within_range = lo <= v <= hi
        within_tolerance = abs(v - midpoint) / midpoint <= 0.05
        ok = within_range or within_tolerance
        status = "OK" if ok else "FAIL"
        print(
            f"  rate={rate:.2f}% price=${price:,} income=${income:,}  "
            f"-> {v:.2f}  (esperado ~{lo}-{hi})  [{status}]"
        )
        all_ok = all_ok and ok

    print()
    if all_ok:
        print("Todos os casos dentro da tolerância. Fórmula validada.")
    else:
        print("VALIDAÇÃO FALHOU — fórmula pode estar incorreta.")
    return all_ok


def main() -> None:
    if not _run_validation():
        sys.exit(1)

    # Smoke test do cpi_yoy
    print()
    print("=" * 60)
    print("Smoke test: cpi_yoy")
    print("=" * 60)
    sample = [100.0 + i * 0.3 for i in range(36)]  # 3 anos de inflação ~3.6%/ano
    yoy = cpi_yoy(sample)
    nones = sum(1 for v in yoy if v is None)
    valids = [v for v in yoy if v is not None]
    print(f"  Input: {len(sample)} pontos mensais")
    print(f"  Output: {nones} Nones (esperado 12), {len(valids)} valores YoY")
    last_yoy = valids[-1] if valids else None
    print(f"  Último YoY: {last_yoy:.2f}% (esperado ~3.5-3.7%)")
    if nones != 12 or last_yoy is None or not (3.0 < last_yoy < 4.0):
        print("FAIL")
        sys.exit(1)
    print("OK")


if __name__ == "__main__":
    main()
