import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './components/Toast'
import './styles/global.css'

import Landing from './pages/public/Landing'
import Team from './pages/public/Team'
import TeamMember from './pages/public/TeamMember'
import CityPage from './pages/public/CityPage'
import { BlogIndex, BlogPost } from './pages/public/Blog'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import PortalLayout from './pages/portal/PortalLayout'
import Dashboard from './pages/portal/Dashboard'
import Profile from './pages/portal/Profile'
import Quotes from './pages/portal/Quotes'
import QuoteEditor from './pages/portal/QuoteEditor'
import Invoices from './pages/portal/Invoices'
import InvoiceEditor from './pages/portal/InvoiceEditor'
import Messages from './pages/portal/Messages'
import Forum from './pages/portal/Forum'
import Jobs from './pages/portal/Jobs'
import Projects from './pages/portal/Projects'
import Notices from './pages/portal/Notices'
import AdminDashboard from './pages/portal/admin/AdminDashboard'
import AdminPeople from './pages/portal/admin/AdminPeople'
import AdminWork from './pages/portal/admin/AdminWork'
import AdminInbox from './pages/portal/admin/AdminInbox'
import AdminWhatsApp from './pages/portal/admin/AdminWhatsApp'
import Products from './pages/portal/Products'

// Reset scroll to the top on every route change — React Router keeps the
// viewport position otherwise, so a new page can open scrolled to the middle.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/:slug" element={<TeamMember />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/web-design-muscat" element={<CityPage />} />
            <Route path="/web-design-sohar" element={<CityPage />} />
            <Route path="/web-design-salalah" element={<CityPage />} />
            <Route path="/web-design-dubai" element={<CityPage />} />
            <Route path="/web-design-sur" element={<CityPage />} />
            <Route path="/web-design-nizwa" element={<CityPage />} />
            <Route path="/web-design-ras-al-khaimah" element={<CityPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />

            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<Navigate to="app" replace />} />
              <Route path="app" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/new" element={<QuoteEditor />} />
              <Route path="quotes/:id" element={<QuoteEditor />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<InvoiceEditor />} />
              <Route path="invoices/:id" element={<InvoiceEditor />} />
              <Route path="messages" element={<Messages />} />
              <Route path="services" element={<Products />} />
              <Route path="forum" element={<Forum />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="projects" element={<Projects />} />
              <Route path="notices" element={<Notices />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/people" element={<AdminPeople />} />
              <Route path="admin/work" element={<AdminWork />} />
              <Route path="admin/inbox" element={<AdminInbox />} />
              <Route path="admin/whatsapp" element={<AdminWhatsApp />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
