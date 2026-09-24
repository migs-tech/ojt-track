<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailerController {

    /**
     * Configure mailer settings
     */
    private static function configureMailer(PHPMailer $mail) {
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;

        $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
        $mail->addReplyTo(MAIL_REPLYTO_EMAIL, MAIL_REPLYTO_NAME);
        $mail->isHTML(true);
    }

    /**
     * Send an email
     *
     * @param array $params {
     *   @type string|array $to        Recipient(s)
     *   @type string       $subject   Email subject
     *   @type string       $body      HTML body
     *   @type string|array $cc        CC recipient(s)
     *   @type string|array $bcc       BCC recipient(s)
     *   @type string|array $files     Path(s) to attachments
     *   @type string|array $fileNames Custom attachment name(s)
     * }
     *
     * @return array
     */
    public static function sendEmail(array $params) {
        $mail = new PHPMailer(true);

        try {
            self::configureMailer($mail);

            if (!empty($params['to'])) {
                $recipients = is_array($params['to']) ? $params['to'] : [$params['to']];
                foreach ($recipients as $recipient) {
                    $mail->addAddress($recipient);
                }
            }

            if (!empty($params['cc'])) {
                $ccList = is_array($params['cc']) ? $params['cc'] : [$params['cc']];
                foreach ($ccList as $cc) {
                    $mail->addCC($cc);
                }
            }

            if (!empty($params['bcc'])) {
                $bccList = is_array($params['bcc']) ? $params['bcc'] : [$params['bcc']];
                foreach ($bccList as $bcc) {
                    $mail->addBCC($bcc);
                }
            }

            $mail->Subject = $params['subject'] ?? '';
            $mail->Body    = $params['body'] ?? '';
            $mail->AltBody = strip_tags($params['body'] ?? '');

            if (!empty($params['files'])) {
                $files     = is_array($params['files']) ? $params['files'] : [$params['files']];
                $fileNames = $params['fileNames'] ?? [];

                foreach ($files as $index => $file) {
                    if (file_exists($file)) {
                        $customName = is_array($fileNames) && isset($fileNames[$index]) 
                                      ? $fileNames[$index] 
                                      : basename($file);
                        $mail->addAttachment($file, $customName);
                    }
                }
            }

            $mail->send();

            return [
                'success' => true,
                'message' => 'Email sent successfully.'
            ];

        } catch (Exception $e) {
            error_log("Mailer Exception: " . $e->getMessage());

            return [
                'success' => false,
                'message' => safeError($e)
            ];
        }
    }
}