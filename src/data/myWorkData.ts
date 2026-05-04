export type IdeaColor = 'lavender' | 'sage' | 'peach'

export interface CoachPickOutcome {
  icon: string
  label: string
  bold: string
}

export interface CoachPick {
  eyebrow?: string
  quip: string
  headline: string
  desc: string
  body: string
  outcomes?: CoachPickOutcome[]
  primaryCtaLabel: string
  secondaryCtaLabel: string
  durationHint?: string
  videoCaption: string
}

export interface Idea {
  id: string
  icon: string
  color: IdeaColor
  title: string
  body: string
  ctaLabel: string
  ctaAction?: 'open-coach-chat'
}

export type SkillVariant = 'default' | 'match'
export interface TaskSkill {
  name: string
  variant: SkillVariant
}

export type TaskStatus = 'try' | 'using'
export interface TaskRowData {
  id: string
  icon: string
  name: string
  skills: TaskSkill[]
  hoursPerWeek: number
  status?: TaskStatus
}

export type TaskGroupKind = 'help' | 'you' | 'off'
export interface TaskGroup {
  kind: TaskGroupKind
  icon: string
  title: string
  description: string
  rows: TaskRowData[]
}

export interface CheckInOption {
  emoji?: string
  label: string
}
export interface CheckInQuestion {
  id: string
  label: string
  kind: 'single' | 'text'
  options?: CheckInOption[]
  placeholder?: string
}

export type StepState = 'done' | 'active' | 'pending'
export interface WalkthroughStep {
  id: string
  title: string
  body: string
  link?: { label: string; href?: string }
  ctaLabel?: string
  ctaIcon?: string
  state: StepState
}

export interface ChatSuggestion {
  id: string
  emoji: string
  text: string
}

export const COACH_PICK: CoachPick = {
  eyebrow: 'One small thing to try this week',
  quip:
    "Hey {firstName} — want to jump on a quick coaching session? I'll ask a few questions about how your team reviews PRs, then help you set this up the right way for your workflow.",
  headline: 'Let AI pre-read your model PRs.',
  desc: 'Flag bugs and style issues before you open the PR.',
  body: "You spend about 5 hours a week on code review — a lot of it ML plumbing changes. AI can flag data-handling bugs, tensor-shape issues, and style nits before you even open the PR, so you can focus on the modeling judgment only you can make. Most leads save an hour or two their first week.",
  outcomes: [
    { icon: 'schedule', bold: '~90 min', label: ' back each week' },
    { icon: 'workspace_premium', bold: '+1 skill:', label: ' AI-assisted code review' },
  ],
  primaryCtaLabel: 'Start coaching session',
  secondaryCtaLabel: 'Maybe later',
  durationHint: "~8 min · I'll ask, you answer, we tune it together",
  videoCaption: 'Tell me how your team reviews PRs today…',
}

export const IDEAS: Idea[] = [
  {
    id: 'research-doc',
    icon: 'article',
    color: 'lavender',
    title: 'Turn experiment notes into a research doc.',
    body: 'Jot the bones from your last training run, let AI draft the write-up — you edit. Your team gets the findings sooner.',
    ctaLabel: 'Try it',
  },
  {
    id: 'eval-summary',
    icon: 'science',
    color: 'sage',
    title: 'Auto-summarize your eval runs.',
    body: 'Point AI at your W&B dashboard, get a plain-English summary of what moved and what regressed. Great for async updates.',
    ctaLabel: 'Try it',
  },
  {
    id: 'meeting-prep',
    icon: 'calendar_today',
    color: 'peach',
    title: "Prep for this week's meetings with me.",
    body: "Your Tuesday model architecture review and Thursday 1:1 with Priya are on deck. I can draft talking points or rehearse with you.",
    ctaLabel: 'Prep together',
    ctaAction: 'open-coach-chat',
  },
]

