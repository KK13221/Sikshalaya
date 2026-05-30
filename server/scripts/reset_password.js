/**
 * One-time password reset script.
 * Usage: node scripts/reset_password.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sequelize } = require('../config/db')
const { User } = require('../models')

async function run() {
  await sequelize.authenticate()

  const email = 'kamlesh@sikshalaya.in'
  const newPassword = 'Teacher@123'

  const user = await User.findOne({ where: { email } })
  if (!user) {
    console.log(`❌ User not found: ${email}`)
    process.exit(1)
  }

  user.password = newPassword
  await user.save()

  console.log(`✅ Password reset successful`)
  console.log(`   Email:    ${email}`)
  console.log(`   Password: ${newPassword}`)
  process.exit(0)
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
