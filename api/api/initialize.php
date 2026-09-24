<?php
ob_start();
date_default_timezone_set('Asia/Manila');
session_start();

require_once '../vendor/autoload.php';

require_once 'database/Database.php';

foreach (glob("helpers/*.php") as $file) {
    require_once $file;
    if (function_exists('logs')) {
         
    }
}

foreach (glob("Controller/*.php") as $file) {
    require_once $file;
    if (function_exists('logs')) {
    }
}

foreach (glob("Email/*.php") as $file) {
    require_once $file;
    if (function_exists('logs')) {
    }
}

foreach (glob("Lib/*.php") as $file) {
    require_once $file;
    if (function_exists('logs')) {
    }
}

require_once __DIR__ . '/config.php';

if ($_SERVER['SERVER_NAME'] === 'localhost') {
    if (!defined('BASE_URL')) {
        define('BASE_URL', 'http://localhost/ojt/');
    }
} else {
    if (!defined('BASE_URL')) {
        define('BASE_URL', 'https://ojt.kamsite.com');
    }
}

if (!defined('BASE_APP')) {
    define('BASE_APP', str_replace('\\', '/', __DIR__) . '/');
}
if (!defined('BASE_PATH')) {
    define('BASE_PATH', str_replace($_SERVER['DOCUMENT_ROOT'], '', str_replace('\\', '/', __DIR__)) . '/');
}
if (!defined('BASE_API')) {
    define('BASE_API', BASE_URL . 'api/');
}
if (!defined('BASE_ASSETS')) {
    define('BASE_ASSETS', BASE_URL . 'assets/');
}
if (!defined('BASE_IMAGES')) {
    define('BASE_IMAGES', BASE_ASSETS . 'images/');
}
if (!defined('BASE_CSS')) {
    define('BASE_CSS', BASE_ASSETS . 'css/');
}


function redirect($url = '') {
    if (!empty($url)) {
        echo '<script>location.href="' . BASE_URL . $url . '"</script>';   
    }
}
?>