export const TASK_GROUPS: TaskGroup[] = [
  {
    kind: 'help',
    icon: 'auto_awesome',
    title: 'AI can help here',
    description: "You're in the driver's seat — AI just takes a pass first.",
    rows: [
      {
        id: 'pr-review',
        icon: 'difference',
        name: 'Model PR review',
        skills: [
          { name: 'Code review', variant: 'match' },
          { name: 'Python', variant: 'default' },
          { name: 'PyTorch', variant: 'match' },
        ],
        hoursPerWeek: 5,
        status: 'try',
      },
      {
        id: 'experimentation',
        icon: 'science',
        name: 'Model experimentation',
        skills: [
          { name: 'PyTorch', variant: 'match' },
          { name: 'Distributed training', variant: 'default' },
          { name: 'Experiment design', variant: 'match' },
        ],
        hoursPerWeek: 8,
        status: 'using',
      },
      {
        id: 'research-docs',
        icon: 'article',
        name: 'Research & design docs',
        skills: [
          { name: 'Technical writing', variant: 'default' },
          { name: 'ML system design', variant: 'match' },
        ],
        hoursPerWeek: 3,
        status: 'try',
      },
      {
        id: 'model-serving',
        icon: 'hub',
        name: 'Model serving & deployment',
        skills: [
          { name: 'Model serving', variant: 'match' },
          { name: 'FastAPI', variant: 'default' },
          { name: 'GPU inference', variant: 'default' },
        ],
        hoursPerWeek: 3,
        status: 'try',
      },
      {
        id: 'stakeholder-updates',
        icon: 'campaign',
        name: 'Stakeholder & product updates',
        skills: [
          { name: 'Communication', variant: 'default' },
          { name: 'Product thinking', variant: 'default' },
        ],
        hoursPerWeek: 2,
        status: 'using',
      },
      {
        id: 'sprint-planning',
        icon: 'calendar_today',
        name: 'Sprint planning',
        skills: [
          { name: 'Agile', variant: 'default' },
          { name: 'Estimation', variant: 'default' },
          { name: 'Prioritization', variant: 'default' },
        ],
        hoursPerWeek: 2,
        status: 'try',
      },
    ],
  },
  {
    kind: 'you',
    icon: 'favorite',
    title: 'This is all you',
    description: 'The work only you can do. Protect this time.',
    rows: [
      {
        id: 'coaching',
        icon: 'forum',
        name: '1:1s and team coaching',
        skills: [
          { name: 'Coaching', variant: 'match' },
          { name: 'Active listening', variant: 'default' },
          { name: 'Feedback', variant: 'default' },
        ],
        hoursPerWeek: 5,
      },
      {
        id: 'architecture',
        icon: 'architecture',
        name: 'ML architecture reviews',
        skills: [
          { name: 'ML system design', variant: 'match' },
          { name: 'Distributed training', variant: 'default' },
          { name: 'Trade-off analysis', variant: 'default' },
        ],
        hoursPerWeek: 2,
      },
      {
        id: 'hiring',
        icon: 'person_search',
        name: 'Hiring & interviewing ML eng',
        skills: [
          { name: 'Interviewing', variant: 'default' },
          { name: 'Assessment', variant: 'default' },
        ],
        hoursPerWeek: 3,
      },
      {
        id: 'perf-reviews',
        icon: 'rate_review',
        name: 'Performance reviews',
        skills: [
          { name: 'Feedback', variant: 'default' },
          { name: 'Calibration', variant: 'default' },
        ],
        hoursPerWeek: 2,
      },
    ],
  },
  {
    kind: 'off',
    icon: 'bolt',
    title: "Let's take these off your plate",
    description: 'These can run on their own — chat with your manager about automating them.',
    rows: [
      {
        id: 'model-evals',
        icon: 'verified',
        name: 'Model evals & regression testing',
        skills: [
          { name: 'Evaluation', variant: 'default' },
          { name: 'Benchmarking', variant: 'default' },
          { name: 'Quality engineering', variant: 'default' },
        ],
        hoursPerWeek: 4,
      },
      {
        id: 'oncall-handoff',
        icon: 'swap_horiz',
        name: 'On-call handoff notes',
        skills: [
          { name: 'Incident response', variant: 'default' },
          { name: 'Documentation', variant: 'default' },
        ],
        hoursPerWeek: 1,
      },
      {
        id: 'dataset-qa',
        icon: 'table_view',
        name: 'Dataset QA & labeling review',
        skills: [
          { name: 'Data management', variant: 'default' },
          { name: 'Labeling ops', variant: 'default' },
        ],
        hoursPerWeek: 2,
      },
    ],
  },
]

