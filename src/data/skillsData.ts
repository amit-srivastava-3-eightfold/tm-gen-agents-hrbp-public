export interface ProfileSkill {
  name: string
  endorsementCount?: number
  endorsed?: boolean
}

export interface FeaturedSkillEndorser {
  initials: string
  color: string
  photoSrc?: string
}

export interface FeaturedSkill {
  name: string
  endorserSummary: string  // e.g. "Alex Nakamura and 2 others at Acme"
  endorsers: FeaturedSkillEndorser[]
}

export interface ExpertBlock {
  count: number
  skills: string[]
}

const SALES_ENGINEERING_SKILLS: ProfileSkill[] = [
  { name: 'Product Demos', endorsementCount: 12, endorsed: true },
  { name: 'Technical Sales', endorsementCount: 8 },
  { name: 'Solution Architecture', endorsementCount: undefined },
  { name: 'API Integration', endorsementCount: 5 },
  { name: 'CRM Systems', endorsementCount: undefined },
  { name: 'Enterprise Solutions', endorsementCount: 6 },
  { name: 'Technical Discovery', endorsementCount: undefined },
  { name: 'REST APIs', endorsementCount: 4 },
  { name: 'AWS', endorsementCount: 7 },
  { name: 'System Design', endorsementCount: undefined },
  { name: 'Communication', endorsementCount: 9 },
  { name: 'Python', endorsementCount: 3 },
  { name: 'POC Delivery', endorsementCount: undefined },
  { name: 'Sales Enablement', endorsementCount: undefined },
]

const HR_SKILLS: ProfileSkill[] = [
  { name: 'Talent Management', endorsementCount: 15, endorsed: true },
  { name: 'Employee Relations', endorsementCount: 11 },
  { name: 'Performance Management', endorsementCount: undefined },
  { name: 'Compensation & Benefits', endorsementCount: 8 },
  { name: 'HR Strategy', endorsementCount: undefined },
  { name: 'Workforce Planning', endorsementCount: 6 },
  { name: 'Change Management', endorsementCount: undefined },
  { name: 'Coaching', endorsementCount: 9 },
  { name: 'Conflict Resolution', endorsementCount: 7 },
  { name: 'Policy Development', endorsementCount: undefined },
  { name: 'Data Analytics', endorsementCount: 5 },
  { name: 'Succession Planning', endorsementCount: 4 },
  { name: 'DEI Initiatives', endorsementCount: undefined },
  { name: 'Stakeholder Management', endorsementCount: undefined },
]

const CUSTOMER_SUCCESS_SKILLS: ProfileSkill[] = [
  { name: 'Account Management', endorsementCount: 14, endorsed: true },
  { name: 'Customer Success', endorsementCount: 12 },
  { name: 'Relationship Building', endorsementCount: 9 },
  { name: 'Escalation Management', endorsementCount: 6 },
  { name: 'Product Knowledge', endorsementCount: undefined },
  { name: 'Renewal Management', endorsementCount: 8 },
  { name: 'Upsell & Cross-sell', endorsementCount: 5 },
  { name: 'Customer Onboarding', endorsementCount: 7 },
  { name: 'Communication', endorsementCount: 11 },
  { name: 'Data Analytics', endorsementCount: 4 },
  { name: 'Churn Prevention', endorsementCount: undefined },
  { name: 'Stakeholder Management', endorsementCount: 6 },
]

const SALES_SKILLS: ProfileSkill[] = [
  { name: 'Technical Sales', endorsementCount: 10, endorsed: true },
  { name: 'Account Management', endorsementCount: 8 },
  { name: 'Enterprise Sales', endorsementCount: 7 },
  { name: 'Product Demos', endorsementCount: 6 },
  { name: 'CRM Systems', endorsementCount: undefined },
  { name: 'Negotiation', endorsementCount: 9 },
  { name: 'Pipeline Management', endorsementCount: 5 },
  { name: 'Communication', endorsementCount: 11 },
  { name: 'Technical Discovery', endorsementCount: 4 },
  { name: 'Solution Selling', endorsementCount: undefined },
]

