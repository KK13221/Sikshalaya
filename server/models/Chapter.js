const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Chapter = sequelize.define('Chapter', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:      { type: DataTypes.INTEGER, allowNull: false },
  classNum:      { type: DataTypes.INTEGER, allowNull: false },
  subjectId:     { type: DataTypes.STRING(50), allowNull: false },
  chapterNumber: { type: DataTypes.INTEGER, allowNull: false },
  name:          { type: DataTypes.STRING(200), allowNull: false },
  periods:       { type: DataTypes.INTEGER, defaultValue: 8 },
  maxMarks:      { type: DataTypes.INTEGER, defaultValue: 30 },
  status:        { type: DataTypes.ENUM('upcoming','in_progress','done'), defaultValue: 'upcoming' },
  hasChapterTest:{ type: DataTypes.BOOLEAN, defaultValue: true },
  startedAt:     { type: DataTypes.DATE },
  completedAt:   { type: DataTypes.DATE },
  createdBy:     { type: DataTypes.INTEGER },
}, {
  tableName: 'chapters',
  indexes: [{ unique: true, fields: ['schoolId','classNum','subjectId','chapterNumber'] }],
})

module.exports = Chapter
