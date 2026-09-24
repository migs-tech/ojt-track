<?php

 class AutomateReportController
{
    private $conn;
    private $generate;

    public function __construct()
    {
        $this->conn = new Database(); 
        $this->generate = new GenerateReportController();
    }
    
    public function generatePdf(){
        
        $stmt = $this->conn->prepare("SELECT id, username FROM users WHERE role = 1");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
         $results = [];
        
        foreach ($users as $user) {
            
            $result = $this->generate->generatePDFReport($user['id'], false);
            
             if (!$result) {
                 
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'No new report generated'
                    ];
                 
                  continue;
             } elseif ($result['success']) {
                 
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'Report generated successfully'
                    ];
                 
             } else {
                 
                    $results[] = [
                        'user_id' => $user['id'],
                        'user_name' => $user['username'],
                        'status' => 'Error: ' . $result['message']
                    ];
             }
        }

        return $results;
    }
    
    public function runAutoGenerateMonthlyHoursReport() {
        $results = [];
        
        $stmt = $this->conn->prepare("SELECT id, username FROM users WHERE role = 1");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as $user) {
            $result = $this->generate->generateTraineeMonthlyHoursReport($user['id']);
            
            if ($result['success']) {
                $results[] = [
                    'user_id' => $user['id'] ?? "", 
                    'user_name' => $user['username'] ?? "",
                    'status' => 'Monthly hours report generated successfully',
                    'results' =>  $result
                ];
            } else {
                $results[] = [
                    'user_id' => $user['id'] ?? '',
                    'user_name' => $user['username'] ?? "",
                    'status' => 'Error: ' . $result['message'] ?? ""
                ];
            }
        }
        
        $response = [
            "results" => [
                "filePath" => "/home/u898315052/domains/ojt.kamsite.com/public_html/api/uploads/daily_time_record_35_09_2025.pdf",
                "fileName" => "daily_time_record_35_09_2025.pdf",
            ]
        ];
        
        MailerController::sendEmail(
            "fdc.kennethroy@gmail.com",
            "Your Monthly Hours Report",
            "<p>Hi, please find attached your monthly report.</p>",
            $response['results']['filePath'],   // absolute path
            $response['results']['fileName']    // attachment name
        );

        return $results;
    }
    
}