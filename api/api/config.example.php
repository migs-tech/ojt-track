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
