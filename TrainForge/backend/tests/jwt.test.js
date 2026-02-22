const test = require('node:test');
const assert = require('node:assert/strict');

const { signAccessToken, verifyAccessToken } = require('../utils/jwt');

test('JWT access token should be signed and verified', async () => {
  const user = { id: 99, role: 'client', email: 'client@trainforge.local', full_name: 'Client Test' };
  const token = signAccessToken(user, 'session-token-test');

  const payload = verifyAccessToken(token);
  assert.equal(payload.sub, 99);
  assert.equal(payload.role, 'client');
  assert.equal(payload.sid, 'session-token-test');
});
