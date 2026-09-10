import type { Role } from '@/types';

/**
 * Resources the platform gates on. Kept in one place so the access matrix is
 * auditable rather than scattered through components.
 */
export type Resource =
  | 'dashboard'
  | 'projects'
  | 'project-internals'
  | 'feasibility'
  | 'investors'
  | 'trusts'
  | 'communications'
  | 'resources'
  | 'event'
  | 'settings'
  | 'portal';

const MATRIX: Record<Role, Resource[]> = {
  admin: [
    'dashboard',
    'projects',
    'project-internals',
    'feasibility',
    'investors',
    'trusts',
    'communications',
    'resources',
    'event',
    'settings',
  ],
  staff: [
    'dashboard',
    'projects',
    'project-internals',
    'feasibility',
    'investors',
    'trusts',
    'communications',
    'resources',
    'event',
  ],
  // Outsourced partners see delivery data only — no investor or trust records.
  partner: ['dashboard', 'projects', 'project-internals', 'resources'],
  investor: ['portal'],
};

export function canAccess(role: Role, resource: Resource): boolean {
  return MATRIX[role].includes(resource);
}

/** Where a role lands after signing in. */
export function homeFor(role: Role): string {
  return role === 'investor' ? '/portal' : '/app';
}

export const ACCESS_MATRIX = MATRIX;
