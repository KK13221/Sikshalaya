const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const ActivityLog = sequelize.define('ActivityLog', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  actorId:   { type: DataTypes.INTEGER },
  actorRole: { type: DataTypes.STRING(30) },
  action:    { type: DataTypes.STRING(100), allowNull: false },
  resource:  { type: DataTypes.JSON },
  diff:      { type: DataTypes.JSON },
  meta:      { type: DataTypes.JSON },
}, { tableName: 'activity_logs', updatedAt: false })

module.exports = ActivityLog
