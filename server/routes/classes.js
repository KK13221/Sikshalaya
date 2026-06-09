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

router.get('/:id/academic-report', async (req, res) => {
  try {
    const { id } = req.params
    const schoolId = req.user.schoolId
    const { AssessmentType, Student, Assessment, Mark } = require('../models')

    const cls = await Class.findByPk(id)
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' })

    const actualNum = parseInt(cls.name.replace(/\D/g, ''), 10) || 0
    const section = cls.section

    const testTypes = await AssessmentType.findAll({
      where: {
        schoolId: { [Op.or]: [null, schoolId] },
        showInReport: true
      }
    })
    const allowedCodes = testTypes.map(t => t.code)

    const students = await Student.findAll({
      where: { classId: id, isActive: true },
      order: [['name', 'ASC']]
    })

    const assessments = await Assessment.findAll({
      where: {
        schoolId,
        classNum: actualNum,
        section,
        status: { [Op.in]: ['completed', 'published'] },
        type: { [Op.in]: allowedCodes }
      },
      include: [{
        model: Mark,
        required: false
      }]
    })

    const studentAverages = {}
    for (const student of students) {
      studentAverages[student.id] = {}
      for (const code of allowedCodes) {
        studentAverages[student.id][code] = { totalPct: 0, count: 0 }
      }
    }

    for (const a of assessments) {
      const type = a.type
      const maxMarks = a.maxMarks || 100
      for (const m of a.Marks) {
        if (m.isAbsent || m.marksObtained == null) continue
        const pct = (m.marksObtained / maxMarks) * 100
        if (!Number.isNaN(pct) && studentAverages[m.studentId] && studentAverages[m.studentId][type]) {
          studentAverages[m.studentId][type].totalPct += pct
          studentAverages[m.studentId][type].count += 1
        }
      }
    }

    const studentsData = students.map(s => {
      const averages = {}
      for (const code of allowedCodes) {
        const entry = studentAverages[s.id][code]
        averages[code] = entry.count > 0 ? Math.round(entry.totalPct / entry.count) : null
      }
      return {
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        admissionNo: s.admissionNo,
        academicsPct: s.academicsPct,
        averages
      }
    })

    res.json({
      success: true,
      data: {
        testTypes,
        students: studentsData
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server Error' })
  }
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
