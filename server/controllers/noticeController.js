const { Notice, User } = require('../models')

exports.list = async (req, res, next) => {
  try {
    const schoolId = req.user.role === 'superadmin'
      ? (req.query.schoolId ? Number(req.query.schoolId) : req.user.schoolId)
      : req.user.schoolId
    if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

    const notices = await Notice.findAll({
      where: { schoolId, isActive: true },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    })
    res.json({ success: true, data: notices })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId
    if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

    const { title, body, priority, audience, expiresAt } = req.body
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' })

    const notice = await Notice.create({
      schoolId,
      title: title.trim(),
      body: body?.trim() || null,
      priority: priority || 'info',
      audience: audience || 'All teachers',
      createdBy: req.user.id,
      expiresAt: expiresAt || null,
      isActive: true,
    })

    res.status(201).json({ success: true, data: notice })
  } catch (err) { next(err) }
}

exports.remove = async (req, res, next) => {
  try {
    const notice = await Notice.findByPk(req.params.id)
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' })
    if (notice.schoolId !== req.user.schoolId && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    await notice.update({ isActive: false })
    res.json({ success: true, message: 'Notice removed' })
  } catch (err) { next(err) }
}
