@AGENTS.md

# Opticks Audio — Web (Next.js)

> Marketing site for **Opticks Audio**. The DSP / plug-in monorepo lives at
> `../opticks-dsp/`. **Read `../opticks-dsp/CLAUDE.md` for the bigger
> picture of the company** before touching this repo.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- React Three Fiber + drei (3D prism scene in Hero)
- motion + GSAP for animations

## What this site sells

The **Opticks Collection** — three flagship plug-ins:

- **REFLEXION** — algorithmic reverb (light reflecting between surfaces)
- **REFRACTION** — tape-style spatial delay (light bending through a prism)
- **INFLEXION** — dynamics processor (curvature of motion)

Plug-in metadata is the single source of truth in `src/lib/plugins.ts` —
the home page collection grid and the dynamic `/plugins/[slug]` page both
read from it.

## Running locally

```bash
cd /Users/ricardocordero/Downloads/opticks-audio
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Conventions

- All brand references use **"Opticks Audio"** (never `nexgen` — that name
  is fully deprecated). The migration from `nexgen-web` to `opticks-audio`
  was completed in Session 001 of the DSP project (see
  `../opticks-dsp/SESSION_LOG.md`).
- The 3D prism scene in `src/components/hero/PrismScene.tsx` is the
  centrepiece of the brand identity. Keep it performant; do not add heavy
  shaders.
- The plug-in detail page (`src/app/plugins/[slug]/page.tsx`) is rendered
  statically via `generateStaticParams()`. Don't break that.
