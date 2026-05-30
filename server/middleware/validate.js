const { body, validationResult } = require('express-validator')

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

const schoolRules = [
  body('name').trim().notEmpty().withMessage('Branch name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid phone number'),
  body('pincode').optional({ checkFalsy: true }).matches(/^[0-9]{4,10}$/).withMessage('Invalid pincode'),
  body('plan').optional().isIn(['Basic','Pro','Enterprise']).withMessage('Invalid plan'),
  body('status').optional().isIn(['active','trial','suspended']).withMessage('Invalid status'),
  body('board').optional().isIn(['CBSE','ICSE','State Board','IB','Other']).withMessage('Invalid board'),
  handleValidation,
]

const userRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').isIn(['superadmin','principal','teacher','student']).withMessage('Invalid role'),
  handleValidation,
]

const teacherRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid teacher email is required'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('schoolId').notEmpty().withMessage('Branch assignment is required'),
  body('phone').optional({ checkFalsy: true }).matches(/^[0-9+\-\s]{7,15}$/).withMessage('Invalid phone number'),
  body('subjects').optional().custom(val => {
    if (val !== undefined && !Array.isArray(val)) {
      throw new Error('Subjects must be an array')
    }
    return true
  }),
  handleValidation,
]

module.exports = { schoolRules, userRules, teacherRules }
