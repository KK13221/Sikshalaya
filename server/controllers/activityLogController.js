const { ActivityLog } = require('../models')

exports.list = async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }

    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    })

    const formattedLogs = logs.map(log => {
      const resource = log.resource || {}
      
      // Determine dot color
      let color = '#94A3B8' // default grey
      if (log.actorRole === 'superadmin') color = '#2563EB' // blue
      else if (log.actorRole === 'principal') color = '#10B981' // green
      else if (log.actorRole === 'teacher') color = '#F59E0B' // yellow
      
      if (log.action === 'removed' || log.action === 'deleted') color = '#EF4444' // red

      // Format time
      const date = new Date(log.createdAt)
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      const dateStr = date.toISOString().slice(0, 10)

      return {
        id: log.id,
        time: `${dateStr} ${timeStr}`,
        actorName: resource.actorName || 'System',
        action: log.action,
        details: resource.details || '',
        branchName: resource.branchName || '—',
        color
      }
    })

    res.json({ success: true, data: formattedLogs })
  } catch (err) {
    next(err)
  }
}
