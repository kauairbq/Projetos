const { query } = require('../utils/db');

async function runBillingCycle() {
  const [overdueBefore] = await query(
    `SELECT COUNT(*) AS total
     FROM invoices
     WHERE status = 'OVERDUE'`
  );

  await query(
    `UPDATE invoices
     SET status = 'OVERDUE'
     WHERE status = 'OPEN' AND due_date < CURDATE()`
  );

  await query(
    `UPDATE subscriptions s
     JOIN invoices i ON i.subscription_id = s.id
     SET
       s.status = 'PAST_DUE',
       s.grace_until = COALESCE(s.grace_until, DATE_ADD(i.due_date, INTERVAL 5 DAY))
     WHERE i.status = 'OVERDUE'
       AND s.status IN ('ACTIVE', 'TRIAL', 'PAST_DUE')`
  );

  await query(
    `INSERT INTO access_blocks (tenant_id, reason, blocked_at, note)
     SELECT s.tenant_id, 'PAST_DUE', NOW(), 'Automatic block after grace period'
     FROM subscriptions s
     LEFT JOIN access_blocks ab
       ON ab.tenant_id = s.tenant_id
      AND ab.unblocked_at IS NULL
     WHERE s.status = 'PAST_DUE'
       AND s.grace_until IS NOT NULL
       AND s.grace_until < CURDATE()
       AND ab.id IS NULL`
  );

  await query(
    `UPDATE subscriptions s
     JOIN access_blocks ab ON ab.tenant_id = s.tenant_id AND ab.unblocked_at IS NULL
     SET s.status = 'SUSPENDED'
     WHERE s.status = 'PAST_DUE'`
  );

  const [overdueAfter] = await query(
    `SELECT COUNT(*) AS total
     FROM invoices
     WHERE status = 'OVERDUE'`
  );

  const [blockedTenants] = await query(
    `SELECT COUNT(DISTINCT tenant_id) AS total
     FROM access_blocks
     WHERE unblocked_at IS NULL`
  );

  return {
    overdue_before: Number(overdueBefore?.total || 0),
    overdue_after: Number(overdueAfter?.total || 0),
    blocked_tenants: Number(blockedTenants?.total || 0)
  };
}

async function confirmPayment(payload) {
  const rows = await query(
    `SELECT i.*, s.id AS subscription_id
     FROM invoices i
     JOIN subscriptions s ON s.id = i.subscription_id
     WHERE i.id = ?
     LIMIT 1`,
    [payload.invoice_id]
  );

  const invoice = rows[0];
  if (!invoice) return null;

  await query(
    `INSERT INTO payments (invoice_id, provider, method, provider_ref, amount, currency, status, confirmed_at)
     VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', NOW())`,
    [
      invoice.id,
      payload.provider || 'MANUAL',
      payload.method || 'BANK_TRANSFER',
      payload.provider_ref || null,
      payload.amount || invoice.amount,
      invoice.currency
    ]
  );

  await query(
    `UPDATE invoices
     SET status = 'PAID', paid_at = NOW()
     WHERE id = ?`,
    [invoice.id]
  );

  await query(
    `UPDATE subscriptions
     SET status = 'ACTIVE', grace_until = NULL
     WHERE id = ?`,
    [invoice.subscription_id]
  );

  await query(
    `UPDATE access_blocks
     SET unblocked_at = NOW(), note = 'Automatic unblock after payment confirmation'
     WHERE tenant_id = ? AND unblocked_at IS NULL`,
    [invoice.tenant_id]
  );

  const [updatedInvoice] = await query(
    `SELECT *
     FROM invoices
     WHERE id = ?
     LIMIT 1`,
    [invoice.id]
  );

  return updatedInvoice || null;
}

