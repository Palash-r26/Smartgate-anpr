const mysql = require('mysql2/promise');
const { getPoolConfig } = require('./poolConfig');

const pool = mysql.createPool(getPoolConfig());

module.exports = pool;
