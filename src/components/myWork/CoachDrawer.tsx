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

// Pre-written contextual responses keyed by exact suggested prompt text
const CANNED_RESPONSES: Record<string, string> = {
  'Help me prep for my architecture review':
    "Your ML architecture reviews are ~2 hrs/week — and your team leans on your judgment here. Here's how to prep:\n\n1. Share the proposal and I'll summarize the key tradeoffs in plain language before the meeting.\n2. I can draft 5–7 probing questions tailored to the system design area.\n3. Ask me to list likely failure modes so you know what to watch for going in.\n\nWant me to start with the questions, or do you have a proposal to share?",
  'Draft a stakeholder update':
    "Happy to help — you do this every week. Give me:\n\n• What model or project this is about\n• 2–3 bullets: what moved, what's blocked, what's next\n\nI'll turn it into a tight exec summary you can paste into Slack or your weekly doc. Or say 'give me a template' and I'll give you a reusable format for every week.",
  'What skills should I grow next?':
    "Looking at your task list, your role is actively growing Code review, PyTorch, and ML system design. Here's where I'd focus:\n\n1. AI-assisted code review — you're doing PR review manually at 5 hrs/week. Upskilling here has the fastest time-back payoff.\n2. Experiment design — you're already using AI on experimentation (8 hrs/week). Structured hypothesis design would compound that.\n\nWant specific resources or a learning plan for either?",
  'How can AI help with PR reviews?':
    "You spend 5 hrs/week on Model PR review, currently manual. Here's where AI fits best:\n\n• Pre-read: A bot catches tensor-shape issues, style nits, and data-handling bugs before you open the PR. Most leads save 1–2 hrs/week.\n• Diff summary: 'What does this PR do in plain English?' — saves you from re-reading large diffs.\n• Auto-triage: Route PRs by complexity so you know which ones actually need your eyes.\n\nWant to walk through setting this up for your repo?",
  'Summarize my experiment notes':
    "Paste your notes or bullet points from the last run here and I'll format them into a clean summary. I can write it as:\n\n• A research doc (Notion or Confluence-ready)\n• A Slack update for async teammates\n• A W&B run annotation\n\nWhat format works best, or just paste the notes and I'll ask?",
}

const DEFAULT_RESPONSE =
  "Got it. I can see your task list — you're spending the most time on code review, experimentation, docs, and cross-functional updates. Tell me more about what you're trying to work through and I'll dig in with you."

