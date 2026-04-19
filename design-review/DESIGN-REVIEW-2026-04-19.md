# Cyber Design Review — 2026-04-19

Multi-lens review van de gedeelde design-taal tussen **CyberATP** en **CyberEMS**.
Scope: `CyberEMS/branding/DESIGN-SYSTEM.md`, `CyberATP/frontend/src/app/globals.css`,
`CyberATP/frontend/src/components/ui/*`, `cyber-common/src/ui/*`.

Zeven lenzen: design-system audit, accessibility, design critique, UX copy,
design handoff, user research plan, en consolidatie.

---

## 0. Context en grote lijn

CyberEMS heeft een uitgebreid gedocumenteerd design system (1137 regels,
versie 1.0, 2026-04-12). CyberATP heeft een klein `@theme` tokens-bestand en
een handvol UI-componenten. Gedeelde componenten (OrgSwitcher,
ImpersonationBanner, etc.) leven in `cyber-common/src/ui/`.

**Kernbevinding:** "shared design" is een ambitie, geen realiteit. De
documentatie en code zijn op drie manieren gedivergeerd:

1. **Merkkleuren verschillen bewust** — ATP = blauw (`#3B82F6` brand-500),
   EMS = teal (`#0891B2` primary). Prima, elk merk zijn eigen accent.
2. **Token-namen verschillen** zonder reden — ATP `--color-brand-*`,
   EMS `--color-primary-*`. Zelfde rol, andere naam. Dit breekt de
   `cyber-common` laag: een `<Button variant="primary" />` kan niet tegen
   beide palettes tegelijk.
3. **Componentspecs wijken af van documentatie** — ATP's `<Button />`
   gebruikt `rounded-xl` (12px) en `py-2.5` (10px verticaal, 24px
   horizontaal). DESIGN-SYSTEM.md voorschrift is `rounded-md` (8px) en
   `10px / 20px`. De `outline`-variant in ATP bestaat niet in de spec;
   de spec heeft `secondary` (transparant + 1px border).

De spec is dus correct beschreven maar niet correct geïmplementeerd, en
de twee apps zijn niet op dezelfde token-laag gebouwd. Dat moet eerst
recht, anders is alles hierna symptoombestrijding.

---

## 1. Design-System Audit

### 1.1 Wat goed is

- DESIGN-SYSTEM.md is grondig: kleuren, typografie, spacing, componenten,
  motion, dark mode, a11y, i18n, CSS-variabelen appendix.
- Semantische laag (`--bg-primary`, `--text-primary`) scheidt ruwe
  kleuren van rolgebaseerde tokens — goed patroon voor dark mode.
- Energie-specifieke kleuren (solar, battery, grid) zijn geisoleerd en
  expliciet gereserveerd voor data-viz. Dat voorkomt lekken naar UI.
- Typografie dual-stack (Inter voor tekst, JetBrains Mono voor
  energiewaardes) past bij data-density-doel.

### 1.2 Kritieke issues

| # | Issue | Bewijs | Impact | Fix |
|---|---|---|---|---|
| 1 | **Token-namen inconsistent tussen apps** | ATP `--color-brand-600`, EMS `--color-primary` | `cyber-common` kan geen gedeelde `Button` leveren | Eén canonieke token-laag in `cyber-common`: `--color-brand-*` als alias voor per-product primary |
| 2 | **Component code wijkt af van spec** | `button.tsx` rounded-xl vs spec 8px; outline vs secondary | Nieuwe devs bouwen drift verder uit | Of: pas de spec aan wat de code doet. Of: breng de code terug naar de spec. Kies en commit |
| 3 | **ATP heeft geen dark-mode implementatie** | `globals.css` heeft alleen light body-regel | Inconsistent met EMS dark-mode belofte | Poort de `[data-theme="dark"]` mapping uit EMS spec naar een shared tokens.css in cyber-common |
| 4 | **Geen shared `cyber-common/src/tokens/`** | Alleen UI-components, geen tokens in shared package | Merkkleuren vrij divergeren tussen apps | Voeg `tokens.css` + `tokens.ts` toe met rol-tokens (brand, bg, text, state) |
| 5 | **Energy-palette alleen in EMS** | Geen trading-specifieke palette in ATP | Charts worden ad-hoc gekleurd | Spiegel energy-palette voor ATP: `--color-trading-profit`, `--loss`, `--neutral`, `--buy`, `--sell` |
| 6 | **Geen visuele regressie tests** | Geen Chromatic/Percy/Playwright-screenshots | Drift blijft ongezien tot productie | Zet 1 simpele Playwright visual test op kritieke componenten |
| 7 | **Figma/design-bron ontbreekt** | Alleen markdown-spec | Designers kunnen niet meewerken | Bouw minimale Figma library die de tokens mirrort, of erken expliciet "code is source of truth" |

