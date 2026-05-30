const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/chapterController')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.get('/', ctrl.list)
router.post('/', authorize('superadmin','principal'), ctrl.create)
router.patch('/:id', authorize('superadmin','principal'), ctrl.update)
router.delete('/:id', authorize('superadmin','principal'), ctrl.remove)

module.exports = router
