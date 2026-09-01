// ─── Types ────────────────────────────────────────────────────────────────────

export type ThreadStatus = 'active' | 'stalled' | 'completed'

export type PastSession = {
  id: string
  date: string
  title: string
  snippet: string
  source?: string // e.g. "Slack", "Email"
}

export type Thread = {
  id: string
  containerId: string
  title: string
  subtitle: string
  status: ThreadStatus
  tag?: 'developing' | 'showcasing'
  lastActivityDaysAgo: number
  deadlineDaysFromNow: number | null
  historyDepth: number
  score: number // computed
  // Home tile
  tileReason: string
  tileAction: string
  // Thread page
  agentMessage: string
  featuredStatus: string
  featuredDescription: string
  featuredActions: { label: string; icon: string; variant: 'primary' | 'secondary' }[]
  suggestedQuestions: string[]
  pastSessions: PastSession[]
  continuityNote: string | null
}

export type Container = {
  id: string
  label: string
  icon: string
  threads: Thread[]
  emptyInvite: string
  emptyAction: string
}

export type Nudge = {
  id: string
  text: string
  detail: string
  icon: string
  targetContainerId: string
  acceptLabel: string
}

// ─── Ranking ─────────────────────────────────────────────────────────────────

function computeScore(t: Omit<Thread, 'score'>): number {
  let score = 0
  // Momentum: stalled threads rank higher — the agent catches what self-motivation might miss
  if (t.status === 'stalled') score += 60 + Math.min(t.lastActivityDaysAgo * 3, 40)
  else if (t.status === 'active') score += 30
  // Time pressure
  if (t.deadlineDaysFromNow !== null && t.deadlineDaysFromNow <= 7) score += 50 - t.deadlineDaysFromNow * 5
  else if (t.deadlineDaysFromNow !== null && t.deadlineDaysFromNow <= 14) score += 20
  // Depth: accumulated history
  score += Math.min(t.historyDepth * 4, 20)
  return score
}

// ─── Sample data for Sarah Culhane (csm / employee@acme.com) ─────────────────

