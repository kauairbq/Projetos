<?php

declare(strict_types=1);

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(.*)$/i', (string)$header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function require_auth(): array
{
    $token = bearer_token();
    if (!$token) {
        json_response(['ok' => false, 'error' => 'Token ausente'], 401);
    }
    $payload = verify_access_token($token);
    if (!$payload) {
        json_response(['ok' => false, 'error' => 'Token inválido'], 401);
    }
    return $payload;
}

function require_roles(array $allowed): array
{
    $user = require_auth();
    if (!in_array($user['role'] ?? '', $allowed, true)) {
        json_response(['ok' => false, 'error' => 'Sem permissão'], 403);
    }
    return $user;
}

