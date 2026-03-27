export interface ProfileSkill {
  name: string
  endorsementCount?: number
  endorsed?: boolean
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

/** Skills by profile person ID. Uses mateo/jaydon-torff for current user; 1,2,3,l1-l12 for team profiles. */
export const PROFILE_SKILLS: Record<string, { skills: ProfileSkill[]; endorserInitials: string; endorserName: string; endorserColor: string }> = {
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

export function getProfileSkills(personId: string) {
  return PROFILE_SKILLS[personId] ?? {
    skills: SALES_ENGINEERING_SKILLS,
    endorserInitials: '—',
    endorserName: '—',
    endorserColor: '#A1A6B1',
  }
}
