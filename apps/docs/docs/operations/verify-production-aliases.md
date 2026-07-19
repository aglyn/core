---
sidebar_position: 1
title: Verify production aliases
description: Post-release runbook — confirm app.aglyn.io and the *.aglyn.app wildcard point at the newest Ready deployment, and repair a stale alias with one command.
---

# Verify production aliases (AGL-542)

:::warning Aglyn staff only
Internal deployment runbook. Requires a `vercel` CLI login with access to the
Aglyn team scope; the script never reads or stores secrets itself.
:::

After a production promote on Vercel, the tenant wildcard domain (`*.aglyn.app`)
has repeatedly stayed aliased to a **stale** deployment instead of advancing to
the newly built one — customer sites keep serving the previous release while
`app.aglyn.io` looks fine. `tools/deploy/verify-production-aliases.mjs` makes
the check (and the repair) a single command.

**Run it after every production promote.**

```bash
node tools/deploy/verify-production-aliases.mjs          # verify only
node tools/deploy/verify-production-aliases.mjs --fix    # promote when stale
node tools/deploy/verify-production-aliases.mjs --json   # machine-readable output
```

## What it checks

| Project | Domain(s) checked | Linked directory |
| --- | --- | --- |
| `app-aglyn-io` (console) | `app.aglyn.io` | repo root (or `apps/console`) |
| `tenant-aglyn-app` (tenant) | `northwind-coffee.aglyn.app` (wildcard probe), `aglyn.app` | `apps/tenant` **only** |

For each project it finds the newest **Ready** production deployment
(`vercel ls --prod`, confirmed via `vercel inspect`), inspects each domain to
see which deployment actually serves it, and prints a verdict table:
`current` or `STALE`. With `--fix` it runs `vercel promote <newest-ready-url>`
from the correctly linked directory and re-verifies.

Exit codes: `0` all current, `1` at least one stale (after the fix attempt when
`--fix`), `2` operational error (CLI missing/unauthenticated, broken link,
unparseable output).

## The `repo.json` gotcha (why staleness happens)

The repo-root `.vercel/repo.json` maps **every** directory in the monorepo to
the console project `app-aglyn-io`. The only directory correctly linked to
`tenant-aglyn-app` is `apps/tenant`, via its own `.vercel/project.json`.

That means a tenant-scoped `vercel promote` / `vercel inspect` / `vercel ls`
run from the repo root (or anywhere else) silently operates on the **console**
project — the promote "succeeds", but `*.aglyn.app` never moves. The script
defends against this three ways:

1. It resolves the cwd per project from each directory's *own* link files
   (no walk-up to the root `repo.json`).
2. It refuses to proceed if the deployments listed from a directory belong to
   a different project (deployment hostnames must start with the project name,
   and `vercel inspect` must report the expected project).
3. Tenant promotes always execute with cwd `apps/tenant`.

If the tenant link is missing, re-create it:

```bash
cd apps/tenant && vercel link --yes \
  --scope team_Mu9NFauDO31nvj89PgmQJEtN --project tenant-aglyn-app
```

## Reading the output

```text
PROJECT           DOMAIN                      NEWEST READY            SERVING                 VERDICT
----------------  --------------------------  ----------------------  ----------------------  -------
app-aglyn-io      app.aglyn.io                app-aglyn-io-xxxx…      app-aglyn-io-xxxx…      current
tenant-aglyn-app  northwind-coffee.aglyn.app  tenant-aglyn-app-new…   tenant-aglyn-app-old…   STALE
tenant-aglyn-app  aglyn.app                   tenant-aglyn-app-new…   tenant-aglyn-app-old…   STALE
```

A `STALE` row means the domain still serves an older deployment: re-run with
`--fix`, or promote manually **from `apps/tenant`**. `--json` prints the same
result as structured JSON on stdout (progress goes to stderr), so it can gate
CI or release automation.

Related repo docs: `docs/VERCEL_DEPLOYMENTS.md` (which branches deploy, and
why only `production` builds).
