const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const BehaviourMetric = sequelize.define('BehaviourMetric', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:  { type: DataTypes.INTEGER, allowNull: true },  // null = global (superadmin)
  name:      { type: DataTypes.STRING(100), allowNull: false },
  kind:      { type: DataTypes.ENUM('positive', 'negative'), allowNull: false },
  weight:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  category:  { type: DataTypes.ENUM('behaviour', 'academic'), allowNull: false, defaultValue: 'behaviour' },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'behaviour_metrics',
})

// Default metrics seeded on first use
BehaviourMetric.DEFAULTS = [
  { name: 'Helpful',              kind: 'positive', weight: 5,   category: 'behaviour' },
  { name: 'Leadership',           kind: 'positive', weight: 8,   category: 'behaviour' },
  { name: 'Creative',             kind: 'positive', weight: 4,   category: 'behaviour' },
  { name: 'Punctual',             kind: 'positive', weight: 3,   category: 'behaviour' },
  { name: 'Active Participation', kind: 'positive', weight: 4,   category: 'academic'  },
  { name: 'Homework incomplete',  kind: 'negative', weight: -3,  category: 'academic'  },
  { name: 'Late arrival',         kind: 'negative', weight: -3,  category: 'behaviour' },
  { name: 'Disruptive',           kind: 'negative', weight: -8,  category: 'behaviour' },
  { name: 'Rude',                 kind: 'negative', weight: -6,  category: 'behaviour' },
  { name: 'Cheating',             kind: 'negative', weight: -10, category: 'academic'  },
]

module.exports = BehaviourMetric
