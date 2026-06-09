const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const SchoolSettings = sequelize.define('SchoolSettings', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:         { type: DataTypes.INTEGER, allowNull: false, unique: true },
  academicYear:     { type: DataTypes.STRING(10), defaultValue: '2025-26' },
  greenThreshold:   { type: DataTypes.INTEGER, defaultValue: 75 },
  yellowThreshold:  { type: DataTypes.INTEGER, defaultValue: 50 },
  timezone:         { type: DataTypes.STRING(50), defaultValue: 'Asia/Kolkata' },
  schoolName:       { type: DataTypes.STRING(200) },
  passMarksDefault: { type: DataTypes.INTEGER, defaultValue: 12 },
  maxMarksDefault:  { type: DataTypes.INTEGER, defaultValue: 30 },
  teacherNorms:     { type: DataTypes.TEXT },
  teacherNormsVersion: { type: DataTypes.INTEGER, defaultValue: 1 },
  teacherNormsUpdatedAt: { type: DataTypes.DATE },
}, { tableName: 'school_settings' })

module.exports = SchoolSettings
