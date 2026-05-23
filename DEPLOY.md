# Deploying Opticks Audio Web to Cloudflare Pages

> Step-by-step guide to connect this repo to **Cloudflare Pages** and serve
> the site at **opticksaudio.com**.
>
> Cloudflare Pages is **free** for personal/commercial use up to 500 builds
> per month and unlimited bandwidth — perfectly sized for a marketing site.

---

## Prerequisites

- ✅ Repo at `https://github.com/opticks-audio/web` (private is fine)
- ✅ Domain **opticksaudio.com** already registered through Cloudflare
- ✅ Cloudflare account with the domain attached

---

## Step 1 — Create the Pages project

1. Log in to Cloudflare: <https://dash.cloudflare.com>
2. In the left sidebar click **"Workers & Pages"**
3. Click the **"Create"** button (top right) → **"Pages"** tab → **"Connect to Git"**
4. Choose **GitHub** as the provider
5. Cloudflare will ask to install/authorize the **Cloudflare Pages** GitHub
   App. Click **"Configure GitHub App"** and:
   - Select your **`opticks-audio`** organization (not your personal account)
   - **Only select repositories** → pick `web` (don't grant access to "All
     repositories" — principle of least privilege)
   - Click **"Install & Authorize"**
6. Back on Cloudflare, select the repo `opticks-audio/web` and click
   **"Begin setup"**

---

## Step 2 — Build configuration

Fill in the form exactly as below:

| Field                       | Value                                                 |
|-----------------------------|-------------------------------------------------------|
| **Project name**            | `opticks-audio-web`                                   |
| **Production branch**       | `main`                                                |
| **Framework preset**        | `Next.js`                                             |
| **Build command**           | `npx @cloudflare/next-on-pages@1`                     |
| **Build output directory**  | `.vercel/output/static`                               |
| **Root directory** (Advanced)| _(leave blank)_                                      |

### Environment variables (Advanced)

Add one variable so the build runs Node 20 (Next.js 16 requirement):

| Variable name      | Value     |
|--------------------|-----------|
| `NODE_VERSION`     | `20`      |

Click **"Save and Deploy"**.

> First build will take 3–5 minutes (downloading dependencies, generating
> static pages). Subsequent builds are 30–60 seconds.

---

## Step 3 — Verify the staging URL works

When the build finishes, Cloudflare gives you a free subdomain like
`opticks-audio-web.pages.dev`. Open it and check:

- ✅ Landing loads with the animated prism hero
- ✅ `/plugins/reflexion`, `/plugins/refraction`, `/plugins/inflexion` all
  render with their screenshots
- ✅ No 404s in the browser console

---

## Step 4 — Attach the custom domain

1. In the Pages project, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter `opticksaudio.com` → **Continue**
4. Cloudflare will detect the domain is already in your account and offer to
   create the DNS records automatically. Click **"Activate domain"**
5. Repeat for `www.opticksaudio.com` (recommended)
6. DNS propagates within a few minutes — usually instant if the domain is
   already on Cloudflare DNS

That's it. The site is live at <https://opticksaudio.com>.

---

## Step 5 — Verify production

- Open <https://opticksaudio.com>
- Open <https://opticksaudio.com/plugins/reflexion>
- Check HTTPS padlock (Cloudflare provisions SSL automatically)
- Open browser DevTools → Network → reload → all assets should be 200

---

## Ongoing workflow

After deploy, every `git push origin main` triggers an automatic build and
deploy. To preview a change without going live:

```bash
git checkout -b feature/some-change
# … make changes …
git commit -am "experimenting"
git push origin feature/some-change
```

Cloudflare auto-creates a **preview URL** for that branch (something like
`feature-some-change.opticks-audio-web.pages.dev`). When happy, merge to
`main` for production.

---

## Cost expectations

| Tier           | Builds/month | Cost  |
|----------------|--------------|-------|
| Free           | 500          | $0    |
| Pages Pro      | 5,000        | $20/m |

A typical marketing site uses **5–30 builds per month**. The free tier is
more than enough until you're shipping daily.

---

## Troubleshooting

### Build fails with "Module not found: @cloudflare/next-on-pages"

This is normal on the *first* build. The build command will install it
automatically. If it still fails:

```bash
# locally, to verify
npx @cloudflare/next-on-pages@1
```

### Images don't load on the deployed site

Check that the screenshot PNGs exist in `public/screenshots/`. They are
served as-is by Cloudflare.

### `opticksaudio.com` shows a Cloudflare 522 error

DNS hasn't propagated yet. Wait 1–5 minutes and refresh.

### "Sign in with GitHub" loop on Cloudflare

Sign out of GitHub, sign back in, and retry. Cloudflare's GitHub App
sometimes needs a fresh session.

---

## Next steps after first deploy

1. Set up a transactional-email address for `beta@opticksaudio.com` and
   `hello@opticksaudio.com` (Cloudflare Email Routing is free).
2. Consider adding analytics — Cloudflare Web Analytics is free,
   privacy-friendly, no cookie banner needed.
3. Add a robots.txt and sitemap.xml when content stabilises.
