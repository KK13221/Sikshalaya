const { Notification } = require('../models')
const { Op } = require('sequelize')

exports.list = async (req, res) => {
  const { priority, unreadOnly } = req.query
  const where = { userId: req.user.id }
  if (priority) where.priority = priority
  if (unreadOnly === 'true') where.read = false
  where[Op.or] = [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]

  const notifications = await Notification.findAll({
    where, order: [['createdAt','DESC']], limit: 50,
  })
  res.json({ success: true, data: notifications })
}

exports.markRead = async (req, res) => {
  const n = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } })
  if (!n) return res.status(404).json({ success: false, message: 'Not found' })
  await n.update({ read: true, readAt: new Date() })
  res.json({ success: true })
}

exports.markAllRead = async (req, res) => {
  await Notification.update(
    { read: true, readAt: new Date() },
    { where: { userId: req.user.id, read: false } }
  )
  res.json({ success: true })
}
