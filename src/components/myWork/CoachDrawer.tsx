import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  CHECKIN_QUESTIONS,
  COACH_GREETING_CHECKIN,
  COACH_GREETING_PR,
  WALKTHROUGH_STEPS,
} from '../../data/myWorkData'
import { CoachAvatar } from './CoachAvatar'

export type CoachDrawerView = 'pr' | 'checkin' | 'chat' | null

interface CoachDrawerProps {
  view: CoachDrawerView
  firstName: string
  initialPrompt?: string
  coachingTaskId?: string
  coachingTaskName?: string
  onClose: () => void
}

const BODY_ATTR = 'data-coach-open'

// Coach responses are split into interleaved blocks so recommended artifacts
// (skills, courses, videos, templates, tools, articles) sit next to the step
// they support, instead of trailing as a generic footer list.
type ArtifactType = 'skill' | 'course' | 'video' | 'article' | 'template' | 'tool'
interface Artifact {
  type: ArtifactType
  title: string
  meta?: string
}
type ResponseBlock =
  | { kind: 'text'; content: string }
  | { kind: 'artifact'; artifact: Artifact; note?: string }
interface CoachResponse {
  blocks: ResponseBlock[]
}

// Tiny DSL helpers to keep the response data readable.
const t = (content: string): ResponseBlock => ({ kind: 'text', content })
const a = (type: ArtifactType, title: string, meta?: string, note?: string): ResponseBlock =>
  ({ kind: 'artifact', artifact: { type, title, meta }, note })

