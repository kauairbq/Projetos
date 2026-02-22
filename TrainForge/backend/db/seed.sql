USE trainforge;
SET NAMES utf8mb4;

INSERT INTO tenants (type, name, slug, email, phone, status)
VALUES
    ('PERSONAL', 'TrainForge Internal', 'trainforge-internal', 'admin@trainforge.local', '+351900000001', 'ACTIVE'),
    ('GYM', 'Iron Valley Gym', 'iron-valley-gym', 'contacto@ironvalley.pt', '+351900000002', 'ACTIVE'),
    ('PERSONAL', 'Yasmin Performance', 'yasmin-rocha', 'yasmin@performance.pt', '+351900000003', 'TRIAL');

SET @tenant_internal := (SELECT id FROM tenants WHERE slug = 'trainforge-internal' LIMIT 1);
SET @tenant_gym := (SELECT id FROM tenants WHERE slug = 'iron-valley-gym' LIMIT 1);
SET @tenant_personal := (SELECT id FROM tenants WHERE slug = 'yasmin-rocha' LIMIT 1);
SET @password_hash := '$2a$10$1yMTPgkXSDwcmd7CMqgoNewMCusTU9GvbF/mPaxmK0ooRRNqi3HKy';
SET @password_hash_master := '$2a$10$C4/AhQyhXG0PWqd9ZLzhWezgTqDAm7sSoE9gb1FKofXByNXiVUFKS';
SET @password_hash_gym := '$2a$10$0gkhiNna0nLEqk.mMJFlJO9vyZcUl4aYMgU/nts.ssbGtDbkqlM0u';
SET @password_hash_personal := '$2a$10$4g4xvZBZ2BPLGTrQGJUDB.HkUROmkJc30RBrv7MOQ9yhBkfpovhuy';

INSERT INTO tenant_users (tenant_id, role, full_name, email, password_hash, birth_date, address, payment_info, mode, is_active, last_login_at, email_verified_at)
VALUES
    (@tenant_internal, 'MASTER_ADMIN', 'Kauai Rocha', 'kauai_lucas@hotmail.com', @password_hash_master, '1991-07-22', 'Viseu, Portugal', JSON_OBJECT('plan', 'master', 'provider', 'manual'), 'presencial', 1, NOW(), NOW()),
    (@tenant_internal, 'GYM_STAFF', 'Admin TrainForge', 'admin@trainforge.local', @password_hash, '1988-10-01', 'Viseu, Portugal', JSON_OBJECT('plan', 'ops', 'provider', 'manual'), 'online', 1, NOW(), NOW()),
    (@tenant_gym, 'GYM_STAFF', 'Ricardo Manager', 'ricardo@ironvalley.pt', @password_hash, NULL, 'Porto, Portugal', JSON_OBJECT('plan', 'gym_pro'), 'presencial', 1, NOW(), NOW()),
    (@tenant_gym, 'PERSONAL', 'Ines Trainer', 'ines@ironvalley.pt', @password_hash, NULL, 'Porto, Portugal', JSON_OBJECT('plan', 'gym_pro'), 'online', 1, NOW(), NOW()),
    (@tenant_personal, 'PERSONAL', 'Yasmin Rocha', 'yasmin@performance.pt', @password_hash, NULL, 'Lisboa, Portugal', JSON_OBJECT('plan', 'personal_solo'), 'online', 1, NOW(), NOW()),
    (@tenant_gym, 'GYM_STAFF', 'Gym Teste', 'ginasio_x@trainforge.com', @password_hash_gym, NULL, 'Porto, Portugal', JSON_OBJECT('plan', 'gym_pro'), 'presencial', 1, NOW(), NOW()),
    (@tenant_personal, 'PERSONAL', 'Personal Teste', 'personal_x@trainforge.com', @password_hash_personal, NULL, 'Lisboa, Portugal', JSON_OBJECT('plan', 'personal_solo'), 'online', 1, NOW(), NOW());

SET @user_kauai := (SELECT id FROM tenant_users WHERE email = 'kauai_lucas@hotmail.com' LIMIT 1);
SET @user_internal_admin := (SELECT id FROM tenant_users WHERE email = 'admin@trainforge.local' LIMIT 1);
SET @user_ricardo := (SELECT id FROM tenant_users WHERE email = 'ricardo@ironvalley.pt' LIMIT 1);
SET @user_yasmin := (SELECT id FROM tenant_users WHERE email = 'yasmin@performance.pt' LIMIT 1);

