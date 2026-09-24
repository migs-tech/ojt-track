<?php

class TraineeController {
    private $conn;

    public function __construct() {
        $this->conn = new Database();
    }

    public function getTraineeDataById($params) {
        $traineeId = $params['data']['id'];
        $response = [];

        // get trainee details
        $stmt = $this->conn->prepare("
            SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name, email, avatar_url
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
            if (!$report) {
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
    
            // File upload dir
            $uploadDir = __DIR__ . '/../uploads/reports/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
    
            // Handle new files upload
            $uploadedFiles = [];
            if ($files && isset($files['name']) && is_array($files['name'])) {
                foreach ($files['name'] as $index => $name) {
                    $tmpName = $files['tmp_name'][$index];
                    $type    = $files['type'][$index];
                    $size    = $files['size'][$index];
                    $error   = $files['error'][$index];
    
                    if ($error !== UPLOAD_ERR_OK) {
                        logs("File #$index failed: error=$error");
                        continue;
                    }
    
                    // Validate size (max 5MB)
                    if ($size > 5 * 1024 * 1024) {
                        logs("File too large: $name ($size bytes)");
                        continue;
                    }
    
                    // Validate mime type (only images)
                    $allowed = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!in_array($type, $allowed)) {
                        logs("Invalid file type: $type");
                        continue;
                    }
    
                    // Unique filename
                    $uniqueName = uniqid() . "_" . basename($name);
                    $filePath   = $uploadDir . $uniqueName;
    
                    if (move_uploaded_file($tmpName, $filePath)) {
                        $fileUrl = BASE_URL . "/api/uploads/reports/" . $uniqueName;
    
                        $stmt = $this->conn->prepare("
                            INSERT INTO report_files (report_id, file_name, file_url, file_path, file_type, file_size) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $reportId,
                            $uniqueName,
                            $fileUrl,
                            "uploads/reports/" . $uniqueName,
                            $type,
                            $size
                        ]);
    
                        $uploadedFiles[] = $fileUrl;
                    }
                }
            }
    
            // Handle file removals
            foreach ($removeFiles as $fileId) {
                if (!is_numeric($fileId)) continue;
    
                $stmt = $this->conn->prepare("SELECT file_path FROM report_files WHERE id = ?");
                $stmt->execute([$fileId]);
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
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
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
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name
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
                'message' => 'Error: ' . $e->getMessage()
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

            if (!$request) {
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
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }
    
   public function getTraineeLatestReport() {
        try {
            $supervisorId = AuthHelper::validateToken()['id'];

            $sql = "
                SELECT 
                    st.trainee_id,
                    COALESCE(u.complete_name, u.username) AS trainee_name,
                    u.avatar_url,
                    st.assigned_at,
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
                            ORDER BY r.date DESC, r.created_at DESC
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
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    public function getTraineeReportListById($params) {
        try {
            $traineeId = $params['data']['traineeId'] ?? null;

            if (!$traineeId || !is_numeric($traineeId)) {
                return ['success' => false, 'message' => 'Invalid trainee ID'];
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
                'message' => 'Error: ' . $e->getMessage()
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

            // Prepare insert
            $criteria = $data['criteria'] ?? [];
            $insertQuery = "
                INSERT INTO trainee_evaluations (
                    trainee_id, supervisor_id, evaluation_type,
                    attendance_punctuality, work_quality, productivity, initiative, 
                    communication_skills, teamwork_cooperation, adaptability, 
                    attitude_conduct, dependability, overall_performance, 
                    total_score, comments, evaluated_at
                ) VALUES (
                    :trainee_id, :supervisor_id, :evaluation_type,
                    :attendance_punctuality, :work_quality, :productivity, :initiative,
                    :communication_skills, :teamwork_cooperation, :adaptability,
                    :attitude_conduct, :dependability, :overall_performance,
                    :total_score, :comments, :evaluated_at
                )
            ";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->execute([
                ':trainee_id' => $traineeId,
                ':supervisor_id' => $supervisorId,
                ':evaluation_type' => $evaluationType,
                ':attendance_punctuality' => $criteria['attendance_punctuality'] ?? 0,
                ':work_quality' => $criteria['work_quality'] ?? 0,
                ':productivity' => $criteria['productivity'] ?? 0,
                ':initiative' => $criteria['initiative'] ?? 0,
                ':communication_skills' => $criteria['communication_skills'] ?? 0,
                ':teamwork_cooperation' => $criteria['teamwork_cooperation'] ?? 0,
                ':adaptability' => $criteria['adaptability'] ?? 0,
                ':attitude_conduct' => $criteria['attitude_conduct'] ?? 0,
                ':dependability' => $criteria['dependability'] ?? 0,
                ':overall_performance' => $criteria['overall_performance'] ?? 0,
                ':total_score' => $data['total_score'] ?? 0,
                ':comments' => $comments,
                ':evaluated_at' => $data['evaluated_at'] ?? date('Y-m-d H:i:s')
            ]);

            return [
                'status' => 'success',
                'message' => 'Evaluation saved successfully.'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to save evaluation: ' . $e->getMessage()
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

}
