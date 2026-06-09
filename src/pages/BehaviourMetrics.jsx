import { useState, useEffect } from 'react'
import { behaviourMetrics as metricsApi } from '../api'

const C = {
  blue: '#2563EB', green: '#10B981', yellow: '#F59E0B',
  red: '#EF4444', bg: '#F8FAFC', ink: '#1E293B',
  muted: '#94A3B8', lineFaint: '#E2E8F0',
}

const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ padding: '7px 14px', borderRadius: 6, fontSize: 13, background: disabled ? C.muted : C.blue, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
    {children}
  </button>
)

const DangerBtn = ({ children, onClick }) => (
  <button onClick={onClick}
    style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, background: `${C.red}15`, color: C.red, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
    {children}
  </button>
)

const Badge = ({ kind }) => (
  <span style={{
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: kind === 'positive' ? `${C.green}20` : `${C.red}20`,
    color: kind === 'positive' ? C.green : C.red,
  }}>
    {kind === 'positive' ? '+ Positive' : '− Negative'}
  </span>
)

const CategoryBadge = ({ category }) => (
  <span style={{
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    background: category === 'academic' ? `${C.blue}15` : `${C.yellow}20`,
    color: category === 'academic' ? C.blue : '#92400E',
  }}>
    {category === 'academic' ? 'Academic' : 'Behaviour'}
  </span>
)

const EMPTY_FORM = { name: '', kind: 'positive', weight: '', category: 'behaviour', target: 'student' }

export default function BehaviourMetrics() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await metricsApi.list()
      setMetrics(res.data.data ?? [])
    } catch {
      setError('Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    const isTeacher = form.target === 'teacher'
    if (!form.name.trim()) return
    if (!isTeacher && !form.weight) return

    setSaving(true)
    try {
      const weight = isTeacher ? 1 : parseInt(form.weight, 10)
      const kind = isTeacher ? 'positive' : form.kind
      const category = isTeacher ? form.name.trim() : form.category

      await metricsApi.create({
        name: form.name.trim(),
        kind,
        weight: kind === 'negative' ? -Math.abs(weight) : Math.abs(weight),
        category,
        target: form.target,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch {
      setError('Failed to add metric')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove metric/category "${name}"? Teachers/Principals will no longer be able to log it.`)) return
    try {
      await metricsApi.remove(id)
      await load()
    } catch {
      setError('Failed to remove metric')
    }
  }

  const behaviourMetrics = metrics.filter(m => m.target !== 'teacher' && m.category === 'behaviour')
  const academicMetrics  = metrics.filter(m => m.target !== 'teacher' && m.category === 'academic')
  const teacherMetrics   = metrics.filter(m => m.target === 'teacher')

  return (
    <div style={{ padding: 28, fontFamily: 'Inter, sans-serif', background: C.bg, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Admin › Configuration</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.ink, margin: 0 }}>Behaviour & Performance Metrics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
            Manage the metrics teachers use to log student behaviour and academic performance, as well as performance categories for teacher logs.
          </p>
        </div>
        <PrimaryBtn onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Metric'}
        </PrimaryBtn>
      </div>

      {error && (
        <div style={{ background: `${C.red}15`, color: C.red, padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error} <button onClick={() => setError(null)} style={{ marginLeft: 8, border: 'none', background: 'none', color: C.red, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div style={{ background: '#fff', border: `1px solid ${C.lineFaint}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.ink }}>New Metric / Category</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ minWidth: 140, flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>CHOOSE TARGET GROUP *</label>
              <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value, category: e.target.value === 'teacher' ? 'General' : 'behaviour' }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, background: '#fff' }}>
                <option value="student">For Student</option>
                <option value="teacher">For Teacher</option>
              </select>
            </div>
            
            <div style={{ minWidth: 200, flex: 2 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>
                {form.target === 'teacher' ? 'CATEGORY NAME *' : 'METRIC NAME *'}
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={form.target === 'teacher' ? "e.g. Communication Skills" : "e.g. Creative thinking"}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {form.target !== 'teacher' && (
              <>
                <div style={{ minWidth: 120, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>KIND *</label>
                  <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, background: '#fff' }}>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <div style={{ minWidth: 100, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>WEIGHT (points) *</label>
                  <input
                    type="number" min="1" max="20"
                    value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="e.g. 5"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ minWidth: 120, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 4 }}>CATEGORY *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.lineFaint}`, fontSize: 13, background: '#fff' }}>
                    <option value="behaviour">Behaviour</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>
              </>
            )}
            
            <div style={{ minWidth: 80 }}>
              <PrimaryBtn onClick={handleAdd} disabled={saving || !form.name.trim() || (form.target !== 'teacher' && !form.weight)}>
                {saving ? 'Saving…' : 'Save'}
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading metrics…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <MetricTable
              title="Behaviour Metrics"
              subtitle="Used to log student behaviour in the classroom"
              metrics={behaviourMetrics}
              onDelete={handleDelete}
              accentColor={C.yellow}
            />
            <MetricTable
              title="Academic Metrics"
              subtitle="Used to log academic performance indicators"
              metrics={academicMetrics}
              onDelete={handleDelete}
              accentColor={C.blue}
            />
          </div>
          
          <div style={{ maxWidth: '600px' }}>
            <MetricTable
              title="Teacher Performance Categories"
              subtitle="Custom performance categories logged in teacher logs"
              metrics={teacherMetrics}
              onDelete={handleDelete}
              accentColor={C.green}
              isTeacherTable={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MetricTable({ title, subtitle, metrics, onDelete, accentColor, isTeacherTable }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.lineFaint}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.lineFaint}`, background: `${accentColor}08` }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</h2>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>{subtitle}</p>
      </div>

      {metrics.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          No items configured yet. Click "+ Add Metric" to create one.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={th}>{isTeacherTable ? 'Category Name' : 'Name'}</th>
              {!isTeacherTable && <th style={th}>Kind</th>}
              {!isTeacherTable && <th style={th}>Weight</th>}
              <th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.id} style={{ borderTop: `1px solid ${C.lineFaint}` }}>
                <td style={td}>{m.name}</td>
                {!isTeacherTable && <td style={td}><Badge kind={m.kind} /></td>}
                {!isTeacherTable && (
                  <td style={td}>
                    <span style={{ fontWeight: 700, color: m.kind === 'positive' ? C.green : C.red, fontSize: 13 }}>
                      {m.kind === 'positive' ? '+' : ''}{m.weight} pts
                    </span>
                  </td>
                )}
                <td style={{ ...td, textAlign: 'right' }}>
                  <DangerBtn onClick={() => onDelete(m.id, m.name)}>Remove</DangerBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const th = { padding: '8px 16px', fontSize: 11, fontWeight: 600, color: C.muted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }
const td = { padding: '10px 16px', fontSize: 13, color: C.ink }