INSERT INTO tenant_branding (
    tenant_id, display_name, studio_name, primary_color, secondary_color, logo_path, profile_photo_path,
    banner_path, bio_text, instagram_url, whatsapp_url, website_url
)
VALUES
    (@tenant_internal, 'TrainForge Internal', 'TrainForge HQ', '#2563eb', '#7c3aed', NULL, NULL, NULL,
     'Operacao master para controle de clientes, billing e suporte.', 'https://instagram.com/trainforge',
     'https://wa.me/351900000001', 'https://trainforge.local'),
    (@tenant_gym, 'Iron Valley Gym', 'Iron Valley', '#1d4ed8', '#0ea5e9', NULL, NULL, NULL,
     'Ginásio focado em alta performance com turmas e acompanhamento.', 'https://instagram.com/ironvalleygym',
     'https://wa.me/351900000002', 'https://ironvalley.local'),
    (@tenant_personal, 'Yasmin Rocha', 'Yasmin Performance', '#2563eb', '#9333ea', NULL, NULL, NULL,
     'Personal trainer para programas online e presenciais com desafios semanais.', 'https://instagram.com/yasmin.rocha',
     'https://wa.me/351900000003', 'https://yasmin.local');

INSERT INTO tenant_landing_pages (tenant_id, page_type, path, is_published)
VALUES
    (@tenant_internal, 'SAAS_SALES', '/saas', 1),
    (@tenant_personal, 'PERSONAL', '/personal/yasmin-rocha', 1),
    (@tenant_gym, 'GYM', '/gym/iron-valley-gym', 1),
    (@tenant_internal, 'PERSONAL', '/personal/kauai-rocha', 1);

INSERT INTO billing_plans (code, name, currency, setup_fee, monthly_fee, is_active)
VALUES
    ('PERSONAL_SOLO', 'Personal Solo', 'EUR', 0, 29.90, 1),
    ('GYM_SMALL', 'Gym Small', 'EUR', 99.00, 89.90, 1),
    ('GYM_PRO', 'Gym Pro', 'EUR', 149.00, 149.90, 1);

SET @plan_personal := (SELECT id FROM billing_plans WHERE code = 'PERSONAL_SOLO' LIMIT 1);
SET @plan_gym_small := (SELECT id FROM billing_plans WHERE code = 'GYM_SMALL' LIMIT 1);
SET @plan_gym_pro := (SELECT id FROM billing_plans WHERE code = 'GYM_PRO' LIMIT 1);

INSERT INTO subscriptions (
    tenant_id, plan_id, status, started_at, trial_ends_at,
    current_period_start, current_period_end, grace_until
)
VALUES
    (@tenant_internal, @plan_gym_pro, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 120 DAY), NULL, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL),
    (@tenant_gym, @plan_gym_small, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 90 DAY), NULL, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL),
    (@tenant_personal, @plan_personal, 'TRIAL', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL);

SET @sub_internal := (SELECT id FROM subscriptions WHERE tenant_id = @tenant_internal LIMIT 1);
SET @sub_gym := (SELECT id FROM subscriptions WHERE tenant_id = @tenant_gym LIMIT 1);
SET @sub_personal := (SELECT id FROM subscriptions WHERE tenant_id = @tenant_personal LIMIT 1);

