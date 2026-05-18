const pool = require('../db/connection');
const { getIo } = require('../socket/events');

const handlePlateScan = async (req, res) => {
    try {
        const { plate, confidence } = req.body;
        
        if (!plate || confidence === undefined) {
            return res.status(400).json({ error: 'Missing plate or confidence' });
        }

        console.log(`📡 Received plate scan: ${plate} (Confidence: ${confidence})`);

        // Check if plate exists in vehicles table
        const [vehicles] = await pool.execute(
            'SELECT * FROM vehicles WHERE plate_number = ? AND is_active = 1',
            [plate]
        );

        let status = 'DENIED';
        let owner = 'Unknown';
        let designation = 'None';

        if (vehicles.length > 0) {
            status = 'ALLOWED';
            owner = vehicles[0].owner_name;
            designation = vehicles[0].designation;
        }

        // Insert into access_logs
        await pool.execute(
            'INSERT INTO access_logs (plate_number, status, confidence) VALUES (?, ?, ?)',
            [plate, status, confidence]
        );

        const resultData = {
            plate,
            status,
            confidence,
            owner,
            designation,
            timestamp: new Date().toISOString()
        };

        // Emit Socket.IO event for frontend
        const io = getIo();
        if (io) {
            io.emit('newScan', resultData);
        }

        res.status(200).json({ success: true, data: resultData });

    } catch (error) {
        console.error('❌ Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    handlePlateScan
};
