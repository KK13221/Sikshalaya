const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const c = require('../controllers/settingsController')

router.use(protect)

router.get('/', c.get)
router.put('/', authorize('superadmin', 'principal'), c.update)

module.exports = router
