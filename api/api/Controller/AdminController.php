<?php

class AdminController{
    
    private $conn;
    private $generate;
    private $notification;

    public function __construct(){
        $this->conn = new Database(); 
        $this->notification = new SendNotificationController();
        $this->generate = new GenerateReportController();
    }
    
    /**
     * SQL that returns each trainee's worked seconds from completed attendance (time in + time out).
     * Columns: trainee_id, worked_seconds
     */
    private function workedSecondsSql(): string {
        return "SELECT trainee_id,
                       SUM(TIMESTAMPDIFF(SECOND, time_in, time_out)) AS worked_seconds
                FROM trainee_attendance
                WHERE status = 1 AND time_in IS NOT NULL AND time_out IS NOT NULL
                GROUP BY trainee_id";
    }

    private static function completionPercent($workedSeconds, $requiredHours): int {
        $required = (int) $requiredHours ?: 486;
        return (int) min(100, round(((int) $workedSeconds / 3600) / $required * 100));
    }

    private static function pagination(int $total, int $page, int $limit): array {
        return [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $total > 0 ? (int) ceil($total / $limit) : 1,
        ];
    }

    /**
     * Trainees who have a supervisor, with their OJT progress.
     * Params: page, limit, search (by name)
     */
    public function getTraineeList($params) {
        $page = max(1, (int) ($params['data']['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['data']['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        $search = trim((string) ($params['data']['search'] ?? ''));

        $where = "t.role = 1";
        $args = [];
        if ($search !== '') {
            $where .= " AND COALESCE(NULLIF(t.complete_name, ''), t.username) LIKE :search";
            $args['search'] = '%' . $search . '%';
        }

        $from = "FROM users t
                 INNER JOIN supervisor_trainees st ON t.id = st.trainee_id
                 INNER JOIN users s ON st.supervisor_id = s.id
                 LEFT JOIN (" . $this->workedSecondsSql() . ") w ON w.trainee_id = t.id
                 WHERE $where";

        $countStmt = $this->conn->prepare("SELECT COUNT(*) $from");
        $countStmt->execute($args);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $this->conn->prepare(
            "SELECT
                t.id AS trainee_id,
                COALESCE(NULLIF(t.complete_name, ''), t.username) AS trainee_name,
                t.birthdate,
                t.email,
                t.avatar_url,
                t.ojt_required_hours,
                COALESCE(w.worked_seconds, 0) AS worked_seconds,
                s.id AS supervisor_id,
                COALESCE(NULLIF(s.complete_name, ''), s.username) AS supervisor_name
             $from
             ORDER BY trainee_name
             LIMIT :limit OFFSET :offset"
        );
        foreach ($args as $k => $v) $stmt->bindValue(':' . $k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($results as &$row) {
            $row['ojt_completion_percentage'] = self::completionPercent($row['worked_seconds'], $row['ojt_required_hours']);
            unset($row['worked_seconds']);
        }

        return ['trainees' => $results, 'pagination' => self::pagination($total, $page, $limit)];
    }

    /**
     * Supervisors. Without a page number, returns all of them (used by the assign-supervisor picker).
     * Params: page, limit, search (by name)
     */
    public function getSupervisorList($params = []) {
        $data = $params['data'] ?? [];
        $search = trim((string) ($data['search'] ?? ''));

        $where = "role = 2";
        $args = [];
        if ($search !== '') {
            $where .= " AND COALESCE(NULLIF(complete_name, ''), username) LIKE :search";
            $args['search'] = '%' . $search . '%';
        }

        $select = "SELECT
                    id AS supervisor_id,
                    COALESCE(NULLIF(complete_name, ''), username) AS supervisor_name,
                    birthdate,
                    email,
                    company,
                    avatar_url,
                    created,
                    modified
                FROM users
                WHERE $where
                ORDER BY supervisor_name";

        if (empty($data['page'])) {
            $stmt = $this->conn->prepare($select);
            $stmt->execute($args);
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return ['supervisors' => $all, 'pagination' => self::pagination(count($all), 1, max(1, count($all)))];
        }

        $page = max(1, (int) $data['page']);
        $limit = min(100, max(1, (int) ($data['limit'] ?? 10)));

        $countStmt = $this->conn->prepare("SELECT COUNT(*) FROM users WHERE $where");
        $countStmt->execute($args);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $this->conn->prepare($select . " LIMIT :limit OFFSET :offset");
        foreach ($args as $k => $v) $stmt->bindValue(':' . $k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
        $stmt->execute();

        return ['supervisors' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'pagination' => self::pagination($total, $page, $limit)];
    }

    public function getTraineeRequestList(){
        $sql = "SELECT 
                    r.id AS request_id,
                    r.user_id AS trainee_id,
                    COALESCE(t.complete_name, t.username) AS trainee_name,
                    r.supervisor_id,
                    COALESCE(s.complete_name, s.username) AS supervisor_name,
                    r.status,
                    r.created_at,
                    r.updated_at
                FROM student_supervisor_requests r
                JOIN users t ON r.user_id = t.id
                JOIN users s ON r.supervisor_id = s.id
                WHERE r.status = 0";
    
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
       return $results;
    }
    
    public function getTraineeNoSupervisor($params) {
        $page = isset($params['data']['page']) ? (int)$params['data']['page'] : 1;
        $limit = isset($params['data']['limit']) ? (int)$params['data']['limit'] : 5;
        $offset = ($page - 1) * $limit;
    
        $where = "
            u.role = 1
            AND NOT EXISTS (
                SELECT 1 FROM supervisor_trainees st 
                WHERE st.trainee_id = u.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM student_supervisor_requests sr 
                WHERE sr.user_id = u.id
                  AND sr.status != 2
            )
        ";
    
        $countSql = "SELECT COUNT(*) 
                     FROM users u
                     WHERE $where";
        $countStmt = $this->conn->prepare($countSql);
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();
    
        $totalPages = $limit > 0 ? ceil($total / $limit) : 1;
    
        $sql = "SELECT 
                    u.id AS trainee_id,
                    COALESCE(u.complete_name, u.username) AS trainee_name,
                    u.birthdate,
                    u.email,
                    u.avatar_url,
                    u.ojt_required_hours
                FROM users u
                WHERE $where
                ORDER BY u.id DESC
                LIMIT :limit OFFSET :offset";
    
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        return [
            'results' => $results,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages
            ]
        ];
    }
    
    public function assignSupervisor($params) {
        $traineeId = $params['data']['trainee_id'];
        $supervisorId = $params['data']['supervisor_id'];
    
        $sql = "INSERT INTO supervisor_trainees (supervisor_id, trainee_id, assigned_at) 
                VALUES (:supervisor_id, :trainee_id, NOW())";
    
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'supervisor_id' => $supervisorId,
            'trainee_id' => $traineeId
        ]);

        //insert also into student_supervisor_requests as approved
        $sql = "INSERT INTO student_supervisor_requests (user_id, supervisor_id, status, created_at, updated_at) 
                VALUES (:user_id, :supervisor_id, 1, NOW(), NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            'user_id' => $traineeId,
            'supervisor_id' => $supervisorId
        ]);
    
        return ['success' => true, 'message' => 'Trainee successfully assigned'];
    }
    
    public function getTraineeDataById($params) {
        $traineeId = (int) ($params['data']['trainee_id'] ?? 0);

        // Get trainee basic info
        $sql = "SELECT 
                    u.id AS trainee_id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name,
                    u.email,
                    u.birthdate,
                    u.course,
                    u.company,
                    u.started_at,
                    u.avatar_url,
                    u.ojt_required_hours
                FROM users u
                WHERE u.id = :trainee_id AND u.role = 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['trainee_id' => $traineeId]);
        $trainee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$trainee) {
            return ['success' => false, 'message' => 'Trainee not found'];
        }

