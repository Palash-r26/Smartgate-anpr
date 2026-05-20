const pool = require('../db/connection');

const getStats = async (req, res) => {
    try {
        const [totalLogs] = await pool.query('SELECT COUNT(*) as count FROM access_logs');
        const [todayLogs] = await pool.query('SELECT COUNT(*) as count FROM access_logs WHERE DATE(timestamp) = CURDATE()');
        const [registered] = await pool.query('SELECT COUNT(*) as count FROM vehicles');
        
        // Mocking special armed vehicles since we don't have a column for it, or we use designation
        const [special] = await pool.query("SELECT COUNT(*) as count FROM vehicles WHERE designation LIKE '%Armed%' OR designation LIKE '%Police%'");

        res.json({
            total: totalLogs[0].count,
            today: todayLogs[0].count,
            registered: registered[0].count,
            special: special[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT a.log_id, a.plate_number, a.timestamp, a.status, a.confidence, 
                   IFNULL(v.owner_name, 'Visitor') as owner_name,
                   IFNULL(v.designation, 'Visitor') as designation
            FROM access_logs a
            LEFT JOIN vehicles v ON a.plate_number = v.plate_number
            ORDER BY a.timestamp DESC
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
        const { plate_number, owner_name, designation } = req.body;
        
        const cleanPlate = (plate_number || '').trim().replace(/\s+/g, '');
        const cleanOwner = (owner_name || '').trim();
        const cleanDesignation = (designation || '').trim();

        await pool.query(
            'INSERT INTO vehicles (plate_number, owner_name, designation) VALUES (?, ?, ?)',
            [cleanPlate, cleanOwner, cleanDesignation]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStats, getLogs, getVehicles, addVehicle };