// Pre-written contextual responses keyed by exact suggested prompt text
const CANNED_RESPONSES: Record<string, CoachResponse> = {
  'Help me prep for my architecture review': {
    blocks: [
      t("Your ML architecture reviews are ~2 hrs/week — and your team leans on your judgment here. Here's how to prep:"),
      t("**1. Summarize the proposal in plain language.** Paste it here and I'll pull out the key tradeoffs so you can scan them before the meeting."),
      a('template', 'Architecture review checklist', '1-pager', 'Run through this alongside step 1 — catches the items reviewers usually forget'),
      t("**2. Draft 5–7 probing questions** tailored to the system design area."),
      a('course', 'Designing Data-Intensive Apps', "O'Reilly · 12 hrs", "If it's been a while since you brushed up on the fundamentals these questions usually pull from"),
      t("**3. Map the likely failure modes** so you know what to watch for going in."),
      a('video', 'How to run an arch review', 'Will Larson · 18 min', 'Concise walkthrough of how a senior IC frames the failure-mode discussion'),
      t("Longer term, the skill that compounds across every review is system design judgment — worth tracking on your IDP."),
      a('skill', 'System design judgment', 'Skill · Level 3 → 4'),
      t("Want me to start with the questions, or do you have a proposal to share?"),
    ],
  },
  'Draft a stakeholder update': {
    blocks: [
      t("Happy to help — you do this every week. Give me:\n\n• What model or project this is about\n• 2–3 bullets: what moved, what's blocked, what's next\n\nI'll turn it into a tight exec summary you can paste into Slack or your weekly doc."),
      a('template', 'Weekly exec summary template', 'Reusable · 5-line format', "Start from this — it's the format I'll write into"),
      t("If your audience is mixed (eng + non-eng), this short article changed how a lot of MLEs write these:"),
      a('article', 'Writing for skim-readers', '6 min read'),
      t("And if you're publishing to Slack, canvases keep the update editable for follow-ups instead of dying in a thread:"),
      a('tool', 'Slack canvases', 'Async-friendly format'),
      t("Want the template now, or paste your bullets and we'll draft together?"),
    ],
  },
  'What skills should I grow next?': {
    blocks: [
      t("Looking at your task list, your role is actively growing Code review, PyTorch, and ML system design. Here's where I'd focus:"),
      t("**1. AI-assisted code review.** You're doing PR review manually at 5 hrs/week. Upskilling here has the fastest time-back payoff."),
      a('skill', 'AI-assisted code review', 'Skill · fastest payoff'),
      t("**2. Experiment design.** You're already using AI on experimentation (8 hrs/week). Structured hypothesis design would compound that."),
      a('skill', 'Experiment design', 'Skill · compounds existing AI use'),
      t("For PyTorch depth, this is the cleanest path from working knowledge to fluency:"),
      a('course', 'PyTorch for ML engineers', 'Coursera · 18 hrs'),
      t("And Karpathy's classic is worth re-watching if you ever feel hand-wavy explaining gradients to teammates:"),
      a('video', 'Yes you should understand backprop', 'Karpathy · 15 min'),
      t("Want me to turn either of these into a structured learning plan with weekly checkpoints?"),
    ],
  },
  'How can AI help with PR reviews?': {
    blocks: [
      t("You spend 5 hrs/week on Model PR review, currently manual. Three places AI fits best:"),
      t("**1. Pre-read.** A bot catches tensor-shape issues, style nits, and data-handling bugs before you open the PR. Most leads save 1–2 hrs/week."),
      a('tool', 'CodeRabbit', 'AI PR pre-reads', 'The fastest install — runs as a GitHub App, comments inline on PRs'),
      t("**2. Diff summary.** Ask 'what does this PR do in plain English?' — saves you from re-reading large diffs."),
      a('tool', 'GitHub Copilot for PRs', 'Built into the PR view'),
      t("**3. Auto-triage.** Route PRs by complexity so you know which ones actually need your eyes vs. a rubber stamp."),
      a('template', 'PR review checklist', '1-pager', 'Use as the triage rubric the bot scores against'),
      t("Underneath all of this is the skill of knowing what the bot can and can't catch — that's where to invest:"),
      a('skill', 'AI-assisted code review', 'Skill to develop'),
      t("Want to walk through setting this up for your repo?"),
    ],
  },
  'Summarize my experiment notes': {
    blocks: [
      t("Paste your notes or bullet points from the last run and I'll format them. Pick a target format:"),
      t("**Research doc** (Notion / Confluence-ready) — best for findings you want teammates to reference later."),
      a('template', 'Research doc template', 'Bullets → doc skeleton', "I'll write into this format"),
      t("**W&B run annotation** — best for keeping the summary alongside the metrics it describes."),
      a('tool', 'Weights & Biases run annotations', 'Notes live with the run'),
      t("If you do a lot of these, the underlying skill — writing research docs people actually read — pays back fast:"),
      a('skill', 'Technical writing', 'Skill · clear research write-ups'),
      a('article', 'Research docs people actually read', '8 min read'),
      t("What format works best, or just paste the notes and I'll ask?"),
    ],
  },
}

const DEFAULT_RESPONSE: CoachResponse = {
  blocks: [
    t("Got it. I can see your task list — you're spending the most time on code review, experimentation, docs, and cross-functional updates. Tell me more about what you're trying to work through and I'll dig in with you."),
  ],
}

