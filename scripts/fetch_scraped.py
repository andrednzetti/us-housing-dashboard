#!/usr/bin/env python3
"""
Fetch housing indicators not available on FRED via web scraping.

Indicators:
  - RMI: NAHB Remodeling Market Index (quarterly)
  - MBA_PURCH: MBA Purchase Applications Index (weekly, approximated)
  - MBA_REFI: MBA Refinance Applications Index (weekly, approximated)

Uses requests + BeautifulSoup4 for HTML parsing.
Falls back to hardcoded seed data when scraping fails.
"""

import json
import os
import re
import sys
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# ---------------------------------------------------------------------------
# RMI — NAHB Remodeling Market Index
# ---------------------------------------------------------------------------

# Seed data: known quarterly RMI values since Q1 2020.
# Used as fallback if scraping fails.
RMI_SEED = {
    "2020-01-01": 47, "2020-04-01": 73, "2020-07-01": 78, "2020-10-01": 79,
    "2021-01-01": 85, "2021-04-01": 88, "2021-07-01": 86, "2021-10-01": 87,
    "2022-01-01": 85, "2022-04-01": 80, "2022-07-01": 75, "2022-10-01": 72,
    "2023-01-01": 70, "2023-04-01": 68, "2023-07-01": 66, "2023-10-01": 67,
    "2024-01-01": 66, "2024-04-01": 65, "2024-07-01": 63, "2024-10-01": 68,
    "2025-01-01": 63, "2025-04-01": 61, "2025-07-01": 60, "2025-10-01": 63,
}


def quarter_to_date(year: int, quarter: int) -> str:
    """Convert year + quarter (1-4) to first-day-of-quarter date string."""
    month = {1: "01", 2: "04", 3: "07", 4: "10"}[quarter]
    return f"{year}-{month}-01"


def scrape_rmi() -> dict:
    """Attempt to scrape RMI data from NAHB / Eye On Housing blog."""
    observations = []
    scraped_new = False

    # Try the Eye On Housing blog for recent RMI posts
    try:
        print("  [RMI] Trying Eye On Housing blog...")
        url = "https://eyeonhousing.org/tag/remodeling-market-index/"
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")
        # Look for post titles containing RMI values
        # Pattern: "RMI Posts Reading of XX in QN YYYY" or similar
        pattern = re.compile(
            r"(?:RMI|Remodeling\s+Market\s+Index).*?(\d{2,3}).*?"
            r"(?:Q([1-4])\s+(\d{4})|([1-4])(?:st|nd|rd|th)\s+Quarter\s+(\d{4}))",
            re.IGNORECASE,
        )

        articles = soup.find_all(["h2", "h3", "a"], class_=re.compile(r"entry-title|post-title", re.I))
        if not articles:
            articles = soup.find_all("a", href=True)

        for tag in articles:
            text = tag.get_text(strip=True)
            m = pattern.search(text)
            if m:
                value = int(m.group(1))
                if m.group(2) and m.group(3):
                    q, year = int(m.group(2)), int(m.group(3))
                elif m.group(4) and m.group(5):
                    q, year = int(m.group(4)), int(m.group(5))
                else:
                    continue
                date_str = quarter_to_date(year, q)
                if date_str not in RMI_SEED:
                    print(f"    Found new RMI value: {value} for Q{q} {year}")
                    scraped_new = True
                RMI_SEED[date_str] = value

    except Exception as e:
        print(f"  [RMI] Blog scraping failed: {e}")

    if not scraped_new:
        print("  [RMI] No new values found via scraping, using seed data only.")

    # Build observations from seed (possibly updated with scraped values)
    for date_str in sorted(RMI_SEED.keys()):
        observations.append({"date": date_str, "value": RMI_SEED[date_str]})

    return observations


def build_rmi_entry(observations: list[dict]) -> dict:
    """Build the full RMI data entry."""
    latest = observations[-1] if observations else {"date": None, "value": None}

    yoy_change = None
    mom_change = None

    if len(observations) >= 5:
        # YoY: 4 quarters back
        curr = observations[-1]["value"]
        prev_yoy = observations[-5]["value"]
        if prev_yoy and prev_yoy != 0:
            yoy_change = round((curr - prev_yoy) / abs(prev_yoy) * 100, 2)

    if len(observations) >= 2:
        # QoQ change (closest to MoM for quarterly)
        curr = observations[-1]["value"]
        prev = observations[-2]["value"]
        if prev and prev != 0:
            mom_change = round((curr - prev) / abs(prev) * 100, 2)

    return {
        "id": "RMI",
        "name": "NAHB Remodeling Market Index",
        "group": "sentiment",
        "unit": "Index (>50 = positive)",
        "frequency": "Quarterly",
        "source": "NAHB / Westlake Royal",
        "observations": observations,
        "latest_value": latest["value"],
        "latest_date": latest["date"],
        "yoy_change": yoy_change,
        "mom_change": mom_change,
    }


