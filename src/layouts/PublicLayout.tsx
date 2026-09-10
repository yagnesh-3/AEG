import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ButtonLink } from '@/components/ui';
import { AiAssistant } from '@/components/public/AiAssistant';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/projects', label: 'Projects' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/investors', label: 'Investors' },
  { to: '/event', label: 'Launch Event' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/92 backdrop-blur-md">
        <div className="container-aeg flex h-16 items-center justify-between gap-6">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-navy' : 'text-slate hover:text-navy',
                  )
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.label}
                    {isActive ? (
                      <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gold" />
                    ) : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ButtonLink to="/login" variant="secondary" size="sm">
              Investor Login
            </ButtonLink>
            <ButtonLink to="/contact" variant="primary" size="sm">
              Enquire
            </ButtonLink>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-navy transition-colors hover:bg-line-soft lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-line bg-surface lg:hidden">
            <nav className="container-aeg flex flex-col py-2" aria-label="Mobile">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive ? 'bg-gold-wash text-navy' : 'text-slate',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-line pt-3 pb-2">
                <ButtonLink to="/login" variant="secondary" size="sm" className="flex-1">
                  Investor Login
                </ButtonLink>
                <ButtonLink to="/contact" variant="primary" size="sm" className="flex-1">
                  Enquire
                </ButtonLink>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-navy text-white/70">
        <div className="container-aeg py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo tone="light" />
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-white/60">
                A private real estate investment and development alliance. AEG sources, develops
                and manages property projects and connects them with private investors across
                Australia, Dubai and India.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                Explore
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                Contact
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                <li>Norwest, Sydney NSW</li>
                <li>
                  <a href="mailto:invest@allianceestate.com.au" className="transition-colors hover:text-white">
                    invest@allianceestate.com.au
                  </a>
                </li>
                <li>allianceestate.com.au</li>
                <li>
                  <Link to="/login" className="transition-colors hover:text-white">
                    Investor portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12.5px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Alliance Estate Group. All rights reserved.</p>
            <p>Demonstration platform — all project and investor data shown is illustrative.</p>
          </div>
        </div>
      </footer>

      <AiAssistant />
    </div>
  );
}
