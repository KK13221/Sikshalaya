const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const BehaviourMetric = sequelize.define('BehaviourMetric', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:  { type: DataTypes.INTEGER, allowNull: true },  // null = global (superadmin)
  name:      { type: DataTypes.STRING(100), allowNull: false },
  kind:      { type: DataTypes.ENUM('positive', 'negative'), allowNull: false },
  weight:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  category:  { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'behaviour' },
  target:    { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'student' },
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'behaviour_metrics',
})

// Default metrics seeded on first use
BehaviourMetric.DEFAULTS = [
  { name: 'Helpful',              kind: 'positive', weight: 5,   category: 'behaviour', target: 'student' },
  { name: 'Leadership',           kind: 'positive', weight: 8,   category: 'behaviour', target: 'student' },
  { name: 'Creative',             kind: 'positive', weight: 4,   category: 'behaviour', target: 'student' },
  { name: 'Punctual',             kind: 'positive', weight: 3,   category: 'behaviour', target: 'student' },
  { name: 'Active Participation', kind: 'positive', weight: 4,   category: 'academic',  target: 'student'  },
  { name: 'Homework incomplete',  kind: 'negative', weight: -3,  category: 'academic',  target: 'student'  },
  { name: 'Late arrival',         kind: 'negative', weight: -3,  category: 'behaviour', target: 'student' },
  { name: 'Disruptive',           kind: 'negative', weight: -8,  category: 'behaviour', target: 'student' },
  { name: 'Rude',                 kind: 'negative', weight: -6,  category: 'behaviour', target: 'student' },
  { name: 'Cheating',             kind: 'negative', weight: -10, category: 'academic',  target: 'student'  },
  { name: 'General',              kind: 'positive', weight: 1,   category: 'General',     target: 'teacher'  },
  { name: 'Instruction',          kind: 'positive', weight: 1,   category: 'Instruction', target: 'teacher'  },
  { name: 'Discipline',           kind: 'positive', weight: 1,   category: 'Discipline',  target: 'teacher'  },
  { name: 'Punctuality',          kind: 'positive', weight: 1,   category: 'Punctuality', target: 'teacher'  },
  { name: 'Leadership',           kind: 'positive', weight: 1,   category: 'Leadership',  target: 'teacher'  },
]

module.exports = BehaviourMetric