INSERT INTO invoices (tenant_id, subscription_id, currency, amount, due_date, status, paid_at, created_at)
VALUES
    (@tenant_internal, @sub_internal, 'EUR', 149.90, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'PAID', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
    (@tenant_gym, @sub_gym, 'EUR', 89.90, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN', NULL, NOW()),
    (@tenant_personal, @sub_personal, 'EUR', 29.90, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'OPEN', NULL, NOW());

SET @invoice_internal_paid := (SELECT id FROM invoices WHERE tenant_id = @tenant_internal AND status = 'PAID' LIMIT 1);
SET @invoice_gym_open := (SELECT id FROM invoices WHERE tenant_id = @tenant_gym AND status = 'OPEN' LIMIT 1);
SET @invoice_personal_open := (SELECT id FROM invoices WHERE tenant_id = @tenant_personal AND status = 'OPEN' LIMIT 1);

INSERT INTO payments (invoice_id, provider, method, provider_ref, amount, currency, status, confirmed_at)
VALUES
    (@invoice_internal_paid, 'MANUAL', 'BANK_TRANSFER', 'PAY-INT-0001', 149.90, 'EUR', 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 14 DAY)),
    (@invoice_gym_open, 'MBWAY', 'REFERENCE', 'MBWAY-PENDING-001', 89.90, 'EUR', 'PENDING', NULL);

INSERT INTO gym_personal_links (gym_tenant_id, personal_tenant_id, commission_percent, is_active)
VALUES
    (@tenant_gym, @tenant_personal, 35.00, 1);

INSERT INTO students (tenant_id, full_name, email, phone, birth_date, address, mode, status)
VALUES
    (@tenant_internal, 'Ana Silva', 'ana@trainforge.local', '+351910100001', '1997-03-14', 'Porto, Portugal', 'online', 'ACTIVE'),
    (@tenant_internal, 'Bruno Costa', 'bruno@trainforge.local', '+351910100002', '1995-11-08', 'Lisboa, Portugal', 'presencial', 'ACTIVE'),
    (@tenant_internal, 'Marta Vieira', 'marta@trainforge.local', '+351910100003', '1992-01-03', 'Viseu, Portugal', 'online', 'ACTIVE'),
    (@tenant_gym, 'Joao Teixeira', 'joao@ironvalley.pt', '+351910100004', NULL, 'Porto, Portugal', 'presencial', 'ACTIVE'),
    (@tenant_personal, 'Luis Almeida', 'luis@yasmin.pt', '+351910100005', NULL, 'Lisboa, Portugal', 'online', 'ACTIVE');

SET @student_ana := (SELECT id FROM students WHERE email = 'ana@trainforge.local' LIMIT 1);
SET @student_bruno := (SELECT id FROM students WHERE email = 'bruno@trainforge.local' LIMIT 1);
SET @student_marta := (SELECT id FROM students WHERE email = 'marta@trainforge.local' LIMIT 1);
SET @student_joao := (SELECT id FROM students WHERE email = 'joao@ironvalley.pt' LIMIT 1);
SET @student_luis := (SELECT id FROM students WHERE email = 'luis@yasmin.pt' LIMIT 1);

INSERT INTO student_memberships (
    student_id, tenant_id, starts_at, ends_at, billing_status, payment_method, monthly_amount, currency
)
VALUES
    (@student_ana, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 60 DAY), NULL, 'OK', 'MBWAY', 39.90, 'EUR'),
    (@student_bruno, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 30 DAY), NULL, 'OK', 'CARD', 39.90, 'EUR'),
    (@student_marta, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 15 DAY), NULL, 'PENDING', 'BANK_TRANSFER', 39.90, 'EUR'),
    (@student_joao, @tenant_gym, DATE_SUB(CURDATE(), INTERVAL 45 DAY), NULL, 'OK', 'CARD', 49.90, 'EUR'),
    (@student_luis, @tenant_personal, DATE_SUB(CURDATE(), INTERVAL 20 DAY), NULL, 'OK', 'MBWAY', 29.90, 'EUR');

INSERT INTO attendance (student_id, tenant_id, attended_on, checkin_at, checkout_at, source)
VALUES
    (@student_ana, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 26 HOUR), DATE_SUB(NOW(), INTERVAL 25 HOUR), 'MANUAL'),
    (@student_bruno, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 27 HOUR), DATE_SUB(NOW(), INTERVAL 26 HOUR), 'MANUAL'),
    (@student_marta, @tenant_internal, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 50 HOUR), DATE_SUB(NOW(), INTERVAL 49 HOUR), 'QR'),
    (@student_joao, @tenant_gym, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 23 HOUR), 'TURNSTILE_API');

