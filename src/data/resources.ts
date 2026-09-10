import { initialsOf } from '@/lib/format';
import type { Resource, ResourceEngagement, ResourceRole, Role } from '@/types';

interface Seed {
  name: string;
  organisation: string;
  role: ResourceRole;
  engagement: ResourceEngagement;
  location: string;
  accessLevel: Role | 'none';
  projectIds: string[];
}

const SEEDS: Seed[] = [
  {
    name: 'Eleanor Vance',
    organisation: 'Vance & Partners Legal',
    role: 'legal',
    engagement: 'outsourced',
    location: 'Sydney, NSW',
    accessLevel: 'partner',
    projectIds: ['p-01', 'p-02', 'p-04', 'p-09', 'p-11', 'p-12'],
  },
  {
    name: 'Rohan Bhatt',
    organisation: 'Vance & Partners Legal',
    role: 'legal',
    engagement: 'outsourced',
    location: 'Sydney, NSW',
    accessLevel: 'partner',
    projectIds: ['p-21', 'p-22', 'p-23', 'p-24', 'p-25'],
  },
  {
    name: 'Gregory Sandoval',
    organisation: 'Sandoval Corporate Advisory',
    role: 'accountant',
    engagement: 'outsourced',
    location: 'North Sydney, NSW',
    accessLevel: 'partner',
    projectIds: [],
  },
  {
    name: 'Hannah Liu',
    organisation: 'Sandoval Corporate Advisory',
    role: 'accountant',
    engagement: 'outsourced',
    location: 'North Sydney, NSW',
    accessLevel: 'partner',
    projectIds: [],
  },
  {
    name: 'Daniel Whitmore',
    organisation: 'Alliance Estate Group',
    role: 'project-manager',
    engagement: 'in-house',
    location: 'Norwest, NSW',
    accessLevel: 'staff',
    projectIds: ['p-01', 'p-02', 'p-04', 'p-09', 'p-15'],
  },
  {
    name: 'Priya Raghavan',
    organisation: 'Alliance Estate Group',
    role: 'project-manager',
    engagement: 'in-house',
    location: 'Adelaide, SA',
    accessLevel: 'staff',
    projectIds: ['p-03', 'p-05', 'p-06', 'p-10', 'p-16', 'p-17', 'p-18', 'p-19'],
  },
  {
    name: 'Marcus Chen',
    organisation: 'Alliance Estate Group',
    role: 'project-manager',
    engagement: 'in-house',
    location: 'Norwest, NSW',
    accessLevel: 'staff',
    projectIds: ['p-07', 'p-08', 'p-11', 'p-12', 'p-13', 'p-14', 'p-20', 'p-26'],
  },
  {
    name: 'Yusuf Al-Rashid',
    organisation: 'AEG Middle East',
    role: 'project-manager',
    engagement: 'partner',
    location: 'Dubai, UAE',
    accessLevel: 'staff',
    projectIds: ['p-21', 'p-22', 'p-23'],
  },
  {
    name: 'Anita Desai',
    organisation: 'AEG India Services',
    role: 'project-manager',
    engagement: 'partner',
    location: 'Hyderabad, India',
    accessLevel: 'staff',
    projectIds: ['p-24', 'p-25'],
  },
  {
    name: 'Trent Mackey',
    organisation: 'Mackey Civil Contracting',
    role: 'contractor-civil',
    engagement: 'outsourced',
    location: 'Penrith, NSW',
    accessLevel: 'partner',
    projectIds: ['p-01', 'p-09', 'p-12'],
  },
  {
    name: 'Bianca Ferraro',
    organisation: 'Ferraro Earthworks',
    role: 'contractor-civil',
    engagement: 'outsourced',
    location: 'Elizabeth, SA',
    accessLevel: 'partner',
    projectIds: ['p-05', 'p-07'],
  },
  {
    name: 'Owen Blackwood',
    organisation: 'Blackwood Surveying',
    role: 'contractor-survey',
    engagement: 'outsourced',
    location: 'Parramatta, NSW',
    accessLevel: 'partner',
    projectIds: ['p-01', 'p-02', 'p-04', 'p-09'],
  },
  {
    name: 'Meredith Strand',
    organisation: 'Strand Land Surveyors',
    role: 'contractor-survey',
    engagement: 'outsourced',
    location: 'Adelaide, SA',
    accessLevel: 'partner',
    projectIds: ['p-05', 'p-07', 'p-10'],
  },
  {
    name: 'Vikram Shah',
    organisation: 'Shah Consulting Engineers',
    role: 'contractor-engineering',
    engagement: 'outsourced',
    location: 'Sydney, NSW',
    accessLevel: 'partner',
    projectIds: ['p-01', 'p-02', 'p-04', 'p-11', 'p-12', 'p-15'],
  },
  {
    name: 'Claire Donnelly',
    organisation: 'Donnelly Civil Engineering',
    role: 'contractor-engineering',
    engagement: 'outsourced',
    location: 'Adelaide, SA',
    accessLevel: 'partner',
    projectIds: ['p-05', 'p-07'],
  },
  {
    name: 'Sneha Iyer',
    organisation: 'AEG India Services',
    role: 'india-admin',
    engagement: 'outsourced',
    location: 'Hyderabad, India',
    accessLevel: 'partner',
    projectIds: [],
  },
  {
    name: 'Karthik Nair',
    organisation: 'AEG India Services',
    role: 'india-admin',
    engagement: 'outsourced',
    location: 'Bengaluru, India',
    accessLevel: 'partner',
    projectIds: ['p-24', 'p-25'],
  },
  {
    name: 'Malcolm Reeves',
    organisation: 'Meridian Commercial Bank',
    role: 'banker',
    engagement: 'partner',
    location: 'Sydney, NSW',
    accessLevel: 'none',
    projectIds: [],
  },
];

function emailFor(name: string, organisation: string): string {
  const person = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ');
  const domain = organisation
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .split(' ')
    .filter((w) => !['and', 'partners', 'group', 'services', 'the'].includes(w))
    .slice(0, 2)
    .join('');
  return `${person[0]}.${person[person.length - 1]}@${domain || 'example'}.com.au`;
}

export const resources: Resource[] = SEEDS.map((seed, i) => ({
  id: `res-${String(i + 1).padStart(2, '0')}`,
  name: seed.name,
  organisation: seed.organisation,
  role: seed.role,
  engagement: seed.engagement,
  email: emailFor(seed.name, seed.organisation),
  phone: `+61 ${2 + (i % 4)} ${String(9000 + i * 137).slice(0, 4)} ${String(1000 + i * 311).slice(0, 4)}`,
  location: seed.location,
  accessLevel: seed.accessLevel,
  projectIds: seed.projectIds,
  initials: initialsOf(seed.name),
}));
