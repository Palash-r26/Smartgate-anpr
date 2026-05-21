const pool = require('../db/connection');
const { getIo } = require('../socket/events');
const { findVehicleByPlate } = require('../utils/plateMatch');
const { buildScanRecord } = require('../utils/scanPayload');

const DEDUP_SECONDS = Number(process.env.PLATE_DEDUP_SECONDS) || 30;

const handlePlateScan = async (req, res) => {
    try {
        let { plate, confidence, verification, ...vision } = req.body;

        if (!plate || confidence === undefined) {
            return res.status(400).json({ error: 'Missing plate or confidence' });
        }

        plate = plate.trim().replace(/\s+/g, '').toUpperCase();
        const verificationStatus = verification === 'UNVERIFIED' ? 'UNVERIFIED' : 'VERIFIED';

        console.log(`📡 Scan: ${plate} | type=${vision.vehicle_type || '?'} | color=${vision.vehicle_color || '?'}`);

        const [recent] = await pool.execute(
            `SELECT log_id FROM access_logs
             WHERE plate_number = ? AND timestamp > DATE_SUB(NOW(), INTERVAL ? SECOND)
             ORDER BY timestamp DESC LIMIT 1`,
            [plate, DEDUP_SECONDS]
        );

        if (recent.length > 0) {
            return res.status(200).json({
                success: true,
                duplicate: true,
                message: 'Plate logged recently, skipped duplicate',
            });
        }

        const [allVehicles] = await pool.execute(
            'SELECT * FROM vehicles WHERE is_active = 1'
        );

        const { vehicle, matchType } = findVehicleByPlate(allVehicles, plate);

        let status = vehicle ? 'ALLOWED' : 'DENIED';
        if (verificationStatus === 'UNVERIFIED') {
            status = 'DENIED';
        }

        const resultData = buildScanRecord(
            plate,
            vehicle,
            vision,
            matchType,
            status,
            confidence,
            verificationStatus
        );

        if (verificationStatus === 'UNVERIFIED') {
            resultData.designation = 'Unverified OCR';
        }

        await pool.execute(
            `INSERT INTO access_logs (
                plate_number, status, confidence, verification,
                owner_name, designation, department,
                vehicle_type, vehicle_color, plate_type,
                make, model, phone, email, match_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                plate,
                status,
                confidence,
                verificationStatus,
                resultData.owner_name,
                resultData.designation,
                resultData.department || null,
                resultData.vehicle_type,
                resultData.vehicle_color,
                resultData.plate_type,
                resultData.make === '—' ? null : resultData.make,
                resultData.model === '—' ? null : resultData.model,
                resultData.phone === '—' ? null : resultData.phone,
                resultData.email === '—' ? null : resultData.email,
                matchType,
            ]
        );

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
    handlePlateScan,
};
