const pool = require('../db/connection');

const getStats = async (req, res) => {
    try {
        const [totalLogs] = await pool.query('SELECT COUNT(*) as count FROM access_logs');
        const [todayLogs] = await pool.query('SELECT COUNT(*) as count FROM access_logs WHERE DATE(timestamp) = CURDATE()');
        const [registered] = await pool.query('SELECT COUNT(*) as count FROM vehicles');
        const [special] = await pool.query(
            "SELECT COUNT(*) as count FROM vehicles WHERE designation LIKE '%Armed%' OR designation LIKE '%Police%' OR vehicle_type IN ('Bus', 'Truck')"
        );

        res.json({
            total: totalLogs[0].count,
            today: todayLogs[0].count,
            registered: registered[0].count,
            special: special[0].count,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT
                log_id,
                plate_number,
                timestamp,
                status,
                confidence,
                verification,
                owner_name,
                designation,
                department,
                vehicle_type,
                vehicle_color,
                plate_type,
                make,
                model,
                phone,
                email,
                match_type
            FROM access_logs
            ORDER BY timestamp DESC
            LIMIT 100
        `);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVehicles = async (req, res) => {
    try {
        const [vehicles] = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addVehicle = async (req, res) => {
    try {
        const {
            plate_number,
            owner_name,
            designation,
            department,
            vehicle_type,
            vehicle_color,
            plate_type,
            phone,
            email,
            make,
            model,
            notes,
        } = req.body;

        const cleanPlate = (plate_number || '').trim().replace(/\s+/g, '').toUpperCase();

        await pool.query(
            `INSERT INTO vehicles (
                plate_number, owner_name, designation, department,
                vehicle_type, vehicle_color, plate_type,
                phone, email, make, model, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cleanPlate,
                (owner_name || '').trim(),
                (designation || 'Visitor').trim(),
                (department || '').trim() || null,
                (vehicle_type || 'Car').trim(),
                (vehicle_color || 'Unknown').trim(),
                (plate_type || 'Standard').trim(),
                (phone || '').trim() || null,
                (email || '').trim() || null,
                (make || '').trim() || null,
                (model || '').trim() || null,
                (notes || '').trim() || null,
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStats, getLogs, getVehicles, addVehicle };
