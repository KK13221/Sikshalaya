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
    if (user.schoolId) {
      const school = await School.findByPk(user.schoolId, { attributes: ['name'] })
      schoolName = school?.name || null
    }

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
    res.json({ success: true, user })
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
