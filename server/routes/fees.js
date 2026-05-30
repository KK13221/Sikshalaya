const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const c = require('../controllers/feeController')

router.use(protect)

router.get('/', c.getFees)
router.post('/', authorize('superadmin', 'principal'), c.createFee)
router.put('/:id', authorize('superadmin', 'principal'), c.updateFee)

module.exports = router
