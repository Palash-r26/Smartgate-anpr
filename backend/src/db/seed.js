const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { getPoolConfig } = require('./poolConfig');
const { runMigrations } = require('./migrate');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
    try {
        console.log('Connecting to database...');
        const pool = mysql.createPool(getPoolConfig());

        console.log('Creating users table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NULL,
                name VARCHAR(100) NOT NULL,
                role ENUM('ADMIN', 'SECURITY') DEFAULT 'SECURITY',
                google_id VARCHAR(255) NULL,
                provider ENUM('local', 'google') DEFAULT 'local',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating vehicles table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                plate_number VARCHAR(15) UNIQUE NOT NULL,
                owner_name VARCHAR(100) NOT NULL,
                designation VARCHAR(80) DEFAULT 'Visitor',
                department VARCHAR(80) NULL,
                vehicle_type VARCHAR(30) DEFAULT 'Car',
                vehicle_color VARCHAR(30) DEFAULT 'Unknown',
                plate_type VARCHAR(30) DEFAULT 'Standard',
                phone VARCHAR(20) NULL,
                email VARCHAR(120) NULL,
                make VARCHAR(50) NULL,
                model VARCHAR(50) NULL,
                notes TEXT NULL,
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
                confidence FLOAT NOT NULL,
                verification VARCHAR(20) DEFAULT 'VERIFIED',
                owner_name VARCHAR(100) DEFAULT 'Unknown',
                designation VARCHAR(80) DEFAULT 'Visitor',
                department VARCHAR(80) NULL,
                vehicle_type VARCHAR(30) DEFAULT 'Unknown',
                vehicle_color VARCHAR(30) DEFAULT 'Unknown',
                plate_type VARCHAR(30) DEFAULT 'Unknown',
                make VARCHAR(50) NULL,
                model VARCHAR(50) NULL,
                phone VARCHAR(20) NULL,
                email VARCHAR(120) NULL,
                match_type VARCHAR(20) DEFAULT 'none'
            )
        `);

        console.log('Running migrations for existing databases...');
        await runMigrations(pool);

        console.log('Inserting sample vehicles...');
        await pool.query(`
            INSERT IGNORE INTO vehicles (
                plate_number, owner_name, designation, department,
                vehicle_type, vehicle_color, plate_type, make, model, phone
            ) VALUES
            ('MH12AB1234', 'Dr. Arun Kumar', 'HOD of CSE', 'Computer Science',
             'Car', 'White', 'Standard', 'Honda', 'City', '9876543210'),
            ('DL03CC9012', 'Col. Ravindra Singh', 'Armed Forces', 'Security',
             'SUV', 'Black', 'Standard', 'Toyota', 'Fortuner', NULL)
        `);

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartgate.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password';
        const adminHash = await bcrypt.hash(adminPassword, 10);

        await pool.query(
            `INSERT INTO users (email, password_hash, name, role, provider)
             VALUES (?, ?, 'System Admin', 'ADMIN', 'local')
             ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'ADMIN'`,
            [adminEmail, adminHash]
        );

        console.log('Database seeded successfully!');
        console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
