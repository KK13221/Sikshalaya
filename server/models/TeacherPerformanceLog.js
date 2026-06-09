const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const TeacherPerformanceLog = sequelize.define('TeacherPerformanceLog', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacherId:    { type: DataTypes.INTEGER, allowNull: false },
  schoolId:     { type: DataTypes.INTEGER, allowNull: false },
  academicYear: { type: DataTypes.STRING(20), allowNull: false },
  score:        { type: DataTypes.FLOAT, allowNull: false },
  remark:       { type: DataTypes.TEXT },
  loggedBy:     { type: DataTypes.INTEGER },
  date:         { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  category:     { type: DataTypes.STRING(100) },
}, {
  tableName: 'teacher_performance_logs'
})

module.exports = TeacherPerformanceLog
