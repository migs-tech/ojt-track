<?php
// Copy this file to config.php and fill in your own values.
// config.php is ignored by git — never commit real credentials.

if ($_SERVER['SERVER_NAME'] === 'localhost') {
    define('DB_HOST', '127.0.0.1');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'ojt');
    define('DB_PORT', 3306);
} else {
    define('DB_HOST', 'your-db-host');
    define('DB_USER', 'your-db-user');
    define('DB_PASS', 'your-db-password');
    define('DB_NAME', 'your-db-name');
    define('DB_PORT', 3306);
}

define('MAIL_HOST', 'smtp.example.com');
define('MAIL_USERNAME', 'you@example.com');
define('MAIL_PASSWORD', 'your-smtp-password');
define('MAIL_PORT', 587);
define('MAIL_FROM_EMAIL', 'no-reply@example.com');
define('MAIL_FROM_NAME', 'OJT Track');
define('MAIL_REPLYTO_EMAIL', 'support@example.com');
define('MAIL_REPLYTO_NAME', 'OJT Track Support');

define('RECAPTCHA_SECRET_KEY', 'your-recaptcha-secret-key');

if (!defined('OPENAI_API_KEY')) {
    define('OPENAI_API_KEY', 'your-openai-api-key');
}

// Public URL of this API, without a trailing slash
if (!defined('BASE_URL')) define('BASE_URL', 'http://localhost:8080');
// Web apps allowed to call the API from a browser, comma-separated
define('ALLOWED_ORIGINS', 'http://localhost:5173');
// Secret for scheduled jobs (header X-Cron-Secret or ?key=). Use a long random string.
define('CRON_SECRET', '');
// How long a login stays valid
define('TOKEN_TTL_DAYS', 30);
// Path to a CA certificate bundle to use TLS for the database (e.g. TiDB Cloud); empty = off
define('DB_SSL_CA', '');
