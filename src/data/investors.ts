import { initialsOf } from '@/lib/format';
import type { Investor, InvestorStatus, InvestorType } from '@/types';

interface Seed {
  name: string;
  type: InvestorType;
  status: InvestorStatus;
  location: string;
  joinedOn: string;
  rm: string;
}

const RM = ['Sarah Kowalski', 'James Fairweather', 'Priya Raghavan'];

const SEEDS: Seed[] = [
  { name: 'Harold & Margaret Finch', type: 'individual', status: 'active', location: 'Castle Hill, NSW', joinedOn: '2019-04-12', rm: RM[0]! },
  { name: 'Ravi Krishnan', type: 'smsf', status: 'active', location: 'Kellyville, NSW', joinedOn: '2019-08-03', rm: RM[0]! },
  { name: 'Thornbury Holdings Pty Ltd', type: 'company', status: 'active', location: 'Sydney, NSW', joinedOn: '2020-01-27', rm: RM[1]! },
  { name: 'Elena Marchetti', type: 'individual', status: 'active', location: 'Adelaide, SA', joinedOn: '2020-03-15', rm: RM[2]! },
  { name: 'The Bowen Family Trust', type: 'trust', status: 'active', location: 'Bella Vista, NSW', joinedOn: '2020-06-08', rm: RM[0]! },
  { name: 'Dr Samuel Okonkwo', type: 'smsf', status: 'active', location: 'Norwest, NSW', joinedOn: '2020-09-21', rm: RM[1]! },
  { name: 'Yasmin Haddad', type: 'individual', status: 'active', location: 'Parramatta, NSW', joinedOn: '2021-02-11', rm: RM[0]! },
  { name: 'Northbridge Capital Pty Ltd', type: 'company', status: 'active', location: 'North Sydney, NSW', joinedOn: '2021-04-30', rm: RM[1]! },
  { name: 'Peter & Louise Nguyen', type: 'individual', status: 'active', location: 'Glenwood, NSW', joinedOn: '2021-07-19', rm: RM[0]! },
  { name: 'The Ashworth Superannuation Fund', type: 'smsf', status: 'active', location: 'Burnside, SA', joinedOn: '2021-10-05', rm: RM[2]! },
  { name: 'Grace Oyelaran', type: 'individual', status: 'active', location: 'Rouse Hill, NSW', joinedOn: '2021-11-23', rm: RM[0]! },
  { name: 'Meridian Family Office', type: 'company', status: 'active', location: 'Melbourne, VIC', joinedOn: '2022-01-17', rm: RM[1]! },
  { name: 'Anil & Sunita Mehta', type: 'individual', status: 'active', location: 'Baulkham Hills, NSW', joinedOn: '2022-03-09', rm: RM[0]! },
  { name: 'The Callaghan Trust', type: 'trust', status: 'active', location: 'Unley, SA', joinedOn: '2022-05-26', rm: RM[2]! },
  { name: 'Fiona Brennan', type: 'smsf', status: 'active', location: 'Dural, NSW', joinedOn: '2022-08-14', rm: RM[1]! },
  { name: 'Wesley Tan', type: 'individual', status: 'active', location: 'Chatswood, NSW', joinedOn: '2022-10-02', rm: RM[0]! },
  { name: 'Corbett Investments Pty Ltd', type: 'company', status: 'active', location: 'Wollongong, NSW', joinedOn: '2023-01-19', rm: RM[1]! },
  { name: 'Deepa Ramanathan', type: 'smsf', status: 'active', location: 'Glenhaven, NSW', joinedOn: '2023-03-28', rm: RM[0]! },
  { name: 'The Whitlock Family Trust', type: 'trust', status: 'active', location: 'Prospect, SA', joinedOn: '2023-06-11', rm: RM[2]! },
  { name: 'Marcus & Helena Reid', type: 'individual', status: 'active', location: 'Cherrybrook, NSW', joinedOn: '2023-08-24', rm: RM[0]! },
  { name: 'Omar Farouk', type: 'individual', status: 'active', location: 'Dubai, UAE', joinedOn: '2023-10-07', rm: RM[1]! },
  { name: 'Lakshmi Venkatesh', type: 'smsf', status: 'active', location: 'Hyderabad, India', joinedOn: '2023-12-15', rm: RM[1]! },
  { name: 'Bridgeford Nominees Pty Ltd', type: 'company', status: 'active', location: 'Sydney, NSW', joinedOn: '2024-02-06', rm: RM[1]! },
  { name: 'Sophie Larkin', type: 'individual', status: 'active', location: 'Newcastle, NSW', joinedOn: '2024-04-22', rm: RM[0]! },
  { name: 'The Devereux Superannuation Fund', type: 'smsf', status: 'active', location: 'Norwood, SA', joinedOn: '2024-07-09', rm: RM[2]! },
  { name: 'Nathan Boateng', type: 'individual', status: 'prospective', location: 'Schofields, NSW', joinedOn: '2025-05-14', rm: RM[0]! },
  { name: 'Clara Jensen', type: 'individual', status: 'prospective', location: 'Adelaide, SA', joinedOn: '2025-07-01', rm: RM[2]! },
  { name: 'Hollis Group Pty Ltd', type: 'company', status: 'prospective', location: 'Brisbane, QLD', joinedOn: '2025-08-19', rm: RM[1]! },
  { name: 'Geoffrey Pemberton', type: 'individual', status: 'exited', location: 'Turramurra, NSW', joinedOn: '2019-02-18', rm: RM[1]! },
  { name: 'The Hartley Family Trust', type: 'trust', status: 'exited', location: 'Adelaide, SA', joinedOn: '2020-05-04', rm: RM[2]! },
];

function emailFor(name: string, index: number): string {
  const clean = name
    .toLowerCase()
    .replace(/\b(pty|ltd|the|family|trust|superannuation|fund|group|holdings|capital|investments|nominees|office)\b/g, '')
    .replace(/[^a-z& ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const handle = clean.length > 1 ? `${clean[0]}.${clean[clean.length - 1]}` : `${clean[0] ?? 'investor'}${index}`;
  return `${handle}@example.com`;
}

export const investors: Investor[] = SEEDS.map((seed, i) => ({
  id: `i-${String(i + 1).padStart(2, '0')}`,
  name: seed.name,
  type: seed.type,
  status: seed.status,
  email: emailFor(seed.name, i),
  phone: `+61 4${String(10 + (i % 80)).padStart(2, '0')} ${String(100 + i * 7).slice(0, 3)} ${String(200 + i * 13).slice(0, 3)}`,
  location: seed.location,
  joinedOn: seed.joinedOn,
  relationshipManager: seed.rm,
  initials: initialsOf(seed.name.replace(/^The /, '')),
}));
