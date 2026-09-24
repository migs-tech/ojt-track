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
        
        return $results;
    }
    
}