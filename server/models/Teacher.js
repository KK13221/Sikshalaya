const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Teacher = sequelize.define('Teacher', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:        { type: DataTypes.INTEGER, allowNull: true },
  schoolId:      { type: DataTypes.INTEGER, allowNull: false },
  employeeId:    { type: DataTypes.STRING(50), allowNull: false },
  name:          { type: DataTypes.STRING(150), allowNull: false },
  email:         { type: DataTypes.STRING(150), allowNull: false },
  phone:         { type: DataTypes.STRING(20) },
  subjects:      { type: DataTypes.JSON },
  experience:    { type: DataTypes.INTEGER },
  qualification: { type: DataTypes.STRING(100) },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'teachers',
  indexes: [{ unique: true, fields: ['schoolId', 'employeeId'] }],
})

module.exports = Teacher
