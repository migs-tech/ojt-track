<?php
/**
 * Creates (or promotes) an admin account. Command line only.
 *
 *   php tools/create_admin.php <username> <email>
 *
 * The password is read from the ADMIN_PASSWORD environment variable, or prompted for.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

chdir(__DIR__ . '/..');
$_SERVER['SERVER_NAME'] = $_SERVER['SERVER_NAME'] ?? 'cli';
$_SERVER['DOCUMENT_ROOT'] = $_SERVER['DOCUMENT_ROOT'] ?? '';
require_once 'initialize.php';

[$script, $username, $email] = array_pad($argv, 3, null);
if (!$username || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php tools/create_admin.php <username> <email>\n");
    exit(1);
}

$password = getenv('ADMIN_PASSWORD') ?: null;
if (!$password) {
    echo "Password (min 10 characters): ";
    $password = trim((string) fgets(STDIN));
}
if (strlen($password) < 10) {
    fwrite(STDERR, "Password must be at least 10 characters.\n");
    exit(1);
}

$conn = (new Database())->getConnection();
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
$stmt->execute(['email' => $email, 'username' => $username]);
$existing = $stmt->fetchColumn();

if ($existing) {
    $conn->prepare("UPDATE users SET role = 4, status = 1, password = :p WHERE id = :id")
        ->execute(['p' => $hash, 'id' => $existing]);
    echo "Updated user #$existing to admin.\n";
} else {
    $conn->prepare(
        "INSERT INTO users (username, email, password, complete_name, role, status, email_flg)
         VALUES (:u, :e, :p, :n, 4, 1, 1)"
    )->execute(['u' => $username, 'e' => $email, 'p' => $hash, 'n' => $username]);
    echo "Created admin #" . $conn->lastInsertId() . ".\n";
}
