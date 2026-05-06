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

# Truncamento da série exposta no payload v2 — parametrizado por frequência
# para garantir que os botões de período do Spotlight (1M/3M/6M/1A/5A) tenham
# pontos suficientes para mostrar curvas distintas em todas as escalas.
#
# Antes da Fase 4 housekeeping, era uma constante única (52) — o que fazia
# 1A e 5A renderizarem a mesma curva para indicadores weekly. Agora cada
# frequência tem seu teto:
#   - Weekly:    260 pts ≈ 5 anos
#   - Monthly:    60 pts ≈ 5 anos
#   - Quarterly:  20 pts ≈ 5 anos
#   - Daily:     260 pts ≈ 1 ano (5 anos seriam ~1300 pts; aceitamos compressão)
POINTS_BY_FREQUENCY = {
    "Weekly":    260,
    "Monthly":    60,
    "Quarterly":  20,
    "Daily":     260,
}
DEFAULT_MAX_POINTS = 60  # fallback para frequência ausente/desconhecida

# Last-known-good fallback (PR 1b bugfix): se um indicador esperado estiver
# ausente após o merge raw, tenta recuperar do indicators.json anterior
# (commitado pelo workflow da semana passada) — desde que esteja "fresco".
MAX_FALLBACK_AGE_DAYS = 14

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

# Geração do payload v1 (`indicators.legacy.json`) foi removida no
# v2.0.0 (PR #16, Fase 5). O frontend React consome apenas `indicators.json`
# (schema v2). O snapshot histórico do legacy continua disponível na tag
# `v1-vanilla-final`, e o código vanilla está preservado em `legacy/`.
# As constantes LEGACY_V1_KEYS / LEGACY_KEY_ALIASES / V1_GROUP_ORDER /
# V1_GROUP_LABELS foram removidas junto com `build_legacy_v1`.


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


def load_previous_indicators(path: str) -> dict:
    """
    Lê o `indicators.json` produzido na execução anterior (commitado no repo)
    de forma schema-agnóstica e devolve um dict `raw_key -> series_data`.

    Suporta:
      - **Schema v1**: `data["series"]` é um dict keyed por raw_key (com
        observations completas — fonte ideal para o fallback, contém datas).
      - **Schema v2**: `data["indicators"]` é uma lista de objetos com
        `id, value, series[number]` — o array de números **não preserva
        datas**, então `get_series_age_days` retornará None e o fallback
        será descartado. Em produção, `indicators.legacy.json` é a fonte
        confiável de fallback após o cutover (chamada secundária em main).

    Devolve `{}` se o arquivo não existir ou estiver corrompido.
    """
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"  [WARN] Could not read previous {path}: {e}")
        return {}

    # Schema v1
    if isinstance(data.get("series"), dict):
        return data["series"]

    # Schema v2 — reconstrói shape esperado a partir do payload por indicador.
    # Não preserva datas; o age-check vai recusar esses fallbacks.
    if isinstance(data.get("indicators"), list):
        result: dict = {}
        for ind in data["indicators"]:
            ind_id = ind.get("id")
            if ind_id and ind_id in INDICATORS_META:
                raw_key = INDICATORS_META[ind_id]["raw_key"]
                result[raw_key] = {
                    "observations": ind.get("_observations", []),
                    "value": ind.get("value"),
                    "latest_value": ind.get("value"),
                }
        return result

    return {}


def get_series_age_days(series_data: dict) -> int | None:
    """
    Devolve quantos dias se passaram desde a última observação na série,
    ou None se não for possível determinar (sem observations, sem date,
    formato inválido).
    """
    obs = series_data.get("observations") or []
    if not obs:
        return None
    last_date_str = obs[-1].get("date")
    if not isinstance(last_date_str, str):
        return None
    try:
        # Aceita "YYYY-MM-DD" e "YYYY-MM-DDTHH:MM:SS..." — usamos só a parte da data.
        last_date = datetime.fromisoformat(last_date_str.split("T")[0]).date()
    except (ValueError, TypeError):
        return None
    today = datetime.now(timezone.utc).date()
    return (today - last_date).days


