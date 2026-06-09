const jwt = require('jsonwebtoken')
const { User, School } = require('../models')




// POST /auth/login — verify credentials, return JWT directly (no OTP)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is inactive' })
    }

    await user.update({ lastLogin: new Date() })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.cookie('token', token, {
      httpOnly: true,
      // secure: false so the cookie is stored on HTTP (staging uses HTTP, not HTTPS)
      // Set COOKIE_SECURE=true in .env only when the server has a valid TLS cert
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // Fetch school name so mobile app can display it without a separate call
    let schoolName = null
    let principal = null
    let settings = null
    if (user.schoolId) {
      const school = await School.findByPk(user.schoolId, { attributes: ['name'] })
      schoolName = school?.name || null
      principal = await User.findOne({
        where: { role: 'principal', schoolId: user.schoolId },
        attributes: ['name', 'email']
      })
      const { SchoolSettings } = require('../models')
      settings = await SchoolSettings.findOne({ where: { schoolId: user.schoolId } })
    }
    const superadmin = await User.findOne({
      where: { role: 'superadmin' },
      attributes: ['name', 'email']
    })

    const currentVersion = settings ? (settings.teacherNormsVersion || 0) : 0
    const acceptedVersion = user.normsAcceptedVersion || 0
    const requiresNormsAcceptance = user.role === 'teacher' && settings && settings.teacherNorms && (currentVersion > acceptedVersion) ? true : false

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName,
        principal: principal ? principal.toJSON() : null,
        superadmin: superadmin ? superadmin.toJSON() : null,
        teacherNorms: settings ? settings.teacherNorms : null,
        teacherNormsVersion: currentVersion,
        normsAcceptedVersion: acceptedVersion,
        normsAcceptedAt: user.normsAcceptedAt || null,
        requiresNormsAcceptance,
      },
    })
  } catch (err) {
    next(err)
  }
}


exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.json({ success: true, message: 'Logged out' })
}

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: School, attributes: ['id','name','code','city','plan','status'], required: false }],
    })
    
    let principal = null
    if (user.schoolId) {
      principal = await User.findOne({
        where: { role: 'principal', schoolId: user.schoolId },
        attributes: ['name', 'email']
      })
    }
    const superadmin = await User.findOne({
      where: { role: 'superadmin' },
      attributes: ['name', 'email']
    })

    const { SchoolSettings } = require('../models')
    let settings = null
    if (user.schoolId) {
      settings = await SchoolSettings.findOne({ where: { schoolId: user.schoolId } })
    }

    const userData = user.toJSON()
    userData.principal = principal ? principal.toJSON() : null
    userData.superadmin = superadmin ? superadmin.toJSON() : null
    if (settings) {
      userData.settings = settings.toJSON()
    }

    const currentVersion = settings ? (settings.teacherNormsVersion || 0) : 0
    const acceptedVersion = user.normsAcceptedVersion || 0
    const requiresNormsAcceptance = user.role === 'teacher' && settings && settings.teacherNorms && (currentVersion > acceptedVersion) ? true : false

    userData.teacherNorms = settings ? settings.teacherNorms : null
    userData.teacherNormsVersion = currentVersion
    userData.normsAcceptedVersion = acceptedVersion
    userData.normsAcceptedAt = user.normsAcceptedAt || null
    userData.requiresNormsAcceptance = requiresNormsAcceptance

    res.json({ success: true, user: userData, data: userData })
  } catch (err) {
    next(err)
  }
}

exports.acceptNorms = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    if (user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only teachers need to accept norms' })
    }
    if (!user.schoolId) {
      return res.status(400).json({ success: false, message: 'User has no school assigned' })
    }

    const { SchoolSettings, TeacherNormAcceptance } = require('../models')
    const settings = await SchoolSettings.findOne({ where: { schoolId: user.schoolId } })
    if (!settings || !settings.teacherNorms) {
      return res.status(400).json({ success: false, message: 'No teacher norms configured for this school' })
    }

    const version = settings.teacherNormsVersion || 1

    await user.update({
      normsAcceptedVersion: version,
      normsAcceptedAt: new Date()
    })

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    const ua = req.headers['user-agent'] || ''

    await TeacherNormAcceptance.create({
      teacherId: user.id,
      schoolId: user.schoolId,
      normsVersion: version,
      acceptedAt: new Date(),
      ipAddress: ip,
      userAgent: ua
    })

    res.json({
      success: true,
      message: 'Norms accepted successfully',
      data: {
        normsAcceptedVersion: version,
        normsAcceptedAt: user.normsAcceptedAt
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}
