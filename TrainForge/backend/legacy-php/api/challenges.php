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
    require_auth();
    $active = $_GET['active'] ?? null;
    $sql = 'SELECT id, title, description, modality, points_per_day, is_active, starts_at, ends_at FROM challenges';
    $params = [];
    if ($active !== null) {
        $sql .= ' WHERE is_active = ?';
        $params[] = (int)$active === 1 ? 1 : 0;
    }
    $sql .= ' ORDER BY starts_at DESC, id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $user = require_roles(['admin', 'trainer']);
    $title = trim((string)($input['title'] ?? ''));
    $description = trim((string)($input['description'] ?? ''));
    $modality = trim((string)($input['modality'] ?? 'General'));
    $points = (int)($input['pointsPerDay'] ?? 10);
    $startsAt = (string)($input['startsAt'] ?? date('Y-m-d'));
    $endsAt = (string)($input['endsAt'] ?? date('Y-m-d', strtotime('+7 days')));
    if ($title === '') {
        json_response(['ok' => false, 'error' => 'Título é obrigatório'], 422);
    }
    $stmt = $pdo->prepare(
        'INSERT INTO challenges (title, description, modality, points_per_day, is_active, starts_at, ends_at, created_by)
         VALUES (?, ?, ?, ?, 1, ?, ?, ?)'
    );
    $stmt->execute([$title, $description, $modality, $points, $startsAt, $endsAt, (int)$user['sub']]);
    json_response(['ok' => true, 'message' => 'Desafio criado']);
}

if ($method === 'PATCH') {
    $user = require_roles(['admin', 'trainer']);
    $challengeId = (int)($_GET['id'] ?? 0);
    if ($challengeId <= 0) {
        json_response(['ok' => false, 'error' => 'ID inválido'], 422);
    }
    $isActive = array_key_exists('isActive', $input) ? ((int)$input['isActive'] === 1 ? 1 : 0) : null;
    if ($isActive === null) {
        json_response(['ok' => false, 'error' => 'Campo isActive obrigatório'], 422);
    }
    $stmt = $pdo->prepare('UPDATE challenges SET is_active = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$isActive, $challengeId]);
    json_response(['ok' => true, 'message' => 'Estado do desafio atualizado']);
}

json_response(['ok' => false, 'error' => 'Rota não encontrada'], 404);

