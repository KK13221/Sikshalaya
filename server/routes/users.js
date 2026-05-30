const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { userRules } = require('../middleware/validate')
const { User, School } = require('../models')
const { Op } = require('sequelize')
const crypto = require('crypto')

router.use(protect)

router.get('/', authorize('superadmin','principal'), async (req, res, next) => {
  try {
    const { role, schoolId, search } = req.query
    const where = {}
    if (role) where.role = role
    if (schoolId) where.schoolId = schoolId
    if (req.user.role === 'principal') where.schoolId = req.user.schoolId
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ]
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: School, as: 'School', attributes: ['id','name','city'], foreignKey: 'schoolId', required: false }],
      order: [['name','ASC']],
    })
    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
})

router.post('/', authorize('superadmin'), userRules, async (req, res, next) => {
  try {
    const { name, email, role, schoolId, password } = req.body
    const existing = await User.findOne({ where: { email } })
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' })

    // Generate a secure random password instead of using a hardcoded default if not provided
    const tempPassword = password || (crypto.randomBytes(8).toString('hex').slice(0, 12) +
      String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '!')

    const user = await User.create({ name, email, password: tempPassword, role, schoolId: schoolId || null })
    if (schoolId && role === 'principal') {
      await School.update({ principalId: user.id }, { where: { id: schoolId } })
    }
    res.status(201).json({
      success: true,
      data: { ...user.toJSON(), password: undefined },
      tempPassword: password ? undefined : tempPassword,
    })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', authorize('superadmin','principal'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    const { password, ...rest } = req.body
    await user.update(rest)
    res.json({ success: true, data: { ...user.toJSON(), password: undefined } })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', authorize('superadmin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' })
    await user.update({ isActive: false })
    res.json({ success: true, message: 'User deactivated' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
