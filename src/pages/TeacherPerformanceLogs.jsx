import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { teacherPerformance as performanceApi, teachers as teachersApi, settings as settingsApi, behaviourMetrics as metricsApi } from '../api'

const C = {
  blue: '#2563EB', green: '#10B981', yellow: '#F59E0B',
  red: '#EF4444', bg: '#F8FAFC', ink: '#1E293B',
  muted: '#94A3B8', lineFaint: '#E2E8F0',
}

const Pill = ({ color = C.muted, children, style }) => (
  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: `${color}20`, color, ...style }}>{children}</span>
)
const GhostBtn = ({ children, onClick, disabled, type = 'button' }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 12, background: '#fff', border: `1px solid ${C.lineFaint}`, color: disabled ? C.muted : C.ink, cursor: disabled ? 'not-allowed' : 'pointer' }}>{children}</button>
)
const PrimaryBtn = ({ children, onClick, disabled, type = 'button' }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13, background: disabled ? C.muted : C.blue, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{children}</button>
)
const DangerBtn = ({ children, onClick }) => (
  <button type="button" onClick={onClick} style={{ padding: '3px 8px', fontSize: 11, borderRadius: 4, background: `${C.red}15`, color: C.red, border: 'none', cursor: 'pointer', fontWeight: 600 }}>{children}</button>
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

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 440, padding: 20, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: C.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function TeacherPerformanceLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [teachers, setTeachers] = useState([])
  const [academicYear, setAcademicYear] = useState('2025-26')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    teacherId: '',
    score: '',
    remark: '',
    category: 'General'
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [logRes, teacherRes, metricsRes] = await Promise.all([
        performanceApi.list(),
        teachersApi.list({ limit: 300 }),
        metricsApi.list({ target: 'teacher' }).catch(e => {
          console.warn("Failed to fetch teacher categories:", e)
          return { data: { data: [] } }
        })
      ])
      setLogs(logRes.data.data || [])
      setTeachers(teacherRes.data.data || [])
      
      const cats = (metricsRes.data.data || []).map(m => m.name)
      if (!cats.includes('General')) cats.unshift('General')
      setCategories(cats)

      try {
        const settingsRes = await settingsApi.get()
        if (settingsRes.data.data?.academicYear) {
          setAcademicYear(settingsRes.data.data.academicYear)
        }
      } catch (e) {
        console.warn('Failed to load settings:', e.message)
      }
    } catch (e) {
      setError('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.teacherId || !form.score) return
    
    const scoreVal = parseFloat(form.score)
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
      alert('Score must be between 0 and 10')
      return
    }

    setSaving(true)
    try {
      const payload = {
        teacherId: form.teacherId,
        score: scoreVal,
        remark: form.remark,
        category: form.category,
        academicYear
      }

      if (editingLog) {
        await performanceApi.update(editingLog.id, payload)
      } else {
        await performanceApi.create(payload)
      }

      setShowAdd(false)
      setEditingLog(null)
      setForm({ teacherId: '', score: '', remark: '', category: 'General' })
      await load()
    } catch (e) {
      alert(e.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (log) => {
    setEditingLog(log)
    setForm({
      teacherId: String(log.teacherId),
      score: String(log.score),
      remark: log.remark || '',
      category: log.category || 'General'
    })
    setShowAdd(true)
  }

  const handleDelete = async (log) => {
    if (!window.confirm(`Delete performance log for teacher "${log.teacher?.name}"?`)) return
    try {
      await performanceApi.remove(log.id)
      await load()
    } catch (e) {
      alert('Failed to delete log')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return C.green
    if (score >= 6) return C.yellow
    return C.red
  }

  const filteredLogs = logs.filter(log => {
    const q = search.toLowerCase()
    return (
      (log.teacher?.name || '').toLowerCase().includes(q) ||
      (log.category || '').toLowerCase().includes(q) ||
      (log.remark || '').toLowerCase().includes(q) ||
      (log.logger?.name || '').toLowerCase().includes(q)
    )
  })

  return (
    <PageShell title="Teacher Performance Logs" breadcrumbs="Branch"
      actions={<>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs…"
          style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none', width: 200 }} />
        <PrimaryBtn onClick={() => {
          setEditingLog(null)
          setForm({ teacherId: '', score: '', remark: '', category: categories[0] || 'General' })
          setShowAdd(true)
        }}>
          + Log Performance
        </PrimaryBtn>
      </>}
    >
      {error && (
        <div style={{ background: `${C.red}10`, color: C.red, padding: '10px 12px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading performance logs…</div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted }}>
          No matching performance logs found.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${C.lineFaint}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.lineFaint}`, textAlign: 'left', color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Teacher</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Score (out of 10)</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Remark</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Logged By</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${C.lineFaint}` }}>
                  <td style={{ padding: '12px 14px', color: C.muted }}>{log.date}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: C.ink }}>{log.teacher?.name || 'Unknown'}</td>
                  <td style={{ padding: '12px 14px' }}><Pill color={C.blue}>{log.category || 'General'}</Pill></td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: `${getScoreColor(log.score)}15`,
                      color: getScoreColor(log.score)
                    }}>
                      {log.score.toFixed(1)} / 10.0
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: C.ink }}>{log.remark || '—'}</td>
                  <td style={{ padding: '12px 14px', color: C.muted }}>{log.logger?.name || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <GhostBtn onClick={() => handleEdit(log)}>Edit</GhostBtn>
                      <DangerBtn onClick={() => handleDelete(log)}>Delete</DangerBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title={editingLog ? 'Edit Performance Log' : 'New Performance Log'} onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Teacher *</label>
              <select
                value={form.teacherId}
                onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                required
                disabled={!!editingLog}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 13, border: `1px solid ${C.lineFaint}`, outline: 'none', background: '#fff' }}
              >
                <option value="">Select teacher…</option>
                {teachers.map(t => <option key={t.id} value={t.userId}>{t.name} ({t.email})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Score (0–10) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.score}
                onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                required
                placeholder="e.g. 8.5"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 13, border: `1px solid ${C.lineFaint}`, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 13, border: `1px solid ${C.lineFaint}`, outline: 'none', background: '#fff' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Behaviour Note / Remark</label>
              <textarea
                rows="3"
                value={form.remark}
                onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                placeholder="Enter details..."
                style={{ width: '100%', padding: '8px 10px', borderRadius: 4, fontSize: 13, border: `1px solid ${C.lineFaint}`, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <GhostBtn type="button" onClick={() => setShowAdd(false)}>Cancel</GhostBtn>
              <PrimaryBtn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Log'}</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
