#!/usr/bin/env python3
"""
Merge raw FRED + scraped + derived data into dual output:

  - data/indicators.json        — schema v2 (consumido pelo frontend novo)
  - data/indicators.legacy.json — schema v1 (consumido por app.js legacy)

O catálogo declarativo `indicators_meta.INDICATORS_META` é a fonte da verdade
para os 23 indicadores expostos: nome, label curto, fmt_spec, why, sentiment,
up_is_bad, fmt_spec, delta_unit, delta_period.

A v2 é validada contra `data/schema.json` antes da escrita.
A v1 é construída a partir do mesmo merge raw, filtrando para os 18 IDs
que `app.js` referencia hoje (sem reuso da lógica antiga GROUP_ORDER hardcoded).

Política de falha:
  - Se algum dos 23 indicadores faltar (raw_key ausente no merge), aborta
    com sys.exit(1) listando exatamente os indicadores faltantes.
  - Se a validação JSON Schema falhar, aborta com sys.exit(1) apontando
    o caminho do campo divergente.
  - events.json malformado/ausente → fallback `[]` + warning, nunca derruba.
  - Tamanho do JSON > 2 MB → trunca observations antes de OBSERVATION_START
    (mecanismo defensivo herdado).
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any

import jsonschema

# Local imports — `python scripts/merge_data.py` adiciona scripts/ ao sys.path.
import compute_derived
from indicators_meta import INDICATORS_META
from static_data import REGIONS, METROS


# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB
OBSERVATION_START = "2020-01-01"
MAX_SERIES_POINTS = 52  # último ano para weekly, ~4 anos para monthly, etc.

# Lookback (e tolerância de busca) por delta_period.
LOOKBACK_DAYS = {
    "sem":  7,
    "mês":  30,
    "tri":  90,
    "12m":  365,
    "30d":  30,
}
TOLERANCE_DAYS = {
    "sem":  4,
    "mês":  12,
    "tri":  30,
    "12m":  60,
    "30d":  8,
}

# Schema v1: keys que `app.js` referencia. Raw FRED IDs / scraped IDs.
LEGACY_V1_KEYS = [
    "MORTGAGE30US", "MORTGAGE15US", "MBA_PURCH", "MBA_REFI",
    "HOUST", "PERMIT", "COMPUTSA", "MSACSR",
    "HSN1F", "EXHOSLUSM495S", "PHSI", "ACTLISCOUUS",
    "CSUSHPISA", "USSTHPI", "MSPUS",
    "USHMI", "WPU081", "RMI",
]

# Schema v1: agrupamento que `app.js` espera (separado do v2 — não muda).
V1_GROUP_ORDER = ["rates", "supply", "demand", "prices", "sentiment"]
V1_GROUP_LABELS = {
    "rates":     "Rates & Financing",
    "supply":    "Supply",
    "demand":    "Demand",
    "prices":    "Prices",
    "sentiment": "Sentiment & Costs",
}


# ---------------------------------------------------------------------------
# I/O helpers
# ---------------------------------------------------------------------------

def load_json(path: str) -> dict:
    """Load a JSON file, returning empty dict if not found."""
    if not os.path.exists(path):
        print(f"  [WARNING] File not found: {path}")
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_events(path: str) -> list[dict]:
    """
    Load `data/events.json` defensively. Nunca derruba o pipeline.

    Fallback `[]` se ausente, malformado, ou shape inválido.
    """
    if not os.path.exists(path):
        print(f"  [WARNING] Events file not found: {path}. Using empty events list.")
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, list):
            print(f"  [WARNING] {path} is not a JSON list. Using empty events list.")
            return []
        return data
    except (json.JSONDecodeError, OSError) as e:
        print(f"  [WARNING] Failed to load {path}: {e}. Using empty events list.")
        return []


def write_json(path: str, payload: Any) -> int:
    """Write payload to path with ensure_ascii=False, indent=2. Returns size in bytes."""
    json_str = json.dumps(payload, indent=2, ensure_ascii=False)
    size_bytes = len(json_str.encode("utf-8"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(json_str)
    return size_bytes


# ---------------------------------------------------------------------------
# Delta-by-frequency
# ---------------------------------------------------------------------------

def _parse_date(s: str):
    return datetime.strptime(s, "%Y-%m-%d").date()


def _find_obs_at_lookback(
    observations: list[dict],
    lookback_days: int,
    tolerance_days: int,
) -> dict | None:
    """
    Encontra a observação cuja data esteja mais próxima de
    (latest_date - lookback_days), dentro de uma tolerância.

    Retorna None se não houver observação dentro da tolerância.
    """
    if len(observations) < 2:
        return None
    latest_date = _parse_date(observations[-1]["date"])
    target = latest_date - timedelta(days=lookback_days)
    best = None
    best_diff: int | None = None
    for o in observations[:-1]:
        d = _parse_date(o["date"])
        diff = abs((d - target).days)
        if best_diff is None or diff < best_diff:
            best = o
            best_diff = diff
    if best_diff is not None and best_diff <= tolerance_days:
        return best
    return None


def compute_delta(
    observations: list[dict],
    delta_unit: str,
    delta_period: str,
) -> float:
    """
    Computa o delta apropriado para a janela `delta_period`, na unidade
    especificada por `delta_unit`.

    delta_unit:
      - 'pp' / 'pts' / 'pt' / 'm' / 'idx' → diferença absoluta (cur - prev)
      - '%' / '% a.a.'                    → variação relativa em percentual
                                             ((cur / prev) - 1) × 100

    Se não houver observação anterior dentro da tolerância, retorna 0.0
    (acceptable fallback — schema v2 requer `delta: number`).
    """
    if not observations or len(observations) < 2:
        return 0.0

    prev_obs = _find_obs_at_lookback(
        observations,
        LOOKBACK_DAYS.get(delta_period, 30),
        TOLERANCE_DAYS.get(delta_period, 12),
    )
    if prev_obs is None:
        return 0.0

    cur = observations[-1]["value"]
    prev = prev_obs["value"]

    if delta_unit in ("pp", "pts", "pt", "m", "idx"):
        return round(cur - prev, 2)
    if delta_unit in ("%", "% a.a."):
        if prev == 0:
            return 0.0
        return round((cur / prev - 1) * 100, 2)
    # fallback: tratar como diferença absoluta
    return round(cur - prev, 2)


# ---------------------------------------------------------------------------
# Construção do payload v2
# ---------------------------------------------------------------------------

def build_v2_indicator(meta_id: str, meta: dict, raw_entry: dict) -> dict:
    obs = raw_entry.get("observations") or []
    series_values = [o["value"] for o in obs[-MAX_SERIES_POINTS:]]
    delta = compute_delta(obs, meta["delta_unit"], meta["delta_period"])
    indicator: dict[str, Any] = {
        "id": meta_id,
        "group": meta["group"],
        "name": meta["name"],
        "short": meta["short"],
        "value": raw_entry.get("latest_value", 0),
        "unit": meta["unit"],
        "fmtSpec": meta["fmt_spec"],
        "delta": delta,
        "deltaUnit": meta["delta_unit"],
        "deltaPeriod": meta["delta_period"],
        "series": series_values,
        "source": meta["source"],
        "why": meta["why"],
        "sentiment": meta["sentiment"],
    }
    if "up_is_bad" in meta:
        indicator["upIsBad"] = meta["up_is_bad"]
    return indicator


def build_v2_indicators(merged: dict) -> list[dict]:
    """
    Constrói os 23 indicadores conforme `INDICATORS_META`.

    Aborta se algum raw_key estiver faltante ou sem observations.
    """
    indicators: list[dict] = []
    missing: list[tuple[str, str]] = []
    for meta_id, meta in INDICATORS_META.items():
        raw_key = meta["raw_key"]
        raw_entry = merged.get(raw_key)
        if not raw_entry or not raw_entry.get("observations"):
            missing.append((meta_id, raw_key))
            continue
        indicators.append(build_v2_indicator(meta_id, meta, raw_entry))

    if missing:
        print()
        print(f"[FATAL] {len(missing)} indicators ausentes no merge raw:")
        for meta_id, raw_key in missing:
            print(f"  - {meta_id} (raw_key='{raw_key}')")
        sys.exit(1)

    return indicators


def validate_v2_against_schema(payload: dict, schema_path: str) -> None:
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)
    try:
        jsonschema.validate(payload, schema)
    except jsonschema.ValidationError as e:
        print()
        print("[FATAL] indicators.json failed schema validation:")
        print(f"  Path:    {'/'.join(str(p) for p in e.absolute_path) or '(root)'}")
        print(f"  Message: {e.message}")
        if e.context:
            for ctx in list(e.context)[:5]:
                print(
                    f"   - sub: "
                    f"{'/'.join(str(p) for p in ctx.absolute_path) or '(root)'}: "
                    f"{ctx.message}"
                )
        sys.exit(1)
    print("  Schema v2 validation passed.")


# ---------------------------------------------------------------------------
# Construção do payload legacy (v1) — compat com app.js
# ---------------------------------------------------------------------------

def build_legacy_v1(merged_raw: dict, generated_at: str) -> dict:
    """
    Constrói o payload v1 a partir do merge raw.

    Filtra para os 18 IDs que `app.js` referencia. Mantém a estrutura
    `{last_updated, total_series, groups, series}` exatamente como o
    `merge_data.py` original produzia.
    """
    series = {k: merged_raw[k] for k in LEGACY_V1_KEYS if k in merged_raw}

    group_counts: dict[str, int] = {}
    for entry in series.values():
        g = entry.get("group", "unknown")
        group_counts[g] = group_counts.get(g, 0) + 1

    return {
        "last_updated": generated_at,
        "total_series": len(series),
        "groups": {
            g: {"label": V1_GROUP_LABELS.get(g, g), "count": group_counts[g]}
            for g in V1_GROUP_ORDER
            if g in group_counts
        },
        "series": series,
    }


# ---------------------------------------------------------------------------
# Tamanho do output — truncagem defensiva
# ---------------------------------------------------------------------------

def truncate_observations(data: dict, start_date: str) -> dict:
    """Remove observations before start_date para reduzir tamanho."""
    for key in data:
        obs = data[key].get("observations", [])
        data[key]["observations"] = [o for o in obs if o["date"] >= start_date]
    return data


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    base_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    fred_path = os.path.join(base_dir, "data", "fred_raw.json")
    scraped_path = os.path.join(base_dir, "data", "scraped_raw.json")
    events_path = os.path.join(base_dir, "data", "events.json")
    schema_path = os.path.join(base_dir, "data", "schema.json")
    output_v2_path = os.path.join(base_dir, "data", "indicators.json")
    output_legacy_path = os.path.join(base_dir, "data", "indicators.legacy.json")

    print("Loading FRED data...")
    fred_data = load_json(fred_path)
    print(f"  Loaded {len(fred_data)} series from FRED")

    print("Loading scraped data...")
    scraped_data = load_json(scraped_path)
    print(f"  Loaded {len(scraped_data)} series from scraping")

    print("\nComputing derived series...")
    derived: dict = {}
    affordability = compute_derived.compute_affordability_series(fred_data)
    if affordability is not None:
        derived["affordability"] = affordability
    cpi_yoy = compute_derived.compute_cpi_shelter_yoy(fred_data)
    if cpi_yoy is not None:
        derived["cpi_shelter_yoy"] = cpi_yoy
    print(f"  Computed {len(derived)} derived series")

    merged = {**fred_data, **scraped_data, **derived}
    print(f"\nMerged total: {len(merged)} raw series")

    # ─── v2 ──────────────────────────────────────────────────────────────
    print("\nBuilding v2 payload...")
    indicators = build_v2_indicators(merged)
    events = load_events(events_path)

    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    v2_payload = {
        "schemaVersion": "2.0",
        "generatedAt": now_utc,
        "indicators": indicators,
        "regions": REGIONS,
        "metros": METROS,
        "events": events,
    }

    print(f"  v2 indicators: {len(indicators)}")
    print(f"  v2 regions:    {len(REGIONS)}")
    print(f"  v2 metros:     {len(METROS)}")
    print(f"  v2 events:     {len(events)}")

    print("\nValidating v2 against schema.json...")
    validate_v2_against_schema(v2_payload, schema_path)

    v2_size = write_json(output_v2_path, v2_payload)
    print(f"\nWritten {output_v2_path} ({v2_size / 1024:.1f} KB)")

    # ─── legacy v1 ───────────────────────────────────────────────────────
    print("\nBuilding legacy v1 payload (app.js compat)...")
    legacy_payload = build_legacy_v1(merged, now_utc)
    print(f"  legacy series: {legacy_payload['total_series']}")

    legacy_size = write_json(output_legacy_path, legacy_payload)
    print(f"Written {output_legacy_path} ({legacy_size / 1024:.1f} KB)")

    # ─── tamanho defensivo ───────────────────────────────────────────────
    total_size = v2_size + legacy_size
    if total_size > MAX_FILE_SIZE_BYTES:
        print(
            f"\n[WARNING] Combined output exceeds "
            f"{MAX_FILE_SIZE_BYTES / 1024 / 1024:.0f} MB. "
            f"Truncating legacy observations before {OBSERVATION_START}..."
        )
        truncated = truncate_observations(legacy_payload["series"], OBSERVATION_START)
        legacy_payload["series"] = truncated
        legacy_size = write_json(output_legacy_path, legacy_payload)
        print(f"  legacy resized: {legacy_size / 1024:.1f} KB")

    # ─── resumo ──────────────────────────────────────────────────────────
    print()
    print("=" * 50)
    print(f"Done. v2: {v2_size / 1024:.1f} KB · legacy: {legacy_size / 1024:.1f} KB")
    print(f"Last updated: {now_utc}")


if __name__ == "__main__":
    main()
