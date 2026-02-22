<?php

declare(strict_types=1);

require_once __DIR__ . '/../utils/response.php';

preflight_exit();
json_response(['ok' => true, 'service' => 'trainforge-api', 'time' => date(DATE_ATOM)]);

