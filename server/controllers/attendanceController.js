const { Op } = require('sequelize')
const { Attendance } = require('../models')

exports.getAttendance = async (req, res) => {
  const { classId, date, startDate, endDate } = req.query
  const where = {}
  if (req.user.role !== 'superadmin') where.schoolId = req.user.schoolId
  if (classId) where.classId = classId
  if (date) where.date = date
  if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] }

  const records = await Attendance.findAll({ where, order: [['date','DESC']] })
  res.json({ success: true, data: records })
}

const normalizeStatus = (s) => {
  if (!s) return 'present'
  const map = { P: 'present', A: 'absent', L: 'late', p: 'present', a: 'absent', l: 'late' }
  return map[s] || s
}

exports.markAttendance = async (req, res) => {
  const { classId, date, records } = req.body
  const schoolId = req.user.schoolId

  const normalized = (records || []).map(r => ({
    studentId: String(r.studentId),
    status: normalizeStatus(r.status),
  }))

  const [attendance, created] = await Attendance.findOrCreate({
    where: { schoolId, classId, date },
    defaults: { records: normalized },
  })
  if (!created) await attendance.update({ records: normalized })

  try {
    const { Class } = require('../models')
    const cls = await Class.findByPk(classId, { attributes: ['name', 'section'] })
    const classLabel = cls ? `${cls.name}-${cls.section}` : 'class'
    const { logActivity } = require('../services/activityService')
    await logActivity(req, 'modified', `attendance for ${classLabel}`, { schoolId })
  } catch (err) {
    console.error('Failed to log attendance activity:', err)
  }

  res.json({ success: true, data: attendance })
}
