const jwt = require('jsonwebtoken')
const { User } = require('../models')

const protect = async (req, res, next) => {
  let token = req.cookies.token
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    })
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account inactive or not found' })
    }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  next()
}

const schoolScope = (req, res, next) => {
  if (req.user.role === 'superadmin') return next()
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId
  if (schoolId && String(req.user.schoolId) !== String(schoolId)) {
    return res.status(403).json({ success: false, message: 'Access to this school is denied' })
  }
  next()
}

module.exports = { protect, authorize, schoolScope }
