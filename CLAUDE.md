# TM — Talent Management App

## Project Overview
- **Stack**: React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **Design system**: `@tonyh-2-eightfold/ef-design-system` (GitHub dependency)
- **Routing**: react-router-dom v7, SPA with client-side routing
- **Deploy**: Vercel (Hobby plan), domain: tm-tau-neon.vercel.app
- **Vercel install**: Custom `installCommand` in `vercel.json` runs `setup-git-auth.cjs` to rewrite SSH → HTTPS for GitHub deps

## Key Personas
- **CHRO** (`currentUser.id === 'chro'`): Org-wide view, controls data collection and upskilling scope
- **HRBP** (`currentUser.id === 'laura-shah'`): Scoped to their departments, manages dev plans per role

## Workforce Readiness (WFR) Feature

### State Machine (`WfrProgramState`)
Stored in `localStorage` key `tm:wfr-state`. Only state 5 persists across reload.

| State | Name | Focus First Card | Key CTA |
|-------|------|-----------------|---------|
| 1 | Initial | "Get started" (red flag, warn variant) | Launch 4-step collection wizard |
| 2 | Collection active | Progress bar + response rate (amber, sync icon) | "View details" / "Add more departments" |
| 2b | Transition | 100% green bar + bell animation (auto-advances ~1.5s) | — |
| 3 | Collection complete | Success card, top priority roles (green, check_circle) | "Start upskilling →" (3-step wizard) |
| 4 | Upskilling active | "Upskilling started" badge (green) | HRBP: role selection + dev plan assignment |
| 5 | Complete | Hidden | Persists across sessions |

### Derived Flags (`deriveWfrFlags`)
```
collectionActive: state >= 2
collectionJustCompleted: state === '2b'
collectionComplete: state >= 3
upskillingActive: state >= 4
hrbpPlansCreated: state >= 5
```

### Key Metrics (Octave Metric Definitions)

#### 1. AI Potential — "How much of our work can AI help with?"
- Formula: `(Tasks in Augmentation Zone / Total Role Tasks) × 100`
- Augmentation zone: tasks scoring **15–75%** (configurable thresholds)
  - <15% = Below threshold (human-only: trust, judgment, presence)
  - 15–75% = Augment (human leads, AI assists)
  - >75% = Above threshold (should be fully automated)
- Task scores: **weighted composite of 7 research signals** (not a single source) — Octave v3.1:
  - GenAI Task Analysis (22%), WorkBank/Observed Exposure — Massenkoff & McCrory 2026 (22%), 24-Study Meta-Analysis (16%), Frey-Osborne (12%), GPTs-are-GPTs (12%), BLS Skills Framework (8%), BLS Employment Trend (8%)
  - WorkBank combines real-world Anthropic/Claude observed exposure + company adoption norms + research papers
  - Real-world observations weighted higher than theoretical predictions
  - Signal weights configurable in Admin settings
- Coverage: 1,016 O*NET occupations (5,099 tasks); ~541 knowledge worker occupations used in WFR demo

#### 2. AI Readiness — "Of the people AI can help, how many are ready?"
- Formula: `(People in Augmentable Roles Using AI Effectively / Total People in Augmentable Roles) × 100`
- Readiness threshold: ≥**50%** = AI-ready (configurable, orgs may use 30–40% interim)
- **Two measurement methods:**
  - **Estimated (from skill profiles):** `(D × 0.30) + (A × 0.25) + (T × 0.25) + (J × 0.20)`
    - D = Domain mastery (30%) — can they evaluate AI output?
    - A = AI exposure (25%) — have they started using AI? (strongest signal)
    - T = Tech fluency (25%) — daily digital tool usage
    - J = AI-complementary judgment (20%) — oversight skills (critical thinking, leadership)
    - Skills matched via **AI-powered similarity matching**, not keyword lookup
    - Weights configurable, treat as directional until calibrated against survey ground truth
  - **Measured (from surveys):** Per augmentable task: "How are you doing this task today? — Manual / AI-assisted / Mostly AI"
    - `Measured Readiness = Σ(AI-assisted tasks × weekly hours) / Σ(all augmentable tasks × weekly hours)`
    - **Time-weighted**: a 10hr/week task counts more than a 30-min task
    - Stratified random sampling per role group (not org-wide)
    - Sample size: standard proportion CI (z=1.96, p=0.5) with finite population correction
    - N<15: survey all; 15–50: 15–23 needed (±15%); 50–200: 23–66 (±12–15%); 200–500: 66–81 (±10–12%); >500: ~97 (±10%)
    - Mid-market: 360–800 total surveys, 3 min each, quarterly
  - **5 validation checks:** split-half validation, cross-role task comparison, manager attestation, behavioral triangulation (IT/training records), quarterly re-survey

#### 3. Transformation Gap — "How many people need upskilling?"
- Formula: `People in Augmentable Roles − People Already AI-Ready`
- Each person in gap gets a **role-specific development plan** mapped to their augmentable tasks
- Dev plans sourced from Degreed catalog; completion syncs back to Octave, triggers next survey cycle

#### Productivity Potential
- `Weekly Hours Unlocked per person = Σ(task hours × task score × 0.60)` for augmentable tasks
- 60% realization rate (McKinsey 2023: 50–70% achievable, we use midpoint; configurable)
- `Total Weekly Hours Unlocked = Hours per person × Headcount`

#### How the Three Metrics Connect
```
AI Potential (38–48%) → "A third to half your work has AI tech available today"
  → AI Readiness (27% estimated → 36% measured Q1) → "Only 1 in 4 people are using it"
    → Transformation Gap (75% = 5,749 people) → "Here's who needs what training"
      → Action: Role-specific dev plans from Degreed catalog
        → Track: Quarter-over-quarter readiness improvement
```
Goal: drive Readiness up and Gap down, quarter after quarter.

#### Demo-specific calibration deltas
- **Collection calibration delta**: Deterministic per-dept hash, ~80% trend up (+4 to +11pt), ~20% down (-2 to -4pt)
- **Upskilling hero boost**: CHRO +8pt, HRBP +10pt (applied at state 5)

### Key Files
- `src/pages/WorkforceReadinessPage.tsx` — Route handler, persona gating
- `src/components/workforceReadiness/WorkforceReadinessDashboard.tsx` — Main dashboard (BoardView + DeptView)
- `src/components/workforceReadiness/ReadinessTrendSheet.tsx` — Slide-in trend sheet (dept/manager/role views)
- `src/components/workforceReadiness/collectionHelpers.ts` — Trend calculations, demo data generation
- `src/data/wfrOrgData.ts` — 17 departments, roles, AI metrics, task data

### Launch Dialogs
- **Data Collection** (4 steps): Assign (HRBP vs self) → Scope (all vs select depts) → Channels (AI Agent Interviews) → Review
- **Upskilling** (3 steps): Assign → Departments (sorted by gap) → Review

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
