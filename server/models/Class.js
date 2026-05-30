const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Class = sequelize.define('Class', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:        { type: DataTypes.INTEGER, allowNull: false },
  name:            { type: DataTypes.STRING(50), allowNull: false },
  section:         { type: DataTypes.STRING(20), allowNull: false },
  subjects:        { type: DataTypes.JSON },
  academicYear:    { type: DataTypes.STRING(20), defaultValue: '2025-26' },
  classTeacherId:  { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'classes',
  indexes: [{ unique: true, fields: ['schoolId', 'name', 'section', 'academicYear'] }],
})

module.exports = Class
