# @tonyh-2-eightfold/ef-design-system

Octuple DS Theme 2 components for Eightfold applications, plus the Claude Code skills, content guidelines, and design gallery designers use to build new screens.

> **Designers — start here:** [docs/DESIGNER-WORKFLOW.md](docs/DESIGNER-WORKFLOW.md). End-to-end walkthrough of how to use this repo from "I have an idea" to "the design is live in the gallery" — no terminal experience required.

> **Active development happens at [`ypike-eightfold/Octuple-TW-design-system`](https://github.com/ypike-eightfold/Octuple-TW-design-system).** This file was originally seeded from `tonyh-2-eightfold/ef-design-system` (the published npm package still uses that scope). The fork is where designers clone from, where the gallery deploys to Vercel, and where new content/skill/feature PRs land.

## Contents

- **Tokens**: Typography, color palette, semantic colors, spacing, and corner radius (Octuple DS Theme 2). Figma: [typography 47:3](https://www.figma.com/design/SlKRC7oKF7XZyHMv2op4ch/Octuple-DS--Theme-2-?m=auto&node-id=47-3), [palette 11686:119298](https://www.figma.com/design/SlKRC7oKF7XZyHMv2op4ch/Octuple-DS--Theme-2-?m=auto&node-id=11686-119298), [semantic tokens 25849:127027](https://www.figma.com/design/SlKRC7oKF7XZyHMv2op4ch/Octuple-DS--Theme-2-?m=auto&node-id=25849-127027), [spacing & corner radius 11686:120880](https://www.figma.com/design/SlKRC7oKF7XZyHMv2op4ch/Octuple-DS--Theme-2-?m=auto&node-id=11686-120880)
- **Button**: Primary, secondary, outline, ghost, orange variants
- **Pill**: Tag/badge component with neutral, critical, orange, blueGreen variants
- **Tag**: Tags from Octuple DS (Figma [14403-166977](https://www.figma.com/design/SlKRC7oKF7XZyHMv2op4ch/Octuple-DS--Theme-2-?m=auto&node-id=14403-166977)). Standalone chips (optional remove) or **TagGroup** with Radix Toggle Group for single/multiple selection. Uses design tokens.
- **OpenTo**: "Open to mentoring/coffee/project" indicator
- **Object cards**: **CourseObjectCard** (course with skills, completed-by), **PeopleObjectCard** (people with avatar, OpenTo)
- **Insight cards**: **InsightCard** (base: icon, title, description, CTA; e.g. learning path), **MentorInsightCard** (mentor profile and match)
- **Navbar**: Top navigation with tabs, search, avatar menu

The library uses **Tailwind v4** and **shadcn-style** utilities (Tailwind classes, `cn()`, `cva`) for the Tag component; other components still use plain CSS and design tokens. Tokens (Octuple) drive colors, spacing, and radius via CSS variables.

## Setup

```bash
npm run build
```

### Development (demo app)

The repo uses **npm workspaces** so the demo and design system share a single React instance (required for Radix). **Always run from the repo root** to avoid duplicate React and path issues.

1. **Install once**: `npm install` (hoists deps to root `node_modules`).
2. **Build design system**: `npm run build` (demo imports CSS from `dist/`).
3. **Run demo**: `npm run demo` (build then dev server) or `npm run demo:dev` (dev server only; run after a build).

**When you change design system components:** The demo loads the built output from `dist/`, not source. After editing any component or styles under `src/` (e.g. `src/components/**/*.tsx`, `src/components/**/*.css`, `src/styles/`), run **`npm run build`** so the demo picks up your changes. Then refresh the demo in the browser (or rely on HMR if the dev server is running).

## Usage

### In your app

1. Install: `npm install @tonyh-2-eightfold/ef-design-system` (or `file:../packages/design-system`)
2. Import styles: `import '@tonyh-2-eightfold/ef-design-system/styles'`
3. Optional: use spacing/radius token constants and helpers from `import { SPACING_TOKENS, CORNER_RADIUS_TOKENS, spacingVar, radiusVar } from '@tonyh-2-eightfold/ef-design-system/tokens'`
4. Gilroy: the package includes `public/fonts/` (Gilroy Regular, Medium, SemiBold). Serve it at `/fonts/` so the bundled @font-face URLs resolve, or copy `public/fonts` into your app’s public folder.
5. Load Material Symbols: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0`

### Components

```tsx
import { Button, Pill, PeopleObjectCard, MentorInsightCard, Navbar } from '@tonyh-2-eightfold/ef-design-system'
import { Link } from 'react-router-dom'

// With React Router
<PeopleObjectCard person={person} href="/people/1" LinkComponent={Link} />
<MentorInsightCard mentor={mentor} LinkComponent={Link} />
<Navbar tabs={tabs} user={user} LinkComponent={Link} NavLinkComponent={NavLink} />
```

### Router-agnostic

Components that use navigation accept optional `LinkComponent` and `NavLinkComponent` props. Omit them for plain `<a href>` behavior.

### Figma token (optional)

To use the Figma API (e.g. for syncing design tokens or exporting assets), add a personal access token:

1. Copy `.env.example` to `.env`
2. Set `FIGMA_ACCESS_TOKEN` to your token (from Figma → Account → Settings → Personal access tokens)
3. Do not commit `.env` (it is gitignored)

To re-fetch the typography scale from Figma (node 47:3):  
`FIGMA_ACCESS_TOKEN=your_token node scripts/figma-fetch-typography.js`  
Add `--out figma-typography.json` to save the raw response.

To fetch spacing and corner radius from Figma (node 11686:120880):  
`FIGMA_ACCESS_TOKEN=your_token node scripts/figma-fetch-spacing-radius.js`  
Add `--out figma-spacing-radius.json` to save the raw response.

### Keeping other projects updated

The simplest approach: in each app that uses this package, add **Dependabot** so it opens PRs when the design system is updated. No workflow or token in this repo. See **[.github/CONSUMER-SETUP.md](.github/CONSUMER-SETUP.md)** for a ready-to-use Dependabot config.

### GitHub Actions (workflows that push)

The **Publish** workflow (`.github/workflows/publish.yml`) uses `permissions: contents: write`. If you have branch protection on `main`, either allow the default `GITHUB_TOKEN` to bypass checks for that workflow or use a PAT for the push step. See [.github/SETUP-WORKFLOWS.md](.github/SETUP-WORKFLOWS.md).

### Assets

The package includes assets in `public/`; serve them from your app’s public root or copy into your app:
- `/object-card-backgrounds/` – SVG backgrounds for object cards (`course.svg`, `people.svg`, `devplan.svg`, `task.svg`, `project.svg`, `job.svg`, `article.svg`)
- `/fonts/` – Gilroy (`public/fonts/`); serve at `/fonts/` so @font-face resolves
