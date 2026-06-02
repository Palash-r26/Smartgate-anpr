const fs = require('fs');
const path = require('path');

const dirsToSearch = [
  'C:\\Users\\sarve\\Documents',
  'C:\\Users\\sarve\\Downloads',
  'C:\\Users\\sarve\\Desktop'
];

function searchDirectory(dir, depth = 0) {
    if (depth > 4) return;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stats;
            try {
                stats = fs.statSync(fullPath);
            } catch (err) {
                continue;
            }
            if (stats.isDirectory()) {
                if (file === 'node_modules' || file === '.git' || file === 'venv' || file === '.next' || file === 'AppData' || file === 'Microsoft') {
                    continue;
                }
                searchDirectory(fullPath, depth + 1);
            } else if (file.toLowerCase().includes('.env') || file.toLowerCase().includes('properties') || file.toLowerCase().includes('config') || file.toLowerCase().includes('settings.py')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('PASSWORD') || content.includes('password') || content.includes('DB_') || content.includes('mysql')) {
                        console.log(`File: ${fullPath}`);
                        const lines = content.split('\n');
                        for (const line of lines) {
                            if (/pass|pwd|user|host|db|port/i.test(line)) {
                                console.log(`  ${line.trim()}`);
                            }
                        }
                    }
                } catch (e) {
                    // Ignore read errors
                }
            }
        }
    } catch (e) {
        // Ignore read errors
    }
}

for (const d of dirsToSearch) {
    console.log(`Searching directory: ${d}`);
    searchDirectory(d);
}
