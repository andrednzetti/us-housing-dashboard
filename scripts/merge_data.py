#!/usr/bin/env python3
"""
Merge FRED and scraped data into the final indicators.json file.

Reads data/fred_raw.json and data/scraped_raw.json, merges them,
adds global metadata, and writes data/indicators.json.
"""

import json
import os
import sys
from datetime import datetime, timezone

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB
OBSERVATION_START = "2020-01-01"

GROUP_ORDER = ["rates", "supply", "demand", "prices", "sentiment"]
GROUP_LABELS = {
    "rates": "Rates & Financing",
    "supply": "Supply",
    "demand": "Demand",
    "prices": "Prices",
    "sentiment": "Sentiment & Costs",
}


def load_json(path: str) -> dict:
    """Load a JSON file, returning empty dict if not found."""
    if not os.path.exists(path):
        print(f"  [WARNING] File not found: {path}")
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def truncate_observations(data: dict, start_date: str) -> dict:
    """Remove observations before start_date to keep file size down."""
    for key in data:
        obs = data[key].get("observations", [])
        data[key]["observations"] = [
            o for o in obs if o["date"] >= start_date
        ]
    return data


def main():
    base_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    fred_path = os.path.join(base_dir, "data", "fred_raw.json")
    scraped_path = os.path.join(base_dir, "data", "scraped_raw.json")
    output_path = os.path.join(base_dir, "data", "indicators.json")

    print("Loading FRED data...")
    fred_data = load_json(fred_path)
    print(f"  Loaded {len(fred_data)} series from FRED")

    print("Loading scraped data...")
    scraped_data = load_json(scraped_path)
    print(f"  Loaded {len(scraped_data)} series from scraping")

    # Merge
    merged = {**fred_data, **scraped_data}
    total = len(merged)
    print(f"\nMerged total: {total} series")

    # Count series per group
    groups = {}
    for key, entry in merged.items():
        g = entry.get("group", "unknown")
        groups[g] = groups.get(g, 0) + 1

    # Build final output with metadata
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    output = {
        "last_updated": now_utc,
        "total_series": total,
        "groups": {g: {"label": GROUP_LABELS.get(g, g), "count": groups.get(g, 0)}
                   for g in GROUP_ORDER if g in groups},
        "series": merged,
    }

    # Write and check size
    json_str = json.dumps(output, indent=2, ensure_ascii=False)
    size_bytes = len(json_str.encode("utf-8"))
    print(f"\nJSON size: {size_bytes / 1024:.1f} KB")

    if size_bytes > MAX_FILE_SIZE_BYTES:
        print(f"[WARNING] File exceeds {MAX_FILE_SIZE_BYTES / 1024 / 1024:.0f} MB limit. "
              f"Truncating observations before {OBSERVATION_START}...")
        merged = truncate_observations(merged, OBSERVATION_START)
        output["series"] = merged
        json_str = json.dumps(output, indent=2, ensure_ascii=False)
        size_bytes = len(json_str.encode("utf-8"))
        print(f"  New size: {size_bytes / 1024:.1f} KB")

        if size_bytes > MAX_FILE_SIZE_BYTES:
            print("[ERROR] Still exceeds limit after truncation!")
            sys.exit(1)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_str)

    print(f"\n{'='*50}")
    print(f"Output: {output_path} ({size_bytes / 1024:.1f} KB)")
    print(f"Series: {total}")
    for g in GROUP_ORDER:
        if g in groups:
            print(f"  {GROUP_LABELS.get(g, g)}: {groups[g]}")
    print(f"Last updated: {now_utc}")
    print("Done!")


if __name__ == "__main__":
    main()
