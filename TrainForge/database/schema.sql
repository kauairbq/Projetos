CREATE DATABASE IF NOT EXISTS trainforge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trainforge;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS student_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS leaderboards;
DROP TABLE IF EXISTS challenge_activity_log;
DROP TABLE IF EXISTS challenge_participation;
DROP TABLE IF EXISTS weekly_challenges;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS quote_requests;
DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS service_catalog;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS student_memberships;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS gym_personal_links;
DROP TABLE IF EXISTS support_ticket_events;
DROP TABLE IF EXISTS support_ticket_messages;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS access_blocks;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS billing_plans;
DROP TABLE IF EXISTS tenant_landing_pages;
DROP TABLE IF EXISTS tenant_branding;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS email_activation_tokens;
DROP TABLE IF EXISTS tenant_users;
DROP TABLE IF EXISTS tenants;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE tenants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('PERSONAL', 'GYM') NOT NULL,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(160) NULL,
    phone VARCHAR(40) NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenants_type_status (type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tenant_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    role ENUM('MASTER_ADMIN', 'GYM_STAFF', 'PERSONAL') NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE NULL,
    address VARCHAR(200) NULL,
    payment_info JSON NULL,
    mode ENUM('online', 'presencial') NOT NULL DEFAULT 'online',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at DATETIME NULL,
    email_verified_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_tenant_users_email (email),
    INDEX idx_tenant_users_tenant_role (tenant_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_activation_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_user_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_activation_user FOREIGN KEY (tenant_user_id) REFERENCES tenant_users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_email_activation_token_hash (token_hash),
    INDEX idx_email_activation_user (tenant_user_id),
    INDEX idx_email_activation_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_token CHAR(36) NOT NULL,
    tenant_user_id BIGINT NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent VARCHAR(255) NULL,
    ip_address VARCHAR(64) NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_tenant_user FOREIGN KEY (tenant_user_id) REFERENCES tenant_users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_sessions_token (session_token),
    INDEX idx_sessions_user_id (tenant_user_id),
    INDEX idx_sessions_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tenant_branding (
    tenant_id BIGINT PRIMARY KEY,
    display_name VARCHAR(120) NOT NULL,
    studio_name VARCHAR(120) NULL,
    primary_color VARCHAR(12) NOT NULL DEFAULT '#2563eb',
    secondary_color VARCHAR(12) NULL,
    logo_path VARCHAR(255) NULL,
    profile_photo_path VARCHAR(255) NULL,
    banner_path VARCHAR(255) NULL,
    bio_text TEXT NULL,
    instagram_url VARCHAR(255) NULL,
    whatsapp_url VARCHAR(255) NULL,
    website_url VARCHAR(255) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_branding_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tenant_landing_pages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    page_type ENUM('PERSONAL', 'GYM', 'SAAS_SALES') NOT NULL,
    path VARCHAR(120) NOT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_pages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_landing_path (path),
    INDEX idx_landing_tenant_type (tenant_id, page_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE billing_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(80) NOT NULL,
    currency ENUM('EUR', 'BRL') NOT NULL,
    setup_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uq_billing_plan_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'TRIAL') NOT NULL DEFAULT 'TRIAL',
    started_at DATETIME NOT NULL,
    trial_ends_at DATETIME NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    grace_until DATE NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES billing_plans(id),
    INDEX idx_subscriptions_tenant_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    subscription_id BIGINT NOT NULL,
    currency ENUM('EUR', 'BRL') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('OPEN', 'PAID', 'VOID', 'OVERDUE') NOT NULL DEFAULT 'OPEN',
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_invoices_tenant_status_due (tenant_id, status, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    provider ENUM('MANUAL', 'MBWAY', 'MULTIBANCO', 'STRIPE', 'MERCADOPAGO') NOT NULL DEFAULT 'MANUAL',
    method ENUM('CARD', 'PIX', 'BANK_TRANSFER', 'CASH', 'REFERENCE') NULL,
    provider_ref VARCHAR(120) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency ENUM('EUR', 'BRL') NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    confirmed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_payments_invoice_status (invoice_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE access_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    reason ENUM('PAST_DUE', 'MANUAL_BLOCK', 'CANCELLED') NOT NULL,
    blocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unblocked_at DATETIME NULL,
    note VARCHAR(255) NULL,
    CONSTRAINT fk_access_blocks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_access_blocks_tenant_date (tenant_id, blocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    opened_by_user_id BIGINT NULL,
    opened_by_student_id BIGINT NULL,
    category ENUM('BUG', 'BILLING', 'FEATURE', 'QUESTION') NOT NULL DEFAULT 'QUESTION',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    subject VARCHAR(160) NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_support_tickets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (opened_by_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    INDEX idx_support_tenant_status_priority (tenant_id, status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE support_ticket_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    author_type ENUM('CLIENT', 'ADMIN') NOT NULL,
    author_user_id BIGINT NULL,
    message TEXT NOT NULL,
    attachment_path VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_messages_user FOREIGN KEY (author_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    INDEX idx_ticket_messages_created (ticket_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE support_ticket_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    event_type ENUM('STATUS_CHANGE', 'PRIORITY_CHANGE', 'ASSIGNED') NOT NULL,
    meta_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_events_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gym_personal_links (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gym_tenant_id BIGINT NOT NULL,
    personal_tenant_id BIGINT NOT NULL,
    commission_percent DECIMAL(5, 2) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gym_personal_gym FOREIGN KEY (gym_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_gym_personal_personal FOREIGN KEY (personal_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_gym_personal_link (gym_tenant_id, personal_tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    full_name VARCHAR(140) NOT NULL,
    email VARCHAR(160) NULL,
    phone VARCHAR(40) NULL,
    birth_date DATE NULL,
    address VARCHAR(200) NULL,
    mode ENUM('online', 'presencial') NOT NULL DEFAULT 'online',
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_students_tenant_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    starts_at DATE NOT NULL,
    ends_at DATE NULL,
    billing_status ENUM('OK', 'PENDING', 'PAST_DUE', 'BLOCKED') NOT NULL DEFAULT 'OK',
    payment_method ENUM('CASH', 'MBWAY', 'MULTIBANCO', 'PIX', 'CARD', 'BANK_TRANSFER') NULL,
    monthly_amount DECIMAL(10, 2) NULL,
    currency ENUM('EUR', 'BRL') NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_memberships_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_memberships_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_memberships_tenant_status (tenant_id, billing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    attended_on DATE NOT NULL,
    checkin_at DATETIME NULL,
    checkout_at DATETIME NULL,
    source ENUM('MANUAL', 'QR', 'TURNSTILE_API') NOT NULL DEFAULT 'MANUAL',
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY uq_attendance_student_date (student_id, attended_on),
    INDEX idx_attendance_tenant_date (tenant_id, attended_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE weekly_challenges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    scoring_rules_json JSON NOT NULL,
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_challenges_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_weekly_challenges_user FOREIGN KEY (created_by_user_id) REFERENCES tenant_users(id),
    INDEX idx_challenges_tenant_active (tenant_id, is_active, start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE challenge_participation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    completed TINYINT(1) NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge_participation_challenge FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenge_participation_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_participation_challenge_student (challenge_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE challenge_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    challenge_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    points INT NOT NULL,
    meta_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_challenge_log_challenge FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenge_log_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_challenge_log_date (challenge_id, activity_date),
    UNIQUE KEY uq_challenge_log_unique (challenge_id, student_id, activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leaderboards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    scope ENUM('GLOBAL', 'GYM', 'PERSONAL') NOT NULL DEFAULT 'GLOBAL',
    period ENUM('WEEK', 'MONTH') NOT NULL DEFAULT 'WEEK',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data_json JSON NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leaderboards_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_leaderboards_period (tenant_id, period_start, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(200) NULL,
    icon VARCHAR(80) NULL,
    rules_json JSON NOT NULL,
    UNIQUE KEY uq_achievements_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_achievements_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_achievement (student_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE workouts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    actor_user_id BIGINT NULL,
    student_id BIGINT NULL,
    challenge_id BIGINT NULL,
    title VARCHAR(140) NOT NULL,
    modality VARCHAR(80) NOT NULL DEFAULT 'General',
    duration_minutes INT NOT NULL DEFAULT 0,
    calories INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_workouts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_workouts_actor_user FOREIGN KEY (actor_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    CONSTRAINT fk_workouts_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_workouts_challenge FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE SET NULL,
    INDEX idx_workouts_tenant (tenant_id),
    INDEX idx_workouts_student (student_id),
    INDEX idx_workouts_challenge (challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_catalog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_catalog_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_catalog_user FOREIGN KEY (created_by_user_id) REFERENCES tenant_users(id),
    INDEX idx_service_catalog_tenant (tenant_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NULL,
    requested_by_student_id BIGINT NULL,
    notes TEXT NULL,
    status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_requests_service FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_requests_user FOREIGN KEY (requested_by_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    CONSTRAINT fk_service_requests_student FOREIGN KEY (requested_by_student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_service_requests_tenant_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quote_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    service_request_id BIGINT NULL,
    student_id BIGINT NULL,
    budget_estimate DECIMAL(10, 2) NULL,
    notes TEXT NULL,
    status ENUM('open', 'sent', 'accepted', 'rejected') NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quote_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_quote_requests_service_request FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_quote_requests_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_quote_requests_tenant_status (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    author_user_id BIGINT NULL,
    author_student_id BIGINT NULL,
    subject VARCHAR(140) NOT NULL,
    message TEXT NOT NULL,
    rating TINYINT NOT NULL DEFAULT 5,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (author_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_student FOREIGN KEY (author_student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_feedback_tenant_date (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NULL,
    actor_user_id BIGINT NULL,
    action VARCHAR(120) NOT NULL,
    target_type VARCHAR(80) NULL,
    target_id VARCHAR(80) NULL,
    meta_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (actor_user_id) REFERENCES tenant_users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_tenant_date (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


