# Semantic versioning (Vibe Package)

Use **MAJOR.MINOR.PATCH** for store releases.

| Bump | When |
|------|------|
| **PATCH** | Smoke/fix, docs, pins clarification |
| **MINOR** | New compatible features |
| **MAJOR** | Breaking API or pin changes (e.g. FastAPI major) |

KCN-OS companion:
- Root `VERSION` file
- `python scripts/bump_version.py patch|minor|major`
- Tag `vX.Y.Z` → release workflow (smoke must pass)

Never release without smoke PASS under pinned deps.
