<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function send_notification_mail(string $subject, string $message): bool
{
    $to = env('MAIL_TO', 'admin@trainforge.local');
    $from = env('MAIL_FROM', 'no-reply@trainforge.local');
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/plain;charset=UTF-8\r\n";
    $headers .= "From: {$from}\r\n";

    // Em ambiente local sem SMTP configurado, o retorno pode ser false.
    return @mail($to, $subject, $message, $headers);
}

