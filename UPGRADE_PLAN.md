# Opticks Audio — Upgrade plan (Post Phase 2)

> Strategic plan written on 2026-05-23 with the user. Captures the
> commercial-positioning decisions taken after Phase 2B shipped.
>
> **The decision taken at the end of this session: ship the premium
> skeuomorphic plug-in UI first (opticks-dsp), THEN upgrade the
> marketing site (this repo) with screenshots of it.** This document
> is the canonical reference for that sequencing — read it before
> doing any commercial-positioning work on either repo.

---

## Context

Phase 1 + Phase 2A + Phase 2B are all shipped to production. The
foundation works:

- Marketing site live, looks editorial-tier
- Waitlist works end-to-end
- Signed R2 downloads work end-to-end (v0.1.0 of all three plug-ins
  shipping mac VST3 today)
- Admin dashboard with magic-link auth + audit log

The next question is **commercial positioning**: how to take Opticks
Audio from "elegant editorial site for a beta product" to
"professional plug-in company customers buy from with confidence."

---

## Competitive landscape (snapshot)

The user surveyed three reference sites and asked where Opticks
should sit:

| Brand | Positioning | Site characteristics |
|---|---|---|
| **Waves** | Mass-market, volume discount, sale-driven | Loud sale banners, $59.99 prominently displayed, hundreds of products in collage. **Cheap-feeling.** |
| **FabFilter** | Boutique professional, premium-priced, design-first | One product highlighted with 3D landscape, "explore now" CTA, tasteful product grid. **Premium-feeling.** |
| **Universal Audio** | Heritage-pro, hardware+software | UAD Guitar Month banner, large product photography, "Shop Now". **Professional, slightly corporate.** |

### Where Opticks should sit

**Between FabFilter and Goodhertz / Klanghelm.** Reasons:

1. The brand is already boutique (physics-of-light story, prism scene).
2. The DSP architecture is genuinely premium (8-channel modulated FDN,
   authentic tape head model, dual peak+RMS detection, 2× oversampling).
3. The intended UI is **maximum skeuomorphism in pure JUCE code** per
   `../opticks-dsp/NEXT_SESSION.md` — Goodhertz/Klanghelm/Black Rooster
   tier.
4. Target price point will be high (likely $99-$299), not impulse-buy.
5. Target customer is the serious producer/engineer, not the
   bedroom-DIY shopper.

**Translation**: never look like Waves. Always look like FabFilter.

---

## What this site already does BETTER than the references

These are the wins to preserve when refactoring:

1. **3D prism scene in the hero** — more sophisticated than Waves' or
   UA's product collages.
2. **Editorial typography** (Instrument Serif) — more refined than Waves.
3. **Dark mode by default** — more modern.
4. **Inline downloads form** — cleaner UX than the modal-everything
   approach.
5. **Modern stack** (Next.js 16, Tailwind v4, R3F, motion) — Waves
   still runs jQuery.

---

## What's missing for "commercial professionalism"

In priority order:

### 1. Product screenshots
The single biggest gap. FabFilter, UA, Waves all show their plug-in
UIs prominently. Opticks today only **names** the plug-ins; it doesn't
**show** them. Customers cannot evaluate what they're about to commit
to.

This is blocked on the premium UI work in `../opticks-dsp/` (Session
002). It does not make sense to publish placeholders.

### 2. Pricing communication
Today the hero says "Currently in beta" — ambiguous. Add one of:
- "Free during beta · $99 each / $249 Collection from Q3 2026"
- "Beta access $0 · Early adopter $49 · Full release TBA"
- Or simply: "Free during beta. Founding price locks at $79 forever."

Numbers create credibility.

### 3. Audio previews
A `🔊 Listen` button on each plug-in card with 10-15 seconds of
A/B-ed demo. None of the three reference sites has this on homepage,
but Goodhertz and Klanghelm do — and it's a competitive moat.

Blocked on having signature presets recorded.

### 4. Social proof
Once the closed beta runs:
- "Used by 47 producers, 12 mixing engineers, 3 mastering studios"
- 2-3 carefully-curated quotes from beta testers
- Studio logos (with permission)

### 5. Editorial urgency (NOT a sale banner)
Boutique sites don't say "$59.99 ENDS 5/25". They say things like:
- "Beta closes August 2026. 247 spots remaining."
- "Limited founding-member release — Q3 2026."

### 6. Compatibility matrix
A single visible line per plug-in:
- "Ableton 11+ · Logic Pro 10.7+ · Pro Tools 2022+ · Reaper 6+"
- "Native ARM / Intel · VST3 · AU · 64-bit"

