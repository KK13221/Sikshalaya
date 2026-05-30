const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { teacherRules } = require('../middleware/validate')
const c = require('../controllers/teacherController')

router.use(protect)

// Teacher-scoped mobile app routes (must come before /:id to avoid conflict)
router.get('/me/classes',                              c.myClasses)
router.get('/me/students',                             c.myStudents)
router.get('/me/attendance',                           c.myAttendance)
router.post('/me/attendance',                          c.markAttendance)
router.get('/me/assessments',                          c.myAssessments)
router.get('/me/chapters',                             c.myChapters)
router.patch('/me/assessments/:assessmentId/marks/:studentId', c.enterMark)
router.get('/me/notifications',                        c.myNotifications)
router.get('/me/pending-tasks',                        c.pendingTasks)

router.route('/')
  .get(c.getTeachers)
  .post(authorize('superadmin', 'principal'), teacherRules, c.createTeacher)

router.route('/:id')
  .get(c.getTeacher)
  .put(authorize('superadmin', 'principal'), teacherRules, c.updateTeacher)
  .delete(authorize('superadmin', 'principal'), c.deleteTeacher)

module.exports = router