const RAW_THREADS: Omit<Thread, 'score'>[] = [
  // ── Development plan ──────────────────────────────────────────────────────
  {
    id: 'devplan-1',
    containerId: 'development-plan',
    title: 'AI-Assisted Account Management',
    subtitle: '5-module learning plan · Module 2 in progress',
    status: 'stalled',
    lastActivityDaysAgo: 10,
    deadlineDaysFromNow: null,
    historyDepth: 6,
    tileReason: 'No activity for 10 days — Module 2 (Prompt Engineering) is where most people slow down.',
    tileAction: 'Resume Module 2',
    agentMessage: "You started Module 2 — Prompt Engineering for Customer Emails — 10 days ago and haven't been back. That's usually where this gets frustrating, because the first exercise asks you to rewrite a renewal email from scratch, which takes longer than it looks. You completed Module 1 in 3 days, so the pace was good. I'd suggest starting with just the email rewrite exercise today and nothing else.",
    featuredStatus: 'Stalled · Module 2 of 5',
    featuredDescription: 'Module 1 (AI Fundamentals) completed Aug 16. Module 2 — Prompt Engineering — opened Aug 16 but no progress logged since. Modules 3–5 (QBR preparation, risk flagging, renewal forecasting) are unlocked once Module 2 is done.',
    featuredActions: [
      { label: 'Resume Module 2', icon: 'play_arrow', variant: 'primary' },
      { label: 'View full plan', icon: 'open_in_new', variant: 'secondary' },
    ],
    suggestedQuestions: [
      "What exactly is in Module 2's first exercise?",
      "How long should Module 2 take to complete?",
      "Can I skip ahead to Module 3 and come back?",
      "What skills does this plan build toward?",
    ],
    pastSessions: [
      { id: 'ps-dp-3', date: 'Aug 16', title: 'Started Module 2: Prompt Engineering', snippet: 'Opened the module, read the intro. Saved the renewal email exercise for later.', source: undefined },
      { id: 'ps-dp-2', date: 'Aug 15', title: 'Completed Module 1: AI Fundamentals', snippet: 'Finished all 4 sections. Scored 92% on the quiz. Notes saved on prompt structure.', source: undefined },
      { id: 'ps-dp-1', date: 'Aug 13', title: 'Set up learning plan', snippet: 'Selected AI-Assisted Account Management from recommended plans. Set 5-week target.', source: undefined },
    ],
    continuityNote: 'You saved a draft prompt template in Notion on Aug 17 — it might be useful for the Module 2 exercise.',
  },

  // ── Skill profile ─────────────────────────────────────────────────────────
  {
    id: 'skillgap-1',
    containerId: 'skill-profile',
    title: 'Developing: Data Analysis & Storytelling',
    subtitle: 'LinkedIn Learning path · 4.5 hrs · Not started',
    status: 'active',
    tag: 'developing' as const,
    lastActivityDaysAgo: 5,
    deadlineDaysFromNow: null,
    historyDepth: 2,
    tileReason: 'A learning path was suggested 5 days ago based on your QBR feedback pattern — not started yet.',
    tileAction: 'Start learning path',
    agentMessage: "Your last three QBRs had strong narratives but the data slides leaned on screenshots rather than synthesized charts. Your manager flagged this in your mid-year review — not as a blocker, but as the next growth edge. I found a 4.5-hour LinkedIn Learning path that covers exactly this: building a story from raw data, not just formatting it. It's split into short modules so you can do it in pieces around calls.",
    featuredStatus: 'Ready to start · 4.5 hrs total',
    featuredDescription: '4-module path: (1) Reading data critically, (2) Choosing the right chart, (3) Building a narrative arc, (4) Presenting to executives. Estimated 4.5 hours total. Aligned to your Q4 goal: "Elevate executive communication."',
    featuredActions: [
      { label: 'Start Module 1', icon: 'school', variant: 'primary' },
      { label: 'Save for later', icon: 'bookmark', variant: 'secondary' },
    ],
    suggestedQuestions: [
      "Which module is most relevant to QBRs specifically?",
      "How does this connect to my Q4 goals?",
      "Are there any shorter alternatives?",
      "What did my manager say about data storytelling?",
    ],
    pastSessions: [
      { id: 'ps-sg-1', date: 'Aug 21', title: 'Skill gap identified', snippet: 'Data Analysis & Storytelling flagged as a growth area from mid-year review themes. Learning path suggested.', source: undefined },
    ],
    continuityNote: null,
  },
  {
    id: 'th-skill-2',
    containerId: 'skill-profile',
    title: 'Showcasing: Enterprise Renewal Expertise',
    subtitle: 'Visibility profile · Nexus QBR',
    status: 'active',
    tag: 'showcasing' as const,
    lastActivityDaysAgo: 1,
    deadlineDaysFromNow: null,
    historyDepth: 1,
    tileReason: 'You\'ve closed 4 enterprise renewals this year — 3 expansion deals. Surface this strength in your visibility profile.',
    tileAction: 'Update visibility profile',
    agentMessage: "You've closed 4 enterprise renewals this year — 3 expansion deals. Surface this strength in your visibility profile and the Nexus QBR.",
    featuredStatus: 'Ready to showcase',
    featuredDescription: 'Your enterprise renewal record is a standout strength. Update your visibility profile and surface it in the Nexus QBR.',
    featuredActions: [
      { label: 'Update visibility profile', icon: 'visibility', variant: 'primary' },
      { label: 'Add to Nexus QBR deck', icon: 'slideshow', variant: 'secondary' },
    ],
    suggestedQuestions: [
      'How should I frame this in my visibility profile?',
      'What metrics matter most for renewal expertise?',
      'How do I bring this up in the Nexus QBR?',
    ],
    pastSessions: [],
    continuityNote: null,
  },

  // ── Mentor ───────────────────────────────────────────────────────────────
  {
    id: 'mentor-1',
    containerId: 'mentor',
    title: 'Priya Sharma · VP Customer Success',
    subtitle: 'Zenith Technologies · Intro message sent',
    status: 'active',
    lastActivityDaysAgo: 2,
    deadlineDaysFromNow: null,
    historyDepth: 2,
    tileReason: 'Intro message sent 2 days ago — no response yet. A light follow-up is reasonable now.',
    tileAction: 'Draft follow-up',
    agentMessage: "You sent the intro to Priya Sharma on Aug 24 — it was concise and mentioned the QBR coaching angle, which was the right hook. She typically responds within 3–4 business days based on her LinkedIn activity. Two days is not late, but if you haven't heard back by Thursday, a single follow-up is appropriate. I can draft one now if you'd like — it should be even shorter than the intro.",
    featuredStatus: 'Awaiting response · Intro sent Aug 24',
    featuredDescription: 'Priya Sharma, VP Customer Success at Zenith Technologies. 12 years in enterprise CS, known for building structured QBR frameworks. Matched to you based on your Q4 goal around executive communication and your interest in scaling CS processes. Intro message sent via LinkedIn.',
    featuredActions: [
      { label: 'Draft follow-up', icon: 'edit', variant: 'primary' },
      { label: 'View Priya\'s profile', icon: 'open_in_new', variant: 'secondary' },
    ],
    suggestedQuestions: [
      "Draft a follow-up message for Priya",
      "What should my first mentorship session cover?",
      "What's a good cadence to propose?",
      "How do I make the most of a VP mentor?",
    ],
    pastSessions: [
      { id: 'ps-m-2', date: 'Aug 24', title: 'Intro message sent to Priya', snippet: 'Drafted and sent intro via LinkedIn. Mentioned QBR coaching interest and Q4 goal context.', source: 'LinkedIn' },
      { id: 'ps-m-1', date: 'Aug 22', title: 'Mentor matched', snippet: 'Priya Sharma suggested based on enterprise CS background and executive communication focus. Profile reviewed.', source: undefined },
    ],
    continuityNote: 'Priya viewed your LinkedIn profile on Aug 25 — she saw the message.',
  },

  // ── Project ──────────────────────────────────────────────────────────────
  {
    id: 'project-1',
    containerId: 'project',
    title: 'Q3 Renewal Playbook',
    subtitle: 'Team deliverable · Deadline Aug 30',
    status: 'active',
    lastActivityDaysAgo: 2,
    deadlineDaysFromNow: 4,
    historyDepth: 4,
    tileReason: 'Deadline in 4 days — shared doc is at 60%. Sections 3 and 4 still need owners.',
    tileAction: 'Open playbook',
    agentMessage: "The Q3 Renewal Playbook is due Aug 30 — that's 4 days. The shared doc is at 60% and sections 3 (Risk Signals) and 4 (QBR Talk Tracks) don't have owners yet. You have 3 accounts with renewals in Q3 that could be the worked examples in Section 3. That might be the fastest way to unblock that section rather than writing it from scratch.",
    featuredStatus: 'In progress · 60% · Due Aug 30',
    featuredDescription: 'Collaborative team deliverable covering Q3 renewal strategy. 4 sections: (1) Account segmentation — done, (2) Early warning framework — done, (3) Risk signals — needs owner, (4) QBR talk tracks — needs owner. Shared with 4 teammates.',
    featuredActions: [
      { label: 'Open shared doc', icon: 'description', variant: 'primary' },
      { label: 'Assign section owners', icon: 'person_add', variant: 'secondary' },
    ],
    suggestedQuestions: [
      "Which of my Q3 accounts should I use as the worked example?",
      "What should a risk signals section include?",
      "Can you draft an outline for Section 4?",
      "Who on the team should own Section 3?",
    ],
    pastSessions: [
      { id: 'ps-p-3', date: 'Aug 24', title: 'Team review — sections 1 & 2 approved', snippet: 'Account segmentation and early warning framework sections signed off. Sections 3 and 4 flagged as unowned.', source: undefined },
      { id: 'ps-p-2', date: 'Aug 20', title: 'Draft structure shared with team', snippet: 'Outlined 4-section structure. Assigned sections 1 and 2. Set Aug 30 deadline.', source: 'Slack' },
      { id: 'ps-p-1', date: 'Aug 18', title: 'Started Q3 Renewal Playbook', snippet: 'Kicked off based on Q2 retrospective action item. Template from CS Ops used as starting point.', source: undefined },
    ],
    continuityNote: 'Marcus mentioned in Slack on Aug 24 he can take Section 4 if you can set it up.',
  },

  // ── People connection ─────────────────────────────────────────────────────
  {
    id: 'people-1',
    containerId: 'people-connection',
    title: 'Marcus Webb · Solutions Engineer',
    subtitle: 'Connected after cross-functional sync · 1 week ago',
    status: 'active',
    lastActivityDaysAgo: 2,
    deadlineDaysFromNow: null,
    historyDepth: 2,
    tileReason: 'Marcus offered to help with the Renewal Playbook — worth a direct ask.',
    tileAction: 'Message Marcus',
    agentMessage: "You connected with Marcus Webb after the Aug 19 cross-functional sync. He mentioned in Slack that he can take Section 4 of the Renewal Playbook — his SE background means he'll have strong talk tracks for technical accounts. A direct message to confirm and share the doc would take 2 minutes and unblock a deadline.",
    featuredStatus: 'New connection · Aug 19',
    featuredDescription: 'Marcus Webb, Solutions Engineer on the Enterprise team. Overlaps with your accounts on the technical side — 3 shared accounts. Connected after the Aug 19 product-CS sync. Has offered to contribute to the Q3 Renewal Playbook.',
    featuredActions: [
      { label: 'Message Marcus', icon: 'message', variant: 'primary' },
      { label: 'View shared accounts', icon: 'corporate_fare', variant: 'secondary' },
    ],
    suggestedQuestions: [
      "Draft a message asking Marcus to own Section 4",
      "What accounts do Marcus and I share?",
      "How can I collaborate with SEs more effectively?",
    ],
    pastSessions: [
      { id: 'ps-pc-2', date: 'Aug 24', title: 'Marcus offered to help with Playbook', snippet: 'Mentioned in #cs-se Slack channel he could take Section 4 if someone sets it up.', source: 'Slack' },
      { id: 'ps-pc-1', date: 'Aug 19', title: 'Connected at cross-functional sync', snippet: 'Met at the product-CS alignment meeting. Shared 3 enterprise accounts. Added to network.', source: undefined },
    ],
    continuityNote: 'See Slack thread from Aug 24 in #cs-se for full context.',
  },
]

