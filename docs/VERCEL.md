# Vercel deployment

## Project settings

| Setting            | Value                          |
| ------------------ | ------------------------------ |
| Framework Preset   | Vite (or leave `vercel.json`)  |
| Build Command      | `npm run build`                |
| Output Directory   | `dist`                         |
| Install Command    | See `vercel.json` (git auth + `npm install`) |

`vercel.json` already sets SPA rewrites so client-side routes (e.g. `/workforce`) serve `index.html`.

## Private GitHub dependencies

`package-lock.json` pins `@tonyh-2-eightfold/ef-design-system` as `git+ssh://…`. On Vercel:

1. **`scripts/setup-git-auth.cjs`** runs before install (see `vercel.json` + `preinstall`). On CI without `GITHUB_TOKEN`, it rewrites SSH → `https://github.com/` so **public** repos install without a token.
2. If the design system repo is **private**, add a **GitHub PAT** in Vercel → Project → Settings → Environment Variables:
   - Name: `GITHUB_TOKEN`
   - Value: classic token or fine-grained PAT with **Contents: Read** on that repo.

## Verify locally

```bash
npm run build
npm run lint
```

Same as Vercel’s build step (`tsc` + `vite build`).