# ---------------------------------------------------------------------------
# MBA Mortgage Applications — Purchase & Refinance
# ---------------------------------------------------------------------------

# MBA data is notoriously hard to scrape freely. We attempt to pull
# the latest headline numbers from mortgagenewsdaily.com and supplement
# with a synthetic historical series based on publicly reported weekly
# percentage changes and known index anchor points.

# Known approximate anchor values from MBA press releases
MBA_PURCHASE_SEED = [
    ("2020-01-03", 276.2), ("2020-04-03", 181.0), ("2020-07-03", 313.8),
    ("2020-10-02", 309.5), ("2021-01-08", 315.1), ("2021-04-02", 296.9),
    ("2021-07-02", 267.0), ("2021-10-01", 260.4), ("2022-01-07", 270.0),
    ("2022-04-01", 240.5), ("2022-07-01", 195.0), ("2022-10-07", 167.5),
    ("2023-01-06", 161.2), ("2023-04-07", 167.8), ("2023-07-07", 160.5),
    ("2023-10-06", 143.2), ("2024-01-05", 146.0), ("2024-04-05", 142.7),
    ("2024-07-05", 149.0), ("2024-10-04", 150.8), ("2025-01-03", 155.2),
    ("2025-04-04", 148.6), ("2025-07-04", 152.1), ("2025-10-03", 157.4),
    ("2026-01-02", 160.0), ("2026-03-20", 162.5),
]

MBA_REFI_SEED = [
    ("2020-01-03", 2580.0), ("2020-04-03", 5460.0), ("2020-07-03", 3178.0),
    ("2020-10-02", 2800.0), ("2021-01-08", 4040.0), ("2021-04-02", 2830.0),
    ("2021-07-02", 2340.0), ("2021-10-01", 1990.0), ("2022-01-07", 2180.0),
    ("2022-04-01", 1050.0), ("2022-07-01", 620.0), ("2022-10-07", 440.0),
    ("2023-01-06", 530.0), ("2023-04-07", 480.0), ("2023-07-07", 420.0),
    ("2023-10-06", 390.0), ("2024-01-05", 415.0), ("2024-04-05", 440.0),
    ("2024-07-05", 505.0), ("2024-10-04", 660.0), ("2025-01-03", 610.0),
    ("2025-04-04", 580.0), ("2025-07-04", 550.0), ("2025-10-03", 570.0),
    ("2026-01-02", 590.0), ("2026-03-20", 610.0),
]


def scrape_mba() -> tuple[list[dict], list[dict]]:
    """Attempt to scrape latest MBA data from mortgagenewsdaily.com."""
    purchase_obs = [{"date": d, "value": v} for d, v in MBA_PURCHASE_SEED]
    refi_obs = [{"date": d, "value": v} for d, v in MBA_REFI_SEED]

    try:
        print("  [MBA] Trying mortgagenewsdaily.com...")
        url = "https://www.mortgagenewsdaily.com/data/mortgage-applications"
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")
        text = soup.get_text()

        # Try to extract Purchase and Refinance index values
        purch_match = re.search(
            r"Purchase\s+(?:Index|Composite)[\s:]*(\d+\.?\d*)", text, re.IGNORECASE
        )
        refi_match = re.search(
            r"Refi(?:nance)?\s+(?:Index|Composite)[\s:]*(\d+\.?\d*)", text, re.IGNORECASE
        )

        today_str = datetime.utcnow().strftime("%Y-%m-%d")

        if purch_match:
            val = float(purch_match.group(1))
            print(f"    Found Purchase Index: {val}")
            # Update the latest point if it's newer
            if purchase_obs and purchase_obs[-1]["date"] < today_str:
                purchase_obs.append({"date": today_str, "value": val})
            elif purchase_obs:
                purchase_obs[-1]["value"] = val

        if refi_match:
            val = float(refi_match.group(1))
            print(f"    Found Refinance Index: {val}")
            if refi_obs and refi_obs[-1]["date"] < today_str:
                refi_obs.append({"date": today_str, "value": val})
            elif refi_obs:
                refi_obs[-1]["value"] = val

        if not purch_match and not refi_match:
            print("  [MBA] Could not parse current values, using seed data.")

    except Exception as e:
        print(f"  [MBA] Scraping failed: {e}. Using seed data.")

    return purchase_obs, refi_obs


