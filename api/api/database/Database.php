<?php
/**
 * Class Database
 * 
 * This class provides a connection to a MySQL database using PDO and offers various methods to interact with the database.
 * 
 * @package Database
 * 
 * @property string $host The hostname of the database server.
 * @property string $db_name The name of the database.
 * @property string $username The username for the database connection.
 * @property string $password The password for the database connection.
 * @property int $port The port number for the database connection.
 * @property PDO $conn The PDO instance representing the database connection.
 */

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $port = DB_PORT;
    private $conn;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        try {
            $dsn = "mysql:host=$this->host;port=$this->port;dbname=$this->db_name;charset=utf8mb4";
            $options = [];
            // TLS for hosted databases such as TiDB Cloud
            if (defined('DB_SSL_CA') && DB_SSL_CA !== '') {
                $options[PDO::MYSQL_ATTR_SSL_CA] = DB_SSL_CA;
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
            }
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log('[db] Connection failed: ' . $e->getMessage());
            http_response_code(503);
            header('Content-Type: application/json; charset=utf-8');
            die(json_encode(['error' => 'Service temporarily unavailable.']));
        }
    }
    
    public function getConnection() {
        if (!$this->isConnectionAlive()) {
            logs("Reconnecting to MySQL server...", "cron_debug.log");
            $this->connect();
        }
        return $this->conn;
    }
    
    public function isConnectionAlive(): bool{
        try {
            $this->conn->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function query($sql) {
        return $this->conn->query($sql);
    }

    public function prepare($sql) {
        return $this->conn->prepare($sql);
    }

    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    public function __destruct() {
        $this->conn = null;
    }

    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    public function commit() {
        return $this->conn->commit();
    }

    public function rollBack() {
        return $this->conn->rollBack();
    }

    public function fetchAll($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function fetch($sql) {
        return $this->conn->query($sql)->fetch(PDO::FETCH_ASSOC);
    }

    public function execute($sql) {
        return $this->conn->exec($sql);
    }

    public function fetchColumn($sql) {
        return $this->conn->query($sql)->fetchColumn();
    }

    public function fetchAllColumn($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN);
    }

    public function fetchAllKeyPair($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_KEY_PAIR);
    }

    public function fetchAllGroup($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_GROUP);
    }

    public function fetchAllUnique($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_UNIQUE);
    }

    public function fetchAllLazy($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_LAZY);
    }

    public function fetchAllObj($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_OBJ);
    }

    public function fetchAllClass($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS, $class);
    }

    public function fetchAllClassArgs($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS, $class, $args);
    }

    public function fetchAllInto($sql, $object) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_INTO, $object);
    }

    public function fetchAllFunc($sql, $func) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_FUNC, $func);
    }

    public function fetchAllGroupColumn($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP);
    }

    public function fetchAllGroupClass($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS | PDO::FETCH_GROUP, $class);
    }

    public function fetchAllGroupClassArgs($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS | PDO::FETCH_GROUP, $class, $args);
    }

    public function fetchAllGroupUnique($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_GROUP);
    }

    public function fetchAllGroupLazy($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_LAZY | PDO::FETCH_GROUP);
    }

    public function fetchAllGroupObj($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_OBJ | PDO::FETCH_GROUP);
    }

    public function fetchAllGroupClassObj($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class);
    }

    public function fetchAllGroupClassArgsObj($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class, $args);
    }

    public function fetchAllGroupInto($sql, $object) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_INTO | PDO::FETCH_GROUP, $object);
    }

    public function fetchAllGroupFunc($sql, $func) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_FUNC | PDO::FETCH_GROUP, $func);
    }

    public function fetchAllGroupColumnClass($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_CLASS, $class);
    }

    public function fetchAllGroupColumnClassArgs($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_CLASS, $class, $args);
    }

    public function fetchAllGroupColumnUnique($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE);
    }

    public function fetchAllGroupColumnLazy($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_LAZY);
    }

    public function fetchAllGroupColumnObj($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_OBJ);
    }

    public function fetchAllGroupColumnClassObj($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class);
    }

    public function fetchAllGroupColumnClassArgsObj($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class, $args);
    }

    public function fetchAllGroupColumnInto($sql, $object) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_INTO, $object);
    }

    public function fetchAllGroupColumnFunc($sql, $func) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_FUNC, $func);
    }

    public function fetchAllGroupColumnUniqueClass($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS, $class);
    }

    public function fetchAllGroupColumnUniqueArgs($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS, $class, $args);
    }

    public function fetchAllGroupColumnUniqueObj($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_OBJ);
    }

    public function fetchAllGroupColumnUniqueClassObj($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class);
    }

    public function fetchAllGroupColumnUniqueClassArgsObj($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS | PDO::FETCH_OBJ, $class, $args);
    }

    public function fetchAllGroupColumnUniqueInto($sql, $object) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_INTO, $object);
    }

    public function fetchAllGroupColumnUniqueFunc($sql, $func) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_FUNC, $func);
    }

    public function fetchAllGroupColumnUniqueLazy($sql) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_LAZY);
    }

    public function fetchAllGroupColumnUniqueClassLazy($sql, $class) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS | PDO::FETCH_LAZY, $class);
    }

    public function fetchAllGroupColumnUniqueClassArgsLazy($sql, $class, $args) {
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_COLUMN | PDO::FETCH_GROUP | PDO::FETCH_UNIQUE | PDO::FETCH_CLASS | PDO::FETCH_LAZY, $class, $args);
    }
}