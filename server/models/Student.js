const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Student = sequelize.define('Student', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:        { type: DataTypes.INTEGER, allowNull: false },
  admissionNo:     { type: DataTypes.STRING(50), allowNull: false },
  name:            { type: DataTypes.STRING(150), allowNull: false },
  dateOfBirth:     { type: DataTypes.DATEONLY },
  gender:          { type: DataTypes.ENUM('male','female','other') },
  classId:         { type: DataTypes.INTEGER },
  section:         { type: DataTypes.STRING(20) },
  rollNo:          { type: DataTypes.INTEGER },
  guardianName:    { type: DataTypes.STRING(150) },
  guardianRelation:{ type: DataTypes.STRING(50) },
  guardianPhone:   { type: DataTypes.STRING(20) },
  guardianEmail:   { type: DataTypes.STRING(150) },
  city:            { type: DataTypes.STRING(100) },
  state:           { type: DataTypes.STRING(100) },
  pincode:         { type: DataTypes.STRING(10) },
  photo:           { type: DataTypes.STRING(500) },
  bloodGroup:      { type: DataTypes.STRING(5) },
  isActive:           { type: DataTypes.BOOLEAN, defaultValue: true },
  admissionDate:      { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  // Computed metrics (recomputed on every marks/attendance/behaviour write)
  academicsPct:       { type: DataTypes.FLOAT },
  punctualityPct:     { type: DataTypes.FLOAT },
  behaviourScore:     { type: DataTypes.FLOAT },
  isUnderperformer:   { type: DataTypes.BOOLEAN, defaultValue: false },
  underperformerDims: { type: DataTypes.JSON, defaultValue: [] },
  metricsComputedAt:  { type: DataTypes.DATE },
  acknowledgedAt:     { type: DataTypes.DATE },
}, {
  tableName: 'students',
  indexes: [{ unique: true, fields: ['schoolId', 'admissionNo'] }],
})

module.exports = Student