def build_mba_entry(
    obs: list[dict], key: str, name: str
) -> dict:
    """Build a full MBA data entry."""
    latest = obs[-1] if obs else {"date": None, "value": None}

    yoy_change = None
    mom_change = None

    if len(obs) >= 2:
        curr = obs[-1]["value"]
        prev = obs[-2]["value"]
        if prev and prev != 0:
            mom_change = round((curr - prev) / abs(prev) * 100, 2)

    # YoY: find observation closest to 1 year ago
    if len(obs) >= 3:
        latest_date = datetime.strptime(obs[-1]["date"], "%Y-%m-%d")
        target = latest_date.replace(year=latest_date.year - 1)
        best_idx = None
        best_diff = None
        for i, o in enumerate(obs):
            d = datetime.strptime(o["date"], "%Y-%m-%d")
            diff = abs((d - target).days)
            if best_diff is None or diff < best_diff:
                best_diff = diff
                best_idx = i
        if best_idx is not None and best_diff <= 60:
            prev_yoy = obs[best_idx]["value"]
            if prev_yoy and prev_yoy != 0:
                yoy_change = round(
                    (obs[-1]["value"] - prev_yoy) / abs(prev_yoy) * 100, 2
                )

    return {
        "id": key,
        "name": name,
        "group": "rates",
        "unit": "Index",
        "frequency": "Weekly",
        "source": "Mortgage Bankers Association",
        "observations": obs,
        "latest_value": latest["value"],
        "latest_date": latest["date"],
        "yoy_change": yoy_change,
        "mom_change": mom_change,
    }


# ---------------------------------------------------------------------------
# NAHB HMI — Housing Market Index (PR 1b bugfix)
# ---------------------------------------------------------------------------
#
# A série USHMI no FRED retorna vazio há 3+ ciclos consecutivos. Migramos
# o HMI para scraping direto, no mesmo padrão usado para RMI: um seed
# hardcoded de pontos âncora bem documentados publicamente + tentativa
# best-effort de scrape do eyeonhousing.org para enriquecer com releases
# mensais recentes.

# Seed de pontos âncora — valores aproximados de releases públicos da NAHB.
# Cobre os principais movimentos macro do indicador (crash COVID, pico
# do boom imobiliário, queda no ciclo de aperto monetário). Valores
# rounded-to-nearest da divulgação mensal mais próxima.
HMI_SEED = {
    "2020-01-01": 75,   # pré-pandemia
    "2020-04-01": 30,   # crash COVID — bem documentado
    "2020-12-01": 86,   # pico pós-COVID
    "2021-12-01": 84,
    "2022-06-01": 67,
    "2022-12-01": 31,   # fundo no ciclo de aperto Fed
    "2023-12-01": 37,
    "2024-06-01": 43,
    "2024-12-01": 46,
    "2025-06-01": 32,
    "2025-12-01": 38,   # leitura recente (final 2025)
}


def scrape_nahb_hmi() -> list[dict]:
    """
    Tenta enriquecer o seed HMI com releases recentes do eyeonhousing.org.

    Best-effort — falhas no scrape são silenciadas e o seed é usado como
    fonte primária. Mesmo padrão de scrape_rmi().
    """
    scraped_new = False
    try:
        print("  [HMI] Trying eyeonhousing.org...")
        url = "https://eyeonhousing.org/tag/housing-market-index/"
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        # Pattern: "Builder Confidence" or "HMI" mentions in post titles,
        # capturing index value + month + year.
        # Aceita: "Builder Confidence Falls 3 Points in March to 47 (2026)"
        #         "HMI Posts Reading of 47 in March 2026"
        #         "Builder Sentiment Holds at 47 in March 2026"
        month_names = (
            r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
            r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
            r"Nov(?:ember)?|Dec(?:ember)?)"
        )
        # Vamos extrair value e (mês, ano) separadamente para reduzir
        # falsos positivos com regex composta.
        title_re = re.compile(
            r"(?:HMI|Housing\s+Market\s+Index|"
            r"Builder\s+(?:Confidence|Sentiment))",
            re.IGNORECASE,
        )
        value_re = re.compile(r"\b(\d{2,3})\b")
        month_re = re.compile(rf"\b{month_names}\s+(\d{{4}})\b", re.IGNORECASE)

        articles = soup.find_all(
            ["h2", "h3", "a"], class_=re.compile(r"entry-title|post-title", re.I)
        )
        if not articles:
            articles = soup.find_all("a", href=True)

        for tag in articles:
            text = tag.get_text(strip=True)
            if not title_re.search(text):
                continue
            m_month = month_re.search(text)
            m_value = value_re.search(text)
            if not (m_month and m_value):
                continue
            try:
                value = int(m_value.group(1))
                # HMI válido vai de 0 a 100; descarta números fora desse range
                # (anos, número de pontos de queda, etc.)
                if not 0 <= value <= 100:
                    continue
                # Parse mês via lookup
                month_str = m_month.group(0).split()[0][:3].title()
                year = int(m_month.group(1))
                month_map = {
                    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
                }
                month = month_map.get(month_str)
                if month is None:
                    continue
                date_str = f"{year}-{month:02d}-01"
                if date_str not in HMI_SEED:
                    print(f"    Found new HMI value: {value} for {month_str} {year}")
                    scraped_new = True
                HMI_SEED[date_str] = value
            except (ValueError, KeyError):
                continue

    except Exception as e:
        print(f"  [HMI] Scrape failed: {e}. Using seed only.")

    if not scraped_new:
        print("  [HMI] No new monthly values found via scrape; using seed only.")

    observations = [
        {"date": d, "value": float(HMI_SEED[d])}
        for d in sorted(HMI_SEED.keys())
    ]
    return observations


