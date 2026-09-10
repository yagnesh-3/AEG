import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { users } from '@/data';
import { ROLE_LABELS } from '@/lib/labels';
import { homeFor } from '@/lib/access';

const ROLE_BLURB: Record<string, string> = {
  admin: 'Full platform access including settings and the access matrix.',
  staff: 'Projects, feasibility, investors, trusts, communications and resources.',
  partner: 'Delivery data only — projects and the resource directory.',
  investor: 'The investor portal: holdings, documents, updates and enquiries.',
};

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (user) navigate(from ?? homeFor(user.role), { replace: true });
  }, [user, from, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(118deg, rgba(255,255,255,.85) 0 1px, transparent 1px 44px), repeating-linear-gradient(28deg, rgba(255,255,255,.5) 0 1px, transparent 1px 58px)',
          }}
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-24 size-[32rem] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #B08D46 0%, transparent 70%)' }}
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" />
          <div className="max-w-md">
            <h1 className="text-balance text-[34px] leading-tight text-white">
              Every project, every milestone, every document — in one place.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/60">
              The AEG platform brings project management, investor relations, feasibility reporting
              and communications into one connected system.
            </p>
          </div>
          <p className="text-[12.5px] text-white/40">
            Demonstration environment · illustrative data only
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-ivory px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>

          <p className="eyebrow mt-8 lg:mt-0">Sign in</p>
          <h2 className="mt-2 text-[28px]">Choose an account</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-slate">
            This is a demonstration platform, so there is no password. Select a role to see what
            that person can access.
          </p>

          <div className="mt-8 space-y-2.5">
            {users.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => {
                  signIn(account.id);
                  navigate(from ?? homeFor(account.role));
                }}
                className="group flex w-full items-center gap-4 rounded-xl border border-line bg-surface px-4 py-3.5 text-left transition-all hover:border-gold hover:shadow-lift"
              >
                <Avatar initials={account.initials} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14.5px] font-medium text-navy">{account.name}</span>
                    <Badge tone={account.role === 'investor' ? 'gold' : 'navy'}>
                      {ROLE_LABELS[account.role]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-slate">{ROLE_BLURB[account.role]}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-slate-light transition-transform group-hover:translate-x-1 group-hover:text-gold"
                />
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-4 py-3">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold" />
            <p className="text-[12.5px] leading-relaxed text-slate">
              Access is role-based. An investor never sees internal cost breakdowns or the risk
              register; an outsourced partner sees delivery data only.
            </p>
          </div>

          <Link
            to="/"
            className="mt-8 inline-block text-[13.5px] text-slate transition-colors hover:text-navy"
          >
            ← Back to allianceestate.com.au
          </Link>
        </div>
      </div>
    </div>
  );
}
