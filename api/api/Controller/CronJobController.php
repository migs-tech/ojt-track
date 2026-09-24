<?php

class CronJobController {
    private $conn;
    private $notification;
    private $generate;

    public function __construct() {
        $this->conn = new Database();
        $this->notification = new SendNotificationController();
        $this->generate = new GenerateReportController();
    }

    /**
     * Runs every job that is due right now. Call it every 10 minutes (it also keeps a sleeping
     * server awake), so one cron-job.org job replaces a separate job per task.
     * Each window starts on a 10-minute mark and each job runs at most once per day.
     */
    public function runAll() {
        ignore_user_abort(true); // keep going if the caller stops waiting
        set_time_limit(0);

        $weekdays = [1, 2, 3, 4, 5];
        // [method, days (date('N')) or null for every day, window start, window end]
        $schedule = [
            ['runDailyQuote',                     null,      '07:00', '07:09'],
            ['runCheckInDailyReminder',           $weekdays, '07:50', '07:55'],
            ['runCheckOutDailyReminder',          $weekdays, '17:50', '17:55'],
            ['runDailyReportReminder',            $weekdays, '20:00', '20:09'],
            ['runWeeklyReportReminder',           [5],       '20:00', '20:09'],
            ['runAutoGenerateMonthlyHoursReport', null,      '22:00', '22:09'], // acts only on the last day of the month
            ['runAutoTimeOut',                    null,      '23:00', '23:09'],
            ['runWeeklyReportsAndHours',          [5],       '23:40', '23:49'],
            ['runDailyAttendanceChecker',         $weekdays, '23:50', '23:59'],
        ];

        $now = date('H:i');
        $day = (int) date('N');
        $ran = [];
        foreach ($schedule as [$method, $days, $start, $end]) {
            if ($days !== null && !in_array($day, $days, true)) continue;
            if ($now < $start || $now > $end) continue;
            if (RateLimiter::attempt("cron-run:$method:" . date('Y-m-d'), 1, 86400)) continue;
            try {
                $ran[$method] = $this->$method();
            } catch (Throwable $e) {
                error_log("[cron] $method failed: " . $e->getMessage());
                $ran[$method] = ['success' => false, 'message' => 'Failed'];
            }
        }

        return ['success' => true, 'time' => date('Y-m-d H:i'), 'ran' => $ran];
    }

    public function runAutoTimeOut() {
        
        $today = date("Y-m-d");

        $sql = "SELECT id, trainee_id, time_in
                FROM trainee_attendance
                WHERE DATE(time_in) = :today
                  AND time_in IS NOT NULL
                  AND time_out IS NULL";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':today' => $today]);

        $updatedCount = 0;

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $attendanceId = $row['id'];
            $timeIn       = $row['time_in'];
            $userId       = $row['trainee_id'];

            $computedTimeOut = date("Y-m-d H:i:s", strtotime($timeIn) + (10 * 3600));
            $cutOff          = date("Y-m-d 23:00:00", strtotime($timeIn));
            $timeOut         = (strtotime($computedTimeOut) > strtotime($cutOff))
                ? $cutOff
                : $computedTimeOut;

            $updateSql = "UPDATE trainee_attendance
                          SET time_out = :time_out
                          WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->execute([
                ':time_out' => $timeOut,
                ':id'       => $attendanceId
            ]);

            $title   = "Auto Timeout Applied";
            $message = "You forgot to time out today. The system has automatically recorded your time out at {$timeOut}.";
            $type = "system";

            $notifSql = "INSERT INTO notifications 
                         (user_id, title, message, type) 
                         VALUES (:user_id, :title, :message, :type)";
            $notifStmt = $this->conn->prepare($notifSql);
            $notifStmt->execute([
                ':user_id' => $userId,
                ':title'   => $title,
                ':message' => $message,
                ':type'    => $type
            ]);

            $updatedCount++;

           $result = $this->notification->sendNotificationByUserId($userId, $title, $message);
            if ($result === false) {
                continue;
            }
        }

