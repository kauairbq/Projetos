INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin', 'admin@gestao.pro', crypt('admin123', gen_salt('bf')), 'admin')
ON CONFLICT DO NOTHING;
