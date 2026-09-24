<?php
  
class UserAttendanceController {
    private $conn;

    public function __construct() {
        $this->conn = new Database();
    }
    
    public function getAttendanceByUserId() {
        $traineeId = AuthHelper::validateToken()['id'];
    
        $stmt = $this->conn->prepare(
            "SELECT id, date, time_in, time_out, status 
             FROM trainee_attendance 
             WHERE trainee_id = :trainee_id 
             ORDER BY date DESC"
        );
        $stmt->execute(['trainee_id' => $traineeId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        $totalSeconds = 0;
        $data = [];
    
        foreach ($rows as $row) {
            $formattedDate = date("M d, Y", strtotime($row['date']));
            $timeIn = $row['time_in'] ? date("h:i A", strtotime($row['time_in'])) : null;
            $timeOut = $row['time_out'] ? date("h:i A", strtotime($row['time_out'])) : null;
            $status = $row['status'];
    
            // calculate duration
            $duration = null;
            if ($timeIn && $status == 1 ) {
                $start = strtotime($row['time_in']);
                $end = $row['time_out'] ? strtotime($row['time_out']) : time();
                $diff  = $end - $start;
    
                if ($diff > 0) {
                    $hours = floor($diff / 3600);
                    $minutes = floor(($diff % 3600) / 60);
                    $seconds = $diff % 60;
                    $duration = "{$hours}h {$minutes}m {$seconds}s";
                    $totalSeconds += $diff;
                }
            }
    
            $data[] = [
                "id"        => $row["id"],
                "date"      => $formattedDate,
                "time_in"   => $timeIn,
                "time_out"  => $timeOut,
                "duration"  => $duration,
                "is_present"=> $row["status"] == 1
            ];
        }
    
        // total work hours
        $totalHours = floor($totalSeconds / 3600);
        $totalMinutes = floor(($totalSeconds % 3600) / 60);
        $totalSecs = $totalSeconds % 60;
        $totalFormatted = "{$totalHours}h {$totalMinutes}m {$totalSecs}s";
    
        return [
            "total_hours" => $totalFormatted,
            "days_count"  => count($data),
            "records"     => $data
        ];
    }

    public function getTotalHours() {
        $userId = AuthHelper::validateToken()['id'];
    
        $stmt = $this->conn->prepare(
            "SELECT id, time_in, time_out, status FROM trainee_attendance 
             WHERE trainee_id = :trainee_id 
             ORDER BY date DESC"
        );
        $stmt->execute(['trainee_id' => $userId]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        $totalSeconds = 0;
    
        foreach ($data as $row) {
            if (!empty($row['time_in'] && $row['status'] == 1 )) {
                $start = strtotime($row['time_in']);
                $end   = !empty($row['time_out']) 
                            ? strtotime($row['time_out']) 
                            : time(); // still ongoing
    
                // handle overnight shifts (if time_out is past midnight)
                if ($end < $start) {
                    $end = strtotime('+1 day', $end);
                }
    
                $totalSeconds += max(0, $end - $start);
            }
        }
    
        $hours   = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);
        $seconds = $totalSeconds % 60;
    
        return [
            "total_hours" => "{$hours}h {$minutes}m {$seconds}s"
        ];
    }
    
    public function timeOut(){
        try {
            $userId = AuthHelper::validateToken()['id']; 
    
            // Check if already timed out today
            $today = date("Y-m-d");
    
            $checkStmt = $this->conn->prepare(
                "SELECT time_out FROM trainee_attendance 
                 WHERE trainee_id = :trainee_id 
                   AND date = :today"
            );
            $checkStmt->execute(['trainee_id' => $userId , 'today' => $today]);
            $attendance = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
            if ($attendance && !empty($attendance['time_out'])) {
                return [
                    "success" => false,
                    "message" => "Already timed out today"
                ];
            }
    
            $timeOut = date("Y-m-d H:i:s");
    
            $stmt = $this->conn->prepare(
                "UPDATE trainee_attendance 
                 SET time_out = :timeOut , status = 1 
                 WHERE trainee_id = :trainee_id 
                   AND date = :today 
                   AND time_in IS NOT NULL
                   AND time_out IS NULL"
            );
            $success = $stmt->execute(['trainee_id' => $userId, 'timeOut' => $timeOut, 'today' => $today]);
    
            return [
                "success" => $success ? true : false,
                "message" => $success ? "Time out recorded" : "Failed to record time out"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => "Error: " . $e->getMessage()
            ];
        }
    }
}