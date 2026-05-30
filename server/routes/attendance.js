const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const c = require('../controllers/attendanceController')

router.use(protect)

router.get('/', c.getAttendance)
router.post('/', c.markAttendance)


module.exports = router
