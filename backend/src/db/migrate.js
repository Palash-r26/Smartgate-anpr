async function runMigrations(pool) {
    const vehicleColumns = [
        ['vehicle_type', "VARCHAR(30) DEFAULT 'Unknown'"],
        ['vehicle_color', "VARCHAR(30) DEFAULT 'Unknown'"],
        ['plate_type', "VARCHAR(30) DEFAULT 'Standard'"],
        ['department', "VARCHAR(80) DEFAULT NULL"],
        ['phone', "VARCHAR(20) DEFAULT NULL"],
        ['email', "VARCHAR(120) DEFAULT NULL"],
        ['make', "VARCHAR(50) DEFAULT NULL"],
        ['model', "VARCHAR(50) DEFAULT NULL"],
        ['notes', "TEXT DEFAULT NULL"],
    ];

    for (const [name, definition] of vehicleColumns) {
        try {
            await pool.query(`ALTER TABLE vehicles ADD COLUMN ${name} ${definition}`);
            console.log(`  + vehicles.${name}`);
        } catch {
            // already exists
        }
    }

    const logColumns = [
        ['owner_name', "VARCHAR(100) DEFAULT 'Unknown'"],
        ['designation', "VARCHAR(80) DEFAULT 'Visitor'"],
        ['department', "VARCHAR(80) DEFAULT NULL"],
        ['vehicle_type', "VARCHAR(30) DEFAULT 'Unknown'"],
        ['vehicle_color', "VARCHAR(30) DEFAULT 'Unknown'"],
        ['plate_type', "VARCHAR(30) DEFAULT 'Unknown'"],
        ['make', "VARCHAR(50) DEFAULT NULL"],
        ['model', "VARCHAR(50) DEFAULT NULL"],
        ['phone', "VARCHAR(20) DEFAULT NULL"],
        ['email', "VARCHAR(120) DEFAULT NULL"],
        ['match_type', "VARCHAR(20) DEFAULT 'none'"],
        ['verification', "VARCHAR(20) DEFAULT 'VERIFIED'"],
    ];

    for (const [name, definition] of logColumns) {
        try {
            await pool.query(`ALTER TABLE access_logs ADD COLUMN ${name} ${definition}`);
            console.log(`  + access_logs.${name}`);
        } catch {
            // already exists
        }
    }
}

module.exports = { runMigrations };