// Task-specific coaching responses, keyed by task ID
const TASK_COACHING_RESPONSES: Record<string, CoachResponse> = {
  'pr-review': {
    blocks: [
      t("You're at 5 hrs/week on PR review, currently manual — that's a high-value place to start. The fastest win is getting a bot to pre-read PRs so you focus on modeling judgment, not mechanics."),
      t("**This week:** install a PR bot on one low-stakes internal repo. Not the serving path — somewhere a false positive isn't a disaster."),
      a('tool', 'CodeRabbit', 'AI PR pre-reads', 'Pick this for the first install — runs as a GitHub App, no migration needed'),
      t("Run one PR through it and notice what it caught vs. what you added. That gap tells you where to tune it — and this guide walks through the tuning loop:"),
      a('template', 'PR bot calibration guide', 'How to tune signal vs. noise'),
      t("Long-term, the skill is knowing when to trust the bot and when to override it:"),
      a('skill', 'AI-assisted code review', 'Skill to develop'),
      t("Want me to walk through the setup, or start by picking which repo?"),
    ],
  },
  'experimentation': {
    blocks: [
      t("You're already using AI here — good foundation. The next level is bringing it in earlier, not just to speed up what you're already doing."),
      t("**Before your next training run:** tell Claude the problem you're solving and ask for 3 experiments you haven't tried. You'll know most of them, but one will be genuinely new."),
      a('skill', 'Experiment design', 'Skill · hypothesis-first', "The underlying skill — fast.ai's course is the cleanest path"),
      a('course', 'Practical Deep Learning', 'fast.ai · 16 hrs'),
      t("**During the run:** automate the sweep so you stop hand-tuning."),
      a('tool', 'Weights & Biases sweeps', 'Automated hyperparam search'),
      t("**After:** paste your loss curves and ask 'what's the most likely explanation for this pattern?' Compare its read to yours. After a few runs, it sharpens your diagnostic instincts."),
      a('video', 'Reading loss curves', '14 min', 'Solid mental model for what each curve shape usually means'),
      t("What's your next experiment? Let's start there."),
    ],
  },
  'docs': {
    blocks: [
      t("The shift here is from writing to editing. Most of the time you spend on docs is the blank-page problem — once you have a draft, editing is fast."),
      t("**The workflow:** jot your key points as bullet points, paste them into Claude with 'write a design doc from this,' then edit what it gives you. The edit takes 20 minutes instead of 90."),
      a('template', 'Design doc starter', 'Bullets → draft format', "Use this as the bullet structure you paste in"),
      t("Protect the substance — insights, tradeoffs, the 'why this matters' that only you know. AI handles structure and prose. You handle judgment."),
      a('article', 'A guide to design docs', 'Google eng · 10 min', "What 'good' looks like, with examples"),
      a('skill', 'Technical writing', 'Skill · editorial judgment'),
      t("Got something you're working on now? Paste your notes and let's draft it."),
    ],
  },
  'serving': {
    blocks: [
      t("You're doing this manually at 3 hrs/week. The scaffolding is the easiest thing to hand off — FastAPI endpoints, container configs, inference boilerplate."),
      t("**Start here:** next time you're writing a new endpoint, open Cursor and describe what it needs to do. Let it scaffold the first version."),
      a('tool', 'Cursor', 'AI-first IDE', 'The shortest path from prompt → working code'),
      a('template', 'FastAPI inference endpoint', 'Prod-ready scaffolding', "Reference scaffold to compare what Cursor gives you against"),
      t("**For the review piece:** paste your inference code and ask 'what are the most likely memory and latency bottlenecks here?' It's faster than profiling blind."),
      a('video', 'Profiling Python services', '22 min', "When you do need to profile, this is the playbook"),
      a('skill', 'Inference performance tuning', 'Skill · memory & latency'),
      t("What's coming up next in serving that we could practice this on?"),
    ],
  },
  'stakeholder': {
    blocks: [
      t("You're already using AI on exec summaries — you're ahead. The next step is making it even faster by giving it better raw material."),
      t("**The pattern:** right after your model run or team sync, spend 3 minutes writing down what moved, what regressed, and what's next. Paste those bullets in with your stakeholder list. It drafts a summary calibrated to the audience."),
      a('template', 'Weekly exec summary template', 'Reusable · 5-line format', "Paste your bullets straight into this"),
      t("The judgment call on what to emphasize and what to leave out — that's yours. Tighten that instinct:"),
      a('skill', 'Audience calibration', 'Skill · emphasis & framing'),
      a('article', 'Writing for skim-readers', '6 min read'),
      t("What's the next update you need to send? We can draft it together right now."),
    ],
  },
  'sprint': {
    blocks: [
      t("Sprint planning is mostly boilerplate — velocity tracking, capacity math, translating priorities into tickets. That's exactly what AI handles well."),
      t("**Before your next session:** share your backlog, team capacity, and top 3 goals. Ask for the sprint doc plus a scope-risk flag list. You'll spend the meeting on decisions, not admin."),
      a('template', 'Sprint planning prompt', 'Backlog → draft sprint', "Paste in here — outputs the doc + risk list"),
      t("**For ticket descriptions:** one sentence of intent → expanded ticket in 30 seconds."),
      a('tool', 'Linear AI summaries', 'Ticket auto-draft'),
      t("The recurring instinct to build is spotting scope risk before commitment, not after:"),
      a('skill', 'Scope estimation', 'Skill · spotting risk early'),
      t("When's your next planning session? Let's prep for it."),
    ],
  },
  '1on1': {
    blocks: [
      t("1:1s are yours — AI doesn't sit in the room. But it can make the 10 minutes before and after more useful."),
      t("**Before:** share what you know about the person's current projects and ask for 2–3 questions you haven't asked lately."),
      a('template', '1:1 agenda template', 'Monthly cadence', "Lightweight enough to actually fill in each week"),
      t("**After:** jot a few notes while it's fresh, then once a month surface patterns across your notes. Catches blockers that show up week after week."),
      a('skill', 'Coaching conversation', 'Skill · asking better questions'),
      a('article', 'The art of the 1:1', 'Lattice · 7 min'),
      t("Who's the 1:1 you're thinking about most right now?"),
    ],
  },
  'arch-review': {
    blocks: [
      t("Your job in architecture reviews is to bring the judgment that nobody else can. AI can do the prep work that currently eats 20–30 minutes before each session."),
      t("**Before your next review:** paste the proposal and ask for likely failure modes in plain language. Then ask for 5 probing questions."),
      a('template', 'Architecture review checklist', '1-pager', 'Run through this in parallel — catches structural omissions'),
      t("You'll probably already know the answers — but having them written sharpens your thinking. Brush up on the fundamentals if it's been a while:"),
      a('course', 'Designing Data-Intensive Apps', "O'Reilly · 12 hrs"),
      a('video', 'How to run an arch review', 'Will Larson · 18 min'),
      t("Long term, system design judgment is the skill that compounds across every review:"),
      a('skill', 'System design judgment', 'Skill · Level 3 → 4'),
      t("Got an architecture review coming up? Share the proposal and let's prep for it."),
    ],
  },
  'hiring': {
    blocks: [
      t("Hiring judgment stays human — AI isn't evaluating your candidates. But it can sharpen your process."),
      t("**Before interviews:** give Claude the role requirements and ask for follow-up questions on the technical topics. Pick the two or three that feel right."),
      a('template', 'Structured interview rubric', 'Calibration-friendly', "Use this as the question scaffold"),
      a('article', 'Structured interviews work', 're:Work · 8 min', "Why the structured approach holds up — short read"),
      t("**At calibration:** paste everyone's summaries and ask for consistent themes vs. divergences. Reduces anchoring on the loudest voice in the room."),
      a('skill', 'Calibration debrief facilitation', 'Skill · reduce anchoring'),
      t("What's coming up in your hiring process this week?"),
    ],
  },
  'perf': {
    blocks: [
      t("Written feedback is yours — don't outsource the substance. But AI is useful at two specific moments."),
      t("**Before you write:** search your 1:1 notes and surface 3–4 specific examples from the year. Stops recency bias."),
      a('template', 'Perf review template', 'Examples-first', "Force-functions the example surfacing"),
      t("**After you draft:** paste it and ask 'where am I being vague?' and 'does this use always/never language?' Those are the two most common feedback weaknesses."),
      a('skill', 'Developmental feedback', 'Skill · specific, actionable'),
      a('article', 'Radical Candor in writing', '9 min'),
      t("Who's review is coming up? We can work through the example-surfacing step right now."),
    ],
  },
  'evals': {
    blocks: [
      t("This is the task that should mostly not be yours. The pattern is regular, the data is structured, and the format doesn't change — it's textbook automation."),
      t("**First move:** set up threshold-based alerting so you only get notified when something regresses. Stop reviewing every passing run."),
      a('template', 'Eval pipeline alerting config', 'Threshold-based'),
      a('tool', 'PagerDuty for eval regressions', 'Automated escalation', "Wires the alerts into a real on-call channel"),
      t("**Second:** have a conversation with your manager about whether the platform team should own the pipeline. Frame it around what you could do with those 4 hours instead."),
      a('skill', 'Negotiating scope with managers', 'Skill · time-back conversations'),
      t("Want help structuring that conversation with your manager?"),
    ],
  },
  'oncall': {
    blocks: [
      t("Handoff notes are a great automation candidate — same format, same data sources, every week."),
      t("**The workflow:** PagerDuty + Slack AI can draft the handoff for you. You verify the key points and post. That's 5 minutes instead of 30."),
      a('tool', 'Slack AI summaries', 'Draft from thread', "Pulls from the incident channel directly"),
      a('tool', 'PagerDuty handoff exports', 'Incident → notes'),
      t("If your team doesn't have Slack AI yet: paste the incident timeline into the standard handoff template and it'll fill it in."),
      a('template', 'Oncall handoff template', 'Auto-fillable'),
      t("Want help building the template or talking through the automation setup?"),
    ],
  },
  'dataset': {
    blocks: [
      t("Spot-checking every batch is the bottleneck — the goal is exception-only review."),
      t("**Set a quality threshold with your vendor.** Batches that pass automatically clear. Batches that fail come to you. You stop touching the ones that are fine."),
      a('skill', 'Vendor quality SLAs', 'Skill · threshold-based reviews', "The lever that actually moves your time"),
      t("**For the labeling guide:** next time you see a common dispute, paste the edge case in and ask for a clearer guideline. Better guidelines → fewer disputes → fewer batches to review."),
      a('template', 'Labeling guide v2', 'Edge-case driven', "Iterate this each time a new dispute pattern appears"),
      a('article', 'Scaling label quality', '12 min', "Sets up the framework for why exception-only review works"),
      t("What's the most common quality issue you're seeing right now?"),
    ],
  },
}

