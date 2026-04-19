# @cyber/common

Shared code for the **CyberATP** and **CyberEMS** projects.

- **Design tokens** — shared framework layer (spacing, typography, motion, a11y,
  semantic color roles, dark mode). Each app defines its own brand palette;
  `--color-brand` is the one hook that per-product colors flow through so
  shared components auto-theme.
- **React components** that both marketing sites + apps reuse (Button,
  ValueDisplay, language switcher, account chip, flag SVGs, multi-tenancy
  primitives).
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
| `@cyber/common/tokens/base.css` | Framework tokens (typography, spacing, radii, motion, semantic color roles, dark mode) |
| `@cyber/common/tokens/a11y.css` | Focus ring, reduced-motion, skip-link, sr-only, tap-target |
| `@cyber/common/ui` | React components (Button, ValueDisplay, LanguageSwitcher, AccountChip, FlagUS, FlagNL, multi-tenancy primitives) |
| `@cyber/common/i18n` | Types, shared dict keys, `detectLocaleFromHeader`, `LOCALE_COOKIE` |
| `@cyber/common/i18n/server` | `getLocale`, `getT` — **server components only** (uses `next/headers`) |
| `@cyber/common/auth` | OIDC constants, PKCE helpers, JWT decode, cookie scope helper |
| `@cyber/common/auth/server` | `getSession` — **server components only** (reads cookie) |

## Design tokens — the one thing that must stay consistent

CyberATP and CyberEMS share the **design framework** (spacing, type, radii,
motion, component specs, a11y). They deliberately **diverge on brand**
(own logo, favicon, brand ramp). Each app's `globals.css`:

```css
@import "tailwindcss";
@import "@cyber/common/tokens/base.css";
@import "@cyber/common/tokens/a11y.css";

@theme {
  /* Product-specific brand ramp — ATP blue, EMS teal. */
  --color-brand-50:  /* ... */;
  --color-brand-600: /* brand hex */;
  /* ... */
}

:root { --color-brand: var(--color-brand-600); }
[data-theme="dark"] { --color-brand: var(--color-brand-500); }
```

Shared components (`Button`, `ValueDisplay`, focus ring) read
`--color-brand` so each app renders in its own brand color from the same
component implementation. Never hard-code a specific brand shade in a
shared component.

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
