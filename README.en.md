# LangConfig — Chinese Localization

> A fully localised Chinese edition of [LangConfig](https://github.com/LangConfig/langconfig) (MIT).
> Chinese documentation: [`README.md`](README.md). Upstream docs: [`README.upstream.md`](README.upstream.md).

This repository ships a ready-to-run Chinese build of LangConfig together with the
localization toolchain, reports and an applicable patch.

## Status

| Metric | Value |
| --- | --- |
| Hardcoded UI strings (baseline → now) | 2856 → **373** (**86.9%** localized) |
| Chinese catalog | **2131 entries** |
| Files touched | 136 |
| Backend error mappings | 77 exact + 18 regex templates |

The remaining 373 strings are intentional: `material-symbols` icon names, model
identifiers (`GPT-5.4 Mini`, `text-embedding-*`), code-example placeholders
(`{variable}`) and other technical constants.

## Features

- **Language switch** — Settings → General → Language; persisted in `localStorage`
- **Auto-detect on first visit** — `zh*` browsers start in Chinese; manual choice wins
- **Complete main flow** — home → project → canvas → node config → settings
- **Teaching docs localized** — in-app LangChain tutorial and best-practice pages
- **Backend errors translated** — `Workflow not found` → 「工作流不存在」, variable
  messages handled by regex templates
- **Typed keys** — `i18next.d.ts` plus a full `en.json`, typos fail at compile time

## Screenshots

| Home | Canvas |
| --- | --- |
| ![home](docs/screenshots/home.png) | ![canvas](docs/screenshots/studio.png) |

## Quick start

```bash
npm install && npm rebuild esbuild
cd backend && python run_local.py        # http://127.0.0.1:8780
npm run dev                              # http://localhost:1425
```

Requires Node ^20.19 or ≥22.12, Python 3.11–3.13 and PostgreSQL 16 + pgvector
(`docker compose up -d postgres`). Step-by-step Chinese guide:
[`docs/INSTALL.zh-CN.md`](docs/INSTALL.zh-CN.md).

## Applying the patch to your own LangConfig

```bash
git checkout eb786cf
git apply --check i18n-workspace/deliverables/i18n-mvp.patch
git apply i18n-workspace/deliverables/i18n-mvp.patch
```

Full instructions and rollback: [`i18n-workspace/deliverables/APPLY.md`](i18n-workspace/deliverables/APPLY.md).

## Repository layout

```
src/i18n/            i18n bootstrap, catalogs, error map, type augmentation
src/…                LangConfig frontend (wired to t())
backend/             LangConfig backend (unchanged apart from run_local.py)
i18n-workspace/      toolchain, reports, deliverables (not part of the build)
```

## Verification

```bash
npm run typecheck && npm run build
node i18n-workspace/tools/verify-p0.mjs    # language chain, 10 checks
node i18n-workspace/tools/verify-p1.mjs    # main flow, 12 checks
node i18n-workspace/tools/check-coverage.mjs   # threshold 450
```

## License

MIT, inherited from upstream. Copyright belongs to Cade Russell (Ghost Peony).
