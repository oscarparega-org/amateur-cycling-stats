# Phase 5.2: i18n Setup — Design Spec

## Overview

Copy the `sveltekit-i18n` infrastructure from the old Supabase frontend. Includes library config, locale detection, server-side translation helpers, category translation helpers, all 22 locale JSON files (11 per language), and minimal `hooks.server.ts` for locale detection.

## Approach

Direct copy from old project. The i18n code has no Supabase dependencies — it's entirely self-contained.

## Package Installation

- `sveltekit-i18n` ^2.4 in the frontend workspace

## New Files (copied from old project)

### `apps/frontend/src/lib/i18n/index.ts`

sveltekit-i18n config with 22 async loaders (11 modules x 2 locales). Exports `t`, `locale`, `locales`, `loading`, `loadTranslations`. Fallback locale: `es`.

### `apps/frontend/src/lib/i18n/locale.ts`

Constants and utilities:
- `SUPPORTED_LOCALES`: `['es', 'en']`
- `DEFAULT_LOCALE`: `'es'`
- `LOCALE_COOKIE_NAME`: `'locale'`
- `parseAcceptLanguage(header)` — parses Accept-Language with quality values
- `isSupportedLocale(locale)` — type guard

### `apps/frontend/src/lib/i18n/server.ts`

Server-side translation. Statically imports all locale JSON files (not async). Exports:
- `t(locale, key, fallback?)` — navigates nested objects with dot notation
- `getAuthErrorMessage(locale, errorCode)` — maps error codes to translated messages

Note: `server.ts` imports 9 modules per locale (missing `account` and `orgCategories` compared to `index.ts`'s 11). This matches the old project — those modules are only used client-side.

### `apps/frontend/src/lib/i18n/category-translations.ts`

Client-side helpers using the `$t` store:
- `translateCategory(categoryName)` — e.g., 'ABS' → 'Absoluta'
- `translateGender(genderName)` — e.g., 'MALE' → 'Masculino'
- `translateLength(lengthName)` — e.g., 'LONG' → 'Larga'

### `apps/frontend/src/lib/utils/cookies.ts`

Cookie helper (also from old project):
- `setLocaleCookie(cookies, cookieName, locale)` — sets locale cookie with 1-year expiry, lax same-site, non-httpOnly

### `apps/frontend/src/lib/i18n/locales/es/*.json` (11 files)

Spanish translations: common, auth, events, races, cyclists, portal, account, panel, admin, admin-categories, org-categories.

### `apps/frontend/src/lib/i18n/locales/en/*.json` (11 files)

English translations: same 11 modules.

## Modified Files

### `apps/frontend/src/hooks.server.ts` (create new)

Minimal hook with locale detection only (no auth — deferred to 5.7):
1. Read locale from cookie
2. If no cookie: parse Accept-Language header, set cookie
3. Validate against supported locales, fallback to `es`
4. Store in `event.locals.locale`

No Supabase client, no session management, no request logging.

### `apps/frontend/src/routes/+layout.server.ts` (create new)

Root layout server load:
1. Get locale from `locals.locale`
2. Call `loadTranslations(locale, url.pathname)`
3. Return `{ locale }` (no `user` yet — deferred to 5.7)

### `apps/frontend/src/app.d.ts`

Add `locale: string` to `App.Locals` interface.

## Not in Scope

- Auth integration in hooks (Phase 5.7)
- User data in layout load (Phase 5.7)
- Request logging (Phase 5.7)
- Locale switcher UI component
