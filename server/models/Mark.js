const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Mark = sequelize.define('Mark', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assessmentId:   { type: DataTypes.INTEGER, allowNull: false },
  studentId:      { type: DataTypes.INTEGER, allowNull: false },
  marksObtained:  { type: DataTypes.FLOAT },
  writtenMarks:   { type: DataTypes.FLOAT },
  oralMarks:      { type: DataTypes.FLOAT },
  isAbsent:       { type: DataTypes.BOOLEAN, defaultValue: false },
  tags:           { type: DataTypes.JSON, defaultValue: [] },
  note:           { type: DataTypes.TEXT },
  enteredBy:      { type: DataTypes.INTEGER },
}, {
  tableName: 'marks',
  indexes: [{ unique: true, fields: ['assessmentId','studentId'] }],
})

module.exports = Mark
