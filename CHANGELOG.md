# Changelog

All notable changes to `@cyber/common`. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-04-18

Initial release. Extracted from `cyberatp-platform` after the app-subdomain split
landed. Intent: one versioned home for code that both CyberATP and CyberEMS
need.

### Added

- `@cyber/common/ui` — `LanguageSwitcher` dropdown, `AccountChip`, `FlagUS`, `FlagNL`.
- `@cyber/common/i18n` — `Locale` type, `LOCALE_COOKIE`, `detectLocaleFromHeader`.
- `@cyber/common/i18n/server` — `getLocale`, `getT<Dict>` helper.
- `@cyber/common/auth` — `AUTH` config, `authUrl`/`tokenUrl`/`endSessionUrl`/`registerUrl`,
  `callbackUrlFor(host)`, `cookieDomainFor(host)`, `pkceChallenge`, `randomUrlToken`,
  `decodeJwt`, `Session` type, `COOKIE` names.
- `@cyber/common/auth/server` — `getSession`.
- `python/cyber_common` — `create_app` FastAPI factory with `/health` + `/healthz` + root.

## [0.1.1] — 2026-04-19
Fixed: loosened lucide-react peer dep from ^0.400.0 to >=0.400.0 so projects on
newer versions (e.g. EMS web on 0.460.0) can install without --legacy-peer-deps.


## [0.1.2] — 2026-04-19
Changed:
- `AccountChip` now accepts `anonClassName` and `signedClassName` so each
  project can theme the login button. Default is a visible outline button on
  light backgrounds (was an invisible text-only link before, broke on dark EMS nav).

## [0.2.0] — 2026-04-19

Multi-tenancy UI primitives shared by CyberATP and CyberEMS. Implements the
provider/distributor/reseller/customer tier contract from
`cyber-infrastructure/AGENTS.md`.

### Added

- `@cyber/common/ui` — `OrgSwitcher`: dropdown of accepted memberships grouped
  by `org_type`, with pending-invite count, loading state while switching,
  empty state, optional "Create organization" CTA, full keyboard navigation
  (arrow keys / Home / End / Enter / Escape), click-outside dismiss.
- `@cyber/common/ui` — `ContextSwitcher`: lets a user on multiple tiers toggle
  panel context without changing active org. Renders nothing when only one
  tier is available.
- `@cyber/common/ui` — `ImpersonationBanner`: amber top-of-page banner with
  live countdown to `endsAt` and an "End impersonation" action. `role="banner"`,
  `aria-live="polite"`.
- `@cyber/common/ui` — `PermissionGate`: conditional renderer with `all` / `any`
  mode and fallback; plus a `hasPermission(...)` pure helper.
- `@cyber/common/ui` — `PlanUpgradeModal`: HTTP-402-style upgrade prompt with
  feature name, current plan, and CTA to the billing flow. Focus-traps the
  primary CTA, locks body scroll, closes on Escape / backdrop click.
- `@cyber/common/ui` — `TierBadge`: color-coded pill for an `org_type`
  (provider=indigo, distributor=blue, reseller=teal, customer=slate) used
  internally by `OrgSwitcher` / `ContextSwitcher` and exported for standalone
  use.
- All new components are styled with Tailwind utility classes plus
  `--color-brand-*` CSS vars so CyberATP (light) and CyberEMS (dark) can theme
  them from a single implementation.

