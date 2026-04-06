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
  name: 'Mateo Myer',
  title: 'Sales Engineering Manager',
  location: 'Santa Clara, CA',
  pronouns: 'He/Him/His',
  avatarType: 'photo',
  avatarPhotoSrc: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
  avatarInitials: 'MM',
  about: 'I lead the Sales Engineering team at Acme, helping enterprise customers evaluate and adopt our platform through technical discovery, product demos, and proof-of-concept delivery. With over 10 years in solutions architecture and technical sales, I focus on building strong customer relationships and enabling teams to deliver value. I\'m passionate about mentoring engineers transitioning into customer-facing roles and driving technical excellence across the organization.',
  employeeId: '52979',
  businessUnit: 'PM',
  hireDate: '2020-12-24',
  phone: '(408) 555-0379',
  email: 'mateo.myer@eightfolddemo-meme.com',
  mobilityPreference: 'Willing to relocate',
  flexibilityToTravel: 'Up to 25%',
}

export const LAURA: CurrentUser = {
  id: 'jaydon-torff',
  name: 'Jaydon Torff',
  title: 'HR Business Partner',
  location: 'San Francisco, CA',
  pronouns: 'He/Him/His',
  avatarType: 'photo',
  avatarPhotoSrc: '/jaydon-torff.png',
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
  avatarPhotoSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
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
  avatarPhotoSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  avatarInitials: 'SC',
  avatarColor: '#0D47A1',
  about: 'As a Customer Success Manager, I partner with key accounts to drive adoption, retention, and expansion. I focus on understanding customer goals, identifying risks, and ensuring our product delivers measurable value. My team manages 75 accounts across enterprise and mid-market segments.',
  employeeId: '53201',
  businessUnit: 'Customer Success',
  hireDate: '2021-08-15',
  phone: '(415) 555-0187',
  email: 'csm@acme.com',
  mobilityPreference: 'Remote preferred',
  flexibilityToTravel: 'Up to 20%',
}
