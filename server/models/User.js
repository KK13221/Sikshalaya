const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const { sequelize } = require('../config/db')

const User = sequelize.define('User', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  email:     { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password:  { type: DataTypes.STRING(255), allowNull: false },
  role:      { type: DataTypes.ENUM('superadmin', 'principal', 'teacher'), allowNull: false },
  schoolId:  { type: DataTypes.INTEGER, allowNull: true },
  phone:     { type: DataTypes.STRING(20) },
  avatar:    { type: DataTypes.STRING(500) },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE },
}, {
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12)
      }
    },
  },
})

User.prototype.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

module.exports = User
