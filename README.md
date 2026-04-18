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
| `@cyber/common/ui` | React components (LanguageSwitcher, AccountChip, FlagUS, FlagNL) |
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
