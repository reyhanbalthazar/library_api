const mysql = require('mysql');
const util = require('util');

const db = mysql.createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: "localhost",
    user: "root",
    password: "balthazar",
    database: "library"
})

const dbQuery = util.promisify(db.query).bind(db);

module.exports = { db, dbQuery }