export const THREADS: Thread[] = RAW_THREADS.map(t => ({ ...t, score: computeScore(t) }))

// ─── Skill profile: passive skills ────────────────────────────────────────────

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type SkillStatus = 'gap' | 'strength' | 'growing'

export type SkillEntry = {
  id: string
  name: string
  category: string
  proficiency: SkillProficiency
  status: SkillStatus
}

export const SARAH_SKILLS: SkillEntry[] = [
  // Customer Success core
  { id: 'sk-renewal',    name: 'Enterprise Renewal Management', category: 'Customer Success', proficiency: 'expert',        status: 'strength' },
  { id: 'sk-qbr',        name: 'QBR Facilitation',             category: 'Customer Success', proficiency: 'advanced',       status: 'strength' },
  { id: 'sk-onboarding', name: 'Customer Onboarding',          category: 'Customer Success', proficiency: 'advanced',       status: 'strength' },
  { id: 'sk-health',     name: 'Account Health Monitoring',    category: 'Customer Success', proficiency: 'advanced',       status: 'strength' },
  { id: 'sk-churn',      name: 'Churn Risk Identification',    category: 'Customer Success', proficiency: 'intermediate',   status: 'growing'  },
  // Data & Analytics
  { id: 'sk-data',       name: 'Data Analysis & Storytelling', category: 'Data & Analytics', proficiency: 'beginner',       status: 'gap'      },
  { id: 'sk-sql',        name: 'SQL Basics',                   category: 'Data & Analytics', proficiency: 'beginner',       status: 'gap'      },
  { id: 'sk-dashboards', name: 'Dashboard Interpretation',     category: 'Data & Analytics', proficiency: 'intermediate',   status: 'growing'  },
  // Leadership & Communication
  { id: 'sk-exec-comm',  name: 'Executive Communication',      category: 'Leadership',       proficiency: 'advanced',       status: 'strength' },
  { id: 'sk-influence',  name: 'Influence Without Authority',  category: 'Leadership',       proficiency: 'intermediate',   status: 'growing'  },
  { id: 'sk-mgmt',       name: 'Team Management',              category: 'Leadership',       proficiency: 'beginner',       status: 'gap'      },
  { id: 'sk-coaching-l', name: 'Coaching & Mentoring Others',  category: 'Leadership',       proficiency: 'intermediate',   status: 'growing'  },
  // Product & Technical
  { id: 'sk-product',    name: 'Product Feedback Loops',       category: 'Product',          proficiency: 'intermediate',   status: 'strength' },
  { id: 'sk-api',        name: 'API & Integration Concepts',   category: 'Product',          proficiency: 'beginner',       status: 'gap'      },
  { id: 'sk-crm',        name: 'CRM Administration (Salesforce)', category: 'Product',       proficiency: 'advanced',       status: 'strength' },
  // Business & Strategy
  { id: 'sk-biz',        name: 'Business Case Development',    category: 'Strategy',         proficiency: 'intermediate',   status: 'growing'  },
  { id: 'sk-negotiation',name: 'Negotiation',                  category: 'Strategy',         proficiency: 'advanced',       status: 'strength' },
  { id: 'sk-okr',        name: 'OKR Setting & Tracking',       category: 'Strategy',         proficiency: 'intermediate',   status: 'growing'  },
]

export const SKILL_PROFILE_PROMPTS = [
  'What skills should I prioritize to reach CS Manager?',
  'Show me where I\'m strongest vs. where I\'m behind',
  'Suggest a project that builds my data analysis skills',
  'How does my skill set compare to my peers?',
]

// ─── Mentor: passive suggestions ──────────────────────────────────────────────

export type MentorSuggestion = {
  id: string
  name: string
  role: string
  company: string
  initials: string
  why: string
  focus: string
  actions: ('message' | 'request-intro')[]
}

export const MENTOR_SUGGESTIONS: MentorSuggestion[] = [
  {
    id: 'ms-1',
    name: 'Layla Nasser',
    role: 'VP Customer Success',
    company: 'Helios Cloud',
    initials: 'LN',
    why: 'Made the Senior CSM → manager jump 2 years ago — actively mentors ICs targeting that move.',
    focus: 'Leadership transition, first-time management',
    actions: ['request-intro'],
  },
  {
    id: 'ms-2',
    name: 'Dev Kapoor',
    role: 'CS Manager',
    company: 'Acme Corp',
    initials: 'DK',
    why: 'Runs the team you\'d most likely step into — knows the org dynamics firsthand.',
    focus: 'Internal navigation, promotion readiness',
    actions: ['message', 'request-intro'],
  },
  {
    id: 'ms-3',
    name: 'Sofia Reyes',
    role: 'Data Lead, CS',
    company: 'Acme Corp',
    initials: 'SR',
    why: 'Closed the same data gap you\'re working on — built the analytics layer your team now uses.',
    focus: 'Data storytelling, SQL for CSMs',
    actions: ['message'],
  },
]

// ─── Coaching ─────────────────────────────────────────────────────────────────

export type CoachingSession = {
  id: string
  date: string
  title: string
  mode: 'voice' | 'chat'
  durationMin: number
  snippet: string
  followUpPrompts: string[]
}

export const COACHING_PAST_SESSIONS: CoachingSession[] = [
  {
    id: 'cs-1',
    date: 'Aug 22',
    title: 'Preparing for the QBR with Nexus Corp',
    mode: 'voice',
    durationMin: 28,
    snippet: 'Worked through the narrative structure. Identified 3 risk signals to address proactively. Practiced the opening 2 minutes.',
    followUpPrompts: ['Continue QBR prep', 'Review what we practiced', 'Build on the risk signal framework'],
  },
  {
    id: 'cs-2',
    date: 'Aug 18',
    title: 'Handling a difficult renewal conversation',
    mode: 'chat',
    durationMin: 15,
    snippet: 'Explored pushback scenarios for price-sensitive renewals. Drafted 3 response frameworks.',
    followUpPrompts: ['Practice a renewal scenario', 'Refine the response frameworks', 'Apply this to the Avery account'],
  },
  {
    id: 'cs-3',
    date: 'Aug 12',
    title: 'Setting my Q4 growth intentions',
    mode: 'voice',
    durationMin: 22,
    snippet: 'Reflected on Q3. Identified 2 patterns holding back growth. Set 3 specific intentions for Q4.',
    followUpPrompts: ['Check in on Q4 intentions', 'Revisit the patterns we identified', 'Set a goal for this week'],
  },
]

