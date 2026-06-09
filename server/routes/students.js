const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const c = require('../controllers/studentController')

router.use(protect)

router.get('/overview',        c.getOverview)
router.get('/underperformers', c.getUnderperformers)
router.route('/')
  .get(c.getStudents)
  .post(authorize('superadmin', 'principal'), c.createStudent)

router.post('/bulk', authorize('superadmin', 'principal'), c.bulkCreateStudents)

router.get('/:id/metrics', c.getMetrics)
router.patch('/:id/acknowledge', c.acknowledgeUnderperformer)
router.route('/:id')
  .get(c.getStudent)
  .put(authorize('superadmin', 'principal'), c.updateStudent)
  .delete(authorize('superadmin', 'principal'), c.deleteStudent)

module.exports = router
