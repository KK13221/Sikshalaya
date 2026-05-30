const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Fee = sequelize.define('Fee', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schoolId:    { type: DataTypes.INTEGER, allowNull: false },
  studentId:   { type: DataTypes.INTEGER, allowNull: false },
  term:        { type: DataTypes.STRING(50) },
  dueDate:     { type: DataTypes.DATEONLY },
  items:       { type: DataTypes.JSON },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paidAmount:  { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status:      { type: DataTypes.ENUM('pending','paid','overdue'), defaultValue: 'pending' },
}, {
  tableName: 'fees',
  hooks: {
    beforeSave: (fee) => {
      if (fee.changed('paidAmount') || fee.changed('totalAmount') || fee.changed('dueDate')) {
        if (parseFloat(fee.paidAmount) >= parseFloat(fee.totalAmount)) {
          fee.status = 'paid'
        } else if (fee.dueDate && new Date(fee.dueDate) < new Date()) {
          fee.status = 'overdue'
        } else {
          fee.status = 'pending'
        }
      }
    },
  },
})

module.exports = Fee
