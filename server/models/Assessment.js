const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Assessment = sequelize.define('Assessment', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:     { type: DataTypes.INTEGER, allowNull: false },
  classNum:     { type: DataTypes.INTEGER, allowNull: false },
  section:      { type: DataTypes.STRING(10) },
  subjectId:    { type: DataTypes.STRING(50), allowNull: false },
  academicYear: { type: DataTypes.STRING(10), defaultValue: '2025-26' },
  termId:       { type: DataTypes.STRING(5) },
  type:         { type: DataTypes.ENUM('chapter_test','class_test','unit_test','term_exam'), allowNull: false },
  chapterId:    { type: DataTypes.INTEGER },
  unitNumber:   { type: DataTypes.INTEGER },
  title:        { type: DataTypes.STRING(300), allowNull: false },
  maxMarks:     { type: DataTypes.INTEGER, defaultValue: 30 },
  passMarks:    { type: DataTypes.INTEGER, defaultValue: 12 },
  scheduledFor: { type: DataTypes.DATE },
  conductedOn:  { type: DataTypes.DATE },
  status:       { type: DataTypes.ENUM('draft','scheduled','active','completed','published'), defaultValue: 'draft' },
  createdBy:    { type: DataTypes.INTEGER },
}, { tableName: 'assessments' })

module.exports = Assessment
