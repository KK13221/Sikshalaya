const { Sequelize } = require('sequelize')
const path = require('path')

const useSQLite = process.env.DB_DIALECT === 'sqlite' || !process.env.MYSQL_HOST

let sequelize

if (useSQLite) {
  const dbPath = path.join(__dirname, '..', 'dev.sqlite')
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  })
} else {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'shikshalaya',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: process.env.MYSQL_SSL === 'true'
        ? { ssl: { rejectUnauthorized: false } }
        : {},
    }
  )
}

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    if (useSQLite) {
      console.log('✅ SQLite connected (dev mode)')
    } else {
      console.log('✅ MySQL connected')
    }
    // MySQL: alter to pick up new columns without losing data (disabled to avoid max keys error in prod)
    await sequelize.sync()
    console.log('✅ Database tables synced')
    
    // Seed AssessmentTypes if empty
    const AssessmentType = require('../models/AssessmentType')
    const count = await AssessmentType.count()
    if (count === 0) {
      await AssessmentType.bulkCreate([
        { code: 'chapter', label: 'Chapter Test', sublabel: 'After every chapter', color: 'blue' },
        { code: 'class', label: 'Class Test', sublabel: 'Sample paper (you create)', color: 'green' },
        { code: 'unit', label: 'Unit Test', sublabel: '3-monthly · scheduled', color: 'yellow' },
        { code: 'term', label: 'Term Examination', sublabel: 'End of term', color: 'red' },
      ])
      console.log('✅ Default Assessment Types seeded')
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
