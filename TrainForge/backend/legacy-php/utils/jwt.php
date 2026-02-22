<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function b64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string
{
    $pad = strlen($data) % 4;
    if ($pad > 0) {
        $data .= str_repeat('=', 4 - $pad);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function create_access_token(array $payload): string
{
    $secret = env('JWT_SECRET', 'trainforge-dev-secret');
    $ttl = (int)(env('JWT_TTL', '900') ?? 900);
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now = time();
    $payload['iat'] = $now;
    $payload['exp'] = $now + $ttl;

    $h = b64url_encode(json_encode($header, JSON_UNESCAPED_UNICODE));
    $p = b64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $sig = hash_hmac('sha256', "{$h}.{$p}", $secret, true);
    $s = b64url_encode($sig);
    return "{$h}.{$p}.{$s}";
}

function verify_access_token(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$h, $p, $s] = $parts;
    $secret = env('JWT_SECRET', 'trainforge-dev-secret');
    $calc = b64url_encode(hash_hmac('sha256', "{$h}.{$p}", $secret, true));
    if (!hash_equals($calc, $s)) {
        return null;
    }
    $payload = json_decode(b64url_decode($p), true);
    if (!is_array($payload)) {
        return null;
    }
    if (!isset($payload['exp']) || time() > (int)$payload['exp']) {
        return null;
    }
    return $payload;
}

function generate_refresh_token(): string
{
    return bin2hex(random_bytes(32));
}

function hash_refresh_token(string $token): string
{
    return hash('sha256', $token);
}

function generate_session_id(): string
{
    return bin2hex(random_bytes(16));
}

