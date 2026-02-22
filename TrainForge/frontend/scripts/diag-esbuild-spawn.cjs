const { spawnSync } = require('node:child_process');
const path = require('node:path');

const exe = path.join(__dirname, '..', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
console.log('exe:', exe);

const res = spawnSync(exe, ['--version'], { encoding: 'utf8' });
console.log('status:', res.status);
console.log('signal:', res.signal);
console.log('error:', res.error ? { code: res.error.code, errno: res.error.errno, syscall: res.error.syscall, message: res.error.message } : null);
console.log('stdout:', (res.stdout || '').trim());
console.log('stderr:', (res.stderr || '').trim());
