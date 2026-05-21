function buildScanRecord(plate, vehicle, vision, matchType, status, confidence, verification) {
    const registered = Boolean(vehicle);

    return {
        plate,
        status,
        confidence,
        verification,
        match_type: matchType,
        owner: registered ? vehicle.owner_name : 'Unknown',
        owner_name: registered ? vehicle.owner_name : 'Unknown',
        designation: registered ? vehicle.designation : (vision.designation || 'Visitor'),
        department: registered ? (vehicle.department || vehicle.designation) : (vision.department || '—'),
        vehicle_type:
            (vision.vehicle_type && vision.vehicle_type !== 'Unknown')
                ? vision.vehicle_type
                : (vehicle?.vehicle_type || vision.vehicle_type || 'Unknown'),
        vehicle_color:
            (vision.vehicle_color && vision.vehicle_color !== 'Unknown')
                ? vision.vehicle_color
                : (vehicle?.vehicle_color || vision.vehicle_color || 'Unknown'),
        plate_type:
            (vision.plate_type && vision.plate_type !== 'Unknown')
                ? vision.plate_type
                : (vehicle?.plate_type || vision.plate_type || 'Standard'),
        make: vehicle?.make || vision.make || '—',
        model: vehicle?.model || vision.model || '—',
        phone: vehicle?.phone || '—',
        email: vehicle?.email || '—',
        notes: vehicle?.notes || null,
        timestamp: new Date().toISOString(),
    };
}

module.exports = { buildScanRecord };
