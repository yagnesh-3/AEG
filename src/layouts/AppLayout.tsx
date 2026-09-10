import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { useData } from '@/store/DataContext';
import { canAccess, type Resource } from '@/lib/access';
import { ROLE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/cn';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  resource: Resource;
  end?: boolean;
}

const STAFF_NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, resource: 'dashboard', end: true },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban, resource: 'projects' },
  { to: '/app/feasibility', label: 'Feasibility', icon: FileSpreadsheet, resource: 'feasibility' },
  { to: '/app/investors', label: 'Investors', icon: Users, resource: 'investors' },
  { to: '/app/trusts', label: 'Trusts & Exits', icon: Wallet, resource: 'trusts' },
  { to: '/app/communications', label: 'Communications', icon: Megaphone, resource: 'communications' },
  { to: '/app/resources', label: 'Resources', icon: Building2, resource: 'resources' },
  { to: '/app/event', label: 'Launch Event', icon: CalendarDays, resource: 'event' },
  { to: '/app/settings', label: 'Settings', icon: Settings, resource: 'settings' },
];

const PORTAL_NAV: NavItem[] = [
  { to: '/portal', label: 'My Portfolio', icon: BarChart3, resource: 'portal', end: true },
  { to: '/portal/documents', label: 'Documents', icon: FileSpreadsheet, resource: 'portal' },
  { to: '/portal/updates', label: 'Updates', icon: Megaphone, resource: 'portal' },
  { to: '/portal/enquiries', label: 'My Enquiries', icon: MessageSquare, resource: 'portal' },
];

const ROLES: Role[] = ['admin', 'staff', 'partner', 'investor'];

export function AppLayout() {
  const { user, signOut, switchRole } = useAuth();
  const { enquiries } = useData();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) return null;

  const isPortal = user.role === 'investor';
  const nav = (isPortal ? PORTAL_NAV : STAFF_NAV).filter((item) => canAccess(user.role, item.resource));
  const openEnquiries = enquiries.filter((e) => e.status === 'new' || e.status === 'in-progress').length;

  const handleRoleSwitch = (role: Role) => {
    switchRole(role);
    navigate(role === 'investor' ? '/portal' : '/app');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-navy text-white/70">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Logo to={isPortal ? '/portal' : '/app'} tone="light" />
        <button
          type="button"
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Platform">
        <p className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/35">
          {isPortal ? 'Investor Portal' : 'Platform'}
        </p>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-gold' : 'text-white/45'} />
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Communications' && openEnquiries > 0 ? (
                    <span className="rounded bg-gold px-1.5 text-[11px] font-semibold text-white">
                      {openEnquiries}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <p className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/35">
          Demo — view as
        </p>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSwitch(role)}
              className={cn(
                'rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors',
                user.role === role
                  ? 'bg-gold text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              {role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : role === 'partner' ? 'Partner' : 'Investor'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-60">{sidebar}</div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            tabIndex={-1}
          />
          <div className="relative h-full w-64 shadow-panel">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-ivory/92 px-4 backdrop-blur-md md:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-navy transition-colors hover:bg-line-soft lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-slate">
              {isPortal ? 'Investor Portal' : 'AEG Investor & Project Management Platform'}
            </p>
          </div>

          <Badge tone="gold" className="hidden sm:inline-flex">
            {ROLE_LABELS[user.role]}
          </Badge>

          <div className="flex items-center gap-2.5 border-l border-line pl-3">
            <Avatar initials={user.initials} size="sm" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-[13px] font-medium leading-tight text-navy">{user.name}</p>
              <p className="truncate text-[11.5px] leading-tight text-slate">{user.title}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate('/');
              }}
              className="rounded-lg p-2 text-slate transition-colors hover:bg-line-soft hover:text-navy"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
