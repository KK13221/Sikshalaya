import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const C = {
  blue: '#2563EB',
  bg: '#F8FAFC',
  ink: '#1E293B',
  muted: '#94A3B8',
  lineFaint: '#E2E8F0',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'superadmin' ? '/' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: 'Inter, sans-serif', background: C.bg,
    }}>
      {/* Left — branding */}
      <div style={{
        padding: 48, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', borderRight: `1px solid ${C.lineFaint}`,
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.jpeg" alt="StudentLens" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>StudentLens</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: C.ink, margin: 0, lineHeight: 1.2 }}>
            परोपकारार्थम् इदं शरीरम्
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            One platform — many branches. Sign in to manage the foundation.
          </p>
          <div style={{
            marginTop: 24, background: C.bg, borderRadius: 8,
            height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px dashed ${C.lineFaint}`,
          }}>
            <div style={{ textAlign: 'center' }}>
              <img src="/logo.jpeg" alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>Sikshalaya Global Foundation</p>
              <p style={{ fontSize: 11, color: C.muted, margin: '4px 0 0' }}>Empowering Education Across India</p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: C.muted }}>v1.0 · StudentLens for Sikshalaya Global Foundation</div>
      </div>

      {/* Right — form */}
      <div style={{
        padding: 48, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 16, maxWidth: 440, margin: '0 auto', width: '100%',
      }}>
        <div>
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 4,
            background: `${C.blue}15`, color: C.blue, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            SUPER ADMIN
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.ink, margin: '0 0 4px' }}>
            Sign in to StudentLens
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            Email + password. Restricted to foundation staff.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 6,
            background: '#FEF2F2', color: '#EF4444', fontSize: 13,
            border: '1px solid #FECACA',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 6 }}>
              Work email
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@sikshalaya.org"
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: 13,
                border: `1.5px solid ${C.lineFaint}`, outline: 'none', background: '#fff',
                color: C.ink, boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = C.blue)}
              onBlur={e => (e.target.style.borderColor = C.lineFaint)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '9px 36px 9px 12px', borderRadius: 6, fontSize: 13,
                  border: `1.5px solid ${C.lineFaint}`, outline: 'none', background: '#fff',
                  color: C.ink, boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e => (e.target.style.borderColor = C.lineFaint)}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: C.blue }} /> Keep me signed in (30 days)
            </label>
            <span style={{ color: C.blue, textDecoration: 'underline', cursor: 'pointer' }}>Forgot?</span>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: '10px', borderRadius: 6, fontSize: 14, fontWeight: 600,
              background: loading ? '#94A3B8' : C.blue, color: '#fff', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Continue →'}
          </button>

          <div style={{ height: 1, background: C.lineFaint }} />

          <button type="button"
            style={{
              padding: '9px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: '#fff', color: C.ink, border: `1.5px solid ${C.lineFaint}`, cursor: 'pointer',
            }}
          >
            Sign in with SSO
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ padding: '12px 14px', borderRadius: 6, background: C.bg, border: `1px solid ${C.lineFaint}`, fontSize: 12 }}>
          <p style={{ fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>Demo credentials</p>
          <p style={{ color: C.muted, margin: '0 0 3px' }}><strong>Super Admin:</strong> admin@shikshalaya.in / Admin@123</p>
          <p style={{ color: C.muted, margin: 0 }}><strong>Principal:</strong> principal.gurugram@shikshalaya.in / Principal@123</p>
        </div>
      </div>
    </div>
  )
}
