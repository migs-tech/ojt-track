<?php

class SendNotificationController {
    
    private $conn;

    public function __construct(){
        $this->conn = new Database();
    }
    
    public function sendNotificationByUserId($userId, $title, $body) {
        $this->conn->getConnection();
        try {
            $stmt = $this->conn->prepare("
                SELECT expo_push_token 
                FROM user_devices 
                WHERE user_id = ? AND is_active = 1
            ");
            $stmt->execute([$userId]);
            $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $result = [];
            foreach ($tokens as $token) {
                $res = $this->sendExpoNotification(
                    $token,
                    $title,
                    $body
                );
                $result[] = $res;
            }

            return ["success" => true, "result" => $result ];
        } catch (Exception $e) {
            return ["success" => false, "error" => safeError($e)];
        }
    }
    
    public function sendNotificationAllUsers($title, $body) {
        try {
            $stmt = $this->conn->query("
                SELECT expo_push_token 
                FROM user_devices 
                WHERE is_active = 1
            ");
            $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $result = [];
            foreach ($tokens as $token) {
                $res = $this->sendExpoNotification($token, $title, $body);
                $result[] = $res;
            }

            return ["success" => true, "result" => $result ];
        } catch (Exception $e) {
            return ["success" => false, "error" => safeError($e)];
        }
    }
    
    private function sendExpoNotification($token, $title, $body) {
        try {
            $postData = [
                "to"    => $token,
                // "sound" => "funny_notify",
                "title" => $title,
                "body"  => $body,
                // "channelId" => "funny-channel",
                "data" => [
                    'url' => 'https://ojt.kamsite.com'
                ]
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://exp.host/--/api/v2/push/send");
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: application/json',
                'Accept-Encoding: gzip, deflate',
                'Content-Type: application/json',
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            if ($response === false) {
                throw new Exception('Curl error: ' . curl_error($ch));
            }
            curl_close($ch);

            return $response;
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => safeError($e)
            ]);
        }
    }
    
    public function deleteNotification($params){
        $userId = AuthHelper::validateToken()['id']; 
        $notifId= $params['data']['id'];
       
       
       // Broadcast notifications (user_id IS NULL) are shared, so users can only delete their own.
       $stmt = $this->conn->prepare("
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        ");
       
       $success = $stmt->execute([$notifId, $userId]);
       
       return [
              "success" => $success,
              "message" => $success ? "Notification deleted" : "Failed to delete"
           ];
    }

    public function markNotificationRead($params){
       $userId = AuthHelper::validateToken()['id']; 
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

   public function getNotifications(){
        $userId = AuthHelper::validateToken()['id'];
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
                "message" => safeError($e)
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "message" => safeError($e)
            ];
        }
    }
    
    public function saveNotificationToDB($userId, $title, $message, $type = 'system', $expiresAt = null, $extraData = null) {
        $this->conn->getConnection();
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO notifications (user_id, title, message, type, created_at, expires_at, extra_data)
                VALUES (:user_id, :title, :message, :type, NOW(), :expires_at, :extra_data)
            ");
            $stmt->execute([
                ':user_id'   => $userId,
                ':title'     => $title,
                ':message'   => $message,
                ':type'      => $type,
                ':expires_at'=> $expiresAt,
                ':extra_data'=> $extraData ? json_encode($extraData) : null
            ]);
            return $this->conn->lastInsertId();
        } catch (Exception $e) {
            error_log("Failed to save notification: " . $e->getMessage());
            return false;
        }
    }
}
