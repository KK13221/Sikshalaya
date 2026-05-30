const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const BehaviourLog = sequelize.define('BehaviourLog', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId:        { type: DataTypes.INTEGER, allowNull: false },
  schoolId:         { type: DataTypes.INTEGER, allowNull: false },
  date:             { type: DataTypes.DATEONLY, allowNull: false },
  loggedBy:         { type: DataTypes.INTEGER, allowNull: false },
  behaviourMetricId:{ type: DataTypes.INTEGER, allowNull: true },
  preset:           { type: DataTypes.STRING(100), allowNull: false },
  note:             { type: DataTypes.TEXT },
  kind:             { type: DataTypes.ENUM('positive','negative'), allowNull: false },
  weight:           { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'behaviour_logs',
})

module.exports = BehaviourLog
