<?php
/**
 * Database-backed attempt limiter (works across devices and without cookies).
 * Usage:
 *   if (RateLimiter::tooMany("login:$ip", 10, 900)) return [...];
 *   ... on failure: RateLimiter::hit("login:$ip", 900);
 *   ... on success: RateLimiter::clear("login:$ip");
 */
class RateLimiter {
    private static $conn;

    private static function conn() {
        if (!self::$conn) {
            self::$conn = (new Database())->getConnection();
        }
        return self::$conn;
    }

    private static function key(string $key): string {
        return hash('sha256', strtolower($key));
    }

    /** True if the key has reached $max attempts within the current window. */
    public static function tooMany(string $key, int $max, int $windowSeconds): bool {
        $stmt = self::conn()->prepare("SELECT attempts, window_start FROM rate_limits WHERE rate_key = :k");
        $stmt->execute(['k' => self::key($key)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return false;
        if (strtotime($row['window_start']) + $windowSeconds < time()) return false;
        return (int) $row['attempts'] >= $max;
    }

    /** Records one attempt, starting a new window if the old one has expired. */
    public static function hit(string $key, int $windowSeconds): void {
        $k = self::key($key);
        $now = date('Y-m-d H:i:s');
        $cutoff = date('Y-m-d H:i:s', time() - $windowSeconds);
        $stmt = self::conn()->prepare(
            "INSERT INTO rate_limits (rate_key, attempts, window_start) VALUES (:k, 1, :now)
             ON DUPLICATE KEY UPDATE
                attempts = IF(window_start < :cutoff, 1, attempts + 1),
                window_start = IF(window_start < :cutoff2, :now2, window_start)"
        );
        $stmt->execute(['k' => $k, 'now' => $now, 'cutoff' => $cutoff, 'cutoff2' => $cutoff, 'now2' => $now]);
    }

    /** Checks and records in one step; returns true if the caller is over the limit. */
    public static function attempt(string $key, int $max, int $windowSeconds): bool {
        if (self::tooMany($key, $max, $windowSeconds)) return true;
        self::hit($key, $windowSeconds);
        return false;
    }

    public static function clear(string $key): void {
        $stmt = self::conn()->prepare("DELETE FROM rate_limits WHERE rate_key = :k");
        $stmt->execute(['k' => self::key($key)]);
    }
}
