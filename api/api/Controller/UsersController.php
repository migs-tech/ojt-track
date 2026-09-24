<?php
  use PhpOffice\PhpSpreadsheet\Spreadsheet;
  use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
class UsersController {
    private $conn;
    private $notification;
    private $RECAPTCHA_SECRET_KEY;

    public function __construct() {
        $this->conn = new Database();
        $this->notification = new SendNotificationController();
        $this->RECAPTCHA_SECRET_KEY = RECAPTCHA_SECRET_KEY;
    }

    /**
     * Register a new user
     */
    public function register($params) {
        try {
            $username = trim($params['data']['username'] ?? '');
            $email    = trim($params['data']['email'] ?? '');
            $password = $params['data']['password'] ?? '';
            $role     = $params['data']['userRole'] ?? 1;

            if (empty($username) || empty($email) || empty($password)) {
                return [
                    'success' => false,
                    'message' => 'Username, email, and password are required.'
                ];
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message' => 'Invalid email format.'
                ];
            }

            if (strlen($password) < 6) {
                return [
                    'success' => false,
                    'message' => 'Password must be at least 6 characters long.'
                ];
            }

            $ip = getClientIp();

            $stmt = $this->conn->prepare("SELECT email, username FROM users WHERE email = :email OR username = :username");
            $stmt->execute(['email' => $email, 'username' => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($user['email'] === $email) {
                    return [
                        'success' => false,
                        'message' => 'Email already exists.'
                    ];
                }
                if ($user['username'] === $username) {
                    return [
                        'success' => false,
                        'message' => 'Username already exists.'
                    ];
                }
            }

            $requiredHours = ($role == 1) ? 486 : null;
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $apiToken = $this->generateApiToken($ip);

            $stmt = $this->conn->prepare(
                "INSERT INTO users (username, email, password, role, api_token, ojt_required_hours, created_ip) 
                 VALUES (:username, :email, :password, :role, :api_token, :requiredHours, :created_ip)"
            );
            $stmt->execute([
                'username'      => $username,
                'email'         => $email,
                'password'      => $hashedPassword,
                'role'          => $role,
                'api_token'     => $apiToken,
                'requiredHours' => $requiredHours,
                'created_ip'    => $ip,
            ]);

            if ($stmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'User registered successfully.'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to register user.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }
    
    /** Generate a unique API token
     */
    private function generateApiToken($ip) {
        return md5(time() . ip2long($ip) . uniqid());
    }

    /**
     * User login
     */
    public function login($params) {
        try {
            $loginInput = trim($params['data']['username'] ?? '');
            $password   = $params['data']['password'] ?? '';
            $role       = $params['data']['role'] ?? null;
            $captcha_token = $params['data']['captcha_token'] ?? null;

            $secretKey = $this->RECAPTCHA_SECRET_KEY;
            
            if(!empty($captcha_token)) {
                $captchaUrl = 'https://www.google.com/recaptcha/api/siteverify';

                $captchaResponse = file_get_contents($captchaUrl . '?secret=' . $secretKey . '&response=' . $captcha_token);
                $captchaData = json_decode($captchaResponse, true);

                if (!$captchaData['success']) {
                    return ['success' => false, 'message' => 'Captcha verification failed.'];
                }
            }

            if (empty($loginInput) || empty($password)) {
                return ['success' => false, 'message' => 'Email/Username and password are required.'];
            }

            $ip = getClientIp();
            $maxAttempts = 5;
            $lockoutMinutes = 5;

            if (!isset($_SESSION['login_attempts'])) {
                $_SESSION['login_attempts'] = [];
            }
            if (!isset($_SESSION['login_attempts'][$ip])) {
                $_SESSION['login_attempts'][$ip] = [
                    'count'        => 0,
                    'last_attempt' => time()
                ];
            }

            if (time() - $_SESSION['login_attempts'][$ip]['last_attempt'] > $lockoutMinutes * 60) {
                $_SESSION['login_attempts'][$ip]['count'] = 0;
            }

            if ($_SESSION['login_attempts'][$ip]['count'] >= $maxAttempts) {
                return [
                    'success' => false,
                    'message' => 'Too many login attempts. Please try again later in ' . $lockoutMinutes . ' minutes.'
                ];
            }

            $field = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

            $sql = "SELECT * FROM users WHERE $field = :loginInput";
            if ($role !== null) {
                $sql .= " AND role = :role";
            }
            $stmt = $this->conn->prepare($sql);

            $paramsArr = ['loginInput' => $loginInput];
            if ($role !== null) {
                $paramsArr['role'] = $role;
            }

            $stmt->execute($paramsArr);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['login_attempts'][$ip]['count'] = 0;
                return [
                    'success' => true,
                    'message' => 'Login successful.',
                    'user'    => [
                        'id'           => $user['id'],
                        'username'     => $user['username'],
                        'email'        => $user['email'],
                        'role'         => $user['role'],
                        'complete_name'=> $user['complete_name'] ?? null,
                        'avatar_url'   => $user['avatar_url'] ?? null,
                        'email_flg'    => $user['email_flg'] ?? null,
                        'status'       => $user['status'] ?? null,
                    ],
                    'token'   => $user['api_token']
                ];
            } else {
                $_SESSION['login_attempts'][$ip]['count'] += 1;
                $_SESSION['login_attempts'][$ip]['last_attempt'] = time();
                return [
                    'success' => false,
                    'message' => 'Invalid credentials.',
                    'error'   => 'Invalid credentials.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Fetch or generate today's QR code
     */
    public function fetchOrGenerateQrCode() {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $today = date('Y-m-d');

            $stmt = $this->conn->prepare(
                "SELECT * FROM qr_codes WHERE user_id = :user_id AND DATE(created_at) = :today ORDER BY created_at DESC LIMIT 1"
            );
            $stmt->execute(['user_id' => $userId, 'today' => $today]);
            $existingQr = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existingQr) {
                $expiresAt = strtotime($existingQr['expires_at']);
                $isExpired = $expiresAt < time();

                return [
                    'success' => true,
                    'status'  => $existingQr['is_used'] ? 'used' : ($isExpired ? 'expired' : 'active'),
                    'qr'      => $existingQr
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No QR code found for today.',
                    'qr'      => null
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }
    
    /** 
     * Generate a new QR code for the user
     */
    public function generateQRCode() {
        try {
            
            $userId = AuthHelper::validateToken()['id'];
            
            $token = bin2hex(random_bytes(4));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+40 minutes'));
            $now = date('Y-m-d H:i:s');
            $today = date('Y-m-d');

            $insert = $this->conn->prepare(
                "INSERT INTO qr_codes (user_id, created_at, expires_at, is_used, qr_code)
                 VALUES (:user_id, :created_at, :expires_at, 0, :qr_code)"
            );
            $insert->execute([
                'user_id'    => $userId,
                'created_at' => $now,
                'expires_at' => $expiresAt,
                'qr_code'    => $token
            ]);

            $stmt = $this->conn->prepare(
                "SELECT * FROM qr_codes WHERE user_id = :user_id AND DATE(created_at) = :today ORDER BY created_at DESC LIMIT 1"
            );
            $stmt->execute(['user_id' => $userId, 'today' => $today]);
            $qrCode = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$qrCode) {
                return [
                    'status' => 'error',
                    'message' => 'Failed to generate QR code.',
                    'qr' => null
                ];
            }

            return [
                'status' => $qrCode['is_used'] ? 'used' : 'active',
                'qr'     => $qrCode,
            ];
        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage(),
                'qr' => null
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Unexpected error: ' . $e->getMessage(),
                'qr' => null
            ];
        }
    }

    /** 
     * Regenerate QR code if not used yet for today
     */
    public function regenerateQrCode() {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $today = date('Y-m-d');

            $stmtUsed = $this->conn->prepare(
                "SELECT * FROM qr_codes 
                 WHERE user_id = :user_id 
                 AND DATE(created_at) = :today 
                 AND is_used = 1 
                 ORDER BY created_at DESC 
                 LIMIT 1"
            );
            $stmtUsed->execute(['user_id' => $userId, 'today' => $today]);
            $usedQr = $stmtUsed->fetch(PDO::FETCH_ASSOC);

            if ($usedQr) {
                return [
                    'success' => true,
                    'status'  => 'used',
                    'qr'      => $usedQr
                ];
            }

            $newQr = $this->generateQRCode($userId);

            return [
                'success' => true,
                'status'  => $newQr['status'],
                'qr'      => $newQr['qr']
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }
    
    /** Submit a report with file uploads
     */
    public function report($params) {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $data   = $params['data'];
            $files  = $params['files'] ?? [];

            if (!isset($files['files'])) {
                return ['success' => false, 'message' => 'No files uploaded'];
            }

            $stmt = $this->conn->prepare(
                "SELECT id FROM reports WHERE user_id = :user_id AND DATE(date) = DATE(:date)"
            );
            $stmt->execute([
                'user_id' => $userId,
                'date'    => $data['date']
            ]);

            if ($stmt->fetch(PDO::FETCH_ASSOC)) {
                return [
                    'success' => false,
                    'message' => 'A report for this date already exists.'
                ];
            }

            $filesArr  = $files['files'];
            $uploadDir = __DIR__ . '/../uploads/reports/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $summarize = OpenAIClient::sendReportSummarize([
                'title'       => $data['title'],
                'description' => $data['description']
            ]);

            if (!$summarize){
                return [
                    'success' => false,
                    'message' => 'AI summarization failed.'
                ];
            }

            // Save report first
            $reportStmt = $this->conn->prepare(
                "INSERT INTO reports (user_id, title, date, description) 
                 VALUES (:user_id, :title, :date, :description)"
            );
            $reportStmt->execute([
                'user_id'     => $userId,
                'title'       => $data['title'],
                'date'        => $data['date'],
                'description' => $summarize ?? $data['description']
            ]);
            $reportId = $this->conn->lastInsertId();

            // Handle file uploads
            $uploadedFiles = [];
            foreach ($filesArr['name'] as $index => $name) {
                $tmpName = $filesArr['tmp_name'][$index];
                $type    = $filesArr['type'][$index];
                $size    = $filesArr['size'][$index];
                $error   = $filesArr['error'][$index];

                if ($error !== UPLOAD_ERR_OK) {
                    error_log("File #$index failed to upload: " . $error);
                    continue;
                }

                $uniqueName = time() . "_" . uniqid() . "_" . basename($name);
                $filePath   = $uploadDir . $uniqueName;

                if (move_uploaded_file($tmpName, $filePath)) {
                    $fileUrl = BASE_URL . "/api/uploads/reports/" . $uniqueName;

                    $stmt = $this->conn->prepare(
                        "INSERT INTO report_files (report_id, file_name, file_url, file_path, file_type, file_size) 
                         VALUES (?, ?, ?, ?, ?, ?)"
                    );
                    $stmt->execute([
                        $reportId,
                        $uniqueName,
                        $fileUrl,
                        "uploads/reports/" . $uniqueName,
                        $type,
                        $size
                    ]);

                    $uploadedFiles[] = [
                        'name' => $uniqueName,
                        'url'  => $fileUrl,
                        'path' => "uploads/reports/" . $uniqueName,
                        'type' => $type,
                        'size' => $size
                    ];
                } else {
                    error_log("File #$index failed to move to uploads directory.");
                }
            }

            return [
                'success'   => true,
                'message'   => 'Report saved successfully.',
                'report_id' => $reportId,
                'files'     => $uploadedFiles
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Scan QR code to log attendance
     */
    public function scanQrCode($params) {
        try {
            $supervisorId = AuthHelper::validateToken()['id'];
            $qrCode = $params['data']['qr_code'] ?? null;
    
            if (!$qrCode) {
                return ['success' => false, 'message' => 'QR code is required.'];
            }
    
            $stmt = $this->conn->prepare(
                "SELECT * FROM qr_codes WHERE qr_code = :qrCode AND is_used = 0"
            );
            $stmt->execute(['qrCode' => $qrCode]);
            $existingQr = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$existingQr) {
                return ['success' => false, 'message' => 'Invalid or already used QR code.'];
            }
    
            $traineeId = $existingQr['user_id'];
    
            $checkStmt = $this->conn->prepare(
                "SELECT id FROM supervisor_trainees 
                 WHERE supervisor_id = :supervisor_id 
                   AND trainee_id = :trainee_id"
            );
            $checkStmt->execute([
                'supervisor_id' => $supervisorId,
                'trainee_id'    => $traineeId
            ]);
    
            $relation = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$relation) {
                return [
                    'success' => false,
                    'message' => 'You are not allowed to scan this trainee because you are not their supervisor.'
                ];
            }
    
            $update = $this->conn->prepare(
                "UPDATE qr_codes SET is_used = 1 WHERE id = :id"
            );
            $update->execute(['id' => $existingQr['id']]);
    
            $attendanceStmt = $this->conn->prepare(
                "INSERT INTO trainee_attendance (trainee_id, date, time_in, status, remarks) 
                 VALUES (:trainee_id, :date, :time_in, :status, :remarks)
                 ON DUPLICATE KEY UPDATE 
                    time_in = VALUES(time_in), 
                    status = VALUES(status), 
                    remarks = VALUES(remarks), 
                    updated_at = CURRENT_TIMESTAMP"
            );
    
            $attendanceStmt->execute([
                'trainee_id' => $traineeId,
                'date'       => date('Y-m-d'),
                'time_in'    => date('Y-m-d H:i:s'),
                'status'     => 1,
                'remarks'    => 'Checked in via QR code'
            ]);
    
            return [
                'success'       => true,
                'message'       => 'Attendance recorded.',
                'attendance_id' => $this->conn->lastInsertId()
            ];
    
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    /** Get attendance records for the authenticated user
     */
    public function getAttendance() {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $stmt = $this->conn->prepare(
                "SELECT * FROM trainee_attendance WHERE trainee_id = :trainee_id ORDER BY date DESC, time_in DESC"
            );
            $stmt->execute(['trainee_id' => $userId]);
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'attendance' => $attendance
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Calculate total hours from attendance records
     */
    public function getTotalHours() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT time_in, time_out FROM trainee_attendance WHERE trainee_id = :trainee_id ORDER BY date DESC"
            );
            $stmt->execute(['trainee_id' => $userId]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalSeconds = 0;

            foreach ($data as $row) {
                if (!empty($row['time_in'])) {
                    $start = strtotime($row['time_in']);
                    $end = !empty($row['time_out']) ? strtotime($row['time_out']) : $start;
                    if ($end > $start) {
                        $totalSeconds += ($end - $start);
                    }
                }
            }

            $hours = floor($totalSeconds / 3600);
            $minutes = floor(($totalSeconds % 3600) / 60);
            $seconds = $totalSeconds % 60;
            $totalHours = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

            return [
                "success" => true,
                "total_hours" => $totalHours
            ];
        } catch (PDOException $e) {
            return [
                "success" => false,
                "message" => "Database error: " . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => "Unexpected error: " . $e->getMessage()
            ];
        }
    }

    /** Fetch all supervisors
     */
    public function fetchSupervisor() {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE role = 2");
            $stmt->execute();
            $supervisors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($supervisors && count($supervisors) > 0) {
                return [
                    'success'     => true,
                    'supervisors' => $supervisors
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No supervisors found.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Fetch trainee's supervisor requests
     */
    public function fetchRequestsSupervisors($params) {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $stmt = $this->conn->prepare(
                "SELECT r.*, u.username AS supervisor_name, u.email AS supervisor_email
                 FROM student_supervisor_requests r
                 JOIN users u ON r.supervisor_id = u.id
                 WHERE r.user_id = :user_id"
            );
            $stmt->execute(['user_id' => $userId]);
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($requests && count($requests) > 0) {
                return [
                    'success'  => true,
                    'requests' => $requests
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No requests found.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Save device token for push notifications
     */
    public function saveDeviceToken($params) {
        try {
            $userId   = AuthHelper::validateToken()['id'];
            $token    = $params['data']['token'] ?? null;
            $platform = $params['data']['platform'] ?? null; // maps to device_type
            $model    = $params['data']['model'] ?? null;    // maps to device_model
            $name     = $params['data']['name'] ?? null;     // optional (device_name)

            if (!$token || !$platform || !$model) {
                return [
                    'success' => false,
                    'message' => 'Token, platform, and model are required.'
                ];
            }

            $stmt = $this->conn->prepare(
                "INSERT INTO user_devices (user_id, expo_push_token, device_type, device_model, device_name, is_active) 
                VALUES (:user_id, :expo_push_token, :device_type, :device_model, :device_name, 1)
                ON DUPLICATE KEY UPDATE 
                    device_type = VALUES(device_type), 
                    device_model = VALUES(device_model), 
                    device_name = VALUES(device_name), 
                    is_active = 1, 
                    last_used = CURRENT_TIMESTAMP"
            );

            $stmt->execute([
                'user_id'         => $userId,
                'expo_push_token' => $token,
                'device_type'     => $platform,
                'device_model'    => $model,
                'device_name'     => $name
            ]);

            return [
                'success' => true,
                'message' => 'Device token saved successfully.'
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Send supervisor request
     */
    public function sendSupervisorRequest($params) {
        try {
            $userId = AuthHelper::validateToken()['id'];
            $supervisorId = $params['data']['supervisor_id'] ?? null;

            if (!$supervisorId) {
                return ['success' => false, 'message' => 'Supervisor ID is required.'];
            }

            $checkStmt = $this->conn->prepare(
                "SELECT id FROM student_supervisor_requests WHERE user_id = :user_id AND supervisor_id = :supervisor_id"
            );
            $checkStmt->execute([
                'user_id' => $userId,
                'supervisor_id' => $supervisorId
            ]);
            if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
                return ['success' => false, 'message' => 'Request already sent to this supervisor.'];
            }

            $stmt = $this->conn->prepare(
                "INSERT INTO student_supervisor_requests (user_id, supervisor_id) 
                 VALUES (:user_id, :supervisor_id)"
            );
            $stmt->execute([
                'user_id'      => $userId,
                'supervisor_id'=> $supervisorId
            ]);

            if ($stmt->rowCount() > 0) {
                $this->notification->sendNotificationByUserId(
                    $supervisorId,
                    "You have a trainee request",
                    "Please check your app and accept."
                );

                $this->notification->saveNotificationToDB(
                    $supervisorId,
                    "You have a trainee request",
                    "Please check your app and accept.",
                    "system"
                );

                return ['success' => true, 'message' => 'Request sent successfully.'];
            } else {
                return ['success' => false, 'message' => 'Failed to send request.'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    /** Get authenticated user's supervisor requests
     */
    public function getSupervisorRequests() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT r.*, u.username AS supervisor_name, r.status, u.avatar_url
                 FROM student_supervisor_requests r
                 JOIN users u ON r.supervisor_id = u.id
                 WHERE r.user_id = :user_id"
            );
            $stmt->execute(['user_id' => $userId]);
            $mySupervisor = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($mySupervisor && count($mySupervisor) > 0) {
                return [
                    'success'    => true,
                    'supervisor' => $mySupervisor
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No supervisor requests found.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Get reports submitted by the authenticated user
     */
    public function getReports() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare("
                SELECT r.id AS report_id, r.user_id, r.title, r.date, r.description,
                       f.file_url, f.id AS file_id
                FROM reports r
                LEFT JOIN report_files f ON r.id = f.report_id
                WHERE r.user_id = :user_id
                ORDER BY r.id DESC, f.id ASC
            ");
            $stmt->execute(['user_id' => $userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$rows) {
                return [
                    'success' => false,
                    'message' => 'No reports found.'
                ];
            }

            $reports = [];
            foreach ($rows as $row) {
                $rid = $row['report_id'];

                if (!isset($reports[$rid])) {
                    $reports[$rid] = [
                        'id'          => $row['report_id'],
                        'user_id'     => $row['user_id'],
                        'title'       => $row['title'],
                        'date'        => $row['date'],
                        'description' => $row['description'],
                        'files'       => []
                    ];
                }

                if (!empty($row['file_url'])) {
                    $reports[$rid]['files'][] = [
                        'id'  => $row['file_id'],
                        'url' => $row['file_url']
                    ];
                }
            }

            return [
                'success' => true,
                'reports' => array_values($reports)
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Get trainees assigned to the authenticated supervisor
     */
    public function getTrainee() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT st.*, 
                        COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name, 
                        u.email AS trainee_email 
                 FROM supervisor_trainees st
                 JOIN users u ON st.trainee_id = u.id
                 WHERE st.supervisor_id = :user_id"
            );
            $stmt->execute(['user_id' => $userId]);
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($trainees && count($trainees) > 0) {
                return [
                    'success'  => true,
                    'trainees' => $trainees
                ];
            } else {
                return [
                    'success' => false,
                    'trainees' => [],
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'trainees' => [],
                'error'   => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'trainees' => [],
                'error'   => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Fetch all attendance records for trainees under the authenticated supervisor
     */
    public function fetchAllAttendance() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT 
                    ta.date,
                    ta.trainee_id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name,
                    ta.time_in,
                    ta.time_out,
                    ta.status,
                    ta.remarks
                FROM trainee_attendance ta
                JOIN supervisor_trainees st 
                    ON ta.trainee_id = st.trainee_id
                JOIN users u 
                    ON ta.trainee_id = u.id
                WHERE st.supervisor_id = :user_id
                ORDER BY ta.date DESC, ta.trainee_id ASC"
            );
            $stmt->execute(['user_id' => $userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $grouped = [];
            foreach ($rows as $row) {
                $date = $row['date'];
                if (!isset($grouped[$date])) {
                    $grouped[$date] = [
                        'trainees'      => [],
                        'present_count' => 0,
                        'absent_count'  => 0
                    ];
                }
                $grouped[$date]['trainees'][] = [
                    'trainee_id'   => $row['trainee_id'],
                    'trainee_name' => $row['trainee_name'],
                    'time_in'      => $row['time_in'],
                    'time_out'     => $row['time_out'],
                    'status'       => $row['status'],
                    'remarks'      => $row['remarks'],
                ];
                if ($row['status'] == 1) {
                    $grouped[$date]['present_count']++;
                } elseif ($row['status'] == 2) {
                    $grouped[$date]['absent_count']++;
                }
            }
            return [
                'success' => true,
                'attendance' => $grouped
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** 
     * Get trainees without attendance for today under the authenticated supervisor
     */
    public function noAttendance() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT st.trainee_id, COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name
                 FROM supervisor_trainees st 
                 JOIN users u ON u.id = st.trainee_id 
                 WHERE st.supervisor_id = :user_id 
                 AND st.trainee_id NOT IN (
                    SELECT ta.trainee_id FROM trainee_attendance ta WHERE ta.date = CURDATE()
                 )"
            );
            $stmt->execute(['user_id' => $userId]);
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($trainees)) {
                return [
                    'success'               => true,
                    'trainee_no_attendance' => $trainees
                ];
            } else {
                return [
                    'success' => false,
                    'error'   => 'No trainee found without attendance for today.'
                ];
            }
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error'   => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** 
     * Record attendance for a trainee (manual entry by supervisor)
     */
    public function recordAttendance($params) {
        $traineeId = $params['data']['student_id'] ?? null;
        $status    = $params['data']['status'] ?? 'absent';

        if ($status == "present") {
            $status = 1;
            $timeIn = date('Y-m-d H:i:s');
        } elseif ($status == "absent") {
            $status = 2;
            $timeIn = null;
        } else {
            return ["success" => false, "message" => "Invalid status value"];
        }

        $remarks = "Manual Records";
        $today   = date("Y-m-d");

        try {
            $checkSql = "SELECT id FROM trainee_attendance WHERE trainee_id = :trainee_id AND date = :today";
            $stmt = $this->conn->prepare($checkSql);
            $stmt->bindParam(":trainee_id", $traineeId, PDO::PARAM_INT);
            $stmt->bindParam(":today", $today, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return ["success" => false, "message" => "Attendance already recorded for today"];
            }

            $insertSql = "INSERT INTO trainee_attendance (trainee_id, status, remarks, date, time_in) 
                          VALUES (:trainee_id, :status, :remarks, :today, :time_in)";
            $stmt = $this->conn->prepare($insertSql);
            $stmt->bindParam(":trainee_id", $traineeId, PDO::PARAM_INT);
            $stmt->bindParam(":status", $status, PDO::PARAM_INT);
            $stmt->bindParam(":remarks", $remarks, PDO::PARAM_STR);
            $stmt->bindParam(":today", $today, PDO::PARAM_STR);
            $stmt->bindParam(":time_in", $timeIn, PDO::PARAM_STR);

            if ($stmt->execute()) {

                $qrCheckSql = "SELECT id FROM qr_codes WHERE user_id = :trainee_id AND DATE(created_at) = CURDATE() AND is_used = 0 AND expires_at > NOW()";
                $qrStmt = $this->conn->prepare($qrCheckSql);
                $qrStmt->bindParam(":trainee_id", $traineeId, PDO::PARAM_INT);
                $qrStmt->execute();

                if ($qrStmt->rowCount() > 0) {
                    $qrUpdateSql = "UPDATE qr_codes SET is_used = 1 WHERE user_id = :trainee_id AND DATE(created_at) = CURDATE()";
                    $qrUpdateStmt = $this->conn->prepare($qrUpdateSql);
                    $qrUpdateStmt->bindParam(":trainee_id", $traineeId, PDO::PARAM_INT);
                    $qrUpdateStmt->execute();

                    return ["success" => true, "message" => "Attendance recorded successfully"];

                } else {

                    $token = bin2hex(random_bytes(4));
                    $expiresAt = date('Y-m-d H:i:s', strtotime('+40 minutes'));
                    $now = date('Y-m-d H:i:s');
                    
                    $insertQrSql = "INSERT INTO qr_codes (user_id, created_at, expires_at, is_used, qr_code) 
                                    VALUES (:user_id, :created_at, :expires_at, 1, :qr_code)";
                    $insertQrStmt = $this->conn->prepare($insertQrSql);
                    $insertQrStmt->bindParam(":user_id", $traineeId, PDO::PARAM_INT);
                    $insertQrStmt->bindParam(":created_at", $now, PDO::PARAM_STR);
                    $insertQrStmt->bindParam(":expires_at", $expiresAt, PDO::PARAM_STR);
                    $insertQrStmt->bindParam(":qr_code", $token, PDO::PARAM_STR);
                    $insertQrStmt->execute();

                    return [
                        "success" => true,
                        "message" => "Attendance recorded successfully"
                    ];
                }

                return ["success" => true, "message" => "Attendance recorded successfully"];
            } else {
                return ["success" => false, "message" => "Failed to record attendance"];
            }
        } catch (PDOException $e) {
            return ["success" => false, "message" => "Database Error: " . $e->getMessage()];
        }
    }

    /** 
     * Get total present and absent trainees for today under the authenticated supervisor
     */
    public function getTotalAttendanceToday() {
        try {
            $userId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare(
                "SELECT 
                    SUM(CASE WHEN ta.status = 1 THEN 1 ELSE 0 END) AS total_present,
                    SUM(CASE WHEN ta.status = 2 THEN 1 ELSE 0 END) AS total_absent
                 FROM supervisor_trainees st
                 JOIN trainee_attendance ta 
                    ON st.trainee_id = ta.trainee_id
                 WHERE st.supervisor_id = :user_id
                   AND DATE(ta.date) = CURDATE()"
            );
            $stmt->execute(['user_id' => $userId]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'present' => (int)($data['total_present'] ?? 0),
                'absent'  => (int)($data['total_absent'] ?? 0)
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error'   => 'Database error: ' . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /** Generate OTP for the authenticated user
     */
    public function generateOtp($params) {
        try {
            $traineeId = AuthHelper::validateToken()['id'];
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = date("Y-m-d H:i:s", strtotime("+5 minutes"));

            $username = trim($params['data']['username'] ?? '');
            $password = $params['data']['password'] ?? '';

            if (empty($username) || empty($password)) {
                return ['success' => false, 'error' => 'Username and password are required.'];
            }

            $stmt = $this->conn->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $stmt = $this->conn->prepare(
                    "INSERT INTO trainee_otps (trainee_id, otp_code, expires_at, is_used) 
                     VALUES (:trainee_id, :otp_code, :expires_at, 0)"
                );
                $stmt->execute([
                    ':trainee_id' => $traineeId,
                    ':otp_code'   => $otp,
                    ':expires_at' => $expiresAt
                ]);

                $template = EmailTemplate::otpVerification($user['complete_name'] ?? $user['username'], $otp);

                if (!empty($user['email'])) {
                    $to = $user['email'];
                    $subject = "Your OTP Code";
                    $body = $template['body'];

                    $mail = MailerController::sendEmail([
                        'to'      => $to,
                        'subject' => $subject,
                        'body'    => $body
                    ]);

                    if ($mail) {
                        $this->notification->sendNotificationByUserId(
                            $traineeId,
                            "OTP sent to your email",
                            "Please check your email for the OTP code."
                        );
                        $this->notification->saveNotificationToDB(
                            $traineeId,
                            "OTP sent to your email",
                            "Please check your email for the OTP code.",
                            "system"
                        );
                    }
                } else {
                    $this->notification->saveNotificationToDB(
                        $traineeId,
                        "OTP Code",
                        "Your OTP Code is: " . $otp,
                        "otp"
                    );
                }

                return ['success' => true, 'otp' => $otp];
            } else {
                return ['success' => false, 'error' => 'Invalid credentials.'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    /** Verify OTP for the authenticated user
     */
    public function verifyOtp($params) {
        $traineeId = AuthHelper::validateToken()['id'];
        $otp = $params['data']['otp'] ?? null;

        $stmt = $this->conn->prepare(
            "SELECT * FROM trainee_otps
             WHERE trainee_id = :trainee_id
               AND otp_code = :otp
               AND is_used = 0
               AND expires_at > NOW()
             ORDER BY id DESC
             LIMIT 1"
        );
        $stmt->execute([
            ':trainee_id' => $traineeId,
            ':otp'        => $otp
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $update = $this->conn->prepare("UPDATE trainee_otps SET is_used = 1 WHERE id = :id");
            $update->execute([':id' => $row['id']]);
            return ['success' => true];
        }
        return ['success' => false];
    }
    
    /** Export all users to an Excel file
     */
    public function exportUsersToExcel() {
        $stmt = $this->conn->prepare("SELECT * FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($users)) {
            return ['error' => 'No users found.'];
        }
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Users');
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Username');
        $sheet->setCellValue('C1', 'Email');
        $sheet->setCellValue('D1', 'Role');
        $row = 2;
        foreach ($users as $user) {
            $sheet->setCellValue('A' . $row, $user['id']);
            $sheet->setCellValue('B' . $row, $user['username']);
            $sheet->setCellValue('C' . $row, $user['email']);
            $sheet->setCellValue('D' . $row, $user['role']);
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'users_' . date('Ymd_His') . '.xlsx';
        $filePath = __DIR__ . '/../uploads/' . $fileName;
        $writer->save($filePath);
        return [
            'success' => true,
            'message' => 'Users exported successfully.',
            'file'    => BASE_URL . '/api/uploads/' . $fileName
        ];
        
    }
    
    /** Export authenticated user's hours to an Excel file
     */
    public function exportUserHoursToExcel() {
        $userId = AuthHelper::validateToken()['id'] ?? 8;

        $year  = date('Y');
        $month = date('m');
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $startDate = "$year-$month-01";
        $endDate   = "$year-$month-$daysInMonth";
        $stmt = $this->conn->prepare(
            "SELECT date, time_in, time_out 
        FROM trainee_attendance 
        WHERE trainee_id = :trainee_id 
        AND date BETWEEN :start_date AND :end_date
        ORDER BY date ASC"
        );
        $stmt->execute([
            'trainee_id' => $userId,
            'start_date' => $startDate,
            'end_date'   => $endDate
        ]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $attendance = [];

        foreach ($rows as $r) {
            $attendance[$r['date']] = $r;
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("OJT DTR");

        // --- HEADER ---
        $sheet->setCellValue('A1', 'Surname: ARCABO');
        $sheet->setCellValue('C1', 'First Name: KENETH ROY');
        $sheet->setCellValue('A2', 'Program: BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY');
        $sheet->setCellValue('C2', 'Yr./Sec: 4-A');
        $sheet->setCellValue('A3', 'Host Training: MUSTARD SEED SYSTEMS CORPORATION');
        $sheet->setCellValue('C3', "For the Month of: " . date('F', strtotime($startDate)));
        $sheet->setCellValue('E3', "Year: " . $year);
        $sheet->setCellValue('A4', 'Supervisor: MR. RAMY MAPARI');
        $sheet->setCellValue('C4', 'Department: CONSULTING DEPARTMENT');
        $sheet->setCellValue('E4', 'Designation: TECHNICAL CONSULTANT');

        // --- TABLE HEADER ---
        $sheet->setCellValue('A6', 'DATE');
        $sheet->setCellValue('B6', 'TIME IN');
        $sheet->setCellValue('C6', 'TIME OUT');
        $sheet->setCellValue('D6', 'TOTAL HOURS');

       $row = 7;
        $totalMinutes = 0;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dateStr = "$year-$month-" . str_pad($day, 2, '0', STR_PAD_LEFT);
            $sheet->setCellValue('A' . $row, $day);

            if (isset($attendance[$dateStr])) {
                $in  = $attendance[$dateStr]['time_in'];
                $out = $attendance[$dateStr]['time_out'];

                $sheet->setCellValue('B' . $row, $in);
                $sheet->setCellValue('C' . $row, $out);

                if (!empty($in) && !empty($out)) {
                    $minutes = (strtotime($out) - strtotime($in)) / 60;
                    $hours   = floor($minutes / 60);
                    $mins    = $minutes % 60;

                    $sheet->setCellValue('D' . $row, sprintf("%02d:%02d", $hours, $mins));
                    $totalMinutes += $minutes;
                }
            }
            $row++;
        }

        $totalHours = floor($totalMinutes / 60);
        $totalMins  = $totalMinutes % 60;
        $sheet->setCellValue('C' . ($row + 1), "TOTAL");
        $sheet->setCellValue('D' . ($row + 1), sprintf("%02d:%02d", $totalHours, $totalMins));

        $writer = new Xlsx($spreadsheet);
        $fileName = 'user_hours_' . date('Ymd_His') . '.xlsx';
        $filePath = __DIR__ . '/../uploads/' . $fileName;
        $writer->save($filePath);
        return [
            'success' => true,
            'message' => 'User hours exported successfully.',
            'file'    => BASE_URL . '/api/uploads/' . $fileName
        ];
    
    }
    
    /** Get notifications for the authenticated user
     */
    public function getNotifications(){
        $userId = AuthHelper::validateToken()['id'] ?? 8;
        try {
            $stmt = $this->conn->prepare("
                SELECT id, user_id, title, message, type, is_read, created_at, expires_at, extra_data
                FROM notifications
                WHERE (user_id = :userId OR user_id IS NULL)
                  AND (expires_at IS NULL OR expires_at > NOW())
                ORDER BY created_at DESC
            ");
            $stmt->execute([':userId' => $userId]);
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $unreadCount = 0;
            foreach ($notifications as $notif) {
                if (empty($notif['is_read']) || $notif['is_read'] == 0) {
                    $unreadCount++;
                }
            }

            return [
                "success" => true,
                "count" => count($notifications),
                "data" => $notifications,
                "unread_count" => $unreadCount
            ];
        } catch (PDOException $e) {
            return [
                "success" => false,
                "message" => "Database error: " . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => "Unexpected error: " . $e->getMessage()
            ];
        }
    }
  
    /** Mark a notification as read
      */
   public function markNotificationRead($params){
       $userId = AuthHelper::validateToken()['id'] ?? 8; 
       $notifId= $params['data']['id'];
       
       
       $stmt = $this->conn->prepare("
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = ? AND (user_id = ? OR user_id IS NULL)
        ");
       
       $success = $stmt->execute([$notifId, $userId]);
       
       return [
              "success" => $success,
              "message" => $success ? "Notification marked as read" : "Failed to update"
           ];
   }
   
    /** Change password for the authenticated user
     */
   public function changePassword($params) {
        try {
            $userId = AuthHelper::validateToken()['id'] ?? null;
            if (!$userId) {
                return [
                    "success" => false,
                    "message" => "Unauthorized: invalid or missing token"
                ];
            }

            $currentPassword = $params['data']['currentPassword'] ?? '';
            $newPassword     = $params['data']['newPassword'] ?? '';

            if (empty($currentPassword) || empty($newPassword)) {
                return [
                    "success" => false,
                    "message" => "Both current and new password are required"
                ];
            }

            if (strlen($newPassword) < 3) {
                return [
                    "success" => false,
                    "message" => "New password must be at least 8 characters long"
                ];
            }

            $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return [
                    "success" => false,
                    "message" => "User not found"
                ];
            }

            if (!password_verify($currentPassword, $user['password'])) {
                return [
                    "success" => false,
                    "message" => "Current password is incorrect"
                ];
            }

            if (password_verify($newPassword, $user['password'])) {
                return [
                    "success" => false,
                    "message" => "New password cannot be the same as the current password"
                ];
            }

            $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $success = $stmt->execute([$hashedPassword, $userId]);

            return [
                "success" => $success,
                "message" => $success 
                    ? "Password changed successfully" 
                    : "Failed to change password"
            ];
        } catch (PDOException $e) {
            return [
                "success" => false,
                "message" => "Database error: " . $e->getMessage()
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => "Unexpected error: " . $e->getMessage()
            ];
        }
    }
    
    /** Update user profile including optional profile image upload
     */
    public function updateUserProfile($params) {
        $userId = AuthHelper::validateToken()['id'];
        $data   = $params['data'];
        $files  = $params['files'] ?? [];

        $completeName = $data['name'] ?? null;
        $username     = $data['username'] ?? null;
        $email        = $data['email'] ?? null;
        $birthdate    = $data['birthday'] ?? null;

        if (empty($username) || empty($email)) {
            return [
                "success" => false,
                "message" => "Username and email cannot be empty"
            ];
        }

        $checkStmt = $this->conn->prepare("
            SELECT id
            FROM users 
            WHERE (username = :username OR email = :email) 
            AND id != :id
        ");
        $checkStmt->execute([
            'username' => $username,
            'email'    => $email,
            'id'       => $userId
        ]);
        $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingUser) {
            return [
                "success" => false,
                "message" => "Username or email already exists"
            ];
        }
        
        $stmt = $this->conn->prepare("SELECT avatar_url FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $oldUser = $stmt->fetch(PDO::FETCH_ASSOC);

        $profileImageUrl = null;

        if (isset($files['profileImage']) && $files['profileImage']['error'] === 0) {
            $fileTmpPath = $files['profileImage']['tmp_name'];
            $fileName    = time() . "_" . uniqid() . "_" . basename($files['profileImage']['name']);
            $uploadDir   = __DIR__ . '/../uploads/profile_images/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            if (move_uploaded_file($fileTmpPath, $uploadDir . $fileName)) {
                $profileImageUrl = BASE_URL . '/api/uploads/profile_images/' . $fileName;
     
                // Delete old profile image if exists
                if (!empty($oldUser['avatar_url'])) {
                    $oldImagePath = __DIR__ . '/../uploads/profile_images/' . basename($oldUser['avatar_url']);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
            }
        }

        $sql = "UPDATE users 
                SET complete_name = :complete_name, 
                    username = :username, 
                    email = :email, 
                    birthdate = :birthdate";

        if ($profileImageUrl) {
            $sql .= ", avatar_url = :avatar_url";
        }

        $sql .= " WHERE id = :id";

        $updateStmt = $this->conn->prepare($sql);

        $params = [
            'complete_name' => $completeName,
            'username'      => $username,
            'email'         => $email,
            'birthdate'     => $birthdate,
            'id'            => $userId
        ];

        if ($profileImageUrl) {
            $params['avatar_url'] = $profileImageUrl;
        }

        $updateSuccess = $updateStmt->execute($params);

        return [
            "success" => $updateSuccess,
            "message" => $updateSuccess ? "Profile updated successfully" : "Failed to update profile"
        ];
    }

    /** Get profile of the authenticated user
     */
    public function getUserProfile(){
        $userId = AuthHelper::validateToken()['id'];

        $stmt = $this->conn->prepare("SELECT COALESCE(NULLIF(complete_name, ''), username) AS complete_name, username, email, birthdate, avatar_url FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return [
                "success" => false,
                "message" => "User not found"
            ];
        }

        return [
            "success" => true,
            "data" => $user
        ];
    }
    
    /** Handle forgot password by sending OTP to user's email
     */
    public function forgotPassword($params) {
        $email = filter_var($params['data']['email'] ?? null, FILTER_SANITIZE_EMAIL);
        if (!$email) {
            return ['success' => false, 'message' => 'Email is required.'];
        }

        $stmt = $this->conn->prepare("
            SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS name
            FROM users
            WHERE email = :email
        ");
        
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'No user found with that email.'];
        }

       //send otp to email
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date("Y-m-d H:i:s", strtotime("+15 minutes"));

        $insertStmt = $this->conn->prepare(
            "INSERT INTO password_resets (user_id, otp_code, expires_at, is_used) 
             VALUES (:user_id, :otp_code, :expires_at, 0)"
        );
        $insertStmt->execute([
            ':user_id'   => $user['id'],
            ':otp_code'  => $otp,
            ':expires_at'=> $expiresAt
        ]);
        
       

        $template = EmailTemplate::otpVerification($user['name'], $otp);
        $to = $email;
        $subject = "Password Reset OTP";
        $body = $template['body'];

        $mail = MailerController::sendEmail([
            'to'      => $to,
            'subject' => $subject,
            'body'    => $body
        ]);

        if ($mail) {
            return ['success' => true, 'message' => 'OTP sent to your email.'];
        } else {
            return ['success' => false, 'message' => 'Failed to send OTP email.'];
        }
    }

    /** Verify OTP for password reset
     */
    public function verifyForgotPasswordOtp($params) {
        $email = filter_var($params['data']['email'] ?? null, FILTER_SANITIZE_EMAIL);
        $otp   = trim($params['data']['otp'] ?? null);

        if (!$email || !$otp) {
            return ['success' => false, 'message' => 'Email and OTP are required.'];
        }

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $stmt = $this->conn->prepare("
            SELECT * FROM password_resets
            WHERE user_id = :user_id
            AND otp_code = :otp_code
            AND is_used = 0
            AND expires_at > NOW()
            ORDER BY id DESC
            LIMIT 1
        ");
        $stmt->execute([
            ':user_id'  => $user['id'],
            ':otp_code' => $otp
        ]);

        $reset = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset) {
            return ['success' => false, 'message' => 'Invalid or expired OTP.'];
        }

        $updateStmt = $this->conn->prepare("UPDATE password_resets SET is_used = 1 WHERE id = :id");
        $updateStmt->execute([':id' => $reset['id']]);

        return ['success' => true, 'message' => 'OTP verified successfully.'];
    }

    public function resetPassword($params) {
        $email           = filter_var($params['data']['email'] ?? null, FILTER_SANITIZE_EMAIL);
        $newPassword     = $params['data']['password'] ?? null;
        $confirmPassword = $params['data']['confirm_password'] ?? null;

        if (!$email || !$newPassword || !$confirmPassword) {
            return ['success' => false, 'message' => 'All fields are required.'];
        }

        if ($newPassword !== $confirmPassword) {
            return ['success' => false, 'message' => 'Passwords do not match.'];
        }

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $updateStmt = $this->conn->prepare("UPDATE users SET password = :password WHERE id = :id");
        $updateStmt->execute([
            ':password' => $hashedPassword,
            ':id'       => $user['id']
        ]);

        return ['success' => true, 'message' => 'Password has been reset successfully.'];
    }
    
    /** AI Assistant with rate limiting
     */
    public function AIAssistant($params) {
        $message = $params['data']['message'] ?? '';
        
        $ip = getClientIp();
        $maxAttempts = 5;
        $lockoutMinutes = 30;
    
        if (!isset($_SESSION['request'])) {
            $_SESSION['request'] = [];
        }
    
        if (!isset($_SESSION['request'][$ip])) {
            $_SESSION['request'][$ip] = [
                'count'        => 0,
                'last_attempt' => time()
            ];
        }
    
        if (time() - $_SESSION['request'][$ip]['last_attempt'] > $lockoutMinutes * 60) {
            $_SESSION['request'][$ip]['count'] = 0;
        }
    
        if ($_SESSION['request'][$ip]['count'] >= $maxAttempts) {
            $remaining = $lockoutMinutes - floor((time() - $_SESSION['request'][$ip]['last_attempt']) / 60);
            if ($remaining < 0) $remaining = 0;
            $memes = [
                "😴 I'm on cooldown. Try again in {$remaining} minutes... Meanwhile, I'm still single 💔",
                "🤖 Too many requests! Wait {$remaining} minutes. At least you have patience, unlike my ex 😂",
                "🚫 Calm down buddy, {$remaining} minutes break. Even Netflix gives me less drama than you 🍿",
                "🛑 Stop spamming me! {$remaining} minutes timeout... I need therapy for being single 💔🤣",
                "⌛ Rate limit reached. Wait {$remaining} minutes... Meanwhile, go touch some grass 🌱"
            ];
            
            return [
                'reply' => $memes[array_rand($memes)]
            ];

        }
    
        $_SESSION['request'][$ip]['count']++;
        $_SESSION['request'][$ip]['last_attempt'] = time();
    
        $res = OpenAIClient::sendMessage($message);
        
    
        $assistantReply = $res['choices'][0]['message']['content'] ?? '';
        return [
            'reply' => $assistantReply
        ];
    }
    
    /** Send verification email to user
     */
    public function sendVerificationEmail($params) {
        try {
            $email = filter_var($params['data']['email'] ?? null, FILTER_SANITIZE_EMAIL);
            if (!$email) {
                return ['success' => false, 'message' => 'Email required'];
            }
    
            // find user
            $stmt = $this->conn->prepare("
                SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS name, email 
                FROM users 
                WHERE email = :email
            ");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }
    
            // generate token & expiry
            $token = bin2hex(random_bytes(16));
            $expiresAt = date("Y-m-d H:i:s", strtotime("+1 hour"));
    
            // insert or update email_verifications
            $stmt = $this->conn->prepare("
                INSERT INTO email_verifications (user_id, email, token, expires_at) 
                VALUES (:user_id, :email, :token, :expires_at)
                ON DUPLICATE KEY UPDATE 
                    token = VALUES(token), 
                    expires_at = VALUES(expires_at), 
                    verified = 0
            ");
            $stmt->execute([
                'user_id' => $user['id'],
                'email' => $email,
                'token' => $token,
                'expires_at' => $expiresAt
            ]);
    
            // verification link
            $link = "https://ojt-track.kamsite.com/verify-email?token=" . $token;
    
            $mailTemplate = EmailTemplate::emailVerification($user['name'], $link);
            $to = $user['email'];
            $subject = $mailTemplate['subject'];
            $body = $mailTemplate['body'];
    
            $mail = MailerController::sendEmail([
                'to' => $to,
                'subject' => $subject, 
                'body' => $body
            ]);
    
            if (isset($mail['success']) && $mail['success'] === true) {
                return ['success' => true, 'message' => 'Verification email sent'];
            } else {
                return ['success' => false, 'message' => 'Failed to send email'];
            }
    
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /** Verify email using token
     */
    public function verifyEmailToken($params) {
        try {
            $token = $params['data']['token'] ?? null;
            if (!$token) {
                return ['success' => false, 'message' => 'Token is required.'];
            }
    
            $stmt = $this->conn->prepare("
                SELECT email, expires_at 
                FROM email_verifications 
                WHERE token = :token
            ");
            $stmt->execute(['token' => $token]);
            $verification = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$verification) {
                return [
                    'success' => false,
                    'message' => 'Invalid token.'
                ];
            }
    
            // check expiration
            if (strtotime($verification['expires_at']) < time()) {
                return [
                    'success' => false,
                    'message' => 'Token expired',
                    'email'   => $verification['email'] 
                ];
            }
    
            $stmt = $this->conn->prepare("UPDATE users SET email_flg = 1 WHERE email = :email");
            $stmt->execute(['email' => $verification['email']]);
    
            $stmt = $this->conn->prepare("DELETE FROM email_verifications WHERE token = :token");
            $stmt->execute(['token' => $token]);
    
            return ['success' => true, 'message' => 'Email verified successfully.'];
    
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /** Check if email is verified
     */
    public function checkIfEmailIsVerified($params) {
        $email = filter_var($params['data']['email'] ?? null, FILTER_SANITIZE_EMAIL);
        if (!$email) {
            return ['success' => false, 'message' => 'Email is required.'];
        }

        $stmt = $this->conn->prepare("SELECT email_flg FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'No user found with that email.'];
        }

        if ($user['email_flg'] == 1) {
            return ['success' => true, 'message' => 'Email is verified.'];
        } else {
            return ['success' => false, 'message' => 'Email is not verified.'];
        }
    }
    
    /** Save OJT completion record
     */
    public function saveOjtCompletion($params) {
        try {
            $studentId         = AuthHelper::validateToken()['id'];
            $supervisorId      = $params['data']['supervisor_id'] ?? null;
            $supervisorRating  = $params['data']['supervisor_rating'] ?? 0;
            $workExpRating     = $params['data']['work_experience_rating'] ?? 0;
            $learningRating    = $params['data']['learning_experience_rating'] ?? 0;
            $envRating         = $params['data']['work_environment_rating'] ?? 0;
            $feedback          = $params['data']['feedback'] ?? null;
            $suggestion        = $params['data']['suggestion'] ?? null;
            $confirmed         = isset($params['data']['confirmed']) && $params['data']['confirmed'] ? 1 : 0;
    
            if (!$studentId) {
                return [
                    'success' => false,
                    'message' => 'Student ID is required.'
                ];
            }
    
            $sql = "INSERT INTO ojt_completions 
                    (trainee_id, supervisor_id, supervisor_rating, 
                     work_experience_rating, learning_experience_rating, 
                     environment_rating, feedback, suggestion, confirmed)
                    VALUES 
                    (:student_id, :supervisor_id, :supervisor_rating, 
                     :work_experience_rating, :learning_experience_rating, 
                     :environment_rating, :feedback, :suggestion, :confirmed)";
    
            $stmt = $this->conn->prepare($sql);
    
            $stmt->execute([
                ':student_id'              => $studentId,
                ':supervisor_id'           => $supervisorId,
                ':supervisor_rating'       => $supervisorRating,
                ':work_experience_rating'  => $workExpRating,
                ':learning_experience_rating' => $learningRating,
                ':environment_rating'      => $envRating,
                ':feedback'                => $feedback,
                ':suggestion'              => $suggestion,
                ':confirmed'               => $confirmed,
            ]);
    
            return [
                'success' => true,
                'message' => 'OJT completion record saved successfully.',
                'insert_id' => $this->conn->lastInsertId()
            ];
    
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        }
    }
    
    /** Get OJT completion record for the authenticated user
     */
    public function getOjtCompletion() {
        try {
            $studentId = AuthHelper::validateToken()['id'];
    
            $stmt = $this->conn->prepare("
                SELECT 
                    trainee_id, 
                    supervisor_id, 
                    supervisor_rating, 
                    work_experience_rating, 
                    learning_experience_rating, 
                    environment_rating, 
                    feedback, 
                    suggestion
                FROM ojt_completions
                WHERE trainee_id = :studentId
                LIMIT 1
            ");
            $stmt->execute(['studentId' => $studentId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if ($result) {
                return [
                    'success' => true,
                    'message' => 'OJT completion found.',
                    'result'    => $result
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No OJT completion submitted yet.'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /** check if user has completed OJT where ojt_required_hours > total hours logged
     */
    public function checkOjtCompletionStatus() {
        try {
            $traineeId = AuthHelper::validateToken()['id'];

            $stmt = $this->conn->prepare("SELECT ojt_required_hours FROM users WHERE id = :traineeId");
            $stmt->execute(['traineeId' => $traineeId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found.'
                ];
            }

            //check if already rated
            $stmt = $this->conn->prepare("SELECT COUNT(*) AS count FROM ojt_completions WHERE trainee_id = :traineeId");
            $stmt->execute(['traineeId' => $traineeId]);
            $countResult = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($countResult && (int)$countResult['count'] > 0) {
                return [
                    'success' => true,
                    'completed' => true,
                    'message' => 'OJT already completed and rated.',
                    'is_rated' => true
                ];
            }

            $requiredHours = (int)$user['ojt_required_hours'];

            $sql = "SELECT status, 
                        SUM(TIMESTAMPDIFF(SECOND, time_in, time_out)) AS total_seconds
                    FROM trainee_attendance
                    WHERE trainee_id = :trainee_id
                    AND time_in IS NOT NULL
                    AND time_out IS NOT NULL
                    GROUP BY status";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['trainee_id' => $traineeId]);
            $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalSeconds = 0;

            foreach ($attendance as $row) {
                if ((int)$row['status'] === 1) { 
                    $totalSeconds += (int)($row['total_seconds'] ?? 0);
                }
            }

            $hours = floor($totalSeconds / 3600);

            $isComplete = $hours >= $requiredHours;

            return [
                'success' => true,
                'completed' => $isComplete,
                'logged_hours' => $hours,
                'is_rated' => false,
                'required_hours' => $requiredHours,
                'remaining_hours' => max(0, $requiredHours - $hours)
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create a request (weekly report or monthly hours)
     */
    public function createRequest($params) {
        try {
            $type    = trim($params['data']['type'] ?? '');
            $reason  = trim($params['data']['reason'] ?? '');
            $userId  = AuthHelper::validateToken()['id'] ?? ($params['data']['user_id'] ?? null);

            if (!$type || !$reason || !$userId) {
                return ['success' => false, 'message' => 'Missing required fields'];
            }

            if ($type === 'weekly') {
                $startDate = $params['data']['startDate'] ?? null;
                $endDate   = $params['data']['endDate'] ?? null;

                if (!$startDate || !$endDate) {
                    return ['success' => false, 'message' => 'Start and end date required for weekly report'];
                }

                $startDay = date('N', strtotime($startDate));
                $endDay   = date('N', strtotime($endDate));
                if ($startDay != 1 || $endDay != 5) {
                    return ['success' => false, 'message' => 'Weekly report must start on Monday and end on Friday'];
                }

                $stmt = $this->conn->prepare("
                    INSERT INTO report_requests (user_id, request_type, start_date, end_date, reason, status) 
                    VALUES (:user_id, :type, :start_date, :end_date, :reason, 'pending')
                ");
                $stmt->execute([
                    'user_id'    => $userId,
                    'type'       => $type,
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                    'reason'     => $reason
                ]);
            } elseif ($type === 'monthly') {
                $monthInput = $params['data']['month'] ?? null;

                $month = null;
                $year  = null;

                if ($monthInput) {
                    try {
                        $dt = new DateTime($monthInput); 
                        $month = (int)$dt->format('m');  // 1–12
                        $year  = (int)$dt->format('Y');  // 2025
                    } catch (Exception $e) {
                        return [
                            'success' => false,
                            'message' => 'Invalid month format'
                        ];
                    }
                }

                if (!$month || !$year) {
                    return ['success' => false, 'message' => 'Month and year required for monthly hours'];
                }

                if (!preg_match('/^\d{4}$/', $year) || !preg_match('/^(0?[1-9]|1[0-2])$/', $month)) {
                    return ['success' => false, 'message' => 'Invalid month or year format'];
                }

                $stmt = $this->conn->prepare("
                    INSERT INTO report_requests (user_id, request_type, month, year, reason, status) 
                    VALUES (:user_id, :type, :month, :year, :reason, 'pending')
                ");
                $stmt->execute([
                    'user_id' => $userId,
                    'type'    => $type,
                    'month'   => $month,
                    'year'    => $year,
                    'reason'  => $reason
                ]);
            } else {
                return ['success' => false, 'message' => 'Invalid request type'];
            }

            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Request submitted successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to submit request'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    /** get history. for reports requests
     */
    public function getRequestHistory($params) {
        try {
            $userId = AuthHelper::validateToken()['id'] ?? ($params['data']['user_id'] ?? null);
            if (!$userId) {
                return ['success' => false, 'message' => 'User ID is required'];
            }

            $stmt = $this->conn->prepare("
                SELECT id, request_type, start_date, end_date, month, year, reason, status, created_at 
                FROM report_requests 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC
            ");
            $stmt->execute(['user_id' => $userId]);
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($requests) {
                $result = [];
                foreach ($requests as $req) {
                    $details = '';
                    if ($req['request_type'] == 'weekly' && $req['start_date'] && $req['end_date']) {
                        $details = date("M j", strtotime($req['start_date'])) . " - " . date("M j, Y", strtotime($req['end_date']));
                    } elseif ($req['request_type'] == 'monthly' && $req['month'] && $req['year']) {
                        $details = date("F", mktime(0, 0, 0, $req['month'], 10)) . " " . $req['year'];
                    }

                    $result[] = [
                        'id'      => $req['id'],
                        'type'    => $req['request_type'],
                        'details' => $details,
                        'reason'  => $req['reason'],
                        'status'  => $req['status']
                    ];
                }

                return ['success' => true, 'data' => $result];
            } else {
                return ['success' => false, 'message' => 'No requests found'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Unexpected error: ' . $e->getMessage()];
        }
    }

    public function optimizeImage($sourcePath, $destinationPath, $maxWidth = 1920, $maxHeight = 1080, $quality = 70) {
        $info = getimagesize($sourcePath);
        if (!$info) return false;

        list($width, $height) = $info;
        $mime = $info['mime'];

        switch ($mime) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $image = imagecreatefrompng($sourcePath);
                $bg = imagecreatetruecolor($width, $height);
                $white = imagecolorallocate($bg, 255, 255, 255);
                imagefill($bg, 0, 0, $white);
                imagecopy($bg, $image, 0, 0, 0, 0, $width, $height);
                $image = $bg;
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($sourcePath);
                break;
            default:
                return false;
        }

        $ratio = min($maxWidth / $width, $maxHeight / $height, 1);
        $newWidth = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        imagejpeg($resized, $destinationPath, $quality);

        imagedestroy($image);
        imagedestroy($resized);

        return $destinationPath;
    }
            
}
