const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const School = sequelize.define('School', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(200), allowNull: false },
  code:        { type: DataTypes.STRING(20), unique: true },
  addressLine1:{ type: DataTypes.STRING(300) },
  city:        { type: DataTypes.STRING(100), allowNull: false },
  state:       { type: DataTypes.STRING(100), allowNull: false },
  pincode:     { type: DataTypes.STRING(10) },
  board:       { type: DataTypes.ENUM('CBSE','ICSE','State Board','IB','Other'), defaultValue: 'CBSE' },
  phone:       { type: DataTypes.STRING(20) },
  email:       { type: DataTypes.STRING(150) },
  website:     { type: DataTypes.STRING(300) },
  established: { type: DataTypes.INTEGER },
  plan:        { type: DataTypes.ENUM('Basic','Pro','Enterprise'), defaultValue: 'Basic' },
  status:      { type: DataTypes.ENUM('active','trial','suspended'), defaultValue: 'trial' },
  trialEndsAt: { type: DataTypes.DATE },
  principalId: { type: DataTypes.INTEGER },
  logo:        { type: DataTypes.STRING(500) },
}, {
  tableName: 'schools',
  hooks: {
    beforeCreate: async (school) => {
      if (!school.code) {
        const initials = school.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4)
        const count = await School.count()
        school.code = `${initials}${String(count + 1).padStart(3, '0')}`
      }
    },
  },
})

module.exports = School