export const COACHING_SUGGESTED_PROMPTS = [
  "Help me prep for a tough conversation",
  "I want to reflect on something from this week",
  "Coach me through a QBR structure",
  "I'm feeling stuck — let's talk",
]

export type CoachingTimeSlot = {
  id: string
  day: string
  time: string
  duration: string
}

export const COACHING_TIME_SLOTS: CoachingTimeSlot[] = [
  { id: 'slot-1', day: 'Today', time: '3:30 PM', duration: '30 min' },
  { id: 'slot-2', day: 'Tomorrow', time: '9:00 AM', duration: '30 min' },
  { id: 'slot-3', day: 'Thu Aug 28', time: '12:00 PM', duration: '45 min' },
]

// ─── Containers (always visible, even when empty) ─────────────────────────────

export const CONTAINERS: Container[] = [
  {
    id: 'development-plan',
    label: 'Development plan',
    icon: 'school',
    threads: THREADS.filter(t => t.containerId === 'development-plan'),
    emptyInvite: 'No active plan yet.',
    emptyAction: 'Start a plan',
  },
  {
    id: 'skill-profile',
    label: 'Skill profile',
    icon: 'psychology',
    threads: THREADS.filter(t => t.containerId === 'skill-profile'),
    emptyInvite: 'No active skill actions yet.',
    emptyAction: 'Start developing a skill',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    icon: 'supervisor_account',
    threads: THREADS.filter(t => t.containerId === 'mentor'),
    emptyInvite: 'No active mentoring sessions.',
    emptyAction: 'Find a mentor',
  },
  {
    id: 'project',
    label: 'Project',
    icon: 'work',
    threads: THREADS.filter(t => t.containerId === 'project'),
    emptyInvite: 'No committed projects yet — explore project ideas inside a Skill profile thread.',
    emptyAction: 'Track a project',
  },
  {
    id: 'network-visibility',
    label: 'Network visibility',
    icon: 'hub',
    threads: THREADS.filter(t => t.containerId === 'network-visibility'),
    emptyInvite: 'Your visibility profile hasn\'t been built yet.',
    emptyAction: 'Build visibility',
  },
  {
    id: 'coaching',
    label: 'Coaching',
    icon: 'record_voice_over',
    threads: COACHING_PAST_SESSIONS.map((s): Thread => ({
      id: s.id,
      containerId: 'coaching',
      title: s.title,
      subtitle: `${s.mode === 'voice' ? 'Voice' : 'Chat'} · ${s.durationMin} min · ${s.date}`,
      status: 'active',
      lastActivityDaysAgo: 0,
      deadlineDaysFromNow: null,
      historyDepth: 1,
      score: 30,
      tileReason: s.snippet,
      tileAction: 'Continue',
      agentMessage: s.snippet,
      featuredStatus: `${s.date} · ${s.mode} · ${s.durationMin} min`,
      featuredDescription: s.snippet,
      featuredActions: [],
      suggestedQuestions: s.followUpPrompts,
      pastSessions: [],
      continuityNote: null,
    })),
    emptyInvite: 'No past coaching sessions.',
    emptyAction: 'Start a session',
  },
  {
    id: 'people-connection',
    label: 'People connection',
    icon: 'people',
    threads: THREADS.filter(t => t.containerId === 'people-connection'),
    emptyInvite: 'No connections tracked yet.',
    emptyAction: 'Add a connection',
  },
  {
    id: 'career-opportunities',
    label: 'Career opportunities',
    icon: 'work_history',
    threads: [],
    emptyInvite: 'No active applications yet.',
    emptyAction: 'Explore opportunities',
  },
]

// ─── Ranked threads (for "needs your attention") ──────────────────────────────

export const RANKED_THREADS = [...THREADS].sort((a, b) => b.score - a.score)

// ─── Nudges ───────────────────────────────────────────────────────────────────

export const NUDGES: Nudge[] = [
  {
    id: 'nudge-goals',
    text: 'Your Q4 goals haven\'t been set yet',
    detail: '3 teammates in Customer Success have already started. Goal-setting closes Sep 15.',
    icon: 'flag',
    targetContainerId: 'development-plan',
    acceptLabel: 'Set Q4 goals',
  },
  {
    id: 'nudge-network',
    text: '5 people in your extended network moved roles this week',
    detail: 'Including 2 ex-colleagues at enterprise CS companies. Worth a quick check.',
    icon: 'hub',
    targetContainerId: 'network-visibility',
    acceptLabel: 'See who moved',
  },
]

// ─── Connections ──────────────────────────────────────────────────────────────

export type PersonalityType = 'connector' | 'catalyst' | 'architect' | 'driver'

export const PERSONALITY_LABELS: Record<PersonalityType, string> = {
  connector: 'Connector', catalyst: 'Catalyst', architect: 'Architect', driver: 'Driver',
}

export const PERSONALITY_DESCS: Record<PersonalityType, string> = {
  connector: 'You build trust before outcomes. You communicate with full context and read the room before speaking up.',
  catalyst:  'You energize rooms and move fast. Direct, people-first, best in brief high-energy exchanges.',
  architect: 'You think before you talk. Goal-oriented, precise, respect people who\'ve done the thinking already.',
  driver:    'You want clarity and execution. Specific asks, clear scope, get to the point.',
}

export const SARAH_PERSONALITY_TYPE: PersonalityType = 'connector'

export type ConnectionIntent = 'growing' | 'new-joinee' | 'exploring'

export type RelevanceSignal = 'skill-gap' | 'project' | 'role-trending' | 'cross-functional' | 'buddy' | 'hiring'

export const SIGNAL_LABELS: Record<RelevanceSignal, string> = {
  'skill-gap':       'Skill gap match',
  'project':         'Project adjacent',
  'role-trending':   'Role you\'re trending toward',
  'cross-functional':'Cross-functional counterpart',
  'buddy':           'Onboarding buddy',
  'hiring':          'Hiring context',
}

export type ConnectionAction = 'message' | 'see-work' | 'request-intro'

export type ConnectionEntry = {
  id: string
  name: string
  role: string
  company: string
  initials: string
  theirType: PersonalityType
  intents: ConnectionIntent[]
  signal: RelevanceSignal
  why: string            // one-line rationale — mandatory
  howToConnect: string   // one sentence on the approach
  actions: ConnectionAction[]
  isExisting?: boolean
}

