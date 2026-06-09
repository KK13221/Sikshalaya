const { SchoolSettings, School } = require('../models')

exports.get = async (req, res, next) => {
  try {
    const schoolId = req.user.role === 'superadmin'
      ? (req.query.schoolId ? Number(req.query.schoolId) : req.user.schoolId)
      : req.user.schoolId
    if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

    let settings = await SchoolSettings.findOne({ where: { schoolId } })
    if (!settings) {
      // Auto-create with defaults for this school
      const school = await School.findByPk(schoolId, { attributes: ['name'] })
      settings = await SchoolSettings.create({
        schoolId,
        schoolName: school?.name,
      })
    }
    res.json({ success: true, data: settings })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const schoolId = req.user.role === 'superadmin'
      ? (req.query.schoolId || req.body.schoolId ? Number(req.query.schoolId || req.body.schoolId) : req.user.schoolId)
      : req.user.schoolId
    if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

    const allowed = ['academicYear', 'greenThreshold', 'yellowThreshold', 'timezone', 'passMarksDefault', 'maxMarksDefault']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    let settings = await SchoolSettings.findOne({ where: { schoolId } })

    if (req.body.teacherNorms !== undefined) {
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Only Super Admin can update teacher norms' })
      }
      updates.teacherNorms = req.body.teacherNorms
      const currentVersion = settings ? (settings.teacherNormsVersion || 0) : 0
      updates.teacherNormsVersion = currentVersion + 1
      updates.teacherNormsUpdatedAt = new Date()

      try {
        const { logActivity } = require('../services/activityService')
        await logActivity(req, 'updated', `teacher norms to Version ${currentVersion + 1}`, { schoolId })
      } catch (err) {
        console.error('Failed to log norms update activity:', err)
      }
    }

    if (!settings) {
      settings = await SchoolSettings.create({ schoolId, ...updates })
    } else {
      await settings.update(updates)
    }

    res.json({ success: true, data: settings })
  } catch (err) { next(err) }
}
