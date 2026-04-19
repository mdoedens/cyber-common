# @cyber/common

Shared code for the **CyberATP** and **CyberEMS** projects.

- **React components** that both marketing sites + apps reuse (language switcher, account chip, flag SVGs, brand primitives).
- **i18n engine** with cookie/accept-language detection and a typed dictionary pattern.
- **OIDC auth helpers** for Keycloak PKCE flows (login, register, callback, logout, session reading).
- **Python base service** factory for FastAPI microservices.

## Install (TypeScript / Next.js)

```json
{
  "dependencies": {
    "@cyber/common": "github:mdoedens/cyber-common#v0.1.0"
  }
}
```

This package ships **source TypeScript**, not compiled JS. Next.js consumers must
transpile it:

```js
// next.config.js
module.exports = {
  transpilePackages: ["@cyber/common"],
};
```

## Subpath exports

| Import | What it contains |
|---|---|
| `@cyber/common/ui` | React components (LanguageSwitcher, AccountChip, FlagUS, FlagNL, multi-tenancy primitives) |
| `@cyber/common/i18n` | Types, shared dict keys, `detectLocaleFromHeader`, `LOCALE_COOKIE` |
| `@cyber/common/i18n/server` | `getLocale`, `getT` — **server components only** (uses `next/headers`) |
| `@cyber/common/auth` | OIDC constants, PKCE helpers, JWT decode, cookie scope helper |
| `@cyber/common/auth/server` | `getSession` — **server components only** (reads cookie) |

Example:

```ts
"use client";
import { LanguageSwitcher } from "@cyber/common/ui";
```

```ts
// app/page.tsx — server component
import { getLocale, getT } from "@cyber/common/i18n/server";
import { getSession } from "@cyber/common/auth/server";
```

## Install (Python / FastAPI)

```toml
# services/requirements.txt
cyber-common @ git+ssh://git@github.com/mdoedens/cyber-common.git@v0.1.0#subdirectory=python
```

```python
from cyber_common.base_service import create_app
```

## Multi-tenancy UI primitives

Shared components that implement the Cyber* multi-tenancy contract (provider /
distributor / reseller / customer tiers, impersonation, plan gating). All client
components, all themeable via Tailwind classes + `--color-brand-*` CSS vars so
CyberATP (light) and CyberEMS (dark) render correctly from a single source.

| Component | What it does |
|---|---|
| `OrgSwitcher` | Dropdown of the user's accepted memberships, grouped by tier, with pending-invite badge and optional "Create organization" CTA. |
| `ContextSwitcher` | For users on multiple tiers — toggles the panel view context without switching org. Renders nothing if only one tier is available. |
| `ImpersonationBanner` | Top-of-page amber banner shown during an active impersonation session, with live countdown and "End impersonation" button. |
| `PermissionGate` | Conditional renderer gated on a permission flag list (`all` / `any` mode) with fallback. |
| `PlanUpgradeModal` | Modal shown when an action hits an HTTP 402 — names the feature, current plan, links to the billing flow. |
| `TierBadge` | Small color-coded pill for an `org_type` (provider=indigo, distributor=blue, reseller=teal, customer=slate). |

```ts
"use client";
import {
  OrgSwitcher,
  ContextSwitcher,
  ImpersonationBanner,
  PermissionGate,
  PlanUpgradeModal,
  TierBadge,
} from "@cyber/common/ui";
```

## Versioning

SemVer. Tag releases:

```bash
# in cyber-common
git tag v0.2.0 -m "Release 0.2.0"
git push --tags
```

Breaking changes bump **major**; new features bump **minor**; bug fixes bump **patch**.
Projects pin **exact** tags (no `^` / `~`) so upgrades are always deliberate PRs.

See `CHANGELOG.md` for release history.