export const CHECKIN_QUESTIONS: CheckInQuestion[] = [
  {
    id: 'feel',
    label: '1 · How did this week feel?',
    kind: 'single',
    options: [
      { emoji: '😩', label: 'Heavy' },
      { emoji: '🙂', label: 'Fine' },
      { emoji: '✨', label: 'Lighter than usual' },
      { emoji: '🚀', label: 'Best in a while' },
    ],
  },
  {
    id: 'help',
    label: '2 · Where is AI helping you most?',
    kind: 'single',
    options: [
      { label: 'Writing docs' },
      { label: 'Code review' },
      { label: 'Boilerplate' },
      { label: 'Planning' },
      { label: 'Still figuring it out' },
    ],
  },
  {
    id: 'clunky',
    label: "3 · What's still clunky? (optional)",
    kind: 'text',
    placeholder: 'e.g. The suggestions for design docs feel too generic…',
  },
]

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'pick-repo',
    title: 'Pick one repo to experiment with',
    body: 'Start small — an internal tool, not the serving path.',
    link: { label: 'embedding-sandbox' },
    state: 'done',
  },
  {
    id: 'install-bot',
    title: 'Install the review bot',
    body: "One click from your repo settings. I'll link you straight to the right page.",
    ctaLabel: 'Open settings',
    ctaIcon: 'open_in_new',
    state: 'active',
  },
  {
    id: 'pick-flags',
    title: 'Pick what it should flag',
    body: 'For ML PRs I recommend starting with data-handling bugs, tensor-shape mismatches, and style. You can always add more later.',
    state: 'pending',
  },
  {
    id: 'test-pr',
    title: 'Open a tiny test PR',
    body: "A one-line change is perfect. You'll see the bot's comments within about 30 seconds.",
    state: 'pending',
  },
  {
    id: 'feedback',
    title: 'Tell me how it went',
    body: "Thumbs up, thumbs down, or a quick note — I'll use it to tune your next idea.",
    state: 'pending',
  },
]

export const CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { id: 'eval-writeup', emoji: '📝', text: 'Draft the eval write-up' },
  { id: 'sprint-plan', emoji: '🧭', text: "Plan next sprint's experiments" },
  { id: 'tough-11', emoji: '💬', text: 'Rehearse a tough 1:1' },
  { id: 'why-pr', emoji: '🤔', text: 'Why did you recommend PR review?' },
]

export const COACH_GREETING_PR =
  "Great — let's do this together. I'll ask a few quick questions to understand how your team works, then we'll turn on AI pre-review in a way that actually fits. No prep needed, just answer honestly."
export const COACH_GREETING_CHECKIN =
  'Thanks for checking in! Three quick questions — honest answers help me be more useful. No wrong answers, and nothing gets shared with your manager.'
export const COACH_GREETING_CHAT =
  "Hey {firstName} — what's on your mind? I can help you unblock a training run, draft something for the team, or just think out loud together."

// ——— Flat task list (for My Work page state management) ———

export type TaskCat = 'help' | 'you' | 'off'

export interface TaskTool {
  letter: string
  name: string
  use: string
}

export interface Task {
  id: string
  cat: TaskCat
  name: string
  icon: string
  hours: number
  tag?: 'try' | 'using'
  category: string
  skills: [string, '' | 'match'][]
  tools?: TaskTool[]
  banner?: { icon: string; text: string }
  desc?: string
}

export const TASKS_STORAGE_KEY = 'tm:my-work-tasks-v2'