const PROFESSIONAL_SERVICES_SKILLS: ProfileSkill[] = [
  { name: 'Implementation', endorsementCount: 12, endorsed: true },
  { name: 'Project Management', endorsementCount: 10 },
  { name: 'Technical Consulting', endorsementCount: 8 },
  { name: 'Stakeholder Management', endorsementCount: 7 },
  { name: 'Requirements Gathering', endorsementCount: undefined },
  { name: 'Change Management', endorsementCount: 6 },
  { name: 'Training & Enablement', endorsementCount: 5 },
  { name: 'System Integration', endorsementCount: 9 },
  { name: 'Documentation', endorsementCount: 4 },
  { name: 'Problem Solving', endorsementCount: undefined },
]

const ENGINEERING_LEAD_SKILLS: ProfileSkill[] = [
  { name: 'Platform Reliability', endorsementCount: 11, endorsed: true },
  { name: 'Engineering Leadership', endorsementCount: 9, endorsed: true },
  { name: 'System Design', endorsementCount: 8 },
  { name: 'Infrastructure', endorsementCount: 7 },
  { name: 'Incident Management', endorsementCount: 6 },
  { name: 'Observability', endorsementCount: undefined },
  { name: 'AI/ML Pipelines', endorsementCount: 5 },
  { name: 'Python', endorsementCount: 9 },
  { name: 'Kubernetes', endorsementCount: 7 },
  { name: 'CI/CD', endorsementCount: 4 },
  { name: 'Technical Mentorship', endorsementCount: undefined },
  { name: 'Cross-functional Collaboration', endorsementCount: 6 },
  { name: 'Stakeholder Communication', endorsementCount: undefined },
  { name: 'Road-mapping', endorsementCount: 3 },
]

