const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const c = require('../controllers/noticeController')

router.use(protect)

router.get('/', c.list)
router.post('/', authorize('superadmin', 'principal'), c.create)
router.delete('/:id', authorize('superadmin', 'principal'), c.remove)

module.exports = router
