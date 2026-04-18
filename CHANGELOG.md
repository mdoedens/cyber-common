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
