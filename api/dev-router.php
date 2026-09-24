<?php
/**
 * Router for PHP's built-in server, mirroring api/.htaccess and api/uploads/.htaccess.
 * Local development only:
 *
 *   cd api && php -S localhost:8080 dev-router.php
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (strpos($path, '/api/uploads/') === 0) {
    $file = realpath(__DIR__ . '/api' . substr($path, 4));
    $uploads = realpath(__DIR__ . '/api/uploads');
    // Never execute anything from uploads; only serve existing files inside the folder.
    if (!$file || strpos($file, $uploads) !== 0 || !is_file($file)
        || preg_match('/\.(php\d*|phtml|phar|pht|phps|htaccess)$/i', $file)) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: ' . (mime_content_type($file) ?: 'application/octet-stream'));
    header('X-Content-Type-Options: nosniff');
    readfile($file);
    exit;
}

chdir(__DIR__ . '/api');
require __DIR__ . '/api/api.php';
