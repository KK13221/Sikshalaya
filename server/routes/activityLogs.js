const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const activityLogController = require('../controllers/activityLogController')

router.get('/', protect, activityLogController.list)

module.exports = router
