# TM

A React + Vite + TypeScript project.

## Setup

```bash
npm install
```

**Note:** Keep `package-lock.json` in the repo.

### Design system (ef-design-system)

Components come from [tonyh-2-eightfold/ef-design-system](https://github.com/tonyh-2-eightfold/ef-design-system) (`#main`). To pull in the latest changes from that repo:

```bash
npm run update-ds
```

This removes the cached package and reinstalls from `main`, then updates `package-lock.json`. The design system repo is public, so no token is needed to clone. A [weekly workflow](.github/workflows/update-design-system.yml) runs every Monday and pushes an updated `package-lock.json` to main when the design system has new commits, so you're always on the latest.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Deploy (Vercel)

See [docs/VERCEL.md](docs/VERCEL.md). Run `npm run build` before pushing; Node **20+** (see `engines` / `.nvmrc`).