const CSM_FEATURED_SKILLS: FeaturedSkill[] = [
  {
    name: 'Platform Reliability',
    endorserSummary: 'Alex Nakamura and 2 others at Acme',
    endorsers: [
      { initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
      { initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
      { initials: 'RK', color: '#6A1B9A', photoSrc: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&crop=face' },
    ],
  },
  {
    name: 'Engineering Leadership',
    endorserSummary: 'Cong Wang and 1 other at Acme',
    endorsers: [
      { initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
      { initials: 'JT', color: '#AD1457', photoSrc: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face' },
    ],
  },
]

const CSM_EXPERT_BLOCK: ExpertBlock = {
  count: 3,
  skills: ['Platform Reliability', 'Engineering Leadership', 'System Design'],
}

/** Skills by profile person ID. Uses mateo/jaydon-torff for current user; 1,2,3,l1-l12 for team profiles. */
export const PROFILE_SKILLS: Record<string, { skills: ProfileSkill[]; endorserInitials: string; endorserName: string; endorserColor: string; featuredSkills?: FeaturedSkill[]; expertBlock?: ExpertBlock }> = {
  csm: { skills: ENGINEERING_LEAD_SKILLS, endorserInitials: 'AN', endorserName: 'Alex Nakamura at Acme', endorserColor: '#1565C0', featuredSkills: CSM_FEATURED_SKILLS, expertBlock: CSM_EXPERT_BLOCK },
  mateo: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  'jaydon-torff': { skills: HR_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
  '1': { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  '2': { skills: SALES_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  '3': { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  l1: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'C', endorserName: 'Cong Wang at Acme', endorserColor: '#2E7D32' },
  l2: { skills: CUSTOMER_SUCCESS_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
  l3: { skills: PROFESSIONAL_SERVICES_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
  l4: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: '—', endorserName: '—', endorserColor: '#2E7D32' },
  l5: { skills: CUSTOMER_SUCCESS_SKILLS, endorserInitials: '—', endorserName: '—', endorserColor: '#5C6BC0' },
  l6: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  l7: { skills: CUSTOMER_SUCCESS_SKILLS, endorserInitials: 'E', endorserName: 'Ethan Declerq at Acme', endorserColor: '#5C6BC0' },
  l8: { skills: HR_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
  l9: { skills: PROFESSIONAL_SERVICES_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
  l10: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'C', endorserName: 'Cong Wang at Acme', endorserColor: '#2E7D32' },
  l11: { skills: SALES_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  l12: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s1: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s2: { skills: SALES_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s3: { skills: CUSTOMER_SUCCESS_SKILLS, endorserInitials: 'E', endorserName: 'Ethan Declerq at Acme', endorserColor: '#5C6BC0' },
  s4: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s5: { skills: SALES_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s6: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  s7: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'C', endorserName: 'Christina Stokes at Acme', endorserColor: '#8D6E63' },
  s8: { skills: PROFESSIONAL_SERVICES_SKILLS, endorserInitials: 'C', endorserName: 'Cong Wang at Acme', endorserColor: '#2E7D32' },
  o1: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o2: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o3: { skills: CUSTOMER_SUCCESS_SKILLS, endorserInitials: 'E', endorserName: 'Ethan Declerq at Acme', endorserColor: '#5C6BC0' },
  o4: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o5: { skills: SALES_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o6: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o7: { skills: SALES_ENGINEERING_SKILLS, endorserInitials: 'M', endorserName: 'Mateo Myer at Acme', endorserColor: '#E07C24' },
  o8: { skills: PROFESSIONAL_SERVICES_SKILLS, endorserInitials: 'S', endorserName: 'Sarah Chen at Acme', endorserColor: '#5C6BC0' },
}

/* Shared avatar pool for derived featured-skill endorsers. */
const DERIVED_ENDORSERS: FeaturedSkillEndorser[] = [
  { initials: 'AN', color: '#1565C0', photoSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
  { initials: 'CW', color: '#2E7D32', photoSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
  { initials: 'RK', color: '#6A1B9A', photoSrc: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&crop=face' },
  { initials: 'JT', color: '#AD1457', photoSrc: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face' },
  { initials: 'PS', color: '#00838F', photoSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face' },
]

/** "Mateo Myer at Acme" -> "Mateo Myer"; "—" -> "" */
function endorserDisplayName(endorserName: string): string {
  if (!endorserName || endorserName === '—') return ''
  return endorserName.replace(/\s+at\s+.+$/i, '').trim()
}

/**
 * Build the 3-column featured section (top 2 endorsed skills + an "Expert in N"
 * block) from a profile's skills, so every profile shows it — not just ones
 * with hand-authored featured data.
 */
function deriveFeatured(skills: ProfileSkill[], endorserName: string): { featuredSkills: FeaturedSkill[]; expertBlock?: ExpertBlock } {
  const ranked = skills
    .filter((s) => s.endorsementCount != null)
    .sort((a, b) => (b.endorsementCount ?? 0) - (a.endorsementCount ?? 0))
  if (ranked.length === 0) return { featuredSkills: [] }

  const name = endorserDisplayName(endorserName)
  const featuredSkills: FeaturedSkill[] = ranked.slice(0, 2).map((s, i) => {
    const others = Math.min((s.endorsementCount ?? 2) - 1, 6)
    const avatarCount = Math.min(Math.max(others + 1, 3), DERIVED_ENDORSERS.length)
    const endorsers = [...DERIVED_ENDORSERS.slice(i), ...DERIVED_ENDORSERS.slice(0, i)].slice(0, avatarCount)
    const endorserSummary = name
      ? `${name} and ${others} other${others === 1 ? '' : 's'} at Acme`
      : `${others + 1} colleagues at Acme`
    return { name: s.name, endorserSummary, endorsers }
  })

  const expertNames = ranked.slice(0, 6).map((s) => s.name)
  const expertBlock: ExpertBlock = { count: expertNames.length, skills: expertNames }
  return { featuredSkills, expertBlock }
}

export function getProfileSkills(personId: string) {
  const entry = PROFILE_SKILLS[personId] ?? {
    skills: SALES_ENGINEERING_SKILLS,
    endorserInitials: '—',
    endorserName: '—',
    endorserColor: '#A1A6B1',
  }
  // Keep hand-authored featured data; otherwise derive it so the 3-column
  // section appears on every profile.
  if (entry.featuredSkills && entry.featuredSkills.length > 0) return entry
  const { featuredSkills, expertBlock } = deriveFeatured(entry.skills, entry.endorserName)
  return { ...entry, featuredSkills, expertBlock }
}