async function billingOverviewByTenant() {
  return query(
    `SELECT
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.slug AS tenant_slug,
        s.status AS subscription_status,
        s.grace_until,
        bp.code AS plan_code,
        bp.monthly_fee,
        (
          SELECT COALESCE(SUM(i.amount), 0)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status IN ('OPEN', 'OVERDUE')
        ) AS open_amount,
        (
          SELECT COUNT(*)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status IN ('OPEN', 'OVERDUE')
        ) AS open_invoices,
        (
          SELECT COALESCE(MAX(i.currency), 'EUR')
          FROM invoices i
          WHERE i.tenant_id = t.id
          ORDER BY i.created_at DESC
          LIMIT 1
        ) AS currency,
        (
          SELECT COUNT(*)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status = 'OVERDUE'
        ) AS overdue_invoices
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     LEFT JOIN billing_plans bp ON bp.id = s.plan_id
     ORDER BY t.created_at DESC`
  );
}

async function listActivePlans() {
  return query(
    `SELECT id, code, name, currency, setup_fee, monthly_fee, is_active
     FROM billing_plans
     WHERE is_active = 1
     ORDER BY monthly_fee ASC, name ASC`
  );
}

async function getTenantSubscriptionSummary(tenantId) {
  const rows = await query(
    `SELECT
        s.id AS subscription_id,
        s.status AS subscription_status,
        s.started_at,
        s.trial_ends_at,
        s.current_period_start,
        s.current_period_end,
        s.grace_until,
        bp.id AS plan_id,
        bp.code AS plan_code,
        bp.name AS plan_name,
        bp.currency,
        bp.setup_fee,
        bp.monthly_fee
     FROM subscriptions s
     JOIN billing_plans bp ON bp.id = s.plan_id
     WHERE s.tenant_id = ?
     ORDER BY s.started_at DESC
     LIMIT 1`,
    [tenantId]
  );

  const current = rows[0] || null;

  const invoices = await query(
    `SELECT id, amount, currency, due_date, status, paid_at, created_at
     FROM invoices
     WHERE tenant_id = ? AND status IN ('OPEN', 'OVERDUE')
     ORDER BY due_date ASC
     LIMIT 1`,
    [tenantId]
  );

  const nextInvoice = invoices[0] || null;

  return {
    subscription: current
      ? {
          id: current.subscription_id,
          status: current.subscription_status,
          started_at: current.started_at,
          trial_ends_at: current.trial_ends_at,
          current_period_start: current.current_period_start,
          current_period_end: current.current_period_end,
          grace_until: current.grace_until
        }
      : null,
    plan: current
      ? {
          id: current.plan_id,
          code: current.plan_code,
          name: current.plan_name,
          currency: current.currency,
          setup_fee: Number(current.setup_fee || 0),
          monthly_fee: Number(current.monthly_fee || 0)
        }
      : null,
    next_invoice: nextInvoice
      ? {
          id: nextInvoice.id,
          amount: Number(nextInvoice.amount || 0),
          currency: nextInvoice.currency,
          due_date: nextInvoice.due_date,
          status: nextInvoice.status,
          paid_at: nextInvoice.paid_at,
          created_at: nextInvoice.created_at
        }
      : null
  };
}

async function requestPlanUpgrade(tenantId, planCode) {
  const plans = await query(
    `SELECT id, code
     FROM billing_plans
     WHERE code = ? AND is_active = 1
     LIMIT 1`,
    [planCode]
  );
  const plan = plans[0];
  if (!plan) return null;

  const subs = await query(
    `SELECT id
     FROM subscriptions
     WHERE tenant_id = ?
     ORDER BY started_at DESC
     LIMIT 1`,
    [tenantId]
  );

  const existing = subs[0] || null;

  if (!existing) {
    const created = await query(
      `INSERT INTO subscriptions (
          tenant_id, plan_id, status, started_at, trial_ends_at,
          current_period_start, current_period_end, grace_until
       ) VALUES (?, ?, 'TRIAL', NOW(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL)`,
      [tenantId, plan.id]
    );
    return { subscription_id: created.insertId, plan_id: plan.id, plan_code: plan.code };
  }

  await query(
    `UPDATE subscriptions
     SET plan_id = ?, updated_at = NOW()
     WHERE id = ?`,
    [plan.id, existing.id]
  );

  return { subscription_id: existing.id, plan_id: plan.id, plan_code: plan.code };
}

module.exports = {
  runBillingCycle,
  confirmPayment,
  billingOverviewByTenant,
  listActivePlans,
  getTenantSubscriptionSummary,
  requestPlanUpgrade
};
