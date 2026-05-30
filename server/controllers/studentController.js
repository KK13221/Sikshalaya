const { Op } = require('sequelize')
const { Student, Class, Teacher } = require('../models')

const schoolWhere = (req) =>
  req.user.role === 'superadmin' ? {} : { schoolId: req.user.schoolId }

// Returns students bucketed into green / yellow / red based on combined performance
exports.getOverview = async (req, res) => {
  let where = { isActive: true }

  if (req.user.role === 'superadmin') {
    if (req.query.schoolId) where.schoolId = req.query.schoolId
  } else if (req.user.role === 'teacher') {
    // Teacher sees only their assigned class
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } })
    if (!teacher) return res.json({ success: true, data: { green: [], yellow: [], red: [] } })
    const assignedClass = await Class.findOne({ where: { classTeacherId: teacher.id } })
    if (!assignedClass) return res.json({ success: true, data: { green: [], yellow: [], red: [] } })
    where.classId = assignedClass.id
    where.schoolId = req.user.schoolId
  } else {
    // Principal sees entire branch
    where.schoolId = req.user.schoolId
  }

  const students = await Student.findAll({
    where,
    attributes: ['id', 'name', 'rollNo', 'admissionNo', 'academicsPct', 'punctualityPct', 'behaviourScore', 'classId'],
    include: [{ model: Class, attributes: ['name', 'section'], required: false }],
    order: [['name', 'ASC']],
  })

  const green = [], yellow = [], red = []

  for (const s of students) {
    const acad = s.academicsPct ?? 0
    const punct = s.punctualityPct ?? 0
    const behav = Math.min(100, (s.behaviourScore ?? 0) * 20) // 0-5 score → 0-100
    const combined = (acad * 0.5) + (punct * 0.25) + (behav * 0.25)

    const entry = {
      id: s.id,
      name: s.name,
      rollNo: s.rollNo,
      admissionNo: s.admissionNo,
      academicsPct: acad,
      punctualityPct: punct,
      behaviourScore: s.behaviourScore,
      combinedScore: Math.round(combined),
      class: s.Class ? `${s.Class.name} ${s.Class.section}` : null,
    }

    if (combined >= 75) green.push(entry)
    else if (combined >= 50) yellow.push(entry)
    else red.push(entry)
  }

  res.json({ success: true, data: { green, yellow, red } })
}

exports.getStudents = async (req, res) => {
  const { page = 1, limit = 20, search, classId } = req.query
  const where = { ...schoolWhere(req), isActive: true }
  if (classId) where.classId = classId
  if (search) where.name = { [Op.like]: `%${search}%` }

  const offset = (page - 1) * limit
  const { rows, count } = await Student.findAndCountAll({
    where, offset, limit: Number(limit),
    order: [['name', 'ASC']],
    include: [{ model: Class, attributes: ['name','section'], required: false }],
  })
  res.json({ success: true, data: rows, total: count })
}

exports.getStudent = async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [{ model: Class, attributes: ['name','section'], required: false }],
  })
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
  res.json({ success: true, data: student })
}

exports.createStudent = async (req, res) => {
  // Always enforce schoolId from the authenticated user — never trust client-supplied value
  const schoolId = req.user.role === 'superadmin' ? (req.body.schoolId || req.user.schoolId) : req.user.schoolId
  const { schoolId: _ignored, ...rest } = req.body
  if (rest.classId === '') rest.classId = null
  if (rest.rollNo === '') rest.rollNo = null
  if (rest.dateOfBirth === '') rest.dateOfBirth = null
  const student = await Student.create({ ...rest, schoolId })
  res.status(201).json({ success: true, data: student })
}

exports.updateStudent = async (req, res) => {
  const student = await Student.findByPk(req.params.id)
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
  // Principals cannot move a student to a different school
  const { schoolId: _ignored, ...rest } = req.body
  if (rest.classId === '') rest.classId = null
  if (rest.rollNo === '') rest.rollNo = null
  if (rest.dateOfBirth === '') rest.dateOfBirth = null
  await student.update(rest)
  res.json({ success: true, data: student })
}

exports.deleteStudent = async (req, res) => {
  const student = await Student.findByPk(req.params.id)
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
  await student.update({ isActive: false })
  res.json({ success: true, message: 'Student deactivated' })
}

exports.getUnderperformers = async (req, res) => {
  const { schoolId, classNum, section } = req.query
  const where = {
    ...schoolWhere(req),
    isActive: true,
    isUnderperformer: true,
  }
  if (schoolId && req.user.role === 'superadmin') where.schoolId = schoolId
  if (classNum) where.classNum = classNum
  if (section) where.section = section

  const students = await Student.findAll({
    where,
    order: [['name','ASC']],
    include: [{ model: Class, attributes: ['name','section'], required: false }],
  })
  res.json({ success: true, data: students })
}

exports.acknowledgeUnderperformer = async (req, res) => {
  const student = await Student.findByPk(req.params.id)
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
  await student.update({ acknowledgedAt: new Date() })
  res.json({ success: true })
}

exports.getMetrics = async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    attributes: ['id','name','academicsPct','punctualityPct','behaviourScore','isUnderperformer','underperformerDims','metricsComputedAt'],
  })
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' })
  res.json({ success: true, data: student })
}
