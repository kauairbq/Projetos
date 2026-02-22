<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/mailer.php';

preflight_exit();
$pdo = db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = request_json();

if ($method === 'GET') {
    require_roles(['admin', 'trainer']);
    $stmt = $pdo->query(
        'SELECT f.id, f.subject, f.message, f.rating, f.created_at, u.name AS user_name
         FROM feedback f
         INNER JOIN users u ON u.id = f.user_id
         ORDER BY f.created_at DESC'
    );
    json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $user = require_auth();
    $subject = trim((string)($input['subject'] ?? 'Feedback TrainForge'));
    $message = trim((string)($input['message'] ?? ''));
    $rating = (int)($input['rating'] ?? 0);
    if ($message === '') {
        json_response(['ok' => false, 'error' => 'Mensagem é obrigatória'], 422);
    }
    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }
    $ins = $pdo->prepare('INSERT INTO feedback (user_id, subject, message, rating, created_at) VALUES (?, ?, ?, ?, NOW())');
    $ins->execute([(int)$user['sub'], $subject, $message, $rating]);

    send_notification_mail(
        '[TrainForge] Novo feedback',
        "Utilizador: {$user['name']}\nAssunto: {$subject}\nRating: {$rating}\n\n{$message}"
    );

    json_response(['ok' => true, 'message' => 'Feedback enviado']);
}

json_response(['ok' => false, 'error' => 'Rota não encontrada'], 404);

