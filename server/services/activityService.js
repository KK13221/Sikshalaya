const { ActivityLog, School } = require('../models')

exports.logActivity = async (req, action, resourceDetails, meta = {}) => {
  try {
    const actorId = req.user?.id || null
    const actorRole = req.user?.role || 'system'
    
    // Fetch branch/school name if applicable
    let branchName = '—'
    if (req.user?.schoolId) {
      const school = await School.findByPk(req.user.schoolId, { attributes: ['name'] })
      branchName = school?.name || '—'
    } else if (meta.schoolId) {
      const school = await School.findByPk(meta.schoolId, { attributes: ['name'] })
      branchName = school?.name || '—'
    }

    // Capture actor name
    let actorName = 'System'
    if (req.user) {
      actorName = req.user.name || req.user.email || 'User'
    }

    await ActivityLog.create({
      actorId,
      actorRole,
      action,
      resource: {
        actorName,
        details: resourceDetails,
        branchName
      },
      meta
    })
  } catch (err) {
    console.error('Error logging activity:', err)
  }
}
