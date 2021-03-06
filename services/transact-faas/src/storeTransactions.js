const Sequelize = require('sequelize')
const TransactionModel = require('./models/Transaction')

const DB_NAME = 'mxfactorial'
const DB_USERNAME = process.env.USER
const DB_PASSWORD = process.env.PASSWORD
const DB_HOST = process.env.HOST

const storeTransactions = async transactions => {
  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    operatorsAliases: false,
    logging: console.log,
    port: 3306,
    dialect: 'mysql',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000,
      handleDisconnects: true
    }
  })

  // Define transaction model
  const Transaction = TransactionModel(sequelize, Sequelize)
  const result = await Transaction.bulkCreate(transactions, {
    individualHooks: true
  })

  // Close connection
  sequelize.close().then(() => console.log('MySQL connection closed'))
  return result
}

module.exports = storeTransactions