INSERT INTO weekly_challenges (
    tenant_id, title, description, start_date, end_date, is_active, scoring_rules_json, created_by_user_id
)
VALUES
    (
        @tenant_internal,
        'Desafio da Semana - Consistencia',
        'Completar atividades diarias para evoluir no ranking global.',
        DATE_SUB(CURDATE(), INTERVAL 1 DAY),
        DATE_ADD(CURDATE(), INTERVAL 6 DAY),
        1,
        JSON_OBJECT('daily_completion', 10, 'bonus_streak', 5),
        @user_kauai
    ),
    (
        @tenant_gym,
        'Desafio Iron Valley - Cardio',
        'Meta de cardio com ranking semanal para as turmas.',
        DATE_SUB(CURDATE(), INTERVAL 2 DAY),
        DATE_ADD(CURDATE(), INTERVAL 5 DAY),
        1,
        JSON_OBJECT('cycling', 12, 'jump', 8),
        @user_ricardo
    );

SET @challenge_internal := (SELECT id FROM weekly_challenges WHERE tenant_id = @tenant_internal ORDER BY id ASC LIMIT 1);
SET @challenge_gym := (SELECT id FROM weekly_challenges WHERE tenant_id = @tenant_gym ORDER BY id ASC LIMIT 1);

INSERT INTO challenge_participation (challenge_id, student_id, total_points, completed)
VALUES
    (@challenge_internal, @student_ana, 95, 1),
    (@challenge_internal, @student_bruno, 88, 1),
    (@challenge_internal, @student_marta, 77, 0),
    (@challenge_gym, @student_joao, 81, 1);

INSERT INTO challenge_activity_log (challenge_id, student_id, activity_date, points, meta_json)
VALUES
    (@challenge_internal, @student_ana, CURDATE(), 15, JSON_OBJECT('exercise', 'Treino de Forca', 'completed', true)),
    (@challenge_internal, @student_bruno, CURDATE(), 13, JSON_OBJECT('exercise', 'Cycling', 'completed', true)),
    (@challenge_internal, @student_marta, CURDATE(), 10, JSON_OBJECT('exercise', 'Jump', 'completed', true)),
    (@challenge_gym, @student_joao, CURDATE(), 12, JSON_OBJECT('exercise', 'Cardio', 'completed', true));

INSERT INTO workouts (
    tenant_id, actor_user_id, student_id, challenge_id, title, modality, duration_minutes, calories, points, completed_at
)
VALUES
    (@tenant_internal, @user_kauai, @student_ana, @challenge_internal, 'Treino de Forca', 'Musculacao', 55, 380, 18, NOW()),
    (@tenant_internal, @user_kauai, @student_bruno, @challenge_internal, 'Treino de Cardio', 'Cycling', 42, 310, 16, NOW()),
    (@tenant_internal, @user_kauai, @student_marta, @challenge_internal, 'Treino Funcional', 'B-Core', 35, 260, 12, NOW()),
    (@tenant_gym, @user_ricardo, @student_joao, @challenge_gym, 'Aula de Cycling', 'Cycling', 45, 340, 14, NOW());

INSERT INTO service_catalog (tenant_id, name, description, is_active, created_by_user_id)
VALUES
    (@tenant_internal, 'Plano Online', 'Plano de treino online com acompanhamento semanal.', 1, @user_kauai),
    (@tenant_internal, 'Acompanhamento Presencial', 'Sessao presencial com avaliacao de progresso.', 1, @user_kauai),
    (@tenant_internal, 'Relatorio de Performance', 'Relatorio mensal com KPIs de evolucao.', 1, @user_kauai);

SET @service_online := (SELECT id FROM service_catalog WHERE tenant_id = @tenant_internal AND name = 'Plano Online' LIMIT 1);
SET @service_report := (SELECT id FROM service_catalog WHERE tenant_id = @tenant_internal AND name = 'Relatorio de Performance' LIMIT 1);

INSERT INTO service_requests (tenant_id, service_id, requested_by_user_id, notes, status)
VALUES
    (@tenant_internal, @service_online, @user_kauai, 'Cliente solicitou ajuste de plano para 4x semana.', 'in_progress'),
    (@tenant_internal, @service_report, @user_kauai, 'Solicitar relatorio consolidado do mes.', 'pending');

SET @service_request_1 := (SELECT id FROM service_requests WHERE tenant_id = @tenant_internal ORDER BY id ASC LIMIT 1);

INSERT INTO quote_requests (tenant_id, service_request_id, student_id, budget_estimate, notes, status)
VALUES
    (@tenant_internal, @service_request_1, @student_ana, 49.90, 'Proposta com acompanhamento quinzenal.', 'sent');

