import { initialsOf } from '@/lib/format';
import type { User } from '@/types';

/**
 * Demo sign-in accounts. There is no password check — selecting an account
 * on the sign-in screen sets the active role for the session.
 */
export const users: User[] = [
  {
    id: 'u-01',
    name: 'Sarah Kowalski',
    email: 'sarah.kowalski@allianceestate.com.au',
    role: 'admin',
    title: 'Director, Investor Relations',
    initials: initialsOf('Sarah Kowalski'),
  },
  {
    id: 'u-02',
    name: 'Daniel Whitmore',
    email: 'daniel.whitmore@allianceestate.com.au',
    role: 'staff',
    title: 'Project Manager — NSW',
    initials: initialsOf('Daniel Whitmore'),
  },
  {
    id: 'u-03',
    name: 'Owen Blackwood',
    email: 'owen.blackwood@blackwoodsurveying.com.au',
    role: 'partner',
    title: 'Surveyor, Blackwood Surveying',
    initials: initialsOf('Owen Blackwood'),
  },
  {
    id: 'u-04',
    name: 'Ravi Krishnan',
    email: 'ravi.krishnan@example.com',
    role: 'investor',
    title: 'Investor since 2019',
    investorId: 'i-02',
    initials: initialsOf('Ravi Krishnan'),
  },
];
