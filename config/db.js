const mysql = require('mysql')

const mySqlConnection = mysql.createConnection({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: process.env.dbHost,
    database: process.env.dbName,
    port: process.env.dbPort
})

mySqlConnection.connect((err) => {
    if (err) throw err
    console.log("Database Connected!")
  })

module.exports = mySqlConnection