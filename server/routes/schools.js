const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { schoolRules } = require('../middleware/validate')
const c = require('../controllers/schoolController')

router.use(protect)

router.route('/')
  .get(authorize('superadmin'), c.getAllSchools)
  .post(authorize('superadmin'), schoolRules, c.createSchool)

router.get('/stats', authorize('superadmin'), c.getSchoolStats)

router.route('/:id')
  .get(c.getSchool)
  .put(authorize('superadmin'), schoolRules, c.updateSchool)
  .delete(authorize('superadmin'), c.deleteSchool)

module.exports = router