export const CONNECTION_FEED: ConnectionEntry[] = [
  // ── Growing ───────────────────────────────────────────────────────────────
  {
    id: 'cf-jamie',
    name: 'Jamie Park',
    role: 'CS Manager',
    company: 'Acme Corp',
    initials: 'JP',
    theirType: 'driver',
    intents: ['growing'],
    signal: 'role-trending',
    why: 'Was a Senior CSM 14 months ago — already in the role you\'re trending toward.',
    howToConnect: 'Ask what the first 90 days in a manager role actually looked like — not what you read about, but what surprised them.',
    actions: ['message', 'see-work'],
  },
  {
    id: 'cf-dani',
    name: 'Dani Okafor',
    role: 'Data Analyst',
    company: 'Acme Corp',
    initials: 'DO',
    theirType: 'architect',
    intents: ['growing'],
    signal: 'skill-gap',
    why: 'Closed the same data storytelling gap you opened — built the QBR charts your team now uses.',
    howToConnect: 'Ask them to walk you through one chart they\'re proud of. Concrete and short — no big ask.',
    actions: ['message', 'request-intro'],
  },
  {
    id: 'cf-sam',
    name: 'Sam Torres',
    role: 'Product Manager',
    company: 'Acme Corp',
    initials: 'ST',
    theirType: 'catalyst',
    intents: ['growing'],
    signal: 'project',
    why: 'Running a parallel account health initiative that maps to your Q3 Renewal Playbook.',
    howToConnect: 'Share one section of your Playbook and ask if they\'ve solved the same problem on the product side.',
    actions: ['message', 'see-work'],
  },
  {
    id: 'cf-marcus',
    name: 'Marcus Webb',
    role: 'Solutions Engineer',
    company: 'Acme Corp',
    initials: 'MW',
    theirType: 'driver',
    intents: ['growing'],
    signal: 'cross-functional',
    why: 'The SE counterpart to your 3 largest accounts — you share the same customers but rarely the same room.',
    howToConnect: 'Give him a specific scoped ask — vague collaborations don\'t land with Drivers.',
    actions: ['message'],
    isExisting: true,
  },
  // ── New joinee ────────────────────────────────────────────────────────────
  {
    id: 'cf-chris',
    name: 'Chris Huang',
    role: 'Senior CSM',
    company: 'Acme Corp',
    initials: 'CH',
    theirType: 'connector',
    intents: ['new-joinee'],
    signal: 'buddy',
    why: 'Went through the same onboarding 6 months ago and is 3 accounts in — perfect first conversation.',
    howToConnect: 'Ask what they wish they\'d known in week 2. People remember this and love the question.',
    actions: ['message', 'request-intro'],
  },
  {
    id: 'cf-mei',
    name: 'Mei Lin',
    role: 'CS Ops Specialist',
    company: 'Acme Corp',
    initials: 'ML',
    theirType: 'architect',
    intents: ['new-joinee'],
    signal: 'buddy',
    why: 'Runs the tooling you\'ll use daily — 10 minutes here saves you 3 days of figuring it out.',
    howToConnect: 'Ask for a 10-minute tool walkthrough framed around your specific accounts, not a general demo.',
    actions: ['message'],
  },
  {
    id: 'cf-taylor',
    name: 'Taylor Reyes',
    role: 'Senior CSM',
    company: 'Acme Corp',
    initials: 'TR',
    theirType: 'connector',
    intents: ['new-joinee'],
    signal: 'cross-functional',
    why: 'Your designated buddy — the one person explicitly set up to help you ramp.',
    howToConnect: 'Start with something lightweight: ask what the team\'s informal norms are that never made it into the handbook.',
    actions: ['message', 'see-work'],
  },
  // ── Exploring ─────────────────────────────────────────────────────────────
  {
    id: 'cf-jordan-k',
    name: 'Jordan Kim',
    role: 'VP Customer Success',
    company: 'Vertex SaaS',
    initials: 'JK',
    theirType: 'architect',
    intents: ['exploring'],
    signal: 'hiring',
    why: 'Heads CS at a company similar to your top accounts — has posted 2 CSM roles in the last 90 days.',
    howToConnect: 'Reference something specific about their CS approach before mentioning you\'re exploring. Architects notice when you\'ve done the work.',
    actions: ['request-intro', 'see-work'],
  },
  {
    id: 'cf-morgan',
    name: 'Morgan Patel',
    role: 'CS Director',
    company: 'Helix Cloud',
    initials: 'MP',
    theirType: 'catalyst',
    intents: ['exploring'],
    signal: 'role-trending',
    why: 'Made the Senior CSM → CS Director jump 18 months ago at a Series B — the exact move you\'re mapping toward.',
    howToConnect: 'Ask what the tipping point was — not "how did you do it" but "what was the thing that finally made it click."',
    actions: ['message', 'request-intro'],
  },
  {
    id: 'cf-alex-r',
    name: 'Alex Russo',
    role: 'Head of Customer Success',
    company: 'NovaTech',
    initials: 'AR',
    theirType: 'driver',
    intents: ['exploring'],
    signal: 'hiring',
    why: 'Expanding their CS team — your enterprise renewal background matches what they\'re hiring for.',
    howToConnect: 'Lead with a specific outcome from your work, not your job title. Drivers hire for results, not resumes.',
    actions: ['request-intro', 'message'],
  },
]

export const CONNECTIONS_PROMPTS: Record<ConnectionIntent, string[]> = {
  'growing': [
    'Who\'s already in the role I\'m trending toward?',
    'Who can help me close my data storytelling gap?',
    'Find my cross-functional counterpart',
    'Who should I know before the next review cycle?',
  ],
  'new-joinee': [
    'Who went through this onboarding recently?',
    'Who runs the tools I\'ll use daily?',
    'Find my buddy',
    'Who can help me ramp up faster?',
  ],
  'exploring': [
    'Who\'s hiring Senior CSMs at Series B companies?',
    'Who made the jump from CSM to Director?',
    'Find someone at a company similar to my accounts',
    'Who can give me an insider view of Vertex SaaS?',
  ],
}

export type AssessmentQuestion = {
  id: string
  question: string
  options: { value: string; label: string }[]
}

export const PERSONALITY_ASSESSMENT: AssessmentQuestion[] = [
  {
    id: 'q1',
    question: 'When working through a challenge, you tend to…',
    options: [
      { value: 'talk', label: 'Talk it through with someone' },
      { value: 'think', label: 'Think it through on your own first' },
    ],
  },
  {
    id: 'q2',
    question: 'In a new professional relationship, you first look for…',
    options: [
      { value: 'personal', label: 'Something personal in common' },
      { value: 'professional', label: 'Shared professional goals' },
    ],
  },
  {
    id: 'q3',
    question: 'Your communication style is more…',
    options: [
      { value: 'contextual', label: 'Detailed — I give the full picture' },
      { value: 'direct', label: 'Concise — I get to the point' },
    ],
  },
  {
    id: 'q4',
    question: 'You\'re most energized by…',
    options: [
      { value: 'people', label: 'Building the relationship' },
      { value: 'results', label: 'Achieving the outcome together' },
    ],
  },
]

// ─── Home suggested prompts (cross-thread, top-priority driven) ───────────────

