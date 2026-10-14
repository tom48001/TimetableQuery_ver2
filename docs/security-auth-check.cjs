// Run the current regression suite (the historical vulnerability probe is retired).
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const result = spawnSync(process.execPath, ['--test', 'test/sessionSecurity.test.js'], { cwd: path.join(__dirname, '../server'), stdio: 'inherit' });
process.exit(result.status ?? 1);
