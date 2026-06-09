const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/assessmentController')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.get('/', ctrl.list)
router.get('/types', ctrl.getTypes)
router.post('/types', authorize('superadmin', 'principal'), ctrl.createType)
router.put('/types/:id', authorize('superadmin', 'principal'), ctrl.updateType)
router.delete('/types/:id', authorize('superadmin', 'principal'), ctrl.deleteType)
router.post('/', ctrl.create)
router.get('/:id/marks', ctrl.getMarks)
router.patch('/:id/marks/:studentId', ctrl.upsertMark)
router.post('/:id/submit', ctrl.submit)
router.post('/publish', authorize('superadmin','principal'), ctrl.publish)

module.exports = router