export const HOME_SUGGESTED_PROMPTS = [
  'What\'s blocking Module 2 of my AI plan?',
  'Help me finish Section 3 of the Q3 Renewal Playbook',
  'Should I follow up with Priya today?',
  'What\'s the quickest way to make progress this week?',
]

// ─── Stat strip ───────────────────────────────────────────────────────────────

export const STAT_STRIP = [
  { label: 'Dev plan progress', value: '20%', delta: '+0% since last visit', icon: 'trending_flat', positive: false },
  { label: 'Need attention', value: '3', delta: 'threads', icon: 'notifications_active', positive: false },
  { label: 'New suggestions', value: '2', delta: 'nudges', icon: 'auto_awesome', positive: true },
]

// ─── Project marketplace ───────────────────────────────────────────────────────

export type ProjectSignal = 'skill-gap' | 'visibility' | 'mobility-up' | 'mobility-across'

export const PROJECT_SIGNAL_LABELS: Record<ProjectSignal, string> = {
  'skill-gap':       'Closes a skill gap',
  'visibility':      'Raises your visibility',
  'mobility-up':     'Prepares you for the next level',
  'mobility-across': 'Opens a lateral move',
}

export type ProjectEntry = {
  id: string
  title: string
  team: string
  duration: string
  timeCommitment: string
  skills: string[]
  signals: ProjectSignal[]
  why: string
  description: string
  isCommitted?: boolean
}

export const PROJECT_MARKETPLACE: ProjectEntry[] = [
  {
    id: 'pm-1',
    title: 'Account Health Dashboard — Phase 2',
    team: 'CS Ops',
    duration: '6 weeks',
    timeCommitment: '4–6 hrs/week',
    skills: ['Data Analysis & Storytelling', 'Dashboard Interpretation', 'SQL Basics'],
    signals: ['skill-gap', 'visibility'],
    why: 'Directly closes your data storytelling gap and puts your name on infrastructure your whole team uses.',
    description: 'Build out the next phase of the account health dashboard — adding leading indicators and churn prediction signals. CS Ops is looking for a CSM co-owner.',
    isCommitted: false,
  },
  {
    id: 'pm-2',
    title: 'Enterprise Onboarding Playbook Redesign',
    team: 'CS Enablement',
    duration: '8 weeks',
    timeCommitment: '3–4 hrs/week',
    skills: ['Customer Onboarding', 'Executive Communication', 'Business Case Development'],
    signals: ['visibility', 'mobility-up'],
    why: 'You have the deepest enterprise onboarding experience on the team — this showcases it org-wide and gets you in front of CS leadership.',
    description: 'Redesign the enterprise onboarding playbook. CS Enablement wants a senior CSM to co-author and own the final document.',
    isCommitted: false,
  },
  {
    id: 'pm-3',
    title: 'Cross-Functional QBR Process Pilot',
    team: 'Product + CS',
    duration: '4 weeks',
    timeCommitment: '2–3 hrs/week',
    skills: ['QBR Facilitation', 'Product Feedback Loops', 'Influence Without Authority'],
    signals: ['visibility', 'mobility-across'],
    why: 'Works directly with Product — expands your footprint beyond CS and shows you can operate cross-functionally at a manager level.',
    description: 'Pilot a new QBR format that brings Product into the room. Looking for a CSM to design the flow and run the first 3 pilots.',
    isCommitted: false,
  },
  {
    id: 'pm-4',
    title: 'Churn Risk Model — CSM Feedback Loop',
    team: 'Data Science',
    duration: '10 weeks',
    timeCommitment: '2 hrs/week',
    skills: ['Churn Risk Identification', 'Data Analysis & Storytelling', 'Account Health Monitoring'],
    signals: ['skill-gap', 'mobility-up'],
    why: 'Low time ask, high learning — you\'ll work directly with Data Science and get hands-on with the models your team eventually uses.',
    description: 'Data Science is building a churn risk model and needs a CSM to provide feedback on signal quality. Lightweight but high-impact.',
    isCommitted: false,
  },
  {
    id: 'pm-5',
    title: 'New CSM Buddy Program — Cohort Lead',
    team: 'CS Leadership',
    duration: 'Ongoing (3 months)',
    timeCommitment: '2–3 hrs/week',
    skills: ['Coaching & Mentoring Others', 'Customer Onboarding', 'Team Management'],
    signals: ['mobility-up', 'visibility'],
    why: 'CS Leadership runs this — being cohort lead puts you directly in front of the people who make promotion decisions.',
    description: 'Lead a cohort of 3 new CSMs through their first 90 days. Structured program with CS Leadership visibility.',
    isCommitted: false,
  },
  {
    id: 'pm-committed',
    title: 'Q3 Renewal Playbook',
    team: 'CS',
    duration: '6 weeks',
    timeCommitment: '5–7 hrs/week',
    skills: ['Enterprise Renewal Management', 'Business Case Development', 'Executive Communication'],
    signals: ['visibility', 'mobility-up'],
    why: 'You own this — deadline in 4 days, sections 3 and 4 still need owners.',
    description: 'Renewal strategy playbook for Q3 enterprise accounts.',
    isCommitted: true,
  },
]

export const PROJECT_PROMPTS = [
  'What project would most help me reach CS Manager?',
  'Find a project that closes my data gap',
  'What\'s a good cross-functional project for me?',
  'Show me low-time-commitment options',
]

// ─── Network visibility ────────────────────────────────────────────────────────

export type VisibilityAction = {
  id: string
  label: string
  description: string
  impact: 'low' | 'medium' | 'high'
  done: boolean
}

export const VISIBILITY_ACTIONS: VisibilityAction[] = [
  { id: 'va-1', label: 'Complete your skills profile', description: 'Add your top 5 skills so the system can surface you for projects and opportunities.', impact: 'high', done: false },
  { id: 'va-2', label: 'Add a career goal', description: 'Let the system know you\'re targeting a CS Manager role so recommendations are calibrated.', impact: 'high', done: false },
  { id: 'va-3', label: 'Connect with your SE counterparts', description: 'You share 3 large accounts with Solutions Engineers you\'ve never met.', impact: 'medium', done: false },
  { id: 'va-4', label: 'Share a work artifact', description: 'Post your Renewal Playbook draft to the CS shared space — it\'s 60% done and already valuable.', impact: 'medium', done: false },
  { id: 'va-5', label: 'Endorse a colleague', description: 'Endorsing Priya for her VP transition takes 2 minutes and strengthens your relationship.', impact: 'low', done: false },
]

export const NETWORK_VISIBILITY_PROMPTS = [
  'How visible am I compared to my peers?',
  'What would most increase my chances of being found for projects?',
  'Who should know about the Renewal Playbook?',
  'Help me write a profile summary for my career goal',
]

// ─── Development plan ─────────────────────────────────────────────────────────

export const DEVELOPMENT_PLAN_PROMPTS = [
  'What should I focus on this quarter?',
  'Am I on track for a CS Manager role by next year?',
  'What\'s blocking my next promotion?',
  'Help me set 90-day goals',
]

