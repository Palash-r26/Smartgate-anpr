const dotenv = require('dotenv');

dotenv.config();

function getPoolConfig() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    };

    if (process.env.DB_SSL === 'true') {
        config.ssl = { rejectUnauthorized: false };
    }

    return config;
}

module.exports = { getPoolConfig };
