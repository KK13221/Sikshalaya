import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar.jsx'
import SystemOverview from './pages/SystemOverview.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import PrincipalAdmin from './pages/PrincipalAdmin.jsx'
import Login from './pages/Login.jsx'
import BehaviourMetrics from './pages/BehaviourMetrics.jsx'
import { hasPermission } from './permissions.js'

const SUPER_NAV = [
  { id: 'overview',     label: 'Overview' },
  { id: 'branches',     label: 'Branches' },
  { id: 'principals',   label: 'Principals' },
  { id: 'teachers',     label: 'Teachers' },
  { id: 'metrics',      label: '📊 Metrics Config' },
  { id: 'reports',      label: 'Reports' },
  { id: 'activity',     label: 'Activity' },
  { id: 'permissions',  label: 'Permissions' },
  { id: 'settings',     label: 'Settings' },
]

// Each nav item declares which permission label gates it (null = always visible)
const PRINCIPAL_NAV_DEF = [
  { id: 'dashboard',         label: 'Dashboard',         permission: null },
  { id: 'classes',           label: 'Classes',            permission: 'Manage classes & sections' },
  { id: 'teachers',          label: 'Teachers',           permission: 'Invite teachers' },
  { id: 'students',          label: 'Students',           permission: null },
  { id: 'underperformers',   label: '⚠ Underperformers', permission: null },
  { id: 'attendance',        label: 'Attendance',         permission: 'Mark attendance' },
  { id: 'marks',             label: 'Marks & results',    permission: 'Enter marks' },
  { id: 'curriculum',        label: 'Curriculum',         permission: 'Manage classes & sections' },
  { id: 'reports',           label: 'Reports',            permission: 'Export data' },
  { id: 'metrics',           label: '📊 Metrics Config',  permission: null },
  { id: 'notices',           label: 'Notices',            permission: null },
  { id: 'settings',          label: 'Settings',           permission: null },
]

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: '#F8FAFC', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.jpeg" alt="StudentLens" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>StudentLens</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8' }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2px solid #2563EB', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        Connecting…
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AppShell() {
  const { user, loading } = useAuth()
  const [superView, setSuperView] = useState(() => localStorage.getItem('superView') || 'overview')
  const [principalView, setPrincipalView] = useState(() => localStorage.getItem('principalView') || 'dashboard')

  const handleSuperNav = (view) => { setSuperView(view); localStorage.setItem('superView', view) }
  const handlePrincipalNav = (view) => { setPrincipalView(view); localStorage.setItem('principalView', view) }

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  const isSuperAdmin = user.role === 'superadmin'

  // Filter principal nav based on saved permissions
  const principalNav = PRINCIPAL_NAV_DEF.filter(item =>
    item.permission === null || hasPermission(item.permission, user.role)
  )

  const nav = isSuperAdmin ? SUPER_NAV : principalNav
  const activeView = isSuperAdmin ? superView : principalView
  const onNavigate = isSuperAdmin ? handleSuperNav : handlePrincipalNav

  const renderContent = () => {
    if (activeView === 'metrics') return <BehaviourMetrics />
    if (isSuperAdmin) return <SuperAdmin activeView={superView} />
    return <PrincipalAdmin activeView={principalView} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar nav={nav} activeView={activeView} onNavigate={onNavigate} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  )
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
