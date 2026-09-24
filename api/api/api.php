<?php

require_once 'initialize.php';

// Browsers may only call the API from the web apps listed in ALLOWED_ORIGINS.
// The mobile app doesn't send an Origin header, so it isn't affected.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', defined('ALLOWED_ORIGINS') ? ALLOWED_ORIGINS : '')));
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}
header('X-Content-Type-Options: nosniff');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getData(): ?array {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $files = $_FILES ?? null;
   
    return ['data' => $data, 'files' => $files];
    
}

function sendJsonResponse($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function validateId($id): bool {
    return is_numeric($id) && $id > 0;
}

$basePath = '/api/';
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = strpos($requestUri, $basePath) === 0 ? substr($requestUri, strlen($basePath)) : $requestUri;
$path = trim($path, '/');

$queryParams = [];
$queryString = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
if ($queryString) {
    parse_str($queryString, $queryParams);
}

// Health check for the host and keep-awake pings: GET /api/health
if ($path === 'health') {
    sendJsonResponse(['ok' => true, 'time' => date('c')]);
}

$segments = explode('/', $path);
$controllerName = $segments[0] ?? '';
$methodName = $segments[1] ?? null;
$id = $segments[2] ?? null;

$routes = [
    'user' => UsersController::class,
    'report' => GenerateReportController::class,
    'cron_job' => AutomateReportController::class,
    'attendance' => UserAttendanceController::class,
    'trainee' => TraineeController::class,
    'cron' => CronJobController::class,
    'notification' => SendNotificationController::class,
    'dashboard' => DashboardController::class,
    'admin' => AdminController::class,
];

if (!array_key_exists($controllerName, $routes)) {
    sendJsonResponse(['error' => 'Resource not found'], 404);
}

Access::enforce($controllerName, $methodName);

$controllerClass = $routes[$controllerName];
$controller = new $controllerClass();
try {
    switch ($requestMethod) {
        case 'GET':
            
            $response = $id ? $controller->$methodName($id) : $controller->$methodName($queryParams);
            sendJsonResponse($response);
            break;

        case 'POST':
            $data = getData();
            if ($data['data'] === null || $data['files'] === null) {
                sendJsonResponse(['error' => 'No data or files provided'], 400);
            }
            $response = $controller->$methodName($data);
            if (is_array($response) && isset($response['error'])) {
                $status = ($response['error'] === 'Invalid credentials.') ? 401 : 422;
                sendJsonResponse($response, $status);
            }
            sendJsonResponse($response, 200);
            break;

        case 'PUT':
            if (!$id) {
                sendJsonResponse(['error' => 'ID is required for updates'], 400);
            }
            $data = getData();
            if ($data['data'] === null) {
                sendJsonResponse(['error' => 'Invalid JSON input'], 400);
            }
            $response = $controller->$methodName($id, $data);
            sendJsonResponse($response);
            break;

        case 'DELETE':
            if (!$id) {
                sendJsonResponse(['error' => 'ID is required for deletion'], 400);
            }
            $response = $controller->$methodName($id);
            sendJsonResponse($response, 200);
            break;

        default:
            sendJsonResponse(['error' => 'Method not supported'], 405);
    }
} catch (Throwable $e) {
    // Details go to the server log only; clients get a generic message.
    error_log('[api] ' . $controllerName . '/' . $methodName . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    sendJsonResponse(['error' => 'Server error. Please try again later.'], 500);
}
