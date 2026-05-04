export interface CurrentUser {
  id: string
  name: string
  title: string
  location: string
  pronouns?: string
  avatarType: 'photo' | 'initials'
  avatarPhotoSrc?: string
  avatarInitials?: string
  avatarColor?: string
  about?: string
  employeeId?: string
  businessUnit?: string
  hireDate?: string
  phone?: string
  email?: string
  mobilityPreference?: string
  flexibilityToTravel?: string
}

export const MATEO: CurrentUser = {
  id: 'mateo',
  name: 'Josh Minnia',
  title: 'Customer Success Manager',
  location: 'San Francisco, CA',
  pronouns: 'He/Him/His',
  avatarType: 'photo',
  avatarPhotoSrc: '/josh-minnia.jpg',
  avatarInitials: 'JM',
  about: 'I lead a team of customer success managers and analysts at Acme, focused on enterprise account health, renewals, and AI-assisted workflows. With over 8 years in customer success and account management, I focus on driving adoption, scaling playbooks, and coaching the team on data-driven account strategy.',
  employeeId: '52979',
  businessUnit: 'Customer Success',
  hireDate: '2021-03-15',
  phone: '(415) 555-0379',
  email: 'josh.minnia@acme.com',
  mobilityPreference: 'Remote preferred',
  flexibilityToTravel: 'Up to 15%',
}

export const LAURA: CurrentUser = {
  id: 'jaydon-torff',
  name: 'Jaydon Torff',
  title: 'HR Business Partner',
  location: 'San Francisco, CA',
  pronouns: 'He/Him/His',
  avatarType: 'photo',
  avatarPhotoSrc: '/jaydon_torff.jpg',
  avatarInitials: 'JT',
  avatarColor: '#5C6BC0',
  about: 'As an HR Business Partner, I partner with Engineering to drive talent strategy, employee engagement, and organizational effectiveness. I bring a data-driven approach to workforce planning, performance management, and talent development. My focus is on building inclusive teams, supporting career growth, and ensuring our people have the resources they need to succeed.',
  employeeId: '52980',
  businessUnit: 'HR',
  hireDate: '2019-03-15',
  phone: '(415) 555-0123',
  email: 'jaydon.torff@eightfolddemo-meme.com',
  mobilityPreference: 'Open to relocation',
  flexibilityToTravel: 'Up to 50%',
}

export const CHRO: CurrentUser = {
  id: 'chro',
  name: 'Jordan Reese',
  title: 'Chief People Officer',
  location: 'San Francisco, CA',
  pronouns: 'They/Them/Theirs',
  avatarType: 'photo',
  avatarPhotoSrc: '/jordan.png',
  avatarInitials: 'JR',
  avatarColor: '#2E7D32',
  about: 'As Chief People Officer, I lead Acme\'s global people strategy, talent acquisition, and organizational development. I focus on building a culture where every employee can thrive, driving diversity and inclusion initiatives, and aligning people programs with business outcomes.',
  employeeId: '52981',
  businessUnit: 'HR',
  hireDate: '2018-06-01',
  phone: '(415) 555-0199',
  email: 'chro@acme.com',
  mobilityPreference: 'Open to relocation',
  flexibilityToTravel: 'Up to 30%',
}

export const CSM: CurrentUser = {
  id: 'csm',
  name: 'Sarah Culhane',
  title: 'Customer Success Manager',
  location: 'San Francisco, CA',
  pronouns: 'She/Her/Hers',
  avatarType: 'photo',
  avatarPhotoSrc: '/sarah_culhane.jpg',
  avatarInitials: 'SC',
  avatarColor: '#1565C0',
  about: 'Customer Success Manager focused on enterprise account growth, renewals, and AI-assisted workflows. I work closely with my customers to drive adoption, surface risks early, and turn quarterly reviews into clear, action-oriented plans.',
  employeeId: '53201',
  businessUnit: 'Customer Success',
  hireDate: '2020-03-10',
  phone: '(415) 555-0293',
  email: 'employee@acme.com',
  mobilityPreference: 'Hybrid',
  flexibilityToTravel: 'Up to 10%',
}
