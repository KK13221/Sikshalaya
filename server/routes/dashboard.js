const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { superAdminStats, principalStats } = require('../controllers/dashboardController')

router.use(protect)

router.get('/superadmin', authorize('superadmin'), superAdminStats)
router.get('/principal', authorize('superadmin', 'principal'), principalStats)

module.exports = router
