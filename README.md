# Alliance Estate Group — Investor & Project Management Platform

A front-end demonstration of the platform described in `AEG_Platform_Requirements-2.docx`:
one connected system covering AEG's four-step process — **Projects → Investors →
Feasibility → Investor Exit / Unit Trust** — plus a refreshed public website and a
launch-event RSVP module.

**This is a front-end only.** There is no backend, database or real authentication.
Every screen runs on typed mock data held in React state and mirrored to
`localStorage`, so the app behaves as if it were live. Sign-in is a role picker,
not a credential check.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v4** (design tokens in `src/styles/theme.css`)
- **React Router 6** — public site, internal platform and investor portal behind one router
- **Recharts** — portfolio, milestone and feasibility charts
- **lucide-react** — icons

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks then builds to dist/
npm run preview  # serve the production build
```

## Signing in

Open `/login` and pick an account — there is no password:

| Account | Role | Sees |
|---|---|---|
| Sarah Kowalski | Administrator | Everything, including Settings and the access matrix |
| Daniel Whitmore | AEG Staff | Projects, feasibility, investors, trusts, communications, resources |
| Owen Blackwood | Outsourced Partner | Delivery data only — projects and the resource directory |
| Ravi Krishnan | Investor | The investor portal only |

The sidebar has a **"view as"** switcher to jump between roles for a demo.

## What's covered

**Public site** (`/`) — home, project showcase (`/projects`, filterable), branded
project pages with stage-wise progress, our story / track record, investor
information, contact + feedback capture, launch-event page with a ticketed RSVP,
and a rule-based AI enquiry assistant (keyword matching against the live project
list — no model call).

**Internal platform** (`/app`) — dashboard, project CRM with a create flow,
per-project tabs for **milestones (M1–M7 with target vs actual dates)**, the
**risk register** (by category, with mitigations kept internal), feasibility,
financials, documents, investors and updates; a feasibility library with a
generator and a print-ready report; investor register; unit trusts with unit
registers and **exit-process tracking**; communications (broadcast composer +
enquiry inbox); the resource directory; launch-event RSVP tracking; and settings
with the role-based access matrix.

**Investor portal** (`/portal`) — portfolio and holdings, investor-facing project
views (no internal cost breakdowns or risk mitigations), a self-serve document
library, an updates feed and a two-way enquiry channel.

## Project structure

```
src/
  components/       shared UI primitives (ui/), charts (charts/), domain components
  data/             typed seed data — 26 projects, investors, trusts, resources, event
  layouts/          PublicLayout, AppLayout, RequireRole
  lib/              labels, formatters, access matrix, domain calculations
  pages/            public/, app/, portal/
  store/            AuthContext, DataContext (state + localStorage + selector hooks)
  styles/           theme.css — design tokens
  types/            the domain vocabulary
```

## Notes

- Edits (new projects, milestone changes, risks, updates, RSVPs, feedback) persist
  to `localStorage`. **Settings → Reset data** restores the seeded portfolio.
- Document "downloads" are mocked — the files are metadata only.
- No email / SMS / WhatsApp is dispatched; broadcasts and enquiry replies update
  state only.
- All names, figures and outcomes are illustrative.
