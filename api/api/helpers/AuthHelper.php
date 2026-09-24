<?php

class AuthHelper {
    private static $conn;
    private static $currentUser;
    private static $checked = false;

    public static function init() {
        $db = new Database();
        self::$conn = $db->getConnection();
    }

    private static function conn() {
        if (!self::$conn) {
            self::init();
        }
        return self::$conn;
    }

    public static function getBearerToken() {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if (!$header && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    $header = $value;
                    break;
                }
            }
        }
        if ($header && preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Returns the user's current token, or issues a new random one if it is missing or expired.
     * Reusing a valid token keeps the user signed in on their other devices.
     */
    public static function issueToken(array $user): string {
        $expires = $user['api_token_expires'] ?? null;
        if (!empty($user['api_token']) && $expires && strtotime($expires) > time()) {
            return $user['api_token'];
        }

        $token = bin2hex(random_bytes(32));
        $ttlDays = defined('TOKEN_TTL_DAYS') ? (int) TOKEN_TTL_DAYS : 30;
        $stmt = self::conn()->prepare(
            "UPDATE users SET api_token = :token, api_token_expires = :expires WHERE id = :id"
        );
        $stmt->execute([
            'token'   => $token,
            'expires' => date('Y-m-d H:i:s', strtotime("+{$ttlDays} days")),
            'id'      => $user['id'],
        ]);
        return $token;
    }

    /** Invalidates the given user's token (logout). */
    public static function revokeToken(int $userId): void {
        $stmt = self::conn()->prepare("UPDATE users SET api_token = NULL, api_token_expires = NULL WHERE id = :id");
        $stmt->execute(['id' => $userId]);
    }

    public static function validateToken() {
        if (self::$checked) {
            return self::$currentUser ?: false;
        }
        self::$checked = true;

        $token = self::getBearerToken();
        if (!$token || strlen($token) < 32) return false;

        $stmt = self::conn()->prepare(
            "SELECT * FROM users WHERE api_token = :token AND api_token_expires > NOW()"
        );
        $stmt->execute(['token' => $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            self::$currentUser = $user;
            return $user;
        }

        return false;
    }

    public static function requireAuth() {
        $user = self::validateToken();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        return $user;
    }

    public static function user($key = null) {
        $user = self::validateToken();
        if (!$user) {
            return null;
        }
        if (!$key) {
            return $user;
        }
        return $user[$key] ?? null;
    }

    public static function id() {
        return self::user('id');
    }

    public static function role(): int {
        return (int) self::user('role');
    }

    /**
     * Whether the current user may see or act on the given trainee:
     * the trainee themself, their assigned supervisor, or staff (coordinator/admin).
     */
    public static function canAccessTrainee($traineeId): bool {
        $user = self::validateToken();
        if (!$user || !is_numeric($traineeId)) return false;

        $role = (int) $user['role'];
        if (in_array($role, Access::STAFF, true)) return true;
        if ($role === Access::TRAINEE) return (int) $user['id'] === (int) $traineeId;
        if ($role === Access::SUPERVISOR) {
            $stmt = self::conn()->prepare(
                "SELECT 1 FROM supervisor_trainees WHERE supervisor_id = :sid AND trainee_id = :tid LIMIT 1"
            );
            $stmt->execute(['sid' => $user['id'], 'tid' => $traineeId]);
            return (bool) $stmt->fetchColumn();
        }
        return false;
    }
}
?>
