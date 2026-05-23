# Opticks Audio — Web

Marketing site and product pages for **Opticks Audio**, a plugin brand inspired by Newton's *Opticks* — where the physics of light becomes the geometry of sound.

The **Opticks Collection**:

- **REFLEXION** — Reverb modeled on how light reflects between surfaces.
- **REFRACTION** — Spatial delay inspired by light bending through a prism.
- **INFLEXION** — Compressor that shapes the inflection points of motion.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- React Three Fiber + drei (3D prism scene)
- motion + GSAP (animation)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/                # Next.js App Router (layout, page, /plugins/[slug])
  components/
    brand/            # Logo and brand marks
    hero/             # Hero section + PrismScene (R3F)
    layout/           # Navbar, Footer
    product/          # DownloadButtons and product UI
    sections/         # OpticksCollection, Philosophy, DawCompatibility, CTA
  lib/
    plugins.ts        # Plugin catalog (Reflexion, Refraction, Inflexion)
    utils.ts          # cn() and helpers
```