        // Get supervisor name
        $sql = "SELECT 
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS supervisor_name,
                    u.company AS supervisor_company
                FROM supervisor_trainees st
                INNER JOIN users u ON u.id = st.supervisor_id
                WHERE st.trainee_id = :trainee_id
                LIMIT 1";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['trainee_id' => $traineeId]);
        $supervisor = $stmt->fetch(PDO::FETCH_ASSOC);

        $trainee['supervisor_name'] = $supervisor['supervisor_name'] ?? null;
        if (empty($trainee['company'])) {
            $trainee['company'] = $supervisor['supervisor_company'] ?? null;
        }

        // Attendance summary
        $sql = "SELECT status, COUNT(*) AS total,
                    SUM(TIMESTAMPDIFF(SECOND, time_in, time_out)) AS total_seconds
                FROM trainee_attendance
                WHERE trainee_id = :trainee_id
                GROUP BY status";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['trainee_id' => $traineeId]);
        $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $totalPresent = 0;
        $totalAbsent = 0;
        $totalSeconds = 0;
        
        foreach ($attendance as $row) {
            if ($row['status'] == 1) { // Present
                $totalPresent = $row['total'];
                $totalSeconds = $row['total_seconds'] ?? 0;
            } elseif ($row['status'] == 2) { // Absent
                $totalAbsent = $row['total'];
            }
        }
        
