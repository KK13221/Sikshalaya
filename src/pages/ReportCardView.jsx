import { useState, useEffect } from 'react'
import { reports as reportsApi } from '../api'

const C = {
  blue: '#2563EB', green: '#10B981', yellow: '#F59E0B',
  red: '#EF4444', bg: '#F8FAFC', ink: '#1E293B',
  muted: '#94A3B8', lineFaint: '#E2E8F0',
}

export default function ReportCardView({ studentId, initialTerm = 'SA1' }) {
  const [term, setTerm] = useState(initialTerm)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    reportsApi.student(studentId, term)
      .then(res => {
        setData(res.data.data)
      })
      .catch(err => {
        setError('Failed to generate report card data')
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [studentId, term])

  const handlePrint = () => {
    window.print()
  }

  if (!studentId) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>
        Select a student to view their report card.
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.muted, fontSize: 13 }}>
        Generating report card…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ background: '#fff', borderRadius: 8, padding: 40, border: `1px solid ${C.lineFaint}`, textAlign: 'center', color: C.red, fontSize: 13 }}>
        {error || 'No report card data available.'}
      </div>
    )
  }

  const { student, school, scholastic, summary, attitude, overallRemark } = data
  const isSA2 = term === 'SA2'

  return (
    <div>
      {/* Settings / Controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: '#fff', padding: 12, borderRadius: 8, border: `1px solid ${C.lineFaint}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Select Report Card Type:</span>
          <select 
            value={term} 
            onChange={e => setTerm(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 4, fontSize: 12, border: `1.5px solid ${C.lineFaint}`, outline: 'none' }}
          >
            <option value="SA1">SA1 Report (FA1 + FA2 + SA1)</option>
            <option value="SA2">SA2 Report (FA3 + FA4 + SA2)</option>
          </select>
        </div>
        <button 
          onClick={handlePrint}
          style={{ padding: '8px 16px', background: C.blue, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* A4 Printable container */}
      <div className="print-container" style={{
        background: '#fff',
        boxSizing: 'border-box',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20mm 15mm',
        border: `1px solid ${C.lineFaint}`,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        fontFamily: '"Outfit", "Inter", sans-serif',
        color: '#1E293B',
      }}>
        {/* School Header */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px double #2563EB', paddingBottom: 16, marginBottom: 20 }}>
          <img 
            src={school.logo || '/logo.jpeg'} 
            alt="School Logo" 
            style={{ width: 80, height: 80, objectFit: 'contain', marginRight: 20 }}
            onError={e => { e.target.src = 'https://placehold.co/80x80?text=LOGO' }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 24, fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {school.name}
            </h2>
            <p style={{ margin: '0 0 4px 0', fontSize: 12, color: C.muted }}>
              {school.address}
            </p>
            <span style={{ display: 'inline-block', background: '#2563EB15', color: '#1E3A8A', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
              PROGRESS REPORT CARD • SESSION {student.academicYear || '2025-26'}
            </span>
          </div>
        </div>

        {/* Student Information */}
        <div style={{ background: '#F8FAFC', borderRadius: 6, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20, border: `1px solid ${C.lineFaint}`, fontSize: 12 }}>
          <div><strong>Student Name:</strong> {student.name}</div>
          <div><strong>Class & Section:</strong> {student.className}</div>
          <div><strong>Father/Guardian Name:</strong> {student.fatherName}</div>
          <div><strong>Roll Number:</strong> {student.rollNo}</div>
          <div><strong>Academic Session:</strong> {student.academicYear || '—'}</div>
          <div><strong>Report Term:</strong> {term} (Assessment)</div>
        </div>

        {/* Scholastic Area Table */}
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase' }}>Scholastic Performance</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 20, textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', color: '#1E293B', fontWeight: 700 }}>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'left', width: '22%' }}>Subject</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%' }}>{isSA2 ? 'FA3 (20)' : 'FA1 (20)'}</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%' }}>{isSA2 ? 'FA4 (20)' : 'FA2 (20)'}</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%' }}>{term} Written (50)</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%' }}>{term} Oral (10)</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%' }}>{term} Total (60)</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '13%', background: '#E2E8F0', fontWeight: 800 }}>Grand Total (100)</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', width: '8%' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {scholastic.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'left', fontWeight: 600 }}>{item.subject}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{item.fa1}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{item.fa2}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{item.saWritten}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{item.saOral}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{item.sa}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px', background: '#F1F5F9', fontWeight: 700 }}>{item.total}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px', fontWeight: 700, color: '#2563EB' }}>{item.grade}</td>
              </tr>
            ))}
            {/* Summary Row */}
            <tr style={{ background: '#E2E8F0', fontWeight: 800 }}>
              <td style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'left' }}>Total / Summary</td>
              <td colSpan={5} style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'right' }}>
                Percentage: <strong>{summary.overallPercentage}%</strong> &nbsp;|&nbsp; Class Rank: <strong>{summary.rank}</strong>
              </td>
              <td style={{ border: '1px solid #CBD5E1', padding: '8px' }}>{summary.totalObtained} / {summary.maxPossible}</td>
              <td style={{ border: '1px solid #CBD5E1', padding: '8px', color: '#1E3A8A' }}>{summary.overallGrade}</td>
            </tr>
          </tbody>
        </table>

        {/* Co-Scholastic Area */}
        <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase' }}>Attitude & Values (Co-Scholastic)</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#F1F5F9', color: '#1E293B', fontWeight: 700 }}>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'left', width: '35%' }}>Activity / Parameter</th>
              <th style={{ border: '1px solid #CBD5E1', padding: '8px', textAlign: 'left' }}>Descriptive Remarks</th>
            </tr>
          </thead>
          <tbody>
            {attitude.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px', fontWeight: 600 }}>{item.activity}</td>
                <td style={{ border: '1px solid #CBD5E1', padding: '8px', color: '#475569' }}>{item.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Remarks / Promotion */}
        <div style={{ border: '1.5px solid #CBD5E1', borderRadius: 6, padding: 12, marginBottom: 40, fontSize: 12 }}>
          <strong style={{ color: '#1E3A8A' }}>Class Teacher's Remark:</strong>
          <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', color: '#334155' }}>
            {overallRemark}
          </p>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 12, fontWeight: 600 }}>
          <div style={{ width: '180px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94A3B8', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A' }}>{student.classTeacherName}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Class Teacher</div>
          </div>
          <div style={{ width: '180px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94A3B8', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A' }}>{student.principalName}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Principal</div>
          </div>
          <div style={{ width: '180px', textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94A3B8', height: 40, marginBottom: 8 }}></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A' }}>{student.fatherName}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Parent / Guardian</div>
          </div>
        </div>
      </div>

      {/* Embedded print styling */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Hide sidebar and main wrapper paddings */
          main {
            padding: 0 !important;
            overflow: visible !important;
          }
          div[style*="padding: 24px"] {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
