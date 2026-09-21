// Route table + layout shell. Public site, investor portal and admin workspace
// are guarded by role via ProtectedRoute. All data is client-side (see contexts).

import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Public
import Home from './pages/public/Home'
import About from './pages/public/About'
import Projects from './pages/public/Projects'
import ProjectDetail from './pages/public/ProjectDetail'
import TrackRecord from './pages/public/TrackRecord'
import Blog from './pages/public/Blog'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'

// Investor portal
import PortalLayout from './pages/portal/PortalLayout'
import InvestorDashboard from './pages/portal/InvestorDashboard'
import Documents from './pages/portal/Documents'
import Broadcasts from './pages/portal/Broadcasts'
import Enquiries from './pages/portal/Enquiries'

// Admin workspace
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProjectsCRM from './pages/admin/ProjectsCRM'
import Milestones from './pages/admin/Milestones'
import RiskAdmin from './pages/admin/RiskAdmin'
import Feasibility from './pages/admin/Feasibility'
import UnitTrust from './pages/admin/UnitTrust'
import Contacts from './pages/admin/Contacts'
import EnquiryInbox from './pages/admin/EnquiryInbox'
import BroadcastComposer from './pages/admin/BroadcastComposer'
import FeedbackAdmin from './pages/admin/FeedbackAdmin'

export default function App() {
  return (
    <div className="app-frame">
      <Header />
      <main>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/track-record" element={<TrackRecord />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Investor portal */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allow={['investor']}>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InvestorDashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="broadcasts" element={<Broadcasts />} />
            <Route path="enquiries" element={<Enquiries />} />
          </Route>

          {/* Admin workspace */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin', 'staff']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<ProjectsCRM />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="risks" element={<RiskAdmin />} />
            <Route path="feasibility" element={<Feasibility />} />
            <Route
              path="unit-trust"
              element={
                <ProtectedRoute allow={['admin']}>
                  <UnitTrust />
                </ProtectedRoute>
              }
            />
            <Route path="contacts" element={<Contacts />} />
            <Route path="enquiries" element={<EnquiryInbox />} />
            <Route
              path="broadcasts"
              element={
                <ProtectedRoute allow={['admin']}>
                  <BroadcastComposer />
                </ProtectedRoute>
              }
            />
            <Route
              path="feedback"
              element={
                <ProtectedRoute allow={['admin']}>
                  <FeedbackAdmin />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
