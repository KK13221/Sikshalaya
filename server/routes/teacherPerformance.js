const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const c = require('../controllers/teacherPerformanceController')

router.use(protect)

router.get('/me/summary', c.getTeacherSummary)

router.route('/')
  .get(c.list)
  .post(c.create)

router.route('/:id')
  .get(c.get)
  .put(c.update)
  .delete(c.delete)

module.exports = router
