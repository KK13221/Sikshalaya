const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const TeacherNormAcceptance = sequelize.define('TeacherNormAcceptance', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacherId:    { type: DataTypes.INTEGER, allowNull: false },
  schoolId:     { type: DataTypes.INTEGER, allowNull: false },
  normsVersion: { type: DataTypes.INTEGER, allowNull: false },
  acceptedAt:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ipAddress:    { type: DataTypes.STRING(45) },
  userAgent:    { type: DataTypes.TEXT },
}, {
  tableName: 'teacher_norm_acceptances'
})

module.exports = TeacherNormAcceptance
