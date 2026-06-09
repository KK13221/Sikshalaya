import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { auth as authApi } from './api'
import Sidebar from './components/Sidebar.jsx'
import SystemOverview from './pages/SystemOverview.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import PrincipalAdmin from './pages/PrincipalAdmin.jsx'
import Login from './pages/Login.jsx'
import BehaviourMetrics from './pages/BehaviourMetrics.jsx'
import TeacherPerformanceLogs from './pages/TeacherPerformanceLogs.jsx'
import { hasPermission } from './permissions.js'

const SUPER_NAV = [
  { id: 'overview',     label: 'Overview' },
  { id: 'branches',     label: 'Branches' },
  { id: 'principals',   label: 'Principals' },
  { id: 'teachers',     label: 'Teachers' },
  { id: 'teacher-performance', label: 'Teacher Logs' },
  { id: 'teacher-norms', label: 'Teacher Norms' },
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
  { id: 'teacher-performance', label: 'Teacher Logs',       permission: 'Invite teachers' },
  { id: 'students',          label: 'Students',           permission: null },
  { id: 'underperformers',   label: '⚠ Underperformers', permission: null },
  { id: 'attendance',        label: 'Attendance',         permission: 'Mark attendance' },
  { id: 'marks',             label: 'Marks & results',    permission: 'Enter marks' },
  { id: 'curriculum',        label: 'Curriculum',         permission: 'Manage classes & sections' },
  { id: 'test-types',        label: 'Test Types',         permission: 'Manage classes & sections' },
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

function TeacherNormsAgreementBlock({ user, onAcceptSuccess }) {
  const [checked, setChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    if (!checked || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await authApi.acceptNorms()
      if (res.data.success) {
        onAcceptSuccess()
      } else {
        setError(res.data.message || 'Failed to accept norms')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept norms. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20, fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 680,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
        border: '1px solid #E2E8F0', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid #F1F5F9',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚖️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.025em' }}>
                Teacher Norms & Declaration
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#E0F2FE', opacity: 0.9 }}>
                Please review and accept the updated norms (Version {user.teacherNormsVersion}) to continue using Sikshalaya.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable norms body */}
        <div style={{
          padding: 32, overflowY: 'auto', flex: 1,
          background: '#F8FAFC', borderBottom: '1px solid #F1F5F9'
        }}>
          <div style={{
            background: '#FFFFFF', padding: 24, borderRadius: 12,
            border: '1px solid #E2E8F0', color: '#334155', fontSize: 14,
            lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: 150
          }}>
            {user.teacherNorms || 'No norms configured. Please check back later or contact your school Super Admin.'}
          </div>
        </div>

        {/* Footer controls */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF' }}>
          {error && (
            <div style={{
              padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FEE2E2',
              borderRadius: 8, color: '#EF4444', fontSize: 13, fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              disabled={submitting}
              style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#2563EB' }}
            />
            <span style={{ fontSize: 14, color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
              I have read and agree to the Teacher Norms and Declaration.
            </span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={handleAccept}
              disabled={!checked || submitting}
              style={{
                padding: '12px 28px', borderRadius: 8, border: 'none',
                background: checked ? '#2563EB' : '#CBD5E1',
                color: checked ? '#FFFFFF' : '#64748B',
                fontWeight: 600, fontSize: 14, cursor: checked && !submitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: checked ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none'
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid #FFFFFF', borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Saving...
                </>
              ) : 'Accept & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const { user, loading, reload } = useAuth()
  const [superView, setSuperView] = useState(() => localStorage.getItem('superView') || 'overview')
  const [principalView, setPrincipalView] = useState(() => localStorage.getItem('principalView') || 'dashboard')

  const handleSuperNav = (view) => { setSuperView(view); localStorage.setItem('superView', view) }
  const handlePrincipalNav = (view) => { setPrincipalView(view); localStorage.setItem('principalView', view) }

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  if (user.requiresNormsAcceptance) {
    return <TeacherNormsAgreementBlock user={user} onAcceptSuccess={reload} />
  }

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
    if (activeView === 'teacher-performance') return <TeacherPerformanceLogs />
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
