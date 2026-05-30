import { useState, useEffect, useCallback, useRef } from 'react'
import { schools as schoolsApi, teachers as teachersApi, users as usersApi, dashboard as dashboardApi, notices as noticesApi, students as studentsApi, classes as classesApi } from '../api'
import SystemOverview from './SystemOverview'

const C = {
  blue: '#2563EB', green: '#10B981', yellow: '#F59E0B',
  red: '#EF4444', bg: '#F8FAFC', ink: '#1E293B',
  muted: '#94A3B8', lineFaint: '#E2E8F0',
}

/* ── shared primitives ─────────────────────────────────────────────────── */
const Pill = ({ color = C.muted, children }) => (
  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: `${color}20`, color }}>{children}</span>
)
const GhostBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, color: disabled ? C.muted : C.ink, cursor: disabled ? 'not-allowed' : 'pointer' }}>{children}</button>
)
const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: disabled ? C.muted : C.blue, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{children}</button>
)
const DangerBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, background: `${C.red}15`, color: C.red, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{children}</button>
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

function Input({ label, name, value, onChange, type = 'text', required, placeholder, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${error ? C.red : C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' }} />
      {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
    </div>
  )
}

function Select({ label, name, value, onChange, options, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
      <select name={name} value={value} onChange={onChange} required={required}
        style={{ padding: '7px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, color: C.ink, outline: 'none', background: '#fff' }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  )
}

function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 10, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.lineFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.muted, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        {footer && <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.lineFaint}`, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm delete" onClose={onCancel}
      footer={<>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <button onClick={onConfirm} disabled={loading}
          style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: C.red, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </>}>
      <p style={{ margin: 0, fontSize: 13, color: C.ink }}>{message}</p>
    </Modal>
  )
}

function ErrBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: `${C.red}10`, border: `1px solid ${C.red}30`, borderRadius: 6, fontSize: 12, color: C.red }}>{msg}</div>
}

function InfoBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '10px 12px', background: `${C.green}10`, border: `1px solid ${C.green}30`, borderRadius: 6, fontSize: 12, color: C.green }}>{msg}</div>
}

/* ── Pagination controls ──────────────────────────────────────────────── */
function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', padding: '10px 14px', borderTop: `1px solid ${C.lineFaint}` }}>
      <GhostBtn onClick={() => onPage(page - 1)} disabled={page <= 1}>← Prev</GhostBtn>
      <span style={{ padding: '6px 10px', fontSize: 12, color: C.muted }}>Page {page} of {pages}</span>
      <GhostBtn onClick={() => onPage(page + 1)} disabled={page >= pages}>Next →</GhostBtn>
    </div>
  )
}

/* ── useDebounce hook ─────────────────────────────────────────────────── */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── BRANCHES ─────────────────────────────────────────────────────────── */
function BranchModal({ branch, onClose, onSaved }) {
  const empty = { name: '', city: '', state: '', addressLine1: '', pincode: '', phone: '', email: '', board: 'CBSE', plan: 'Basic', status: 'trial' }
  const [form, setForm] = useState(branch ? { ...empty, ...branch } : empty)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Branch name is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone number'
    if (form.pincode && !/^[0-9]{4,10}$/.test(form.pincode)) errs.pincode = 'Invalid pincode'
    return errs
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setSaving(true); setErr('')
    try {
      const res = branch ? await schoolsApi.update(branch.id, form) : await schoolsApi.create(form)
      onSaved(res.data.data)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={branch ? 'Edit branch' : 'Add new branch'} subtitle="Branch code auto-generated" onClose={onClose}
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : branch ? 'Save changes' : 'Create branch'}</PrimaryBtn>
      </>}>
      <ErrBanner msg={err} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: 'span 2' }}><Input label="Branch name" name="name" value={form.name} onChange={set} required error={fieldErrors.name} /></div>
        <div style={{ gridColumn: 'span 2' }}><Input label="Address" name="addressLine1" value={form.addressLine1 || ''} onChange={set} /></div>
        <Input label="City" name="city" value={form.city} onChange={set} required error={fieldErrors.city} />
        <Input label="State" name="state" value={form.state} onChange={set} required error={fieldErrors.state} />
        <Input label="Pincode" name="pincode" value={form.pincode || ''} onChange={set} error={fieldErrors.pincode} />
        <Input label="Phone" name="phone" value={form.phone || ''} onChange={set} error={fieldErrors.phone} />
        <div style={{ gridColumn: 'span 2' }}><Input label="Email" name="email" value={form.email || ''} onChange={set} type="email" error={fieldErrors.email} /></div>
        <Select label="Board" name="board" value={form.board} onChange={set} options={['CBSE','ICSE','State Board','IB','Other']} />
        <Select label="Plan" name="plan" value={form.plan} onChange={set} options={['Basic','Pro','Enterprise']} />
        <Select label="Status" name="status" value={form.status} onChange={set} options={['active','trial','suspended']} />
      </div>
    </Modal>
  )
}

function BranchesView({ onViewBranch }) {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [editBranch, setEditBranch] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search)

  const load = useCallback((p = 1) => {
    setLoading(true)
    schoolsApi.list({ page: p, limit: 20, search: debouncedSearch || undefined })
      .then(r => {
        setSchools(r.data.data || [])
        setTotal(r.data.total || 0)
        setPages(r.data.pages || 1)
        setPage(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  useEffect(() => { load(1) }, [load])

  const doDelete = async () => {
    setDeleting(true)
    try { await schoolsApi.remove(delTarget.id); setDelTarget(null); load(page) }
    catch (e) { alert(e.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const exportCSV = () => {
    const h = ['Name','City','State','Board','Plan','Status','Students','Teachers','Code']
    const rows = schools.map(s => [`"${s.name}"`,s.city,s.state,s.board||'',s.plan,s.status,s.studentCount||0,s.teacherCount||0,s.code||''])
    const csv = [h,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = `branches-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  return (
    <PageShell title={`Branches (${total})`} breadcrumbs="StudentLens"
      actions={<>
        <input value={search} onChange={e=>{ setSearch(e.target.value) }} placeholder="Search branches…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        <GhostBtn onClick={exportCSV}>Export CSV</GhostBtn>
        <PrimaryBtn onClick={() => setShowAdd(true)}>+ New branch</PrimaryBtn>
      </>}>

      {showAdd && <BranchModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(1) }} />}
      {editBranch && <BranchModal branch={editBranch} onClose={() => setEditBranch(null)} onSaved={() => { setEditBranch(null); load(page) }} />}
      {delTarget && <ConfirmModal message={`Delete branch "${delTarget.name}"? This cannot be undone.`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 130px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Branch</div><div>Location</div><div>Students</div><div>Teachers</div><div>Plan</div><div>Status</div><div></div>
        </div>
        {loading ? Array.from({length:5}).map((_,i)=>(
          <div key={i} style={{padding:'12px 14px',borderBottom:`1px solid ${C.lineFaint}`}}>
            <div style={{height:16,background:C.bg,borderRadius:4}} />
          </div>
        )) : schools.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:C.muted,fontSize:13}}>No branches found</div>
        ) : schools.map((s, i) => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 130px', padding: '10px 14px', borderBottom: i < schools.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: C.ink }}>{s.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{s.code}</div>
            </div>
            <div style={{ color: C.muted }}>{s.city}, {s.state}</div>
            <div style={{ color: C.ink }}>{(s.studentCount||0).toLocaleString('en-IN')}</div>
            <div style={{ color: C.ink }}>{s.teacherCount||0}</div>
            <div><Pill color={s.plan==='Enterprise'?C.blue:s.plan==='Pro'?C.green:C.yellow}>{s.plan}</Pill></div>
            <div><Pill color={s.status==='active'?C.green:s.status==='suspended'?C.red:C.yellow}>{s.status}</Pill></div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              {onViewBranch && <button onClick={() => onViewBranch(s)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.blue}`, background: `${C.blue}10`, cursor: 'pointer', color: C.blue, fontWeight: 600 }}>View</button>}
              <button onClick={() => setEditBranch(s)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer', color: C.ink }}>Edit</button>
              <DangerBtn onClick={() => setDelTarget(s)}>Del</DangerBtn>
            </div>
          </div>
        ))}
        <Pagination page={page} pages={pages} onPage={p => load(p)} />
      </div>
    </PageShell>
  )
}

/* ── PRINCIPALS ───────────────────────────────────────────────────────── */
function PrincipalModal({ principal, schools, onClose, onSaved }) {
  const empty = { name: '', email: '', schoolId: '', role: 'principal', password: '' }
  const [form, setForm] = useState(principal ? { ...empty, ...principal } : empty)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [createdPassword, setCreatedPassword] = useState('')
  const set = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setSaving(true); setErr('')
    try {
      const res = principal
        ? await usersApi.update(principal.id, form)
        : await usersApi.create({ ...form, role: 'principal' })
      if (res.data.tempPassword) {
        setCreatedPassword(res.data.tempPassword)
      } else {
        onSaved(res.data.data)
      }
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  if (createdPassword) {
    return (
      <Modal title="Principal created" onClose={() => onSaved(null)}
        footer={<PrimaryBtn onClick={() => onSaved(null)}>Done</PrimaryBtn>}>
        <InfoBanner msg="Principal account created successfully." />
        <div style={{ padding: '12px', background: C.bg, borderRadius: 6, fontSize: 13 }}>
          <div style={{ marginBottom: 6, color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Temporary password — share securely</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: '0.05em' }}>{createdPassword}</div>
          <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>The principal must change this password on first login.</div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={principal ? 'Edit principal' : 'Add principal'} subtitle={!principal ? 'Leave password blank to auto-generate a secure temporary password.' : ''} onClose={onClose}
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : principal ? 'Save' : 'Create'}</PrimaryBtn>
      </>}>
      <ErrBanner msg={err} />
      <Input label="Full name" name="name" value={form.name} onChange={set} required error={fieldErrors.name} />
      <Input label="Email" name="email" value={form.email} onChange={set} type="email" required error={fieldErrors.email} />
      {!principal && (
        <Input label="Password (Optional)" name="password" value={form.password||''} onChange={set} placeholder="Leave blank to auto-generate" error={fieldErrors.password} />
      )}
      <Select label="Assign to branch" name="schoolId" value={form.schoolId||''} onChange={set}
        options={schools.map(s => ({ value: s.id, label: `${s.name} (${s.city})` }))} />
    </Modal>
  )
}

function PrincipalsView() {
  const [principals, setPrincipals] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editP, setEditP] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      usersApi.list({ role: 'principal', search: debouncedSearch || undefined }),
      schoolsApi.list({ limit: 100 }),
    ]).then(([ur, sr]) => {
      setPrincipals(ur.data.data || [])
      setSchools(sr.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [debouncedSearch])

  useEffect(() => { load() }, [load])

  const doDelete = async () => {
    setDeleting(true)
    try { await usersApi.remove(delTarget.id); setDelTarget(null); load() }
    catch (e) { alert(e.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  const branchName = (schoolId) => schools.find(s => s.id === schoolId)?.name || '— unassigned —'

  return (
    <PageShell title={`Principals (${principals.length})`} breadcrumbs="StudentLens"
      actions={<>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add principal</PrimaryBtn>
      </>}>

      {showAdd && <PrincipalModal schools={schools} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
      {editP && <PrincipalModal principal={editP} schools={schools} onClose={() => setEditP(null)} onSaved={() => { setEditP(null); load() }} />}
      {delTarget && <ConfirmModal message={`Remove principal "${delTarget.name}"?`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 0.8fr 100px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Name</div><div>Email</div><div>Branch</div><div>Status</div><div></div>
        </div>
        {loading ? Array.from({length:4}).map((_,i)=>(
          <div key={i} style={{padding:'12px 14px',borderBottom:`1px solid ${C.lineFaint}`}}><div style={{height:16,background:C.bg,borderRadius:4}}/></div>
        )) : principals.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:C.muted,fontSize:13}}>No principals found</div>
        ) : principals.map((p, i) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 0.8fr 100px', padding: '10px 14px', borderBottom: i < principals.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.blue }}>
                {p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, color: C.ink }}>{p.name}</span>
            </div>
            <div style={{ color: C.muted }}>{p.email}</div>
            <div style={{ color: p.schoolId ? C.ink : C.muted, fontStyle: p.schoolId ? 'normal' : 'italic' }}>{branchName(p.schoolId)}</div>
            <div><Pill color={p.isActive ? C.green : C.yellow}>{p.isActive ? 'Active' : 'Inactive'}</Pill></div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditP(p)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer' }}>Edit</button>
              <DangerBtn onClick={() => setDelTarget(p)}>Del</DangerBtn>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

/* ── TEACHERS (SA) ───────────────────────────────────────────────────── */
function TeacherModal({ teacher, schools, onClose, onSaved }) {
  const empty = { name: '', email: '', password: '', employeeId: '', subjects: '', experience: '', qualification: '', schoolId: '' }
  const [form, setForm] = useState(teacher ? { ...empty, ...teacher, subjects: (teacher.subjects||[]).join(', ') } : empty)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.employeeId.trim()) errs.employeeId = 'Employee ID is required'
    if (!form.schoolId) errs.schoolId = 'Branch assignment is required'
    return errs
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setSaving(true); setErr('')
    try {
      const subjects = form.subjects
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      const payload = { ...form, subjects }
      const res = teacher ? await teachersApi.update(teacher.id, payload) : await teachersApi.create(payload)
      onSaved(res.data.data)
    } catch (e) { setErr(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={teacher ? 'Edit teacher' : 'Add teacher'} onClose={onClose}
      footer={<>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit} disabled={saving}>{saving ? 'Saving…' : teacher ? 'Save' : 'Add teacher'}</PrimaryBtn>
      </>}>
      <ErrBanner msg={err} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: 'span 2' }}><Input label="Full name" name="name" value={form.name} onChange={set} required error={fieldErrors.name} /></div>
        <div style={{ gridColumn: 'span 2' }}><Input label="Email address" name="email" value={form.email} onChange={set} type="email" required error={fieldErrors.email} /></div>
        {!teacher && (
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Password (Optional)" name="password" value={form.password||''} onChange={set} placeholder="Leave blank to auto-generate secure temp password" error={fieldErrors.password} />
          </div>
        )}
        <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={set} required error={fieldErrors.employeeId} />
        <Input label="Experience (yrs)" name="experience" value={form.experience||''} onChange={set} type="number" />
        <div style={{ gridColumn: 'span 2' }}><Input label="Subjects (comma-separated)" name="subjects" value={form.subjects||''} onChange={set} placeholder="Mathematics, Science" /></div>
        <div style={{ gridColumn: 'span 2' }}><Input label="Qualification" name="qualification" value={form.qualification||''} onChange={set} /></div>
        <div style={{ gridColumn: 'span 2' }}>
          <Select label="Branch" name="schoolId" value={form.schoolId||''} onChange={set} required
            options={schools.map(s => ({ value: s.id, label: `${s.name} (${s.city})` }))} />
          {fieldErrors.schoolId && <span style={{ fontSize: 11, color: C.red }}>{fieldErrors.schoolId}</span>}
        </div>
      </div>
    </Modal>
  )
}

function TeachersViewSA() {
  const [teachers, setTeachers] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [editT, setEditT] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debouncedSearch = useDebounce(search)

  const load = useCallback((p = 1) => {
    setLoading(true)
    Promise.all([
      teachersApi.list({ page: p, limit: 20, search: debouncedSearch || undefined }),
      schoolsApi.list({ limit: 100 }),
    ])
      .then(([tr, sr]) => {
        setTeachers(tr.data.data || [])
        setTotal(tr.data.total || 0)
        setPages(tr.data.pages || 1)
        setPage(p)
        setSchools(sr.data.data || [])
      })
      .catch(console.error).finally(() => setLoading(false))
  }, [debouncedSearch])

  useEffect(() => { load(1) }, [load])

  const branchName = id => schools.find(s=>s.id===id)?.name || '—'

  const doDelete = async () => {
    setDeleting(true)
    try { await teachersApi.remove(delTarget.id); setDelTarget(null); load(page) }
    catch (e) { alert(e.response?.data?.message||'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <PageShell title={`Teachers (${total})`} breadcrumbs="StudentLens"
      actions={<>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teachers…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add teacher</PrimaryBtn>
      </>}>

      {showAdd && <TeacherModal schools={schools} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(1) }} />}
      {editT && <TeacherModal teacher={editT} schools={schools} onClose={() => setEditT(null)} onSaved={() => { setEditT(null); load(page) }} />}
      {delTarget && <ConfirmModal message={`Remove teacher "${delTarget.name}"?`} loading={deleting} onConfirm={doDelete} onCancel={() => setDelTarget(null)} />}

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.4fr 0.8fr 100px', padding: '10px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          <div>Name</div><div>Branch</div><div>Subjects</div><div>Exp.</div><div></div>
        </div>
        {loading ? Array.from({length:5}).map((_,i)=>(
          <div key={i} style={{padding:'12px 14px',borderBottom:`1px solid ${C.lineFaint}`}}><div style={{height:16,background:C.bg,borderRadius:4}}/></div>
        )) : teachers.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:C.muted,fontSize:13}}>No teachers found</div>
        ) : teachers.map((t, i) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.6fr 1.4fr 0.8fr 100px', padding: '10px 14px', borderBottom: i < teachers.length-1 ? `1px solid ${C.lineFaint}` : 'none', fontSize: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${C.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.green }}>
                {t.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: C.ink }}>{t.name}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{t.employeeId}</div>
              </div>
            </div>
            <div style={{ color: C.muted, fontSize: 11 }}>{branchName(t.schoolId)}</div>
            <div style={{ color: C.ink }}>{(t.subjects||[]).join(', ') || '—'}</div>
            <div style={{ color: C.muted }}>{t.experience ? `${t.experience}y` : '—'}</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditT(t)} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, border: `1px solid ${C.lineFaint}`, background: '#fff', cursor: 'pointer' }}>Edit</button>
              <DangerBtn onClick={() => setDelTarget(t)}>Del</DangerBtn>
            </div>
          </div>
        ))}
        <Pagination page={page} pages={pages} onPage={p => load(p)} />
      </div>
    </PageShell>
  )
}

/* ── ACTIVITY, REPORTS, PERMISSIONS, SETTINGS (kept as-is) ───────────── */
function ActivityView() {
  const events = [
    ['10:42','P. Sharma','invited','principal','Lucknow Hazratganj',C.blue],
    ['10:18','R. Iyer','published','Term 1 results — class 10','Bengaluru Central',C.green],
    ['09:55','System','auto-disabled','inactive teacher account','Mumbai Andheri',C.muted],
    ['09:30','You','created','Indore Vijay Nagar branch','—',C.blue],
    ['09:02','A. Bose','modified','attendance for 8A','Kolkata Salt Lake',C.yellow],
    ['08:44','V. Suresh','exported','student list (CSV, 470 rows)','Chennai T. Nagar',C.muted],
    ['08:20','K. Joshi','removed','teacher M. Khan','Mumbai Andheri',C.red],
  ]
  return (
    <PageShell title="Activity log" breadcrumbs="StudentLens" actions={<GhostBtn>Export</GhostBtn>}>
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 16px 1fr 160px', padding: '12px 14px', borderBottom: i < events.length-1 ? `1px solid ${C.lineFaint}` : 'none', alignItems: 'center', fontSize: 12, gap: 12 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: 'ui-monospace,monospace' }}>{e[0]}</div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: e[5] }} />
            <div><span style={{ fontWeight: 600 }}>{e[1]}</span> <span style={{ color: C.muted }}>{e[2]}</span> <span style={{ color: C.ink }}>{e[3]}</span></div>
            <div style={{ fontSize: 11, color: C.muted, textAlign: 'right' }}>{e[4]}</div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

function ReportsView() {
  return (
    <PageShell title="Cross-branch reports" breadcrumbs="StudentLens" actions={<PrimaryBtn>Generate PDF</PrimaryBtn>}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>
        Reports — coming in next sprint (assessments data needed first)
      </div>
    </PageShell>
  )
}

const DEFAULT_PERMS = [
  { label: 'Create / delete branches',    superadmin: true,  principal: false, teacher: false },
  { label: 'Invite principals',           superadmin: true,  principal: false, teacher: false },
  { label: 'Invite teachers',             superadmin: true,  principal: true,  teacher: false },
  { label: 'View all branch data',        superadmin: true,  principal: false, teacher: false },
  { label: 'Manage classes & sections',   superadmin: true,  principal: true,  teacher: false },
  { label: 'Enter marks',                 superadmin: true,  principal: true,  teacher: true  },
  { label: 'Mark attendance',             superadmin: true,  principal: true,  teacher: true  },
  { label: 'Export data',                 superadmin: true,  principal: true,  teacher: false },
  { label: 'Publish term results',        superadmin: true,  principal: true,  teacher: false },
  { label: 'View audit logs',             superadmin: true,  principal: true,  teacher: false },
]
const ROLES = ['superadmin', 'principal', 'teacher']
const ROLE_LABELS = { superadmin: 'Super Admin', principal: 'Principal', teacher: 'Teacher' }
const STORAGE_KEY = 'shikshalaya_permissions'

function PermissionsView() {
  const load = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_PERMS
    } catch { return DEFAULT_PERMS }
  }

  const [perms, setPerms] = useState(load)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  const toggle = (rowIdx, role) => {
    if (role === 'superadmin') return // superadmin always has all permissions
    setPerms(prev => prev.map((p, i) =>
      i === rowIdx ? { ...p, [role]: !p[role] } : p
    ))
    setDirty(true)
    setSaved(false)
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perms))
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const reset = () => {
    setPerms(DEFAULT_PERMS)
    localStorage.removeItem(STORAGE_KEY)
    setDirty(false)
    setSaved(false)
  }

  return (
    <PageShell title="Roles & permissions" breadcrumbs="Settings"
      actions={<>
        {dirty && <GhostBtn onClick={reset}>Reset to default</GhostBtn>}
        <PrimaryBtn onClick={save} disabled={!dirty}>
          {saved ? '✓ Saved' : 'Save changes'}
        </PrimaryBtn>
      </>}>

      {saved && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: `${C.green}12`, border: `1px solid ${C.green}40`, borderRadius: 6, fontSize: 12, color: C.green }}>
          Permissions saved successfully.
        </div>
      )}

      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
        Super Admin always has full access. Click any toggle to enable or disable a permission for a role.
      </div>

      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: `2fr repeat(${ROLES.length},1fr)`, padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, background: C.bg, borderRadius: '8px 8px 0 0' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permission</div>
          {ROLES.map(r => (
            <div key={r} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: r === 'superadmin' ? C.blue : C.ink }}>
              {ROLE_LABELS[r]}
              {r === 'superadmin' && <div style={{ fontSize: 10, color: C.muted, fontWeight: 400 }}>always on</div>}
            </div>
          ))}
        </div>

        {/* Rows */}
        {perms.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `2fr repeat(${ROLES.length},1fr)`, padding: '12px 14px', borderBottom: i < perms.length - 1 ? `1px solid ${C.lineFaint}` : 'none', alignItems: 'center', fontSize: 13 }}>
            <div style={{ color: C.ink }}>{row.label}</div>
            {ROLES.map(role => {
              const on = row[role]
              const locked = role === 'superadmin'
              return (
                <div key={role} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    onClick={() => toggle(i, role)}
                    title={locked ? 'Super Admin always has this permission' : (on ? 'Click to disable' : 'Click to enable')}
                    style={{
                      display: 'inline-block', width: 32, height: 18, borderRadius: 9,
                      background: on ? (locked ? `${C.blue}90` : C.green) : C.lineFaint,
                      position: 'relative',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                      opacity: locked ? 0.7 : 1,
                    }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: on ? 17 : 3,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </PageShell>
  )
}

function SettingsView() {
  // Superadmin-level settings are platform-wide info only (read-only display)
  // Per-school thresholds/academic year are managed by each principal in their Settings view
  return (
    <PageShell title="Platform settings" breadcrumbs="StudentLens">
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}`, maxWidth: 600 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Platform info</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>These fields are managed via server environment configuration. Per-school settings (academic year, thresholds) are controlled by each branch principal in their Settings view.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Platform', 'Sikshalaya Global — School Management System'],
            ['Environment', import.meta.env.MODE || 'production'],
            ['API', window.location.origin + '/api'],
            ['Version', '1.0.0'],
          ].map(([label, value]) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 5 }}>{label}</label>
              <div style={{ padding: '8px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, background: C.bg, color: C.muted, boxSizing: 'border-box' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}

/* ── BRANCH DETAIL (View as Principal) ────────────────────────────────── */
function BranchDetailView({ school, onExit }) {
  const [stats, setStats]     = useState(null)
  const [notices, setNotices] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      dashboardApi.principal({ schoolId: school.id }),
      noticesApi.list({ schoolId: school.id }),
      classesApi.list({ schoolId: school.id }),
      studentsApi.list({ schoolId: school.id, limit: 1000 }),
      teachersApi.list({ schoolId: school.id, limit: 200 }),
    ]).then(([dr, nr, cr, sr, tr]) => {
      setStats(dr.data.data)
      setNotices(nr.data.data || [])
      setClasses(cr.data.data || [])
      setStudents(sr.data.data || [])
      setTeachers(tr.data.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [school.id])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 30000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  const v = (key, fb) => loading ? '…' : (stats?.[key] ?? fb)
  const attPct = loading ? '…' : stats?.attendance?.pct != null ? `${stats.attendance.pct}%` : '—'

  const priorityColor = (p) => p === 'urgent' ? C.red : p === 'reminder' ? C.yellow : C.blue

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', background: C.bg, minHeight: '100%' }}>
      {/* Header banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '10px 16px', background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Viewing as Principal — {school.name}</span>
        <span style={{ fontSize: 12, color: C.muted }}>{school.city}, {school.state} · {school.board}</span>
        <button onClick={onExit} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, cursor: 'pointer', color: C.ink }}>← Exit branch view</button>
        <button onClick={load} style={{ padding: '5px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, cursor: 'pointer', color: C.ink }}>↻ Refresh</button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          ['Students', v('totalStudents', '—'), 'enrolled', C.blue],
          ['Teachers', v('totalTeachers', '—'), 'active staff', C.muted],
          ['Attendance', attPct, `${stats?.attendance?.present ?? 0}/${stats?.attendance?.total ?? 0} present`, C.green],
          ['Marks pending', v('marksPending', '—'), 'assessments', C.yellow],
          ['Fee pending', v('pendingFeeCount', '—'), 'outstanding', C.red],
        ].map(([label, val, sub, col]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 8, padding: 14, border: `1px solid ${C.lineFaint}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>{val}</div>
            <div style={{ fontSize: 11, color: col, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Classes */}
        <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 13, fontWeight: 600, color: C.ink }}>Classes ({classes.length})</div>
          {loading ? <div style={{ padding: 20, color: C.muted, fontSize: 12, textAlign: 'center' }}>Loading…</div>
            : classes.slice(0, 8).map(c => (
              <div key={c.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{c.name}-{c.section}</span>
                <span style={{ color: C.muted }}>{students.filter(s => s.classId === c.id).length} students</span>
              </div>
            ))}
          {classes.length > 8 && <div style={{ padding: '8px 14px', fontSize: 11, color: C.muted }}>+{classes.length - 8} more classes</div>}
        </div>

        {/* Teachers */}
        <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 13, fontWeight: 600, color: C.ink }}>Teachers ({teachers.length})</div>
          {loading ? <div style={{ padding: 20, color: C.muted, fontSize: 12, textAlign: 'center' }}>Loading…</div>
            : teachers.slice(0, 8).map(t => (
              <div key={t.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{t.name}</span>
                <span style={{ color: C.muted, fontSize: 11 }}>{(t.subjects || []).slice(0,2).join(', ')}</span>
              </div>
            ))}
          {teachers.length > 8 && <div style={{ padding: '8px 14px', fontSize: 11, color: C.muted }}>+{teachers.length - 8} more</div>}
        </div>

        {/* Notices */}
        <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 13, fontWeight: 600, color: C.ink }}>Notices ({notices.length})</div>
          {loading ? <div style={{ padding: 20, color: C.muted, fontSize: 12, textAlign: 'center' }}>Loading…</div>
            : notices.length === 0
              ? <div style={{ padding: 20, color: C.muted, fontSize: 12, textAlign: 'center' }}>No notices yet</div>
              : notices.slice(0, 6).map(n => (
                <div key={n.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${C.lineFaint}`, fontSize: 12, borderLeft: `3px solid ${priorityColor(n.priority)}` }}>
                  <div style={{ fontWeight: 500 }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{n.audience}</div>
                </div>
              ))}
        </div>
      </div>

      {/* Today summary */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>Today's summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, fontSize: 12 }}>
          {[
            ['Attendance taken', v('classesMarked', '—'), C.green],
            ['Classes missing', v('classesMissing', 'None'), C.red],
            ['Assessments pending', v('marksPending', 0), C.yellow],
            ['Fee outstanding', v('pendingFeeCount', 0), C.red],
          ].map(([label, val, col]) => (
            <div key={label} style={{ padding: 12, border: `1px solid ${C.lineFaint}`, borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: col }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── MAIN ────────────────────────────────────────────────────────────── */
export default function SuperAdmin({ activeView = 'overview' }) {
  const [viewAsBranch, setViewAsBranch] = useState(null)

  // If viewing as principal, show branch detail overlay
  if (viewAsBranch) {
    return <BranchDetailView school={viewAsBranch} onExit={() => setViewAsBranch(null)} />
  }

  switch (activeView) {
    case 'branches':    return <BranchesView onViewBranch={setViewAsBranch} />
    case 'principals':  return <PrincipalsView />
    case 'teachers':    return <TeachersViewSA />
    case 'reports':     return <ReportsView />
    case 'activity':    return <ActivityView />
    case 'permissions': return <PermissionsView />
    case 'settings':    return <SettingsView />
    default:            return <SystemOverview />
  }
}
