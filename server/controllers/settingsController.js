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
    const schoolId = req.user.schoolId
    if (!schoolId) return res.status(400).json({ success: false, message: 'No school assigned' })

    const allowed = ['academicYear', 'greenThreshold', 'yellowThreshold', 'timezone', 'passMarksDefault', 'maxMarksDefault']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    let settings = await SchoolSettings.findOne({ where: { schoolId } })
    if (!settings) {
      settings = await SchoolSettings.create({ schoolId, ...updates })
    } else {
      await settings.update(updates)
    }

    res.json({ success: true, data: settings })
  } catch (err) { next(err) }
}