Saves the customer a support ticket.

### 7. A "compare to" moment
Once the DSP tuning is final, a confident "REFLEXION vs Valhalla
VintageVerb" section. This requires confidence in the product, so it
ships **after** Session 002 tuning is locked.

### 8. Founder story page
A short, considered "About" page. Very boutique-coded.

### 9. Eventually: paid checkout
Stripe or Lemon Squeezy. License keys with `machine_id` and
`max_activations = 3`. Already scoped in `WAITLIST.md` "Future" section.

---

## The sequencing decision

The user's question was: do we polish the site now, or polish the
plug-ins first?

**Decision: plug-ins first.** Rationale:

- A site full of beautiful screenshots of an ugly plug-in still feels
  fake. A site with no screenshots but a beautiful plug-in feels like
  a teaser — and teasers convert.
- The Goodhertz/Klanghelm-tier UI in `../opticks-dsp/NEXT_SESSION.md`
  is *the* product differentiator. Without it the site has nothing
  worth photographing.
- Every commercial site upgrade we'd do now (Phase A below) gets
  redone in some form when the screenshots arrive. Sequencing first
  saves rework.

So:

1. **Now (in `../opticks-dsp/`)** — Session 002: premium skeuomorphic
   UI. Read `NEXT_SESSION.md` there for the full plan.
2. **Later (back in this repo)** — Phase A, B, C below.

---

## Phase A — Cosmetic + product visibility (when DSP UI is ready)

**Trigger**: Reflexion/Refraction/Inflexion v0.2.x ships with the
premium UI from Session 002.

1. **Hero secondary band** — strip of screenshots/short loops of the
   three plug-in UIs under the prism scene.
2. **Collection card thumbnails** — each card on the home grid gets a
   real screenshot of the plug-in UI (replaces the current minimal
   typographic card).
3. **`/plugins/[slug]` redesign** — split into:
   - Hero with prominent plug-in screenshot
   - "How it sounds" audio demo block
   - "How it works" technical paragraph (already in `lib/plugins.ts`)
   - System requirements + compatibility matrix
   - Download CTA (already implemented)
4. **Pricing line** in hero and plug-in pages.
5. **Editorial scarcity copy** ("Beta closes...", "Limited founding
   release...").

Estimated work: ~6-10 hours of design+code once screenshots exist.

---

## Phase B — Trust + social proof

**Trigger**: closed beta has run for 2-4 weeks, real testers exist.

1. **Testimonials carousel** (3 short quotes max — boutique-coded, not
   star-rating-coded).
2. **"Built with" / "Tested on" badges** (Ableton, Logic, Pro Tools,
   Reaper logos).
3. **Compatibility matrix** as a structured component on each plug-in
   page.
4. **Founder story page** at `/about` — one screen, restrained.

---

## Phase C — Conversion + retention

**Trigger**: paid release approaching (Q3 2026 working target).

1. **Compare pages**: `/compare/reflexion-vs-valhalla` etc. Only ship
   when confident the comparison flatters Opticks honestly.
2. **Blog** at `/journal` — philosophy, tutorials, behind-the-DSP
   posts. WordPress-free, Next.js MDX.
3. **Discord / community link** if traction warrants it.
4. **Paid checkout** via Stripe / Lemon Squeezy. License key API.

---

## What NOT to do

- ❌ Never copy Waves' "MEMORIAL DAY SALE $59.99!!" aesthetic. It
  cheapens the brand and contradicts the price point.
- ❌ Never auto-popup a discount modal. We already have an admin
  dashboard for honest broadcasts — use that.
- ❌ Never lead with subscription. The plug-in industry tried that
  (Waves SUS, UAD subscription, etc.) and the market hates it. Sell
  perpetual licenses with optional updates.
- ❌ Never use stock photos of musicians-in-headphones. Either show
  the actual UI or show nothing.
- ❌ Don't add a "search" bar to the marketing site. We sell three
  products. Search implies a catalog the customer has to navigate.
  Curate, don't index.
- ❌ Don't add reviews/star ratings until there's genuine volume.
  Five-review carousels look desperate.

---

## Quick reference: what's where

- **This repo** (`opticks-audio`): marketing site, waitlist,
  downloads, admin. Site UPGRADE_PLAN lives here.
- **DSP repo** (`../opticks-dsp`): JUCE C++ source for the plug-ins.
  See `NEXT_SESSION.md` there for the immediate next work (premium
  UI). `SESSION_LOG.md` for history.

When in doubt about brand voice or commercial positioning, this file
is the source of truth.
