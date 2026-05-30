import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboard, students as studentsApi, teachers as teachersApi, classes as classesApi, attendance as attendanceApi, chapters as chaptersApi, assessments as assessmentsApi, notices as noticesApi, settings as settingsApi } from '../api'
import { hasPermission } from '../permissions.js'

const C = {
  blue: '#2563EB', green: '#10B981', yellow: '#F59E0B',
  red: '#EF4444', bg: '#F8FAFC', ink: '#1E293B',
  muted: '#94A3B8', lineFaint: '#E2E8F0',
}

/* ── shared ────────────────────────────────────────────────────────────── */
const Pill = ({ color = C.muted, children, style }) => (
  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: `${color}20`, color, ...style }}>{children}</span>
)
const GhostBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, color: disabled ? C.muted : C.ink, cursor: disabled ? 'not-allowed' : 'pointer' }}>{children}</button>
)
const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: disabled ? C.muted : C.blue, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{children}</button>
)
const DangerBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, background: `${C.red}15`, color: C.red, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{children}</button>
)

function PageShell({ title, breadcrumbs, actions, children }) {
  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: C.bg, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{breadcrumbs}</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>
      </div>
      {children}
    </div>
  )
}

function Input({ label, name, value, onChange, type = 'text', required, placeholder, half }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: half ? 'span 1' : 'span 2' }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
      <input type={type} name={name} value={value ?? ''} onChange={onChange} required={required} placeholder={placeholder}
        style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' }} />
    </div>
  )
}

function Select({ label, name, value, onChange, options, required, half }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: half ? 'span 1' : 'span 2' }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
      <select name={name} value={value ?? ''} onChange={onChange} required={required}
        style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff' }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  )
}

