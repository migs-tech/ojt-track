<?php

class AuthHelper {
    private static $conn;
    private static $currentUser;

    public static function init() {
        $db = new Database();
        self::$conn = $db->getConnection();
    }

    public static function getBearerToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function login($email, $password) {
        if (!self::$conn) {
            self::init();
        }

        $stmt = self::$conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $token = bin2hex(random_bytes(32));
            $update = self::$conn->prepare("UPDATE users SET api_token = :token WHERE id = :id");
            $update->execute(['token' => $token, 'id' => $user['id']]);

            return ['token' => $token, 'user' => $user];
        }

        return ['error' => 'Invalid credentials'];
    }

    public static function validateToken() {
        if (!self::$conn) {
            self::init();
        }

        $token = self::getBearerToken();
        if (!$token) return false;

        $stmt = self::$conn->prepare("SELECT * FROM users WHERE api_token = :token");
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
        if (!self::$currentUser) {
            self::validateToken();
        }

        if (!$key) {
            return self::$currentUser;
        }

        return self::$currentUser[$key] ?? null;
    }

    public static function id() {
        return self::user('id');
    }
}
?>
