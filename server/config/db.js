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
    // SQLite: just create missing tables — alter breaks on SQLite with existing indexed data
    // MySQL: alter to pick up new columns without losing data
    await sequelize.sync(useSQLite ? {} : { alter: true })
    console.log('✅ Database tables synced')
  } catch (err) {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
