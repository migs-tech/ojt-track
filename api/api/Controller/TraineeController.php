<?php

class TraineeController {
    private $conn;

    public function __construct() {
        $this->conn = new Database();
    }

    public function getTraineeDataById($params) {
        $traineeId = $params['data']['id'] ?? null;
        if (!AuthHelper::canAccessTrainee($traineeId)) {
            return ['success' => false, 'message' => 'Trainee not found'];
        }
        $response = [];

        // get trainee details
        $stmt = $this->conn->prepare("
            SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name, email, avatar_url,
                   course, company, started_at, ojt_required_hours
            FROM users 
            WHERE id = :id
        ");
        $stmt->execute(['id' => $traineeId]);
        $trainee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$trainee) {
            return ['error' => 'Trainee not found'];
        }

        $response['trainee'] = $trainee;

        // optimized totals query
        $stmt = $this->conn->prepare("
            SELECT 
                COALESCE(SUM(TIMESTAMPDIFF(SECOND, time_in, time_out)), 0) AS total_seconds,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS total_present,
                SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS total_absent
            FROM trainee_attendance
            WHERE trainee_id = :trainee_id
        ");
        $stmt->execute(['trainee_id' => $traineeId]);
        $totals = $stmt->fetch(PDO::FETCH_ASSOC);

        $totalSeconds   = (int) $totals['total_seconds'];
        $totalHours     = floor($totalSeconds / 3600);
        $totalMinutes   = floor(($totalSeconds % 3600) / 60);
        $totalSecs      = $totalSeconds % 60;
        $totalFormatted = "{$totalHours}h {$totalMinutes}m {$totalSecs}s";

        $response['total_hours']   = $totalFormatted;
        $response['total_present'] = (int) $totals['total_present'];
        $response['total_absent']  = (int) $totals['total_absent'];

        // get attendance records
        $stmt = $this->conn->prepare("
            SELECT id, date, time_in, time_out, status 
            FROM trainee_attendance 
            WHERE trainee_id = :trainee_id 
            ORDER BY date DESC
        ");
        $stmt->execute(['trainee_id' => $traineeId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $attendanceData = [];
        foreach ($rows as $row) {
            $attendanceData[] = [
                'date'     => date("M d, Y", strtotime($row['date'])),
                'time_in'  => $row['time_in'] ? date("h:i A", strtotime($row['time_in'])) : null,
                'time_out' => $row['time_out'] ? date("h:i A", strtotime($row['time_out'])) : null,
                'status'   => (int) $row['status']
            ];
        }
        $response['attendance'] = $attendanceData;

        // get reports with files
        $stmt = $this->conn->prepare("
            SELECT 
                r.id, r.title, r.description, r.date,
                rf.file_url
            FROM reports r
            LEFT JOIN report_files rf ON rf.report_id = r.id
            WHERE r.user_id = :user_id
            ORDER BY r.id DESC
        ");
        $stmt->execute(['user_id' => $traineeId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group files by report ID
        $reports = [];
        foreach ($rows as $row) {
            $reportId = $row['id'];
            if (!isset($reports[$reportId])) {
                $reports[$reportId] = [
                    'id'          => $row['id'],
                    'title'       => $row['title'],
                    'description' => $row['description'],
                    'date'        => $row['date'],
                    'files'       => []
                ];
            }

            // Add only file_url if exists
            if (!empty($row['file_url'])) {
                $reports[$reportId]['files'][] = $row['file_url'];
            }
        }

        $response['reports'] = array_values($reports); // reset numeric keys

        return $response;
    }
    
     public function updateTraineeReport($params) {
        try {
            $data   = $params['data'] ?? [];
            $files  = $params['files']['files'] ?? null;
    
            $reportId    = $data['id'] ?? null;
            $title       = trim($data['title'] ?? '');
            $description = trim($data['description'] ?? '');
            $date        = !empty($data['date']) ? date('Y-m-d H:i:s', strtotime($data['date'])) : null;
    
            if (!$reportId || !is_numeric($reportId)) {
                return ['success' => false, 'message' => 'Invalid report ID'];
            }
    
            $stmt = $this->conn->prepare("SELECT * FROM reports WHERE id = :id");
            $stmt->execute(['id' => $reportId]);
            $report = $stmt->fetch(PDO::FETCH_ASSOC);
            // Trainees may only edit their own reports.
            if (!$report || (int) $report['user_id'] !== (int) AuthHelper::id()) {
                return ['success' => false, 'message' => 'Report not found'];
            }
    
            $removeFiles = $data['remove_files'] ?? [];
            if (!is_array($removeFiles)) {
                $removeFiles = json_decode($removeFiles, true);
            }
            $removeFiles = is_array($removeFiles) ? $removeFiles : [];
    
            // Update report
            $stmt = $this->conn->prepare("
                UPDATE reports 
                SET title = :title, description = :description, date = :date
                WHERE id = :id
            ");
            $success = $stmt->execute([
                ':title'       => $title,
                ':description' => $description,
                ':date'        => $date,
                ':id'          => $reportId
            ]);
    
            // Handle new files upload (images only, checked by content)
            $uploadedFiles = [];
            foreach (Upload::normalize($files ?? []) as $file) {
                try {
                    $saved = Upload::store($file, 'reports');
                } catch (RuntimeException $e) {
                    logs("Report file skipped: " . $e->getMessage());
                    continue;
                }

                $stmt = $this->conn->prepare("
                    INSERT INTO report_files (report_id, file_name, file_url, file_path, file_type, file_size) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $reportId,
                    $saved['name'],
                    $saved['url'],
                    "uploads/reports/" . $saved['name'],
                    $saved['type'],
                    $saved['size']
                ]);

                $uploadedFiles[] = $saved['url'];
            }
    
            // Handle file removals
            foreach ($removeFiles as $fileId) {
                if (!is_numeric($fileId)) continue;
    
                // Only files that belong to this report can be removed.
                $stmt = $this->conn->prepare("SELECT file_path FROM report_files WHERE id = ? AND report_id = ?");
                $stmt->execute([$fileId, $reportId]);
                $file = $stmt->fetch(PDO::FETCH_ASSOC);

                $oldFiles = __DIR__ . '/../uploads/reports/' . basename($file['file_path']);

                if ($file && file_exists($oldFiles)) {
                    unlink($oldFiles);
                    $delStmt = $this->conn->prepare("DELETE FROM report_files WHERE id = ?");
                    $delStmt->execute([$fileId]);
                    logs("Deleted file id=$fileId path=" . $file['file_path']);
                }
            }
    
            return [
                'success' => $success ? true : false,
                'message' => $success ? 'Report updated successfully' : 'Failed to update report',
                'uploaded' => $uploadedFiles,
                'removed' => $removeFiles
            ];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => safeError($e)];
        }
    }

    
     public function fetchRequestedTrainees() {
        try {
            $supervisorId = AuthHelper::validateToken()['id'];

            $sql = "
                SELECT 
                    ssr.id,
                    ssr.supervisor_id,
                    ssr.user_id,
                    ssr.status,
                    ssr.created_at,
                    ssr.updated_at,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name,
                    u.avatar_url,
                    u.course,
                    u.email
                FROM student_supervisor_requests ssr
                INNER JOIN users u ON ssr.user_id = u.id
                WHERE ssr.supervisor_id = :supervisor_id
                AND u.role = 1
                AND ssr.status = 0
            ";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['supervisor_id' => $supervisorId]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return [
                'success' => $data ? true : false,
                'requests' => $data ?? [],
                'message' => $data ? 'Data fetched successfully' : 'No data found'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }
    
    public function updateTraineeRequest($params) {
        try {
            $requestId = $params['data']['id'] ?? null;
            $newStatus = $params['data']['status'] ?? null;

            if (!$requestId || !isset($newStatus)) {
                return ['success' => false, 'message' => 'Invalid parameters'];
            }

            // Fetch request
            $stmt = $this->conn->prepare("SELECT * FROM student_supervisor_requests WHERE id = :id");
            $stmt->execute(['id' => $requestId]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            // Supervisors may only answer requests sent to them.
            if (!$request || (int) $request['supervisor_id'] !== (int) AuthHelper::id()) {
                return ['success' => false, 'message' => 'Request not found'];
            }

            // Update request status
            $stmt = $this->conn->prepare("
                UPDATE student_supervisor_requests 
                SET status = :status, updated_at = NOW() 
                WHERE id = :id
            ");
            $success = $stmt->execute(['status' => $newStatus, 'id' => $requestId]);

            // If approved, add to supervisor_trainees (avoid duplicates)
            if ($newStatus == 1 && $success) {
                $stmt2 = $this->conn->prepare("
                    SELECT COUNT(*) FROM supervisor_trainees 
                    WHERE supervisor_id = :supervisor_id AND trainee_id = :trainee_id
                ");
                $stmt2->execute([
                    'supervisor_id' => $request['supervisor_id'],
                    'trainee_id'    => $request['user_id']
                ]);
                $exists = $stmt2->fetchColumn();

                if (!$exists) {
                    $stmt3 = $this->conn->prepare("
                        INSERT INTO supervisor_trainees (supervisor_id, trainee_id, assigned_at)
                        VALUES (:supervisor_id, :trainee_id, NOW())
                    ");
                    $stmt3->execute([
                        'supervisor_id' => $request['supervisor_id'],
                        'trainee_id'    => $request['user_id']
                    ]);
                }
            }

            // Notify user about request status
            $notificationMsg = $newStatus == 1 ? "Your request has been approved." : "Your request has been rejected.";
            $notification = new SendNotificationController();
            $result = $notification->sendNotificationByUserId(
                $request['user_id'],
                "Request Update",
                $notificationMsg
            );

    
            $notification->saveNotificationToDB(
                $request['user_id'],
                "Request Update",
                $notificationMsg
            );
            

            return [
                'success' => $success ? true : false,
                'message' => $success ? 'Request updated successfully' : 'Failed to update request'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }
    
   public function getTraineeLatestReport() {
        try {
            $supervisorId = AuthHelper::validateToken()['id'];

            $sql = "
                SELECT 
                    st.trainee_id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name,
                    u.avatar_url,
                    st.assigned_at,
                    (SELECT COUNT(*) FROM reports rc WHERE rc.user_id = st.trainee_id) AS report_count,
                    COALESCE(
                        JSON_ARRAYAGG(
                            CASE 
                                WHEN r.id IS NOT NULL THEN JSON_OBJECT(
                                    'id', r.id,
                                    'title', r.title,
                                    'date', r.date,
                                    'description', r.description,
                                    'image_url', r.image_url,
                                    'status', r.status,
                                    'created_at', r.created_at,
                                    'updated_at', r.updated_at,
                                    'files', COALESCE(rf.files, JSON_ARRAY())
                                )
                            END
                        ),
                        JSON_ARRAY()
                    ) AS reports
                FROM supervisor_trainees st
                JOIN users u ON u.id = st.trainee_id
                LEFT JOIN (
                    SELECT *
                    FROM (
                        SELECT r.*,
                            ROW_NUMBER() OVER (
                                PARTITION BY r.user_id
                                ORDER BY r.date DESC, r.created_at DESC
                            ) AS rn
                        FROM reports r
                    ) ranked
                    WHERE rn <= 1
                ) r ON r.user_id = st.trainee_id
                LEFT JOIN (
                    SELECT 
                        report_id,
                        JSON_ARRAYAGG(file_url) AS files
                    FROM report_files
                    GROUP BY report_id
                ) rf ON rf.report_id = r.id
                WHERE st.supervisor_id = :supervisorId
                GROUP BY st.trainee_id, trainee_name, u.avatar_url, st.assigned_at
            ";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['supervisorId' => $supervisorId]);

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$row) {
                $row['reports'] = json_decode($row['reports'], true);
            }

            return [
                'success' => true,
                'data' => $rows
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }

    public function getTraineeReportListById($params) {
        try {
            $traineeId = $params['data']['traineeId'] ?? null;

            if (!$traineeId || !is_numeric($traineeId)) {
                return ['success' => false, 'message' => 'Invalid trainee ID'];
            }
            if (!AuthHelper::canAccessTrainee($traineeId)) {
                return ['success' => false, 'message' => 'Trainee not found'];
            }

            $sql = "
                SELECT 
                    r.id,
                    r.title,
                    r.description,
                    r.date,
                    r.image_url,
                    r.status,
                    r.created_at,
                    r.updated_at,
                    COALESCE(rf.files, JSON_ARRAY()) AS files
                FROM reports r
                LEFT JOIN (
                    SELECT 
                        report_id,
                        JSON_ARRAYAGG(file_url) AS files
                    FROM report_files
                    GROUP BY report_id
                ) rf ON rf.report_id = r.id
                WHERE r.user_id = :traineeId
                ORDER BY r.date DESC, r.created_at DESC
            ";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute(['traineeId' => $traineeId]);

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$row) {
                $row['files'] = json_decode($row['files'], true);
            }

            return [
                'success' => true,
                'reports' => $rows
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];  
        }
    }

    public function saveTraineeEvaluation($params){
        try {
            $data = $params['data'] ?? [];
            $traineeId   = $data['trainee_id'] ?? null;
            $supervisor  = AuthHelper::validateToken();
            $supervisorId = $supervisor['id'] ?? null;

            if (!$traineeId || !$supervisorId) {
                return [
                    'status' => 'error',
                    'message' => 'Missing trainee or supervisor ID.'
                ];
            }

            // Supervisors may only evaluate their own trainees.
            if (!AuthHelper::canAccessTrainee($traineeId)) {
                return [
                    'status' => 'error',
                    'message' => 'You can only evaluate your own trainees.'
                ];
            }

            $evaluationType = $data['evaluation_type'] ?? 'Midterm';
            $comments = $data['comments'] ?? '';

            // Check if already evaluated
            $checkQuery = "SELECT id FROM trainee_evaluations 
                        WHERE trainee_id = :trainee_id 
                        AND supervisor_id = :supervisor_id 
                        AND evaluation_type = :evaluation_type";
            $stmt = $this->conn->prepare($checkQuery);
            $stmt->execute([
                ':trainee_id' => $traineeId,
                ':supervisor_id' => $supervisorId,
                ':evaluation_type' => $evaluationType
            ]);

            if ($stmt->fetch()) {
                return [
                    'status' => 'error',
                    'message' => 'This trainee has already been evaluated by you for this evaluation type.'
                ];
            }

            // Midterm/Final form from the study: four criteria, each scored 1-5 (max 20).
            $criteria = $data['criteria'] ?? [];
            $scores = [];
            foreach (['personality', 'punctuality', 'courtesy', 'attitude'] as $key) {
                $scores[$key] = max(0, min(5, (int) ($criteria[$key] ?? 0)));
            }
            if (!in_array($evaluationType, ['Midterm', 'Final'], true)) {
                return ['status' => 'error', 'message' => 'Evaluation type must be Midterm or Final.'];
            }

            $stmt = $this->conn->prepare("
                INSERT INTO trainee_evaluations (
                    trainee_id, supervisor_id, evaluation_type,
                    personality, punctuality, courtesy, attitude,
                    total_score, comments, evaluated_at
                ) VALUES (
                    :trainee_id, :supervisor_id, :evaluation_type,
                    :personality, :punctuality, :courtesy, :attitude,
                    :total_score, :comments, NOW()
                )
            ");
            $stmt->execute([
                ':trainee_id'      => $traineeId,
                ':supervisor_id'   => $supervisorId,
                ':evaluation_type' => $evaluationType,
                ':personality'     => $scores['personality'],
                ':punctuality'     => $scores['punctuality'],
                ':courtesy'        => $scores['courtesy'],
                ':attitude'        => $scores['attitude'],
                ':total_score'     => array_sum($scores),
                ':comments'        => mb_substr((string) $comments, 0, 2000),
            ]);

            return [
                'status' => 'success',
                'message' => 'Evaluation saved successfully.'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => safeError($e)
            ];
        }
    }

    public function insertAttendanceForTrainee() {
        // Start date (July 1 of current year)
        $start = new DateTime(date('Y') . '-07-01');
        $today = new DateTime(); // up to today
        $traineeId = 58;

        $count = 0;

        while ($start <= $today) {
            $dayOfWeek = $start->format('N'); // 1 (Mon) - 7 (Sun)

            // Only insert Monday–Friday
            if ($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $date = $start->format('Y-m-d');
                $timeIn = $start->format('Y-m-d') . ' 09:00:00';
                $timeOut = $start->format('Y-m-d') . ' 18:00:00';
                // Check if already exists (avoid duplicates)
                $check = $this->conn->prepare("SELECT id FROM trainee_attendance WHERE trainee_id = ? AND date = ?");
                $check->execute([$traineeId, $date]);
                $exists = $check->fetch(PDO::FETCH_ASSOC);

                if (!$exists) {
                    $stmt = $this->conn->prepare("
                        INSERT INTO trainee_attendance 
                        (trainee_id, date, time_in, time_out, status, remarks, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 1, 'Present', NOW(), NOW())
                    ");
                    $stmt->execute([
                        $traineeId, 
                        $date,
                        $timeIn,
                        $timeOut
                    ]);
                    $count++;
                }
            }

            // Move to next day
            $start->modify('+1 day');
        }

        return "Inserted $count attendance records for trainee ID $traineeId.";
    }

    /**
     * Saves the supervisor's evaluation form from the mobile app.
     * scores[section][item] = {points: 1-5, remarks}, e.g. scores["1"]["1a"].
     */
    public function saveEvaluationV2($params) {
        $data = $params['data'] ?? [];
        $traineeId = (int) ($data['traineeId'] ?? $data['trainee_id'] ?? 0);
        $scores = $data['scores'] ?? null;
        $supervisorId = (int) AuthHelper::id();

        if (!$traineeId || !is_array($scores) || !$scores) {
            return ['success' => false, 'message' => 'Missing trainee or scores.'];
        }
        if (!AuthHelper::canAccessTrainee($traineeId)) {
            return ['success' => false, 'message' => 'You can only evaluate your own trainees.'];
        }
        if ($this->evaluationExists($traineeId, $supervisorId)) {
            return ['success' => false, 'message' => 'Evaluation already submitted for this trainee.'];
        }

        $rows = [];
        foreach ($scores as $section => $items) {
            if (!in_array((string) $section, ['1', '2', '3'], true) || !is_array($items)) continue;
            foreach ($items as $itemId => $item) {
                if (!preg_match('/^[1-3][a-d]$/', (string) $itemId)) continue;
                $points = (int) ($item['points'] ?? 0);
                if ($points < 1 || $points > 5) {
                    return ['success' => false, 'message' => 'Each score must be from 1 to 5.'];
                }
                $remarks = mb_substr(trim((string) ($item['remarks'] ?? '')), 0, 255);
                $rows[] = [(int) $section, (string) $itemId, $points, $remarks];
            }
        }
        if (count($rows) !== 12) {
            return ['success' => false, 'message' => 'Please score all 12 items.'];
        }

        try {
            $this->conn->beginTransaction();
            $stmt = $this->conn->prepare(
                "INSERT INTO trainee_evaluationsV2 (trainee_id, supervisor_id, evaluation_id, item_id, points, remarks)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            foreach ($rows as [$section, $itemId, $points, $remarks]) {
                $stmt->execute([$traineeId, $supervisorId, $section, $itemId, $points, $remarks]);
            }
            $this->conn->commit();
        } catch (Exception $e) {
            $this->conn->rollBack();
            return ['success' => false, 'message' => safeError($e)];
        }

        return ['success' => true, 'message' => 'Evaluation saved successfully.'];
    }

    /** GET trainee/checkEvaluationExists?traineeId=… : whether this supervisor already evaluated the trainee. */
    public function checkEvaluationExists($params) {
        $traineeId = (int) ($params['traineeId'] ?? $params['data']['traineeId'] ?? 0);
        return ['exists' => $traineeId > 0 && $this->evaluationExists($traineeId, (int) AuthHelper::id())];
    }

    private function evaluationExists(int $traineeId, int $supervisorId): bool {
        $stmt = $this->conn->prepare(
            "SELECT 1 FROM trainee_evaluationsV2 WHERE trainee_id = ? AND supervisor_id = ? LIMIT 1"
        );
        $stmt->execute([$traineeId, $supervisorId]);
        return (bool) $stmt->fetchColumn();
    }

    /** Supervisor removes one of their trainees; the trainee can then request a new supervisor. */
    public function unEnrollTrainee($params) {
        $traineeId = (int) ($params['data']['trainee_id'] ?? 0);
        $supervisorId = (int) AuthHelper::id();

        $stmt = $this->conn->prepare("DELETE FROM supervisor_trainees WHERE trainee_id = ? AND supervisor_id = ?");
        $stmt->execute([$traineeId, $supervisorId]);
        if ($stmt->rowCount() === 0) {
            return ['success' => false, 'error' => 'Trainee not found in your list.'];
        }

        // Close their accepted request so they can send a new one.
        $this->conn->prepare(
            "UPDATE student_supervisor_requests SET status = 2 WHERE user_id = ? AND supervisor_id = ? AND status = 1"
        )->execute([$traineeId, $supervisorId]);

        return ['success' => true, 'message' => 'Trainee removed.'];
    }
}