type Message =
  | { role: 'user'; text: string }
  | { role: 'ai'; blocks: ResponseBlock[] }

// Visual config per artifact type (icon, colors used by the inline artifact card)
const ARTIFACT_META: Record<ArtifactType, { icon: string; bg: string; color: string; label: string }> = {
  skill:    { icon: 'auto_awesome', bg: '#eef2ff', color: '#4338ca', label: 'Skill' },
  course:   { icon: 'school',       bg: '#e0f2fe', color: '#0369a1', label: 'Course' },
  video:    { icon: 'play_circle',  bg: '#fce7f3', color: '#be185d', label: 'Video' },
  article:  { icon: 'article',      bg: '#f1f5f9', color: '#475569', label: 'Article' },
  template: { icon: 'description',  bg: '#dcfce7', color: '#15803d', label: 'Template' },
  tool:     { icon: 'construction', bg: '#fef3c7', color: '#b45309', label: 'Tool' },
}

/** Render a single inline artifact card placed mid-conversation. */
function ArtifactCard({ artifact, note }: { artifact: Artifact; note?: string }) {
  const meta = ARTIFACT_META[artifact.type]
  return (
    <button type="button" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 8,
      background: '#fff', border: '1px solid #e2e8f0',
      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      transition: 'border-color 0.15s, background 0.15s',
      width: '100%',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafafa' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 7, background: meta.bg, color: meta.color, flexShrink: 0, marginTop: 1,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{meta.icon}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '1px 6px', borderRadius: 10,
            background: meta.bg, color: meta.color,
            fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{meta.label}</span>
          {artifact.meta && <span style={{ fontSize: 11, color: '#94a3b8' }}>{artifact.meta}</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>{artifact.title}</div>
        {note && (
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.45 }}>{note}</div>
        )}
      </div>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#cbd5e1', flexShrink: 0, marginTop: 6 }}>chevron_right</span>
    </button>
  )
}

