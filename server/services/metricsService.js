const { Op } = require('sequelize')
const { Student, Mark, Assessment, Attendance, BehaviourLog, Notification, User, SchoolSettings } = require('../models')

const W = { chapter_test: 0.20, class_test: 0.20, unit_test: 0.30, term_exam: 0.30 }

async function computeAcademicsPct(studentId, schoolId) {
  const { AssessmentType } = require('../models')
  const activeTypes = await AssessmentType.findAll({
    where: {
      schoolId: { [Op.or]: [null, schoolId] },
      showInReport: true
    }
  })
  const allowedCodes = activeTypes.map(t => t.code)

  const assessments = await Assessment.findAll({
    where: {
      schoolId,
      status: { [Op.in]: ['completed', 'published'] },
      type: { [Op.in]: allowedCodes }
    },
    include: [{ model: Mark, where: { studentId }, required: true }],
  })

  const byType = {}
  for (const a of assessments) {
    const mark = a.Marks[0]
    if (mark.isAbsent || mark.marksObtained == null) continue
    const max = a.maxMarks || 100
    const pct = (mark.marksObtained / max) * 100
    if (!Number.isNaN(pct)) {
      if (!byType[a.type]) byType[a.type] = []
      byType[a.type].push(pct)
    }
  }

  let total = 0, wsum = 0
  for (const [type, pcts] of Object.entries(byType)) {
    const avg = pcts.reduce((s, p) => s + p, 0) / pcts.length
    const weight = W[type] || 0.20 // fallback for custom test types
    total += avg * weight
    wsum += weight
  }

  const finalVal = wsum === 0 ? null : total / wsum
  return Number.isNaN(finalVal) ? null : finalVal
}

async function computePunctualityPct(studentId) {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sessions = await Attendance.findAll({
    where: {
      date: { [Op.gte]: cutoff.toISOString().slice(0, 10) },
    },
  })

  const relevant = sessions.filter(s => {
    const r = s.records || []
    return r.some(rec => String(rec.studentId) === String(studentId))
  })

  if (relevant.length === 0) return null

  let present = 0, late = 0
  for (const s of relevant) {
    const rec = (s.records || []).find(r => String(r.studentId) === String(studentId))
    if (!rec) continue
    if (rec.status === 'present') present++
    else if (rec.status === 'late') late++
  }

  return ((present + 0.5 * late) / relevant.length) * 100
}

async function computeBehaviourScore(studentId) {
  const cutoff = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  const logs = await BehaviourLog.findAll({
    where: { studentId, date: { [Op.gte]: cutoff.toISOString().slice(0, 10) } },
  })

  const delta = logs.reduce((s, l) => s + l.weight, 0)
  return Math.max(0, Math.min(100, 85 + delta))
}

async function recomputeStudentMetrics(studentId, schoolId) {
  const student = await Student.findByPk(studentId)
  if (!student) return

  const [academicsPct, punctualityPct, behaviourScore] = await Promise.all([
    computeAcademicsPct(studentId, schoolId || student.schoolId),
    computePunctualityPct(studentId),
    computeBehaviourScore(studentId),
  ])

  let threshold = 75
  const settings = await SchoolSettings.findOne({ where: { schoolId: schoolId || student.schoolId } })
  if (settings && settings.yellowThreshold != null) {
    threshold = settings.yellowThreshold
  }

  const dims = []
  if (academicsPct != null && academicsPct < threshold) dims.push('academics')
  if (punctualityPct != null && punctualityPct < threshold) dims.push('punctuality')
  if (behaviourScore != null && behaviourScore < threshold) dims.push('behaviour')

  const wasUnderperformer = student.isUnderperformer
  const isUnderperformer = dims.length > 0

  await student.update({
    academicsPct,
    punctualityPct,
    behaviourScore,
    isUnderperformer,
    underperformerDims: dims,
    metricsComputedAt: new Date(),
  })

  // Fire notifications on flag change
  if (!wasUnderperformer && isUnderperformer) {
    await createUnderperformerNotification(student, dims, 'urgent')
  } else if (wasUnderperformer && !isUnderperformer) {
    await createUnderperformerNotification(student, dims, 'info')
  }
}

async function createUnderperformerNotification(student, dims, priority) {
  const teachers = await User.findAll({
    where: { schoolId: student.schoolId, role: { [Op.in]: ['principal', 'teacher'] }, isActive: true },
  })

  const title = priority === 'urgent'
    ? `${student.name} flagged — below 75% in ${dims.join(', ')}`
    : `${student.name} recovered — no longer underperforming`

  await Promise.all(teachers.map(u =>
    Notification.create({
      userId: u.id, schoolId: student.schoolId,
      priority, category: 'underperformer',
      title, body: `Student ID: ${student.admissionNo}`,
    })
  ))
}

module.exports = { recomputeStudentMetrics }
