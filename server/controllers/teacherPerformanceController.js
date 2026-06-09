const { TeacherPerformanceLog, User, School, Teacher, SchoolSettings } = require('../models')
const { Op } = require('sequelize')

const schoolWhere = (req) => {
  if (req.user.role === 'superadmin') return {}
  return { schoolId: req.user.schoolId }
}

exports.list = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    const where = { ...schoolWhere(req) }
    const logs = await TeacherPerformanceLog.findAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'logger', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC'], ['id', 'DESC']]
    })
    res.json({ success: true, data: logs })
  } catch (err) { next(err) }
}

exports.get = async (req, res, next) => {
  try {
    const log = await TeacherPerformanceLog.findByPk(req.params.id, {
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'logger', attributes: ['id', 'name'] }
      ]
    })
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' })
    
    if (req.user.role !== 'superadmin' && log.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    if (req.user.role === 'teacher' && log.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    res.json({ success: true, data: log })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    const { teacherId, score, remark, category, academicYear } = req.body
    
    const teacherUser = await User.findByPk(teacherId)
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Invalid teacher selected' })
    }
    if (req.user.role !== 'superadmin' && teacherUser.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const valScore = parseFloat(score)
    if (isNaN(valScore) || valScore < 0 || valScore > 10) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 10' })
    }

    let year = academicYear
    if (!year) {
      const settings = await SchoolSettings.findOne({ where: { schoolId: teacherUser.schoolId } })
      year = settings ? settings.academicYear : '2025-26'
    }

    const log = await TeacherPerformanceLog.create({
      teacherId: Number(teacherId),
      schoolId: teacherUser.schoolId,
      academicYear: year,
      score: valScore,
      remark,
      loggedBy: req.user.id,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      category
    })

    res.status(201).json({ success: true, data: log })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    const log = await TeacherPerformanceLog.findByPk(req.params.id)
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' })

    if (req.user.role !== 'superadmin' && log.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const { score, remark, category, academicYear, date } = req.body
    const updates = {}
    if (score != null) {
      const valScore = parseFloat(score)
      if (isNaN(valScore) || valScore < 0 || valScore > 10) {
        return res.status(400).json({ success: false, message: 'Score must be between 0 and 10' })
      }
      updates.score = valScore
    }
    if (remark !== undefined) updates.remark = remark
    if (category !== undefined) updates.category = category
    if (academicYear !== undefined) updates.academicYear = academicYear
    if (date !== undefined) updates.date = date

    await log.update(updates)
    res.json({ success: true, data: log })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    const log = await TeacherPerformanceLog.findByPk(req.params.id)
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' })

    if (req.user.role !== 'superadmin' && log.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    await log.destroy()
    res.json({ success: true, message: 'Log deleted successfully' })
  } catch (err) { next(err) }
}

exports.getTeacherSummary = async (req, res, next) => {
  try {
    const teacherId = req.user.id
    const logs = await TeacherPerformanceLog.findAll({
      where: { teacherId },
      include: [{ model: User, as: 'logger', attributes: ['name'] }],
      order: [['date', 'DESC']]
    })
    
    let avg = 0
    if (logs.length > 0) {
      const sum = logs.reduce((acc, curr) => acc + curr.score, 0)
      avg = Math.round((sum / logs.length) * 10) / 10
    }

    res.json({
      success: true,
      data: {
        averageScore: avg,
        logs: logs
      }
    })
  } catch (err) { next(err) }
}
