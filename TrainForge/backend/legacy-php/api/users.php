<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';

preflight_exit();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = request_json();

if ($method === 'GET') {
    require_roles(['admin', 'trainer']);
    $role = trim((string)($_GET['role'] ?? ''));
    $sql = 'SELECT id, name, email, role, is_online, created_at FROM users';
    $params = [];
    if ($role !== '') {
        $sql .= ' WHERE role = ?';
        $params[] = $role;
    }
    $sql .= ' ORDER BY created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    require_roles(['admin', 'trainer']);
    $name = trim((string)($input['name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $role = (string)($input['role'] ?? 'student');
    if ($name === '' || $email === '') {
        json_response(['ok' => false, 'error' => 'Nome e email são obrigatórios'], 422);
    }
    $pwd = (string)($input['password'] ?? '123456');
    $hash = password_hash($pwd, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    try {
        $stmt->execute([$name, $email, $hash, $role]);
    } catch (Throwable $e) {
        json_response(['ok' => false, 'error' => 'Não foi possível criar utilizador'], 409);
    }
    json_response(['ok' => true, 'message' => 'Utilizador criado']);
}

json_response(['ok' => false, 'error' => 'Rota não encontrada'], 404);

