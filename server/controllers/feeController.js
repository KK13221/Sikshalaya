const { Op } = require('sequelize')
const { Fee, Student } = require('../models')

exports.getFees = async (req, res) => {
  const { status, studentId, page = 1, limit = 20 } = req.query
  const where = {}
  if (req.user.role !== 'superadmin') where.schoolId = req.user.schoolId
  if (status) where.status = status
  if (studentId) where.studentId = studentId

  const offset = (page - 1) * limit
  const { rows, count } = await Fee.findAndCountAll({
    where, offset, limit: Number(limit),
    order: [['dueDate','ASC']],
    include: [{ model: Student, attributes: ['id','name','section','rollNo'], required: false }],
  })
  res.json({ success: true, data: rows, total: count })
}

exports.createFee = async (req, res) => {
  const fee = await Fee.create(req.body)
  res.status(201).json({ success: true, data: fee })
}

exports.updateFee = async (req, res) => {
  const fee = await Fee.findByPk(req.params.id)
  if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' })
  await fee.update(req.body)
  res.json({ success: true, data: fee })
}
