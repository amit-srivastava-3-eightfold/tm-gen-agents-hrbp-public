/** Maps default (main) labels to demo-mode labels. */
const DEMO_LABELS: Record<string, string> = {
  'AI Readiness': 'AI Adoption',
  'AI readiness': 'AI adoption',
  'AI READINESS': 'AI ADOPTION',
  'readiness scores': 'adoption scores',
  'readiness gaps': 'adoption gaps',
  'readiness figure': 'adoption figure',
  'task-level readiness': 'task-level adoption',
  'close readiness gaps': 'close adoption gaps',
  'AI readiness change from data collection': 'AI adoption change from data collection',
  'AI readiness — baseline estimate': 'AI adoption — baseline estimate',
  'What does AI Readiness measure?': 'What does AI Adoption measure?',
}

/** Return the demo variant of a label when demo mode is on, otherwise the original. */
export function demoLabel(text: string, isDemo: boolean): string {
  if (!isDemo) return text
  return DEMO_LABELS[text] ?? text
}
