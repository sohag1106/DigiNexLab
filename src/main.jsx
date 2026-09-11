import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ToastProvider } from './components/Toast'
import './styles/global.css'

import Landing from './pages/public/Landing'
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
import AdminDashboard from './pages/portal/admin/AdminDashboard'
import AdminPeople from './pages/portal/admin/AdminPeople'
import AdminWork from './pages/portal/admin/AdminWork'
import Products from './pages/portal/Products'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
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
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/people" element={<AdminPeople />} />
              <Route path="admin/work" element={<AdminWork />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
