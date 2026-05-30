const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/behaviourController')
const { protect } = require('../middleware/auth')

router.use(protect)
router.get('/presets', ctrl.presets)
router.get('/logs', ctrl.list)
router.post('/logs', ctrl.create)

module.exports = router
