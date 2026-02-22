const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../app');
const { pool } = require('../utils/db');

after(async () => {
  await pool.end();
});

test('API integration smoke: auth -> refresh -> protected flows', async () => {
  const base = '/api/v1';

  const health = await request(app).get(`${base}/health`);
  assert.equal(health.statusCode, 200);
  assert.equal(health.body.ok, true);

  const login = await request(app).post(`${base}/auth/login`).send({
    email: 'kauai@trainforge.local',
    password: 'password'
  });

  assert.equal(login.statusCode, 200);
  assert.equal(login.body.ok, true);
  assert.ok(login.body.accessToken);
  assert.ok(login.body.refreshToken);

  let accessToken = login.body.accessToken;
  let refreshToken = login.body.refreshToken;
  let challengeId = null;
  let studentId = null;
  let serviceId = null;
  let requestId = null;
  let ticketId = null;

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  const me = await request(app).get(`${base}/auth/me`).set(auth());
  assert.equal(me.statusCode, 200);
  assert.equal(me.body.ok, true);

  const refresh = await request(app).post(`${base}/auth/refresh`).send({ refreshToken });
  assert.equal(refresh.statusCode, 200);
  assert.equal(refresh.body.ok, true);
  accessToken = refresh.body.accessToken;
  refreshToken = refresh.body.refreshToken;

  const usersMe = await request(app).get(`${base}/users/me`).set(auth());
  assert.equal(usersMe.statusCode, 200);
  assert.equal(usersMe.body.ok, true);

  const usersHistory = await request(app).get(`${base}/users/me/history`).set(auth());
  assert.equal(usersHistory.statusCode, 200);
  assert.equal(usersHistory.body.ok, true);

  const usersSupport = await request(app).get(`${base}/users/me/support`).set(auth());
  assert.equal(usersSupport.statusCode, 200);
  assert.equal(usersSupport.body.ok, true);

  const usersList = await request(app).get(`${base}/users?role=client`).set(auth());
  assert.equal(usersList.statusCode, 200);
  assert.equal(usersList.body.ok, true);

  const challenges = await request(app).get(`${base}/challenges`).set(auth());
  assert.equal(challenges.statusCode, 200);
  assert.equal(challenges.body.ok, true);
  assert.ok(Array.isArray(challenges.body.data));
  challengeId = challenges.body.data[0]?.id ?? null;

  if (challengeId) {
    const ranking = await request(app).get(`${base}/challenges/${challengeId}/ranking?top=3`).set(auth());
    assert.equal(ranking.statusCode, 200);
    assert.equal(ranking.body.ok, true);
    assert.ok(Array.isArray(ranking.body.data));
    studentId = ranking.body.data[0]?.id ?? null;

    const completion = await request(app)
      .post(`${base}/challenges/${challengeId}/complete`)
      .set(auth())
      .send({
        title: 'Smoke completion',
        modality: 'General',
        points: 7,
        studentId
      });
    assert.equal(completion.statusCode, 201);
    assert.equal(completion.body.ok, true);
  }

  const workoutsLeaderboard = await request(app).get(`${base}/workouts/leaderboard`).set(auth());
  assert.equal(workoutsLeaderboard.statusCode, 200);
  assert.equal(workoutsLeaderboard.body.ok, true);
  studentId = studentId || workoutsLeaderboard.body.data?.[0]?.id || null;

  const workoutsMetrics = await request(app).get(`${base}/workouts/metrics`).set(auth());
  assert.equal(workoutsMetrics.statusCode, 200);
  assert.equal(workoutsMetrics.body.ok, true);

  const workoutsHistory = await request(app).get(`${base}/workouts/history`).set(auth());
  assert.equal(workoutsHistory.statusCode, 200);
  assert.equal(workoutsHistory.body.ok, true);

  const workoutCreate = await request(app)
    .post(`${base}/workouts`)
    .set(auth())
    .send({
      title: 'Smoke workout',
      modality: 'Cycling',
      durationMinutes: 25,
      calories: 210,
      points: 9,
      studentId
    });
  assert.equal(workoutCreate.statusCode, 201);
  assert.equal(workoutCreate.body.ok, true);

  const catalog = await request(app).get(`${base}/services/catalog`).set(auth());
  assert.equal(catalog.statusCode, 200);
  assert.equal(catalog.body.ok, true);
  serviceId = catalog.body.data?.[0]?.id ?? null;

  const catalogCreate = await request(app)
    .post(`${base}/services/catalog`)
    .set(auth())
    .send({
      name: 'Smoke Service',
      description: 'Created by integration test',
      isActive: true
    });
  assert.equal(catalogCreate.statusCode, 201);
  assert.equal(catalogCreate.body.ok, true);
  serviceId = serviceId || catalogCreate.body.data?.id || null;

  if (serviceId) {
    const toggle = await request(app)
      .patch(`${base}/services/catalog/${serviceId}/toggle`)
      .set(auth())
      .send({ isActive: true });
    assert.equal(toggle.statusCode, 200);
    assert.equal(toggle.body.ok, true);
  }

  if (serviceId) {
    const requestCreate = await request(app)
      .post(`${base}/services/requests`)
      .set(auth())
      .send({
        serviceId,
        notes: 'Smoke request'
      });
    assert.equal(requestCreate.statusCode, 201);
    assert.equal(requestCreate.body.ok, true);
    requestId = requestCreate.body.data?.id ?? null;
  }

  const requestsList = await request(app).get(`${base}/services/requests`).set(auth());
  assert.equal(requestsList.statusCode, 200);
  assert.equal(requestsList.body.ok, true);
  requestId = requestId || requestsList.body.data?.[0]?.id || null;

  if (requestId) {
    const requestStatus = await request(app)
      .patch(`${base}/services/requests/${requestId}/status`)
      .set(auth())
      .send({ status: 'in_progress' });
    assert.equal(requestStatus.statusCode, 200);
    assert.equal(requestStatus.body.ok, true);
  }

  if (studentId) {
    const quoteCreate = await request(app)
      .post(`${base}/services/quotes`)
      .set(auth())
      .send({
        userId: studentId,
        serviceRequestId: requestId,
        budgetEstimate: 59.9,
        notes: 'Smoke quote'
      });
    assert.equal(quoteCreate.statusCode, 201);
    assert.equal(quoteCreate.body.ok, true);
  }

  const quotesList = await request(app).get(`${base}/services/quotes`).set(auth());
  assert.equal(quotesList.statusCode, 200);
  assert.equal(quotesList.body.ok, true);

  const feedbackCreate = await request(app)
    .post(`${base}/feedback`)
    .set(auth())
    .send({
      subject: 'Smoke feedback',
      message: 'Integration test feedback',
      rating: 5
    });
  assert.equal(feedbackCreate.statusCode, 201);
  assert.equal(feedbackCreate.body.ok, true);

  const feedbackList = await request(app).get(`${base}/feedback`).set(auth());
  assert.equal(feedbackList.statusCode, 200);
  assert.equal(feedbackList.body.ok, true);

  const tickets = await request(app).get(`${base}/support/tickets`).set(auth());
  assert.equal(tickets.statusCode, 200);
  assert.equal(tickets.body.ok, true);

  const ticketCreate = await request(app)
    .post(`${base}/support/tickets`)
    .set(auth())
    .send({
      subject: 'Smoke ticket',
      message: 'Open from integration test',
      category: 'QUESTION',
      priority: 'LOW'
    });
  assert.equal(ticketCreate.statusCode, 201);
  assert.equal(ticketCreate.body.ok, true);
  ticketId = ticketCreate.body.data?.id ?? null;

  if (ticketId) {
    const timeline = await request(app).get(`${base}/support/tickets/${ticketId}/timeline`).set(auth());
    assert.equal(timeline.statusCode, 200);
    assert.equal(timeline.body.ok, true);

    const message = await request(app)
      .post(`${base}/support/tickets/${ticketId}/messages`)
      .set(auth())
      .send({ message: 'Smoke ticket message' });
    assert.equal(message.statusCode, 201);
    assert.equal(message.body.ok, true);

    const status = await request(app)
      .patch(`${base}/support/tickets/${ticketId}/status`)
      .set(auth())
      .send({ status: 'in_progress' });
    assert.equal(status.statusCode, 200);
    assert.equal(status.body.ok, true);
  }

  const branding = await request(app).get(`${base}/branding/yasmin-rocha`);
  assert.equal(branding.statusCode, 200);
  assert.equal(branding.body.ok, true);

  const brandingSave = await request(app)
    .post(`${base}/branding`)
    .set(auth())
    .send({
      display_name: 'TrainForge Internal',
      studio_name: 'TrainForge HQ',
      primary_color: '#2563eb',
      secondary_color: '#7c3aed'
    });
  assert.equal(brandingSave.statusCode, 200);
  assert.equal(brandingSave.body.ok, true);

  const landing = await request(app).get(`${base}/landing/yasmin-rocha`);
  assert.equal(landing.statusCode, 200);
  assert.equal(landing.body.ok, true);

  const tenants = await request(app).get(`${base}/tenants`).set(auth());
  assert.equal(tenants.statusCode, 200);
  assert.equal(tenants.body.ok, true);

  const now = Date.now();
  const newTenant = await request(app)
    .post(`${base}/tenants`)
    .set(auth())
    .send({
      type: 'PERSONAL',
      name: `Smoke Tenant ${now}`,
      slug: `smoke-tenant-${now}`,
      email: `smoke-${now}@trainforge.local`,
      phone: '+351900000099',
      status: 'TRIAL'
    });
  assert.equal(newTenant.statusCode, 201);
  assert.equal(newTenant.body.ok, true);

  const adminOverview = await request(app).get(`${base}/admin/overview`).set(auth());
  assert.equal(adminOverview.statusCode, 200);
  assert.equal(adminOverview.body.ok, true);

  const adminRankings = await request(app).get(`${base}/admin/rankings`).set(auth());
  assert.equal(adminRankings.statusCode, 200);
  assert.equal(adminRankings.body.ok, true);

  const tenantsKpis = await request(app).get(`${base}/admin/tenants-kpis`).set(auth());
  assert.equal(tenantsKpis.statusCode, 200);
  assert.equal(tenantsKpis.body.ok, true);

  const billingOverview = await request(app).get(`${base}/admin/billing/overview`).set(auth());
  assert.equal(billingOverview.statusCode, 200);
  assert.equal(billingOverview.body.ok, true);

  const logoutAll = await request(app).post(`${base}/auth/logout-all`).set(auth());
  assert.equal(logoutAll.statusCode, 200);
  assert.equal(logoutAll.body.ok, true);

  const afterLogoutAll = await request(app).get(`${base}/auth/me`).set(auth());
  assert.equal(afterLogoutAll.statusCode, 200);
});
