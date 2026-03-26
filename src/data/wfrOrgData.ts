/**
 * Workforce Readiness dashboard demo data.
 * Org-level AI Potential (48%), Readiness (24%), augmentable headcount (8,400), and
 * transformation gap align with Octave metric definitions (example table).
 */

export const EM = '\u2014'
export const EN = '\u2013'

export const ORG = {
  totalEmployees: 9940,
  aiPotential: 48,
  aiReadiness: 24,
  totalRoleTasks: 220,
  /** Tasks in 15–75% augmentation band */
  tasksInAugZone: 136,
  /** Tasks scoring above 75% (automatable) */
  tasksAboveThreshold: 28,
  /** Tasks scoring below 15% (human-only band) */
  tasksBelowThreshold: 56,
  peopleInAugRoles: 8400,
  hrsPerPersonWeek: 4,
  departments: [
    { name: 'Administrative', employees: 677, aiPotential: 68, aiReadiness: 11 },
    { name: 'Finance', employees: 677, aiPotential: 62, aiReadiness: 13 },
    { name: 'Marketing', employees: 610, aiPotential: 50, aiReadiness: 23 },
    { name: 'Operations', employees: 847, aiPotential: 45, aiReadiness: 17 },
    { name: 'HR', employees: 320, aiPotential: 42, aiReadiness: 18 },
    { name: 'Sales', employees: 1240, aiPotential: 37, aiReadiness: 26 },
    { name: 'Engineering', employees: 2100, aiPotential: 35, aiReadiness: 35 },
    { name: 'Legal', employees: 290, aiPotential: 31, aiReadiness: 17 },
    { name: 'Customer Success', employees: 820, aiPotential: 40, aiReadiness: 22 },
    { name: 'Product', employees: 415, aiPotential: 36, aiReadiness: 33 },
    { name: 'IT & Security', employees: 465, aiPotential: 32, aiReadiness: 42 },
    { name: 'Data & Analytics', employees: 395, aiPotential: 44, aiReadiness: 38 },
    { name: 'Partnerships', employees: 245, aiPotential: 30, aiReadiness: 24 },
    { name: 'Procurement', employees: 195, aiPotential: 57, aiReadiness: 15 },
    { name: 'Facilities', employees: 155, aiPotential: 51, aiReadiness: 12 },
    { name: 'Communications', employees: 125, aiPotential: 43, aiReadiness: 27 },
    { name: 'Quality & Compliance', employees: 364, aiPotential: 38, aiReadiness: 19 },
  ],
  roles: {
    Administrative: [
      { title: 'Data Entry Clerk', employees: 130, aiPotential: 74, aiReadiness: 7 },
      { title: 'Administrative Assistant', employees: 163, aiPotential: 68, aiReadiness: 12 },
      { title: 'Document Controller', employees: 103, aiPotential: 62, aiReadiness: 11 },
      { title: 'Executive Assistant', employees: 120, aiPotential: 45, aiReadiness: 21 },
      { title: 'Records Manager', employees: 30, aiPotential: 58, aiReadiness: 9 },
      { title: 'Office Coordinator', employees: 76, aiPotential: 50, aiReadiness: 15 },
      { title: 'Receptionist', employees: 55, aiPotential: 42, aiReadiness: 18 },
    ],
    Finance: [
      { title: 'Financial Clerk', employees: 180, aiPotential: 63, aiReadiness: 11 },
      { title: 'Accounts Payable Specialist', employees: 120, aiPotential: 58, aiReadiness: 13 },
      { title: 'Financial Analyst', employees: 110, aiPotential: 42, aiReadiness: 22 },
      { title: 'Revenue Accountant', employees: 95, aiPotential: 55, aiReadiness: 10 },
      { title: 'Payroll Specialist', employees: 82, aiPotential: 60, aiReadiness: 14 },
      { title: 'Tax Analyst', employees: 90, aiPotential: 48, aiReadiness: 18 },
    ],
    Operations: [
      { title: 'Logistics Coordinator', employees: 262, aiPotential: 53, aiReadiness: 15 },
      { title: 'Supply Chain Analyst', employees: 193, aiPotential: 39, aiReadiness: 19 },
      { title: 'Operations Manager', employees: 30, aiPotential: 25, aiReadiness: 27 },
      { title: 'Process Improvement Specialist', employees: 152, aiPotential: 46, aiReadiness: 14 },
      { title: 'Warehouse Supervisor', employees: 30, aiPotential: 38, aiReadiness: 11 },
      { title: 'Fleet Coordinator', employees: 180, aiPotential: 42, aiReadiness: 13 },
    ],
    'Customer Success': [
      { title: 'Support Specialist', employees: 195, aiPotential: 42, aiReadiness: 17 },
      { title: 'Implementation Consultant', employees: 130, aiPotential: 48, aiReadiness: 20 },
      { title: 'Renewals Specialist', employees: 110, aiPotential: 50, aiReadiness: 19 },
      { title: 'Customer Insights Analyst', employees: 95, aiPotential: 55, aiReadiness: 28 },
      { title: 'Customer Success Manager', employees: 75, aiPotential: 45, aiReadiness: 23 },
      { title: 'Technical Account Manager', employees: 65, aiPotential: 40, aiReadiness: 25 },
      { title: 'Customer Education Specialist', employees: 55, aiPotential: 52, aiReadiness: 30 },
      { title: 'Onboarding Coordinator', employees: 50, aiPotential: 46, aiReadiness: 22 },
      { title: 'Customer Operations Analyst', employees: 45, aiPotential: 58, aiReadiness: 32 },
    ],
    Product: [
      { title: 'Product Manager', employees: 30, aiPotential: 41, aiReadiness: 35 },
      { title: 'Product Designer', employees: 129, aiPotential: 34, aiReadiness: 29 },
      { title: 'Technical Program Manager', employees: 30, aiPotential: 30, aiReadiness: 44 },
      { title: 'UX Researcher', employees: 105, aiPotential: 38, aiReadiness: 32 },
      { title: 'Product Analyst', employees: 121, aiPotential: 52, aiReadiness: 30 },
    ],
    'IT & Security': [
      { title: 'IT Support Specialist', employees: 130, aiPotential: 37, aiReadiness: 40 },
      { title: 'Security Operations Analyst', employees: 95, aiPotential: 33, aiReadiness: 44 },
      { title: 'Systems Administrator', employees: 70, aiPotential: 27, aiReadiness: 43 },
      { title: 'Network Engineer', employees: 85, aiPotential: 35, aiReadiness: 41 },
      { title: 'Cloud Infrastructure Engineer', employees: 85, aiPotential: 40, aiReadiness: 45 },
    ],
    'Data & Analytics': [
      { title: 'Data Analyst', employees: 115, aiPotential: 48, aiReadiness: 35 },
      { title: 'Analytics Engineer', employees: 90, aiPotential: 42, aiReadiness: 42 },
      { title: 'BI Developer', employees: 65, aiPotential: 45, aiReadiness: 38 },
      { title: 'Data Scientist', employees: 70, aiPotential: 50, aiReadiness: 44 },
      { title: 'Data Engineer', employees: 55, aiPotential: 40, aiReadiness: 36 },
    ],
    Partnerships: [
      { title: 'Partnerships Manager', employees: 30, aiPotential: 35, aiReadiness: 26 },
      { title: 'Alliance Director', employees: 15, aiPotential: 25, aiReadiness: 22 },
      { title: 'Channel Development Rep', employees: 170, aiPotential: 40, aiReadiness: 20 },
      { title: 'Business Development Manager', employees: 30, aiPotential: 32, aiReadiness: 28 },
    ],
    Procurement: [
      { title: 'Procurement Specialist', employees: 72, aiPotential: 60, aiReadiness: 14 },
      { title: 'Category Manager', employees: 30, aiPotential: 52, aiReadiness: 18 },
      { title: 'Vendor Relations Analyst', employees: 50, aiPotential: 55, aiReadiness: 12 },
      { title: 'Sourcing Coordinator', employees: 43, aiPotential: 48, aiReadiness: 16 },
    ],
    Facilities: [
      { title: 'Workplace Coordinator', employees: 50, aiPotential: 54, aiReadiness: 11 },
      { title: 'Facilities Manager', employees: 35, aiPotential: 45, aiReadiness: 14 },
      { title: 'Space Planner', employees: 35, aiPotential: 42, aiReadiness: 10 },
      { title: 'Building Services Technician', employees: 35, aiPotential: 30, aiReadiness: 13 },
    ],
    Communications: [
      { title: 'Corporate Communications Manager', employees: 35, aiPotential: 45, aiReadiness: 29 },
      { title: 'Internal Communications Specialist', employees: 30, aiPotential: 40, aiReadiness: 25 },
      { title: 'PR Specialist', employees: 30, aiPotential: 48, aiReadiness: 27 },
      { title: 'Content Editor', employees: 30, aiPotential: 52, aiReadiness: 24 },
    ],
    'Quality & Compliance': [
      { title: 'Quality Assurance Lead', employees: 35, aiPotential: 40, aiReadiness: 21 },
      { title: 'Compliance Specialist', employees: 100, aiPotential: 37, aiReadiness: 18 },
      { title: 'Internal Auditor', employees: 80, aiPotential: 34, aiReadiness: 17 },
      { title: 'Risk Analyst', employees: 79, aiPotential: 42, aiReadiness: 19 },
      { title: 'Regulatory Affairs Coordinator', employees: 70, aiPotential: 36, aiReadiness: 16 },
    ],
    Marketing: [
      { title: 'Marketing Manager', employees: 30, aiPotential: 52, aiReadiness: 24 },
      { title: 'Content Marketing Specialist', employees: 145, aiPotential: 58, aiReadiness: 19 },
      { title: 'Digital Campaign Analyst', employees: 137, aiPotential: 61, aiReadiness: 22 },
      { title: 'Brand & Creative Lead', employees: 40, aiPotential: 46, aiReadiness: 28 },
      { title: 'SEO Specialist', employees: 107, aiPotential: 55, aiReadiness: 20 },
      { title: 'Marketing Operations Analyst', employees: 121, aiPotential: 50, aiReadiness: 25 },
      { title: 'Growth Marketing Manager', employees: 30, aiPotential: 48, aiReadiness: 23 },
    ],
    HR: [
      { title: 'Talent Acquisition Specialist', employees: 64, aiPotential: 55, aiReadiness: 16 },
      { title: 'People Operations Coordinator', employees: 58, aiPotential: 48, aiReadiness: 14 },
      { title: 'HR Business Partner', employees: 40, aiPotential: 44, aiReadiness: 26 },
      { title: 'Compensation Analyst', employees: 52, aiPotential: 38, aiReadiness: 20 },
      { title: 'L&D Manager', employees: 30, aiPotential: 42, aiReadiness: 18 },
      { title: 'Employee Experience Lead', employees: 35, aiPotential: 35, aiReadiness: 22 },
      { title: 'HRIS Analyst', employees: 41, aiPotential: 50, aiReadiness: 15 },
    ],
    Sales: [
      { title: 'Account Executive', employees: 331, aiPotential: 42, aiReadiness: 28 },
      { title: 'Sales Development Representative', employees: 238, aiPotential: 49, aiReadiness: 21 },
      { title: 'Solutions Consultant', employees: 212, aiPotential: 51, aiReadiness: 31 },
      { title: 'Regional Sales Director', employees: 15, aiPotential: 35, aiReadiness: 24 },
      { title: 'Sales Operations Analyst', employees: 146, aiPotential: 56, aiReadiness: 18 },
      { title: 'Enterprise Account Manager', employees: 30, aiPotential: 40, aiReadiness: 30 },
      { title: 'Channel Sales Manager', employees: 30, aiPotential: 38, aiReadiness: 26 },
      { title: 'Sales Enablement Specialist', employees: 106, aiPotential: 52, aiReadiness: 22 },
      { title: 'Inside Sales Representative', employees: 132, aiPotential: 46, aiReadiness: 20 },
    ],
    Engineering: [
      { title: 'Software Engineer', employees: 567, aiPotential: 44, aiReadiness: 38 },
      { title: 'Senior Software Engineer', employees: 414, aiPotential: 39, aiReadiness: 42 },
      { title: 'Engineering Manager', employees: 30, aiPotential: 33, aiReadiness: 35 },
      { title: 'QA Automation Engineer', employees: 218, aiPotential: 47, aiReadiness: 29 },
      { title: 'DevOps Engineer', employees: 196, aiPotential: 41, aiReadiness: 40 },
      { title: 'Frontend Engineer', employees: 261, aiPotential: 43, aiReadiness: 36 },
      { title: 'Platform Engineer', employees: 174, aiPotential: 38, aiReadiness: 41 },
      { title: 'Mobile Developer', employees: 131, aiPotential: 42, aiReadiness: 34 },
      { title: 'Site Reliability Engineer', employees: 109, aiPotential: 36, aiReadiness: 43 },
    ],
    Legal: [
      { title: 'Corporate Counsel', employees: 40, aiPotential: 36, aiReadiness: 22 },
      { title: 'Corporate Paralegal', employees: 102, aiPotential: 52, aiReadiness: 15 },
      { title: 'Contract Manager', employees: 30, aiPotential: 58, aiReadiness: 19 },
      { title: 'Employment Law Specialist', employees: 78, aiPotential: 34, aiReadiness: 16 },
      { title: 'IP Counsel', employees: 40, aiPotential: 30, aiReadiness: 20 },
    ],
  },
  tasks: {
    'Financial Clerk': [
{ task: 'Data entry', score: 92 },
      { task: 'Transaction processing', score: 88 },
      { task: 'Report generation', score: 82 },
      { task: 'Record maintenance', score: 55 },
      { task: 'Compliance review', score: 45 },
      { task: 'Exception handling', score: 12 },
      { task: 'Client communication', score: 8 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 74 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 25 }
    ],
    'Data Entry Clerk': [
{ task: 'Form data input', score: 95 },
      { task: 'Data validation', score: 90 },
      { task: 'Document scanning', score: 88 },
      { task: 'Error correction', score: 42 },
      { task: 'Quality review', score: 11 },
      { task: 'Stakeholder queries', score: 10 },
      { task: 'Schedule management', score: 77 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 76 },
      { task: 'Data entry and updates', score: 83 }
    ],
    'Administrative Assistant': [
{ task: 'Calendar management', score: 85 },
      { task: 'Travel booking', score: 82 },
      { task: 'Expense reporting', score: 80 },
      { task: 'Email drafting', score: 65 },
      { task: 'Meeting minutes', score: 58 },
      { task: 'Vendor coordination', score: 40 },
      { task: 'Stakeholder liaison', score: 12 },
      { task: 'Confidential matters', score: 8 },
      { task: 'Schedule management', score: 60 },
      { task: 'Email triage and response', score: 87 }
    ],
    'Document Controller': [
{ task: 'File indexing', score: 90 },
      { task: 'Version tracking', score: 85 },
      { task: 'Distribution logging', score: 82 },
      { task: 'Compliance checking', score: 52 },
      { task: 'Retention scheduling', score: 45 },
      { task: 'Stakeholder coordination', score: 12 },
      { task: 'Audit support', score: 10 },
      { task: 'Schedule management', score: 63 },
      { task: 'Email triage and response', score: 76 },
      { task: 'Report generation', score: 74 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 70 },
      { task: 'Document formatting', score: 82 },
      { task: 'Stakeholder communication', score: 21 },
      { task: 'Process documentation', score: 54 },
      { task: 'Compliance tracking', score: 52 }
    ],
    'Executive Assistant': [
{ task: 'Calendar management', score: 85 },
      { task: 'Travel logistics', score: 78 },
      { task: 'Correspondence drafting', score: 68 },
      { task: 'Meeting prep', score: 55 },
      { task: 'Confidential advisory', score: 12 },
      { task: 'Stakeholder relations', score: 10 },
      { task: 'Strategic coordination', score: 8 },
      { task: 'Executive judgment support', score: 5 },
      { task: 'Schedule management', score: 78 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 77 },
      { task: 'Data entry and updates', score: 89 },
      { task: 'Meeting coordination', score: 61 }
    ],
    'Accounts Payable Specialist': [
{ task: 'Invoice processing', score: 92 },
      { task: 'Payment scheduling', score: 88 },
      { task: 'Data reconciliation', score: 85 },
      { task: 'Vendor statement matching', score: 58 },
      { task: 'Discrepancy resolution', score: 11 },
      { task: 'Vendor relationships', score: 10 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 80 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 64 },
      { task: 'Document formatting', score: 86 },
      { task: 'Stakeholder communication', score: 23 },
      { task: 'Process documentation', score: 50 }
    ],
    'Financial Analyst': [
{ task: 'Data aggregation', score: 88 },
      { task: 'Report formatting', score: 82 },
      { task: 'Variance analysis', score: 62 },
      { task: 'Forecast modeling', score: 55 },
      { task: 'Business partnering', score: 12 },
      { task: 'Strategic interpretation', score: 10 },
      { task: 'Risk assessment', score: 8 },
      { task: 'Exec communication', score: 5 },
      { task: 'Schedule management', score: 77 },
      { task: 'Email triage and response', score: 70 },
      { task: 'Report generation', score: 68 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 64 },
      { task: 'Document formatting', score: 76 }
    ],
    'Logistics Coordinator': [
{ task: 'Shipment tracking', score: 88 },
      { task: 'Performance reporting', score: 82 },
      { task: 'Route optimization', score: 65 },
      { task: 'Carrier communication', score: 48 },
      { task: 'Customs documentation', score: 38 },
      { task: 'Exception management', score: 12 },
      { task: 'Vendor negotiation', score: 8 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 78 },
      { task: 'Report generation', score: 70 },
      { task: 'Data entry and updates', score: 92 }
    ],
    'Supply Chain Analyst': [
{ task: 'Inventory reporting', score: 85 },
      { task: 'Demand forecasting', score: 86 },
      { task: 'Supplier performance analysis', score: 48 },
      { task: 'Risk identification', score: 12 },
      { task: 'Process improvement', score: 10 },
      { task: 'Cross-functional coordination', score: 8 },
      { task: 'Strategic sourcing', score: 5 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 65 }
    ],
    'Operations Manager': [
{ task: 'Performance dashboarding', score: 80 },
      { task: 'Reporting', score: 89 },
      { task: 'Team leadership', score: 8 },
      { task: 'Process design', score: 10 },
      { task: 'Stakeholder management', score: 7 },
      { task: 'Resource allocation', score: 12 },
      { task: 'Strategic planning', score: 5 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 80 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 64 },
      { task: 'Document formatting', score: 72 },
      { task: 'Stakeholder communication', score: 23 },
      { task: 'Process documentation', score: 50 }
    ],
    'Customer Success Manager': [
{ task: 'Health score monitoring', score: 91 },
      { task: 'QBR deck preparation', score: 65 },
      { task: 'Renewal forecasting', score: 58 },
      { task: 'Escalation triage', score: 35 },
      { task: 'Executive alignment', score: 8 },
      { task: 'Churn prevention strategy', score: 12 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 94 },
      { task: 'Meeting coordination', score: 57 },
      { task: 'Document formatting', score: 71 },
      { task: 'Stakeholder communication', score: 28 },
      { task: 'Process documentation', score: 61 },
      { task: 'Compliance tracking', score: 59 }
    ],
    'Implementation Consultant': [
{ task: 'Onboarding checklist execution', score: 78 },
      { task: 'Training session delivery', score: 62 },
      { task: 'Configuration documentation', score: 55 },
      { task: 'Integration troubleshooting', score: 42 },
      { task: 'Change management', score: 6 },
      { task: 'Stakeholder workshops', score: 10 },
      { task: 'Schedule management', score: 75 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 66 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 62 },
      { task: 'Document formatting', score: 76 }
    ],
    'Support Specialist': [
{ task: 'Ticket triage & routing', score: 82 },
      { task: 'Knowledge base updates', score: 75 },
      { task: 'First-response drafting', score: 68 },
      { task: 'Bug reproduction', score: 48 },
      { task: 'Customer empathy calls', score: 11 },
      { task: 'Severity escalation', score: 8 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 88 },
      { task: 'Meeting coordination', score: 65 },
      { task: 'Document formatting', score: 85 }
    ],
    'Product Manager': [
{ task: 'Backlog grooming', score: 58 },
      { task: 'PRD drafting', score: 52 },
      { task: 'Analytics review', score: 84 },
      { task: 'User interview synthesis', score: 35 },
      { task: 'Roadmap negotiation', score: 8 },
      { task: 'Launch coordination', score: 8 },
      { task: 'Schedule management', score: 64 },
      { task: 'Email triage and response', score: 71 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 32 },
      { task: 'Conflict resolution', score: 4 },
      { task: 'Client relationship management', score: 12 }
    ],
    'Product Designer': [
{ task: 'Wireframing', score: 91 },
      { task: 'Design system application', score: 55 },
      { task: 'Usability test notes', score: 48 },
      { task: 'Prototype handoff', score: 42 },
      { task: 'Accessibility review', score: 9 },
      { task: 'Stakeholder critique sessions', score: 12 },
      { task: 'Schedule management', score: 68 },
      { task: 'Email triage and response', score: 75 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 94 },
      { task: 'Meeting coordination', score: 71 },
      { task: 'Document formatting', score: 85 },
      { task: 'Stakeholder communication', score: 30 }
    ],
    'Technical Program Manager': [
{ task: 'Dependency tracking', score: 87 },
      { task: 'Risk register maintenance', score: 42 },
      { task: 'Cross-team sync facilitation', score: 35 },
      { task: 'Executive reporting', score: 28 },
      { task: 'Technical tradeoff analysis', score: 8 },
      { task: 'Milestone enforcement', score: 10 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 75 },
      { task: 'Report generation', score: 73 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 77 },
      { task: 'Stakeholder communication', score: 20 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 51 },
      { task: 'Team coordination', score: 24 }
    ],
    'IT Support Specialist': [
{ task: 'Ticket resolution', score: 85 },
      { task: 'Account provisioning', score: 68 },
      { task: 'Hardware imaging', score: 55 },
      { task: 'Knowledge article writing', score: 48 },
      { task: 'Security awareness nudges', score: 6 },
      { task: 'Onsite walk-up support', score: 11 },
      { task: 'Schedule management', score: 75 },
      { task: 'Email triage and response', score: 82 },
      { task: 'Report generation', score: 74 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 58 }
    ],
    'Security Operations Analyst': [
{ task: 'Alert triage', score: 80 },
      { task: 'SIEM query building', score: 58 },
      { task: 'Incident timeline docs', score: 45 },
      { task: 'Phishing analysis', score: 52 },
      { task: 'Vendor security review', score: 11 },
      { task: 'Threat intel briefing', score: 12 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 89 },
      { task: 'Meeting coordination', score: 57 },
      { task: 'Document formatting', score: 87 },
      { task: 'Stakeholder communication', score: 28 },
      { task: 'Process documentation', score: 61 }
    ],
    'Systems Administrator': [
{ task: 'Patch scheduling', score: 84 },
      { task: 'Capacity monitoring', score: 48 },
      { task: 'Backup verification', score: 42 },
      { task: 'Access reviews', score: 38 },
      { task: 'Change window execution', score: 12 },
      { task: 'Architecture input', score: 8 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 58 },
      { task: 'Document formatting', score: 72 },
      { task: 'Stakeholder communication', score: 29 }
    ],
    'Data Analyst': [
{ task: 'SQL reporting', score: 78 },
      { task: 'Dashboard maintenance', score: 72 },
      { task: 'Ad hoc extracts', score: 65 },
      { task: 'Data quality checks', score: 48 },
      { task: 'Insight storytelling', score: 9 },
      { task: 'Metric definition debates', score: 10 },
      { task: 'Schedule management', score: 68 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 81 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 59 }
    ],
    'Analytics Engineer': [
{ task: 'Pipeline development', score: 88 },
      { task: 'dbt model maintenance', score: 58 },
      { task: 'Schema design', score: 45 },
      { task: 'Job failure debugging', score: 38 },
      { task: 'Self-serve enablement', score: 10 },
      { task: 'Governance policies', score: 8 },
      { task: 'Schedule management', score: 65 },
      { task: 'Email triage and response', score: 72 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 82 },
      { task: 'Stakeholder communication', score: 27 },
      { task: 'Process documentation', score: 54 },
      { task: 'Compliance tracking', score: 46 }
    ],
    'BI Developer': [
{ task: 'Report building', score: 83 },
      { task: 'Semantic layer updates', score: 62 },
      { task: 'Performance tuning', score: 48 },
      { task: 'User training', score: 35 },
      { task: 'Requirement gathering', score: 10 },
      { task: 'Executive briefing support', score: 12 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 80 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 64 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 23 },
      { task: 'Process documentation', score: 50 }
    ],
    'Partnerships Manager': [
{ task: 'Partner pipeline tracking', score: 81 },
      { task: 'Contract redlines', score: 38 },
      { task: 'Joint GTM planning', score: 32 },
      { task: 'Quarterly business reviews', score: 28 },
      { task: 'Relationship mapping', score: 9 },
      { task: 'Strategic bets', score: 8 },
      { task: 'Schedule management', score: 68 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 77 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 59 },
      { task: 'Compliance tracking', score: 57 },
      { task: 'Team coordination', score: 30 },
      { task: 'Conflict resolution', score: 5 }
    ],
    'Alliance Director': [
{ task: 'Executive partner meetings', score: 22 },
      { task: 'Ecosystem strategy', score: 18 },
      { task: 'Co-selling coordination', score: 35 },
      { task: 'Due diligence support', score: 89 },
      { task: 'Brand alignment', score: 12 },
      { task: 'Board-level narratives', score: 5 },
      { task: 'Schedule management', score: 65 },
      { task: 'Email triage and response', score: 72 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 84 },
      { task: 'Stakeholder communication', score: 27 },
      { task: 'Process documentation', score: 54 },
      { task: 'Compliance tracking', score: 46 },
      { task: 'Team coordination', score: 33 },
      { task: 'Conflict resolution', score: 5 },
      { task: 'Client relationship management', score: 13 },
      { task: 'Strategic planning input', score: 6 },
      { task: 'Cross-functional collaboration', score: 16 }
    ],
    'Procurement Specialist': [
{ task: 'PO processing', score: 88 },
      { task: 'Vendor quote comparison', score: 78 },
      { task: 'Contract filing', score: 72 },
      { task: 'Spend category reporting', score: 55 },
      { task: 'Supplier negotiation prep', score: 6 },
      { task: 'Stakeholder intake', score: 7 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 58 },
      { task: 'Document formatting', score: 84 },
      { task: 'Stakeholder communication', score: 29 },
      { task: 'Process documentation', score: 62 }
    ],
    'Category Manager': [
{ task: 'Category strategy decks', score: 48 },
      { task: 'RFx execution', score: 81 },
      { task: 'Savings tracking', score: 52 },
      { task: 'Market benchmarking', score: 42 },
      { task: 'Supplier QBRs', score: 10 },
      { task: 'Risk assessment', score: 12 },
      { task: 'Schedule management', score: 65 },
      { task: 'Email triage and response', score: 78 },
      { task: 'Report generation', score: 76 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 72 },
      { task: 'Document formatting', score: 82 },
      { task: 'Stakeholder communication', score: 23 },
      { task: 'Process documentation', score: 56 },
      { task: 'Compliance tracking', score: 54 },
      { task: 'Team coordination', score: 27 },
      { task: 'Conflict resolution', score: 7 },
      { task: 'Client relationship management', score: 9 },
      { task: 'Strategic planning input', score: 10 }
    ],
    'Workplace Coordinator': [
{ task: 'Desk & badge assignments', score: 80 },
      { task: 'Vendor work orders', score: 68 },
      { task: 'Event logistics', score: 55 },
      { task: 'Safety walkthroughs', score: 38 },
      { task: 'Employee requests', score: 6 },
      { task: 'Budget tracking', score: 12 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 65 }
    ],
    'Facilities Manager': [
{ task: 'CapEx planning', score: 82 },
      { task: 'Lease administration', score: 38 },
      { task: 'Vendor management', score: 35 },
      { task: 'Emergency response', score: 7 },
      { task: 'Space planning', score: 28 },
      { task: 'Sustainability reporting', score: 5 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 75 },
      { task: 'Report generation', score: 73 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 77 },
      { task: 'Stakeholder communication', score: 20 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 51 }
    ],
    'Corporate Communications Manager': [
{ task: 'Press release drafting', score: 58 },
      { task: 'Media monitoring', score: 84 },
      { task: 'Crisis comms playbooks', score: 25 },
      { task: 'Executive talking points', score: 32 },
      { task: 'Agency coordination', score: 8 },
      { task: 'Narrative strategy', score: 12 },
      { task: 'Schedule management', score: 77 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 76 },
      { task: 'Data entry and updates', score: 93 },
      { task: 'Meeting coordination', score: 60 },
      { task: 'Document formatting', score: 78 },
      { task: 'Stakeholder communication', score: 39 },
      { task: 'Process documentation', score: 66 },
      { task: 'Compliance tracking', score: 58 },
      { task: 'Team coordination', score: 25 },
      { task: 'Conflict resolution', score: 3 }
    ],
    'Internal Communications Specialist': [
{ task: 'All-hands content', score: 62 },
      { task: 'Intranet updates', score: 84 },
      { task: 'Change campaigns', score: 48 },
      { task: 'Employee surveys', score: 55 },
      { task: 'Leadership cascades', score: 8 },
      { task: 'Culture programming', score: 8 },
      { task: 'Schedule management', score: 67 },
      { task: 'Email triage and response', score: 80 },
      { task: 'Report generation', score: 78 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 74 },
      { task: 'Document formatting', score: 86 },
      { task: 'Stakeholder communication', score: 25 },
      { task: 'Process documentation', score: 58 },
      { task: 'Compliance tracking', score: 56 },
      { task: 'Team coordination', score: 29 }
    ],
    'Quality Assurance Lead': [
{ task: 'Test plan authoring', score: 87 },
      { task: 'Regression coordination', score: 52 },
      { task: 'Defect triage', score: 48 },
      { task: 'Release sign-off', score: 35 },
      { task: 'Process audits', score: 11 },
      { task: 'Vendor quality reviews', score: 11 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 67 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 18 },
      { task: 'Conflict resolution', score: 9 },
      { task: 'Client relationship management', score: 11 },
      { task: 'Strategic planning input', score: 5 }
    ],
    'Compliance Specialist': [
{ task: 'Policy updates', score: 55 },
      { task: 'Control testing evidence', score: 80 },
      { task: 'Regulatory horizon scanning', score: 38 },
      { task: 'Training assignments', score: 48 },
      { task: 'Audit response drafting', score: 12 },
      { task: 'Exception approvals', score: 8 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 32 }
    ],
    'Internal Auditor': [
{ task: 'Sampling & testing', score: 86 },
      { task: 'Finding write-ups', score: 48 },
      { task: 'Walkthrough interviews', score: 35 },
      { task: 'Remediation tracking', score: 42 },
      { task: 'Board reporting input', score: 10 },
      { task: 'Fraud indicators', score: 8 },
      { task: 'Schedule management', score: 63 },
      { task: 'Email triage and response', score: 70 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 89 },
      { task: 'Meeting coordination', score: 66 },
      { task: 'Document formatting', score: 80 },
      { task: 'Stakeholder communication', score: 25 }
    ],
    'Marketing Manager': [
{ task: 'Campaign planning', score: 85 },
      { task: 'Budget forecasting', score: 55 },
      { task: 'Vendor briefing', score: 48 },
      { task: 'Stakeholder reviews', score: 8 },
      { task: 'Market research synthesis', score: 62 },
      { task: 'Executive narrative', score: 8 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 74 },
      { task: 'Report generation', score: 72 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 39 },
      { task: 'Process documentation', score: 52 },
      { task: 'Compliance tracking', score: 50 },
      { task: 'Team coordination', score: 23 },
      { task: 'Conflict resolution', score: 6 },
      { task: 'Client relationship management', score: 8 },
      { task: 'Strategic planning input', score: 9 },
      { task: 'Cross-functional collaboration', score: 15 }
    ],
    'Content Marketing Specialist': [
{ task: 'SEO content drafting', score: 78 },
      { task: 'Editorial calendar', score: 65 },
      { task: 'Social scheduling', score: 58 },
      { task: 'Asset localization', score: 42 },
      { task: 'Performance reporting', score: 10 },
      { task: 'Brand guideline checks', score: 11 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 32 },
      { task: 'Process documentation', score: 59 },
      { task: 'Compliance tracking', score: 51 }
    ],
    'Digital Campaign Analyst': [
{ task: 'Audience segmentation', score: 82 },
      { task: 'Bid optimization', score: 88 },
      { task: 'Attribution modeling', score: 48 },
      { task: 'A/B test analysis', score: 55 },
      { task: 'Creative testing', score: 5 },
      { task: 'Platform experiments', score: 9 },
      { task: 'Schedule management', score: 66 },
      { task: 'Email triage and response', score: 73 },
      { task: 'Report generation', score: 65 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 28 },
      { task: 'Process documentation', score: 55 },
      { task: 'Compliance tracking', score: 47 },
      { task: 'Team coordination', score: 34 }
    ],
    'Brand & Creative Lead': [
{ task: 'Creative direction', score: 58 },
      { task: 'Design systems', score: 42 },
      { task: 'Agency coordination', score: 8 },
      { task: 'Brand approvals', score: 83 },
      { task: 'Photo/video briefs', score: 48 },
      { task: 'Trademark reviews', score: 6 },
      { task: 'Schedule management', score: 78 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 77 },
      { task: 'Data entry and updates', score: 89 },
      { task: 'Meeting coordination', score: 61 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 20 },
      { task: 'Process documentation', score: 67 },
      { task: 'Compliance tracking', score: 59 },
      { task: 'Team coordination', score: 26 },
      { task: 'Conflict resolution', score: 4 },
      { task: 'Client relationship management', score: 12 }
    ],
    'HR Business Partner': [
{ task: 'Headcount planning', score: 86 },
      { task: 'Employee relations cases', score: 35 },
      { task: 'Policy interpretation', score: 48 },
      { task: 'Manager coaching', score: 42 },
      { task: 'Org design input', score: 5 },
      { task: 'Exit interviews', score: 12 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 75 },
      { task: 'Report generation', score: 73 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 85 },
      { task: 'Stakeholder communication', score: 20 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 51 },
      { task: 'Team coordination', score: 24 }
    ],
    'Talent Acquisition Specialist': [
{ task: 'Sourcing outreach', score: 68 },
      { task: 'Screening calls', score: 55 },
      { task: 'Interview scheduling', score: 72 },
      { task: 'Offer negotiation support', score: 6 },
      { task: 'ATS data hygiene', score: 82 },
      { task: 'Campus events', score: 10 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 77 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 67 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 18 }
    ],
    'People Operations Coordinator': [
{ task: 'Onboarding workflows', score: 75 },
      { task: 'HRIS updates', score: 88 },
      { task: 'Benefits inquiries', score: 48 },
      { task: 'Payroll escalations', score: 62 },
      { task: 'Policy acknowledgments', score: 11 },
      { task: 'Employee documentation', score: 11 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 58 }
    ],
    'Compensation Analyst': [
{ task: 'Survey benchmarking', score: 58 },
      { task: 'Merit modeling', score: 48 },
      { task: 'Equity reporting', score: 5 },
      { task: 'Job leveling', score: 42 },
      { task: 'Compliance filings', score: 86 },
      { task: 'Executive summaries', score: 8 },
      { task: 'Schedule management', score: 68 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 75 }
    ],
    'Account Executive': [
{ task: 'Pipeline forecasting', score: 55 },
      { task: 'Discovery calls', score: 12 },
      { task: 'Proposal drafting', score: 85 },
      { task: 'Contract redlines', score: 48 },
      { task: 'QBR preparation', score: 12 },
      { task: 'Renewal negotiation', score: 62 },
      { task: 'Schedule management', score: 67 },
      { task: 'Email triage and response', score: 80 },
      { task: 'Report generation', score: 78 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 74 },
      { task: 'Document formatting', score: 74 },
      { task: 'Stakeholder communication', score: 25 },
      { task: 'Process documentation', score: 58 }
    ],
    'Sales Development Representative': [
{ task: 'Outbound sequences', score: 82 },
      { task: 'Lead qualification', score: 75 },
      { task: 'CRM logging', score: 88 },
      { task: 'Meeting booking', score: 65 },
      { task: 'Territory research', score: 7 },
      { task: 'Partner handoffs', score: 5 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 32 },
      { task: 'Process documentation', score: 59 }
    ],
    'Solutions Consultant': [
{ task: 'Demo scripting', score: 72 },
      { task: 'Technical discovery', score: 58 },
      { task: 'POC scoping', score: 62 },
      { task: 'Solution mapping', score: 5 },
      { task: 'RFx responses', score: 78 },
      { task: 'Enablement sessions', score: 8 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 80 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 64 },
      { task: 'Document formatting', score: 74 }
    ],
    'Regional Sales Director': [
{ task: 'Quota planning', score: 48 },
      { task: 'Deal inspection', score: 42 },
      { task: 'Team coaching', score: 35 },
      { task: 'Forecast reviews', score: 84 },
      { task: 'Channel partner strategy', score: 5 },
      { task: 'Board summaries', score: 12 },
      { task: 'Schedule management', score: 77 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 76 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 60 },
      { task: 'Document formatting', score: 86 },
      { task: 'Stakeholder communication', score: 39 },
      { task: 'Process documentation', score: 66 },
      { task: 'Compliance tracking', score: 58 },
      { task: 'Team coordination', score: 25 },
      { task: 'Conflict resolution', score: 7 },
      { task: 'Client relationship management', score: 8 },
      { task: 'Strategic planning input', score: 8 },
      { task: 'Cross-functional collaboration', score: 18 }
    ],
    'Sales Operations Analyst': [
{ task: 'CPQ maintenance', score: 78 },
      { task: 'Commission calculations', score: 85 },
      { task: 'Territory analytics', score: 62 },
      { task: 'Sales KPI dashboards', score: 72 },
      { task: 'Process automation', score: 7 },
      { task: 'Data quality audits', score: 8 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 32 },
      { task: 'Process documentation', score: 59 },
      { task: 'Compliance tracking', score: 51 },
      { task: 'Team coordination', score: 18 }
    ],
    'Software Engineer': [
{ task: 'Feature implementation', score: 58 },
      { task: 'Code review', score: 48 },
      { task: 'Unit testing', score: 80 },
      { task: 'API integration', score: 55 },
      { task: 'Bug triage', score: 7 },
      { task: 'Documentation', score: 10 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 87 },
      { task: 'Stakeholder communication', score: 30 },
      { task: 'Process documentation', score: 63 }
    ],
    'Senior Software Engineer': [
{ task: 'System design', score: 48 },
      { task: 'Mentoring', score: 6 },
      { task: 'Architecture RFCs', score: 42 },
      { task: 'Incident response', score: 55 },
      { task: 'Performance profiling', score: 89 },
      { task: 'Security review', score: 12 },
      { task: 'Schedule management', score: 60 },
      { task: 'Email triage and response', score: 87 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 22 },
      { task: 'Process documentation', score: 69 },
      { task: 'Compliance tracking', score: 61 }
    ],
    'Engineering Manager': [
{ task: 'Sprint planning', score: 42 },
      { task: 'Hiring loops', score: 9 },
      { task: 'Performance reviews', score: 38 },
      { task: 'Roadmap alignment', score: 48 },
      { task: 'Budget tracking', score: 83 },
      { task: 'Stakeholder updates', score: 8 },
      { task: 'Schedule management', score: 60 },
      { task: 'Email triage and response', score: 87 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 85 },
      { task: 'Stakeholder communication', score: 22 },
      { task: 'Process documentation', score: 69 },
      { task: 'Compliance tracking', score: 61 },
      { task: 'Team coordination', score: 28 }
    ],
    'QA Automation Engineer': [
{ task: 'Test framework build', score: 68 },
      { task: 'CI pipeline tests', score: 82 },
      { task: 'Regression suites', score: 75 },
      { task: 'Flaky test triage', score: 6 },
      { task: 'Coverage reporting', score: 62 },
      { task: 'Manual spot checks', score: 7 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 67 }
    ],
    'DevOps Engineer': [
{ task: 'Infrastructure as code', score: 72 },
      { task: 'Deployment pipelines', score: 78 },
      { task: 'Monitoring & alerts', score: 62 },
      { task: 'Incident remediation', score: 9 },
      { task: 'Cost optimization', score: 6 },
      { task: 'Security patching', score: 68 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 87 }
    ],
    'Corporate Counsel': [
{ task: 'Contract drafting', score: 85 },
      { task: 'Regulatory advisement', score: 42 },
      { task: 'Litigation liaison', score: 35 },
      { task: 'Policy drafting', score: 48 },
      { task: 'Board materials', score: 12 },
      { task: 'Training sessions', score: 6 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 57 },
      { task: 'Document formatting', score: 79 },
      { task: 'Stakeholder communication', score: 28 },
      { task: 'Process documentation', score: 61 },
      { task: 'Compliance tracking', score: 59 },
      { task: 'Team coordination', score: 32 },
      { task: 'Conflict resolution', score: 7 },
      { task: 'Client relationship management', score: 9 },
      { task: 'Strategic planning input', score: 10 },
      { task: 'Cross-functional collaboration', score: 24 }
    ],
    'Corporate Paralegal': [
{ task: 'Discovery support', score: 65 },
      { task: 'Entity filings', score: 72 },
      { task: 'Signature routing', score: 78 },
      { task: 'Docket maintenance', score: 58 },
      { task: 'Research memos', score: 11 },
      { task: 'Notary coordination', score: 8 },
      { task: 'Schedule management', score: 70 },
      { task: 'Email triage and response', score: 77 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 73 },
      { task: 'Document formatting', score: 85 },
      { task: 'Stakeholder communication', score: 32 },
      { task: 'Process documentation', score: 59 },
      { task: 'Compliance tracking', score: 51 },
      { task: 'Team coordination', score: 18 }
    ],
    'Contract Manager': [
{ task: 'Template maintenance', score: 82 },
      { task: 'Renewal tracking', score: 75 },
      { task: 'Clause negotiation', score: 62 },
      { task: 'Vendor onboarding', score: 58 },
      { task: 'Audit prep', score: 7 },
      { task: 'Exception logs', score: 11 },
      { task: 'Schedule management', score: 63 },
      { task: 'Email triage and response', score: 70 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 66 },
      { task: 'Document formatting', score: 72 },
      { task: 'Stakeholder communication', score: 25 },
      { task: 'Process documentation', score: 52 },
      { task: 'Compliance tracking', score: 64 },
      { task: 'Team coordination', score: 31 },
      { task: 'Conflict resolution', score: 8 },
      { task: 'Client relationship management', score: 9 },
      { task: 'Strategic planning input', score: 9 }
    ],
    // --- New roles added below ---
    'Records Manager': [
{ task: 'Document indexing', score: 88 },
      { task: 'Retention scheduling', score: 72 },
      { task: 'Archive retrieval', score: 80 },
      { task: 'Compliance audits', score: 6 },
      { task: 'Policy documentation', score: 55 },
      { task: 'Vendor coordination', score: 8 },
      { task: 'Schedule management', score: 75 },
      { task: 'Email triage and response', score: 82 },
      { task: 'Report generation', score: 74 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 58 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 37 },
      { task: 'Process documentation', score: 64 },
      { task: 'Compliance tracking', score: 56 },
      { task: 'Team coordination', score: 23 },
      { task: 'Conflict resolution', score: 7 },
      { task: 'Client relationship management', score: 8 }
    ],
    'Office Coordinator': [
{ task: 'Calendar management', score: 78 },
      { task: 'Meeting logistics', score: 62 },
      { task: 'Supply ordering', score: 85 },
      { task: 'Visitor check-in', score: 5 },
      { task: 'Expense reporting', score: 72 },
      { task: 'Team event planning', score: 8 },
      { task: 'Schedule management', score: 68 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 81 }
    ],
    'Receptionist': [
{ task: 'Call routing', score: 82 },
      { task: 'Visitor scheduling', score: 68 },
      { task: 'Package tracking', score: 75 },
      { task: 'Badge management', score: 5 },
      { task: 'Client greeting', score: 8 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 78 },
      { task: 'Report generation', score: 70 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 74 }
    ],
    'Revenue Accountant': [
{ task: 'Revenue recognition', score: 78 },
      { task: 'Journal entries', score: 88 },
      { task: 'Period close', score: 72 },
      { task: 'Variance analysis', score: 58 },
      { task: 'Audit documentation', score: 8 },
      { task: 'Cross-team reconciliation', score: 6 },
      { task: 'Schedule management', score: 74 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 73 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 57 },
      { task: 'Document formatting', score: 87 },
      { task: 'Stakeholder communication', score: 36 },
      { task: 'Process documentation', score: 63 },
      { task: 'Compliance tracking', score: 55 }
    ],
    'Payroll Specialist': [
{ task: 'Payroll processing', score: 90 },
      { task: 'Tax withholding', score: 82 },
      { task: 'Benefits deductions', score: 78 },
      { task: 'Compliance reporting', score: 60 },
      { task: 'Employee inquiries', score: 7 },
      { task: 'Audit support', score: 10 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 79 },
      { task: 'Report generation', score: 71 },
      { task: 'Data entry and updates', score: 93 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 81 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 61 },
      { task: 'Compliance tracking', score: 53 }
    ],
    'Tax Analyst': [
{ task: 'Tax return prep', score: 83 },
      { task: 'Provision calculations', score: 68 },
      { task: 'Transfer pricing research', score: 55 },
      { task: 'Compliance filings', score: 62 },
      { task: 'Regulatory monitoring', score: 10 },
      { task: 'Advisory consultation', score: 10 },
      { task: 'Schedule management', score: 69 },
      { task: 'Email triage and response', score: 76 },
      { task: 'Report generation', score: 68 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 72 },
      { task: 'Document formatting', score: 86 },
      { task: 'Stakeholder communication', score: 31 }
    ],
    'SEO Specialist': [
{ task: 'Keyword research', score: 82 },
      { task: 'Content optimization', score: 75 },
      { task: 'Technical audits', score: 68 },
      { task: 'Link strategy', score: 10 },
      { task: 'Performance reporting', score: 78 },
      { task: 'Competitor analysis', score: 8 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 77 },
      { task: 'Stakeholder communication', score: 30 },
      { task: 'Process documentation', score: 63 },
      { task: 'Compliance tracking', score: 61 },
      { task: 'Team coordination', score: 34 }
    ],
    'Marketing Operations Analyst': [
{ task: 'Campaign analytics', score: 78 },
      { task: 'Lead scoring', score: 72 },
      { task: 'Marketing automation', score: 82 },
      { task: 'Data hygiene', score: 88 },
      { task: 'Attribution modeling', score: 9 },
      { task: 'Stakeholder reporting', score: 10 },
      { task: 'Schedule management', score: 60 },
      { task: 'Email triage and response', score: 73 },
      { task: 'Report generation', score: 71 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 79 },
      { task: 'Stakeholder communication', score: 38 },
      { task: 'Process documentation', score: 51 },
      { task: 'Compliance tracking', score: 49 }
    ],
    'Growth Marketing Manager': [
{ task: 'Experiment design', score: 55 },
      { task: 'Funnel analysis', score: 72 },
      { task: 'Ad copy generation', score: 78 },
      { task: 'Budget allocation', score: 48 },
      { task: 'Channel strategy', score: 5 },
      { task: 'Partnership outreach', score: 9 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 65 },
      { task: 'Document formatting', score: 71 },
      { task: 'Stakeholder communication', score: 24 },
      { task: 'Process documentation', score: 51 },
      { task: 'Compliance tracking', score: 63 }
    ],
    'Process Improvement Specialist': [
{ task: 'Process mapping', score: 68 },
      { task: 'Bottleneck analysis', score: 72 },
      { task: 'KPI dashboards', score: 78 },
      { task: 'Root cause analysis', score: 55 },
      { task: 'Change management', score: 6 },
      { task: 'Stakeholder workshops', score: 12 },
      { task: 'Schedule management', score: 64 },
      { task: 'Email triage and response', score: 71 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 79 }
    ],
    'Warehouse Supervisor': [
{ task: 'Inventory tracking', score: 82 },
      { task: 'Shipment scheduling', score: 72 },
      { task: 'Safety compliance', score: 35 },
      { task: 'Staff scheduling', score: 55 },
      { task: 'Quality checks', score: 11 },
      { task: 'Floor management', score: 8 },
      { task: 'Schedule management', score: 75 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Report generation', score: 66 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 62 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 33 },
      { task: 'Process documentation', score: 66 },
      { task: 'Compliance tracking', score: 64 },
      { task: 'Team coordination', score: 17 },
      { task: 'Conflict resolution', score: 6 }
    ],
    'Fleet Coordinator': [
{ task: 'Route optimization', score: 85 },
      { task: 'Maintenance scheduling', score: 72 },
      { task: 'Fuel tracking', score: 78 },
      { task: 'Driver assignment', score: 55 },
      { task: 'Compliance documentation', score: 5 },
      { task: 'Incident response', score: 12 },
      { task: 'Schedule management', score: 78 },
      { task: 'Email triage and response', score: 71 },
      { task: 'Report generation', score: 69 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 65 }
    ],
    'L&D Manager': [
{ task: 'Training needs analysis', score: 62 },
      { task: 'Course creation', score: 83 },
      { task: 'Learning path design', score: 55 },
      { task: 'Vendor evaluation', score: 6 },
      { task: 'Impact measurement', score: 58 },
      { task: 'Facilitation', score: 9 },
      { task: 'Schedule management', score: 79 },
      { task: 'Email triage and response', score: 86 },
      { task: 'Report generation', score: 78 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 62 },
      { task: 'Document formatting', score: 86 },
      { task: 'Stakeholder communication', score: 21 },
      { task: 'Process documentation', score: 68 },
      { task: 'Compliance tracking', score: 60 },
      { task: 'Team coordination', score: 27 },
      { task: 'Conflict resolution', score: 8 },
      { task: 'Client relationship management', score: 9 },
      { task: 'Strategic planning input', score: 9 },
      { task: 'Cross-functional collaboration', score: 15 }
    ],
    'Employee Experience Lead': [
{ task: 'Survey analysis', score: 83 },
      { task: 'Engagement reporting', score: 68 },
      { task: 'Program design', score: 38 },
      { task: 'Event coordination', score: 7 },
      { task: 'Focus group facilitation', score: 12 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 75 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 38 },
      { task: 'Process documentation', score: 65 },
      { task: 'Compliance tracking', score: 57 },
      { task: 'Team coordination', score: 24 }
    ],
    'HRIS Analyst': [
{ task: 'System configuration', score: 68 },
      { task: 'Data migration', score: 78 },
      { task: 'Report building', score: 82 },
      { task: 'Integration management', score: 62 },
      { task: 'User support', score: 9 },
      { task: 'Vendor liaison', score: 11 },
      { task: 'Schedule management', score: 74 },
      { task: 'Email triage and response', score: 87 },
      { task: 'Report generation', score: 65 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 61 },
      { task: 'Document formatting', score: 87 },
      { task: 'Stakeholder communication', score: 32 },
      { task: 'Process documentation', score: 65 }
    ],
    'Enterprise Account Manager': [
{ task: 'Account planning', score: 48 },
      { task: 'QBR preparation', score: 83 },
      { task: 'Upsell identification', score: 58 },
      { task: 'Contract renewals', score: 52 },
      { task: 'Executive alignment', score: 8 },
      { task: 'Relationship management', score: 10 },
      { task: 'Schedule management', score: 73 },
      { task: 'Email triage and response', score: 86 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 92 },
      { task: 'Meeting coordination', score: 60 },
      { task: 'Document formatting', score: 84 },
      { task: 'Stakeholder communication', score: 31 },
      { task: 'Process documentation', score: 64 },
      { task: 'Compliance tracking', score: 62 },
      { task: 'Team coordination', score: 15 },
      { task: 'Conflict resolution', score: 9 }
    ],
    'Channel Sales Manager': [
{ task: 'Partner enablement', score: 48 },
      { task: 'Deal registration', score: 85 },
      { task: 'Pipeline reporting', score: 68 },
      { task: 'Co-marketing plans', score: 42 },
      { task: 'Partner recruitment', score: 8 },
      { task: 'Conflict resolution', score: 10 },
      { task: 'Schedule management', score: 64 },
      { task: 'Email triage and response', score: 71 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 81 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 32 },
      { task: 'Client relationship management', score: 13 },
      { task: 'Strategic planning input', score: 6 }
    ],
    'Sales Enablement Specialist': [
{ task: 'Playbook creation', score: 72 },
      { task: 'Competitive intelligence', score: 78 },
      { task: 'Training content', score: 68 },
      { task: 'Win/loss analysis', score: 65 },
      { task: 'Tool administration', score: 8 },
      { task: 'Coaching sessions', score: 6 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 67 }
    ],
    'Inside Sales Representative': [
{ task: 'Lead qualification', score: 72 },
      { task: 'Outreach sequences', score: 82 },
      { task: 'CRM updates', score: 85 },
      { task: 'Demo scheduling', score: 68 },
      { task: 'Objection handling', score: 7 },
      { task: 'Relationship building', score: 10 },
      { task: 'Schedule management', score: 65 },
      { task: 'Email triage and response', score: 72 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 80 },
      { task: 'Stakeholder communication', score: 27 },
      { task: 'Process documentation', score: 54 }
    ],
    'Frontend Engineer': [
{ task: 'Component development', score: 62 },
      { task: 'Code review', score: 55 },
      { task: 'Unit testing', score: 80 },
      { task: 'Performance optimization', score: 58 },
      { task: 'Accessibility audits', score: 9 },
      { task: 'Design collaboration', score: 9 },
      { task: 'Schedule management', score: 69 },
      { task: 'Email triage and response', score: 76 },
      { task: 'Report generation', score: 68 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 72 },
      { task: 'Document formatting', score: 84 },
      { task: 'Stakeholder communication', score: 31 },
      { task: 'Process documentation', score: 58 }
    ],
    'Platform Engineer': [
{ task: 'Infrastructure provisioning', score: 72 },
      { task: 'CI/CD pipelines', score: 78 },
      { task: 'Service mesh config', score: 55 },
      { task: 'Monitoring setup', score: 68 },
      { task: 'Capacity planning', score: 6 },
      { task: 'Incident triage', score: 12 },
      { task: 'Schedule management', score: 60 },
      { task: 'Email triage and response', score: 87 },
      { task: 'Report generation', score: 79 },
      { task: 'Data entry and updates', score: 91 },
      { task: 'Meeting coordination', score: 63 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 22 },
      { task: 'Process documentation', score: 69 }
    ],
    'Mobile Developer': [
{ task: 'Feature development', score: 58 },
      { task: 'App store submissions', score: 89 },
      { task: 'Crash analysis', score: 68 },
      { task: 'UI implementation', score: 6 },
      { task: 'API integration', score: 62 },
      { task: 'User testing coordination', score: 6 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 75 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 38 }
    ],
    'Site Reliability Engineer': [
{ task: 'Incident response', score: 6 },
      { task: 'Runbook authoring', score: 68 },
      { task: 'SLO monitoring', score: 82 },
      { task: 'Chaos engineering', score: 48 },
      { task: 'Capacity forecasting', score: 62 },
      { task: 'Post-mortem facilitation', score: 5 },
      { task: 'Schedule management', score: 74 },
      { task: 'Email triage and response', score: 81 },
      { task: 'Report generation', score: 73 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Meeting coordination', score: 57 },
      { task: 'Document formatting', score: 73 }
    ],
    'Employment Law Specialist': [
{ task: 'Policy review', score: 81 },
      { task: 'Compliance monitoring', score: 48 },
      { task: 'Investigation support', score: 10 },
      { task: 'Training development', score: 42 },
      { task: 'Dispute resolution', score: 12 },
      { task: 'Schedule management', score: 63 },
      { task: 'Email triage and response', score: 70 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 89 },
      { task: 'Meeting coordination', score: 66 },
      { task: 'Document formatting', score: 80 },
      { task: 'Stakeholder communication', score: 25 }
    ],
    'IP Counsel': [
{ task: 'Patent analysis', score: 48 },
      { task: 'Trademark filings', score: 85 },
      { task: 'License negotiation', score: 8 },
      { task: 'Portfolio management', score: 52 },
      { task: 'Infringement assessment', score: 12 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 30 },
      { task: 'Process documentation', score: 63 },
      { task: 'Compliance tracking', score: 61 },
      { task: 'Team coordination', score: 34 },
      { task: 'Conflict resolution', score: 9 },
      { task: 'Client relationship management', score: 11 },
      { task: 'Strategic planning input', score: 5 },
      { task: 'Cross-functional collaboration', score: 11 }
    ],
    'Onboarding Manager': [
{ task: 'Implementation planning', score: 55 },
      { task: 'Milestone tracking', score: 86 },
      { task: 'Training delivery', score: 48 },
      { task: 'Stakeholder updates', score: 62 },
      { task: 'Risk assessment', score: 12 },
      { task: 'Relationship building', score: 10 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 75 },
      { task: 'Stakeholder communication', score: 30 },
      { task: 'Process documentation', score: 63 },
      { task: 'Compliance tracking', score: 61 }
    ],
    'Renewals Specialist': [
{ task: 'Renewal forecasting', score: 78 },
      { task: 'Usage analysis', score: 72 },
      { task: 'Contract generation', score: 82 },
      { task: 'Pricing adjustments', score: 8 },
      { task: 'Churn risk scoring', score: 68 },
      { task: 'Negotiation', score: 8 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 93 },
      { task: 'Meeting coordination', score: 65 },
      { task: 'Document formatting', score: 87 },
      { task: 'Stakeholder communication', score: 24 },
      { task: 'Process documentation', score: 51 },
      { task: 'Compliance tracking', score: 63 },
      { task: 'Team coordination', score: 30 }
    ],
    'Customer Insights Analyst': [
{ task: 'Survey analysis', score: 78 },
      { task: 'NPS tracking', score: 72 },
      { task: 'Cohort analysis', score: 68 },
      { task: 'Journey mapping', score: 12 },
      { task: 'Stakeholder reporting', score: 62 },
      { task: 'Interview synthesis', score: 8 },
      { task: 'Schedule management', score: 75 },
      { task: 'Email triage and response', score: 82 },
      { task: 'Report generation', score: 74 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 58 },
      { task: 'Document formatting', score: 84 }
    ],
    'Technical Account Manager': [
      { task: 'Technical requirements gathering', score: 45 },
      { task: 'Integration architecture review', score: 52 },
      { task: 'API troubleshooting', score: 62 },
      { task: 'Escalation management', score: 8 },
      { task: 'Quarterly business reviews', score: 35 },
      { task: 'Product feedback synthesis', score: 58 },
      { task: 'Technical documentation', score: 72 },
      { task: 'Customer training delivery', score: 10 },
      { task: 'Health score monitoring', score: 78 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Email triage and response', score: 76 },
    ],
    'Customer Education Specialist': [
      { task: 'Course content creation', score: 55 },
      { task: 'Webinar delivery', score: 12 },
      { task: 'Help center article writing', score: 68 },
      { task: 'Video tutorial production', score: 48 },
      { task: 'Learning path design', score: 42 },
      { task: 'Assessment creation', score: 58 },
      { task: 'Learner analytics review', score: 75 },
      { task: 'Certification program management', score: 35 },
      { task: 'Feedback collection', score: 82 },
      { task: 'Schedule management', score: 70 },
      { task: 'Document formatting', score: 80 },
      { task: 'Stakeholder communication', score: 10 },
    ],
    'Onboarding Coordinator': [
      { task: 'Welcome kit preparation', score: 78 },
      { task: 'Kickoff scheduling', score: 72 },
      { task: 'Account configuration', score: 65 },
      { task: 'Data migration support', score: 55 },
      { task: 'Stakeholder introductions', score: 8 },
      { task: 'Progress tracking', score: 68 },
      { task: 'Go-live checklist management', score: 62 },
      { task: 'Post-launch follow-up', score: 12 },
      { task: 'Email triage and response', score: 80 },
      { task: 'Meeting coordination', score: 65 },
      { task: 'Report generation', score: 76 },
    ],
    'Customer Operations Analyst': [
      { task: 'Churn prediction modeling', score: 72 },
      { task: 'Revenue forecasting', score: 65 },
      { task: 'Process automation design', score: 58 },
      { task: 'SLA compliance monitoring', score: 82 },
      { task: 'Workflow optimization', score: 48 },
      { task: 'Dashboard creation', score: 75 },
      { task: 'Data quality auditing', score: 85 },
      { task: 'Cross-functional reporting', score: 68 },
      { task: 'Strategic planning input', score: 10 },
      { task: 'Vendor evaluation', score: 35 },
      { task: 'Compliance tracking', score: 52 },
      { task: 'Performance tracking', score: 78 },
    ],
    'UX Researcher': [
{ task: 'Usability testing', score: 6 },
      { task: 'Survey design', score: 58 },
      { task: 'Interview analysis', score: 55 },
      { task: 'Competitive benchmarking', score: 68 },
      { task: 'Report generation', score: 85 },
      { task: 'Participant recruitment', score: 12 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 88 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 85 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 32 }
    ],
    'Product Analyst': [
{ task: 'Feature analytics', score: 78 },
      { task: 'A/B test analysis', score: 82 },
      { task: 'Funnel optimization', score: 72 },
      { task: 'Metric dashboards', score: 75 },
      { task: 'User segmentation', score: 6 },
      { task: 'Stakeholder presentations', score: 6 },
      { task: 'Schedule management', score: 71 },
      { task: 'Email triage and response', score: 84 },
      { task: 'Report generation', score: 82 },
      { task: 'Data entry and updates', score: 90 },
      { task: 'Meeting coordination', score: 58 },
      { task: 'Document formatting', score: 70 }
    ],
    'Network Engineer': [
{ task: 'Network monitoring', score: 86 },
      { task: 'Configuration management', score: 68 },
      { task: 'Capacity planning', score: 55 },
      { task: 'Troubleshooting', score: 12 },
      { task: 'Firmware updates', score: 62 },
      { task: 'Physical installations', score: 8 },
      { task: 'Schedule management', score: 73 },
      { task: 'Email triage and response', score: 80 },
      { task: 'Report generation', score: 72 },
      { task: 'Data entry and updates', score: 84 },
      { task: 'Meeting coordination', score: 56 },
      { task: 'Document formatting', score: 78 },
      { task: 'Stakeholder communication', score: 35 }
    ],
    'Cloud Infrastructure Engineer': [
{ task: 'Cloud provisioning', score: 75 },
      { task: 'Cost optimization', score: 72 },
      { task: 'Security configuration', score: 55 },
      { task: 'Migration planning', score: 7 },
      { task: 'Automation scripting', score: 78 },
      { task: 'Disaster recovery testing', score: 6 },
      { task: 'Schedule management', score: 69 },
      { task: 'Email triage and response', score: 76 },
      { task: 'Report generation', score: 68 },
      { task: 'Data entry and updates', score: 85 },
      { task: 'Meeting coordination', score: 72 },
      { task: 'Document formatting', score: 70 },
      { task: 'Stakeholder communication', score: 31 },
      { task: 'Process documentation', score: 58 },
      { task: 'Compliance tracking', score: 50 },
      { task: 'Team coordination', score: 17 }
    ],
    'Data Scientist': [
{ task: 'Model development', score: 62 },
      { task: 'Feature engineering', score: 72 },
      { task: 'Experiment design', score: 6 },
      { task: 'Data exploration', score: 78 },
      { task: 'Stakeholder communication', score: 6 },
      { task: 'Model monitoring', score: 68 },
      { task: 'Schedule management', score: 62 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 81 },
      { task: 'Data entry and updates', score: 93 },
      { task: 'Meeting coordination', score: 65 },
      { task: 'Document formatting', score: 81 },
      { task: 'Process documentation', score: 54 },
      { task: 'Compliance tracking', score: 46 },
      { task: 'Team coordination', score: 33 },
      { task: 'Conflict resolution', score: 6 }
    ],
    'Data Engineer': [
{ task: 'Pipeline development', score: 72 },
      { task: 'Schema design', score: 58 },
      { task: 'Data quality monitoring', score: 78 },
      { task: 'ETL optimization', score: 68 },
      { task: 'Documentation', score: 10 },
      { task: 'Stakeholder requirements', score: 5 },
      { task: 'Schedule management', score: 73 },
      { task: 'Email triage and response', score: 80 },
      { task: 'Report generation', score: 72 },
      { task: 'Data entry and updates', score: 94 },
      { task: 'Meeting coordination', score: 56 },
      { task: 'Document formatting', score: 82 },
      { task: 'Stakeholder communication', score: 35 },
      { task: 'Process documentation', score: 62 },
      { task: 'Compliance tracking', score: 54 }
    ],
    'Channel Development Rep': [
{ task: 'Partner prospecting', score: 8 },
      { task: 'Outreach campaigns', score: 78 },
      { task: 'CRM management', score: 82 },
      { task: 'Proposal generation', score: 68 },
      { task: 'Relationship building', score: 12 },
      { task: 'Schedule management', score: 73 },
      { task: 'Email triage and response', score: 86 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 60 },
      { task: 'Document formatting', score: 76 },
      { task: 'Stakeholder communication', score: 31 },
      { task: 'Process documentation', score: 64 },
      { task: 'Compliance tracking', score: 62 },
      { task: 'Team coordination', score: 15 }
    ],
    'Business Development Manager': [
{ task: 'Market research', score: 83 },
      { task: 'Partnership evaluation', score: 48 },
      { task: 'Proposal writing', score: 62 },
      { task: 'Pipeline management', score: 55 },
      { task: 'Contract negotiation', score: 9 },
      { task: 'Executive networking', score: 10 },
      { task: 'Schedule management', score: 64 },
      { task: 'Email triage and response', score: 71 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 67 },
      { task: 'Document formatting', score: 71 },
      { task: 'Stakeholder communication', score: 26 },
      { task: 'Process documentation', score: 53 },
      { task: 'Compliance tracking', score: 45 },
      { task: 'Team coordination', score: 32 },
      { task: 'Conflict resolution', score: 8 },
      { task: 'Client relationship management', score: 9 },
      { task: 'Strategic planning input', score: 9 }
    ],
    'Vendor Relations Analyst': [
{ task: 'Vendor scoring', score: 82 },
      { task: 'Contract tracking', score: 78 },
      { task: 'Performance reporting', score: 72 },
      { task: 'RFP preparation', score: 12 },
      { task: 'Spend analysis', score: 75 },
      { task: 'Relationship management', score: 12 },
      { task: 'Schedule management', score: 65 },
      { task: 'Email triage and response', score: 72 },
      { task: 'Report generation', score: 84 },
      { task: 'Data entry and updates', score: 86 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 80 },
      { task: 'Stakeholder communication', score: 27 },
      { task: 'Process documentation', score: 54 },
      { task: 'Compliance tracking', score: 46 },
      { task: 'Team coordination', score: 33 }
    ],
    'Sourcing Coordinator': [
{ task: 'Bid management', score: 72 },
      { task: 'Supplier research', score: 78 },
      { task: 'Order tracking', score: 82 },
      { task: 'Price comparison', score: 75 },
      { task: 'Documentation', score: 10 },
      { task: 'Supplier visits', score: 8 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 89 },
      { task: 'Report generation', score: 67 },
      { task: 'Data entry and updates', score: 90 }
    ],
    'Space Planner': [
{ task: 'Floor plan design', score: 62 },
      { task: 'Utilization analysis', score: 78 },
      { task: 'Move coordination', score: 6 },
      { task: 'Capacity forecasting', score: 65 },
      { task: 'Stakeholder surveys', score: 8 },
      { task: 'Schedule management', score: 76 },
      { task: 'Email triage and response', score: 83 },
      { task: 'Report generation', score: 75 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 38 },
      { task: 'Process documentation', score: 65 },
      { task: 'Compliance tracking', score: 57 },
      { task: 'Team coordination', score: 24 }
    ],
    'Building Services Technician': [
{ task: 'Work order management', score: 68 },
      { task: 'Preventive maintenance', score: 11 },
      { task: 'Inventory tracking', score: 86 },
      { task: 'Vendor scheduling', score: 55 },
      { task: 'Equipment inspections', score: 10 },
      { task: 'Schedule management', score: 66 },
      { task: 'Email triage and response', score: 73 },
      { task: 'Report generation', score: 65 },
      { task: 'Data entry and updates', score: 87 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 81 },
      { task: 'Stakeholder communication', score: 28 },
      { task: 'Process documentation', score: 55 },
      { task: 'Compliance tracking', score: 47 },
      { task: 'Team coordination', score: 34 }
    ],
    'PR Specialist': [
{ task: 'Press release drafting', score: 78 },
      { task: 'Media monitoring', score: 82 },
      { task: 'Coverage reporting', score: 72 },
      { task: 'Pitch development', score: 55 },
      { task: 'Crisis preparation', score: 7 },
      { task: 'Journalist relations', score: 12 },
      { task: 'Schedule management', score: 61 },
      { task: 'Email triage and response', score: 74 },
      { task: 'Report generation', score: 72 },
      { task: 'Data entry and updates', score: 80 },
      { task: 'Meeting coordination', score: 68 },
      { task: 'Document formatting', score: 78 },
      { task: 'Stakeholder communication', score: 39 },
      { task: 'Process documentation', score: 52 },
      { task: 'Compliance tracking', score: 50 }
    ],
    'Content Editor': [
{ task: 'Copy editing', score: 72 },
      { task: 'Content planning', score: 65 },
      { task: 'SEO optimization', score: 78 },
      { task: 'Style guide maintenance', score: 55 },
      { task: 'Stakeholder review coordination', score: 12 },
      { task: 'Creative direction', score: 7 },
      { task: 'Schedule management', score: 72 },
      { task: 'Email triage and response', score: 85 },
      { task: 'Report generation', score: 83 },
      { task: 'Data entry and updates', score: 81 },
      { task: 'Meeting coordination', score: 59 },
      { task: 'Document formatting', score: 73 },
      { task: 'Stakeholder communication', score: 30 },
      { task: 'Process documentation', score: 63 },
      { task: 'Compliance tracking', score: 61 },
      { task: 'Team coordination', score: 34 }
    ],
    'Risk Analyst': [
{ task: 'Risk assessment', score: 62 },
      { task: 'Control testing', score: 12 },
      { task: 'Incident tracking', score: 72 },
      { task: 'Compliance monitoring', score: 68 },
      { task: 'Report generation', score: 78 },
      { task: 'Stakeholder advisory', score: 9 },
      { task: 'Schedule management', score: 69 },
      { task: 'Email triage and response', score: 76 },
      { task: 'Data entry and updates', score: 83 },
      { task: 'Meeting coordination', score: 55 },
      { task: 'Document formatting', score: 83 },
      { task: 'Stakeholder communication', score: 34 },
      { task: 'Process documentation', score: 61 },
      { task: 'Compliance tracking', score: 53 }
    ],
    'Regulatory Affairs Coordinator': [
{ task: 'Filing preparation', score: 72 },
      { task: 'Regulation tracking', score: 78 },
      { task: 'Document management', score: 82 },
      { task: 'Agency correspondence', score: 48 },
      { task: 'Audit coordination', score: 7 },
      { task: 'Training delivery', score: 6 },
      { task: 'Schedule management', score: 66 },
      { task: 'Email triage and response', score: 73 },
      { task: 'Report generation', score: 65 },
      { task: 'Data entry and updates', score: 82 },
      { task: 'Meeting coordination', score: 69 },
      { task: 'Document formatting', score: 73 }
    ],
  },
} as const

const rolesByDept = ORG.roles as unknown as Record<string, RoleRowType[]>
const tasksByRole = ORG.tasks as unknown as Record<string, { task: string; score: number }[]>

/** Compute aiPotential from task data per Octave: Tasks in Augmentation Zone / Total Tasks × 100 */
function computeAiPotential(title: string): number {
  const tasks = tasksByRole[title]
  if (!tasks?.length) return 0
  const augCount = tasks.filter((t) => {
    const s = t.score
    return s >= 15 && s <= 75 // augmentation zone
  }).length
  return Math.round((augCount / tasks.length) * 100)
}

export function getRolesForDept(name: string): RoleRowType[] {
  const raw = rolesByDept[name] ?? []
  // Override hardcoded aiPotential with computed value from task data
  return raw.map((r) => ({ ...r, aiPotential: computeAiPotential(r.title) }))
}

export function getTasksForRole(title: string): { task: string; score: number }[] {
  return tasksByRole[title] ?? []
}

/** Learning program completion / enrollment — aligns with role page development bar. */
export function roleDevelopmentProgress(role: RoleRowType) {
  const E = role.employees
  if (E <= 0) return { completed: 0, enrolled: 0, total: 0, pct: 0 }
  const enrolled = Math.min(E, Math.max(1, Math.round(E * (0.5 + (role.aiPotential - 50) / 500))))
  const completed = Math.min(enrolled, Math.round(enrolled * (0.35 + role.aiReadiness / 80)))
  const pct = Math.min(100, Math.round((completed / E) * 100))
  return { completed, enrolled, total: E, pct }
}

export type RoleEmployee = {
  name: string
  title?: string
  readinessPct: number
  programStatus: 'Completed' | 'Enrolled' | 'Not enrolled'
}

const WFR_FIRST_NAMES = [
  'Jordan',
  'Alex',
  'Taylor',
  'Morgan',
  'Riley',
  'Casey',
  'Quinn',
  'Avery',
  'Jamie',
  'Skyler',
  'Cameron',
  'Reese',
  'Parker',
  'Drew',
  'Sam',
  'Marcus',
  'Priya',
  'Diego',
  'Amara',
  'Wei',
  'Yuki',
  'Elena',
  'Omar',
  'Sofia',
  'James',
  'Anika',
  'Lucas',
  'Maya',
  'Noah',
  'Zara',
  'Henry',
  'Lin',
  'Roger',
  'Fatima',
  'Kevin',
  'Nina',
  'Victor',
  'Hannah',
] as const

const WFR_LAST_NAMES = [
  'Chen',
  'Patel',
  'Garcia',
  'Okonkwo',
  'Nakamura',
  'Silva',
  'Kim',
  'Martinez',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Miller',
  'Davis',
  'Rodriguez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Jackson',
  'Lee',
  'Singh',
  'Cohen',
  'Nyong',
  'Park',
  'Rivera',
  'Bauer',
  'Frost',
  'Hughes',
  'Iqbal',
  'Khan',
  'Lopez',
  'Murphy',
  "O'Brien",
  'Petrov',
  'Reyes',
  'Santos',
  'Turner',
  'Vargas',
] as const

function hashRoleSeed(title: string): number {
  let h = 2166136261
  for (let i = 0; i < title.length; i++) {
    h ^= title.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministic synthetic roster for the role page (names + readiness + program status). */
export function getEmployeesForRole(role: RoleRowType): RoleEmployee[] {
  const E = role.employees
  if (E <= 0) return []
  const { completed, enrolled } = roleDevelopmentProgress(role)
  const statuses: RoleEmployee['programStatus'][] = []
  for (let i = 0; i < completed; i++) statuses.push('Completed')
  for (let i = 0; i < Math.max(0, enrolled - completed); i++) statuses.push('Enrolled')
  for (let i = 0; i < Math.max(0, E - enrolled); i++) statuses.push('Not enrolled')

  const shuffleRng = mulberry32(hashRoleSeed(role.title))
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRng() * (i + 1))
    const a = statuses[i]!
    statuses[i] = statuses[j]!
    statuses[j] = a
  }

  const out: RoleEmployee[] = []
  const used = new Set<string>()
  const first = WFR_FIRST_NAMES
  const last = WFR_LAST_NAMES
  const titleSeed = hashRoleSeed(role.title)

  for (let i = 0; i < E; i++) {
    const r = mulberry32((titleSeed + i * 2654435761) >>> 0)
    let name: string
    let tries = 0
    do {
      const fn = first[Math.floor(r() * first.length)]!
      const ln = last[Math.floor(r() * last.length)]!
      name = `${fn} ${ln}`
      tries++
      if (tries > 20) {
        name = `${fn} ${ln} (${i + 1})`
        break
      }
    } while (used.has(name))
    used.add(name)

    const noise = (mulberry32((titleSeed ^ i * 374761393) >>> 0)() - 0.5) * 38
    let readinessPct = Math.round(Math.min(100, Math.max(0, role.aiReadiness + noise)))
    const st = statuses[i]!
    const r2 = mulberry32((titleSeed + i * 1597334677) >>> 0)
    if (st === 'Completed') readinessPct = Math.min(100, Math.round(readinessPct + 6 + r2() * 18))
    if (st === 'Not enrolled') readinessPct = Math.max(0, Math.round(readinessPct - r2() * 14))

    out.push({ name, readinessPct, programStatus: st })
  }

  return out.sort((a, b) => b.readinessPct - a.readinessPct || a.name.localeCompare(b.name))
}

/** Compute dept-level aiPotential as weighted average of role potentials (by employee count). */
function computeDeptAiPotential(deptName: string): number {
  const roles = getRolesForDept(deptName)
  if (!roles.length) return 0
  let totalEmpl = 0
  let weighted = 0
  for (const r of roles) {
    totalEmpl += r.employees
    weighted += r.aiPotential * r.employees
  }
  return totalEmpl > 0 ? Math.round(weighted / totalEmpl) : 0
}

/** Departments with aiPotential computed from task data (Octave formula). */
export const departments: Dept[] = ORG.departments.map((d) => ({
  ...d,
  aiPotential: computeDeptAiPotential(d.name),
})) as unknown as Dept[]

export type Dept = (typeof ORG.departments)[number]
export type RoleRowType = {
  title: string
  employees: number
  aiPotential: number
  aiReadiness: number
}

export function taskZone(score: number): 'above' | 'augment' | 'below' {
  if (score > 75) return 'above'
  if (score >= 15) return 'augment'
  return 'below'
}

/** Tasks in automate or augment zones (score in AI-transformable bands, not human-only). */
export function countTransformableTasksForRole(title: string): number {
  const tasks = getTasksForRole(title)
  return tasks.filter((t) => {
    const z = taskZone(t.score)
    return z === 'above' || z === 'augment'
  }).length
}

export const ZONE = {
  above: { short: 'Automate', color: '#dc2626', bg: '#fef2f2', note: 'Task should be automated, not augmented' },
  augment: { short: 'Augment', color: '#b45309', bg: '#fffbeb', note: 'Human leads, AI assists' },
  below: { short: 'Human-only', color: '#475569', bg: '#f8fafc', note: "AI can't meaningfully help" },
} as const

export function tGap(potential: number, readiness: number) {
  return potential - readiness
}

/** Demo survey response % by department (Focus first — collection underway). */
export function wfrDemoDeptResponseRate(deptName: string): number {
  const overrides: Record<string, number> = {
    Sales: 12,
    Procurement: 15,
    Operations: 32,
    Administrative: 34,
    Finance: 52,
  }
  if (overrides[deptName] != null) return overrides[deptName]
  let h = 0
  for (let i = 0; i < deptName.length; i++) h += deptName.charCodeAt(i)
  return 24 + (h % 56)
}

export interface WfrDemoCollectionSnapshot {
  orgResponseRate: number
  respondedCount: number
  totalEmployees: number
  needAttentionDeptCount: number
}

/** Demo collection window (dept table, etc.). */
export const WFR_DEMO_COLLECTION_WINDOW = {
  /** Start and end dates, one line */
  datesLine: 'Mar 10, 2026 · Apr 4, 2026',
} as const

/** Weighted org response rate and counts for the collecting-state Focus card. */
export function wfrDemoCollectionSnapshot(): WfrDemoCollectionSnapshot {
  let responded = 0
  let needAttention = 0
  for (const d of ORG.departments) {
    const r = wfrDemoDeptResponseRate(d.name)
    responded += Math.round((d.employees * r) / 100)
    if (r < 20) needAttention++
  }
  const orgResponseRate = Math.min(100, Math.round((responded / ORG.totalEmployees) * 100))
  return {
    orgResponseRate,
    respondedCount: responded,
    totalEmployees: ORG.totalEmployees,
    needAttentionDeptCount: needAttention,
  }
}

/** Org-style snapshot limited to named departments (data collection detail sheet / scoped launch). */
export function wfrDemoCollectionSnapshotForDeptNames(deptNames: string[]): WfrDemoCollectionSnapshot {
  const nameSet = new Set(deptNames)
  let responded = 0
  let needAttention = 0
  let totalEmployees = 0
  for (const d of ORG.departments) {
    if (!nameSet.has(d.name)) continue
    const r = wfrDemoDeptResponseRate(d.name)
    responded += Math.round((d.employees * r) / 100)
    totalEmployees += d.employees
    if (r < 20) needAttention++
  }
  const orgResponseRate =
    totalEmployees > 0 ? Math.min(100, Math.round((responded / totalEmployees) * 100)) : 0
  return {
    orgResponseRate,
    respondedCount: responded,
    totalEmployees,
    needAttentionDeptCount: needAttention,
  }
}

/** Dept-level demo counts while org-wide Focus first collection is active. */
export function wfrDemoDeptCollectionSnapshot(d: Dept): WfrDemoCollectionSnapshot {
  const orgResponseRate = wfrDemoDeptResponseRate(d.name)
  const respondedCount = Math.round((d.employees * orgResponseRate) / 100)
  return {
    orgResponseRate,
    respondedCount,
    totalEmployees: d.employees,
    needAttentionDeptCount: orgResponseRate < 20 ? 1 : 0,
  }
}

function deptHeadcountDenominator() {
  return ORG.departments.reduce((s, d) => s + d.employees, 0)
}

/** Augmentable-role headcount for a dept (org total allocated by dept employee share). */
export function deptPeopleInAugRoles(d: Dept): number {
  const denom = deptHeadcountDenominator()
  if (denom <= 0) return 0
  return Math.max(0, Math.round((ORG.peopleInAugRoles * d.employees) / denom))
}

/** People in augmentable roles not yet AI-ready — same definition as the Transformation gap card. */
export function deptGapHeadcount(d: Dept): number {
  const aug = deptPeopleInAugRoles(d)
  const ready = Math.round((aug * d.aiReadiness) / 100)
  return Math.max(0, aug - ready)
}

/** Aggregate org-style metrics for a subset of departments (overview cards / Learn more after Focus launch). */
export function wfrRollupDepartmentsByName(deptNames: string[]) {
  const depts = [...new Set(deptNames)]
    .map((n) => departments.find((d) => d.name === n))
    .filter((d): d is Dept => d != null)
  if (depts.length === 0) return null

  let totalEmployees = 0
  let peopleInAugRoles = 0
  let gapPeople = 0
  let potWeighted = 0
  for (const d of depts) {
    totalEmployees += d.employees
    const aug = deptPeopleInAugRoles(d)
    const g = deptGapHeadcount(d)
    peopleInAugRoles += aug
    gapPeople += g
    potWeighted += d.aiPotential * aug
  }
  const ready = Math.max(0, peopleInAugRoles - gapPeople)
  const aiReadiness = peopleInAugRoles > 0 ? Math.round((ready / peopleInAugRoles) * 100) : 0
  const aiPotential = peopleInAugRoles > 0 ? Math.round(potWeighted / peopleInAugRoles) : 0
  const hrsUnlocked = Math.round(gapPeople * ORG.hrsPerPersonWeek)
  const share = ORG.totalEmployees > 0 ? totalEmployees / ORG.totalEmployees : 0
  const tasksInAugZone = Math.max(1, Math.round(ORG.tasksInAugZone * share))
  const totalRoleTasks = Math.max(tasksInAugZone, Math.round(ORG.totalRoleTasks * share))
  const tasksAboveThreshold = Math.max(0, Math.round(ORG.tasksAboveThreshold * share))
  const tasksBelowThreshold = Math.max(0, Math.round(ORG.tasksBelowThreshold * share))

  return {
    totalEmployees,
    peopleInAugRoles,
    ready,
    gapPeople,
    aiReadiness,
    aiPotential,
    hrsUnlocked,
    tasksInAugZone,
    totalRoleTasks,
    tasksAboveThreshold,
    tasksBelowThreshold,
  }
}

export const PM = {
  Immediate: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  'This year': { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  Monitor: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
} as const

export function deptStatus(d: Dept) {
  const g = tGap(d.aiPotential, d.aiReadiness)
  if (g >= 50) return { label: 'Immediate action', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  if (g >= 30) return { label: 'Monitor closely', color: '#b45309', bg: '#fffbeb', border: '#fde68a' }
  return { label: 'On track', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
}

export function peopleOutcome(tasks: { score: number }[] | undefined): 'at-risk' | 'transforms' | 'survives' | null {
  if (!tasks?.length) return null
  const ab = tasks.filter((t) => taskZone(t.score) === 'above').length
  const bl = tasks.filter((t) => taskZone(t.score) === 'below').length
  if (ab / tasks.length >= 0.55 && bl < 2) return 'at-risk'
  if (ab / tasks.length >= 0.35) return 'transforms'
  return 'survives'
}

export const OUTCOME = {
  'at-risk': { label: 'Role at risk', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  transforms: { label: 'Role transforms', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  survives: { label: 'Role survives', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
} as const
