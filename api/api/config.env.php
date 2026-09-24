<?php
// Settings from environment variables (used on the hosting server, e.g. Render).
// For local development, copy config.example.php to config.php instead; it takes priority.

$env = function (string $name, $default = null) {
    $value = getenv($name);
    return ($value === false || $value === '') ? $default : $value;
};

define('DB_HOST', $env('DB_HOST', '127.0.0.1'));
define('DB_USER', $env('DB_USER', 'root'));
define('DB_PASS', $env('DB_PASS', ''));
define('DB_NAME', $env('DB_NAME', 'ojt'));
define('DB_PORT', (int) $env('DB_PORT', 3306));
// Path to a CA bundle enables TLS for the database connection (required by TiDB Cloud).
define('DB_SSL_CA', $env('DB_SSL_CA', ''));

define('MAIL_HOST', $env('MAIL_HOST', ''));
define('MAIL_USERNAME', $env('MAIL_USERNAME', ''));
define('MAIL_PASSWORD', $env('MAIL_PASSWORD', ''));
define('MAIL_PORT', (int) $env('MAIL_PORT', 587));
define('MAIL_FROM_EMAIL', $env('MAIL_FROM_EMAIL', ''));
define('MAIL_FROM_NAME', $env('MAIL_FROM_NAME', 'OJT Track'));
define('MAIL_REPLYTO_EMAIL', $env('MAIL_REPLYTO_EMAIL', $env('MAIL_FROM_EMAIL', '')));
define('MAIL_REPLYTO_NAME', $env('MAIL_REPLYTO_NAME', 'OJT Track'));

define('RECAPTCHA_SECRET_KEY', $env('RECAPTCHA_SECRET_KEY', ''));
define('OPENAI_API_KEY', $env('OPENAI_API_KEY', ''));

// Public URL of this API server, without a trailing slash (e.g. https://ojt-api.onrender.com)
define('BASE_URL', rtrim($env('BASE_URL', 'http://localhost:8080'), '/'));
// Web apps allowed to call the API from a browser, comma-separated
define('ALLOWED_ORIGINS', $env('ALLOWED_ORIGINS', 'http://localhost:5173'));
// Secret for scheduled jobs (send as header X-Cron-Secret or ?key=)
define('CRON_SECRET', $env('CRON_SECRET', ''));
define('TOKEN_TTL_DAYS', (int) $env('TOKEN_TTL_DAYS', 30));
