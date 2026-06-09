const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const AssessmentType = sequelize.define('AssessmentType', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:     { type: DataTypes.INTEGER, allowNull: true },
  code:         { type: DataTypes.STRING(20), allowNull: false },
  label:        { type: DataTypes.STRING(50), allowNull: false },
  sublabel:     { type: DataTypes.STRING(100) },
  color:        { type: DataTypes.STRING(20) }, 
  showInReport: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
}, { tableName: 'assessment_types', timestamps: false })

module.exports = AssessmentType
