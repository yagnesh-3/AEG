import { investors } from '@/data/investors';
import type { EventRsvp, LaunchEvent, RsvpChannel, RsvpStatus } from '@/types';

export const launchEvent: LaunchEvent = {
  name: 'AEG Brand Launch',
  dateLabel: 'Second week of October 2026 — Friday to Sunday, date to be confirmed',
  venue: 'Novotel Sydney Norwest',
  address: '1 Columbia Court, Baulkham Hills NSW 2153',
  capacityMin: 200,
  capacityMax: 300,
  description:
    'An evening introducing the Alliance Estate Group brand, our current portfolio across Australia, Dubai and India, and the investor platform now available to every AEG investor. Presentations from the project delivery team, followed by drinks and canapés.',
};

const CHANNELS: RsvpChannel[] = [
  'email',
  'sms',
  'whatsapp',
  'facebook',
  'instagram',
  'linkedin',
  'paid',
  'seo',
  'direct',
];

const GUEST_NAMES = [
  'Adrian Sokolov', 'Bethany Clarke', 'Chike Adeyemi', 'Dana Whitfield', 'Emre Yilmaz',
  'Freya Lindgren', 'Gopal Subramanian', 'Hana Takahashi', 'Isaac Mendelsohn', 'Jodie Ferrier',
  'Kwame Asante', 'Lina Petrova', 'Mohan Reddy', 'Naomi Blackburn', 'Oscar Delgado',
  'Pia Rosenberg', 'Quentin Marsh', 'Rania Khalil', 'Stefan Novak', 'Tessa Ashcroft',
  'Umar Siddiqui', 'Verity Coleman', 'Wren Halloway', 'Xavier Beaumont', 'Yuki Tanaka',
  'Zara Mahmood', 'Callum Prescott', 'Divya Menon', 'Ewan Fitzgerald', 'Farrah Nasser',
  'Gideon Roth', 'Harriet Sinclair', 'Ivan Petrov', 'Jasmine Wu', 'Kieran O’Donnell',
  'Leila Mansour', 'Miles Underwood', 'Nadia Kaur', 'Otto Lindqvist', 'Paloma Reyes',
];

function hash(value: string): number {
  let h = 13;
  for (let i = 0; i < value.length; i += 1) h = (h * 41 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function makeTicketCode(seed: string): string {
  const h = hash(seed);
  return `AEG-${String(h % 100000).padStart(5, '0')}-${String((h >> 7) % 999).padStart(3, '0')}`;
}

const STATUS_MIX: RsvpStatus[] = [
  'confirmed', 'confirmed', 'confirmed', 'checked-in', 'confirmed',
  'waitlist', 'confirmed', 'declined', 'confirmed', 'confirmed',
];

/** Investors who have RSVP'd, followed by public registrations. */
const investorRsvps: EventRsvp[] = investors.slice(0, 22).map((investor, i) => {
  const seed = hash(`${investor.id}-rsvp`);
  const rsvpDate = new Date('2026-08-28');
  rsvpDate.setDate(rsvpDate.getDate() + (seed % 12));

  return {
    id: `rsvp-i-${i + 1}`,
    name: investor.name,
    email: investor.email,
    phone: investor.phone,
    guests: 1 + (seed % 3),
    channel: i % 3 === 0 ? 'direct' : CHANNELS[seed % CHANNELS.length]!,
    status: STATUS_MIX[seed % STATUS_MIX.length]!,
    ticketCode: makeTicketCode(investor.id),
    rsvpOn: rsvpDate.toISOString().slice(0, 10),
    investorId: investor.id,
  };
});

const publicRsvps: EventRsvp[] = GUEST_NAMES.map((name, i) => {
  const seed = hash(`${name}-rsvp`);
  const rsvpDate = new Date('2026-08-29');
  rsvpDate.setDate(rsvpDate.getDate() + (seed % 11));
  const handle = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').join('.');

  return {
    id: `rsvp-g-${i + 1}`,
    name,
    email: `${handle}@example.com`,
    phone: `+61 4${String(20 + (i % 70)).padStart(2, '0')} ${String(300 + i * 11).slice(0, 3)} ${String(400 + i * 17).slice(0, 3)}`,
    guests: 1 + (seed % 3),
    channel: CHANNELS[seed % CHANNELS.length]!,
    status: STATUS_MIX[(seed >> 3) % STATUS_MIX.length]!,
    ticketCode: makeTicketCode(name),
    rsvpOn: rsvpDate.toISOString().slice(0, 10),
  };
});

export const eventRsvps: EventRsvp[] = [...investorRsvps, ...publicRsvps];
