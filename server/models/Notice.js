const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Notice = sequelize.define('Notice', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:  { type: DataTypes.INTEGER, allowNull: false },
  title:     { type: DataTypes.STRING(300), allowNull: false },
  body:      { type: DataTypes.TEXT },
  priority:  { type: DataTypes.ENUM('urgent', 'info', 'reminder'), defaultValue: 'info' },
  audience:  { type: DataTypes.STRING(100), defaultValue: 'All teachers' },
  createdBy: { type: DataTypes.INTEGER },
  expiresAt: { type: DataTypes.DATE },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'notices' })

module.exports = Notice
