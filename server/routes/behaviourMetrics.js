const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { BehaviourMetric } = require('../models')
const { Op } = require('sequelize')

router.use(protect)

// GET /behaviour-metrics — all roles can read (to fill data in teacher app)
router.get('/', async (req, res) => {
  const where = { isActive: true }

  if (req.user.role === 'superadmin') {
    // superadmin sees global metrics (schoolId null) + any schoolId filter
    if (req.query.schoolId) where.schoolId = req.query.schoolId
  } else {
    // principal and teacher see their school's metrics + global ones
    where[Op.or] = [{ schoolId: req.user.schoolId }, { schoolId: null }]
  }

  if (req.query.target) {
    where.target = req.query.target
  }

  const metrics = await BehaviourMetric.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] })

  // If no metrics exist yet, seed defaults
  if (metrics.length === 0) {
    const schoolId = req.user.role === 'superadmin' ? null : req.user.schoolId
    await BehaviourMetric.bulkCreate(
      BehaviourMetric.DEFAULTS.map(m => ({ ...m, schoolId, createdBy: req.user.id }))
    )
    const seeded = await BehaviourMetric.findAll({ where, order: [['category', 'ASC'], ['name', 'ASC']] })
    return res.json({ success: true, data: seeded })
  }

  res.json({ success: true, data: metrics })
})

// POST /behaviour-metrics — principal and superadmin only
router.post('/', authorize('superadmin', 'principal'), async (req, res) => {
  const { name, kind, weight, category, target } = req.body
  if (!name || !kind || weight === undefined || !category) {
    return res.status(400).json({ success: false, message: 'name, kind, weight, and category are required' })
  }

  const schoolId = req.user.role === 'superadmin' ? (req.body.schoolId ?? null) : req.user.schoolId
  const metric = await BehaviourMetric.create({ name, kind, weight, category, target: target || 'student', schoolId, createdBy: req.user.id })
  res.status(201).json({ success: true, data: metric })
})

// DELETE /behaviour-metrics/:id — principal and superadmin only
router.delete('/:id', authorize('superadmin', 'principal'), async (req, res) => {
  const metric = await BehaviourMetric.findByPk(req.params.id)
  if (!metric) return res.status(404).json({ success: false, message: 'Metric not found' })

  // Principal can only delete their own school's metrics
  if (req.user.role === 'principal' && metric.schoolId !== req.user.schoolId) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  await metric.update({ isActive: false })
  res.json({ success: true, message: 'Metric removed' })
})

module.exports = router
