const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Notification = sequelize.define('Notification', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.INTEGER, allowNull: false },
  schoolId:  { type: DataTypes.INTEGER },
  priority:  { type: DataTypes.ENUM('urgent','reminder','parent','info'), defaultValue: 'info' },
  category:  { type: DataTypes.STRING(50) },
  title:     { type: DataTypes.STRING(300), allowNull: false },
  body:      { type: DataTypes.TEXT },
  actionUrl: { type: DataTypes.STRING(500) },
  read:      { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:    { type: DataTypes.DATE },
  expiresAt: { type: DataTypes.DATE },
}, { tableName: 'notifications' })

module.exports = Notification
