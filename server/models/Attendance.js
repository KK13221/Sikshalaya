const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Attendance = sequelize.define('Attendance', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId: { type: DataTypes.INTEGER, allowNull: false },
  classId:  { type: DataTypes.INTEGER, allowNull: false },
  date:     { type: DataTypes.DATEONLY, allowNull: false },
  records:  { type: DataTypes.JSON }, // [{studentId, status: 'present'|'absent'|'late'}]
}, {
  tableName: 'attendance',
  indexes: [{ unique: true, fields: ['schoolId', 'classId', 'date'] }],
})

module.exports = Attendance
