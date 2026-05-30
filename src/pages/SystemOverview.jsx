import { useState, useEffect } from 'react'
import { dashboard, schools as schoolsApi } from '../api'

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

function MiniBar({ values, h = 60, color = C.blue }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: h }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, background: `${color}30`, borderRadius: '2px 2px 0 0', height: `${(v / max) * h}px`, position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, borderRadius: '2px 2px 0 0', height: `${(v / max) * h * 0.7}px` }} />
        </div>
      ))}
    </div>
  )
}

function MiniLine({ values, w = 260, h = 70, color = C.green }) {
  const safe = Array.isArray(values) && values.length > 0 ? values.filter(v => typeof v === 'number' && isFinite(v)) : []
  if (safe.length === 0) return <svg width={w} height={h} />

  const max = Math.max(...safe, 1)
  const min = Math.min(...safe)
  const range = max - min || 1
  const xStep = safe.length > 1 ? 1 / (safe.length - 1) : 0
  const pts = safe.map((v, i) =>
    `${i * xStep * w},${h - ((v - min) / range) * (h - 8) - 4}`
  ).join(' ')
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

const FIELD = ({ label, name, value, onChange, type = 'text', required, children, half }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: half ? 'span 1' : 'span 2' }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: C.red }}> *</span>}
    </label>
    {children || (
      <input
        type={type} name={name} value={value} onChange={onChange} required={required}
        style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff' }}
      />
    )}
  </div>
)

const SELECT = ({ label, name, value, onChange, options, required, half }) => (
  <FIELD label={label} name={name} required={required} half={half}>
    <select
      name={name} value={value} onChange={onChange} required={required}
      style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff' }}
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </FIELD>
)

