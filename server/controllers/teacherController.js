const crypto = require('crypto')
const { Op } = require('sequelize')
const { sequelize } = require('../config/db')
const { Teacher, User, Class, Student, Attendance, Assessment, Chapter, Mark, Notification, SchoolSettings } = require('../models')
const { recomputeStudentMetrics } = require('../services/metricsService')
const { sendWelcomeEmail } = require('../services/emailService')

const schoolWhere = (req) =>
  req.user.role === 'superadmin' ? {} : { schoolId: req.user.schoolId }

exports.getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const where = { ...schoolWhere(req), isActive: true }
    if (search) where.name = { [Op.like]: `%${search}%` }

    const offset = (page - 1) * limit
    const { rows, count } = await Teacher.findAndCountAll({ where, offset, limit: Number(limit), order: [['name','ASC']] })
    res.json({ success: true, data: rows, total: count, page: Number(page), pages: Math.ceil(count / limit) })
  } catch (err) {
    next(err)
  }
}

exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id)
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' })
    res.json({ success: true, data: teacher })
  } catch (err) {
    next(err)
  }
}

exports.createTeacher = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const { name, email, phone, employeeId, schoolId, subjects, qualification, experience, password } = req.body

    if (!email) return res.status(400).json({ success: false, message: 'Teacher email is required' })

    // Check if a user login already exists for this email
    const existing = await User.findOne({ where: { email: email.toLowerCase() }, transaction: t })
    if (existing) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'A user with this email already exists' })
    }

    // Use manually provided password or auto-generate a secure temporary one
    const actualPassword = password && password.trim() ? password : (crypto.randomBytes(6).toString('hex') + 'T1!')

    // Create login account
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: actualPassword,
      role: 'teacher',
      schoolId,
      phone,
      isActive: true,
    }, { transaction: t })

    // Create teacher profile linked to user
    const teacher = await Teacher.create({
      name,
      email: email.toLowerCase(),
      phone,
      employeeId,
      schoolId,
      subjects,
      qualification,
      experience,
      userId: user.id,
      isActive: true,
    }, { transaction: t })

    await t.commit()

    const { logActivity } = require('../services/activityService')
    await logActivity(req, 'invited', `teacher ${name}`, { schoolId })

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail({ name, email: email.toLowerCase(), tempPassword: actualPassword })
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Password for ${email}: ${actualPassword}`)
      }
    }

    res.status(201).json({
      success: true,
      data: { teacher, userId: user.id },
      message: `Teacher account created. Login credentials ${password ? 'configured' : 'sent to ' + email}`,
    })
  } catch (err) {
    await t.rollback()
    next(err)
  }
}

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id)
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' })
    await teacher.update(req.body)

    let user = teacher.userId ? await User.findByPk(teacher.userId) : null
    
    if (user) {
      let userUpdated = false
      if (req.body.email && req.body.email !== user.email) {
        user.email = req.body.email.toLowerCase()
        userUpdated = true
      }
      if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password.trim()
        userUpdated = true
      }
      if (userUpdated) {
        await user.save()
      }
    } else if (req.body.password && req.body.password.trim() !== '') {
      // The teacher was created without a User account, so create one now
      user = await User.create({
        name: teacher.name,
        email: (req.body.email || teacher.email).toLowerCase(),
        password: req.body.password.trim(),
        role: 'teacher',
        schoolId: teacher.schoolId,
        phone: teacher.phone,
        isActive: true,
      })
      await teacher.update({ userId: user.id })
    }

    res.json({ success: true, data: teacher })
  } catch (err) {
    next(err)
  }
}

exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id)
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' })
    await teacher.update({ isActive: false })
    const { logActivity } = require('../services/activityService')
    await logActivity(req, 'removed', `teacher ${teacher.name}`, { schoolId: teacher.schoolId })
    res.json({ success: true, message: 'Teacher deactivated' })
  } catch (err) {
    next(err)
  }
}

/* ── Teacher-scoped mobile app endpoints (/teachers/me/…) ──────────── */

exports.myClasses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } })
    let classes = []

    if (teacher) {
      // Primary: classes where this teacher is the class teacher
      classes = await Class.findAll({
        where: { schoolId: req.user.schoolId, classTeacherId: teacher.id },
        include: [{ model: Teacher, as: 'classTeacher', attributes: ['id', 'name'], required: false }],
        order: [['name', 'ASC'], ['section', 'ASC']],
      })

      // If teacher is not assigned as class teacher to any class, fall back to all school classes
      // (covers subject-teacher scenario where explicit assignment is not yet set up)
      if (classes.length === 0) {
        classes = await Class.findAll({
          where: { schoolId: req.user.schoolId },
          include: [{ model: Teacher, as: 'classTeacher', attributes: ['id', 'name'], required: false }],
          order: [['name', 'ASC'], ['section', 'ASC']],
        })
      }
    } else {
      classes = await Class.findAll({
        where: { schoolId: req.user.schoolId },
        include: [{ model: Teacher, as: 'classTeacher', attributes: ['id', 'name'], required: false }],
        order: [['name', 'ASC'], ['section', 'ASC']],
      })
    }

    res.json({ success: true, data: classes })
  } catch (err) { next(err) }
}

exports.pendingTasks = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId
    const today = new Date().toISOString().slice(0, 10)
    const tasks = []

    const teacher = await Teacher.findOne({ where: { userId: req.user.id } })

    // Get teacher's assigned classes
    let teacherClasses = []
    if (teacher) {
      teacherClasses = await Class.findAll({ where: { classTeacherId: teacher.id, schoolId } })
      if (teacherClasses.length === 0) {
        teacherClasses = await Class.findAll({ where: { schoolId } })
      }
    }
    const classIds = teacherClasses.map(c => c.id)

    // Task 1: Classes with no attendance marked today
    if (classIds.length > 0) {
      const attendedToday = (await Attendance.findAll({
        where: { schoolId, date: today, classId: { [Op.in]: classIds } },
        attributes: ['classId'],
      })).map(a => a.classId)

      const missing = teacherClasses.filter(c => !attendedToday.includes(c.id))
      for (const cls of missing) {
        tasks.push({
          id: `att-${cls.id}`,
          type: 'attendance',
          priority: 'urgent',
          title: `Attendance not taken for ${cls.name} ${cls.section}`,
          actionRoute: `/attendance/${cls.id}`,
        })
      }
    }

    // Task 2: Assessments in draft/active state needing marks entry
    const pendingAssessments = await Assessment.findAll({
      where: { schoolId, status: { [Op.in]: ['draft', 'active', 'scheduled'] } },
      order: [['createdAt', 'DESC']],
      limit: 5,
    })
    for (const a of pendingAssessments) {
      tasks.push({
        id: `marks-${a.id}`,
        type: 'marks',
        priority: 'reminder',
        title: `Marks pending: ${a.title}`,
        actionRoute: `/marks/entry/${a.id}`,
      })
    }

    // Task 3: Unacknowledged underperformers in teacher's classes
    if (classIds.length > 0) {
      const underCount = await Student.count({
        where: {
          schoolId,
          classId: { [Op.in]: classIds },
          isUnderperformer: true,
          acknowledgedAt: null,
          isActive: true,
        },
      })
      if (underCount > 0) {
        tasks.push({
          id: 'underperformers',
          type: 'underperformer',
          priority: 'urgent',
          title: `${underCount} underperformer alert${underCount > 1 ? 's' : ''} to review`,
          actionRoute: '/overview',
        })
      }
    }

    res.json({ success: true, data: tasks })
  } catch (err) { next(err) }
}

exports.myStudents = async (req, res, next) => {
  try {
    const { classId } = req.query
    const where = { schoolId: req.user.schoolId, isActive: true }
    if (classId) where.classId = classId
    const students = await Student.findAll({
      where,
      include: [{ model: Class, attributes: ['id', 'name', 'section'] }],
      order: [['name', 'ASC']],
    })
    res.json({ success: true, data: students })
  } catch (err) { next(err) }
}

exports.myAttendance = async (req, res, next) => {
  try {
    const { classId, date, from, to } = req.query
    const where = { schoolId: req.user.schoolId }
    if (classId) where.classId = classId
    if (date) where.date = date
    else if (from && to) where.date = { [Op.between]: [from, to] }
    const rows = await Attendance.findAll({ where, order: [['date', 'DESC']] })
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
}

// Normalize abbreviated status codes from mobile app to full words
const normalizeStatus = (s) => {
  if (!s) return 'present'
  const map = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
  return map[s] || s
}

exports.markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body
    if (!classId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'classId, date, and records[] required' })
    }
    // Normalize status values so both mobile (P/A/L) and admin (present/absent/late) formats are stored consistently
    const normalized = records.map(r => ({
      studentId: String(r.studentId),
      status: normalizeStatus(r.status),
    }))
    const [row] = await Attendance.upsert({
      schoolId: req.user.schoolId, classId, date, records: normalized,
    }, { returning: true })
    res.json({ success: true, data: row })
  } catch (err) { next(err) }
}

exports.myAssessments = async (req, res, next) => {
  try {
    const { classNum, subjectId, type, section } = req.query
    const where = { schoolId: req.user.schoolId }
    if (classNum) where.classNum = classNum
    if (subjectId) where.subjectId = subjectId
    if (type) where.type = type
    if (section) where.section = section
    const assessments = await Assessment.findAll({
      where,
      include: [{ model: Chapter, attributes: ['id', 'name', 'chapterNumber'], required: false }],
      order: [['createdAt', 'DESC']],
    })
    res.json({ success: true, data: assessments })
  } catch (err) { next(err) }
}

exports.myChapters = async (req, res, next) => {
  try {
    const { classNum, subjectId } = req.query
    const where = { schoolId: req.user.schoolId }
    if (classNum) where.classNum = classNum
    if (subjectId) where.subjectId = subjectId
    const chapters = await Chapter.findAll({ where, order: [['classNum', 'ASC'], ['chapterNumber', 'ASC']] })
    res.json({ success: true, data: chapters })
  } catch (err) { next(err) }
}

exports.enterMark = async (req, res, next) => {
  try {
    const { assessmentId, studentId } = req.params
    const assessment = await Assessment.findByPk(assessmentId)
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' })
    if (assessment.schoolId !== req.user.schoolId) return res.status(403).json({ success: false, message: 'Forbidden' })
    if (assessment.status === 'published') return res.status(403).json({ success: false, message: 'Cannot edit published assessment marks' })

    const { marksObtained, writtenMarks, oralMarks, isAbsent, tags, note } = req.body

    let finalMarks = marksObtained
    let finalWritten = null
    let finalOral = null

    if (!isAbsent) {
      if (assessment.type.startsWith('SA')) {
        const w = parseFloat(writtenMarks) || 0
        const o = parseFloat(oralMarks) || 0
        if (w < 0 || w > 50) {
          return res.status(400).json({ success: false, message: 'Written marks must be between 0 and 50' })
        }
        if (o < 0 || o > 10) {
          return res.status(400).json({ success: false, message: 'Oral marks must be between 0 and 10' })
        }
        finalWritten = w
        finalOral = o
        finalMarks = w + o
      } else if (assessment.type.startsWith('FA')) {
        const m = parseFloat(marksObtained) || 0
        if (m < 0 || m > 20) {
          return res.status(400).json({ success: false, message: 'Formative marks must be between 0 and 20' })
        }
        finalMarks = m
      } else {
        const m = parseFloat(marksObtained) || 0
        if (m < 0 || m > assessment.maxMarks) {
          return res.status(400).json({ success: false, message: `Marks must be 0–${assessment.maxMarks}` })
        }
        finalMarks = m
      }
    }

    const [mark] = await Mark.upsert({
      assessmentId: Number(assessmentId), studentId: Number(studentId),
      marksObtained: isAbsent ? null : finalMarks,
      writtenMarks: isAbsent ? null : finalWritten,
      oralMarks: isAbsent ? null : finalOral,
      isAbsent: !!isAbsent, tags: tags || [], note: note || null,
      enteredBy: req.user.id,
    }, { returning: true })

    recomputeStudentMetrics(Number(studentId), assessment.schoolId).catch(console.error)
    res.json({ success: true, data: mark })
  } catch (err) { next(err) }
}

exports.myNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    })
    res.json({ success: true, data: notifications })
  } catch (err) { next(err) }
}