// Task-specific coaching responses, keyed by task ID
const TASK_COACHING_RESPONSES: Record<string, string> = {
  'pr-review':
    "You're at 5 hrs/week on PR review, currently manual — that's a high-value place to start. The fastest win is getting a bot to pre-read PRs so you focus on modeling judgment, not mechanics.\n\nFirst action: install a PR bot on one low-stakes internal repo this week. Not the serving path — somewhere a false positive isn't a disaster. Run one PR through it and notice what it caught vs. what you added. That tells you where to tune it.\n\nWant me to walk through the setup, or start by picking which repo?",
  'experimentation':
    "You're already using AI here — good foundation. The next level is bringing it in earlier, not just to speed up what you're already doing.\n\nBefore your next training run: tell Claude the problem you're solving and ask for 3 experiments you haven't tried. You'll know most of them, but one will be genuinely new.\n\nAlso try pasting your last run's loss curves and asking 'what's the most likely explanation for this pattern?' Compare its read to yours. After a few runs, it sharpens your diagnostic instincts.\n\nWhat's your next experiment? Let's start there.",
  'docs':
    "The shift here is from writing to editing. Most of the time you spend on docs is the blank-page problem — once you have a draft, editing is fast.\n\nThe workflow: jot your key points as bullet points, paste them into Claude with 'write a design doc from this,' then edit what it gives you. The edit takes 20 minutes instead of 90.\n\nProtect the substance — insights, tradeoffs, the 'why this matters' that only you know. AI handles structure and prose. You handle judgment. Keep it that way.\n\nGot something you're working on now? Paste your notes and let's draft it.",
  'serving':
    "You're doing this manually at 3 hrs/week. The scaffolding is the easiest thing to hand off — FastAPI endpoints, container configs, inference boilerplate.\n\nStart here: next time you're writing a new endpoint, open Cursor or Claude and describe what it needs to do. Let it scaffold the first version. Your job becomes reviewing and adjusting, not writing from scratch.\n\nFor the review piece, try pasting your inference code and asking 'what are the most likely memory and latency bottlenecks here?' It's faster than profiling blind.\n\nWhat's coming up next in serving that we could practice this on?",
  'stakeholder':
    "You're already using AI on exec summaries — you're ahead. The next step is making it even faster by giving it better raw material.\n\nThe pattern that works: right after your model run or team sync, spend 3 minutes writing down what moved, what regressed, and what's next. Paste those bullets into Claude with your stakeholder list. It drafts a summary calibrated to the audience.\n\nThe part to protect: the judgment call on what to emphasize and what to leave out. That's yours.\n\nWhat's the next update you need to send? We can draft it together right now.",
  'sprint':
    "Sprint planning is mostly boilerplate — velocity tracking, capacity math, translating priorities into tickets. That's exactly what AI handles well.\n\nHere's a workflow to try: before your next planning session, share your backlog, team capacity, and top 3 goals with Claude. Ask it to draft the sprint doc and flag any scope risks. You'll spend the meeting on decisions, not admin.\n\nFor ticket descriptions, try: one sentence of intent → Claude expands it into a proper ticket. Takes 30 seconds per ticket instead of 5 minutes.\n\nWhen's your next planning session? Let's prep for it.",
  '1on1':
    "1:1s are yours — AI doesn't sit in the room. But it can make the 10 minutes before and after more useful.\n\nBefore: share what you know about the person's current projects and ask Claude for 2–3 questions you haven't asked lately. Use one if it fits.\n\nAfter: jot a few notes while it's fresh, then once a month ask Claude to surface patterns across your notes. It'll catch things like 'you've talked about the same blocker three times' that are easy to miss week to week.\n\nWho's the 1:1 you're thinking about most right now?",
  'arch-review':
    "Your job in architecture reviews is to bring the judgment that nobody else can. AI can do the prep work that currently eats 20–30 minutes before each session.\n\nBefore your next review: paste the proposal and ask Claude for likely failure modes in plain language. Then ask for 5 probing questions. You'll probably already know the answers — but having them written sharpens your thinking.\n\nProtect the decision. AI preps you; you decide.\n\nGot an architecture review coming up? Share the proposal and let's prep for it.",
  'hiring':
    "Hiring judgment stays human — AI isn't evaluating your candidates. But it can sharpen your process.\n\nBefore interviews: give Claude the role requirements and ask it to suggest follow-up questions for the technical topics. You pick the two or three that feel right.\n\nAfter: summarize your notes while the interview is fresh, then before calibration paste everyone's summaries and ask Claude to surface consistent themes or divergences. Reduces anchoring on the loudest voice in the room.\n\nWhat's coming up in your hiring process this week?",
  'perf':
    "Written feedback is yours — don't outsource the substance. But AI is useful at two specific moments.\n\nFirst: before you write, search your 1:1 notes and ask Claude to surface 3–4 specific examples from the year. Stops recency bias.\n\nSecond: after you draft, paste it and ask 'where am I being vague?' and 'does this use always/never language?' Those are the two most common feedback weaknesses. It's a fast copy-edit pass.\n\nWho's review is coming up? We can work through the example-surfacing step right now.",
  'evals':
    "This is the task that should mostly not be yours. The pattern is regular, the data is structured, and the format doesn't change — it's textbook automation.\n\nFirst move: set up threshold-based alerting so you only get notified when something regresses. Stop reviewing every passing run.\n\nSecond: have a conversation with your manager about whether the platform team should own the pipeline. Frame it around what you could do with those 4 hours instead.\n\nWant help structuring that conversation with your manager?",
  'oncall':
    "Handoff notes are a great automation candidate — same format, same data sources, every week.\n\nThe workflow: PagerDuty + Slack AI can draft the handoff for you. You verify the key points and post. That's 5 minutes instead of 30.\n\nIf your team doesn't have Slack AI: paste the incident timeline into Claude with your standard handoff template and it'll fill it in.\n\nWant help building the template or talking through the automation setup?",
  'dataset':
    "Spot-checking every batch is the bottleneck — the goal is exception-only review.\n\nSet a quality threshold with your vendor. Batches that pass automatically clear. Batches that fail come to you. You stop touching the ones that are fine.\n\nFor the labeling guide: next time you see a common dispute, paste the edge case into Claude and ask it to suggest a clearer guideline. Better guidelines → fewer disputes → fewer batches to review.\n\nWhat's the most common quality issue you're seeing right now?",
}

type Message = { role: 'user' | 'ai'; text: string }

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
    <>
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
    </>
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
      setMessages(prev => [...prev, { role: 'ai', text: response }])
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
      setMessages(prev => [...prev, { role: 'ai', text: response }])
    }, 900)
  }

  return (
    <>
      {messages.length === 0 && !coachingTaskId && (
        <CoachMessage>
          What's on your mind? I can help you unblock something, draft an update, prep for a meeting, or think through your week.
        </CoachMessage>
      )}

      {messages.map((msg, i) =>
        msg.role === 'ai' ? (
          <CoachMessage key={i}>
            <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
          </CoachMessage>
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
            <div className="coach-panel-title">AI Work Coach</div>
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
