import { Check, RotateCcw, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DetailRow,
  PageHeader,
  StatTile,
  useToast,
} from '@/components/ui';
import { useData } from '@/store/DataContext';
import { ACCESS_MATRIX, type Resource } from '@/lib/access';
import { CATEGORY_LABELS, CATEGORY_ORDER, ROLE_LABELS } from '@/lib/labels';
import { number } from '@/lib/format';
import type { Role } from '@/types';

const RESOURCE_LABELS: Record<Resource, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  'project-internals': 'Project internals (costs, risks)',
  feasibility: 'Feasibility',
  investors: 'Investors',
  trusts: 'Trusts & exits',
  communications: 'Communications',
  resources: 'Resource directory',
  event: 'Launch event',
  settings: 'Settings',
  portal: 'Investor portal',
};

const RESOURCES = Object.keys(RESOURCE_LABELS) as Resource[];
const ROLES: Role[] = ['admin', 'staff', 'partner', 'investor'];

export function SettingsPage() {
  const { projects, investors, resources, trusts, resetData } = useData();
  const { notify } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Organisation profile, the role-based access matrix, and project categories."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Projects" value={number(projects.length)} sub="on the platform" />
        <StatTile label="Investors" value={number(investors.length)} sub="on the register" />
        <StatTile label="Resources" value={number(resources.length)} sub="in the directory" />
        <StatTile label="Unit trusts" value={number(trusts.length)} sub="under management" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Organisation" />
          <CardBody>
            <dl>
              <DetailRow label="Entity" value="Alliance Estate Group" />
              <DetailRow label="Website" value="allianceestate.com.au" />
              <DetailRow label="Office" value="Norwest, Sydney NSW" />
              <DetailRow label="Trustee" value="AEG Trustee Services Pty Ltd" />
              <DetailRow label="Markets" value="Australia · UAE · India" />
            </dl>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Project categories"
            description="The categories a project can be filed under. New categories are added as they arise."
          />
          <CardBody>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {CATEGORY_ORDER.map((category) => {
                const count = projects.filter((p) => p.category === category).length;
                return (
                  <li
                    key={category}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-ivory px-4 py-3"
                  >
                    <span className="text-[14px] font-medium text-navy">{CATEGORY_LABELS[category]}</span>
                    <Badge tone={count > 0 ? 'gold' : 'idle'}>
                      {count} {count === 1 ? 'project' : 'projects'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Role-based access matrix"
          description="What each role can reach. Enforced in one place so the matrix stays auditable."
        />
        <div className="scroll-x">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-ivory/60">
                <th scope="col" className="px-4 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-slate">
                  Area
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    scope="col"
                    className="px-4 py-2.5 text-center text-[11.5px] font-semibold uppercase tracking-wider text-slate"
                  >
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((resource) => (
                <tr key={resource} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3 text-[13.5px] text-navy">{RESOURCE_LABELS[resource]}</td>
                  {ROLES.map((role) => {
                    const allowed = ACCESS_MATRIX[role].includes(resource);
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <span
                          className={
                            allowed
                              ? 'inline-flex size-6 items-center justify-center rounded-full bg-ok-wash text-ok'
                              : 'inline-flex size-6 items-center justify-center rounded-full bg-line-soft text-slate-light'
                          }
                          title={allowed ? 'Allowed' : 'Not permitted'}
                        >
                          {allowed ? <Check size={13} strokeWidth={3} /> : <X size={13} />}
                          <span className="sr-only">
                            {allowed ? 'Allowed' : 'Not permitted'} for {ROLE_LABELS[role]}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Demonstration data"
          description="Edits made in this browser are held locally. Reset restores the seeded portfolio."
        />
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-[13.5px] leading-relaxed text-slate">
              Projects, milestones, risks, updates, enquiries, RSVPs and feedback you create are
              saved to this browser only. Resetting clears them and restores the original seeded
              data — it cannot be undone.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                resetData();
                notify('Demonstration data reset to the seeded portfolio.');
              }}
            >
              <RotateCcw size={15} />
              Reset data
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