/** Render coach text with **bold** segments turning into actual <strong>. */
function CoachText({ content }: { content: string }) {
  // Split on **...** runs, alternating non-bold / bold
  const parts = content.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 600, color: '#0f172a' }}>{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

/** Inline typing-dots indicator shown between progressively-loading bubbles. */
function ThinkingDots() {
  return (
    <div className="bubble" style={{
      alignSelf: 'flex-start',
      display: 'inline-flex', gap: 4, alignItems: 'center',
      padding: '10px 14px',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
          display: 'inline-block',
          animation: 'coach-pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

/**
 * Render a coach response as a group: one avatar (top-left), then each text
 * block in its own .bubble and each artifact as its own card, stacked.
 *
 * Blocks reveal progressively — first appears immediately, each subsequent
 * one fades in after a short delay (text blocks pause longer than artifact
 * cards), with typing dots sitting between until the next block lands.
 */
function CoachResponseGroup({
  blocks,
  onStream,
}: {
  blocks: ResponseBlock[]
  onStream?: () => void
}) {
  const [revealed, setRevealed] = useState(1)

  useEffect(() => {
    if (revealed >= blocks.length) return
    const next = blocks[revealed]!
    // Text blocks need longer "reading time"; artifacts pop in quicker.
    const delay = next.kind === 'text' ? 750 : 400
    const timer = window.setTimeout(() => {
      setRevealed(r => r + 1)
      onStream?.()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [revealed, blocks, onStream])

  const streaming = revealed < blocks.length

  return (
    <div className="coach-msg" style={{ alignItems: 'flex-start' }}>
      <CoachAvatar size="sm" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.slice(0, revealed).map((block, i) => (
          <div key={i} className="coach-block-in" style={{ display: 'flex', flexDirection: 'column' }}>
            {block.kind === 'text' ? (
              <div className="bubble" style={{ alignSelf: 'flex-start' }}>
                <CoachText content={block.content} />
              </div>
            ) : (
              <ArtifactCard artifact={block.artifact} note={block.note} />
            )}
          </div>
        ))}
        {streaming && <ThinkingDots />}
      </div>
    </div>
  )
}

function CoachMessage({ children }: { children: ReactNode }) {
  return (
    <div className="coach-msg">
      <CoachAvatar size="sm" />
      <div className="bubble">{children}</div>
    </div>
  )
}

function PrWalkthroughView() {
  return (
    <>
      <div className="coach-scroll">
        <CoachMessage>{COACH_GREETING_PR}</CoachMessage>
        <div className="coach-steps">
          {WALKTHROUGH_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`coach-step${step.state === 'active' ? ' active' : ''}${step.state === 'done' ? ' done' : ''}`}
            >
              <div className="step-dot">
                {step.state === 'done' ? (
                  <span className="material-symbols-outlined">check</span>
                ) : (
                  idx + 1
                )}
              </div>
              <div>
                <div className="step-title">{step.title}</div>
                <div className="step-body">
                  {step.body}
                  {step.link ? (
                    <>{' '}<a href="#" onClick={(e) => e.preventDefault()}>{step.link.label}</a>.</>
                  ) : null}
                </div>
                {step.ctaLabel ? (
                  <button type="button" className="step-btn">
                    {step.ctaLabel}
                    {step.ctaIcon ? <span className="material-symbols-outlined">{step.ctaIcon}</span> : null}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="coach-input">
        <input placeholder="Stuck? Ask me anything about this step…" />
        <button type="button" className="send-btn" aria-label="Send">
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </>
  )
}

function CheckInView({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<Record<string, string>>({
    feel: 'Lighter than usual',
    help: 'Code review',
  })
  const [comment, setComment] = useState('')

  return (
    <div className="coach-scroll">
      <CoachMessage>{COACH_GREETING_CHECKIN}</CoachMessage>
      {CHECKIN_QUESTIONS.map((q) => (
        <div key={q.id} className="checkin-q">
          <div className="q-label">{q.label}</div>
          {q.kind === 'single' ? (
            <div className="q-opts">
              {q.options?.map((opt) => {
                const active = selected[q.id] === opt.label
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`q-chip${active ? ' selected' : ''}`}
                    onClick={() => setSelected((prev) => ({ ...prev, [q.id]: opt.label }))}
                  >
                    {opt.emoji ? <>{opt.emoji} </> : null}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <textarea
              placeholder={q.placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="coach-actions">
        <button type="button" className="btn-primary" onClick={onClose}>
          Send it
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <button type="button" className="btn-ghost" onClick={onClose}>
          Skip for now
        </button>
      </div>
    </div>
  )
}

function ChatView({ initialPrompt, coachingTaskId, coachingTaskName }: {
  initialPrompt?: string
  coachingTaskId?: string
  coachingTaskName?: string
}) {
  const userMessage = coachingTaskName
    ? `Let's work on: ${coachingTaskName}`
    : initialPrompt

  const [messages, setMessages] = useState<Message[]>(() =>
    userMessage ? [{ role: 'user', text: userMessage }] : []
  )
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Fire AI response on mount
  useEffect(() => {
    if (!userMessage) return
    const timer = setTimeout(() => {
      const response = coachingTaskId
        ? (TASK_COACHING_RESPONSES[coachingTaskId] ?? DEFAULT_RESPONSE)
        : (CANNED_RESPONSES[initialPrompt!] ?? DEFAULT_RESPONSE)
      setMessages(prev => [...prev, { role: 'ai', blocks: response.blocks }])
    }, 700)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      const response = CANNED_RESPONSES[text] ?? DEFAULT_RESPONSE
      setMessages(prev => [...prev, { role: 'ai', blocks: response.blocks }])
    }, 900)
  }

  return (
    <>
      <div className="coach-scroll">
        {messages.length === 0 && !coachingTaskId && (
          <CoachMessage>
            What's on your mind? I can help you unblock something, draft an update, prep for a meeting, or think through your week.
          </CoachMessage>
        )}

        {messages.map((msg, i) =>
          msg.role === 'ai' ? (
            <CoachResponseGroup
              key={i}
              blocks={msg.blocks}
              onStream={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          ) : (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: '#025966', color: '#fff',
                borderRadius: '14px 14px 4px 14px',
                padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
                maxWidth: 300, whiteSpace: 'pre-line',
              }}>
                {msg.text}
              </div>
            </div>
          )
        )}

        {thinking && (
          <div className="coach-msg">
            <CoachAvatar size="sm" />
            <div className="bubble" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                  display: 'inline-block',
                  animation: 'coach-pulse 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="coach-input">
        <input
          placeholder="Ask a follow-up…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button type="button" className="send-btn" onClick={send} aria-label="Send">
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
    </>
  )
}

export function CoachDrawer({ view, firstName: _firstName, initialPrompt, coachingTaskId, coachingTaskName, onClose }: CoachDrawerProps) {
  const open = view !== null

  useLayoutEffect(() => {
    if (open) {
      document.body.setAttribute(BODY_ATTR, 'true')
    } else {
      document.body.removeAttribute(BODY_ATTR)
    }
    return () => document.body.removeAttribute(BODY_ATTR)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const content = (
    <div className={`my-work-page coach-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="coach-backdrop" onClick={onClose} aria-hidden />
      <aside className="coach-panel" role="dialog" aria-modal="true">
        <header className="coach-panel-head">
          <CoachAvatar size="md" />
          <div>
            <div className="coach-panel-title">Career Coach</div>
            <div className="coach-panel-sub">
              <span className="online-dot" aria-hidden />
              Here to help, not to grade
            </div>
          </div>
          <button
            type="button"
            className="coach-close"
            onClick={onClose}
            aria-label="Close coach"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        <div className="coach-view">
          {view === 'pr' && <PrWalkthroughView />}
          {view === 'checkin' && <CheckInView onClose={onClose} />}
          {view === 'chat' && (
            <ChatView
              key={coachingTaskId ?? initialPrompt ?? 'empty'}
              initialPrompt={initialPrompt}
              coachingTaskId={coachingTaskId}
              coachingTaskName={coachingTaskName}
            />
          )}
        </div>
      </aside>
    </div>
  )

  return createPortal(content, document.body)
}