### 1.3 Token-gap matrix

| Rol | EMS token | ATP token | Aanbevolen gedeeld |
|---|---|---|---|
| Brand hoofdkleur | `--color-primary` | `--color-brand-600` | `--color-brand` (product-specifiek in product CSS) |
| Achtergrond primair | `--bg-primary` | hardcoded `#fff` in body | `--bg-primary` (shared rol) |
| Tekst primair | `--text-primary` | hardcoded `#0f172a` | `--text-primary` (shared rol) |
| Success / profit | `--color-success` | `--color-profit` | `--color-positive` (neutrale naam) |
| Error / loss | `--color-error` | `--color-loss` | `--color-negative` |
| Mono font | `--font-mono` | niet gedefinieerd | `--font-mono` (beide apps gebruiken het) |

Aanbeveling: hernoem domein-specifieke namen (`profit`/`loss`, `solar`/`battery`)
tot rol-neutrale namen op de shared laag, houd domein-specifieke aliassen in
de product-CSS.

---

## 2. Accessibility Review (WCAG 2.1 AA)

Getoetst tegen de documentatie (DESIGN-SYSTEM.md sectie 9) en steekproef
van de ATP button-implementatie.

### 2.1 Contrastcheck (geverifieerd in spec)

De spec claimt 6 contrastparen die AA halen. Dat klopt voor de vermelde
paren. **Wat niet geverifieerd is:**

