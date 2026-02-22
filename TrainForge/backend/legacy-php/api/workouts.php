<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';

preflight_exit();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = request_json();
$user = require_auth();

if ($method === 'GET' && (($_GET['action'] ?? '') === 'leaderboard')) {
    $limit = max(3, min(100, (int)($_GET['limit'] ?? 20)));
    $sql = '
        SELECT u.id, u.name, SUM(w.points) AS total_points
        FROM workouts w
        INNER JOIN users u ON u.id = w.user_id
        GROUP BY u.id, u.name
        ORDER BY total_points DESC
        LIMIT ?
    ';
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'GET' && (($_GET['action'] ?? '') === 'metrics')) {
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) AS total_workouts, COALESCE(SUM(points),0) AS total_points, COALESCE(AVG(duration_minutes),0) AS avg_duration
         FROM workouts
         WHERE user_id = ?'
    );
    $stmt->execute([(int)$user['sub']]);
    json_response(['ok' => true, 'data' => $stmt->fetch()]);
}

if ($method === 'POST') {
    $exercise = trim((string)($input['exercise'] ?? ''));
    $duration = (int)($input['durationMinutes'] ?? 0);
    $points = (int)($input['points'] ?? 0);
    $challengeId = (int)($input['challengeId'] ?? 0);
    if ($exercise === '' || $duration <= 0) {
        json_response(['ok' => false, 'error' => 'Dados inválidos para treino'], 422);
    }
    if ($points <= 0) {
        $points = max(5, (int)floor($duration / 2));
    }
    $ins = $pdo->prepare(
        'INSERT INTO workouts (user_id, challenge_id, exercise, duration_minutes, points, performed_at)
         VALUES (?, ?, ?, ?, ?, NOW())'
    );
    $ins->execute([(int)$user['sub'], $challengeId > 0 ? $challengeId : null, $exercise, $duration, $points]);

    if ($challengeId > 0) {
        $upsert = $pdo->prepare(
            'INSERT INTO challenge_entries (challenge_id, user_id, score, updated_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE score = score + VALUES(score), updated_at = NOW()'
        );
        $upsert->execute([$challengeId, (int)$user['sub'], $points]);
    }

    json_response(['ok' => true, 'message' => 'Treino registado']);
}

json_response(['ok' => false, 'error' => 'Rota não encontrada'], 404);

