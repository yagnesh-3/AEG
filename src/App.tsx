import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { RequireRole } from '@/layouts/RequireRole';

import { HomePage } from '@/pages/public/HomePage';
import { ProjectsPage } from '@/pages/public/ProjectsPage';
import { ProjectDetailPage } from '@/pages/public/ProjectDetailPage';
import { OurStoryPage } from '@/pages/public/OurStoryPage';
import { InvestorsPage } from '@/pages/public/InvestorsPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { EventPage } from '@/pages/public/EventPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

import { DashboardPage } from '@/pages/app/DashboardPage';
import { ProjectListPage } from '@/pages/app/ProjectListPage';
import { ProjectRecordPage } from '@/pages/app/ProjectRecordPage';
import { FeasibilityPage } from '@/pages/app/FeasibilityPage';
import { FeasibilityReportPage } from '@/pages/app/FeasibilityReportPage';
import { InvestorListPage } from '@/pages/app/InvestorListPage';
import { InvestorRecordPage } from '@/pages/app/InvestorRecordPage';
import { TrustsPage } from '@/pages/app/TrustsPage';
import { CommunicationsPage } from '@/pages/app/CommunicationsPage';
import { ResourcesPage } from '@/pages/app/ResourcesPage';
import { EventAdminPage } from '@/pages/app/EventAdminPage';
import { SettingsPage } from '@/pages/app/SettingsPage';

import { PortfolioPage } from '@/pages/portal/PortfolioPage';
import { PortalProjectPage } from '@/pages/portal/PortalProjectPage';
import { PortalDocumentsPage } from '@/pages/portal/PortalDocumentsPage';
import { PortalUpdatesPage } from '@/pages/portal/PortalUpdatesPage';
import { PortalEnquiriesPage } from '@/pages/portal/PortalEnquiriesPage';

export function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="our-story" element={<OurStoryPage />} />
        <Route path="investors" element={<InvestorsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="event" element={<EventPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      {/* Internal platform */}
      <Route element={<RequireRole resource="dashboard" />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/:id" element={<ProjectRecordPage />} />

          <Route element={<RequireRole resource="feasibility" />}>
            <Route path="feasibility" element={<FeasibilityPage />} />
            <Route path="feasibility/:projectId" element={<FeasibilityReportPage />} />
          </Route>

          <Route element={<RequireRole resource="investors" />}>
            <Route path="investors" element={<InvestorListPage />} />
            <Route path="investors/:id" element={<InvestorRecordPage />} />
          </Route>

          <Route element={<RequireRole resource="trusts" />}>
            <Route path="trusts" element={<TrustsPage />} />
          </Route>

          <Route element={<RequireRole resource="communications" />}>
            <Route path="communications" element={<CommunicationsPage />} />
          </Route>

          <Route element={<RequireRole resource="resources" />}>
            <Route path="resources" element={<ResourcesPage />} />
          </Route>

          <Route element={<RequireRole resource="event" />}>
            <Route path="event" element={<EventAdminPage />} />
          </Route>

          <Route element={<RequireRole resource="settings" />}>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Investor portal */}
      <Route element={<RequireRole resource="portal" />}>
        <Route path="/portal" element={<AppLayout />}>
          <Route index element={<PortfolioPage />} />
          <Route path="projects/:id" element={<PortalProjectPage />} />
          <Route path="documents" element={<PortalDocumentsPage />} />
          <Route path="updates" element={<PortalUpdatesPage />} />
          <Route path="enquiries" element={<PortalEnquiriesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