function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 10, width: wide ? 680 : 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.lineFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.muted, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
        {footer && <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.lineFaint}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 8 }}>Confirm delete</div>
        <p style={{ fontSize: 13, color: C.ink, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
          <button onClick={onConfirm} disabled={loading}
            style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ErrBanner({ msg }) {
  if (!msg) return null
  return <div style={{ gridColumn: 'span 2', padding: '8px 12px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 6, fontSize: 12, color: C.red }}>{msg}</div>
}

/* ── mini chart primitives ─────────────────────────────────────────────── */
function MiniLineChart({ values, color = C.green, h = 80 }) {
  const w = 100
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return [x, y]
  })
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${d} L ${w} ${h} L 0 ${h} Z`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={area} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}

function ProgressBar({ value, color, showPct = true }) {
  const col = color || (value >= 85 ? C.green : value >= 75 ? C.yellow : C.red)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: C.lineFaint, borderRadius: 3 }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: col, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
      {showPct && <span style={{ fontSize: 11, fontWeight: 600, color: col, minWidth: 32, textAlign: 'right' }}>{value}%</span>}
    </div>
  )
}

/* ── DASHBOARD ─────────────────────────────────────────────────────────── */
function DashboardView() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const intervalRef = useRef(null)

  const load = useCallback(() => {
    dashboard.principal()
      .then(r => { setStats(r.data.data); setLastRefresh(new Date()) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    // Auto-refresh every 30 seconds so admin panel reflects teacher mobile actions live
    intervalRef.current = setInterval(load, 30000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  const v = (key, fallback) => loading ? '…' : (stats?.[key] ?? fallback)
  const attPct = loading ? '…' : stats?.attendance?.pct != null ? `${stats.attendance.pct}%` : '—'
  const attSub = loading ? '' : `${stats?.attendance?.present ?? 0} / ${stats?.attendance?.total ?? 0} present`

  const kpis = [
    { label: 'Students', value: v('totalStudents', '—'), sub: 'enrolled', color: C.blue },
    { label: 'Teachers', value: v('totalTeachers', '—'), sub: 'active staff', color: C.muted },
    { label: 'Attendance today', value: attPct, sub: attSub, color: C.green },
    { label: 'Marks pending', value: loading ? '…' : stats?.marksPending ?? '—', sub: 'assessments', color: C.yellow },
    { label: 'Fee pending', value: loading ? '…' : stats?.pendingFeeCount ?? '—', sub: 'outstanding', color: C.red },
  ]

  const trendValues = (stats?.attendanceTrend || []).map(d => d.pct)
  const chartValues = trendValues.length > 1 ? trendValues : [0]

  const trendStart = stats?.attendanceTrend?.[0]?.date || ''
  const trendEnd   = stats?.attendanceTrend?.[stats.attendanceTrend.length - 1]?.date || ''

  return (
    <PageShell title="Branch dashboard" breadcrumbs={user?.name || 'Branch'}
      actions={<>
        <Pill color={C.green}>● Live</Pill>
        <span style={{ fontSize: 11, color: C.muted }}>Refreshes every 30s · last {lastRefresh.toLocaleTimeString()}</span>
        <GhostBtn onClick={load}>↻ Refresh now</GhostBtn>
      </>}>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Attendance trend chart + Today panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Attendance — last 30 days</div>
            <Pill color={C.green}>{loading ? '…' : `${attPct} today`}</Pill>
          </div>
          <MiniLineChart values={chartValues} color={C.green} h={100} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 6 }}>
            <span>{trendStart}</span><span>{trendEnd}</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>Today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {[
              ['Attendance taken', v('classesMarked', '—'), C.green],
              ['Classes missing',  v('classesMissing', 'None'), stats?.classesMissing === 'None' ? C.green : C.red],
              ['Marks pending',    loading ? '…' : `${stats?.marksPending ?? 0} assessments`, C.yellow],
              ['Fee pending',      loading ? '…' : `${stats?.pendingFeeCount ?? 0} fees`, C.red],
            ].map(([label, val, col], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: i < 3 ? `1px solid ${C.lineFaint}` : 'none' }}>
                <span style={{ color: C.muted }}>{label}</span>
                <span style={{ fontWeight: 600, color: col }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

/* ── STUDENTS ──────────────────────────────────────────────────────────── */
function StudentModal({ student, classes, onClose, onSaved }) {
  const empty = { name: '', admissionNo: '', gender: '', dateOfBirth: '', classId: '', section: '', rollNo: '', guardianName: '', guardianRelation: 'Parent', guardianPhone: '', guardianEmail: '', city: '', state: '' }
  const [form, setForm] = useState(student ? { ...empty, ...student } : empty)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = e => {
    const { name, value } = e.target
    setForm(f => {
      const next = { ...f, [name]: value }
      if (name === 'classId') {
        const selCls = classes.find(c => String(c.id) === String(value))
        next.section = selCls ? selCls.section : ''
      }
      return next
    })
  }

  const submit = async e => {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      const res = student ? await studentsApi.update(student.id, form) : await studentsApi.create(form)
      onSaved(res.data.data)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={student ? 'Edit student' : 'Add student'} onClose={onClose} wide
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : student ? 'Save changes' : 'Add student'}</PrimaryBtn>
      </>}>
      <ErrBanner msg={err} />
      <Input label="Full name" name="name" value={form.name} onChange={set} required />
      <Input label="Admission No." name="admissionNo" value={form.admissionNo} onChange={set} required half />
      <Input label="Roll No." name="rollNo" value={form.rollNo} onChange={set} type="number" half />
      <Select label="Gender" name="gender" value={form.gender} onChange={set} options={['male','female','other']} half />
      <Input label="Date of birth" name="dateOfBirth" value={form.dateOfBirth||''} onChange={set} type="date" half />
      <Select label="Class" name="classId" value={form.classId||''} onChange={set}
        options={classes.map(c => ({ value: c.id, label: `${c.name}-${c.section}` }))} half />
      <Input label="Section" name="section" value={form.section||''} onChange={set} half />
      <Input label="Guardian name" name="guardianName" value={form.guardianName||''} onChange={set} />
      <Input label="Guardian relation" name="guardianRelation" value={form.guardianRelation||''} onChange={set} half />
      <Input label="Guardian phone" name="guardianPhone" value={form.guardianPhone||''} onChange={set} half />
      <Input label="Guardian email" name="guardianEmail" value={form.guardianEmail||''} onChange={set} type="email" />
      <Input label="City" name="city" value={form.city||''} onChange={set} half />
      <Input label="State" name="state" value={form.state||''} onChange={set} half />
    </Modal>
  )
}

function StudentsView() {
  const { user } = useAuth()
  const canManageStudents = hasPermission('Manage classes & sections', user?.role)
  const canExport = hasPermission('Export data', user?.role)
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editS, setEditS] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [tab, setTab] = useState('all')
  const PER_PAGE = 20

  const load = useCallback(() => {
    setLoading(true)
    const params = { limit: PER_PAGE, page, search: search || undefined, classId: classFilter || undefined }
    Promise.all([
      studentsApi.list(params),
      classesApi.list(),
    ]).then(([sr, cr]) => {
      setStudents(sr.data.data || [])
      setTotal(sr.data.total || 0)
      setClasses(cr.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [search, classFilter, page])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    setDeleting(true)
    try { await studentsApi.remove(delTarget.id); setDelTarget(null); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
    finally { setDeleting(false) }
  }

  const className = (s) => {
    const cls = classes.find(c => c.id === s.classId)
    return cls ? `${cls.name}-${cls.section}` : s.section || '—'
  }

  const exportCSV = () => {
    const h = ['Name','Admission No','Class','Roll No','Gender','Guardian','Phone','City']
    const rows = students.map(s => [`"${s.name}"`,s.admissionNo,className(s),s.rollNo||'',s.gender||'',`"${s.guardianName||''}"`,s.guardianPhone||'',s.city||''])
    const csv = [h,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = `students-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  const isUnderperformer = (s) => {
    const acad = s.academicsScore ?? s.avgMarks ?? null
    const punc = s.attendancePct ?? null
    const behv = s.behaviourScore ?? null
    return (acad !== null && acad < 75) || (punc !== null && punc < 75) || (behv !== null && behv < 75)
  }

  const displayList = tab === 'underperformers' ? students.filter(isUnderperformer) : students
  const underperformerCount = students.filter(isUnderperformer).length

  return (
    <PageShell title={`Students (${total})`} breadcrumbs="Branch"
      actions={<>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Name or admission no…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        <select value={classFilter} onChange={e=>{setClassFilter(e.target.value);setPage(1)}}
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
        </select>
        {canExport && <GhostBtn onClick={exportCSV}>Export</GhostBtn>}
        {canManageStudents && <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add student</PrimaryBtn>}
      </>}>

      {showAdd && <StudentModal classes={classes} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
      {editS && <StudentModal student={editS} classes={classes} onClose={() => setEditS(null)} onSaved={() => { setEditS(null); load() }} />}
      {delTarget && <ConfirmModal message={`Remove student "${delTarget.name}"?`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      {/* Tab filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { id: 'all', label: `All ${total}` },
          { id: 'underperformers', label: `⚠ Needs attention${underperformerCount > 0 ? ` (${underperformerCount})` : ''}`, color: C.red },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: tab === t.id ? (t.color ? `${t.color}15` : `${C.blue}15`) : C.lineFaint,
            color: tab === t.id ? (t.color || C.blue) : C.muted,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'underperformers' && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: `${C.blue}08`, border: `1px dashed ${C.blue}60`, borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>i</div>
          <span><b>Visible to both Teacher &amp; Principal.</b> Flagged when Academics, Punctuality, or Behaviour drops below 75%.</span>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1.2fr 1fr 100px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Student</div><div>Class</div><div>Roll</div><div>Guardian</div><div>Status</div><div></div>
        </div>
        {loading ? Array.from({length:8}).map((_,i) => (
          <div key={i} style={{padding:'10px 14px',borderBottom:`1px solid ${C.lineFaint}`}}><div style={{height:16,background:C.bg,borderRadius:4}}/></div>
        )) : displayList.length === 0 ? (
          <div style={{padding:'40px',textAlign:'center',color:C.muted,fontSize:13}}>
            {tab === 'underperformers' ? 'No students flagged — all performing above 75% 🎉' : 'No students found'}
          </div>
        ) : displayList.map((s, i) => {
          const flagged = isUnderperformer(s)
          return (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1.2fr 1fr 100px', padding: '10px 14px', borderBottom: i < displayList.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center', background: flagged ? `${C.red}04` : '#fff' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: flagged ? `${C.red}20` : `${C.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: flagged ? C.red : C.blue }}>
                    {s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  {flagged && (
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: C.red, color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: C.ink }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{s.admissionNo}</div>
                </div>
              </div>
              <div style={{ color: C.muted }}>{className(s)}</div>
              <div style={{ color: C.muted, fontFamily: 'ui-monospace,monospace' }}>{s.rollNo || '—'}</div>
              <div>
                <div style={{ color: C.ink }}>{s.guardianName || '—'}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{s.guardianPhone}</div>
              </div>
              <div><Pill color={s.isActive ? C.green : C.muted}>{s.isActive ? 'Active' : 'Inactive'}</Pill></div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                {canManageStudents && <button onClick={() => setEditS(s)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer' }}>Edit</button>}
                {canManageStudents && <DangerBtn onClick={() => setDelTarget(s)}>Del</DangerBtn>}
              </div>
            </div>
          )
        })}
      </div>
      {total > PER_PAGE && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.muted }}>
          <span>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,total)} of {total}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Prev</GhostBtn>
            <GhostBtn onClick={() => setPage(p=>p+1)} disabled={page*PER_PAGE>=total}>Next →</GhostBtn>
          </div>
        </div>
      )}
    </PageShell>
  )
}

/* ── UNDERPERFORMERS ───────────────────────────────────────────────────── */
function UnderperformersView() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    setLoading(true)
    studentsApi.underperformers()
      .then(r => setRows(r.data.data || []))
      .catch(e => setErr(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const flag = (val) => val != null && val < 75
  const pct = (val) => val != null ? Math.round(val) : null

  const lowAcad = rows.filter(r => flag(r.academicsPct)).length
  const lowPunc = rows.filter(r => flag(r.punctualityPct)).length
  const lowBehv = rows.filter(r => flag(r.behaviourScore)).length

  const DimBar = ({ val }) => {
    if (val == null) return <span style={{ fontSize: 11, color: C.muted }}>No data</span>
    const v = Math.round(val)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 64, height: 5, background: C.lineFaint, borderRadius: 3 }}>
          <div style={{ width: `${v}%`, height: '100%', background: flag(val) ? C.red : val < 85 ? C.yellow : C.green, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: flag(val) ? C.red : C.ink }}>{v}%</span>
      </div>
    )
  }

  const classLabel = (s) => s.Class ? `${s.Class.name}-${s.Class.section}` : s.section || '—'

  return (
    <PageShell title={`Students needing attention${!loading ? ` (${rows.length})` : ''}`}
      breadcrumbs="Branch · Students · Underperformers"
      actions={<>
        <Pill color={C.red}>&lt; 75% in any dimension</Pill>
        <Pill color={C.blue} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>👁 Teachers + Principal</Pill>
        <GhostBtn>Notify class teachers</GhostBtn>
        <GhostBtn>Export</GhostBtn>
      </>}>

      <div style={{ marginBottom: 16, padding: '10px 14px', background: `${C.blue}08`, border: `1px dashed ${C.blue}60`, borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>i</div>
        <span><b>Visible to both Teacher &amp; Principal.</b> Teacher sees the flag inside the student profile; Principal sees this full branch list. Flagged when <b>any one</b> of Academics, Punctuality, or Behaviour drops below 75%.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['Flagged total',    String(rows.length), 'of all students',    C.red],
          ['Low Academics',   String(lowAcad),      'marks avg < 75%',    C.yellow],
          ['Low Punctuality', String(lowPunc),      'attendance < 75%',   C.red],
          ['Low Behaviour',   String(lowBehv),      'score < 75',         C.red],
        ].map(([label, val, sub, color], i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{loading ? '…' : val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {err && <div style={{ padding: '10px 14px', background: `${C.red}10`, borderRadius: 6, fontSize: 12, color: C.red, marginBottom: 12 }}>{err}</div>}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.7fr 0.8fr 1.1fr 1.1fr 1.1fr 1fr', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Student</div><div>Class</div><div>Roll</div><div>Academics</div><div>Punctuality</div><div>Behaviour</div><div>Flagged in</div>
        </div>
        {loading ? Array.from({length: 5}).map((_, i) => (
          <div key={i} style={{ padding: '14px', borderBottom: `1px solid ${C.lineFaint}` }}>
            <div style={{ height: 14, background: C.bg, borderRadius: 4 }} />
          </div>
        )) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>
            No students flagged — all performing above 75% 🎉
          </div>
        ) : rows.map((r, i) => {
          const dims = [
            flag(r.academicsPct)  && 'Acad',
            flag(r.punctualityPct) && 'Punc',
            flag(r.behaviourScore) && 'Behv',
          ].filter(Boolean)
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.7fr 0.8fr 1.1fr 1.1fr 1.1fr 1fr', padding: '12px 14px', borderBottom: i < rows.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>!</div>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${C.red}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.red, flexShrink: 0 }}>
                  {r.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{r.admissionNo}</div>
                </div>
              </div>
              <div style={{ color: C.muted }}>{classLabel(r)}</div>
              <div style={{ color: C.muted, fontFamily: 'ui-monospace,monospace', fontSize: 11 }}>#{r.rollNo || '—'}</div>
              <DimBar val={r.academicsPct} />
              <DimBar val={r.punctualityPct} />
              <DimBar val={r.behaviourScore} />
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {dims.map(d => <Pill key={d} color={C.red}>{d}</Pill>)}
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}

/* ── TEACHERS (Principal) ──────────────────────────────────────────────── */
function TeacherModal({ teacher, onClose, onSaved }) {
  const { user } = useAuth()
  const empty = { name: '', email: '', password: '', employeeId: '', subjects: '', experience: '', qualification: '', schoolId: user?.schoolId || '' }
  const [form, setForm] = useState(teacher ? { ...empty, ...teacher, subjects: (teacher.subjects||[]).join(', ') } : empty)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      const payload = { 
        ...form, 
        subjects: form.subjects.split(',').map(s=>s.trim()).filter(Boolean),
        schoolId: form.schoolId || user?.schoolId
      }
      const res = teacher ? await teachersApi.update(teacher.id, payload) : await teachersApi.create(payload)
      onSaved(res.data.data)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={teacher ? 'Edit teacher' : 'Add teacher'} onClose={onClose}
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : teacher ? 'Save' : 'Add'}</PrimaryBtn>
      </>}>
      <ErrBanner msg={err} />
      <Input label="Full name" name="name" value={form.name} onChange={set} required />
      <Input label="Email address" name="email" value={form.email} onChange={set} type="email" required />
      {!teacher && (
        <Input label="Password (Optional)" name="password" value={form.password} onChange={set} placeholder="Leave blank to auto-generate secure temp password" />
      )}
      <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={set} required half />
      <Input label="Experience (yrs)" name="experience" value={form.experience||''} onChange={set} type="number" half />
      <Input label="Subjects (comma-separated)" name="subjects" value={form.subjects||''} onChange={set} placeholder="Mathematics, Science" />
      <Input label="Qualification" name="qualification" value={form.qualification||''} onChange={set} />
    </Modal>
  )
}

function TeachersView() {
  const { user } = useAuth()
  const canManageTeachers = hasPermission('Invite teachers', user?.role)
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editT, setEditT] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    teachersApi.list({ limit: 100, search: search || undefined })
      .then(r => setTeachers(r.data.data || []))
      .catch(console.error).finally(() => setLoading(false))
  }, [search])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    setDeleting(true)
    try { await teachersApi.remove(delTarget.id); setDelTarget(null); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
    finally { setDeleting(false) }
  }

  return (
    <PageShell title={`Teachers (${teachers.length})`} breadcrumbs="Branch"
      actions={<>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teachers…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        {canManageTeachers && <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add teacher</PrimaryBtn>}
      </>}>

      {canManageTeachers && showAdd && <TeacherModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
      {canManageTeachers && editT && <TeacherModal teacher={editT} onClose={() => setEditT(null)} onSaved={() => { setEditT(null); load() }} />}
      {canManageTeachers && delTarget && <ConfirmModal message={`Remove teacher "${delTarget.name}"?`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1.4fr 0.8fr 100px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Teacher</div><div>Subjects</div><div>Qualification</div><div>Exp.</div><div></div>
        </div>
        {loading ? Array.from({length:5}).map((_,i) => (
          <div key={i} style={{padding:'12px 14px',borderBottom:`1px solid ${C.lineFaint}`}}><div style={{height:16,background:C.bg,borderRadius:4}}/></div>
        )) : teachers.length === 0 ? (
          <div style={{padding:'40px',textAlign:'center',color:C.muted,fontSize:13}}>No teachers yet</div>
        ) : teachers.map((t, i) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1.4fr 0.8fr 100px', padding: '10px 14px', borderBottom: i < teachers.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.green }}>
                {t.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: C.ink }}>{t.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{t.employeeId}</div>
              </div>
            </div>
            <div style={{ color: C.ink }}>{(t.subjects||[]).join(', ') || '—'}</div>
            <div style={{ color: C.muted }}>{t.qualification || '—'}</div>
            <div style={{ color: C.muted }}>{t.experience ? `${t.experience}y` : '—'}</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              {canManageTeachers && <button onClick={() => setEditT(t)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer' }}>Edit</button>}
              {canManageTeachers && <DangerBtn onClick={() => setDelTarget(t)}>Del</DangerBtn>}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

/* ── CLASSES ───────────────────────────────────────────────────────────── */
function ClassModal({ cls, onClose, onSaved }) {
  const SUBJECTS = ['Mathematics','Science','English','Hindi','Social Studies','Computer Science','Sanskrit','Physical Education']
  const empty = { name: '', section: '', subjects: [], academicYear: '2025-26', classTeacherId: '' }
  const [form, setForm] = useState(cls
    ? { ...empty, ...cls, classTeacherId: cls.classTeacherId ?? cls.classTeacher?.id ?? '' }
    : empty)
  const [teachers, setTeachers] = useState([])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    teachersApi.list({ limit: 200 })
      .then(r => setTeachers(r.data.data || []))
      .catch(console.error)
  }, [])

  const toggleSubject = s => setForm(f => ({
    ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x=>x!==s) : [...f.subjects, s]
  }))

  const submit = async e => {
    e.preventDefault(); setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        classTeacherId: form.classTeacherId ? Number(form.classTeacherId) : null,
      }
      const res = cls ? await classesApi.update(cls.id, payload) : await classesApi.create(payload)
      onSaved(res.data.data)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={cls ? 'Edit class' : 'Add class/section'} onClose={onClose}
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : cls ? 'Save' : 'Create'}</PrimaryBtn>
      </>}>
      {err && <div style={{ gridColumn: 'span 2', padding: '8px 12px', background: `${C.red}10`, borderRadius: 6, fontSize: 12, color: C.red }}>{err}</div>}
      <Input label="Class name (e.g. Class 9)" name="name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required half />
      <Input label="Section (e.g. A)" name="section" value={form.section} onChange={e=>setForm(f=>({...f,section:e.target.value}))} required half />
      <Input label="Academic year" name="academicYear" value={form.academicYear} onChange={e=>setForm(f=>({...f,academicYear:e.target.value}))} half />

      {/* Class Teacher assignment */}
      <div style={{ gridColumn: 'span 1' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Class Teacher
        </label>
        <select
          value={form.classTeacherId ?? ''}
          onChange={e => setForm(f => ({ ...f, classTeacherId: e.target.value }))}
          style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff' }}>
          <option value="">— Unassigned —</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name} {t.subjects?.length ? `(${t.subjects.slice(0,2).join(', ')})` : ''}</option>
          ))}
        </select>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
          This teacher will see this class in the mobile app
        </div>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Subjects</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUBJECTS.map(s => (
            <button key={s} type="button" onClick={() => toggleSubject(s)}
              style={{ padding: '4px 10px', borderRadius: 4, fontSize: 12, border: `1px solid ${form.subjects.includes(s) ? C.blue : C.lineFaint}`, background: form.subjects.includes(s) ? `${C.blue}15` : '#fff', color: form.subjects.includes(s) ? C.blue : C.ink, cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function ClassesView() {
  const { user } = useAuth()
  const canManageClasses = hasPermission('Manage classes & sections', user?.role)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editC, setEditC] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([classesApi.list(), studentsApi.list({ limit: 1000 })])
      .then(([cr, sr]) => { setClasses(cr.data.data||[]); setStudents(sr.data.data||[]) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const studentCount = (classId) => students.filter(s => s.classId === classId).length

  const doDelete = async () => {
    setDeleting(true)
    try { await classesApi.update(delTarget.id, {}); setDelTarget(null); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
    finally { setDeleting(false) }
  }

  return (
    <PageShell title={`Classes & Sections (${classes.length})`} breadcrumbs="Branch"
      actions={canManageClasses ? <PrimaryBtn onClick={() => setShowAdd(true)}>+ New section</PrimaryBtn> : null}>

      {canManageClasses && showAdd && <ClassModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
      {canManageClasses && editC && <ClassModal cls={editC} onClose={() => setEditC(null)} onSaved={() => { setEditC(null); load() }} />}
      {canManageClasses && delTarget && <ConfirmModal message={`Delete ${delTarget.name}-${delTarget.section}? Students must be moved first.`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {Array.from({length:8}).map((_,i) => <div key={i} style={{height:120,background:'#fff',borderRadius:8,border:`1px solid ${C.lineFaint}`}} />)}
        </div>
      ) : classes.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          No classes yet — click "+ New section" to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {classes.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, borderTop: c.classTeacher ? `3px solid ${C.green}` : `3px solid ${C.lineFaint}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{c.name}-{c.section}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{studentCount(c.id)} students</div>
                </div>
                {canManageClasses && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setEditC(c)} style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer' }}>Edit</button>
                    <DangerBtn onClick={() => setDelTarget(c)}>Del</DangerBtn>
                  </div>
                )}
              </div>

              {/* Class teacher badge */}
              {c.classTeacher ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '4px 8px', background: `${C.green}10`, borderRadius: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                    {c.classTeacher.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.green }}>{c.classTeacher.name}</span>
                </div>
              ) : (
                <div style={{ marginBottom: 8, padding: '4px 8px', background: `${C.yellow}10`, borderRadius: 4, fontSize: 11, color: C.yellow, fontWeight: 500 }}>
                  No teacher assigned
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(c.subjects||[]).slice(0,4).map(s => (
                  <span key={s} style={{ fontSize: 10, padding: '2px 6px', background: C.bg, borderRadius: 3, color: C.muted }}>{s}</span>
                ))}
                {(c.subjects||[]).length > 4 && <span style={{ fontSize: 10, color: C.muted }}>+{c.subjects.length-4}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

/* ── ATTENDANCE ────────────────────────────────────────────────────────── */
function AttendanceView() {
  const { user } = useAuth()
  const canMarkAttendance = hasPermission('Mark attendance', user?.role)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selClass, setSelClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [records, setRecords] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)  // true = user changed something since last save
  const [lastSync, setLastSync] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    classesApi.list().then(r => setClasses(r.data.data||[])).catch(console.error)
  }, [])

  // Load students + existing attendance whenever class or date changes
  useEffect(() => {
    if (!selClass) { setStudents([]); setRecords({}); return }
    setSaved(false)
    setDirty(false)
    Promise.all([
      studentsApi.list({ classId: selClass, limit: 100 }),
      attendanceApi.list({ classId: selClass, date }),
    ]).then(([sr, ar]) => {
      const list = sr.data.data || []
      setStudents(list)

      // Start with all-present defaults — use String keys for consistency
      const init = {}
      list.forEach(s => { init[String(s.id)] = 'present' })

      // Overlay with whatever is already saved in DB (from mobile or admin)
      // Normalize P/A/L → present/absent/late for display
      const statusMap = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
      const norm = s => statusMap[s] || s || 'present'
      const existing = (ar.data.data || [])[0]
      if (existing?.records) {
        existing.records.forEach(rec => {
          init[String(rec.studentId)] = norm(rec.status)
        })
        setLastSync(new Date())
      }
      setRecords(init)
    }).catch(console.error)
  }, [selClass, date])

  // Auto-refresh every 30s so mobile teacher submissions appear live
  useEffect(() => {
    if (!selClass) return
    const refresh = () => {
      attendanceApi.list({ classId: selClass, date }).then(r => {
        const existing = (r.data.data || [])[0]
        if (existing?.records) {
          const statusMap2 = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
          const norm2 = s => statusMap2[s] || s || 'present'
          setRecords(prev => {
            const updated = { ...prev }
            existing.records.forEach(rec => { updated[String(rec.studentId)] = norm2(rec.status) })
            return updated
          })
          setLastSync(new Date())
        }
      }).catch(console.error)
    }
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(refresh, 30000)
    return () => clearInterval(intervalRef.current)
  }, [selClass, date])

  const toggle = (id) => {
    const key = String(id)
    setDirty(true)   // user made a change — button must become active again
    setSaved(false)
    setRecords(r => ({ ...r, [key]: r[key] === 'present' ? 'absent' : r[key] === 'absent' ? 'late' : 'present' }))
  }

  // Normalize abbreviated codes from mobile (P/A/L) to full words
  const normalizeStatus = s => {
    const map = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
    return map[s] || s || 'present'
  }
  const statusColor = s => {
    const n = normalizeStatus(s)
    return n === 'present' ? C.green : n === 'absent' ? C.red : C.yellow
  }

  const submit = async () => {
    setSaving(true)
    try {
      const recArr = Object.entries(records).map(([studentId, status]) => ({ studentId: Number(studentId), status }))
      await attendanceApi.mark({ classId: selClass, date, records: recArr })
      setSaved(true)
      setDirty(false)
    } catch (e) { alert(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const _sm = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
  const _norm = s => _sm[s] || s || 'present'
  const present = Object.values(records).filter(s => _norm(s) === 'present').length
  const absent  = Object.values(records).filter(s => _norm(s) === 'absent').length
  const late    = Object.values(records).filter(s => _norm(s) === 'late').length

  return (
    <PageShell title="Mark attendance" breadcrumbs="Branch"
      actions={<>
        {lastSync && <span style={{ fontSize: 11, color: C.muted }}>Synced {lastSync.toLocaleTimeString()}</span>}
        <Pill color={C.green}>● Auto-syncs every 30s</Pill>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }} />
        <select value={selClass} onChange={e=>setSelClass(e.target.value)} style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">Select class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
        </select>
        {selClass && <GhostBtn onClick={() => {
          const sm = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
          const nm = s => sm[s] || s || 'present'
          attendanceApi.list({ classId: selClass, date }).then(r => {
            const existing = (r.data.data || [])[0]
            if (existing?.records) {
              setRecords(prev => {
                const updated = { ...prev }
                existing.records.forEach(rec => { updated[String(rec.studentId)] = nm(rec.status) })
                return updated
              })
              setLastSync(new Date())
            }
          }).catch(console.error)
        }}>↻ Refresh</GhostBtn>}
        {students.length > 0 && canMarkAttendance && <PrimaryBtn onClick={submit} disabled={saving || (saved && !dirty)}>{saving ? 'Saving…' : (saved && !dirty) ? '✓ Saved' : 'Submit attendance'}</PrimaryBtn>}
      </>}>

      {!selClass ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>Select a class and date to mark attendance</div>
      ) : students.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>No students in this class</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[['Present',present,C.green],['Absent',absent,C.red],['Late',late,C.yellow]].map(([l,v,col]) => (
              <div key={l} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: col }}>{v}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ padding: '10px 14px', fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.lineFaint}` }}>
              Tap a student to cycle: Present → Absent → Late → Present
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
              {students.map((s, i) => {
                const status = _norm(records[String(s.id)] || 'present')
                return (
                  <div key={s.id} onClick={() => canMarkAttendance && toggle(s.id)} style={{ padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, borderRight: (i+1)%4!==0 ? `1px solid ${C.lineFaint}` : 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: canMarkAttendance ? 'pointer' : 'default', background: status === 'absent' ? `${C.red}06` : status === 'late' ? `${C.yellow}06` : '#fff', transition: 'background 0.1s' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${statusColor(status)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: statusColor(status), flexShrink: 0 }}>
                      {s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>#{s.rollNo || s.admissionNo}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(status), textTransform: 'uppercase' }}>{status[0]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </PageShell>
  )
}

/* ── MARKS & RESULTS ───────────────────────────────────────────────────── */
const EXAM_TYPE_META = {
  chapter_test: { label: 'Chapter Test', color: C.blue  },
  class_test:   { label: 'Class Test',   color: C.green },
  unit_test:    { label: 'Unit Test',    color: C.yellow },
  term_exam:    { label: 'Term Exam',    color: C.red   },
}

function MarksView() {
  const [activeType, setActiveType] = useState('unit_test')
  const [classes, setClasses] = useState([])
  const [selClassId, setSelClassId] = useState('')
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    classesApi.list().then(r => {
      const list = r.data.data || []
      setClasses(list)
      if (list.length) setSelClassId(String(list[0].id))
    }).catch(console.error)
  }, [])

  const selClass = classes.find(c => String(c.id) === selClassId)

  useEffect(() => {
    if (!selClass) return
    const classNum = parseInt(selClass.name.replace(/\D/g, ''), 10) || 0
    setLoading(true)
    assessmentsApi.list({ classNum, type: activeType, section: selClass.section })
      .then(r => setAssessments(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeType, selClassId, classes])

  const bySubject = (selClass?.subjects || []).map(sub => {
    const subAssessments = assessments.filter(a => a.subjectId === sub)
    const completed = subAssessments.filter(a => ['completed','published'].includes(a.status)).length
    const total = subAssessments.length
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { name: sub, pct, total, completed }
  })

  const pending = bySubject.filter(s => s.pct < 100).length

  return (
    <PageShell title="Marks & results" breadcrumbs="Branch"
      actions={<>
        <select value={selClassId} onChange={e=>setSelClassId(e.target.value)} style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">Select class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
        </select>
        <GhostBtn>Term 1 ▾</GhostBtn>
        <PrimaryBtn>Publish results</PrimaryBtn>
      </>}>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
        {/* Left nav */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 10, border: `1px solid ${C.lineFaint}`, alignSelf: 'flex-start' }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, padding: '4px 8px 8px', borderBottom: `1px solid ${C.lineFaint}`, marginBottom: 6 }}>Assessment type</div>
          {Object.entries(EXAM_TYPE_META).map(([type, meta]) => (
            <button key={type} onClick={() => setActiveType(type)} style={{
              width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: 'none', marginBottom: 2,
              background: activeType === type ? `${meta.color}12` : 'transparent',
              color: activeType === type ? meta.color : C.ink,
              fontWeight: activeType === type ? 600 : 400,
            }}>
              {meta.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Entry progress by subject */}
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{EXAM_TYPE_META[activeType]?.label} · entry progress</div>
              {loading ? <Pill color={C.muted}>Loading…</Pill>
                : pending > 0 ? <Pill color={C.yellow}>{pending} subjects pending</Pill>
                : <Pill color={C.green}>All entries complete</Pill>}
            </div>
            {!selClassId ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 12 }}>Select a class to see entry progress</div>
            ) : bySubject.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 12 }}>No subjects defined for this class</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {bySubject.map((s, i) => {
                  const col = s.pct === 100 ? C.green : s.pct >= 75 ? C.yellow : C.red
                  return (
                    <div key={i} style={{ padding: 12, border: `1px solid ${C.lineFaint}`, borderRadius: 6, borderTop: `3px solid ${col}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, marginBottom: 8 }}>{s.completed}/{s.total} done</div>
                      <ProgressBar value={s.pct} color={col} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Assessment list */}
          <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 12, fontWeight: 600, color: C.ink }}>
              All {EXAM_TYPE_META[activeType]?.label} assessments {selClass ? `— ${selClass.name}-${selClass.section}` : ''}
            </div>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 12 }}>Loading…</div>
            ) : assessments.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 12 }}>No assessments found for this type and class</div>
            ) : assessments.map((a, i) => {
              const col = a.status === 'published' ? C.green : a.status === 'completed' ? C.blue : a.status === 'active' ? C.yellow : C.muted
              return (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', borderBottom: i < assessments.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.ink }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{a.subjectId} · Max {a.maxMarks}</div>
                  </div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{a.scheduledFor ? new Date(a.scheduledFor).toLocaleDateString() : '—'}</div>
                  <div><Pill color={col}>{a.status}</Pill></div>
                  <div style={{ fontSize: 10, color: C.muted }}>{a.Chapter ? `Ch.${a.Chapter.chapterNumber}` : ''}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

/* ── CURRICULUM (chapter manager) ──────────────────────────────────────── */
function CurriculumView() {
  const [classes, setClasses] = useState([])
  const [selClassId, setSelClassId] = useState('')
  const [selSubject, setSelSubject] = useState('')
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ no: '', name: '', periods: '', maxMarks: '20' })
  const [addErr, setAddErr] = useState('')

  useEffect(() => {
    classesApi.list().then(r => {
      const list = r.data.data || []
      setClasses(list)
      if (list.length) {
        setSelClassId(String(list[0].id))
        if ((list[0].subjects || []).length) setSelSubject(list[0].subjects[0])
      }
    }).catch(console.error)
  }, [])

  const selClass = classes.find(c => String(c.id) === selClassId)
  const subjects = selClass?.subjects || []

  useEffect(() => {
    if (!selClassId || !selSubject) { setChapters([]); return }
    const cls = classes.find(c => String(c.id) === selClassId)
    if (!cls) return
    const classNum = parseInt(cls.name.replace(/\D/g, ''), 10) || 0
    setLoading(true)
    chaptersApi.list({ classNum, subjectId: selSubject })
      .then(r => setChapters(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selClassId, selSubject, classes])

  const statusColor = s => s === 'done' ? C.green : s === 'in_progress' ? C.blue : C.muted
  const statusLabel = s => s === 'done' ? 'Done' : s === 'in_progress' ? 'In progress' : 'Upcoming'

  const addChapter = async () => {
    if (!form.no || !form.name) { setAddErr('Chapter number and name are required'); return }
    if (!selClassId || !selSubject) { setAddErr('Select a class and subject first'); return }
    const cls = classes.find(c => String(c.id) === selClassId)
    const classNum = parseInt(cls.name.replace(/\D/g, ''), 10) || 0
    setSaving(true); setAddErr('')
    try {
      await chaptersApi.create({ classNum, subjectId: selSubject, chapterNumber: Number(form.no), name: form.name.trim(), periods: Number(form.periods)||0, maxMarks: Number(form.maxMarks)||20 })
      setForm({ no: '', name: '', periods: '', maxMarks: '20' })
      const r = await chaptersApi.list({ classNum, subjectId: selSubject })
      setChapters(r.data.data || [])
    } catch (e) { setAddErr(e.response?.data?.message || 'Failed to add') }
    finally { setSaving(false) }
  }

  const removeChapter = async (id) => {
    if (!window.confirm('Delete this chapter?')) return
    try {
      await chaptersApi.remove(id)
      setChapters(prev => prev.filter(c => c.id !== id))
    } catch (e) { alert(e.response?.data?.message || 'Cannot delete') }
  }

  const done = chapters.filter(c => c.status === 'done').length
  const inProgress = chapters.filter(c => c.status === 'in_progress').length

  return (
    <PageShell title={`Chapters — ${selClass ? `${selClass.name}-${selClass.section}` : '…'} · ${selSubject || '…'}`}
      breadcrumbs={`Branch · Curriculum`}
      actions={<>
        <select value={selClassId} onChange={e=>{ setSelClassId(e.target.value); setSelSubject('') }} style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">Select class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
        </select>
        <select value={selSubject} onChange={e=>setSelSubject(e.target.value)} style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">Select subject…</option>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        <GhostBtn>Import from CBSE</GhostBtn>
      </>}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Chapter list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.lineFaint}`, fontSize: 12, color: C.muted, display: 'flex', gap: 16, alignItems: 'center' }}>
            <span>{chapters.length} chapters defined</span>
            <span style={{ color: C.green }}>✓ {done} complete</span>
            {inProgress > 0 && <span style={{ color: C.blue }}>● {inProgress} in progress</span>}
            <Pill color={C.blue} style={{ marginLeft: 'auto' }}>Term 1</Pill>
          </div>

          <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '56px 2.4fr 80px 120px 80px 40px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <div>Ch. #</div><div>Chapter name</div><div>Periods</div><div>Status</div><div>Max marks</div><div></div>
            </div>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 12 }}>Loading…</div>
            ) : chapters.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 12 }}>No chapters yet — add one using the form →</div>
            ) : chapters.map((c, i) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '56px 2.4fr 80px 120px 80px 40px', padding: '12px 14px', borderBottom: i < chapters.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center', background: c.status === 'in_progress' ? `${C.blue}05` : '#fff' }}>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: statusColor(c.status), fontSize: 11 }}>Ch.{c.chapterNumber}</div>
                <div style={{ fontWeight: c.status === 'in_progress' ? 600 : 500, color: C.ink }}>{c.name}</div>
                <div style={{ color: C.muted }}>{c.periods || '—'}</div>
                <div><Pill color={statusColor(c.status)}>{statusLabel(c.status)}</Pill></div>
                <div style={{ color: C.muted }}>{c.maxMarks}</div>
                <div>
                  <button onClick={() => removeChapter(c.id)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add chapter form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 14 }}>+ Add chapter</div>
            {addErr && <div style={{ marginBottom: 10, padding: '6px 10px', background: `${C.red}10`, borderRadius: 4, fontSize: 12, color: C.red }}>{addErr}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Chapter number *</label>
                <input value={form.no} onChange={e=>setForm(f=>({...f,no:e.target.value}))} placeholder="e.g. 11" type="number"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: `1px solid ${C.lineFaint}`, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Chapter name *</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Constructions"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: `1px solid ${C.lineFaint}`, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Periods</label>
                  <input value={form.periods} onChange={e=>setForm(f=>({...f,periods:e.target.value}))} placeholder="4" type="number"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: `1px solid ${C.lineFaint}`, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Max marks</label>
                  <input value={form.maxMarks} onChange={e=>setForm(f=>({...f,maxMarks:e.target.value}))} placeholder="20" type="number"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: `1px solid ${C.lineFaint}`, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>After this chapter</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}`, fontWeight: 500 }}>✓ Chapter test</span>
                  <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, background: '#fff', color: C.muted, border: `1px solid ${C.lineFaint}` }}>○ Quiz only</span>
                </div>
              </div>
              <button onClick={addChapter} disabled={saving} style={{ width: '100%', padding: '9px', borderRadius: 6, background: saving ? C.muted : C.blue, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4 }}>
                {saving ? 'Saving…' : 'Add chapter'}
              </button>
            </div>
          </div>

          <div style={{ background: `${C.blue}06`, borderRadius: 8, padding: 14, border: `1px dashed ${C.blue}50`, fontSize: 12, color: C.ink, lineHeight: 1.6 }}>
            <b>Teachers see this list</b> inside their app — they enter marks against each chapter as they finish teaching it.
          </div>
        </div>
      </div>
    </PageShell>
  )
}

/* ── NOTICES ───────────────────────────────────────────────────────────── */
function NoticesView() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', body: '', priority: 'info', audience: 'All teachers' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const AUDIENCES = ['All teachers', 'Class teachers', 'All staff']
  const PRIORITIES = [
    { value: 'info', label: 'Info', color: C.blue },
    { value: 'reminder', label: 'Reminder', color: C.yellow },
    { value: 'urgent', label: 'Urgent', color: C.red },
  ]

  const load = useCallback(() => {
    setLoading(true)
    noticesApi.list()
      .then(r => setNotices(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const sendNotice = async () => {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')
    try {
      await noticesApi.create(form)
      setForm({ title: '', body: '', priority: 'info', audience: 'All teachers' })
      load()
    } catch (e) { setErr(e.response?.data?.message || 'Failed to send') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    try { await noticesApi.remove(id); load() }
    catch (e) { alert(e.response?.data?.message || 'Failed') }
  }

  const priorityColor = (p) => PRIORITIES.find(x => x.value === p)?.color || C.muted
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <PageShell title="Notices & announcements" breadcrumbs="Branch"
      actions={<Pill color={C.green}>Teachers see these in the mobile app</Pill>}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : notices.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>No notices yet — create one →</div>
          ) : notices.map((n) => (
            <div key={n.id} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, borderLeft: `3px solid ${priorityColor(n.priority)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{n.audience} · {timeAgo(n.createdAt)}</div>
                  {n.body && <div style={{ fontSize: 12, color: C.ink, marginTop: 8, lineHeight: 1.5 }}>{n.body}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 12 }}>
                  <Pill color={priorityColor(n.priority)}>{n.priority}</Pill>
                  <DangerBtn onClick={() => remove(n.id)}>×</DangerBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, alignSelf: 'flex-start' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>New notice</div>
          {err && <div style={{ marginBottom: 8, padding: '6px 10px', background: `${C.red}10`, borderRadius: 4, fontSize: 12, color: C.red }}>{err}</div>}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 5 }}>Title *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Holiday on Friday"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Priority</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setForm(f=>({...f,priority:p.value}))}
                  style={{ flex: 1, padding: '4px 8px', borderRadius: 4, fontSize: 11, border: `1px solid ${form.priority===p.value?p.color:C.lineFaint}`, background: form.priority===p.value?`${p.color}15`:'#fff', color: form.priority===p.value?p.color:C.ink, cursor: 'pointer' }}>{p.label}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 6 }}>Audience</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {AUDIENCES.map(a => (
                <button key={a} onClick={() => setForm(f=>({...f,audience:a}))} style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, border: `1px solid ${form.audience===a?C.blue:C.lineFaint}`, background: form.audience===a?`${C.blue}15`:'#fff', color: form.audience===a?C.blue:C.ink, cursor: 'pointer' }}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 5 }}>Body</label>
            <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Type message here…" rows={4}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button onClick={sendNotice} disabled={saving} style={{ width: '100%', padding: '8px', borderRadius: 4, fontSize: 13, fontWeight: 600, background: saving ? C.muted : C.blue, color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Sending…' : 'Send to teachers'}
          </button>
        </div>
      </div>
    </PageShell>
  )
}

/* ── REPORTS & SETTINGS ─────────────────────────────────────────────────── */
function ReportsView() {
  const [classes, setClasses] = useState([])
  const [selClassId, setSelClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [attendanceData, setAttendanceData] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    classesApi.list().then(r => {
      const list = r.data.data || []
      setClasses(list)
      if (list.length) setSelClassId(String(list[0].id))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selClassId) return
    setLoading(true)
    Promise.all([
      attendanceApi.list({ classId: selClassId, date }),
      studentsApi.list({ classId: selClassId, limit: 200 }),
    ]).then(([ar, sr]) => {
      setAttendanceData((ar.data.data || [])[0] || null)
      setStudents(sr.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [selClassId, date])

  const records = attendanceData?.records || []
  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const pct = records.length ? Math.round((present / records.length) * 100) : null

  const exportCSV = () => {
    const selClass = classes.find(c => String(c.id) === selClassId)
    const header = ['Name', 'Roll No', 'Status']
    const rows = students.map(s => {
      const rec = records.find(r => String(r.studentId) === String(s.id))
      return [`"${s.name}"`, s.rollNo || s.admissionNo || '', rec?.status || 'not marked']
    })
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `attendance-${selClass?.name || 'class'}-${date}.csv`
    a.click()
  }

  return (
    <PageShell title="Reports" breadcrumbs="Branch"
      actions={<>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }} />
        <select value={selClassId} onChange={e => setSelClassId(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}>
          <option value="">Select class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
        </select>
        <GhostBtn onClick={exportCSV}>Export CSV</GhostBtn>
      </>}>

      {/* Attendance summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['Present', present, C.green],
          ['Absent',  absent,  C.red],
          ['Late',    late,    C.yellow],
          ['Attendance %', pct != null ? `${pct}%` : '—', pct != null && pct >= 75 ? C.green : C.red],
        ].map(([label, val, col]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}`, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: col }}>{loading ? '…' : val}</div>
          </div>
        ))}
      </div>

      {/* Student attendance list */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 600 }}>
          <div>Student</div><div>Roll</div><div>Status</div>
        </div>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 12 }}>Loading…</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 12 }}>Select a class to see the report</div>
        ) : students.map((s, i) => {
          const rec = records.find(r => String(r.studentId) === String(s.id))
          const status = rec?.status || 'not marked'
          const col = status === 'present' ? C.green : status === 'absent' ? C.red : status === 'late' ? C.yellow : C.muted
          return (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderBottom: i < students.length - 1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
              <div style={{ fontWeight: 500, color: C.ink }}>{s.name}</div>
              <div style={{ color: C.muted }}>{s.rollNo || '—'}</div>
              <div><Pill color={col}>{status}</Pill></div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}

function SettingsView() {
  const { user } = useAuth()
  const [schoolSettings, setSchoolSettings] = useState(null)
  const [form, setForm] = useState({ academicYear: '', greenThreshold: 75, yellowThreshold: 50, passMarksDefault: 12, maxMarksDefault: 30 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    settingsApi.get()
      .then(r => {
        const s = r.data.data
        setSchoolSettings(s)
        setForm({
          academicYear: s.academicYear || '2025-26',
          greenThreshold: s.greenThreshold ?? 75,
          yellowThreshold: s.yellowThreshold ?? 50,
          passMarksDefault: s.passMarksDefault ?? 12,
          maxMarksDefault: s.maxMarksDefault ?? 30,
        })
      }).catch(console.error)
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false); setErr('')
    try {
      await settingsApi.update(form)
      setSaved(true)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const field = (label, key, type = 'text', hint) => (
    <div key={key}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', boxSizing: 'border-box' }} />
      {hint && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{hint}</div>}
    </div>
  )

  return (
    <PageShell title="Branch settings" breadcrumbs="Branch"
      actions={<PrimaryBtn onClick={save} disabled={saving}>{saving ? 'Saving…' : saved ? '✓ Saved' : 'Save settings'}</PrimaryBtn>}>
      {err && <div style={{ marginBottom: 12, padding: '8px 12px', background: `${C.red}10`, borderRadius: 6, fontSize: 12, color: C.red }}>{err}</div>}
      {saved && <div style={{ marginBottom: 12, padding: '8px 12px', background: `${C.green}10`, borderRadius: 6, fontSize: 12, color: C.green }}>Settings saved successfully</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}`, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 14 }}>Account info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['School ID', user?.schoolId ?? '—'], ['Role', user?.role ?? '—'], ['Email', user?.email ?? '—'], ['School', schoolSettings?.schoolName || '—']].map(([label, val]) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 5 }}>{label}</label>
                <div style={{ padding: '8px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, background: C.bg, color: C.muted }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 14 }}>Academic settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {field('Academic year', 'academicYear', 'text')}
            {field('Default max marks', 'maxMarksDefault', 'number')}
            {field('Default pass marks', 'passMarksDefault', 'number')}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 14 }}>Performance thresholds</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
            These thresholds determine the green / yellow / red student categories visible in the mobile app and admin panel.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {field('Green (good) threshold %', 'greenThreshold', 'number', 'Students above this are green')}
            {field('Yellow (average) threshold %', 'yellowThreshold', 'number', 'Students between yellow and green are yellow; below yellow are red')}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
export default function PrincipalAdmin({ activeView = 'dashboard' }) {
  switch (activeView) {
    case 'classes':          return <ClassesView />
    case 'teachers':         return <TeachersView />
    case 'students':         return <StudentsView />
    case 'underperformers':  return <UnderperformersView />
    case 'attendance':       return <AttendanceView />
    case 'marks':            return <MarksView />
    case 'curriculum':       return <CurriculumView />
    case 'reports':          return <ReportsView />
    case 'notices':          return <NoticesView />
    case 'settings':         return <SettingsView />
    default:                 return <DashboardView />
  }
}
