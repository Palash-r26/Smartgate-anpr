function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[m][n];
}

function findVehicleByPlate(vehicles, plate, maxDistance = 2) {
    const exact = vehicles.find((v) => v.plate_number === plate);
    if (exact) {
        return { vehicle: exact, matchType: 'exact' };
    }

    let best = null;
    let bestDistance = Infinity;

    for (const vehicle of vehicles) {
        const distance = levenshtein(plate, vehicle.plate_number);
        if (distance <= maxDistance && distance < bestDistance) {
            best = vehicle;
            bestDistance = distance;
        }
    }

    if (best) {
        return { vehicle: best, matchType: 'fuzzy', distance: bestDistance };
    }

    return { vehicle: null, matchType: 'none' };
}

module.exports = { levenshtein, findVehicleByPlate };