function AddBranchModal({ onClose, onCreated }) {
  const EMPTY = { name: '', city: '', state: '', addressLine1: '', pincode: '', phone: '', email: '', board: 'CBSE', plan: 'Basic', status: 'trial' }
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await schoolsApi.create(form)
      onCreated(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create branch')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 10, width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.lineFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>Add new branch</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Branch code will be auto-generated</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.muted, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={submit}>
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FIELD label="Branch name" name="name" value={form.name} onChange={set} required />
            <FIELD label="Address / Street" name="addressLine1" value={form.addressLine1} onChange={set} />
            <FIELD label="City" name="city" value={form.city} onChange={set} required half />
            <FIELD label="State" name="state" value={form.state} onChange={set} required half />
            <FIELD label="Pincode" name="pincode" value={form.pincode} onChange={set} half />
            <FIELD label="Phone" name="phone" value={form.phone} onChange={set} half />
            <FIELD label="Email" name="email" value={form.email} onChange={set} type="email" />
            <SELECT label="Board" name="board" value={form.board} onChange={set} options={['CBSE','ICSE','State Board','IB','Other']} half />
            <SELECT label="Plan" name="plan" value={form.plan} onChange={set} options={['Basic','Pro','Enterprise']} half />
            <SELECT label="Status" name="status" value={form.status} onChange={set} options={['active','trial','suspended']} half />
          </div>

          {error && (
            <div style={{ margin: '0 20px 12px', padding: '8px 12px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 6, fontSize: 12, color: C.red }}>
              {error}
            </div>
          )}

          <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.lineFaint}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, background: '#fff', fontSize: 13, color: C.ink, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: saving ? C.muted : C.blue, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Creating…' : 'Create branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function exportCSV(schools) {
  const headers = ['Name', 'City', 'State', 'Board', 'Plan', 'Status', 'Students', 'Teachers', 'Code']
  const rows = schools.map(s => [
    `"${s.name}"`, s.city, s.state, s.board || '', s.plan, s.status,
    s.studentCount || 0, s.teacherCount || 0, s.code || '',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `branches-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SystemOverview() {
  const [stats, setStats] = useState(null)
  const [topSchools, setTopSchools] = useState([])
  const [allSchools, setAllSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      dashboard.superAdmin(),
      schoolsApi.list({ limit: 100 }),
    ]).then(([statsRes, schoolsRes]) => {
      setStats(statsRes.data.data)
      const all = schoolsRes.data.data || []
      setAllSchools(all)
      setTopSchools(all.slice(0, 7))
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await schoolsApi.list({ limit: 1000 })
      exportCSV(res.data.data || [])
    } catch {
      exportCSV(allSchools)
    } finally {
      setExporting(false)
    }
  }

  const handleBranchCreated = (newBranch) => {
    setShowAddModal(false)
    load()
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: C.bg, minHeight: '100%' }}>
      {showAddModal && (
        <AddBranchModal onClose={() => setShowAddModal(false)} onCreated={handleBranchCreated} />
      )}

      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>StudentLens</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }}>Organization overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '4px 10px', borderRadius: 4, background: '#fff', border: `1px solid ${C.lineFaint}`, fontSize: 12, color: C.muted }}>
            Acad. yr 2025-26
          </span>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, color: exporting ? C.muted : C.ink, cursor: exporting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: C.blue, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Add branch
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { l: 'Branches', v: stats?.totalSchools ?? '—', d: `${allSchools.filter(s => s.status === 'active').length} active`, col: C.blue },
          { l: 'Total students', v: stats?.totalStudents?.toLocaleString('en-IN') ?? '—', d: 'enrolled', col: C.green },
          { l: 'Active teachers', v: stats?.totalTeachers ?? '—', d: 'across all branches', col: C.yellow },
          { l: 'Avg attendance', v: '91.4%', d: '↓ 1.2 pts vs Apr', col: C.red },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{k.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>{loading ? '…' : k.v}</div>
              <div style={{ fontSize: 11, color: k.col }}>{k.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Branch performance — pass rate (Term 1)</div>
            <span style={{ padding: '2px 8px', borderRadius: 4, background: `${C.blue}15`, color: C.blue, fontSize: 11 }}>By branch</span>
          </div>
          <MiniBar values={[88, 92, 79, 85, 91, 94, 76, 83, 88, 90, 87, 82, 89, 78]} h={120} color={C.blue} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 8 }}>
            <span>Range 76–94%</span>
            <span style={{ color: C.blue, cursor: 'pointer' }}>View detailed report →</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>Recent activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['P. Sharma', 'added 3 teachers · MUM', '12m'],
              ['New branch', 'Indore created', '2h'],
              ['R. Iyer', 'marked attendance for 6B · BLR', '3h'],
              ['Term 1 results', 'published in DEL', '5h'],
              ['S. Khan', 'updated permissions · LKO', '1d'],
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${C.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: C.blue, flexShrink: 0 }}>
                  {row[0][0]}
                </div>
                <div style={{ flex: 1, fontSize: 11 }}>
                  <span style={{ fontWeight: 600 }}>{row[0]}</span>{' '}
                  <span style={{ color: C.muted }}>{row[1]}</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted }}>{row[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Enrollment trend (12 mo)</div>
          <MiniLine values={[7100, 7220, 7380, 7510, 7600, 7720, 7950, 8050, 8120, 8240, 8380, 8420]} w="100%" h={70} color={C.green} />
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Plan distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            {loading ? null : ['Enterprise','Pro','Basic'].map(plan => {
              const count = allSchools.filter(s => s.plan === plan).length
              const pct = allSchools.length ? Math.round((count / allSchools.length) * 100) : 0
              const col = plan === 'Enterprise' ? C.blue : plan === 'Pro' ? C.green : C.yellow
              return (
                <div key={plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ color: C.ink }}>{plan}</span>
                    <span style={{ color: col, fontWeight: 600 }}>{count} branches</span>
                  </div>
                  <div style={{ height: 4, background: C.lineFaint, borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Status summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            {loading ? null : [
              { label: 'Active', key: 'active', col: C.green },
              { label: 'Trial', key: 'trial', col: C.yellow },
              { label: 'Suspended', key: 'suspended', col: C.red },
            ].map(({ label, key, col }) => {
              const count = allSchools.filter(s => s.status === key).length
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                    <span style={{ color: C.ink }}>{label}</span>
                  </div>
                  <span style={{ color: col, fontWeight: 600 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Institutions table */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>All branches</span>
          <span style={{ fontSize: 11, color: C.muted }}>{allSchools.length} total</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.lineFaint}` }}>
              {['Institution', 'Location', 'Board', 'Students', 'Teachers', 'Plan', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} style={{ padding: '10px 14px' }}>
                  <div style={{ height: 16, background: C.bg, borderRadius: 4 }} />
                </td></tr>
              ))
              : topSchools.length === 0
                ? <tr><td colSpan={7} style={{ padding: '24px 14px', textAlign: 'center', color: C.muted, fontSize: 13 }}>No branches yet — click "+ Add branch" to create one.</td></tr>
                : topSchools.map((school, i) => (
                  <tr key={school.id} style={{ borderBottom: i < topSchools.length - 1 ? `1px solid ${C.lineFaint}` : 'none', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: C.ink }}>{school.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{school.code}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: C.muted }}>{school.city}, {school.state}</td>
                    <td style={{ padding: '10px 14px', color: C.muted }}>{school.board}</td>
                    <td style={{ padding: '10px 14px', color: C.ink }}>{(school.studentCount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px', color: C.muted }}>{school.teacherCount || 0}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11,
                        background: school.plan === 'Enterprise' ? `${C.blue}15` : school.plan === 'Pro' ? `${C.green}15` : `${C.yellow}15`,
                        color: school.plan === 'Enterprise' ? C.blue : school.plan === 'Pro' ? C.green : C.yellow }}>
                        {school.plan}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11,
                        background: school.status === 'active' ? `${C.green}15` : school.status === 'suspended' ? `${C.red}15` : `${C.yellow}15`,
                        color: school.status === 'active' ? C.green : school.status === 'suspended' ? C.red : C.yellow }}>
                        {school.status}
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
