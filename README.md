# US Housing Market Dashboard

![GitHub Actions](https://img.shields.io/github/actions/workflow/status/YOUR_USER/us-housing-dashboard/update-data.yml?label=data%20update)
![Last Updated](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2FYOUR_USER.github.io%2Fus-housing-dashboard%2Fdata%2Findicators.json&query=%24.last_updated&label=last%20updated&color=gold)

A free, auto-updating dashboard tracking **18 key indicators** of the US housing market. Built with vanilla HTML/JS, Chart.js, and powered by the FRED API + web scraping. Hosted on GitHub Pages with weekly automated data updates via GitHub Actions.

## Live Demo

> **https://YOUR_USER.github.io/us-housing-dashboard/**

*(Replace `YOUR_USER` with your GitHub username after setup.)*

## Indicators

| # | ID | Name | Group | Frequency | Source |
|---|-----|------|-------|-----------|--------|
| 1 | MORTGAGE30US | 30-Year Fixed Mortgage Rate | Rates | Weekly | Freddie Mac / FRED |
| 2 | MORTGAGE15US | 15-Year Fixed Mortgage Rate | Rates | Weekly | Freddie Mac / FRED |
| 3 | MBA_PURCH | MBA Purchase Applications Index | Rates | Weekly | MBA (scraped) |
| 4 | MBA_REFI | MBA Refinance Applications Index | Rates | Weekly | MBA (scraped) |
| 5 | HOUST | Housing Starts (Total, SAAR) | Supply | Monthly | Census Bureau / FRED |
| 6 | PERMIT | Building Permits (Total, SAAR) | Supply | Monthly | Census Bureau / FRED |
| 7 | COMPUTSA | Housing Completions (SAAR) | Supply | Monthly | Census Bureau / FRED |
| 8 | MSACSR | Months' Supply of New Houses | Supply | Monthly | Census Bureau / FRED |
| 9 | HSN1F | New Home Sales (SAAR) | Demand | Monthly | Census Bureau / FRED |
| 10 | EXHOSLUSM495S | Existing Home Sales (SAAR) | Demand | Monthly | NAR / FRED |
| 11 | PENNSA | Pending Home Sales Index | Demand | Monthly | NAR / FRED |
| 12 | ACTLISCOUUS | Active Listing Count | Demand | Monthly | Realtor.com / FRED |
| 13 | CSUSHPISA | Case-Shiller National HPI | Prices | Monthly | S&P / FRED |
| 14 | USSTHPI | FHFA House Price Index | Prices | Quarterly | FHFA / FRED |
| 15 | MSPUS | Median Sales Price of Houses Sold | Prices | Quarterly | Census Bureau / FRED |
| 16 | NAHBMMI | NAHB Housing Market Index (HMI) | Sentiment | Monthly | NAHB / FRED |
| 17 | WPU081 | Lumber PPI (construction cost proxy) | Sentiment | Monthly | BLS / FRED |
| 18 | RMI | NAHB Remodeling Market Index | Sentiment | Quarterly | NAHB (scraped) |

## Setup

### 1. Fork or clone

```bash
git clone https://github.com/YOUR_USER/us-housing-dashboard.git
cd us-housing-dashboard
```

### 2. Get a FRED API key (free, takes 2 minutes)

1. Go to https://fred.stlouisfed.org/docs/api/api_key.html
2. Create an account or sign in
3. Request an API key — it's generated instantly

### 3. Add the secret to GitHub

1. Go to your repo on GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `FRED_API_KEY` | Value: your key from step 2

### 4. Enable GitHub Pages

1. Go to **Settings** > **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** | Folder: **/ (root)**
4. Click **Save**

### 5. Run the workflow for the first time

1. Go to **Actions** > **Update Housing Indicators Data**
2. Click **Run workflow** > **Run workflow**
3. Wait ~2 minutes for the data to be fetched and committed

### 6. Access your dashboard

Open: `https://YOUR_USER.github.io/us-housing-dashboard/`

## How It Works

```
FRED API ──> fetch_fred.py ────┐
                               ├──> merge_data.py ──> indicators.json ──> GitHub Pages
NAHB / MBA ──> fetch_scraped.py┘

GitHub Actions (cron: every Tuesday 14:00 UTC) orchestrates the pipeline.
The generated indicators.json is committed back to the repo and served statically.
```

- **fetch_fred.py** — Calls the FRED API for 15 economic series with retry + backoff
- **fetch_scraped.py** — Scrapes RMI from NAHB/Eye On Housing and MBA data from mortgagenewsdaily.com
- **merge_data.py** — Merges both sources, adds metadata, writes the final JSON
- **index.html + app.js** — Reads the JSON at page load and renders Chart.js charts

## Adding New Indicators

To add a new FRED series:

1. Find the series ID on https://fred.stlouisfed.org/
2. Add an entry to the `SERIES` dict in `scripts/fetch_fred.py`:
   ```python
   "NEW_ID": {
       "id": "NEW_ID",
       "name": "Series Name",
       "group": "supply",  # rates, supply, demand, prices, sentiment
       "unit": "Thousands of Units",
       "frequency": "Monthly",
       "source": "Source via FRED",
   },
   ```
3. Add the key to `SERIES_ORDER` in `app.js` under the correct group
4. Run the workflow or test locally

## Data Sources

- [FRED (Federal Reserve Bank of St. Louis)](https://fred.stlouisfed.org/)
- [Freddie Mac Primary Mortgage Market Survey](https://www.freddiemac.com/pmms)
- [U.S. Census Bureau — New Residential Construction](https://www.census.gov/construction/nrc/)
- [National Association of Realtors (NAR)](https://www.nar.realtor/research-and-statistics)
- [NAHB Housing Market Index](https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index)
- [NAHB Remodeling Market Index](https://www.nahb.org/news-and-economics/housing-economics/indices/remodeling-market-index)
- [MBA Weekly Applications Survey](https://www.mba.org/news-and-research/research-and-economics)
- [S&P CoreLogic Case-Shiller Home Price Index](https://www.spglobal.com/spdji/en/index-family/indicators/sp-corelogic-case-shiller/)
- [FHFA House Price Index](https://www.fhfa.gov/data/hpi)

## License

MIT
