const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../../backend/app');

test('POST /api/v1/auth/login returns validation error when missing credentials', async () => {
  const response = await request(app).post('/api/v1/auth/login').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.ok, false);
});