        return [
            'status'  => 'success',
            'message' => "Auto timeout applied to {$updatedCount} record(s)."
        ];
    }
    
    public function runDailyAttendanceChecker() {
        $dayOfWeek = date("N");

        if ($dayOfWeek >= 6) {
            return [
                "status" => "skipped",
                "message" => "Cron skipped because today is weekend."
            ];
        }
        
        $date = date("Y-m-d");
        $absentCount = 0;
    
        $sql = "SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name 
                FROM users 
                WHERE role = 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        foreach ($trainees as $row) {
            $userId = $row['id'];
    
            $checkSql = "SELECT COUNT(*) FROM trainee_attendance 
                         WHERE trainee_id = :trainee_id AND date = :date";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([
                ':trainee_id' => $userId,
                ':date'       => $date
            ]);
            $exists = $checkStmt->fetchColumn();
    
            if (!$exists) {
                $insertSql = "INSERT INTO trainee_attendance 
                              (trainee_id, date, time_in, time_out, status) 
                              VALUES (:trainee_id, :date, NULL, NULL, 2)";
                $insertStmt = $this->conn->prepare($insertSql);
                $insertStmt->execute([
                    ':trainee_id' => $userId,
                    ':date'       => $date
                ]);
    
                $absentCount++;
    
                $notifSql = "INSERT INTO notifications 
                             (user_id, title, message, type, created_at) 
                             VALUES (:user_id, :title, :message, :type, NOW())";
                $notifStmt = $this->conn->prepare($notifSql);
                $notifStmt->execute([
                    ':user_id' => $userId,
                    ':title'   => "Absent Marked",
                    ':message' => "You were marked absent on {$date}.",
                    ':type'    => "system"
                ]);

                $result = $this->notification->sendNotificationByUserId(
                    $userId,
                    "Absent Marked",
                    "You were marked absent on {$date}."
                );

                if ($result === false) {
                    continue;
                }
            }
        }
        
        return [
            'status' => 'success',
            'message' => "Daily attendance check completed.",
            'absent_marked' => $absentCount
        ];
    }
    
    public function runCheckInDailyReminder() {
        
        try {
            $dayOfWeek = date("N");
            if ($dayOfWeek >= 6) {
                return [
                    "status" => "skipped",
                    "message" => "Cron skipped because today is weekend."
                ];
            }

            $currentTime = date("H:i:s");

            $startTime = "07:50:00";
            $endTime   = "07:55:00";
            
            if ($currentTime < $startTime || $currentTime > $endTime) {
                return [
                    "status" => "skipped",
                    "message" => "Cron skipped because current time is outside the reminder window (07:50–07:55)."
                ];
            }

            $date = date("Y-m-d");
            $reminderCount = 0;

            $sql = "SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name 
                    FROM users 
                    WHERE role = 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($trainees as $row) {
                $userId = $row['id'];

                $checkSql = "SELECT COUNT(*) FROM trainee_attendance 
                             WHERE trainee_id = :trainee_id AND date = :date AND time_in IS NOT NULL";
                $checkStmt = $this->conn->prepare($checkSql);
                $checkStmt->execute([
                    ':trainee_id' => $userId,
                    ':date'       => $date
                ]);
                $hasCheckedIn = $checkStmt->fetchColumn();

                if (!$hasCheckedIn) {
                    $title   = "Reminder: Please Check In";
                    $message = "This is a friendly reminder to check in for today ({$date}). Please remember to log your attendance.";
                    $type    = "reminder";

                    $notifSql = "INSERT INTO notifications 
                                 (user_id, title, message, type, created_at) 
                                 VALUES (:user_id, :title, :message, :type, NOW())";
                    $notifStmt = $this->conn->prepare($notifSql);
                    $notifStmt->execute([
                        ':user_id' => $userId,
                        ':title'   => $title,
                        ':message' => $message,
                        ':type'    => $type
                    ]);

                    $result = $this->notification->sendNotificationByUserId($userId, $title, $message);
                    if ($result === false) {
                        continue;
                    }
                    $reminderCount++;
                }
            }

            return [
                'status' => 'success',
                'message' => "Check-in reminders sent to {$reminderCount} trainee(s)."
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => safeError($e)
            ];
        }
    }

    //remider for check out at 6:00 PM
    public function runCheckOutDailyReminder() {
        
        try {
            $dayOfWeek = date("N");
            if ($dayOfWeek >= 6) {
                return [
                    "status" => "skipped",
                    "message" => "Cron skipped because today is weekend."
                ];
            }
            
            $currentTime = date("H:i:s");

            $startTime = "17:50:00";
            $endTime   = "17:55:00";
            
            if ($currentTime < $startTime || $currentTime > $endTime) {
                return [
                    "status" => "skipped",
                    "message" => "Cron skipped because current time is outside the reminder window (05:50  05:55).PM"
                ];
            }

            $date = date("Y-m-d");
            $reminderCount = 0;

            $sql = "SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name 
                    FROM users 
                    WHERE role = 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($trainees as $row) {
                $userId = $row['id'];

                $checkSql = "SELECT COUNT(*) FROM trainee_attendance 
                             WHERE trainee_id = :trainee_id AND date = :date AND time_in IS NOT NULL AND time_out IS NULL";
                $checkStmt = $this->conn->prepare($checkSql);
                $checkStmt->execute([
                    ':trainee_id' => $userId,
                    ':date'       => $date
                ]);
                $hasCheckedInNoOut = $checkStmt->fetchColumn();

                if ($hasCheckedInNoOut) {
                    $title   = "Reminder: Please Check Out";
                    $message = "This is a friendly reminder to check out for today ({$date}). Please remember to log your time out.";
                    $type    = "reminder";

                    $notifSql = "INSERT INTO notifications 
                                 (user_id, title, message, type, created_at) 
                                 VALUES (:user_id, :title, :message, :type, NOW())";
                    $notifStmt = $this->conn->prepare($notifSql);
                    $notifStmt->execute([
                        ':user_id' => $userId,
                        ':title'   => $title,
                        ':message' => $message,
                        ':type'    => $type
                    ]);
                    $result = $this->notification->sendNotificationByUserId($userId, $title, $message);
                    if ($result === false) {
                        continue;
                    }
                    $reminderCount++;
                }
            }

            return [
                'status' => 'success',
                'message' => "Check-out reminders sent to {$reminderCount} trainee(s)."
            ];

        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => safeError($e)
            ];
        }
    }
    
    public function runAutoGenerateMonthlyHoursReport() {
         
         $today = new DateTime('today');
         $lastDay = new DateTime('last day of this month');
         
         if ($today->format('Y-m-d') !== $lastDay->format('Y-m-d')) {
            return [
                "success" => false,
                "message" => "Not last day of month, skipping...\n",
                'last data' => $lastDay,
                'today' => $today
                ];
        }
        $results = [];
        try {
            $stmt = $this->conn->prepare("SELECT id, username, email, email_flg FROM users WHERE role = 1");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            

            foreach ($users as $user) {
                $result = $this->generate->generateTraineeMonthlyHoursReport($user['id']);

                if ($result['success']) {
                    $emailStatus = "Email not sent";

                    if ($user['email'] && $user['email_flg'] == 1) {
                        $sendMail = MailerController::sendEmail(
                            [
                                'to'      => $user['email'],
                                'subject' => "Your Monthly Hours Report",
                                'body'    => "<p>Hi {$user['username']},<br/>Please find attached your monthly report.</p>",
                                'files'   => $result['filePath'],
                                'fileNames' => $result['fileName']
                            ]
                        );

                        if (!empty($sendMail['success'])) {
                            $this->notification->sendNotificationByUserId(
                                $user['id'],
                                "Monthly Hours Report Generated",
                                "Your monthly hours report has been generated and sent to your email. Please check your inbox. if you did not receive the email, please check your spam or junk folder."
                            );
                            $emailStatus = "Email sent successfully to {$user['email']}";
                        } else {
                            $emailStatus = "Failed to send email to {$user['email']}";
                        }
                    }

                    $results[] = [
                        'user_id'   => $user['id'],
                        'user_name' => $user['username'],
                        'status'    => 'Monthly hours report generated successfully',
                        'email'     => $emailStatus,
                        'result'    => $result,
                    ];
                } else {
                    $results[] = [
                        'user_id'   => $user['id'],
                        'user_name' => $user['username'],
                        'status'    => 'Error: ' . $result['message'],
                        'email'     => 'Skipped (report not generated)',
                    ];
                }
            }
        } catch (Exception $e) {
            $results[] = [
                'user_id'   => null,
                'user_name' => null,
                'status'    => safeError($e),
                'email'     => 'N/A'
            ];
        }

        return $results;
    }
    
    public function runWeeklyAccomplishmentReport(){
         $results = [];
        try {
            
            $dayOfWeek = date('N'); // 1 (Mon) - 7 (Sun)
            $hour      = date('H'); // 00-23
            $minute    = date('i'); // 00-59
            
            // // Only run at exactly Friday 11:00 PM
            if ($dayOfWeek != 5 || $hour != 23 || $minute > 5) {
                return [
                    'success' => false,
                    'message' => 'Weekly reports run only at exactly 11:00 PM on Friday.'
                ];
            }
            
            $stmt = $this->conn->prepare("SELECT id, username, email, email_flg FROM users WHERE role = 1");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($users as $user) {
                $result = $this->generate->generateWeeklyReports($user['id'], false);

                if (!$result) {
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'No new report generated',
                        'result' => []
                    ];
                    continue;
                } elseif ($result['success']) {
                    
                    $emailStatus = "Email not sent";

                    if ($user['email'] && $user['email_flg'] == 1) {
                        $sendMail = MailerController::sendEmail(
                            [
                                'to'      => $user['email'],
                                'subject' => "Your Weekly Accommplisment Report",
                                'body'    => "<p>Hi {$user['username']},<br/>Please find attached your weekly accommplisment report.</p>",
                                'files'   => $result['filePath'],
                                'fileNames' => $result['fileName']
                            ]
                        );

                        if (!empty($sendMail['success'])) {
                            $this->notification->sendNotificationByUserId(
                                $user['id'],
                                "Weekly Report Generated",
                                "Your weekly accomplishment report has been generated and sent to your email. Please check your inbox. if you did not receive the email, please check your spam or junk folder."
                            );
                            $emailStatus = "Email sent successfully to {$user['email']}";
                            $this->notification->saveNotificationToDB(
                                $user['id'],
                                'Weekly Report Generated',
                                "Your weekly accomplishment report has been generated and sent to your email. Please check your inbox. if you did not receive the email, please check your spam or junk folder."
                            );
                        } else {
                            $emailStatus = "Failed to send email to {$user['email']}";
                        }
                    }
                    
                    
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'Report generated successfully',
                         'email'     => $emailStatus,
                    ];
                } else {
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'Error: ' . $result['message'],
                        'test' => "test"
                    ];
                }
            }
        } catch (Exception $e) {
            $results[] = [
                'user_id' => null,
                'user_name' => null,
                'status' => safeError($e)
            ];
        }

        return $results;
        
    }
    
    public function runDailyQuote(){
        $ch = curl_init("https://zenquotes.io/api/random");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
    
        $data = json_decode($response, true);
    
        if ($data && isset($data[0]['q']) && isset($data[0]['a'])) {
            $quote = $data[0]['q'];
            $author = $data[0]['a'];
    
            // Notification content
            $title = "Quote of the day";
            $message = "\"{$quote}\" - {$author}";
    
            // 🔹 Get all trainees
            $sql = "SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS trainee_name 
                    FROM users 
                    WHERE role = 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            // 🔹 Send to each trainee
            foreach ($trainees as $row) {
                $userId = $row['id'];
                $this->notification->sendNotificationByUserId($userId, $title, $message);
            }
            
            return [
                "success" => true
                ];
    
        } else {
            echo "Failed to fetch quote.";
        }
    }
    
    public function runDailyReportReminder(){
        try {
            $date = date('Y-m-d');
            $dayOfWeek = date('N'); // 1 (Mon) - 7 (Sun)
            $hour = date('H');      // 00-23
    
            // Skip weekends (Saturday = 6, Sunday = 7)
            if ($dayOfWeek >= 6) {
                return [
                    'success' => true,
                    'message' => 'It is weekend. No reminders sent.'
                ];
            }
    
            // Only run after 8 PM
            if ($hour < 20) {
                return [
                    'success' => true,
                    'message' => 'It is not yet 8 PM. Skipping reminders.'
                ];
            }
    
            $stmt = $this->conn->prepare("
                SELECT 
                    u.id, 
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS display_name,
                    u.email
                FROM users u
                LEFT JOIN reports r 
                    ON u.id = r.user_id 
                    AND DATE(r.date) = :date
                WHERE r.id IS NULL 
                  AND u.role = 1
            ");
            $stmt->execute([':date' => $date]);
    
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            if (!$trainees) {
                return [
                    'success' => true,
                    'message' => 'No trainees missing reports today.'
                ];
            }
    
            $title   = "Daily Report Reminder";
            $message = "You have not yet submitted your OJT report for {$date}. Please submit it today.";
    
            foreach ($trainees as $row) {
                $userId = $row['id'];
                $this->notification->sendNotificationByUserId($userId, $title, $message);
            }
    
            return [
                'success'  => true,
                'date'     => $date,
                'trainees' => $trainees,
                'message'  => 'Notifications sent successfully.'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }
    
    public function runWeeklyReportReminder(){
        try {
            $dayOfWeek = date('N'); // 1 (Mon) - 7 (Sun)
            $hour      = date('H'); // 00-23
    
            // Only run on Friday after 8PM
            if ($dayOfWeek != 5 || $hour < 20) {
                return [
                    'success' => true,
                    'message' => 'Weekly reminder runs only on Friday after 8 PM.'
                ];
            }
    
            // Get Monday–Friday range for this week
            $monday = date('Y-m-d', strtotime('monday this week'));
            $friday = date('Y-m-d', strtotime('friday this week'));
    
            // Query all active trainees
            $stmt = $this->conn->prepare("
                SELECT 
                    u.id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS display_name,
                    u.email
                FROM users u
                WHERE u.role = 1
            ");
            $stmt->execute();
            $trainees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            if (!$trainees) {
                return [
                    'success' => true,
                    'message' => 'No trainees found.'
                ];
            }
    
            $title   = "Weekly Report Reminder";
    
            $missingReports = [];
            foreach ($trainees as $trainee) {
                $userId = $trainee['id'];
    
                // Count reports for this trainee between Monday and Friday
                $stmt = $this->conn->prepare("
                    SELECT DATE(r.date) AS report_date
                    FROM reports r
                    WHERE r.user_id = :user_id
                      AND DATE(r.date) BETWEEN :monday AND :friday
                ");
                $stmt->execute([
                    ':user_id' => $userId,
                    ':monday'  => $monday,
                    ':friday'  => $friday
                ]);
    
                $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
                $reportDates = array_map('strval', $rows);
    
                // Build full weekday list (Mon–Fri)
                $weekdays = [];
                for ($i = 0; $i < 5; $i++) {
                    $weekdays[] = date('Y-m-d', strtotime($monday . " +$i days"));
                }
    
                // Find missing days
                $missingDays = array_diff($weekdays, $reportDates);
    
                if (count($reportDates) === 0) {
                    // No report submitted for entire week
                    $message = "You have not submitted any OJT reports this week ({$monday} to {$friday}). Please catch up.";
                    $this->notification->sendNotificationByUserId($userId, $title, $message);
                    $missingReports[] = [
                        'user' => $trainee,
                        'status' => 'No reports submitted'
                    ];
                } elseif (!empty($missingDays)) {
                    // Some days missing
                    $daysList = implode(", ", $missingDays);
                    $message = "You are missing reports for the following dates this week: {$daysList}. Please complete them.";
                    $this->notification->sendNotificationByUserId($userId, $title, $message);
                    $missingReports[] = [
                        'user' => $trainee,
                        'status' => 'Missing some reports',
                        'missing_days' => $missingDays
                    ];
                }
            }
    
            return [
                'success' => true,
                'monday'  => $monday,
                'friday'  => $friday,
                'reminded_users' => $missingReports,
                'message' => 'Weekly reminders sent successfully.'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }
    

   public function runWeeklyReportsAndHours(){
        $results = [];

        try {
            // --- Schedule Control ---
            $dayOfWeek = date('N'); // 1 (Mon) - 7 (Sun)
            $hour      = date('H'); // 00-23
            $minute    = date('i'); // 00-59

            // Only run between 11:30 PM and 11:50 PM on Friday
            if ($dayOfWeek != 5 || $hour != 23 || $minute < 30 || $minute > 50) {
                return [
                    'success' => false,
                    'message' => 'Weekly reports run only between 11:30 PM and 11:50 PM on Friday.'
                ];
            }

            $startTime = microtime(true);
            logs("=== Weekly Report Cron Started at " . date('Y-m-d H:i:s') . " ===", "cron_debug.log");

            // --- Fetch eligible users ---
            $stmt = $this->conn->prepare("
                SELECT 
                    u.id,
                    COALESCE(NULLIF(u.complete_name, ''), u.username) AS display_name,
                    u.email,
                    u.email_flg
                FROM users u
                WHERE u.role = 1
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($users)) {
                logs("No users found for weekly report generation.", "cron_debug.log");
                return [
                    'success' => false,
                    'message' => 'No users found for weekly report generation.'
                ];
            }

            foreach ($users as $user) {
                $logPrefix = "[User ID: {$user['id']}] ";
                $this->conn->getConnection();

                logs($logPrefix . "Starting report generation...", "cron_debug.log");

                $result = $this->generate->generateWeeklyReportsAndHours($user['id'], true);
                $this->conn->getConnection();
                
                if (!$result || !is_array($result)) {
                    $results[] = [
                        'user_id'   => $user['id'],
                        'user_name' => $user['username'],
                        'status'    => 'No report generated',
                        'email'     => null
                    ];
                    logs($logPrefix . "No report generated.", "cron_debug.log");
                    continue;
                }

                if (!empty($result['success']) && $result['success'] === true) {
                    $emailStatus = "No email sent";

                    // Send email only if allowed and email exists
                    if (!empty($user['email']) && (int)$user['email_flg'] === 1) {
                        $mailSent = MailerController::sendEmail([
                            'to'        => $user['email'],
                            'subject'   => "Your Weekly Accomplishment Report",
                            'body'      => "<p>Hi {$user['display_name']},<br/>Please find attached your weekly accomplishment report.</p>",
                            'files'     => $result['filePath'] ?? null,
                            'fileNames' => $result['fileName'] ?? null
                        ]);

                        if (!empty($mailSent['success'])) {
                            $this->notification->sendNotificationByUserId(
                                $user['id'],
                                "Weekly Report Generated",
                                "Your weekly accomplishment report has been generated and sent to your email. Please check your inbox (or spam folder)."
                            );

                            $this->notification->saveNotificationToDB(
                                $user['id'],
                                'Weekly Report Generated',
                                "Your weekly accomplishment report has been generated and sent to your email. Please check your inbox (or spam folder)."
                            );
                            $emailStatus = "Email sent successfully to {$user['email']}";
                        } else {
                            $emailStatus = "Failed to send email to {$user['email']}";
                        }
                    }

                    $results[] = [
                        'user_id'   => $user['id'],
                        'user_name' => $user['display_name'],
                        'status'    => 'Report generated successfully',
                        'email'     => $emailStatus
                    ];

                    logs($logPrefix . "Report generated successfully. $emailStatus", "cron_debug.log");
                } else {
                    $results[] = [
                        'user_id'   => $user['id'],
                        'user_name' => $user['display_name'],
                        'status'    => 'Error: ' . ($result['message'] ?? 'Unknown error')
                    ];
                    logs($logPrefix . "Error: " . ($result['message'] ?? 'Unknown error'), "cron_debug.log");
                }

                // Small delay to avoid server overload
                usleep(500000); // 0.5 second instead of 2 seconds
            }

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);
            logs("=== Weekly reports completed in {$duration} seconds at " . date('Y-m-d H:i:s') . " ===", "cron_debug.log");

            return [
                'success' => true,
                'message' => 'Weekly reports completed successfully',
                'duration_seconds' => $duration,
                'results' => $results
            ];
        } catch (Exception $e) {
            $errorMsg = safeError($e);
            logs($errorMsg, "cron_debug.log");
            $results[] = [
                'user_id' => null,
                'user_name' => null,
                'status' => $errorMsg
            ];
        }

        logs($results, "cron_debug.log");
        return [
            'success' => false,
            'message' => 'An exception occurred during the report generation.',
            'results' => $results
        ];
    }
}
