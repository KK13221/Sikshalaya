const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const c = require('../controllers/reportCardController')

router.use(protect)

router.get('/student/:studentId', c.getStudentReport)
router.get('/class/:classId', c.getClassReports)

module.exports = router
