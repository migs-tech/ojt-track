<?php

class MYPDF extends TCPDF {
    public function Header() {}
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'C');
    }
}

class GenerateReportController{
    private $conn;

    public function __construct(){
        $this->conn = new Database(); 
    }
    
    public function generateWeeklyReports($userId, $force = false, $startDate = null, $endDate = null){
        if (!$userId) {
            return ['success' => false, 'message' => 'User ID is required.'];
        }

        if (!$startDate || !$endDate) {
            $startDate = new DateTime('monday this week');
            $friday    = new DateTime('friday this week');
            $today     = new DateTime('today');
            $endDate   = ($today < $friday) ? $today : $friday;
        } else {
            $startDate = new DateTime($startDate);
            $endDate   = new DateTime($endDate);
        }

        $stmt = $this->conn->prepare("
            SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS fullname
            FROM users 
            WHERE role = 1 AND id = :uid
        ");
        $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'User not found or not a trainee.'];
        }

        $uname = !empty($user['fullname']) ? htmlspecialchars(trim($user['fullname'])) : 'Unknown';

        $stmt = $this->conn->prepare("
            SELECT r.id AS report_id, r.title, r.date, r.description, f.file_url
            FROM reports r
            LEFT JOIN report_files f ON r.id = f.report_id
            WHERE r.user_id = :uid
            AND DATE(r.date) BETWEEN :start AND :end
            ORDER BY r.id DESC, f.id ASC
        ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':start', $startDate->format('Y-m-d'));
        $stmt->bindValue(':end', $endDate->format('Y-m-d'));
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$rows) {
            return [
                'success' => false,
                'message' => "No reports found for $uname between " .
                            $startDate->format('F j, Y') . " and " .
                            $endDate->format('F j, Y') . "."
            ];
        }

        $reports = [];
        foreach ($rows as $row) {
            $rid = $row['report_id'];
            if (!isset($reports[$rid])) {
                $reports[$rid] = [
                    'date' => $row['date'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'files' => []
                ];
            }
            if (!empty($row['file_url'])) {
                $reports[$rid]['files'][] = $row['file_url'];
            }
        }

        $pdf = new MYPDF();
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('System');
        $pdf->SetTitle('Weekly Accomplishment Report');
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetAutoPageBreak(true, 20);
        $pdf->SetFont('times', '', 12);

        $pdf->AddPage();
        $pdf->SetFont('times', 'B', 20);
        $pdf->Ln(70);
        $pdf->Cell(0, 10, 'Weekly Accomplishment Report', 0, 1, 'C');
        $pdf->Ln(15);
        $pdf->SetFont('times', '', 14);
        $pdf->Cell(0, 10, "Prepared by: {$uname}", 0, 1, 'C');
        $pdf->Cell(0, 10, "Period Covered: " .
            $startDate->format("F j, Y") . " to " . $endDate->format("F j, Y"),
            0, 1, 'C');
        $pdf->Ln(20);
        $pdf->SetFont('times', 'I', 12);
        $pdf->Cell(0, 10, 'Training Department', 0, 1, 'C');

        $counter = 1;
        foreach ($reports as $report) {
            $pdf->AddPage();

            $formattedDate = date("F j, Y", strtotime($report['date']));
            $title = htmlspecialchars($report['title']);
            $desc  = nl2br(htmlspecialchars($report['description']));

            $html = "
                <div style='font-size:12pt; margin-bottom:8px;'>
                    <strong>{$counter}. {$formattedDate}</strong>
                </div>
                <h3 style='font-size:14pt; margin-bottom:6px;'>{$title}</h3>
                <p style='font-size:11pt; line-height:1.6; text-align:justify;'>{$desc}</p>
            ";
            $pdf->writeHTML($html, true, false, true, false, '');

            if (!empty($report['files'])) {
                $images = array_slice($report['files'], 0, 4);
                $xStart = 40;
                $yStart = $pdf->GetY() + 5;
                $imgW = 50;
                $imgH = 50;
                $gapX = 20;
                $gapY = 15;

                foreach ($images as $index => $url) {
                    $col = $index % 2;
                    $row = floor($index / 2);
                    $x = $xStart + ($col * ($imgW + $gapX));
                    $y = $yStart + ($row * ($imgH + $gapY));

                    if (@getimagesize($url)) {
                        $pdf->Image($url, $x, $y, $imgW, $imgH, '', '', '', false, 300, '', false, false, 0, true);
                    }
                }
            }

            $counter++;
        }

        $fileName = "Weekly_Report_User{$userId}_{$startDate->format('Ymd')}_to_{$endDate->format('Ymd')}.pdf";
        $filePath = __DIR__ . '/../uploads/' . $fileName;
        $pdf->Output($filePath, 'F');

        if (!$force && $filePath) {
            $stmt = $this->conn->prepare("
                INSERT INTO weekly_reports_generated (user_id, start_date, end_date, file_name, file_path)
                VALUES (:uid, :start, :end, :filename, :filepath)
            ");
            $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':start', $startDate->format('Y-m-d'));
            $stmt->bindValue(':end', $endDate->format('Y-m-d'));
            $stmt->bindValue(':filename', $fileName);
            $stmt->bindValue(':filepath', $filePath);
            $stmt->execute();
        }

        return [
            'success'  => true,
            'user_id'  => $userId,
            'user_name'=> $uname,
            'fileName' => $fileName,
            'filePath' => $filePath,
            'url'      => BASE_URL . '/api/uploads/' . $fileName,
            'message'  => "Generated weekly report for {$uname} ({$userId})."
        ];
    }


    public function generateWeeklyReportsAndHours($userId, $force = false, $startDate = null, $endDate = null){
        if (!$userId) {
            return ['success' => false, 'message' => 'User ID is required.'];
        }

        if (!$startDate || !$endDate) {
            $startDate = new DateTime('monday this week');
            $friday    = new DateTime('friday this week');
            $today     = new DateTime('today');
            $endDate   = ($today < $friday) ? $today : $friday;
        } else {
            $startDate = new DateTime($startDate);
            $endDate   = new DateTime($endDate);
        }

        $stmt = $this->conn->prepare("
            SELECT id, COALESCE(NULLIF(complete_name, ''), username) AS fullname, ojt_required_hours
            FROM users 
            WHERE role = 1 AND id = :uid
        ");
        $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'message' => 'User not found or not a trainee.'];
        }

        $uname = !empty($user['fullname']) ? htmlspecialchars(trim($user['fullname'])) : 'Unknown';

        $stmt = $this->conn->prepare("
            SELECT r.id AS report_id, r.title, r.date, r.description, f.file_url
            FROM reports r
            LEFT JOIN report_files f ON r.id = f.report_id
            WHERE r.user_id = :uid
            AND DATE(r.date) BETWEEN :start AND :end
            ORDER BY r.id DESC, f.id ASC
        ");
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':start', $startDate->format('Y-m-d'));
        $stmt->bindValue(':end', $endDate->format('Y-m-d'));
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$rows) {
            return [
                'success' => false,
                'message' => "No reports found for $uname between " .
                            $startDate->format('F j, Y') . " and " .
                            $endDate->format('F j, Y') . "."
            ];
        }

        $reports = [];
        foreach ($rows as $row) {
            $rid = $row['report_id'];
            if (!isset($reports[$rid])) {
                $reports[$rid] = [
                    'date' => $row['date'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'files' => []
                ];
            }
            if (!empty($row['file_url'])) {
                $reports[$rid]['files'][] = $row['file_url'];
            }
        }

        $pdf = new MYPDF();
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('System');
        $pdf->SetTitle('Weekly Accomplishment Report');
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetAutoPageBreak(true, 20);
        $pdf->SetFont('times', '', 12);

        $pdf->AddPage();
        $pdf->SetFont('times', 'B', 20);
        $pdf->Ln(70);
        $pdf->Cell(0, 10, 'Weekly Accomplishment Report', 0, 1, 'C');
        $pdf->Ln(15);
        $pdf->SetFont('times', '', 14);
        $pdf->Cell(0, 10, "Prepared by: {$uname}", 0, 1, 'C');
        $pdf->Cell(0, 10, "Period Covered: " .
            $startDate->format("F j, Y") . " to " . $endDate->format("F j, Y"),
            0, 1, 'C');
        $pdf->Ln(20);
        $pdf->SetFont('times', 'I', 12);
        $pdf->Cell(0, 10, 'Training Department', 0, 1, 'C');

        $counter = 1;
        foreach ($reports as $report) {
            $pdf->AddPage();

            $formattedDate = date("F j, Y", strtotime($report['date']));
            $title = htmlspecialchars($report['title']);
            $desc  = nl2br(htmlspecialchars($report['description']));

            $html = "
                <div style='font-size:12pt; margin-bottom:8px;'>
                    <strong>{$counter}. {$formattedDate}</strong>
                </div>
                <h3 style='font-size:14pt; margin-bottom:6px;'>{$title}</h3>
                <p style='font-size:11pt; line-height:1.6; text-align:justify;'>{$desc}</p>
            ";
            $pdf->writeHTML($html, true, false, true, false, '');

            if (!empty($report['files'])) {
                $images = array_slice($report['files'], 0, 4);
                $xStart = 40;
                $yStart = $pdf->GetY() + 5;
                $imgW = 50;
                $imgH = 50;
                $gapX = 20;
                $gapY = 15;

                foreach ($images as $index => $url) {
                    $col = $index % 2;
                    $row = floor($index / 2);
                    $x = $xStart + ($col * ($imgW + $gapX));
                    $y = $yStart + ($row * ($imgH + $gapY));

                    if (@getimagesize($url)) {
                        $pdf->Image($url, $x, $y, $imgW, $imgH, '', '', '', false, 300, '', false, false, 0, true);
                    }
                }
            }

            $counter++;
        }

        //hours report
        $stmt = $this->conn->prepare("
            SELECT 
            ta.date, 
            ta.time_in, 
            ta.time_out,
            COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name
            FROM trainee_attendance ta
            JOIN users u 
            ON ta.trainee_id = u.id
            WHERE ta.trainee_id = :trainee_id 
            AND ta.date BETWEEN :start_date AND :end_date
            ORDER BY ta.date ASC
        ");
        $stmt->execute([
            'trainee_id' => $userId,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date'   => $endDate->format('Y-m-d')
        ]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $attendance = [];
        foreach ($rows as $r) {
            $attendance[$r['date']] = $r;
        }

        $pdf->AddPage();
        $pdf->SetFont('times', 'B', 16);
        $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
        $pdf->Ln(10);
        $pdf->SetFont('times', '', 12);
        $pdf->Cell(0, 10, "Period Covered: " .
            $startDate->format("F j, Y") . " to " . $endDate->format("F j, Y"),
            0, 1, 'C');
        $pdf->Ln(20);
        $pdf->SetFont('times', 'I', 12);
        $pdf->Cell(0, 10, 'Training Department', 0, 1, 'C');
        $pdf->Ln(10);
        $pdf->SetFont('times', '', 11);

        // MAIN RECORD TABLE HEADER (reduced font + padding)
        $html = <<<HTML
    <table border="1" cellpadding="2" cellspacing="0" style="width:100%; font-size:10px; text-align:center;">
      <tr style="background-color:#333; color:#fff;">
        <th rowspan="2">DATE</th>
        <th>AM</th>
        <th>PM</th>
        <th colspan="2">TOTAL DUTY HOURS</th>
        <th rowspan="2">REMARKS</th>
      </tr>
      <tr style="background-color:#333; color:#fff;">
        <th>IN</th>
        <th>OUT</th>
        <th style="background-color:#bb88db; color:#000;">ACTUAL<br>HRS:MIN</th>
        <th style="background-color:#bb88db; color:#000;">COUNTED<br>HRS:MIN</th>
      </tr>
    HTML;

        // Fill rows from attendance
        $totalMinutes = 0;

        // Only Monday to Friday
        $daysInterval = $startDate->diff($endDate)->days;
        $weekdays = [];
        for ($i = 0; $i <= $daysInterval; $i++) {
            $currentDate = clone $startDate;
            $currentDate->modify("+$i days");
            if ($currentDate->format('N') < 6) { // 1 (Monday) to 5 (Friday)
            $weekdays[] = $currentDate->format('Y-m-d');
            }
        }

        foreach ($weekdays as $dateStr) {
            $in         = $out = "";
            $actHours   = $countHours = "00:00";

            if (isset($attendance[$dateStr])) {
            $in  = $attendance[$dateStr]['time_in'];
            $out = $attendance[$dateStr]['time_out'];

            $in  = !empty($in)  ? date("H:i", strtotime($in)) : "";
            $out = !empty($out) ? date("H:i", strtotime($out)) : "";
            
            if (!empty($in) && !empty($out)) {
                $minutes = round((strtotime($attendance[$dateStr]['time_out']) - strtotime($attendance[$dateStr]['time_in'])) / 60);
                $hours = (int) floor($minutes / 60);
                $mins  = (int) round($minutes % 60);

                $actHours   = sprintf("%02d:%02d", $hours, $mins);
                $countHours = $actHours;

                $totalMinutes += $minutes;
            }
            }

            // highlight weekends (should not happen, but for completeness)
            $dayOfWeek = date("N", strtotime($dateStr));
            $rowStyle = ($dayOfWeek == 6 || $dayOfWeek == 7) ? 'background-color:#f0f0f0;' : '';

            $html .= "
            <tr style='{$rowStyle}'>
            <td>" . date("F j, Y", strtotime($dateStr)) . "</td>
            <td>" . (!empty($in) ? date("g:i A", strtotime($in)) : "") . "</td>
            <td>" . (!empty($out) ? date("g:i A", strtotime($out)) : "") . "</td>
            <td>{$actHours}</td>
            <td>{$countHours}</td>
            <td></td>
            </tr>
            ";
        }

        // Total hours
        $totalHours = (int) floor($totalMinutes / 60);
        $totalMins  = (int) round($totalMinutes % 60);
        $totalStr   = sprintf("%02d:%02d", $totalHours, $totalMins);

        //compute overall total hours and minutes and display the remaining hours to complete the required OJT hours
        $stmt = $this->conn->prepare("
            SELECT 
            SUM(TIMESTAMPDIFF(MINUTE, time_in, time_out)) AS total_minutes
            FROM trainee_attendance
            WHERE trainee_id = :trainee_id
        ");
        $stmt->execute(['trainee_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $overallTotalMinutes = $result['total_minutes'] ?? 0;
        $overallHours = (int) floor($overallTotalMinutes / 60);
        $overallMins  = (int) round($overallTotalMinutes % 60);
        $overallStr   = sprintf("%02d:%02d", $overallHours, $overallMins);
        
        //value 600 hours as default if ojt_required_hours is not set
        $requiredHours = $user['ojt_required_hours'] ?? 600;
        $requiredMinutes = $requiredHours * 60;
        $remainingMinutes = max(0, $requiredMinutes - $overallTotalMinutes);
        $remainingHours = (int) floor($remainingMinutes / 60);
        $remainingMins  = (int) round($remainingMinutes % 60);
        $remainingStr   = sprintf("%02d:%02d", $remainingHours, $remainingMins);

        logs([
            'user_id' => $userId,
            'overall_total_hours' => $overallStr,
            'required_hours' => $requiredHours,
            'remaining_hours' => $remainingHours,
            'overall_total_minutes' => $overallTotalMinutes
        ]);

        $html .= <<<HTML
      <tr style="background-color:#000; color:#fff;">
        <td colspan="3" style="text-align:right;"><b>TOTAL</b></td>
        <td colspan="1">$totalStr</td>
        <td colspan="1">$totalStr</td>
        <td></td>
      </tr>
    HTML;

        $html .= <<<HTML
        <tr>
            <td colspan="6" style="padding-top:10px; font-size:10px;">
                <em>
                Overall Total Hours (All Time): <strong>$overallStr</strong> / 
                Required OJT Hours: <strong>$requiredHours:00</strong> / 
                Remaining Hours to Complete: <strong>$remainingHours:00</strong>
                </em>
            </td>
        </tr>
        </table>
    HTML;


        $pdf->writeHTML($html, true, false, true, false, '');

        // FOOTER SIGNATURE
        $footer = <<<HTML
    <br>
    <table border="0" cellpadding="8" cellspacing="0" style="width:100%; font-size:12px;">
    <tr>
        <td style="width:50%; text-align:center;">
        Prepared by:<br><br>
        _______________________________<br>
        <span style="font-size:9px; font-style:italic;">
        SIGNATURE OVER PRINTED NAME OF THE TRAINEE/DATE
        </span>
        </td>
        <td style="width:50%; text-align:center;">
        Reviewed by:<br><br>
        _______________________________<br>
        <span style="font-size:9px; font-style:italic;">
        SIGNATURE OVER PRINTED NAME OF THE SUPERVISOR/DATE
        </span>
        </td>
    </tr>
    </table>
    HTML;

        $pdf->writeHTML($footer, true, false, true, false, '');

        // Output PDF
        $fileName = 'weekly_hours_report_' . $userId . '_' . $startDate->format('Ymd') . '_to_' . $endDate->format('Ymd') . '.pdf';

        //make sure the directory exists
        if (!is_dir(__DIR__ . '/../uploads/weekly_reports')) {
            mkdir(__DIR__ . '/../uploads/weekly_reports', 0755, true);
            
        }
        $filePath = __DIR__ . '/../uploads/weekly_reports/' . $fileName;
        $pdf->Output($filePath, 'F');

        return [
            'filePath' => $filePath,
            'fileName' => $fileName,
            'success' => true,
            'message' => "Weekly hours report generated successfully for {$uname}",
            'url'     => BASE_URL . '/api/uploads/weekly_reports/' . $fileName
        ];

    }
    public function generateTraineeMonthlyHoursReport($userId = null, $year = null, $month = null) {
    
    $year        = $year ?: date('Y');
    $month       = $month ?: date('m');
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

    // Attendance query
    $startDate = "$year-$month-01";
    $endDate   = "$year-$month-$daysInMonth";

    $stmt = $this->conn->prepare("
        SELECT 
            ta.date, 
            ta.time_in, 
            ta.time_out,
            COALESCE(NULLIF(u.complete_name, ''), u.username) AS trainee_name
        FROM trainee_attendance ta
        JOIN users u 
            ON ta.trainee_id = u.id
        WHERE ta.trainee_id = :trainee_id 
        AND ta.date BETWEEN :start_date AND :end_date
        ORDER BY ta.date ASC
    ");
    $stmt->execute([
        'trainee_id' => $userId,
        'start_date' => $startDate,
        'end_date'   => $endDate
    ]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($rows)) {
        $traineeName = ucwords(strtolower($rows[0]['trainee_name']));
    } else {
        $traineeName = 'Unknown';
    }

    $attendance = [];
    foreach ($rows as $r) {
        $attendance[$r['date']] = $r;
    }

    // TCPDF Setup
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(20, 10, 20);
    $pdf->SetFont('helvetica', '', 11);
    $pdf->AddPage();
    $pdf->SetAutoPageBreak(TRUE, 5);

    // Month name
    $monthName = date("F", mktime(0, 0, 0, $month, 1));

    // HEADER INFO
    $infoTable = <<<HTML
<h2 style="text-align:center;">DAILY TIME RECORD</h2>
<table border="1" cellpadding="5" cellspacing="0" style="width:100%; font-size:12px;">
  <tr>
    <td style="width:30%; background-color:#333; color:#fff; text-align:right;">Complete Name:</td>
    <td style="width:70%; text-align:left;">$traineeName</td>
  </tr>
  <tr>
    <td style="width:30%; background-color:#333; color:#fff; text-align:right;">For the Month of:</td>
    <td style="width:30%; text-align:left;">$monthName</td>
    <td style="width:20%; background-color:#333; color:#fff; text-align:right;">Year:</td>
    <td style="width:20%; text-align:left;">$year</td>
  </tr>
</table>
<br>
HTML;

    $pdf->writeHTML($infoTable, true, false, true, false, '');

    // MAIN RECORD TABLE HEADER (reduced font + padding)
    $html = <<<HTML
<table border="1" cellpadding="2" cellspacing="0" style="width:100%; font-size:10px; text-align:center;">
  <tr style="background-color:#333; color:#fff;">
    <th rowspan="2">DATE</th>
    <th>AM</th>
    <th>PM</th>
    <th colspan="2">TOTAL DUTY HOURS</th>
    <th rowspan="2">REMARKS</th>
  </tr>
  <tr style="background-color:#333; color:#fff;">
    <th>IN</th>
    <th>OUT</th>
    <th style="background-color:#bb88db; color:#000;">ACTUAL<br>HRS:MIN</th>
    <th style="background-color:#bb88db; color:#000;">COUNTED<br>HRS:MIN</th>
  </tr>
HTML;

    // Fill rows from attendance
    $totalMinutes = 0;

    for ($day = 1; $day <= $daysInMonth; $day++) {
        $dateStr    = "$year-$month-" . str_pad($day, 2, '0', STR_PAD_LEFT);
        $in         = $out = "";
        $actHours   = $countHours = "00:00";

        if (isset($attendance[$dateStr])) {
            $in  = $attendance[$dateStr]['time_in'];
            $out = $attendance[$dateStr]['time_out'];

            $in  = !empty($in)  ? date("H:i", strtotime($in)) : "";
            $out = !empty($out) ? date("H:i", strtotime($out)) : "";
        
            if (!empty($in) && !empty($out)) {
                $minutes = round((strtotime($attendance[$dateStr]['time_out']) - strtotime($attendance[$dateStr]['time_in'])) / 60);
                $hours = (int) floor($minutes / 60);
                $mins  = (int) round($minutes % 60);

        
                $actHours   = sprintf("%02d:%02d", $hours, $mins);
                $countHours = $actHours;
        
                $totalMinutes += $minutes;
            }
        }

        // highlight weekends
        $dayOfWeek = date("N", strtotime($dateStr));
        $rowStyle = ($dayOfWeek == 6 || $dayOfWeek == 7) 
    ? " bgcolor=\"#afd6db\" style=\"height:14px;\"" 
    : " style=\"height:14px;\"";

        $html .= "
    <tr{$rowStyle}>
      <td>$day</td>
      <td>$in</td>
      <td>$out</td>
       <td bgcolor=\"#bb88db\" color=\"#000\">$actHours</td>
      <td bgcolor=\"#bb88db\" color=\"#000\">$countHours</td>
      <td style='text-align:left;'></td>
    </tr>";
    }

    // Total hours
    $totalHours = (int) floor($totalMinutes / 60);
$totalMins  = (int) round($totalMinutes % 60);

    $totalStr   = sprintf("%02d:%02d", $totalHours, $totalMins);

    $html .= <<<HTML
  <tr style="background-color:#000; color:#fff;">
    <td colspan="3" style="text-align:right;"><b>TOTAL</b></td>
    <td colspan="1">$totalStr</td>
    <td colspan="1">$totalStr</td>
    <td></td>
  </tr>
</table>
HTML;

    $pdf->writeHTML($html, true, false, true, false, '');

    // FOOTER SIGNATURE
    $footer = <<<HTML
<br>
<table border="0" cellpadding="8" cellspacing="0" style="width:100%; font-size:12px;">
<tr>
    <td style="width:50%; text-align:center;">
    Prepared by:<br><br>
    _______________________________<br>
    <span style="font-size:9px; font-style:italic;">
    SIGNATURE OVER PRINTED NAME OF THE TRAINEE/DATE
    </span>
    </td>
    <td style="width:50%; text-align:center;">
    Reviewed by:<br><br>
    _______________________________<br>
    <span style="font-size:9px; font-style:italic;">
    SIGNATURE OVER PRINTED NAME OF THE SUPERVISOR/DATE
    </span>
    </td>
</tr>
</table>
HTML;

    $pdf->writeHTML($footer, true, false, true, false, '');

    // Output PDF
    $fileName = 'daily_time_record_' . $userId . '_' . $month . '_' . $year . '.pdf';
    $filePath = __DIR__ . '/../uploads/' . $fileName;
    $pdf->Output($filePath, 'F');

    return [
        'filePath' => $filePath,
        'fileName' => $fileName,
        'success' => true,
        'message' => "Monthly hours report generated successfully for $monthName, $year",
        'url'     => BASE_URL . '/api/uploads/' . $fileName
    ];
}

    public function idMaker(){
        $image_path = "1.jpeg";
        $output_pdf = 'id_layouts.pdf';
        
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('ID Layout Generator');
        $pdf->SetAuthor('System');
        $pdf->SetTitle('ID Layouts');
        $pdf->SetMargins(10, 10, 10);
        $pdf->SetAutoPageBreak(true, 10);
        $pdf->AddPage();

        $absPath =  __DIR__ . '/../uploads/' . $image_path;

        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, '1x1 Layout (6 per row × 2 rows = 12)', 0, 1, 'C');

        $startY = $pdf->GetY() + 5;
        $imgWidth = 30;
        $imgHeight = 30;
        $spacingX = 5;
        $spacingY = 10;
        $startX = 10;

        for ($row = 0; $row < 2; $row++) {
            for ($col = 0; $col < 5; $col++) {
                $x = $startX + $col * ($imgWidth + $spacingX);
                $y = $startY + $row * ($imgHeight + $spacingY);
                $pdf->Image($absPath, $x, $y, $imgWidth, $imgHeight, '', '', '', false, 300);
            }
        }

        $pdf->Ln(80);
        $pdf->Cell(0, 10, '2x2 Layout (3 per row × 2 rows = 6)', 0, 1, 'C');

        $startY = $pdf->GetY() + 5;
        $imgWidth = 50;
        $imgHeight = 50;
        $spacingX = 10;
        $spacingY = 10;
        $startX = 20;

        for ($row = 0; $row < 3; $row++) {
            for ($col = 0; $col < 3; $col++) {
                $x = $startX + $col * ($imgWidth + $spacingX);
                $y = $startY + $row * ($imgHeight + $spacingY);
                $pdf->Image($absPath, $x, $y, $imgWidth, $imgHeight, '', '', '', false, 300);
            }
        }

        $fileName = $output_pdf;
        $filePath = __DIR__ . '/../uploads/' . $fileName;
        $pdf->Output($filePath, 'F');

        return [
            'filePath' => $filePath,
            'fileName' => $fileName,
            'success' => true,
            'message' => "ID layouts generated successfully",
            'url'     => BASE_URL . '/api/uploads/' . $fileName
        ];
    }

}
