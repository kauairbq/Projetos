const { query } = require('../utils/db');

function monthKey(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(dt) {
  // pt-PT abbreviated month + year
  return dt.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toPct(numerator, denominator) {
  const n = toNumber(numerator);
  const d = toNumber(denominator);
  if (d <= 0) return 0;
  return Number(((n / d) * 100).toFixed(1));
}

async function overview(tenantId) {
  const [staffRows, studentsRows, activeRows, pendingRows, ticketsRows] = await Promise.all([
    query(
      `SELECT role, COUNT(*) AS total
       FROM tenant_users
       WHERE tenant_id = ?
       GROUP BY role`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM students
       WHERE tenant_id = ?`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM weekly_challenges
       WHERE tenant_id = ? AND is_active = 1`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM service_requests
       WHERE tenant_id = ? AND status IN ('pending', 'approved', 'in_progress')`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM support_tickets
       WHERE tenant_id = ? AND status IN ('open', 'in_progress')`,
      [tenantId]
    )
  ]);

  const usersByRole = [];
  let adminTotal = 0;
  let trainerTotal = 0;

  for (const row of staffRows) {
    if (row.role === 'MASTER_ADMIN') adminTotal += Number(row.total);
    if (row.role === 'GYM_STAFF' || row.role === 'PERSONAL') trainerTotal += Number(row.total);
  }

  usersByRole.push({ role: 'admin', total: adminTotal });
  usersByRole.push({ role: 'trainer', total: trainerTotal });
  usersByRole.push({ role: 'client', total: Number(studentsRows[0]?.total || 0) });

  return {
    users_by_role: usersByRole,
    active_challenges: Number(activeRows[0]?.total || 0),
    pending_requests: Number(pendingRows[0]?.total || 0),
    open_tickets: Number(ticketsRows[0]?.total || 0)
  };
}

async function masterOverview() {
  const [tenantRows, revenueThisRows, revenueLastRows, overdueRows, pendingRows, activeSubsRows, ticketsRows] =
    await Promise.all([
      query('SELECT COUNT(*) AS total FROM tenants'),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM invoices
         WHERE status = 'PAID'
           AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
           AND paid_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM invoices
         WHERE status = 'PAID'
           AND paid_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
           AND paid_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')`
      ),
      query(`SELECT COUNT(*) AS total FROM invoices WHERE status = 'OVERDUE'`),
      query(`SELECT COUNT(*) AS total FROM invoices WHERE status IN ('OPEN', 'OVERDUE')`),
      query(`SELECT COUNT(*) AS total FROM subscriptions WHERE status IN ('ACTIVE', 'TRIAL')`),
      query(`SELECT COUNT(*) AS total FROM support_tickets WHERE status IN ('open', 'in_progress')`)
    ]);

  const revenueThis = Number(revenueThisRows[0]?.total || 0);
  const revenueLast = Number(revenueLastRows[0]?.total || 0);
  const growthPct =
    revenueLast > 0
      ? ((revenueThis - revenueLast) / revenueLast) * 100
      : revenueThis > 0
        ? 100
        : 0;

  return {
    tenants_total: Number(tenantRows[0]?.total || 0),
    tenants_active: Number(activeSubsRows[0]?.total || 0),
    revenue_paid_this_month: revenueThis,
    revenue_paid_last_month: revenueLast,
    revenue_growth_pct: Number(growthPct.toFixed(1)),
    overdue_invoices: Number(overdueRows[0]?.total || 0),
    pending_invoices: Number(pendingRows[0]?.total || 0),
    open_tickets: Number(ticketsRows[0]?.total || 0)
  };
}

async function revenueSeries({ months = 12 } = {}) {
  const m = Math.max(3, Math.min(24, Number(months) || 12));

  // Fetch 24 months so we can compute YoY for the last N.
  const rows = await query(
    `SELECT
        DATE_FORMAT(paid_at, '%Y-%m') AS ym,
        COALESCE(SUM(amount), 0) AS total
     FROM invoices
     WHERE status = 'PAID'
       AND paid_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 24 MONTH)
     GROUP BY ym
     ORDER BY ym ASC`
  );

  const map = new Map();
  for (const r of rows) {
    map.set(String(r.ym), Number(r.total || 0));
  }

  const now = new Date();
  const points = [];

  for (let i = m - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(dt);
    const yoyKey = monthKey(new Date(dt.getFullYear() - 1, dt.getMonth(), 1));

    points.push({
      ym: key,
      label: monthLabel(dt),
      revenue: map.get(key) || 0,
      revenue_yoy: map.get(yoyKey) || 0
    });
  }

  return points;
}

async function revenueBreakdown({ months = 12 } = {}) {
  const m = Math.max(3, Math.min(24, Number(months) || 12));

  const rows = await query(
    `SELECT
        DATE_FORMAT(i.paid_at, '%Y-%m') AS ym,
        t.type AS tenant_type,
        COALESCE(SUM(i.amount), 0) AS total
     FROM invoices i
     JOIN tenants t ON t.id = i.tenant_id
     WHERE i.status = 'PAID'
       AND i.paid_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 24 MONTH)
     GROUP BY ym, tenant_type
     ORDER BY ym ASC`
  );

  const map = new Map();
  for (const r of rows) {
    map.set(`${String(r.ym)}:${String(r.tenant_type)}`, Number(r.total || 0));
  }

  const now = new Date();
  const points = [];
  let cumulative = 0;

  for (let i = m - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(dt);

    const personal = map.get(`${key}:PERSONAL`) || 0;
    const gym = map.get(`${key}:GYM`) || 0;
    const total = personal + gym;
    cumulative += total;

    points.push({
      ym: key,
      label: monthLabel(dt),
      total,
      personal,
      gym,
      cumulative
    });
  }

  return points;
}

async function masterActivity({ limit = 10 } = {}) {
  const l = Math.max(5, Math.min(20, Number(limit) || 10));

  const [tenantRows, paymentRows, ticketRows] = await Promise.all([
    query(
      `SELECT id, type, name, slug, created_at
       FROM tenants
       ORDER BY created_at DESC
       LIMIT ${l}`
    ),
    query(
      `SELECT
          p.id,
          p.amount,
          p.currency,
          p.status,
          COALESCE(p.confirmed_at, p.created_at) AS happened_at,
          t.name AS tenant_name,
          t.slug AS tenant_slug
       FROM payments p
       JOIN invoices i ON i.id = p.invoice_id
       JOIN tenants t ON t.id = i.tenant_id
       WHERE p.status = 'CONFIRMED'
       ORDER BY happened_at DESC
       LIMIT ${l}`
    ),
    query(
      `SELECT id, tenant_id, subject, status, created_at
       FROM support_tickets
       ORDER BY created_at DESC
       LIMIT ${l}`
    )
  ]);

  const items = [];

  for (const t of tenantRows) {
    items.push({
      type: 'tenant_created',
      happened_at: t.created_at,
      title: t.type === 'GYM' ? 'Novo ginasio' : 'Novo personal',
      subtitle: `${t.name} - ${t.slug}`,
      status: 'info'
    });
  }

  for (const p of paymentRows) {
    items.push({
      type: 'payment_confirmed',
      happened_at: p.happened_at,
      title: 'Pagamento confirmado',
      subtitle: `${p.tenant_name} - ${p.amount} ${p.currency}`,
      status: 'success'
    });
  }

  for (const tk of ticketRows) {
    items.push({
      type: 'ticket_opened',
      happened_at: tk.created_at,
      title: 'Ticket aberto',
      subtitle: `#${tk.id} - ${tk.subject}`,
      status: tk.status || 'open'
    });
  }

  items.sort((a, b) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime());
  return items.slice(0, l);
}

async function tenantsKpis() {
  return query(
    `SELECT
        t.id,
        t.type,
        t.name,
        t.slug,
        t.status AS tenant_status,
        s.status AS subscription_status,
        s.current_period_end,
        s.grace_until,
        bp.code AS plan_code,
        bp.name AS plan_name,
        bp.monthly_fee,
        (
          SELECT COUNT(*)
          FROM support_tickets st
          WHERE st.tenant_id = t.id AND st.status IN ('open', 'in_progress')
        ) AS open_tickets,
        (
          SELECT COALESCE(SUM(i.amount), 0)
          FROM invoices i
          WHERE i.tenant_id = t.id
            AND i.status = 'PAID'
            AND i.paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND i.paid_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        ) AS revenue_paid_this_month,
        (
          SELECT COALESCE(SUM(i.amount), 0)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status = 'PAID'
        ) AS revenue_paid_total,
        (
          SELECT COALESCE(SUM(i.amount), 0)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status IN ('OPEN', 'OVERDUE')
        ) AS open_amount
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     LEFT JOIN billing_plans bp ON bp.id = s.plan_id
     ORDER BY t.created_at DESC`
  );
}

async function masterInsights() {
  const overviewData = await masterOverview();

  const [
    revenueByTypeRows,
    annualRevenueRows,
    mrrRows,
    churnRows,
    lifetimeRows,
    delinquencyRows,
    activeStudentsRows,
    avgRetentionRows,
    attendanceRows,
    challengeRows
  ] = await Promise.all([
    query(
      `SELECT t.type, COALESCE(SUM(i.amount), 0) AS total
       FROM invoices i
       JOIN tenants t ON t.id = i.tenant_id
       WHERE i.status = 'PAID'
         AND i.paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND i.paid_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
       GROUP BY t.type`
    ),
    query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM invoices
       WHERE status = 'PAID'
         AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-01-01')
         AND paid_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-01-01'), INTERVAL 1 YEAR)`
    ),
    query(
      `SELECT COALESCE(SUM(bp.monthly_fee), 0) AS total
       FROM subscriptions s
       JOIN billing_plans bp ON bp.id = s.plan_id
       WHERE s.status IN ('ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED')`
    ),
    query(
      `SELECT
          SUM(CASE WHEN status = 'CANCELLED'
                    AND updated_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                   THEN 1 ELSE 0 END) AS cancelled_month,
          COUNT(*) AS total
       FROM subscriptions`
    ),
    query(
      `SELECT COALESCE(AVG(DATEDIFF(CURDATE(), created_at)), 0) AS avg_days
       FROM tenants`
    ),
    query(
      `SELECT
          SUM(CASE WHEN status IN ('OPEN', 'OVERDUE') THEN 1 ELSE 0 END) AS pending_or_overdue,
          COUNT(*) AS total
       FROM invoices
       WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND created_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM students
       WHERE status = 'ACTIVE'`
    ),
    query(
      `SELECT COALESCE(AVG(retention_pct), 0) AS avg_retention_pct
       FROM (
         SELECT
           t.id,
           COALESCE(
             100 * SUM(CASE WHEN s.status = 'ACTIVE' THEN 1 ELSE 0 END) / NULLIF(COUNT(s.id), 0),
             0
           ) AS retention_pct
         FROM tenants t
         LEFT JOIN students s ON s.tenant_id = t.id
         GROUP BY t.id
       ) x`
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE a.attended_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND s.status = 'ACTIVE'`
    ),
    query(
      `SELECT COUNT(DISTINCT cal.student_id) AS total
       FROM challenge_activity_log cal
       JOIN weekly_challenges wc ON wc.id = cal.challenge_id
       JOIN students s ON s.id = cal.student_id
       WHERE cal.activity_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND s.status = 'ACTIVE'`
    )
  ]);

  const revenueByType = revenueByTypeRows.reduce(
    (acc, row) => {
      if (row.type === 'PERSONAL') acc.personal = toNumber(row.total);
      if (row.type === 'GYM') acc.gym = toNumber(row.total);
      return acc;
    },
    { personal: 0, gym: 0 }
  );

  const activeStudents = toNumber(activeStudentsRows[0]?.total);
  const attendanceWeekly = toNumber(attendanceRows[0]?.total);
  const challengeStudents = toNumber(challengeRows[0]?.total);
  const churnCancelled = toNumber(churnRows[0]?.cancelled_month);
  const churnTotal = toNumber(churnRows[0]?.total);
  const delinquencyPending = toNumber(delinquencyRows[0]?.pending_or_overdue);
  const delinquencyTotal = toNumber(delinquencyRows[0]?.total);

  const tenantSignals = await query(
    `SELECT
        t.id,
        t.name,
        t.slug,
        COALESCE((
          SELECT COUNT(*)
          FROM students s
          WHERE s.tenant_id = t.id AND s.status = 'ACTIVE'
        ), 0) AS active_students,
        COALESCE((
          SELECT COUNT(*)
          FROM attendance a
          JOIN students s ON s.id = a.student_id
          WHERE a.tenant_id = t.id
            AND a.attended_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND s.status = 'ACTIVE'
        ), 0) AS attend_7,
        COALESCE((
          SELECT COALESCE(SUM(i.amount), 0)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status IN ('OPEN', 'OVERDUE')
        ), 0) AS open_amount,
        COALESCE((
          SELECT bp.monthly_fee
          FROM subscriptions s
          JOIN billing_plans bp ON bp.id = s.plan_id
          WHERE s.tenant_id = t.id
          ORDER BY s.started_at DESC
          LIMIT 1
        ), 0) AS monthly_fee,
        COALESCE((
          SELECT COUNT(*)
          FROM invoices i
          WHERE i.tenant_id = t.id AND i.status = 'OVERDUE'
        ), 0) AS overdue_count,
        COALESCE((
          SELECT COUNT(*)
          FROM workouts w
          WHERE w.tenant_id = t.id
            AND w.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ), 0) AS workouts_7,
        COALESCE((
          SELECT COUNT(*)
          FROM workouts w
          WHERE w.tenant_id = t.id
            AND w.completed_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
            AND w.completed_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        ), 0) AS workouts_prev7
     FROM tenants t
     WHERE t.status IN ('ACTIVE', 'TRIAL', 'SUSPENDED')
     ORDER BY t.created_at DESC`
  );

  const alerts = [];
  for (const t of tenantSignals) {
    const active = toNumber(t.active_students);
    const attend7 = toNumber(t.attend_7);
    const freq = active > 0 ? attend7 / active : 0;
    const openAmount = toNumber(t.open_amount);
    const monthlyFee = toNumber(t.monthly_fee);
    const overdue = toNumber(t.overdue_count);
    const workouts7 = toNumber(t.workouts_7);
    const workoutsPrev7 = toNumber(t.workouts_prev7);

    if (overdue > 0 && openAmount >= monthlyFee && monthlyFee > 0) {
      alerts.push({
        type: 'delinquency',
        severity: 'high',
        tenant_slug: t.slug,
        title: 'Cliente com alta inadimplencia',
        detail: `${t.name}: aberto ${openAmount.toFixed(2)} EUR`
      });
    }

    if (active > 0 && freq < 0.5) {
      alerts.push({
        type: 'churn_risk',
        severity: 'medium',
        tenant_slug: t.slug,
        title: 'Cliente com risco de churn',
        detail: `${t.name}: frequencia semanal media abaixo de 0.5`
      });
    }

    if (workoutsPrev7 >= 4 && workouts7 < workoutsPrev7 * 0.5) {
      alerts.push({
        type: 'drop',
        severity: 'medium',
        tenant_slug: t.slug,
        title: 'Cliente com queda brusca de alunos',
        detail: `${t.name}: treinos ${workoutsPrev7} -> ${workouts7}`
      });
    }
  }

  return {
    revenue: {
      monthly_total: toNumber(overviewData?.revenue_paid_this_month),
      mrr: toNumber(mrrRows[0]?.total),
      by_type: revenueByType,
      growth_pct: toNumber(overviewData?.revenue_growth_pct),
      annual_accumulated: toNumber(annualRevenueRows[0]?.total)
    },
    retention: {
      churn_rate_pct: toPct(churnCancelled, churnTotal),
      avg_tenant_lifetime_days: Number(toNumber(lifetimeRows[0]?.avg_days).toFixed(1)),
      delinquency_rate_pct: toPct(delinquencyPending, delinquencyTotal)
    },
    ecosystem: {
      active_students_total: activeStudents,
      avg_retention_pct: Number(toNumber(avgRetentionRows[0]?.avg_retention_pct).toFixed(1)),
      avg_weekly_attendance: Number((activeStudents > 0 ? attendanceWeekly / activeStudents : 0).toFixed(2)),
      challenge_engagement_pct: toPct(challengeStudents, activeStudents)
    },
    alerts: alerts.slice(0, 8)
  };
}

async function tenantInsights({ tenantId, tenantRole, userId }) {
  const workoutsFilter = tenantRole === 'PERSONAL' && userId
    ? 'AND w.actor_user_id = ?'
    : '';
  const workoutsParamsMonth = tenantRole === 'PERSONAL' && userId
    ? [tenantId, userId]
    : [tenantId];
  const workoutsParamsPrev = tenantRole === 'PERSONAL' && userId
    ? [tenantId, userId]
    : [tenantId];

  const [
    revenueRows,
    forecastRows,
    pendingRows,
    studentsRows,
    attendanceRows,
    challengeRows,
    pointsMonthRows,
    pointsPrevMonthRows,
    streakRows,
    lowFrequencyRows,
    paymentRiskRows
  ] = await Promise.all([
    query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM invoices
       WHERE tenant_id = ?
         AND status = 'PAID'
         AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND paid_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`,
      [tenantId]
    ),
    query(
      `SELECT COALESCE(bp.monthly_fee, 0) AS monthly_fee
       FROM subscriptions s
       JOIN billing_plans bp ON bp.id = s.plan_id
       WHERE s.tenant_id = ?
       ORDER BY s.started_at DESC
       LIMIT 1`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM invoices
       WHERE tenant_id = ? AND status IN ('OPEN', 'OVERDUE')`,
      [tenantId]
    ),
    query(
      `SELECT
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_students,
          SUM(CASE WHEN status IN ('INACTIVE', 'BLOCKED') THEN 1 ELSE 0 END) AS cancelled_students
       FROM students
       WHERE tenant_id = ?`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE a.tenant_id = ?
         AND a.attended_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND s.status = 'ACTIVE'`,
      [tenantId]
    ),
    query(
      `SELECT COUNT(DISTINCT cal.student_id) AS total
       FROM challenge_activity_log cal
       JOIN weekly_challenges wc ON wc.id = cal.challenge_id
       JOIN students s ON s.id = cal.student_id
       WHERE wc.tenant_id = ?
         AND cal.activity_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND s.status = 'ACTIVE'`,
      [tenantId]
    ),
    query(
      `SELECT COALESCE(SUM(w.points), 0) AS total
       FROM workouts w
       WHERE w.tenant_id = ?
         ${workoutsFilter}
         AND w.completed_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND w.completed_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)`,
      workoutsParamsMonth
    ),
    query(
      `SELECT COALESCE(SUM(w.points), 0) AS total
       FROM workouts w
       WHERE w.tenant_id = ?
         ${workoutsFilter}
         AND w.completed_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
         AND w.completed_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')`,
      workoutsParamsPrev
    ),
    query(
      `SELECT COALESCE(AVG(days_active), 0) AS avg_days
       FROM (
         SELECT cal.student_id, COUNT(DISTINCT cal.activity_date) AS days_active
         FROM challenge_activity_log cal
         JOIN weekly_challenges wc ON wc.id = cal.challenge_id
         WHERE wc.tenant_id = ?
           AND cal.activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY cal.student_id
       ) x`,
      [tenantId]
    ),
    query(
      `SELECT s.id, s.full_name
       FROM students s
       LEFT JOIN attendance a
         ON a.student_id = s.id
        AND a.attended_on >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       WHERE s.tenant_id = ?
         AND s.status = 'ACTIVE'
       GROUP BY s.id, s.full_name
       HAVING COUNT(a.id) = 0
       ORDER BY s.full_name ASC
       LIMIT 6`,
      [tenantId]
    ),
    query(
      `SELECT s.id, s.full_name, sm.billing_status
       FROM students s
       JOIN student_memberships sm
         ON sm.student_id = s.id
        AND sm.tenant_id = s.tenant_id
       WHERE s.tenant_id = ?
         AND sm.billing_status IN ('PENDING', 'PAST_DUE', 'BLOCKED')
       ORDER BY sm.updated_at DESC
       LIMIT 6`,
      [tenantId]
    )
  ]);

  const monthlyRevenue = toNumber(revenueRows[0]?.total);
  const forecast = toNumber(forecastRows[0]?.monthly_fee);
  const pendingPayments = toNumber(pendingRows[0]?.total);
  const activeStudents = toNumber(studentsRows[0]?.active_students);
  const cancelledStudents = toNumber(studentsRows[0]?.cancelled_students);
  const attendanceWeek = toNumber(attendanceRows[0]?.total);
  const challengeStudents = toNumber(challengeRows[0]?.total);
  const monthPoints = toNumber(pointsMonthRows[0]?.total);
  const prevMonthPoints = toNumber(pointsPrevMonthRows[0]?.total);

  let gymSummary = null;
  if (tenantRole === 'GYM_STAFF') {
    const personalRows = await query(
      `SELECT
          tu.id,
          tu.full_name,
          COUNT(DISTINCT w.student_id) AS total_students,
          SUM(CASE WHEN s.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_students,
          COALESCE(SUM(CASE
              WHEN w.completed_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
               AND w.completed_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
              THEN w.points ELSE 0 END), 0) AS points_month
       FROM tenant_users tu
       LEFT JOIN workouts w
         ON w.tenant_id = tu.tenant_id
        AND w.actor_user_id = tu.id
       LEFT JOIN students s ON s.id = w.student_id
       WHERE tu.tenant_id = ?
         AND tu.role = 'PERSONAL'
       GROUP BY tu.id, tu.full_name
       ORDER BY tu.full_name ASC`,
      [tenantId]
    );

    const totalPointsMonth = personalRows.reduce((acc, row) => acc + toNumber(row.points_month), 0);
    const mapped = personalRows.map((row) => {
      const totalStudents = toNumber(row.total_students);
      const active = toNumber(row.active_students);
      const points = toNumber(row.points_month);
      const revenueEstimate = totalPointsMonth > 0
        ? (monthlyRevenue * points) / totalPointsMonth
        : 0;

      return {
        id: row.id,
        full_name: row.full_name,
        retention_pct: toPct(active, totalStudents),
        revenue_estimate: Number(revenueEstimate.toFixed(2))
      };
    });

    const byRetention = [...mapped].sort((a, b) => b.retention_pct - a.retention_pct);
    const byRevenue = [...mapped].sort((a, b) => b.revenue_estimate - a.revenue_estimate);

    gymSummary = {
      best_personal_retention: byRetention[0] || null,
      best_personal_revenue: byRevenue[0] || null
    };
  }

  return {
    scope: tenantRole === 'GYM_STAFF' ? 'GYM' : 'PERSONAL',
    revenue: {
      monthly_total: monthlyRevenue,
      recurring_forecast: forecast,
      pending_payments: pendingPayments,
      ticket_avg: Number((activeStudents > 0 ? monthlyRevenue / activeStudents : 0).toFixed(2))
    },
    retention: {
      active_students: activeStudents,
      cancelled_students: cancelledStudents,
      retention_rate_pct: toPct(activeStudents, activeStudents + cancelledStudents),
      avg_weekly_frequency: Number((activeStudents > 0 ? attendanceWeek / activeStudents : 0).toFixed(2)),
      challenge_engagement_pct: toPct(challengeStudents, activeStudents)
    },
    performance: {
      avg_streak_days: Number(toNumber(streakRows[0]?.avg_days).toFixed(1)),
      monthly_goal_completion_pct: Number((activeStudents > 0 ? Math.min(100, (monthPoints / (activeStudents * 100)) * 100) : 0).toFixed(1)),
      month_over_month_progress_pct: Number(toPct(monthPoints - prevMonthPoints, prevMonthPoints || (monthPoints > 0 ? monthPoints : 1)))
    },
    intelligence: {
      low_frequency_students: lowFrequencyRows,
      payment_due_students: paymentRiskRows,
      churn_risk_students: [...lowFrequencyRows, ...paymentRiskRows]
        .map((s) => ({ id: s.id, full_name: s.full_name }))
        .filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx)
        .slice(0, 6)
    },
    automation: {
      recurring_billing: true,
      auto_block: true,
      renewal_notice: true,
      export_financial_report: true
    },
    gym: gymSummary
  };
}

module.exports = {
  overview,
  masterOverview,
  revenueSeries,
  revenueBreakdown,
  masterActivity,
  tenantsKpis,
  masterInsights,
  tenantInsights
};
