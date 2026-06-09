const { Op } = require('sequelize')
const { School, User, Student, Teacher, Class, Attendance, Fee, Chapter, Assessment, Mark, BehaviourLog, Notification } = require('../models')

exports.getAllSchools = async (req, res, next) => {
  try {
    const { status, plan, page = 1, limit = 20, search } = req.query
    const where = {}
    if (status) where.status = status
    if (plan) where.plan = plan
    if (search) where.name = { [Op.like]: `%${search}%` }

    const offset = (page - 1) * limit
    const { rows: schools, count: total } = await School.findAndCountAll({
      where, offset, limit: Number(limit),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'principal', attributes: ['id','name','email'], required: false }],
    })

    const schoolIds = schools.map(s => s.id)
    const [studentCounts, teacherCounts] = await Promise.all([
      Student.findAll({ where: { schoolId: schoolIds, isActive: true }, attributes: ['schoolId', [require('sequelize').fn('COUNT','*'), 'count']], group: ['schoolId'], raw: true }),
      Teacher.findAll({ where: { schoolId: schoolIds, isActive: true }, attributes: ['schoolId', [require('sequelize').fn('COUNT','*'), 'count']], group: ['schoolId'], raw: true }),
    ])

    const scMap = Object.fromEntries(studentCounts.map(x => [x.schoolId, Number(x.count)]))
    const tcMap = Object.fromEntries(teacherCounts.map(x => [x.schoolId, Number(x.count)]))

    const result = schools.map(s => ({
      ...s.toJSON(),
      studentCount: scMap[s.id] || 0,
      teacherCount: tcMap[s.id] || 0,
    }))

    res.json({ success: true, data: result, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

exports.getSchool = async (req, res, next) => {
  try {
    const school = await School.findByPk(req.params.id, {
      include: [{ model: User, as: 'principal', attributes: ['id','name','email','phone'], required: false }],
    })
    if (!school) return res.status(404).json({ success: false, message: 'School not found' })
    res.json({ success: true, data: school })
  } catch (err) {
    next(err)
  }
}

exports.createSchool = async (req, res, next) => {
  try {
    const school = await School.create(req.body)
    const { logActivity } = require('../services/activityService')
    await logActivity(req, 'created', `${school.name} branch`, { schoolId: school.id })
    res.status(201).json({ success: true, data: school })
  } catch (err) {
    next(err)
  }
}

exports.updateSchool = async (req, res, next) => {
  try {
    const school = await School.findByPk(req.params.id)
    if (!school) return res.status(404).json({ success: false, message: 'School not found' })
    await school.update(req.body)
    res.json({ success: true, data: school })
  } catch (err) {
    next(err)
  }
}

exports.deleteSchool = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/db')
    const school = await School.findByPk(req.params.id)
    if (!school) return res.status(404).json({ success: false, message: 'School not found' })

    const sid = school.id
    const { logActivity } = require('../services/activityService')
    await logActivity(req, 'removed', `branch ${school.name}`)

    await sequelize.transaction(async (t) => {
      const opts = { where: { schoolId: sid }, transaction: t }
      const assessmentIds = (await Assessment.findAll({ where: { schoolId: sid }, attributes: ['id'], transaction: t })).map(a => a.id)
      if (assessmentIds.length) await Mark.destroy({ where: { assessmentId: assessmentIds }, transaction: t })
      await Assessment.destroy(opts)
      await Chapter.destroy(opts)
      await BehaviourLog.destroy(opts)
      await Fee.destroy(opts)
      await Student.destroy(opts)
      await Attendance.destroy({ where: { schoolId: sid }, transaction: t })
      await Class.destroy(opts)
      await Teacher.destroy(opts)
      await User.update({ schoolId: null }, { where: { schoolId: sid }, transaction: t })
      await school.destroy({ transaction: t })
    })

    res.json({ success: true, message: 'School deleted' })
  } catch (err) {
    next(err)
  }
}

exports.getSchoolStats = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/db')
    const total = await School.count()
    const byStatus = await School.findAll({ attributes: ['status', [sequelize.fn('COUNT','*'), 'count']], group: ['status'], raw: true })
    const byPlan = await School.findAll({ attributes: ['plan', [sequelize.fn('COUNT','*'), 'count']], group: ['plan'], raw: true })
    res.json({ success: true, data: { total, byStatus, byPlan } })
  } catch (err) {
    next(err)
  }
}
