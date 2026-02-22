<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/auth.php';

preflight_exit();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';
$input = request_json();

if ($method === 'POST' && $action === 'register') {
    $name = trim((string)($input['name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    $role = (string)($input['role'] ?? 'student');
    if ($name === '' || $email === '' || $password === '') {
        json_response(['ok' => false, 'error' => 'Dados obrigatórios em falta'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'error' => 'Email inválido'], 422);
    }
    if (!in_array($role, ['admin', 'trainer', 'student'], true)) {
        $role = 'student';
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(['ok' => false, 'error' => 'Email já registado'], 409);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $ins->execute([$name, $email, $hash, $role]);
    json_response(['ok' => true, 'message' => 'Utilizador criado']);
}

if ($method === 'POST' && $action === 'login') {
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    $stmt = $pdo->prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(['ok' => false, 'error' => 'Credenciais inválidas'], 401);
    }

    $payload = [
        'sub' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ];
    $accessToken = create_access_token($payload);

    $sessionId = generate_session_id();
    $refreshRaw = generate_refresh_token();
    $refreshHash = hash_refresh_token($refreshRaw);
    $refreshTtl = (int)(env('REFRESH_TTL', '1209600') ?? 1209600);
    $expiresAt = date('Y-m-d H:i:s', time() + $refreshTtl);
    $tokenOut = $sessionId . '.' . $refreshRaw;

    $sessionStmt = $pdo->prepare(
        'INSERT INTO user_sessions (session_id, user_id, refresh_token_hash, expires_at, revoked, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, NOW(), NOW())'
    );
    $sessionStmt->execute([$sessionId, (int)$user['id'], $refreshHash, $expiresAt]);

    json_response([
        'ok' => true,
        'accessToken' => $accessToken,
        'refreshToken' => $tokenOut,
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
    ]);
}

if ($method === 'POST' && $action === 'refresh') {
    $tokenIn = (string)($input['refreshToken'] ?? '');
    if (!str_contains($tokenIn, '.')) {
        json_response(['ok' => false, 'error' => 'Refresh token inválido'], 422);
    }
    [$sessionId, $raw] = explode('.', $tokenIn, 2);
    $hash = hash_refresh_token($raw);

    $stmt = $pdo->prepare(
        'SELECT us.user_id, us.expires_at, us.revoked, u.name, u.email, u.role
         FROM user_sessions us
         INNER JOIN users u ON u.id = us.user_id
         WHERE us.session_id = ? AND us.refresh_token_hash = ? LIMIT 1'
    );
    $stmt->execute([$sessionId, $hash]);
    $row = $stmt->fetch();
    if (!$row || (int)$row['revoked'] === 1 || strtotime((string)$row['expires_at']) < time()) {
        json_response(['ok' => false, 'error' => 'Sessão expirada ou inválida'], 401);
    }

    $newRaw = generate_refresh_token();
    $newHash = hash_refresh_token($newRaw);
    $refreshTtl = (int)(env('REFRESH_TTL', '1209600') ?? 1209600);
    $expiresAt = date('Y-m-d H:i:s', time() + $refreshTtl);
    $upd = $pdo->prepare('UPDATE user_sessions SET refresh_token_hash = ?, expires_at = ?, updated_at = NOW() WHERE session_id = ?');
    $upd->execute([$newHash, $expiresAt, $sessionId]);

    $payload = [
        'sub' => (int)$row['user_id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
    ];

    json_response([
        'ok' => true,
        'accessToken' => create_access_token($payload),
        'refreshToken' => $sessionId . '.' . $newRaw,
        'user' => $payload,
    ]);
}

if ($method === 'POST' && $action === 'logout') {
    $user = require_auth();
    $tokenIn = (string)($input['refreshToken'] ?? '');
    if (str_contains($tokenIn, '.')) {
        [$sessionId] = explode('.', $tokenIn, 2);
        $stmt = $pdo->prepare('UPDATE user_sessions SET revoked = 1, updated_at = NOW() WHERE session_id = ? AND user_id = ?');
        $stmt->execute([$sessionId, (int)$user['sub']]);
    }
    json_response(['ok' => true]);
}

if ($method === 'POST' && $action === 'logout-all') {
    $user = require_auth();
    $stmt = $pdo->prepare('UPDATE user_sessions SET revoked = 1, updated_at = NOW() WHERE user_id = ?');
    $stmt->execute([(int)$user['sub']]);
    json_response(['ok' => true]);
}

if ($method === 'GET' && $action === 'me') {
    $user = require_auth();
    json_response(['ok' => true, 'user' => $user]);
}

json_response(['ok' => false, 'error' => 'Rota não encontrada'], 404);