export type DevGoal = {
  id: string
  title: string
  horizon: 'now' | 'next' | 'future'
  progress: number
  description: string
}

export const DEV_GOALS: DevGoal[] = [
  { id: 'dg-1', title: 'Close data storytelling gap', horizon: 'now', progress: 20, description: 'Enroll in or pick up a project that builds data analysis skills before Q4 review.' },
  { id: 'dg-2', title: 'Raise internal visibility', horizon: 'now', progress: 35, description: 'Complete profile, share the Renewal Playbook, connect with SE counterparts.' },
  { id: 'dg-3', title: 'Build management readiness signals', horizon: 'next', progress: 10, description: 'Lead the Buddy Program cohort, get feedback from Dev Kapoor on readiness.' },
  { id: 'dg-4', title: 'Land CS Manager role', horizon: 'future', progress: 0, description: 'Target: internal move or external by mid-next year.' },
]

export const MENTOR_PROMPTS = [
  'Who should I reach out to about the CS Manager transition?',
  'Find someone who can help me with data skills',
  'What should I ask my mentor at our next session?',
  'How do I make the most of the Priya relationship?',
]

// ─── Career opportunities ──────────────────────────────────────────────────────

export type CareerInterestArea = {
  id: string
  label: string
  type: 'role' | 'skill'
}

export const CAREER_INTEREST_AREAS: CareerInterestArea[] = [
  { id: 'ci-mgr',      label: 'CS Manager',            type: 'role'  },
  { id: 'ci-dir',      label: 'CS Director',           type: 'role'  },
  { id: 'ci-ops',      label: 'CS Ops',                type: 'role'  },
  { id: 'ci-prod',     label: 'Product CS',            type: 'role'  },
  { id: 'ci-data',     label: 'Data & Analytics',      type: 'skill' },
  { id: 'ci-enablement', label: 'CS Enablement',       type: 'role'  },
]

export const SARAH_INTERESTS: string[] = ['ci-mgr', 'ci-dir']  // default selected

export type LearningStep = {
  id: string
  label: string
  type: 'course' | 'project' | 'mentoring' | 'reading'
  duration: string
  resource?: string
}

export type JobOpening = {
  id: string
  title: string
  company: string
  companyType: string   // e.g. "Series B SaaS"
  location: string
  level: 'ic' | 'manager' | 'director' | 'vp'
  matchScore: number    // 0–100
  matchedSkills: string[]
  gapSkills: string[]
  whyMatch: string      // one-line rationale
  learningPlan: LearningStep[]
  isInternal: boolean
}

export const CAREER_OPPORTUNITIES: JobOpening[] = [
  {
    id: 'jo-1',
    title: 'Customer Success Manager — Enterprise',
    company: 'Acme Corp',
    companyType: 'Internal',
    location: 'San Francisco, CA',
    level: 'manager',
    matchScore: 87,
    matchedSkills: ['Enterprise Renewal Management', 'QBR Facilitation', 'Executive Communication', 'Negotiation'],
    gapSkills: ['Team Management', 'Data Analysis & Storytelling'],
    whyMatch: 'You already manage the complexity — this formalizes it. Two skill gaps are closable in one quarter.',
    learningPlan: [
      { id: 'lp-1a', label: 'Complete "Managing CS Teams" course', type: 'course', duration: '3 weeks', resource: 'LinkedIn Learning' },
      { id: 'lp-1b', label: 'Lead the New CSM Buddy Program cohort', type: 'project', duration: '3 months' },
      { id: 'lp-1c', label: '3 sessions with Dev Kapoor on management readiness', type: 'mentoring', duration: '6 weeks' },
      { id: 'lp-1d', label: 'Co-own Account Health Dashboard — Phase 2', type: 'project', duration: '6 weeks' },
    ],
    isInternal: true,
  },
  {
    id: 'jo-2',
    title: 'Senior Customer Success Manager',
    company: 'Vertex SaaS',
    companyType: 'Series C SaaS',
    location: 'Remote',
    level: 'ic',
    matchScore: 91,
    matchedSkills: ['Enterprise Renewal Management', 'Churn Risk Identification', 'QBR Facilitation', 'CRM Administration', 'Account Health Monitoring'],
    gapSkills: ['Data Analysis & Storytelling'],
    whyMatch: 'Near-perfect skills match. One gap — data storytelling — can be closed in parallel; they value renewal depth over dashboards.',
    learningPlan: [
      { id: 'lp-2a', label: 'Data Storytelling for CS Professionals', type: 'course', duration: '2 weeks', resource: 'Coursera' },
      { id: 'lp-2b', label: 'Build 1 data-backed renewal narrative', type: 'project', duration: '1 week' },
    ],
    isInternal: false,
  },
  {
    id: 'jo-3',
    title: 'CS Manager — Mid-Market',
    company: 'Helix Cloud',
    companyType: 'Series B SaaS',
    location: 'New York / Remote',
    level: 'manager',
    matchScore: 74,
    matchedSkills: ['Enterprise Renewal Management', 'Executive Communication', 'Customer Onboarding', 'Negotiation'],
    gapSkills: ['Team Management', 'Data Analysis & Storytelling', 'Business Case Development'],
    whyMatch: 'Strong renewal and exec communication background — they need someone who can manage upwards. Three gaps to close, but one quarter gets you most of the way.',
    learningPlan: [
      { id: 'lp-3a', label: 'Management Fundamentals (short course)', type: 'course', duration: '2 weeks', resource: 'HBS Online' },
      { id: 'lp-3b', label: 'Lead a cross-functional project as de facto manager', type: 'project', duration: '2 months' },
      { id: 'lp-3c', label: 'Business case workshop with Priya Sharma', type: 'mentoring', duration: '3 sessions' },
      { id: 'lp-3d', label: 'SQL for Business Decisions', type: 'course', duration: '3 weeks', resource: 'Mode Analytics' },
    ],
    isInternal: false,
  },
  {
    id: 'jo-4',
    title: 'Director of Customer Success',
    company: 'NovaTech',
    companyType: 'Series D SaaS',
    location: 'Remote',
    level: 'director',
    matchScore: 58,
    matchedSkills: ['Enterprise Renewal Management', 'Executive Communication', 'QBR Facilitation'],
    gapSkills: ['Team Management', 'Data Analysis & Storytelling', 'OKR Setting & Tracking', 'Coaching & Mentoring Others', 'Business Case Development'],
    whyMatch: 'A stretch — but the renewal depth is exactly what they\'re hiring for. Gap plan is 6–9 months of deliberate work.',
    learningPlan: [
      { id: 'lp-4a', label: 'CS Leadership Academy', type: 'course', duration: '8 weeks', resource: 'CustomerSuccessU' },
      { id: 'lp-4b', label: 'Take on a team-lead role in current org', type: 'project', duration: '6 months' },
      { id: 'lp-4c', label: 'Data & OKR double-sprint', type: 'course', duration: '4 weeks', resource: 'Multiple' },
      { id: 'lp-4d', label: 'Monthly sessions with Layla Nasser on CS leadership', type: 'mentoring', duration: '6 months' },
      { id: 'lp-4e', label: '"High Output Management" + "Measure What Matters"', type: 'reading', duration: '4 weeks' },
    ],
    isInternal: false,
  },
  {
    id: 'jo-5',
    title: 'CS Enablement Manager',
    company: 'Acme Corp',
    companyType: 'Internal',
    location: 'San Francisco, CA',
    level: 'manager',
    matchScore: 79,
    matchedSkills: ['Customer Onboarding', 'Executive Communication', 'QBR Facilitation', 'Coaching & Mentoring Others'],
    gapSkills: ['Data Analysis & Storytelling', 'Business Case Development'],
    whyMatch: 'You\'ve been doing enablement informally — the Renewal Playbook and Buddy Program are exactly what this role needs at scale.',
    learningPlan: [
      { id: 'lp-5a', label: 'Finalize and publish the Q3 Renewal Playbook', type: 'project', duration: '1 week' },
      { id: 'lp-5b', label: 'Data storytelling crash course', type: 'course', duration: '2 weeks', resource: 'LinkedIn Learning' },
      { id: 'lp-5c', label: 'Propose a formal enablement session to CS leadership', type: 'project', duration: '2 weeks' },
    ],
    isInternal: true,
  },
]

