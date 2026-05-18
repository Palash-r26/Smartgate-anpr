const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
    try {
        console.log('Connecting to database...');
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Creating vehicles table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                plate_number VARCHAR(15) UNIQUE NOT NULL,
                owner_name VARCHAR(100) NOT NULL,
                designation VARCHAR(50) DEFAULT 'Visitor',
                is_active BOOLEAN DEFAULT 1
            )
        `);

        console.log('Creating access_logs table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS access_logs (
                log_id INT PRIMARY KEY AUTO_INCREMENT,
                plate_number VARCHAR(15) NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) NOT NULL,
                confidence FLOAT NOT NULL
            )
        `);

        console.log('Inserting mock vehicle...');
        await pool.query(`
            INSERT IGNORE INTO vehicles (plate_number, owner_name, designation)
            VALUES ('MH12AB1234', 'John Doe', 'Faculty')
        `);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
