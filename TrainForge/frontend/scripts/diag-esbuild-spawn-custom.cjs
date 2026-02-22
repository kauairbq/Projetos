const { spawnSync } = require("node:child_process");
const path = require("node:path");

const exe = path.join(__dirname, "..", ".tmp", "esbuild.exe");
console.log('exe:', exe);
const res = spawnSync(exe, ['--version'], { encoding: 'utf8' });
console.log('status:', res.status);
console.log('error:', res.error ? { code: res.error.code, message: res.error.message } : null);
console.log('stdout:', (res.stdout || '').trim());
console.log('stderr:', (res.stderr || '').trim());