def apply_fallback(
    merged_raw: dict,
    previous: dict,
) -> list[tuple[str, str, int]]:
    """
    Para cada indicador esperado por `INDICATORS_META` cujo `raw_key` esteja
    ausente em `merged_raw`, tenta recuperar de `previous`.

    Mutates `merged_raw` em lugar adicionando os fallbacks aceitos.

    Retorna lista de tuplas `(indicator_id, raw_key, age_days)` para cada
    fallback efetivamente aplicado.

    Critérios de aceitação:
      - raw_key precisa estar em `previous` com observations/dates legíveis;
      - idade da última observação ≤ MAX_FALLBACK_AGE_DAYS (default 14);
      - sem age determinado → fallback é descartado em silêncio (skipped).
    """
    fallbacks: list[tuple[str, str, int]] = []
    for indicator_id, meta in INDICATORS_META.items():
        raw_key = meta["raw_key"]
        if raw_key in merged_raw:
            continue  # já presente no merge atual
        if raw_key not in previous:
            continue  # nada pra recuperar

        prev_data = previous[raw_key]
        age = get_series_age_days(prev_data)

        if age is None:
            # Sem datas (ex.: vem do payload v2) — não dá pra validar
            # a "freshness". Skip silencioso.
            continue
        if age > MAX_FALLBACK_AGE_DAYS:
            print(
                f"  [SKIP] {indicator_id}: previous data is {age}d old "
                f"(>{MAX_FALLBACK_AGE_DAYS}d). Will fail strict check."
            )
            continue

        merged_raw[raw_key] = prev_data
        fallbacks.append((indicator_id, raw_key, age))
        print(
            f"  [FALLBACK] {indicator_id}: using last-known-good for "
            f"{raw_key} ({age}d old)"
        )
    return fallbacks


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
    # Frequência vem do raw entry (FRED, scraped, e derivados — todos populam).
    # Se ausente, default Monthly para não estourar os JSONs com séries grandes.
    frequency = raw_entry.get("frequency") or "Monthly"
    max_points = POINTS_BY_FREQUENCY.get(frequency, DEFAULT_MAX_POINTS)
    series_values = [o["value"] for o in obs[-max_points:]]
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
        "frequency": frequency,
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
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    base_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    fred_path = os.path.join(base_dir, "data", "fred_raw.json")
    scraped_path = os.path.join(base_dir, "data", "scraped_raw.json")
    events_path = os.path.join(base_dir, "data", "events.json")
    schema_path = os.path.join(base_dir, "data", "schema.json")
    output_v2_path = os.path.join(base_dir, "data", "indicators.json")

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

    # ─── last-known-good fallback ────────────────────────────────────────
    # Antes do strict 23-or-fail, tenta preencher raw_keys ausentes a partir
    # do indicators.json anterior (commitado pelo workflow anterior). Em
    # versões anteriores tentávamos primeiro o legacy v1 — esse caminho foi
    # removido junto com a geração do legacy.json no v2.0.0.
    print("\nApplying last-known-good fallback for missing indicators...")
    previous = load_previous_indicators(output_v2_path)
    fallbacks = apply_fallback(merged, previous)

    # Log honesto: distingue 3 casos (todos OK / fallback recuperou / sem cobertura).
    # Antes do PR 1b bugfix, a lista vazia era reportada como "all present", o
    # que mascarava o caso onde algumas chaves estavam ausentes E também
    # ausentes do previous.
    all_raw_keys = {meta["raw_key"] for meta in INDICATORS_META.values()}
    missing_keys = all_raw_keys - set(merged.keys())

    if not missing_keys:
        print("  All raw_keys present in fresh merge — no fallback needed.")
    elif fallbacks:
        print(f"\n  [WARN] Used last-known-good for {len(fallbacks)} indicators:")
        for ind_id, raw_key, age in fallbacks:
            print(f"    - {ind_id} ({raw_key}): {age}d old")
        recovered = {fb[1] for fb in fallbacks}
        still_missing = missing_keys - recovered
        if still_missing:
            print(
                f"  [ERROR] {len(still_missing)} raw_keys still missing after "
                f"fallback: {sorted(still_missing)}"
            )
    else:
        print(
            f"  [ERROR] {len(missing_keys)} raw_keys missing and no fallback "
            f"available: {sorted(missing_keys)}"
        )

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

    if v2_size > MAX_FILE_SIZE_BYTES:
        print(
            f"\n[WARNING] indicators.json exceeds "
            f"{MAX_FILE_SIZE_BYTES / 1024 / 1024:.0f} MB. "
            f"Considere reduzir POINTS_BY_FREQUENCY ou habilitar truncagem."
        )

    # ─── resumo ──────────────────────────────────────────────────────────
    print()
    print("=" * 50)
    print(f"Done. v2: {v2_size / 1024:.1f} KB")
    print(f"Last updated: {now_utc}")


if __name__ == "__main__":
    main()
