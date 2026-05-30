const express = require('express')
const router = express.Router()
const { login, logout, me, changePassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/login', login)
router.post('/logout', protect, logout)
router.get('/me', protect, me)
router.put('/change-password', protect, changePassword)

module.exports = router
