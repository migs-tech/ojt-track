<?php

class Cache {
    private static $cacheDir;
    private static $defaultTtl = 300; 

    private static function ensureInitialized() {
        if (!self::$cacheDir) {
            self::$cacheDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'cache';
        }
    }

    public static function initialize() {
        self::ensureInitialized();
    }

    public static function get($key) {
        self::ensureInitialized();
        $file = self::getFilePath($key);

        if (file_exists($file)) {
            $contents = file_get_contents($file);
            $data = @unserialize($contents);

            if (is_array($data) && isset($data['value'], $data['timestamp'])) {
                if ((time() - $data['timestamp']) < self::$defaultTtl) {
                    return $data['value'];
                } else {
                    self::clear($key);
                }
            }
        }

        return false;
    }

    public static function set($key, $value, $ttl = null) {
        self::ensureInitialized();

        if (!file_exists(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0775, true);
        }

        $data = [
            'value' => $value,
            'timestamp' => time() - (self::$defaultTtl - ($ttl ?? self::$defaultTtl))
        ];

        $file = self::getFilePath($key);
        file_put_contents($file, serialize($data), LOCK_EX);
    }

    public static function clear($key) {
        self::ensureInitialized();
        $file = self::getFilePath($key);
        if (file_exists($file)) {
            unlink($file);
        }
    }

    public static function clearMatching($prefix) {
        self::ensureInitialized();
        $safePrefix = self::sanitizeKey($prefix);

        foreach (glob(self::$cacheDir . DIRECTORY_SEPARATOR . $safePrefix . '*.cache') as $file) {
            unlink($file);
        }
    }

    private static function sanitizeKey($key) {
        return preg_replace('/[^a-zA-Z0-9_\-]/', '_', $key);
    }

    private static function getFilePath($key) {
        self::ensureInitialized();
        $safeKey = self::sanitizeKey($key);
        return self::$cacheDir . DIRECTORY_SEPARATOR . $safeKey . '.cache';
    }
}