        // Convert seconds -> h:m:s
        $hours   = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);
        $seconds = $totalSeconds % 60;
        
        $trainee['attendance'] = [
            'present'     => (int)$totalPresent,
            'absent'      => (int)$totalAbsent,
            'work_hours'  => "{$hours}h {$minutes}m {$seconds}s"
        ];

        // Latest attendance logs
        $stmt = $this->conn->prepare(
            "SELECT DATE_FORMAT(date, '%b %e, %Y') AS created_at,
                    DATE_FORMAT(time_in, '%h:%i %p') AS time_in,
                    DATE_FORMAT(time_out, '%h:%i %p') AS time_out,
                    status
             FROM trainee_attendance
             WHERE trainee_id = :trainee_id
             ORDER BY date DESC
             LIMIT 60"
        );
        $stmt->execute(['trainee_id' => $traineeId]);
        $trainee['attendance_logs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        // Reports
        $sql = "SELECT id, user_id, title, date, description, image_url, status, created_at
                FROM reports
                WHERE user_id = :trainee_id
                ORDER BY date DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['trainee_id' => $traineeId]);
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group reports by week (Mon–Fri)
        $groupedReports = [];

        // Helper: get week range Mon–Fri
        $getWeekRange = function($dateStr) {
            $date = new DateTime($dateStr);

            // Get Monday of this week
            $monday = clone $date;
            $monday->modify('monday this week');

            // Get Friday of this week
            $friday = clone $monday;
            $friday->modify('friday this week');

            return $monday->format('Y-m-d') . ' to ' . $friday->format('Y-m-d');
        };

        foreach ($reports as $report) {
            if (!empty($report['date'])) {
                $range = $getWeekRange($report['date']);
                $groupedReports[$range][] = $report;
            }
        }

        // Sort weeks descending
        krsort($groupedReports);

        // Convert to array format for frontend looping
        $reportsByWeek = [];
        foreach ($groupedReports as $week => $items) {
            $reportsByWeek[] = [
                'week_range' => $week,
                'reports'    => !empty($items) ? $items : ["no_reports"]
            ];
        }

        $trainee['reports'] = $reportsByWeek;

        return ['success' => true, 'data' => $trainee];
    }

    /* Generate trainee monthly hours report */
    // see: GenerateReportController.php
    public function generateTraineeMonthlyHoursReport($params) {
        $userId = $params['data']['user_id'] ?? null;
        $year   = isset($params['data']['year']) ? (int)$params['data']['year'] : (int)date('Y');
        $month  = isset($params['data']['month']) ? (int)$params['data']['month'] : (int)date('m');

        if (!$userId) {
            return ['success' => false, 'message' => 'User ID is required'];
        }
        if ($month < 1 || $month > 12) {
            return ['success' => false, 'message' => 'Invalid month provided'];
        }
        if ($year < 2000 || $year > (int)date('Y') + 1) {
            return ['success' => false, 'message' => 'Invalid year provided'];
        }

        $stmt = $this->conn->prepare("
            SELECT id, email, COALESCE(complete_name, username) AS name 
            FROM users 
            WHERE id = :user_id
        ");
        $stmt->execute(['user_id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $monthlyHours = $this->generate->generateTraineeMonthlyHoursReport($userId, $year, $month);

        if (!$monthlyHours['success']) {
            return $monthlyHours; 
        }

        $subject = "Monthly Hours Report - {$month}/{$year}";
        $body = "
            Hello {$user['name']},<br><br>
            Your monthly hours report for <strong>{$month}/{$year}</strong> is ready.<br>
            Please find the attached report.<br><br>
            Best regards,<br>
            OJT Track Team
        ";

        $sendMail = MailerController::sendEmail([
            'to'       => $user['email'],
            'subject'  => $subject,
            'body'     => $body,
            'files'    => $monthlyHours['filePath'],
            'fileName' => $monthlyHours['fileName']
        ]);

        logs([
            'user_id' => $userId,
            'action'  => "Generated monthly hours report for {$user['name']} ({$month}/{$year})",
            'type'    => 'report',
            'status'  => $sendMail['success'] ? 'sent' : 'failed',
            'email'   => $user['email']
        ], 'monthlyHours.log');

        if ($sendMail['success']) {
            $this->notification->sendNotificationByUserId(
                $userId,
                'Monthly Hours Report',
                "Your monthly hours report for {$month}/{$year} has been sent to your email."
            );
        }

        return [
            'success' => $sendMail['success'],
            'message' => $sendMail['success'] 
                ? "Report generated and emailed to {$user['email']}" 
                : "Report generated but failed to send email",
            'file'    => $monthlyHours['filePath']
        ];
    }

    /* Generate trainee weekly accomplishment report */
    // see: GenerateReportController.php
    public function generateTraineeWeeklyAccomplishmentReport($params) {
        try {
            $userId    = $params['data']['user_id'] ?? null;
            $startDate = $params['data']['start_date'] ?? null; // expected format: YYYY-MM-DD
            $endDate   = $params['data']['end_date'] ?? null;   // expected format: YYYY-MM-DD

            if (!$userId) {
                return ['success' => false, 'message' => 'User ID is required'];
            }

            if (!$startDate || !$endDate) {
                return ['success' => false, 'message' => 'Start and End dates are required'];
            }

            if (!strtotime($startDate) || !strtotime($endDate)) {
                return ['success' => false, 'message' => 'Invalid date format provided'];
            }

            if ($startDate > $endDate) {
                return ['success' => false, 'message' => 'Start date cannot be later than End date'];
            }

            $stmt = $this->conn->prepare("
                SELECT id, email, COALESCE(complete_name, username) AS name 
                FROM users 
                WHERE id = :user_id
            ");
            $stmt->execute(['user_id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            $weeklyReport = $this->generate->generateWeeklyReportsAndHours($userId, false, $startDate, $endDate);

            if (!$weeklyReport['success']) {
                return $weeklyReport;
            }

            $subject = "Weekly Accomplishment Report - {$startDate} to {$endDate}";
            $body = "
                Hello {$user['name']},<br><br>
                Your weekly accomplishment report for <strong>{$startDate}</strong> to <strong>{$endDate}</strong> is ready.<br>
                Please find the attached report.<br><br>
                Best regards,<br>
                OJT Track Team
            ";

            $sendMail = MailerController::sendEmail([
                'to'       => $user['email'],
                'subject'  => $subject,
                'body'     => $body,
                'files'    => $weeklyReport['filePath'],
                'fileName' => $weeklyReport['fileName']
            ]);

            logs([
                'user_id' => $userId,
                'action'  => "Generated weekly accomplishment report for {$user['name']} ({$startDate} to {$endDate})",
                'type'    => 'report',
                'status'  => $sendMail['success'] ? 'sent' : 'failed',
                'email'   => $user['email']
            ], 'weeklyReport.log');

            if ($sendMail['success']) {
                $this->notification->sendNotificationByUserId(
                    $userId,
                    'Weekly Accomplishment Report',
                    "Your weekly accomplishment report for {$startDate} to {$endDate} has been sent to your email."
                );
            }

            return [
                'success' => $sendMail['success'],
                'message' => $sendMail['success'] 
                    ? "Report generated and emailed to {$user['email']}" 
                    : "Report generated but failed to send email",
                'file'    => $weeklyReport['filePath']
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    public function getReportRequest($params) {
        try {
            $page = isset($params['data']['page']) ? (int)$params['data']['page'] : 1;
            $limit = isset($params['data']['limit']) ? (int)$params['data']['limit'] : 10;
            $offset = ($page - 1) * $limit;

            $countSql = "SELECT COUNT(*) 
                        FROM report_requests 
                        WHERE status = 'pending'";
            $countStmt = $this->conn->prepare($countSql);
            $countStmt->execute();
            $total = (int)$countStmt->fetchColumn();
            $totalPages = $total > 0 ? ceil($total / $limit) : 1;

            $sql = "SELECT 
                        r.id,
                        r.user_id,
                        COALESCE(NULLIF(u.complete_name, ''), u.username) AS name,
                        r.request_type,
                        r.start_date,
                        r.end_date,
                        r.year,
                        r.month,
                        r.reason,
                        r.status,
                        r.created_at,
                        r.updated_at
                    FROM report_requests AS r
                    LEFT JOIN users AS u ON u.id = r.user_id
                    WHERE r.status = 'pending'
                    ORDER BY r.created_at DESC
                    LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$results) {
                return [
                    'success' => true,
                    'total' => 0,
                    'data' => []
                ];
            }

            $data = [];
            foreach ($results as $request) {
                // ✅ Format period text
                if ($request['request_type'] === 'weekly' && $request['start_date'] && $request['end_date']) {
                    $periodText = date('M d, Y', strtotime($request['start_date'])) . " to " . date('M d, Y', strtotime($request['end_date']));
                } elseif ($request['request_type'] === 'monthly' && $request['month'] && $request['year']) {
                    $monthName = date('F', mktime(0, 0, 0, $request['month'], 1));
                    $periodText = $monthName . ", " . $request['year'];
                } else {
                    $periodText = 'N/A';
                }

                $data[] = [
                    'id' => (int)$request['id'],
                    'user_id' => (int)$request['user_id'],
                    'name' => $request['name'], // ✅ Uses complete_name or username automatically
                    'request_type' => $request['request_type'],
                    'period' => $periodText,
                    'reason' => $request['reason'],
                    'status' => $request['status'],
                    'created_at' => $request['created_at'],
                    'updated_at' => $request['updated_at']
                ];
            }

            return [
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'totalPages' => $totalPages
                ]
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }

    public function updateReportRequestStatus($params) {
        try {
            $requestId = $params['data']['id'] ?? null;
            $newStatus = $params['data']['status'] ?? null; // expected values: 'approved' or 'rejected'
            $reason   = $params['data']['reason'] ?? null; // Reason for rejection

            if (!$requestId || !$newStatus || !in_array($newStatus, ['approved', 'rejected'])) {
                return ['success' => false, 'message' => 'Invalid request parameters'];
            }

            // Fetch existing request
            $stmt = $this->conn->prepare("SELECT * FROM report_requests WHERE id = :id");
            $stmt->execute(['id' => $requestId]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                return ['success' => false, 'message' => 'Report request not found'];
            }

            if ($request['status'] !== 'pending') {
                return ['success' => false, 'message' => 'Only pending requests can be updated'];
            }

            $generate = ['success' => true]; // Default for rejection
            if ($newStatus == 'approved' && $request['request_type'] === 'weekly' && $request['start_date'] && $request['end_date']) {
                $params = [
                    'data' => [
                        'user_id'    => $request['user_id'],
                        'start_date' => $request['start_date'],
                        'end_date'   => $request['end_date']
                    ]
                ];
                $generate = $this->generateTraineeWeeklyAccomplishmentReport($params);
            } elseif ($newStatus == 'approved' && $request['request_type'] === 'monthly' && $request['month'] && $request['year']) {
                $params = [
                    'data' => [
                        'user_id' => $request['user_id'],
                        'month'   => (int)$request['month'],
                        'year'    => (int)$request['year']
                    ]
                ];
                $generate = $this->generateTraineeMonthlyHoursReport($params);
            }

            // Update status
            if ($generate['success']) {
                $updateSql = "UPDATE report_requests 
                          SET status = :status, 
                              decline_reason = :reason, 
                              updated_at = NOW() 
                          WHERE id = :id";
                $stmt = $this->conn->prepare($updateSql);
                $stmt->execute([
                    'status' => $newStatus,
                    'reason' => $newStatus === 'rejected' ? $reason : null,
                    'id' => $requestId
                ]);

                logs([
                    'user_id' => $request['user_id'],
                    'action'  => "Report request ID {$requestId} has been {$newStatus}",
                    'type'    => 'report_request',
                    'status'  => 'updated'
                ], 'reportRequests.log');

                // Notify user
                $notificationController = new SendNotificationController();
                $notificationController->sendNotificationByUserId(
                    $request['user_id'],
                    'Report Request Update',
                    "Your report request (ID: {$requestId}) has been {$newStatus}."
                );

                $notificationController->saveNotificationToDB(
                    $request['user_id'],
                    'Report Request Update',
                    "Your report request (ID: {$requestId}) has been {$newStatus}.",
                );

                return ['success' => true, 'message' => "Report request has been {$newStatus}"];
            }

            return ['success' => false, 'message' => 'Failed to generate report for approval'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }
    
    //fetch teacher list from users where role. is 3
    public function getTeacherList($params){
       try{
            $page = isset($params['data']['page']) ? (int)$params['data']['page'] : 1;
            $limit = isset($params['data']['limit']) ? (int)$params['data']['limit'] : 10;
            $offset = ($page - 1) * $limit;

            // Count total teachers
            $countSql = "SELECT COUNT(*) FROM users WHERE role = 3";
            $countStmt = $this->conn->prepare($countSql);
            $countStmt->execute();
            $total = (int)$countStmt->fetchColumn();

            // Fetch paginated teachers
            $sql = "SELECT 
                        id AS teacher_id,
                        COALESCE(complete_name, username) AS teacher_name,
                        birthdate,
                        email,
                        avatar_url,
                        status,
                        created,
                        modified
                    FROM users
                    WHERE role = 3
                    LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate pagination
            $totalPages = $total > 0 ? ceil($total / $limit) : 1;

            return [
                'teachers' => $results,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'totalPages' => $totalPages
                ]
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
       }
    }

    //verify teacher account
    public function verifyTeacherAccount($params){
        try {
            $teacherId = $params['data']['teacher_id'] ?? null;
            if (!$teacherId || !is_numeric($teacherId)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }

            // Check if teacher exists and is not already verified
            $checkSql = "SELECT id, status FROM users WHERE id = :teacher_id AND role = 3";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute(['teacher_id' => $teacherId]);
            $teacher = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$teacher) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }
            if ((int)$teacher['status'] === 1) {
                return ['success' => false, 'message' => 'Teacher account is already verified'];
            }

            $sql = "UPDATE users SET status = 1 WHERE id = :teacher_id AND role = 3";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['teacher_id' => $teacherId]);

            return ['success' => true, 'message' => 'Teacher account verified successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    //delete teacher account
    public function deleteTeacherAccount($params){
        try {
            $teacherId = $params['data']['teacher_id'] ?? null;
            if (!$teacherId || !is_numeric($teacherId)) {
                return ['success' => false, 'message' => 'Invalid teacher ID'];
            }

            // Check if teacher exists
            $checkSql = "SELECT id FROM users WHERE id = :teacher_id AND role = 3";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute(['teacher_id' => $teacherId]);
            $teacher = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$teacher) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }

            // Delete teacher account
            $sql = "DELETE FROM users WHERE id = :teacher_id AND role = 3";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['teacher_id' => $teacherId]);

            return ['success' => true, 'message' => 'Teacher account deleted successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    //add new teacher account
    public function addTeacherAccount($params){
        try {
            $username = trim($params['data']['username'] ?? '');
            $password = $params['data']['password'] ?? '';
            $completeName = trim($params['data']['teacher_name'] ?? '');

            if (empty($username) || empty($password) || empty($completeName)) {
                return ['success' => false, 'message' => 'Username and password are required'];
            }

            //save avatar file if provided
            if (isset($params['files']['avatar'])) {
                try {
                    $avatarUrl = Upload::store($params['files']['avatar'], 'profile_images')['url'];
                } catch (RuntimeException $e) {
                    return ['success' => false, 'message' => $e->getMessage()];
                }
            } else {
                $avatarUrl = null; // No avatar provided
            }

            // Check if username or email already exists
            $checkSql = "SELECT id FROM users WHERE username = :username  AND role = 3";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute(['username' => $username]);
            if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
                return ['success' => false, 'message' => 'Username or email already exists'];
            }

            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $sql = "INSERT INTO users 
                        (complete_name, username, password, avatar_url, role, status, created, modified)
                    VALUES 
                        (:complete_name, :username, :password,   :avatar_url, 3, 1, NOW(), NOW())";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                'complete_name' => $completeName,
                'username'      => $username,
                'password'      => $hashedPassword,
                'avatar_url'    => $avatarUrl
            ]);

            return ['success' => true, 'message' => 'Teacher account created successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    //update teacher account
    public function updateTeacherAccount($params){
        try {
            $teacherId = $params['data']['teacher_id'] ?? null;
            $completeName = trim($params['data']['teacher_name'] ?? '');
            $password = $params['data']['password'] ?? null; // Optional

            if (!$teacherId || !is_numeric($teacherId) || empty($completeName)) {
                return ['success' => false, 'message' => 'Invalid input data'];
            }

            // Coordinators may only edit their own account; admins may edit any.
            if (AuthHelper::role() !== Access::ADMIN && (int) $teacherId !== (int) AuthHelper::id()) {
                return ['success' => false, 'message' => 'You can only edit your own account.'];
            }

            // Check if teacher exists
            $checkSql = "SELECT id, avatar_url FROM users WHERE id = :teacher_id AND role = 3";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute(['teacher_id' => $teacherId]);
            $teacher = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$teacher) {
                return ['success' => false, 'message' => 'Teacher not found'];
            }

            // Prepare update fields
            $updateFields = [
                'complete_name' => $completeName,
                'modified' => date('Y-m-d H:i:s')
            ];
            $updateSqlParts = ["complete_name = :complete_name", "modified = :modified"];

            if (!empty($password)) {
                $updateFields['password'] = password_hash($password, PASSWORD_DEFAULT);
                $updateSqlParts[] = "password = :password";
            }

            // Handle avatar upload if provided
            if (isset($params['files']['avatar'])) {
                try {
                    $saved = Upload::store($params['files']['avatar'], 'profile_images');
                } catch (RuntimeException $e) {
                    return ['success' => false, 'message' => $e->getMessage()];
                }
                $uploadDir = __DIR__ . '/../uploads/profile_images/';
                $newFileName = $saved['name'];

                // Optionally delete old avatar file
                if (!empty($teacher['avatar_url'])) {
                    $oldFilePath = $uploadDir . basename($teacher['avatar_url']);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }
                $avatarUrl = $saved['url'];
                $updateFields['avatar_url'] = $avatarUrl;
                $updateSqlParts[] = "avatar_url = :avatar_url";
            }

            $updateFields['teacher_id'] = $teacherId;
            $updateSql = "UPDATE users SET " . implode(', ', $updateSqlParts) . " WHERE id = :teacher_id AND role = 3";
            $stmt = $this->conn->prepare($updateSql);
            $stmt->execute($updateFields);

            return ['success' => true, 'message' => 'Teacher account updated successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => safeError($e)];
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    public function getAllEvaluations($data){

        $filters = $data['data'] ?? [];

        try {
            $query = "
                SELECT 
                    te.id,
                    te.evaluation_type,
                    te.attendance_punctuality,
                    te.work_quality,
                    te.productivity,
                    te.initiative,
                    te.communication_skills,
                    te.teamwork_cooperation,
                    te.adaptability,
                    te.attitude_conduct,
                    te.dependability,
                    te.overall_performance,
                    te.total_score,
                    te.comments,
                    te.evaluated_at,
                    t.id AS trainee_id,
                    t.complete_name AS trainee_name,
                    s.id AS supervisor_id,
                    s.complete_name AS supervisor_name
                FROM trainee_evaluations te
                LEFT JOIN users t ON te.trainee_id = t.id
                LEFT JOIN users s ON te.supervisor_id = s.id
                WHERE 1 = 1
            ";

            $params = [];

            if (!empty($filters['evaluation_type'])) {
                $query .= " AND te.evaluation_type = :evaluation_type";
                $params[':evaluation_type'] = $filters['evaluation_type'];
            }

            if (!empty($filters['year'])) {
                $query .= " AND YEAR(te.evaluated_at) = :year";
                $params[':year'] = $filters['year'];
            }

            if (!empty($filters['trainee_id'])) {
                $query .= " AND te.trainee_id = :trainee_id";
                $params[':trainee_id'] = $filters['trainee_id'];
            }

            if (!empty($filters['supervisor_id'])) {
                $query .= " AND te.supervisor_id = :supervisor_id";
                $params[':supervisor_id'] = $filters['supervisor_id'];
            }

            $query .= " ORDER BY te.evaluated_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);

            return [
                'status' => 'success',
                'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => safeError($e)
            ];
        }
    }

    /**
     * Evaluations from the mobile app's evaluation form, grouped per trainee:
     * evaluations[section][item] = {points, remarks}. Sections: 1 Leadership, 2 Attitude, 3 Performance.
     */
    public function getEvaluationsTrainee($params = []) {
        $stmt = $this->conn->prepare(
            "SELECT e.trainee_id, e.supervisor_id, e.evaluation_id, e.item_id, e.points, e.remarks, e.created_at,
                    COALESCE(NULLIF(t.complete_name, ''), t.username) AS trainee_name,
                    COALESCE(NULLIF(s.complete_name, ''), s.username) AS supervisor_name
             FROM trainee_evaluationsV2 e
             JOIN users t ON t.id = e.trainee_id
             JOIN users s ON s.id = e.supervisor_id
             ORDER BY e.created_at DESC, e.item_id"
        );
        $stmt->execute();

        $grouped = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $key = $row['trainee_id'] . '-' . $row['supervisor_id'];
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'trainee_id' => (int) $row['trainee_id'],
                    'trainee_name' => $row['trainee_name'],
                    'supervisor_id' => (int) $row['supervisor_id'],
                    'supervisor_name' => $row['supervisor_name'],
                    'evaluated_at' => $row['created_at'],
                    'evaluations' => [],
                ];
            }
            $grouped[$key]['evaluations'][$row['evaluation_id']][$row['item_id']] = [
                'points' => (int) $row['points'],
                'remarks' => $row['remarks'],
            ];
        }

        return ['success' => true, 'data' => array_values($grouped)];
    }

    /** Latest evaluations for the dashboard, with the score as a percentage. */
    public function getRecentEvaluations() {
        $stmt = $this->conn->prepare(
            "SELECT COALESCE(NULLIF(s.complete_name, ''), s.username) AS supervisor_name,
                    COALESCE(NULLIF(t.complete_name, ''), t.username) AS trainee_name,
                    'Trainee Evaluation' AS evaluation_type,
                    CONCAT(ROUND(SUM(e.points) / (COUNT(*) * 5) * 100), '%') AS score,
                    MAX(e.created_at) AS date
             FROM trainee_evaluationsV2 e
             JOIN users t ON t.id = e.trainee_id
             JOIN users s ON s.id = e.supervisor_id
             GROUP BY e.trainee_id, e.supervisor_id, s.complete_name, s.username, t.complete_name, t.username
             ORDER BY date DESC
             LIMIT 10"
        );
        $stmt->execute();
        return ['success' => true, 'recent_evaluations' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    }

    /** How many trainees have completed, are in progress, or haven't started their required hours. */
    public function getOjtHoursCompletionStats() {
        $stmt = $this->conn->prepare(
            "SELECT u.ojt_required_hours, COALESCE(w.worked_seconds, 0) AS worked_seconds
             FROM users u
             LEFT JOIN (" . $this->workedSecondsSql() . ") w ON w.trainee_id = u.id
             WHERE u.role = 1"
        );
        $stmt->execute();

        $stats = ['completed' => 0, 'in_progress' => 0, 'not_started' => 0];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $percent = self::completionPercent($row['worked_seconds'], $row['ojt_required_hours']);
            if ((int) $row['worked_seconds'] === 0) {
                $stats['not_started']++;
            } elseif ($percent >= 100) {
                $stats['completed']++;
            } else {
                $stats['in_progress']++;
            }
        }
        return ['success' => true, 'data' => $stats];
    }

    /**
     * Trainees who have reached their required hours.
     * Params: page, limit, search (by name)
     */
    public function getCompletedOjtTrainees($params) {
        $page = max(1, (int) ($params['data']['page'] ?? 1));
        $limit = min(100, max(1, (int) ($params['data']['limit'] ?? 10)));
        $search = trim((string) ($params['data']['search'] ?? ''));

        $where = "u.role = 1 AND COALESCE(w.worked_seconds, 0) >= COALESCE(NULLIF(u.ojt_required_hours, 0), 486) * 3600";
        $args = [];
        if ($search !== '') {
            $where .= " AND COALESCE(NULLIF(u.complete_name, ''), u.username) LIKE :search";
            $args['search'] = '%' . $search . '%';
        }
        $from = "FROM users u
                 LEFT JOIN (" . $this->workedSecondsSql() . ") w ON w.trainee_id = u.id
                 LEFT JOIN supervisor_trainees st ON st.trainee_id = u.id
                 LEFT JOIN users s ON s.id = st.supervisor_id
                 WHERE $where";

        $countStmt = $this->conn->prepare("SELECT COUNT(DISTINCT u.id) $from");
        $countStmt->execute($args);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $this->conn->prepare(
            "SELECT u.id AS trainee_id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name,
                    u.email,
                    u.avatar_url,
                    u.ojt_required_hours,
                    MAX(COALESCE(NULLIF(s.complete_name, ''), s.username)) AS supervisor_name
             $from
             GROUP BY u.id, u.complete_name, u.username, u.email, u.avatar_url, u.ojt_required_hours
             ORDER BY trainee_name
             LIMIT :limit OFFSET :offset"
        );
        foreach ($args as $k => $v) $stmt->bindValue(':' . $k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$row) {
            $row['ojt_completion_percentage'] = 100;
        }
        return ['success' => true, 'data' => $rows, 'pagination' => self::pagination($total, $page, $limit)];
    }

    /** PDF summary of one trainee (profile, attendance and reports) for printing. */
    public function generateTraineeDetails($params) {
        $details = $this->getTraineeDataById(['data' => ['trainee_id' => $params['data']['trainee_id'] ?? 0]]);
        if (empty($details['success'])) {
            return ['success' => false, 'message' => 'Trainee not found'];
        }
        $t = $details['data'];
        $e = function ($value) {
            return htmlspecialchars((string) ($value ?? 'N/A'), ENT_QUOTES, 'UTF-8');
        };

        $pdf = new TCPDF();
        $pdf->SetCreator('OJT Track');
        $pdf->SetTitle('Trainee Details - ' . $t['trainee_name']);
        $pdf->setPrintHeader(false);
        $pdf->SetMargins(15, 15, 15);
        $pdf->AddPage();
        $pdf->SetFont('helvetica', '', 10);

        $html = '<h2>' . $e($t['trainee_name']) . '</h2>
            <table cellpadding="4">
                <tr><td><b>Email:</b> ' . $e($t['email']) . '</td><td><b>Course:</b> ' . $e($t['course']) . '</td></tr>
                <tr><td><b>Company:</b> ' . $e($t['company']) . '</td><td><b>Supervisor:</b> ' . $e($t['supervisor_name']) . '</td></tr>
                <tr><td><b>Required hours:</b> ' . $e($t['ojt_required_hours']) . '</td><td><b>Work hours:</b> ' . $e($t['attendance']['work_hours']) . '</td></tr>
                <tr><td><b>Present:</b> ' . (int) $t['attendance']['present'] . '</td><td><b>Absent:</b> ' . (int) $t['attendance']['absent'] . '</td></tr>
            </table>
            <h3>Attendance</h3>
            <table border="1" cellpadding="3"><tr style="background-color:#eeeeee;"><th>Date</th><th>Time in</th><th>Time out</th></tr>';
        foreach ($t['attendance_logs'] as $log) {
            $html .= '<tr><td>' . $e($log['created_at']) . '</td><td>' . $e($log['time_in']) . '</td><td>' . $e($log['time_out']) . '</td></tr>';
        }
        $html .= '</table><h3>Reports</h3>';
        foreach ($t['reports'] as $week) {
            $html .= '<p><b>' . $e($week['week_range']) . '</b></p><ul>';
            foreach ($week['reports'] as $report) {
                if (!is_array($report)) continue;
                $html .= '<li><b>' . $e($report['title']) . '</b> (' . $e($report['date']) . '): ' . $e($report['description']) . '</li>';
            }
            $html .= '</ul>';
        }
        $pdf->writeHTML($html, true, false, true, false, '');

        $dir = __DIR__ . '/../uploads/trainee_details';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $filePath = $dir . '/' . Storage::randomName('trainee_' . $t['trainee_id'], 'pdf');
        $pdf->Output($filePath, 'F');

        $url = Storage::publish($filePath, 'application/pdf');
        if (Storage::usesCloudinary()) {
            @unlink($filePath);
        }
        return ['success' => true, 'url' => $url];
    }
}
