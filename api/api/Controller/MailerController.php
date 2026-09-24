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
        // Hosts like Render's free plan block SMTP, so an HTTP email API is used when configured.
        if (defined('BREVO_API_KEY') && BREVO_API_KEY !== '') {
            return self::sendWithBrevo($params);
        }

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

    /** Sends through Brevo's HTTP API (https://developers.brevo.com/reference/sendtransacemail). */
    private static function sendWithBrevo(array $params): array {
        $list = function ($value) {
            $items = is_array($value) ? $value : (empty($value) ? [] : [$value]);
            return array_map(fn ($email) => ['email' => $email], array_values($items));
        };

        $payload = [
            'sender'      => ['email' => MAIL_FROM_EMAIL, 'name' => MAIL_FROM_NAME],
            'replyTo'     => ['email' => MAIL_REPLYTO_EMAIL ?: MAIL_FROM_EMAIL, 'name' => MAIL_REPLYTO_NAME],
            'to'          => $list($params['to'] ?? []),
            'subject'     => $params['subject'] ?? '',
            'htmlContent' => $params['body'] ?? '',
        ];
        if (!empty($params['cc']))  $payload['cc']  = $list($params['cc']);
        if (!empty($params['bcc'])) $payload['bcc'] = $list($params['bcc']);

        if (!empty($params['files'])) {
            $files = is_array($params['files']) ? $params['files'] : [$params['files']];
            $names = $params['fileNames'] ?? [];
            $names = is_array($names) ? $names : [$names];
            foreach ($files as $i => $file) {
                if (is_file($file)) {
                    $payload['attachment'][] = [
                        'name'    => $names[$i] ?? basename($file),
                        'content' => base64_encode(file_get_contents($file)),
                    ];
                }
            }
        }

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['api-key: ' . BREVO_API_KEY, 'Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 20,
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($status >= 200 && $status < 300) {
            return ['success' => true, 'message' => 'Email sent successfully.'];
        }
        error_log('[mail] Brevo send failed (' . $status . '): ' . ($error ?: substr((string) $body, 0, 300)));
        return ['success' => false, 'message' => 'Failed to send email.'];
    }
}