export const INITIAL_TASKS: Task[] = [
  {
    id: 'pr-review', cat: 'help', name: 'Model PR review', icon: 'difference', hours: 5, tag: 'try',
    category: 'Recurring · weekly',
    skills: [['Code review', 'match'], ['Python', ''], ['PyTorch', 'match']],
    tools: [
      { letter: 'C', name: 'Copilot Review', use: 'Inline comments' },
      { letter: 'G', name: 'GitHub PR bot', use: 'Auto-triage' },
      { letter: 'Cl', name: 'Claude', use: 'Deep-dive on tricky PRs' },
    ],
    banner: { icon: 'auto_awesome', text: '<b>AI can help here.</b> Pre-reads catch the mechanical stuff so you focus on modeling judgment. Most leads save an hour or two the first week.' },
    desc: "Reviewing your team's pull requests — mostly ML plumbing, data handling, tensor shapes, training loops, and the occasional framework upgrade. You're the last line of defense before code hits main.",
  },
  {
    id: 'experimentation', cat: 'help', name: 'Model experimentation', icon: 'science', hours: 8, tag: 'using',
    category: 'Recurring · daily',
    skills: [['PyTorch', 'match'], ['Distributed training', ''], ['Experiment design', 'match']],
    tools: [
      { letter: 'W', name: 'Weights & Biases', use: 'Run tracking' },
      { letter: 'Cl', name: 'Claude', use: 'Hypothesis generation' },
      { letter: 'Cu', name: 'Cursor', use: 'Training code' },
    ],
    banner: { icon: 'check_circle', text: "<b>You're already using AI here.</b> Keep tuning your prompts — small upgrades compound." },
    desc: 'Designing, running, and iterating on model training experiments. Sweeps, ablations, hyperparameter search, and reading tea leaves from loss curves.',
  },
  {
    id: 'docs', cat: 'help', name: 'Research & design docs', icon: 'article', hours: 3, tag: 'try',
    category: 'Recurring · weekly',
    skills: [['Technical writing', ''], ['ML system design', 'match']],
    tools: [
      { letter: 'Cl', name: 'Claude', use: 'Draft from notes' },
      { letter: 'N', name: 'Notion AI', use: 'Polish & format' },
    ],
    banner: { icon: 'auto_awesome', text: '<b>AI can help here.</b> Feed it your notes and bullet points — it drafts, you edit. Docs ship 2–3× faster.' },
    desc: 'Writing research memos, design docs, and post-mortems. The writing that helps your team align and helps future-you remember why.',
  },
  {
    id: 'serving', cat: 'help', name: 'Model serving & deployment', icon: 'hub', hours: 3, tag: 'try',
    category: 'Recurring · weekly',
    skills: [['Model serving', 'match'], ['FastAPI', ''], ['GPU inference', '']],
    tools: [
      { letter: 'Cu', name: 'Cursor', use: 'FastAPI scaffolding' },
      { letter: 'Cl', name: 'Claude', use: 'Review inference code' },
    ],
    banner: { icon: 'auto_awesome', text: "<b>AI can help here.</b> It's great at writing the serving boilerplate and spotting inference bottlenecks." },
    desc: 'Getting models out of research and into production. Containers, endpoints, autoscaling, latency budgets, and GPU cost optimization.',
  },
  {
    id: 'stakeholder', cat: 'help', name: 'Stakeholder & product updates', icon: 'campaign', hours: 2, tag: 'using',
    category: 'Recurring · weekly',
    skills: [['Communication', ''], ['Product thinking', '']],
    tools: [
      { letter: 'Cl', name: 'Claude', use: 'Exec summaries' },
      { letter: 'S', name: 'Slack AI', use: 'Thread recaps' },
    ],
    banner: { icon: 'check_circle', text: "<b>You're already using AI here.</b> Your exec summaries are tighter than they were 3 months ago." },
    desc: "Updating PMs, eng leadership, and cross-functional partners on model progress. Translating research-speak into 'what does this mean for the product.'",
  },
  {
    id: 'sprint', cat: 'help', name: 'Sprint planning', icon: 'calendar_today', hours: 2, tag: 'try',
    category: 'Recurring · biweekly',
    skills: [['Agile', ''], ['Estimation', ''], ['Prioritization', '']],
    tools: [
      { letter: 'L', name: 'Linear', use: 'Issue tracking' },
      { letter: 'Cl', name: 'Claude', use: 'Draft sprint goals' },
    ],
    banner: { icon: 'auto_awesome', text: '<b>AI can help here.</b> It can draft the sprint doc from your running notes and even suggest capacity trade-offs.' },
    desc: 'Planning the next 2 weeks of team work. Scoping experiments, estimating effort, balancing research with production needs.',
  },
  {
    id: '1on1', cat: 'you', name: '1:1s and team coaching', icon: 'forum', hours: 5,
    category: 'Recurring · weekly',
    skills: [['Coaching', 'match'], ['Active listening', ''], ['Feedback', '']],
    tools: [{ letter: 'N', name: 'Notion', use: '1:1 notes (private)' }],
    banner: { icon: 'favorite', text: '<b>This is all you.</b> Coaching humans is human work — protect this time from automation creep.' },
    desc: "1:1s with your 6 directs. Career conversations, unblocking, feedback, and the quiet check-ins that matter more than the loud ones.",
  },
  {
    id: 'arch-review', cat: 'you', name: 'ML architecture reviews', icon: 'architecture', hours: 2,
    category: 'Recurring · weekly',
    skills: [['ML system design', 'match'], ['Distributed training', ''], ['Trade-off analysis', '']],
    tools: [
      { letter: 'M', name: 'Miro', use: 'Diagrams' },
      { letter: 'N', name: 'Notion', use: 'Proposals' },
    ],
    banner: { icon: 'favorite', text: '<b>This is all you.</b> Judgment on multi-year trade-offs needs a human who knows the team and the codebase.' },
    desc: 'Reviewing architecture proposals from the team. Training infra, serving paths, data pipelines — the decisions that are hard to reverse.',
  },
  {
    id: 'hiring', cat: 'you', name: 'Hiring & interviewing ML eng', icon: 'person_search', hours: 3,
    category: 'Recurring · weekly',
    skills: [['Interviewing', ''], ['Assessment', '']],
    tools: [{ letter: 'G', name: 'Greenhouse', use: 'Scorecards' }],
    banner: { icon: 'favorite', text: '<b>This is all you.</b> Candidate judgment stays human — AI is not invited to this part.' },
    desc: 'Interviewing ML engineer candidates. Technical screens, system design rounds, debriefs, and calibrating with the hiring committee.',
  },
  {
    id: 'perf', cat: 'you', name: 'Performance reviews', icon: 'rate_review', hours: 2,
    category: 'Cyclical · half-yearly',
    skills: [['Feedback', ''], ['Calibration', '']],
    tools: [{ letter: 'L', name: 'Lattice', use: 'Review cycle' }],
    banner: { icon: 'favorite', text: '<b>This is all you.</b> Writing real feedback about real people — nobody can ghostwrite this for you.' },
    desc: 'Performance reviews for your directs. Writing the narrative, calibrating with peers, and having the conversations.',
  },
  {
    id: 'evals', cat: 'off', name: 'Model evals & regression testing', icon: 'verified', hours: 4,
    category: 'Recurring · weekly',
    skills: [['Evaluation', ''], ['Benchmarking', ''], ['Quality engineering', '']],
    tools: [
      { letter: 'W', name: 'W&B', use: 'Benchmark suite' },
      { letter: 'A', name: 'Airflow', use: 'Scheduled runs' },
    ],
    banner: { icon: 'bolt', text: '<b>Take this off your plate.</b> Eval runs can be fully automated — talk to your manager about handing this to the platform team or an agent.' },
    desc: 'Running weekly regression evals across your model portfolio. Comparing checkpoints, flagging regressions, filing issues.',
  },
  {
    id: 'oncall', cat: 'off', name: 'On-call handoff notes', icon: 'swap_horiz', hours: 1,
    category: 'Recurring · weekly',
    skills: [['Incident response', ''], ['Documentation', '']],
    tools: [
      { letter: 'P', name: 'PagerDuty', use: 'Incident feed' },
      { letter: 'S', name: 'Slack AI', use: 'Summarize threads' },
    ],
    banner: { icon: 'bolt', text: '<b>Take this off your plate.</b> Handoff notes can be auto-generated from PagerDuty + your team Slack.' },
    desc: "Writing the weekly on-call handoff — what happened, what's still open, what the next person needs to watch.",
  },
  {
    id: 'dataset', cat: 'off', name: 'Dataset QA & labeling review', icon: 'table_view', hours: 2,
    category: 'Recurring · weekly',
    skills: [['Data management', ''], ['Labeling ops', '']],
    tools: [
      { letter: 'L', name: 'Label Studio', use: 'Review UI' },
      { letter: 'S', name: 'Scale AI', use: 'Vendor portal' },
    ],
    banner: { icon: 'bolt', text: "<b>Take this off your plate.</b> Spot-checking labels is perfect agent work — set thresholds, review exceptions only." },
    desc: "QA'ing labeled datasets from your vendor. Spot-checking batches, filing quality issues, updating labeling guides.",
  },
]