INSERT INTO feedback (tenant_id, author_user_id, subject, message, rating)
VALUES
    (@tenant_internal, @user_kauai, 'Feedback operacional', 'Fluxo de dashboard e ranking validado em ambiente local.', 5);

INSERT INTO support_tickets (
    tenant_id, opened_by_user_id, category, priority, subject, status, created_at, updated_at
)
VALUES
    (@tenant_internal, @user_kauai, 'BILLING', 'MEDIUM', 'Duvida sobre vencimento de fatura', 'open', NOW(), NOW()),
    (@tenant_gym, @user_ricardo, 'FEATURE', 'LOW', 'Solicitacao de novo relatorio de frequencia', 'in_progress', NOW(), NOW());

SET @ticket_internal := (SELECT id FROM support_tickets WHERE tenant_id = @tenant_internal ORDER BY id ASC LIMIT 1);
SET @ticket_gym := (SELECT id FROM support_tickets WHERE tenant_id = @tenant_gym ORDER BY id ASC LIMIT 1);

INSERT INTO support_ticket_messages (ticket_id, author_type, author_user_id, message, created_at)
VALUES
    (@ticket_internal, 'CLIENT', @user_kauai, 'Preciso confirmar a regra de bloqueio apos vencimento.', NOW()),
    (@ticket_internal, 'ADMIN', @user_internal_admin, 'Recebido. Vamos aplicar grace period de 5 dias.', NOW()),
    (@ticket_gym, 'CLIENT', @user_ricardo, 'Queremos exportacao semanal por turma.', NOW());

INSERT INTO support_ticket_events (ticket_id, event_type, meta_json, created_at)
VALUES
    (@ticket_internal, 'STATUS_CHANGE', JSON_OBJECT('from', 'open', 'to', 'in_progress'), NOW()),
    (@ticket_gym, 'PRIORITY_CHANGE', JSON_OBJECT('from', 'LOW', 'to', 'MEDIUM'), NOW());

INSERT INTO leaderboards (tenant_id, scope, period, period_start, period_end, data_json, generated_at)
VALUES
    (
        @tenant_internal,
        'GLOBAL',
        'WEEK',
        DATE_SUB(CURDATE(), INTERVAL 1 DAY),
        DATE_ADD(CURDATE(), INTERVAL 6 DAY),
        JSON_OBJECT(
            'top3',
            JSON_ARRAY(
                JSON_OBJECT('student', 'Ana Silva', 'points', 95),
                JSON_OBJECT('student', 'Bruno Costa', 'points', 88),
                JSON_OBJECT('student', 'Marta Vieira', 'points', 77)
            )
        ),
        NOW()
    );

INSERT INTO achievements (code, name, description, icon, rules_json)
VALUES
    ('WEEKLY_WARRIOR', 'Weekly Warrior', 'Concluir desafio semanal.', 'fa-trophy', JSON_OBJECT('challenge_completed', true)),
    ('CONSISTENT_5', 'Consistencia 5+', 'Concluir 5 atividades na semana.', 'fa-fire', JSON_OBJECT('weekly_activities', 5));

SET @achievement_warrior := (SELECT id FROM achievements WHERE code = 'WEEKLY_WARRIOR' LIMIT 1);
SET @achievement_consistent := (SELECT id FROM achievements WHERE code = 'CONSISTENT_5' LIMIT 1);

INSERT INTO student_achievements (student_id, achievement_id, earned_at)
VALUES
    (@student_ana, @achievement_warrior, NOW()),
    (@student_ana, @achievement_consistent, NOW()),
    (@student_bruno, @achievement_consistent, NOW());

INSERT INTO audit_logs (tenant_id, actor_user_id, action, target_type, target_id, meta_json, created_at)
VALUES
    (@tenant_internal, @user_kauai, 'challenge.created', 'weekly_challenge', CAST(@challenge_internal AS CHAR), JSON_OBJECT('title', 'Desafio da Semana - Consistencia'), NOW()),
    (@tenant_internal, @user_kauai, 'service.request.updated', 'service_request', CAST(@service_request_1 AS CHAR), JSON_OBJECT('status', 'in_progress'), NOW()),
    (@tenant_internal, @user_internal_admin, 'ticket.status.changed', 'support_ticket', CAST(@ticket_internal AS CHAR), JSON_OBJECT('to', 'in_progress'), NOW());






