const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../backend/app');

test('GET /api/v1/challenges requires auth token', async () => {
  const response = await request(app).get('/api/v1/challenges');

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.ok, false);
});