| Combinatie | Verwacht | Status |
|---|---|---|
| `--color-warning` (#F59E0B) op wit | ~2.0:1 | **Faalt AA voor tekst.** Spec gebruikt het wel voor "zero export" tekst — checken |
| `--color-accent` (#F59E0B) op wit als button-text | ~2.0:1 | **Faalt AA.** Accent-knoppen mogen alleen op donkere bg of `accent-dark` als text |
| Badge tekst `--color-primary-dark` op `--color-primary-50` | ~8:1 | OK |
| Energy-solar geel (#FBBF24) als tekst | faalt | Bedoeld voor lijnen/icons, niet tekst — maak expliciet |
| Dark mode disabled text `#334155` op bg `#0F172A` | ~2.0:1 | **Faalt.** Bewuste "disabled" keuze, maar spec zegt niet dat dit bewust is |

**Actie:** voeg een contrast-validatietabel toe die elk token-paar checkt
dat daadwerkelijk in code voorkomt. Ik zou het `contrast-audit.md` noemen
en met `npm run check:contrast` via `@adobe/leonardo-contrast-colors`
geautomatiseerd draaien.

### 2.2 Focus-ring

Spec is goed (`2px solid var(--color-primary-light)` met 2px offset).
**ATP Button implementeert dit niet** — `transition` class staat er, geen
`focus-visible:ring-*`. Default browser-outline wordt door veel
Tailwind-presets verwijderd.

### 2.3 Keyboard-navigatie

Spec adresseert elk interactief component. Niet geverifieerd:
- OrgSwitcher (shared component) — sluit Escape, Arrow keys werken?
- ImpersonationBanner — is de "stop impersonation" knop keyboard-bereikbaar?
- PlanUpgradeModal — focus trap?

**Actie:** schrijf één Playwright-test die elk shared component keyboard-alleen bestuurt.

### 2.4 Screen reader

Spec belooft `aria-label` op energiewaardes ("Solar production: 3.7
kilowatts"). Niet geimplementeerd — er is nog geen energy-widget code.
Leg de regel vast in een lint-rule (ESLint plugin jsx-a11y + custom rule)
zodat je dit niet vergeet zodra de widgets gebouwd worden.

### 2.5 Color-blind safety

Spec is expliciet: kleur + icoon + label. Niet automatisch afdwingbaar.
**Actie:** review-checklist item bij elke PR die een chart/state-indicator
toevoegt.

### 2.6 Touch targets

44×44 min volgens spec. **ATP Button size sm = 32px hoog.** Spec zegt ook
32px, maar dan met tap-area padding. Code heeft geen tap-area uitbreiding.
Fix: voeg `before:absolute before:inset-[-6px]` pseudo-element toe
voor kleine knoppen, of maak `sm` de minimale size = 40px.

---

## 3. Design Critique

Hypothetisch — er is geen dashboard-screenshot. Kritiek op basis van
spec + product-doel.

### 3.1 Sterktes

- **Data-density via monospace voor cijfers** is een sterke keuze voor
  beide producten. Energy-waardes en trade-P&L verdienen beide tabular
  alignment.
- **Stat-card layout met overline + hero + trend** is bewezen patroon
  (Stripe, Linear, Tibber). Goed.
- **Power flow diagram als centraal dashboard-element** voor EMS is
  onderscheidend. Geeft merk-identiteit die concurrenten missen.

### 3.2 Risico's / zwaktes

| Observatie | Risico | Mitigatie |
|---|---|---|
| **Visuele hiërarchie is uniform** — bijna elke card is 12px radius + subtle shadow | Niets springt eruit; gebruiker kan prioriteit niet zien | Introduceer 2 card-tiers: "primary" (huidige) en "hero" (met sterkere shadow + 2px accent border links) voor de 1-2 belangrijkste cards |
| **Amber wordt voor 3 rollen gebruikt** (accent, warning, price-spike) | Semantische verwarring: is amber "let op" of "cool savings"? | Kies: amber = savings. Warning = orange (#F97316 van `energy-consumption`). Scheid rollen |
| **Geen loading/error state-voorbeelden** voor energy-specifieke widgets | Inconsistente implementatie straks | Voeg sectie 4.10 "Widget states" toe: loading-skeleton, stale-data, no-data, permission-denied |
| **Geen empty-state richtlijnen** | Eerste-gebruik ervaring voelt kaal | 1 illustratiestijl + copy-pattern per tier (geen devices, geen data, geen permission) |
| **Mobile power-flow is "vertical stack"** | Geen illustratie hoe de animated flow dan werkt | Prototype in Figma of code voor je het als "done" markeert |
| **ATP copy-trading heeft geen trading-specifieke UI in spec** | ATP-team bouwt het ad-hoc zonder guidance | Maak `CyberATP/branding/DESIGN-SYSTEM-ATP.md` dat de EMS-spec extendt met trading widgets (order-ticket, bot-card, signal-badge) |

### 3.3 Consistency met benchmarks

Spec noemt Tibber, Sonos, Apple als inspiratie. Check:

- **Tibber** — gebruikt heel subtiele kleurverschillen voor prijs-tier (licht
  groen tot licht rood). EMS-spec overlapt. Goed.
- **Sonos** — grote hero-numbers, veel whitespace. EMS-spec grid (20px
  card padding) is iets krapper dan Sonos. OK voor web, zou op mobile
  adem kunnen missen.
- **Apple** — San Francisco font, alignment-grid, haarscherpe details.
  Inter is prima alternatief. Alignment-grid (4px base) is correct.

---

## 4. UX Copy Review

Geen live copy om te reviewen, dus dit zijn richtlijnen + checklist die
nu opgeschreven moeten worden voor elke eerste feature.

### 4.1 Merk-stem per product

| | CyberEMS | CyberATP |
|---|---|---|
| Persoonlijkheid | Kalm, betrouwbaar, ingenieur-precies | Nuchter, feitelijk, **niet-adviserend** |
| Stemniveau | "Uw zonnepanelen leveren nu 3,7 kW op." | "Uw bot heeft 2 trades uitgevoerd vandaag." |
| Vermijden | Hype, superlatieven | Elke vorm van advies ("koop nu", "dit is een goed moment") |
| Emoji | Nee | Nee |
| Jargon | kWh, SoC, export — leg uit in tooltip eerste keer | STOCK Act, PDT, margin — leg uit in tooltip eerste keer |

### 4.2 Copy-patterns die nu nodig zijn

**Empty states:**
```
[EMS] Geen apparaten gekoppeld
      Koppel een Homey, SolarEdge, of HomeWizard om je energiestromen
      te zien.
      [Apparaat koppelen]  [Meer weten]

[ATP] Nog geen bots actief
      Start een bot om automatisch trades te volgen. Je blijft
      eigenaar van je beleggingsrekening.
      [Bot aanmaken]  [Hoe werkt dit?]
```

**Error states — let op toon:**
```
Nee:  "Fout 500: iets ging mis"
Ja:   "We konden uw gegevens nu niet laden. Probeer het opnieuw, of
       wacht een paar minuten als dit blijft gebeuren."
       [Opnieuw proberen]
```

**Plan-gate vs permission-gate (cruciaal — zie CLAUDE.md):**
```
Plan (402):       "Deze functie zit in het Pro-pakket.
                   Upgrade om hem te gebruiken."
                   [Plan bekijken]

Permission (403): "Je hebt geen toegang tot deze actie. Vraag een
                   admin van je organisatie."
                   [Terug]
```
Deze twee zijn vaak verwisseld in SaaS — forceer de copy via shared
componenten (`<PlanGateMessage />`, `<PermissionDeniedMessage />`).

**Impersonation banner (shared):**
```
"Je wordt bekeken door platform-support (naam). Acties worden
vastgelegd."
[Impersonatie stoppen]
```

### 4.3 Microcopy-checklist per feature

Voeg deze 10 vragen toe aan elke PR die UI toevoegt:

1. Is er een empty state?
2. Is er een loading state?
3. Is er een error state met concrete actie?
4. Is primary CTA een werkwoord (niet "OK")?
5. Is destructieve knop expliciet ("Verwijder apparaat", niet "Verwijder")?
6. Heeft elke waarde een eenheid ("3,7 **kW**", "€ **0,32** /kWh")?
7. Is timestamp relatief ("2 minuten geleden") met absolute tooltip?
8. Is de tekst vertaald via `next-intl`, niet hardcoded?
9. Is "je" of "u" consistent? **Kies één. EMS → "je". ATP → "u"** (verschillend publiek).
10. Test: werkt de langste Duitse vertaling (+30%)?

### 4.4 Verboden zinnen (CyberATP — wettelijk)

Uit CyberATP/CLAUDE.md sectie 1: "software vendor, niet adviseur".
Concrete copy-verboden:

- "Wij raden aan…"
- "Dit is een goed moment om…"
- "Onze beste picks"
- "Gegarandeerd rendement"
- "Zonder risico"

Aanvaardbaar:
- "Volgt Congressional Trades gefilterd op…"
- "Historisch rendement: … (geen garantie voor toekomst)"
- "U activeert, u bent verantwoordelijk voor de trade."

Bouw een **lint-rule** die deze strings in UI-copy blokkeert (ESLint +
custom rule die i18n-keys scant).

---

## 5. Design Handoff — Meest kritieke ontbrekend component

Ik kies er één om uit te werken: **`<ValueDisplay />`** — de bouwsteen
die in beide apps het vaakst voorkomt (energie-waarde, P&L, prijs,
percentage). Nu ontbreekt hij; elke plek bouwt het opnieuw.

### 5.1 Spec

```
<ValueDisplay
  value={3.7}
  unit="kW"
  size="hero" | "large" | "medium" | "default" | "small"
  tone="neutral" | "positive" | "negative" | "warning"
  trend={{ delta: 0.4, period: "vs gisteren" }}  // optional
  precision={1}
  locale="nl-NL"
  ariaLabelPrefix="Zonne-energie productie"
/>
```

### 5.2 Rendering

```
┌─────────────────────────────┐
│ 3,7 kW                      │   <- value + unit, monospace
│ ▲ +0,4 vs gisteren         │   <- trend (positive = success green)
└─────────────────────────────┘
```

### 5.3 Layout-regels

- Value: `font-mono`, weight per size-token (zie DESIGN-SYSTEM.md sectie 2).
- Unit: 80% van value-font, weight 400, `margin-left: 4px`, color `--text-secondary`.
- Trend row: `text-small` (13px), icon 16px + delta met 1 decimaal + periode.
- `tabular-nums` altijd aan voor value.
- Bij `tone === "negative"` → value-kleur is `--color-negative` (rol-token, map naar product).

### 5.4 States

| State | Visual |
|---|---|
| Default | Value + optional trend |
| Loading | Value-skeleton box matchend size; unit zichtbaar |
| No data | "—" (em-dash) ipv "0"; geen trend |
| Stale (>5 min) | Amber dot voor value, tooltip "Laatst bijgewerkt 12 min geleden" |

### 5.5 A11y

- Root is `<div role="status" aria-live="polite">`.
- `aria-label`: `${ariaLabelPrefix}: ${value} ${unit}, trend ${trendCopy}`.
- Icons `aria-hidden="true"`.
- Trend-copy gelokaliseerd.

### 5.6 Responsive

Geen grote veranderingen per breakpoint — de containing card bepaalt
layout. `size="hero"` krimpt op mobile van 48px naar 40px via CSS clamp.

### 5.7 Tokens gebruikt

`--font-mono`, `--text-value-hero|large|medium|default|small`,
`--color-positive`, `--color-negative`, `--color-warning`,
`--text-secondary`, `--space-1` (gap value↔unit), `--space-2`
(gap value↔trend).

### 5.8 Files die moeten veranderen

- Maak `cyber-common/src/ui/value-display.tsx`.
- Exporteer uit `cyber-common/src/ui/index.ts`.
- Bump `cyber-common/package.json` minor.
- Refactor 1 bestaand gebruik per app om te verifiëren (EMS: dashboard
  PowerNow; ATP: bot P&L).

---

## 6. User Research Plan

Geen research-data beschikbaar. Dus niet "synthesize", maar **plan what to learn**.

### 6.1 Onderzoeksvragen

**CyberEMS (NL markt, pre-launch 2027):**

1. Begrijpt een huis-eigenaar met zonnepanelen binnen 10 seconden wat
   het dashboard hem/haar gaat opleveren?
2. Welke 3 nummers op het dashboard zijn het belangrijkst voor de
   gebruiker — en komen die overeen met wat wij prominent tonen?
3. Begrijpt de gebruiker het verschil tussen "zelf-consumptie" en
   "export-vermijden"?
4. Vertrouwt de gebruiker automatisch opladen van de batterij bij lage
   prijzen? Of wil hij/zij handmatig bevestigen?
5. Is het zorg-niveau over salderingsregeling-einde (2027) hoog genoeg
   om actief te switchen naar een EMS?

**CyberATP (EU retail investors):**

1. Begrijpt een niet-trader binnen 30 seconden wat copy-trading van
   Congressional trades inhoudt?
2. Hoe wordt het verschil "u bent zelf eigenaar" vs "wij beleggen voor
   u" ontvangen? Verwarrend of geruststellend?
3. Is de software-vendor-positie (niet-adviseur) een vertrouwenswinst
   of juist een rode vlag ("geen garantie"?)?
4. Welke trade-frequentie verwachten gebruikers? (Beinvloedt free-tier
   profit-share model.)
5. Hoe reageren gebruikers op de 3-tier prijs (Free / 29 / 99)? Is er
   een duidelijk moment waarop men upgradet?

### 6.2 Onderzoeksmethodes per vraag-type

| Vraag-type | Methode | Sample |
|---|---|---|
| Begrijpelijkheid / eerste indruk | 5-second test + hardop-denken | 8–10 personen |
| Vertrouwen / zorg-niveau | Semi-gestructureerd interview (30 min) | 6 personen per persona |
| Prioriteit van data | Card-sort van dashboard-elementen | 10 personen online |
| Prijsperceptie | Van Westendorp Price Sensitivity Meter | 100+ via ad-traffic |
| Compliance-taal (ATP) | Task-based usability met hardop-denken | 6 personen, waarvan 2 met brokerage-ervaring |

### 6.3 Synthese-template (voor als data binnen is)

Gebruik het volgende formaat zodra er data is (spaar voor de
`research-synthesis` skill):

```
| Thema | Frequentie | Impact (1-5) | Quote | Aanbeveling |
|---|---|---|---|---|
| "Ik weet niet of mijn batterij vol is" | 7/8 | 5 | "... ik zie wel een getal maar niet of dat 80% of 100% is" | Voeg "(volledig over ~2u)" toe onder elk batterijgetal |
```

Rank op `frequentie × impact`, target top 3 als eerstvolgende
design-iteratie.

### 6.4 Onderzoek-cadans

- **Voor elke major release (kwartaal):** 6 interviews + 8 5-second tests.
- **Doorlopend:** support-tickets + NPS-comments wekelijks labellen in
  de enterprise-search digest (plug-in al beschikbaar in Claude Code).

---

## 7. Consolidatie — wat nu?

### 7.1 Top 5 acties, geprioriteerd

1. **Maak `cyber-common/src/tokens/tokens.css`** die zowel ATP als
   EMS importeren. Rol-gebaseerd (brand, bg, text, positive, negative).
   ~2 uur werk, unblockt alles hieronder.
2. **Breng ATP's `<Button />` terug naar de DESIGN-SYSTEM.md-spec**
   (of pas de spec aan en documenteer waarom). ~30 min.
3. **Voeg ATP dark-mode-tokens toe** — kopie van EMS mapping, pas
   merkkleur aan. ~1 uur.
4. **Schrijf `<ValueDisplay />` in cyber-common** (sectie 5). Refactor
   1 gebruik per app. ~4 uur.
5. **Voeg copy-checklist toe aan PR-template** (sectie 4.3) en lint-rule
   voor ATP-verboden zinnen (sectie 4.4). ~2 uur.

### 7.2 Week-2 acties

6. Contrast-audit scriptje (sectie 2.1).
7. Keyboard-nav Playwright-test voor 3 shared componenten (sectie 2.3).
8. Empty-state + error-state catalogus toevoegen aan DESIGN-SYSTEM.md
   (sectie 4.2).
9. CyberATP-specifieke design doc schrijven (sectie 3.2 laatste rij).

### 7.3 Wat niet nu

- Figma library opzetten — alleen als er een designer/co-founder bijkomt.
  Voor een solo-founder is code-als-bron-van-waarheid prima.
- Visual regression testing — waardevol, maar pas als er >3 contributors zijn.
- User research uitvoeren — plan staat klaar (sectie 6), maar voor EMS
  pas zinvol dichter bij launch (Q3 2026), voor ATP nu al nuttig.

### 7.4 Wat ontbreekt in dit review (eerlijk)

- **Geen screenshots of live app**. Een echte design-critique vraagt
  dat. Alles in sectie 3 is hypothetisch op basis van spec.
- **Geen user research data**. Sectie 6 is een plan, geen synthese.
- **Geen performance-review** (bundle-size, Tailwind-waste, font-loading).
  Dat is een aparte audit.
- **ATP's /platform panel niet gereviewed** — alleen de tokens en de
  Button component. Gereed-marker voor volgende review-ronde.

---

*Review uitgevoerd: 2026-04-19. Lenzen toegepast: design-system,
accessibility, design-critique, ux-copy, design-handoff, user-research,
consolidatie (7/7).*
