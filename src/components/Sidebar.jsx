import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const C = {
  blue: '#2563EB',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  bg: '#F8FAFC',
  ink: '#1E293B',
  muted: '#94A3B8',
  lineFaint: '#E2E8F0',
}

export default function Sidebar({ activeView, onNavigate, nav }) {
  const { user, logout } = useAuth()

  const navItems = nav || []

  return (
    <aside style={{
      width: 180, minHeight: '100vh', background: '#fff',
      borderRight: `1px solid ${C.lineFaint}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px', borderBottom: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/logo.jpeg"
            alt="StudentLens"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
            StudentLens
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map(({ id, label }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 12, fontWeight: isActive ? 600 : 500,
                color: isActive ? C.blue : C.ink,
                background: isActive ? `${C.blue}10` : 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.bg }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.lineFaint}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || 'User'}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textTransform: 'capitalize' }}>
          {user?.role === 'superadmin' ? 'Super Admin' : user?.role || ''}
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </aside>
  )
}
