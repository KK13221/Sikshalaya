const { BehaviourLog, BehaviourMetric, Student } = require('../models')
const { recomputeStudentMetrics } = require('../services/metricsService')
const { Op } = require('sequelize')

exports.create = async (req, res) => {
  const { studentIds, metricId, preset, note, date } = req.body
  if (!studentIds?.length || (!metricId && !preset)) {
    return res.status(400).json({ success: false, message: 'studentIds and metricId (or preset) required' })
  }

  // Resolve metric — prefer metricId, fall back to preset name match
  let metric = null
  if (metricId) {
    metric = await BehaviourMetric.findByPk(metricId)
  } else if (preset) {
    metric = await BehaviourMetric.findOne({
      where: {
        name: preset,
        isActive: true,
        [Op.or]: [{ schoolId: req.user.schoolId }, { schoolId: null }],
      },
    })
  }

  if (!metric) {
    return res.status(400).json({ success: false, message: 'Unknown metric. Please use a valid metric from the list.' })
  }

  const logDate = date || new Date().toISOString().slice(0, 10)
  const records = await Promise.all(
    studentIds.map(sid =>
      BehaviourLog.create({
        studentId: sid,
        schoolId: req.user.schoolId,
        date: logDate,
        loggedBy: req.user.id,
        behaviourMetricId: metric.id,
        preset: metric.name,
        note,
        weight: metric.weight,
        kind: metric.kind,
      })
    )
  )

  studentIds.forEach(sid =>
    recomputeStudentMetrics(sid, req.user.schoolId).catch(console.error)
  )

  try {
    const { logActivity } = require('../services/activityService')
    const studentCount = studentIds.length
    await logActivity(req, 'logged', `behavior metric for ${studentCount} student${studentCount > 1 ? 's' : ''}`, { schoolId: req.user.schoolId })
  } catch (err) {
    console.error('Failed to log behavior activity:', err)
  }

  res.status(201).json({ success: true, data: records })
}

exports.list = async (req, res) => {
  if (req.user.role === 'teacher') {
    return res.status(403).json({ success: false, message: 'Forbidden' })
  }
  const { studentId, from, schoolId } = req.query
  const where = { schoolId: schoolId || req.user.schoolId }
  if (studentId) where.studentId = studentId
  if (from) where.date = { [Op.gte]: from }

  const logs = await BehaviourLog.findAll({
    where,
    order: [['date', 'DESC']],
    include: [{ model: Student, attributes: ['id', 'name', 'admissionNo'] }],
  })
  res.json({ success: true, data: logs })
}

// Legacy presets endpoint — now returns from BehaviourMetric table
exports.presets = async (req, res) => {
  const where = {
    isActive: true,
    [Op.or]: [{ schoolId: req.user.schoolId }, { schoolId: null }],
  }
  const metrics = await BehaviourMetric.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] })

  if (metrics.length === 0) {
    await BehaviourMetric.bulkCreate(
      BehaviourMetric.DEFAULTS.map(m => ({ ...m, schoolId: req.user.schoolId, createdBy: req.user.id }))
    )
    const seeded = await BehaviourMetric.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] })
    return res.json({ success: true, data: seeded })
  }

  res.json({ success: true, data: metrics })
}
