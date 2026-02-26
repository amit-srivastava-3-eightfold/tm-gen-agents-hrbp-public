export interface CareerPathPerson {
  name: string
  initials: string
  avatarColor?: string
  photoSrc?: string
}

export interface CareerPathRole {
  id: string
  title: string
  matchingSkills: number
  peopleInRole: CareerPathPerson[]
  peopleCount: number
  domainChange?: boolean
  /** For current role card only */
  department?: string
  tenure?: string
}

export interface CareerPathNode {
  role: CareerPathRole
  /** IDs of roles this node connects to (next step in path) */
  connectsTo?: string[]
}

export interface CareerPathData {
  currentRole: {
    title: string
    department: string
    tenure: string
  }
  paths: CareerPathNode[]
}

/** Get career path data for a person based on their current role. */
export function getCareerPathForPerson(_personId: string, title: string, businessUnit: string, timeInPosition: string): CareerPathData {
  const base = {
    currentRole: {
      title: title.split('•')[0]?.trim() ?? title,
      department: businessUnit,
      tenure: timeInPosition,
    },
  }

  // Role-specific career paths - progression makes sense for each level
  const isManager = title.toLowerCase().includes('manager') || title.toLowerCase().includes('lead') || title.toLowerCase().includes('director')

  if (title.toLowerCase().includes('solutions engineer') || title.toLowerCase().includes('sales engineer')) {
    // IC path: SE → Senior SE → Principal SE → Director SE
    if (!isManager) {
      return {
        ...base,
        paths: [
          {
            role: {
              id: 'senior-se',
              title: 'Senior Sales Engineer',
              matchingSkills: 18,
              peopleInRole: [
                { name: 'Clinton Ng', initials: 'CN', avatarColor: '#6B7B3C' },
                { name: 'Maya Baum', initials: 'MB', avatarColor: '#7B1FA2' },
              ],
              peopleCount: 4,
            },
            connectsTo: ['principal-se'],
          },
          {
            role: {
              id: 'principal-se',
              title: 'Principal Sales Engineer',
              matchingSkills: 14,
              peopleInRole: [
                { name: 'Yoseph Abebe', initials: 'YA', avatarColor: '#6B7B3C' },
                { name: 'Rajarajan Balasubramanian', initials: 'RB', avatarColor: '#9D6309' },
              ],
              peopleCount: 3,
            },
            connectsTo: ['director-se'],
          },
          {
            role: {
              id: 'se-lead',
              title: 'Sales Engineering Lead',
              matchingSkills: 15,
              peopleInRole: [
                { name: 'James Lee', initials: 'JL', avatarColor: '#6B7B3C' },
              ],
              peopleCount: 2,
            },
            connectsTo: ['manager-se'],
          },
          {
            role: {
              id: 'manager-se',
              title: 'Sales Engineering Manager',
              matchingSkills: 12,
              peopleInRole: [
                { name: 'Mateo Myer', initials: 'MM', avatarColor: '#6B7B3C' },
              ],
              peopleCount: 2,
              domainChange: true,
            },
            connectsTo: ['director-se'],
          },
          {
            role: {
              id: 'director-se',
              title: 'Director, Sales Engineering',
              matchingSkills: 10,
              peopleInRole: [
                { name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' },
              ],
              peopleCount: 1,
              domainChange: true,
            },
            connectsTo: ['vp-se'],
          },
          {
            role: {
              id: 'vp-se',
              title: 'VP, Sales Engineering',
              matchingSkills: 8,
              peopleInRole: [
                { name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' },
              ],
              peopleCount: 1,
              domainChange: true,
            },
          },
          {
            role: {
              id: 'solutions-architect',
              title: 'Solutions Architect',
              matchingSkills: 16,
              peopleInRole: [
                { name: 'Priyanka Sharma', initials: 'PS', avatarColor: '#1976D2' },
                { name: 'Christina Stokes', initials: 'CS', avatarColor: '#8D6E63' },
              ],
              peopleCount: 4,
            },
          },
        ],
      }
    }
    // Manager path: Manager → Director → VP
    return {
      ...base,
      paths: [
        {
          role: {
            id: 'director-se',
            title: 'Director, Sales Engineering',
            matchingSkills: 14,
            peopleInRole: [
              { name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' },
            ],
            peopleCount: 1,
          },
          connectsTo: ['vp-se'],
        },
        {
          role: {
            id: 'vp-se',
            title: 'VP, Sales Engineering',
            matchingSkills: 12,
            peopleInRole: [
              { name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' },
            ],
            peopleCount: 1,
            domainChange: true,
          },
        },
        {
          role: {
            id: 'vp-product',
            title: 'VP, Product',
            matchingSkills: 8,
            peopleInRole: [
              { name: 'Jaclyn Zhuang', initials: 'JZ', avatarColor: '#7E3A77' },
              { name: 'Sachit Gupta', initials: 'SG', avatarColor: '#2E7D32' },
            ],
            peopleCount: 3,
            domainChange: true,
          },
        },
      ],
    }
  }

  if (title.toLowerCase().includes('technical account manager') || title.toLowerCase().includes('tam')) {
    return {
      ...base,
      paths: [
        {
          role: {
            id: 'tam-lead',
            title: 'Technical Account Manager Lead',
            matchingSkills: 16,
            peopleInRole: [
              { name: 'Rajarajan Balasubramanian', initials: 'RB', avatarColor: '#9D6309' },
            ],
            peopleCount: 1,
          },
          connectsTo: ['director-sales'],
        },
        {
          role: {
            id: 'director-sales',
            title: 'Director, Sales',
            matchingSkills: 11,
            peopleInRole: [
              { name: 'Sarah Chen', initials: 'SC', avatarColor: '#5C6BC0' },
            ],
            peopleCount: 2,
            domainChange: true,
          },
          connectsTo: ['vp-sales'],
        },
        {
          role: {
            id: 'vp-sales',
            title: 'VP, Sales',
            matchingSkills: 8,
            peopleInRole: [
              { name: 'Sarah Chen', initials: 'SC', avatarColor: '#5C6BC0' },
            ],
            peopleCount: 2,
            domainChange: true,
          },
        },
        {
          role: {
            id: 'solutions-architect',
            title: 'Solutions Architect',
            matchingSkills: 15,
            peopleInRole: [
              { name: 'Priyanka Sharma', initials: 'PS', avatarColor: '#1976D2' },
              { name: 'Christina Stokes', initials: 'CS', avatarColor: '#8D6E63' },
            ],
            peopleCount: 4,
          },
        },
      ],
    }
  }

  if (title.toLowerCase().includes('support engineer') || title.toLowerCase().includes('customer success')) {
    return {
      ...base,
      paths: [
        {
          role: {
            id: 'senior-cs',
            title: 'Senior Customer Success Manager',
            matchingSkills: 16,
            peopleInRole: [
              { name: 'David Chen', initials: 'DC', avatarColor: '#2E7D32' },
            ],
            peopleCount: 3,
          },
          connectsTo: ['solutions-engineer'],
        },
        {
          role: {
            id: 'solutions-engineer',
            title: 'Solutions Engineer',
            matchingSkills: 14,
            peopleInRole: [
              { name: 'Christina Stokes', initials: 'CS', avatarColor: '#8D6E63' },
              { name: 'Michael Alp', initials: 'MA', avatarColor: '#C62828' },
            ],
            peopleCount: 6,
            domainChange: true,
          },
        },
        {
          role: {
            id: 'director-cs',
            title: 'Director, Customer Success',
            matchingSkills: 10,
            peopleInRole: [
              { name: 'Ethan Declerq', initials: 'ED', avatarColor: '#5C6BC0' },
            ],
            peopleCount: 1,
            domainChange: true,
          },
          connectsTo: ['vp-cs'],
        },
        {
          role: {
            id: 'vp-cs',
            title: 'VP, Customer Success',
            matchingSkills: 7,
            peopleInRole: [
              { name: 'Sarah Chen', initials: 'SC', avatarColor: '#5C6BC0' },
            ],
            peopleCount: 1,
            domainChange: true,
          },
        },
      ],
    }
  }

  // Default career paths for other roles
  return {
    ...base,
    paths: [
      {
        role: {
          id: 'senior-role',
          title: 'Senior role in current track',
          matchingSkills: 12,
          peopleInRole: [
            { name: 'Peer 1', initials: 'P1', avatarColor: '#6B7B3C' },
            { name: 'Peer 2', initials: 'P2', avatarColor: '#9D6309' },
          ],
          peopleCount: 3,
        },
      },
      {
        role: {
          id: 'manager-role',
          title: 'Manager',
          matchingSkills: 8,
          peopleInRole: [
            { name: 'Manager 1', initials: 'M1', avatarColor: '#146DA6' },
          ],
          peopleCount: 2,
          domainChange: true,
        },
      },
    ],
  }
}

export interface CareerInterestRole {
  id: string
  title: string
  matchingSkills: number
  peopleInRole: CareerPathPerson[]
  peopleCount: number
  archived?: boolean
}

/** Get career interest roles for the sidebar based on current role. */
export function getCareerInterestsForSidebar(
  _personId: string,
  title: string,
  _businessUnit: string
): CareerInterestRole[] {
  const isManager = title.toLowerCase().includes('manager') || title.toLowerCase().includes('lead') || title.toLowerCase().includes('director')

  if (title.toLowerCase().includes('solutions engineer') || title.toLowerCase().includes('sales engineer')) {
    if (!isManager) {
      return [
        {
          id: 'senior-se',
          title: 'Senior Sales Engineer',
          matchingSkills: 18,
          peopleInRole: [
            { name: 'Clinton Ng', initials: 'CN', avatarColor: '#6B7B3C' },
            { name: 'Maya Baum', initials: 'MB', avatarColor: '#7B1FA2' },
          ],
          peopleCount: 4,
        },
        {
          id: 'principal-se',
          title: 'Principal Sales Engineer',
          matchingSkills: 14,
          peopleInRole: [
            { name: 'Yoseph Abebe', initials: 'YA', avatarColor: '#6B7B3C' },
            { name: 'Rajarajan Balasubramanian', initials: 'RB', avatarColor: '#9D6309' },
          ],
          peopleCount: 3,
        },
        {
          id: 'director-se',
          title: 'Director, Sales Engineering',
          matchingSkills: 10,
          peopleInRole: [{ name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' }],
          peopleCount: 1,
        },
      ]
    }
    return [
      {
        id: 'director-se',
        title: 'Director, Sales Engineering',
        matchingSkills: 14,
        peopleInRole: [{ name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' }],
        peopleCount: 1,
      },
      {
        id: 'vp-se',
        title: 'VP, Sales Engineering',
        matchingSkills: 12,
        peopleInRole: [{ name: 'Cong Wang', initials: 'CW', avatarColor: '#146DA6' }],
        peopleCount: 1,
      },
      {
        id: 'vp-product',
        title: 'VP, Product',
        matchingSkills: 8,
        peopleInRole: [
          { name: 'Jaclyn Zhuang', initials: 'JZ', avatarColor: '#7E3A77' },
          { name: 'Sachit Gupta', initials: 'SG', avatarColor: '#2E7D32' },
        ],
        peopleCount: 3,
      },
    ]
  }

  if (title.toLowerCase().includes('technical account manager') || title.toLowerCase().includes('tam')) {
    return [
      {
        id: 'tam-lead',
        title: 'Technical Account Manager Lead',
        matchingSkills: 16,
        peopleInRole: [{ name: 'Rajarajan Balasubramanian', initials: 'RB', avatarColor: '#9D6309' }],
        peopleCount: 1,
      },
      {
        id: 'director-sales',
        title: 'Director, Sales',
        matchingSkills: 11,
        peopleInRole: [{ name: 'Sarah Chen', initials: 'SC', avatarColor: '#5C6BC0' }],
        peopleCount: 2,
      },
      {
        id: 'solutions-architect',
        title: 'Solutions Architect',
        matchingSkills: 15,
        peopleInRole: [
          { name: 'Priyanka Sharma', initials: 'PS', avatarColor: '#1976D2' },
          { name: 'Christina Stokes', initials: 'CS', avatarColor: '#8D6E63' },
        ],
        peopleCount: 4,
      },
    ]
  }

  return [
    {
      id: 'senior-role',
      title: 'Senior role in current track',
      matchingSkills: 12,
      peopleInRole: [
        { name: 'Peer 1', initials: 'P1', avatarColor: '#6B7B3C' },
        { name: 'Peer 2', initials: 'P2', avatarColor: '#9D6309' },
      ],
      peopleCount: 3,
    },
    {
      id: 'manager-role',
      title: 'Manager',
      matchingSkills: 8,
      peopleInRole: [{ name: 'Manager 1', initials: 'M1', avatarColor: '#146DA6' }],
      peopleCount: 2,
    },
  ]
}
