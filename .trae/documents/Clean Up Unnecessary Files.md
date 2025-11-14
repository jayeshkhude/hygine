## Goals
- Remove unused code/components and leftover artifacts to reduce repo size and confusion
- Align utility usage (expiry calculation) to a single source
- Keep docs and essential configs intact

## Findings
- Framework: Next.js app router (`app/`), Tailwind, Upstash Redis (fallback in-memory)
- Active UI imports in `app/page.tsx:5–11` confirm usage of `RiskMap`, `SummaryCards`, `Charts`, `DataTable`, `ReportForm`, `LandingPage`
- API in use: `app/api/reports/route.ts` and `app/api/geocode/route.ts`; dashboard API not referenced by UI
- Expiry logic duplicated; `app/utils/riskCalculation.ts` conflicts with `app/utils/categoryConfig.ts` categories

## Deletion Candidates
- Unused components:
  - `app/components/CSVReader.tsx` (no references)
  - `app/components/Sidebar.tsx` (no references)
- Unused utilities:
  - `app/utils/riskClassification.ts` (no references)
- Non-app artifacts not referenced by code:
  - `ml/artifacts/analysis_report.json`
  - `ml/artifacts/aqi_model.pkl`
  - `ml/artifacts/feature_config.json`
  - `city_hygiene_risk_monitor.py`
  - `sample_data.csv` (mentioned only in `README.md`)
- Optional (if not in use for CI/CD):
  - `deploy.sh`
- Keep for now: `app/api/dashboard/route.ts` (server-side-only endpoint; safe to retain unless explicitly unused)

## Code Adjustments (no behavior change)
- Unify expiry calculation to `categoryConfig`:
  - In `app/lib/redis.ts:191–194`, replace dynamic import of `../utils/riskCalculation` with `../utils/categoryConfig` and use `calculateExpiryDate`
- No other imports need changes; unused components/util are not referenced anywhere

## .gitignore Updates
- Add entries to prevent future commits of artifacts:
  - `ml/artifacts/`
  - `*.pkl`
  - Optionally `*.csv` if sample data is not needed

## Steps
1. Delete files listed under Deletion Candidates (excluding optional until confirmed)
2. Update `app/lib/redis.ts` to use `calculateExpiryDate` from `categoryConfig` (`app/utils/categoryConfig.ts:70–74`)
3. Update `.gitignore` with artifact patterns
4. Run `npm run build` and `npm run start` to verify the app builds and runs

## Verification
- Search confirms no references to: `CSVReader.tsx`, `Sidebar.tsx`, `riskClassification.ts`, ML artifacts, `city_hygiene_risk_monitor.py`
- UI still imports and renders active components (`app/page.tsx:115–151`)
- API routes remain functional; `ReportStore` usage verified in `app/api/reports/route.ts:92–101` and `app/api/dashboard/route.ts:6–8`
- After changes, run smoke test: open `/` and test map, report form, charts, table