export const CAREER_PROMPTS = [
  'What role should I target for my next move?',
  'Show me only internal opportunities',
  'What\'s the fastest path to CS Manager?',
  'Which role has the smallest gap to close?',
]

// ─── Development plan: milestones + agent insight ──────────────────────────────

export type DevMilestone = {
  id: string
  label: string
  targetDate: string
  status: 'done' | 'on-track' | 'at-risk' | 'future'
  linkedGoalId?: string
}

export const DEV_MILESTONES: DevMilestone[] = [
  { id: 'dm-1', label: 'Enroll in data storytelling course',   targetDate: 'Sep 2026', status: 'at-risk',  linkedGoalId: 'dg-1' },
  { id: 'dm-2', label: 'Kick off Account Health Dashboard project', targetDate: 'Sep 2026', status: 'on-track', linkedGoalId: 'dg-1' },
  { id: 'dm-3', label: 'Complete Renewal Playbook (Sections 3&4)', targetDate: 'Aug 2026', status: 'at-risk',  linkedGoalId: 'dg-2' },
  { id: 'dm-4', label: 'Connect with SE counterparts',         targetDate: 'Sep 2026', status: 'on-track', linkedGoalId: 'dg-2' },
  { id: 'dm-5', label: 'Lead Buddy Program cohort (first 90 days)', targetDate: 'Nov 2026', status: 'future',   linkedGoalId: 'dg-3' },
  { id: 'dm-6', label: 'Get management readiness signal from Dev Kapoor', targetDate: 'Nov 2026', status: 'future', linkedGoalId: 'dg-3' },
  { id: 'dm-7', label: 'Internal CS Manager application or external search begins', targetDate: 'Q1 2027', status: 'future', linkedGoalId: 'dg-4' },
]

export const DEV_PLAN_AGENT_INSIGHT = {
  status: 'at-risk' as const,
  headline: 'Two milestones are at risk of slipping',
  detail: 'The data storytelling course hasn\'t started and the Renewal Playbook deadline is in 4 days with two sections unowned. Addressing those this week keeps the CS Manager timeline intact.',
  thisWeekFocus: [
    'Pick up Sections 3–4 of the Q3 Renewal Playbook',
    'Enroll in "Data Storytelling for CS Professionals" (Coursera, 2 weeks)',
    'Schedule a 30-min check-in with Dev Kapoor on management readiness',
  ],
}

// ─── Mentor: past sessions + next session ─────────────────────────────────────

export type MentorSession = {
  id: string
  mentorName: string
  date: string
  topics: string[]
  notes: string
  followUps: string[]
}

export const MENTOR_PAST_SESSIONS: MentorSession[] = [
  {
    id: 'ms-sess-1',
    mentorName: 'Priya Sharma',
    date: 'Aug 15, 2026',
    topics: ['CS Manager transition', 'Building visibility', 'Q3 Renewal Playbook approach'],
    notes: 'Priya recommended leading a cross-functional project before applying internally. Emphasized that data skills matter more than expected at the manager level. Suggested connecting with Dev Kapoor.',
    followUps: [
      'Connect with Dev Kapoor this week',
      'Enroll in a data course before next session',
      'Share the Renewal Playbook draft with the CS team',
    ],
  },
]

export const MENTOR_NEXT_SESSION = {
  mentorName: 'Priya Sharma',
  date: 'Sep 5, 2026',
  daysAway: 10,
  suggestedTopics: [
    'Update on the Q3 Renewal Playbook — what shipped',
    'Data course progress check-in',
    'Dev Kapoor conversation — what did I learn?',
    'Timeline to internal CS Manager application',
  ],
}

// ─── Network visibility: peer comparison + profile sections + recently viewed ──

export type VisibilityPeerComparison = {
  metric: string
  sarah: number
  peerAvg: number
  unit: string
}

export const VISIBILITY_PEER_COMPARISONS: VisibilityPeerComparison[] = [
  { metric: 'Skills on profile',     sarah: 4,  peerAvg: 11, unit: 'skills' },
  { metric: 'Cross-team connections', sarah: 3,  peerAvg: 9,  unit: 'people' },
  { metric: 'Shared work artifacts',  sarah: 0,  peerAvg: 2,  unit: 'items'  },
  { metric: 'Profile views (30d)',    sarah: 7,  peerAvg: 18, unit: 'views'  },
]

export const VISIBILITY_PROFILE_SECTIONS = [
  { id: 'ps-1', label: 'Career goal',     filled: false, tip: 'Add "CS Manager" as your career goal — it unlocks project and opportunity matching.' },
  { id: 'ps-2', label: 'Skills (top 5)',  filled: false, tip: 'You have 18 skills tracked — add your top 5 to your profile so others can find you.' },
  { id: 'ps-3', label: 'Current role',    filled: true,  tip: '' },
  { id: 'ps-4', label: 'Work sample',     filled: false, tip: 'Share the Renewal Playbook draft — it\'s 60% done and already valuable.' },
  { id: 'ps-5', label: 'Team',            filled: true,  tip: '' },
  { id: 'ps-6', label: 'Manager',         filled: true,  tip: '' },
]

export const VISIBILITY_RECENTLY_VIEWED = [
  { name: 'Dev Kapoor',   role: 'CS Manager',           initials: 'DK', daysAgo: 2  },
  { name: 'Layla Nasser', role: 'VP Customer Success',  initials: 'LN', daysAgo: 5  },
  { name: 'Sam Torres',   role: 'Product Manager',       initials: 'ST', daysAgo: 9  },
]