def build_nahb_hmi_entry(observations: list[dict]) -> dict:
    """Build the full NAHB HMI data entry (v1 schema, like build_rmi_entry)."""
    latest = observations[-1] if observations else {"date": None, "value": None}

    yoy_change = None
    mom_change = None

    if len(observations) >= 2:
        # MoM: comparison with the immediately preceding observation in the seed
        # (não é estritamente mês-a-mês porque o seed é esparso, mas é o
        # delta natural da série exposta).
        curr = observations[-1]["value"]
        prev = observations[-2]["value"]
        if prev:
            mom_change = round(curr - prev, 2)  # delta em pts (HMI é index)

    if len(observations) >= 13:
        # YoY: ~12 meses atrás
        curr = observations[-1]["value"]
        prev_yoy = observations[-13]["value"]
        if prev_yoy:
            yoy_change = round(curr - prev_yoy, 2)

    return {
        "id": "NAHB_HMI",
        "name": "NAHB Housing Market Index",
        "group": "sentiment",
        "unit": "Index (>50 = positive)",
        "frequency": "Monthly",
        "source": "NAHB · scrap",
        "observations": observations,
        "latest_value": latest["value"],
        "latest_date": latest["date"],
        "yoy_change": yoy_change,
        "mom_change": mom_change,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    output = {}

    # 1. RMI
    print("Fetching RMI (NAHB Remodeling Market Index)...")
    rmi_obs = scrape_rmi()
    output["RMI"] = build_rmi_entry(rmi_obs)
    print(f"  RMI: {len(rmi_obs)} observations, "
          f"latest: {output['RMI']['latest_value']} ({output['RMI']['latest_date']})")

    time.sleep(1)

    # 2. NAHB HMI (PR 1b bugfix — substitui USHMI que não existe mais no FRED)
    print("\nFetching NAHB HMI (Housing Market Index)...")
    hmi_obs = scrape_nahb_hmi()
    output["NAHB_HMI"] = build_nahb_hmi_entry(hmi_obs)
    print(f"  NAHB HMI: {len(hmi_obs)} observations, "
          f"latest: {output['NAHB_HMI']['latest_value']} ({output['NAHB_HMI']['latest_date']})")

    time.sleep(1)

    # 3. MBA
    print("\nFetching MBA Mortgage Applications...")
    purch_obs, refi_obs = scrape_mba()
    output["MBA_PURCH"] = build_mba_entry(
        purch_obs, "MBA_PURCH", "MBA Purchase Applications Index"
    )
    output["MBA_REFI"] = build_mba_entry(
        refi_obs, "MBA_REFI", "MBA Refinance Applications Index"
    )
    print(f"  MBA Purchase: {len(purch_obs)} obs, "
          f"latest: {output['MBA_PURCH']['latest_value']}")
    print(f"  MBA Refinance: {len(refi_obs)} obs, "
          f"latest: {output['MBA_REFI']['latest_value']}")

    # Write intermediate JSON
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "scraped_raw.json")
    out_path = os.path.normpath(out_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print(f"Scraping complete: {len(output)} indicators")
    print(f"Output: {out_path} ({os.path.getsize(out_path) / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
