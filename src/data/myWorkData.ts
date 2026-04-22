export type IdeaColor = 'lavender' | 'sage' | 'peach'

export interface CoachPick {
  quip: string
  headline: string
  body: string
  primaryCtaLabel: string
  secondaryCtaLabel: string
  durationHint: string
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
  quip:
    "Hey {firstName} — want to jump on a quick coaching session? I'll ask a few questions about how your team reviews PRs, then help you set this up the right way for your workflow.",
  headline: 'Let AI pre-read your model PRs.',
  body: "You spend about 5 hours a week on code review — a lot of it ML plumbing changes. AI can flag data-handling bugs, tensor-shape issues, and style nits before you even open the PR, so you can focus on the modeling judgment only you can make. Most leads save an hour or two their first week.",
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
