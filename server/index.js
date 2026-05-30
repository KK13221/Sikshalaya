require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./swagger.json')
const { connectDB } = require('./config/db')
// Load all models & associations before sync
require('./models')

const app = express()

connectDB()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// Routes
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/schools',       require('./routes/schools'))
app.use('/api/students',      require('./routes/students'))
app.use('/api/teachers',      require('./routes/teachers'))
app.use('/api/classes',       require('./routes/classes'))
app.use('/api/attendance',    require('./routes/attendance'))
app.use('/api/fees',          require('./routes/fees'))
app.use('/api/dashboard',     require('./routes/dashboard'))
app.use('/api/users',         require('./routes/users'))
app.use('/api/chapters',      require('./routes/chapters'))
app.use('/api/assessments',   require('./routes/assessments'))
app.use('/api/behaviour',         require('./routes/behaviour'))
app.use('/api/behaviour-metrics', require('./routes/behaviourMetrics'))
app.use('/api/notifications',     require('./routes/notifications'))
app.use('/api/notices',           require('./routes/notices'))
app.use('/api/settings',          require('./routes/settings'))

// Global error handler — catches errors forwarded via next(err)
app.use((err, req, res, next) => {
  console.error(err)

  // Sequelize validation errors → 400
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    let msg = err.errors?.[0]?.message || 'Validation error';
    if (msg.toLowerCase().includes('employeeId') || msg.toLowerCase().includes('employee_id')) {
      msg = 'Employee ID is already assigned to another teacher in this branch';
    } else if (msg.toLowerCase().includes('email')) {
      msg = 'A teacher with this email address already exists';
    }
    return res.status(400).json({
      success: false,
      message: msg,
    })
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Shikshalaya server running on port ${PORT}`))
