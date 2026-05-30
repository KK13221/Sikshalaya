const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { Class, Student, Teacher } = require('../models')
const { Op } = require('sequelize')

router.use(protect)

router.get('/', async (req, res) => {
  let where = {}

  if (req.user.role === 'superadmin') {
    if (req.query.schoolId) where.schoolId = req.query.schoolId
  } else if (req.user.role === 'teacher') {
    // Teacher sees only their assigned class(es)
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } })
    if (!teacher) return res.json({ success: true, data: [] })
    where = { classTeacherId: teacher.id, schoolId: req.user.schoolId }
  } else {
    // principal
    where.schoolId = req.user.schoolId
  }

  const classes = await Class.findAll({
    where,
    order: [['name', 'ASC'], ['section', 'ASC']],
    include: [{
      model: Teacher,
      as: 'classTeacher',
      attributes: ['id', 'name', 'email', 'phone'],
      required: false,
    }],
  })
  res.json({ success: true, data: classes })
})

router.post('/', authorize('superadmin','principal'), async (req, res) => {
  const schoolId = req.user.role === 'superadmin' ? req.body.schoolId : req.user.schoolId
  const cls = await Class.create({ ...req.body, schoolId })
  res.status(201).json({ success: true, data: cls })
})

router.put('/:id', authorize('superadmin','principal'), async (req, res) => {
  const cls = await Class.findByPk(req.params.id)
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' })
  const { schoolId: _ignored, ...rest } = req.body
  await cls.update(rest)
  res.json({ success: true, data: cls })
})

router.delete('/:id', authorize('superadmin','principal'), async (req, res) => {
  const cls = await Class.findByPk(req.params.id)
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' })
  const students = await Student.count({ where: { classId: cls.id } })
  if (students > 0) return res.status(400).json({ success: false, message: `Cannot delete — ${students} students in this class` })
  await cls.destroy()
  res.json({ success: true, message: 'Class deleted' })
})

module.exports = router
