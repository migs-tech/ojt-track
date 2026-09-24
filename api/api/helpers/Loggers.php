<?php
$rootPath = dirname(__DIR__, 2); 
$logDir = $rootPath . DIRECTORY_SEPARATOR . 'logs';
error_reporting(E_ALL);
ini_set('display_errors', 1); 
ini_set('log_errors', 1);
ini_set('error_log', $logDir . DIRECTORY_SEPARATOR . 'error.log');
function logs($data, $filename = 'debug.log') {
    $log = "\n=== [" . date('Y-m-d H:i:s') . "] ===\n" . print_r($data, true) . "\n";

    $rootPath = dirname(__DIR__, 2); // ../../ from Controller/
    $logDir = $rootPath . DIRECTORY_SEPARATOR . 'logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $path = $logDir . DIRECTORY_SEPARATOR . $filename; 

    if (file_put_contents($path, $log, FILE_APPEND) === false) {
    } 
}

function logError($data, $filename = 'error.log') {
    $log = "\n=== [" . date('Y-m-d H:i:s') . "] ===\n" . print_r($data, true) . "\n";
    
    $rootPath = dirname(__DIR__, 2); 
    $logDir = $rootPath . DIRECTORY_SEPARATOR . 'logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    
    $path = $logDir . DIRECTORY_SEPARATOR . $filename;

    if (file_put_contents($path, $log, FILE_APPEND) === false) {
    } 
}       

function interpolateQuery($query, $params) {
    foreach ($params as $key => $value) {
        if (is_string($value)) {
            $value = "'" . addslashes($value) . "'";
        } elseif (is_null($value)) {
            $value = 'NULL';
        } elseif (is_bool($value)) {
            $value = $value ? '1' : '0';
        }

        $key = strpos($key, ':') === 0 ? $key : ':' . $key;
        $query = str_replace($key, $value, $query);
    }
    return $query;
}

function logSqlTrace($query, $params = [], $filename = 'sql_trace.log') {
    $interpolated = interpolateQuery($query, $params);

    $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 10); 
    $callerInfo = 'unknown';

    foreach ($trace as $t) {
        if (isset($t['class']) && isset($t['function']) && isset($t['file']) && isset($t['line'])) {
            $callerInfo = "{$t['class']}::{$t['function']} (".basename($t['file']).":{$t['line']})";
            break;
        }
    }

    $log = "\n[" . date('Y-m-d H:i:s') . "] Query_trace: -- {$callerInfo}\n";
    $log .= $interpolated . ";\n";

    $logDir = dirname(__DIR__, 2) . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }

    $path = $logDir . DIRECTORY_SEPARATOR . $filename;
    file_put_contents($path, $log, FILE_APPEND);
}



