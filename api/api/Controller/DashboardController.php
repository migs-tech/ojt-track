<?php

class DashboardController
{
    private $conn;

    public function __construct()
    {
        $this->conn = new Database(); // your DB connection
    }

    // -------------------------------
    // SUMMARY FUNCTIONS
    // -------------------------------

    public function getTotalTrainees()
    {
        $sql = "SELECT COUNT(*) AS total FROM users WHERE role = 1";
        $stmt = $this->conn->query($sql);
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }

    public function getTotalSupervisors()
    {
        $sql = "SELECT COUNT(*) AS total FROM users WHERE role = 2";
        $stmt = $this->conn->query($sql);
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }

    public function getTotalUsers()
    {
        $sql = "SELECT COUNT(*) AS total FROM users";
        $stmt = $this->conn->query($sql);
        $result = $stmt->fetch();
        return $result['total'] ?? 0;
    }

    // -------------------------------
    // CHART FUNCTIONS
    // -------------------------------

    // Example: Trainees grouped by department
    public function getTraineeByDepartment()
    {
        $sql = "SELECT department, COUNT(*) AS total 
                FROM users 
                WHERE role = 1 
                GROUP BY department";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    // Example: Trainees added per month
    public function getTraineeByMonth()
    {
        $sql = "SELECT MONTH(created) AS month, COUNT(*) AS total 
                FROM users 
                WHERE role = 1 
                GROUP BY MONTH(created)";
        $stmt = $this->conn->query($sql);
        return $stmt->fetchAll();
    }

    // -------------------------------
    // DASHBOARD DATA
    // -------------------------------

    public function getDashboardData()
    {
        return [
            // summaries
            'total_trainees' => $this->getTotalTrainees(),
            'total_supervisors' => $this->getTotalSupervisors(),
            'total_users' => $this->getTotalUsers(),

            // charts
            // 'trainee_by_month' => $this->getTraineeByMonth(),
        ];
    }
    
    public function getAttendanceByMonth($params){
        $year = $params['data']['year'] ?: date("Y");
        
        $months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        $presentData = array_fill(0, 12, 0);
        $absentData  = array_fill(0, 12, 0);
    
        $sql = "SELECT MONTH(date) AS month, status, COUNT(*) AS total
                FROM trainee_attendance
                WHERE YEAR(date) = :year
                GROUP BY MONTH(date), status";
    
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(['year' => $year]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as $row) {
            $monthIndex = ((int)$row['month']) - 1; // 0-based index
            $status = (int)$row['status']; // force integer
    
            if ($status === 1) { // Present
                $presentData[$monthIndex] = (int)$row['total'];
            } elseif ($status === 2) { // Absent
                $absentData[$monthIndex] = (int)$row['total'];
            }
        }
    
        $data = [
            "labels" => $months,
            "present" => $presentData,
            "absent" => $absentData
        ];    
        return $data;
    }


}
