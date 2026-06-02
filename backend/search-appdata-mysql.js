const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA || 'C:\\Users\\sarve\\AppData\\Roaming';
const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\sarve\\AppData\\Local';

const dirs = [
  path.join(appData, 'MySQL'),
  path.join(localAppData, 'MySQL'),
];

function searchFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return;
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
        searchFiles(fullPath);
      } else if (file.endsWith('.xml') || file.endsWith('.ini') || file.endsWith('.json') || file.endsWith('.cfg')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('password') || content.includes('pass') || content.includes('root')) {
            console.log(`Found file: ${fullPath}`);
            const lines = content.split('\n');
            for (const line of lines) {
              if (/pass|pwd|user|host/i.test(line)) {
                console.log(`  ${line.trim().substring(0, 150)}`);
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (err) {
    // ignore
  }
}

for (const d of dirs) {
  searchFiles(d);
}
