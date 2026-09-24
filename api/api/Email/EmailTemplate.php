<?php

class EmailTemplate {
    private static $subject;
    private static $body;

    public static function passwordReset($username, $resetLink) {
        self::$subject = "Password Reset Request";
        self::$body = "
            <html>
            <head>
                <title>Password Reset</title>
            </head>
            <body>
                <h2>Hello " . htmlspecialchars($username, ENT_QUOTES, 'UTF-8') . ",</h2>
                <p>We received a request to reset your password. Click the link below to reset it:</p>
                <p><a href=\"" . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . "\">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>
        ";
        return ['subject' => self::$subject, 'body' => self::$body];
    }

    public static function accountActivation($userName, $url) {
        self::$subject = "Account Activation";
        self::$body = "
            <!DOCTYPE html>
            <html xmlns=\"http://www.w3.org/1999/xhtml\">
            <head>
                <title>Account Activation</title>
                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
                <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
                <style type=\"text/css\">
                    #outlook a { padding: 0; }
                    .ReadMsgBody { width: 100%; }
                    .ExternalClass { width: 100%; }
                    .ExternalClass * { line-height: 100%; }
                    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                </style>
                <style type=\"text/css\">
                    @media only screen and (max-width:480px) {
                        @-ms-viewport { width: 320px; }
                        @viewport { width: 320px; }
                    }
                </style>
            </head>
            <body style=\"font-family: 'Inter', sans-serif; background: #E5E5E5;\">
                <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" bgcolor=\"#F6FAFB\">
                    <tbody>
                        <tr>
                            <td valign=\"top\" align=\"center\">
                                <table class=\"container\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">
                                    <tbody>
                                        <tr>
                                            <td style=\"padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;\">
                                                Company Name
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class=\"main-content\" style=\"padding: 48px 30px 40px; color: #000000;\" bgcolor=\"#ffffff\">
                                                <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">
                                                    <tbody>
                                                        <tr>
                                                            <td style=\"padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;\">
                                                                Hello " . htmlspecialchars($userName, ENT_QUOTES, 'UTF-8') . "! Welcome to our platform.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;\">
                                                                Please activate your account by clicking the button below.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 700; color: #000000; letter-spacing: 0.01em;\">
                                                                Click the button below to activate your account.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 24px 0;\">
                                                                <a class=\"button\" href=\"" . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . "\" title=\"Activate Account\" style=\"width: 100%; background: #22D172; text-decoration: none; display: inline-block; padding: 10px 0; color: #fff; font-size: 14px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;\">Activate Account</a>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;\">
                                                                The activation link is only valid for the next 24 hours.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 60px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;\">
                                                                If you didn’t request this, please ignore this message or contact our support at <a href=\"mailto:support_email\">support_email</a>.
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"padding: 0 0 16px;\">
                                                                <span style=\"display: block; width: 117px; border-bottom: 1px solid #8B949F;\"></span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style=\"font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;\">
                                                                Best regards, <br><strong>Company Name</strong>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style=\"padding: 24px 0 48px; font-size: 0px;\">
                                                <div class=\"outlook-group-fix\" style=\"padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;\">
                                                    <span style=\"padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;\">Company Legal Name<br/>Company Physical Address</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        ";
        return ['subject' => self::$subject, 'body' => self::$body];
    }
    
    public static function otpVerification($username, $otpCode) {
        self::$subject = "Your One-Time Password (OTP)";
        self::$body = "
            <!DOCTYPE html>
            <html xmlns=\"http://www.w3.org/1999/xhtml\">
            <head>
                <title>OTP Verification</title>
                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
                <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">
                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
                <style type=\"text/css\">
                    body { font-family: 'Inter', sans-serif; background: #E5E5E5; margin: 0; padding: 0; }
                    table { border-collapse: collapse; }
                    .otp-box {
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #22D172;
                        background: #f9f9f9;
                        padding: 12px 20px;
                        border-radius: 8px;
                        display: inline-block;
                    }
                </style>
            </head>
            <body>
                <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\" bgcolor=\"#F6FAFB\">
                    <tbody>
                        <tr>
                            <td valign=\"top\" align=\"center\">
                                <table class=\"container\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">
                                    <tbody>
                                        <tr>
                                            <td style=\"padding: 40px 30px; text-align: center; background: #ffffff;\">
                                                <h2 style=\"color: #000000;\">Hello " . htmlspecialchars($username, ENT_QUOTES, 'UTF-8') . ",</h2>
                                                <p style=\"font-size: 16px; color: #000000;\">Use the OTP below to verify your action:</p>
                                                <div class=\"otp-box\">" . htmlspecialchars($otpCode, ENT_QUOTES, 'UTF-8') . "</div>
                                                <p style=\"font-size: 14px; color: #000000; margin-top: 20px;\">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                                                <p style=\"font-size: 14px; color: #000000;\">If you didn’t request this, please ignore this email.</p>
                                                <br>
                                                <p style=\"font-size: 14px; color: #000000;\">Best regards, <br><strong>Company Name</strong></p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        ";
        return ['subject' => self::$subject, 'body' => self::$body];
    }
    
    public static function emailVerification($name, $verificationLink) {
        self::$subject = "Verify Your Email Address";
        self::$body = "
            <!DOCTYPE html>
            <html xmlns='http://www.w3.org/1999/xhtml'>
            <head>
                <title>Email Verification</title>
                <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <style type='text/css'>
                    body { font-family: 'Inter', sans-serif; background: #E5E5E5; margin: 0; padding: 0; }
                    table { border-collapse: collapse; }
                    .btn {
                        width: 100%;
                        background: #22D172;
                        text-decoration: none;
                        display: inline-block;
                        padding: 12px 0;
                        color: #ffffff;
                        font-size: 14px;
                        line-height: 21px;
                        text-align: center;
                        font-weight: bold;
                        border-radius: 7px;
                    }
                </style>
            </head>
            <body>
                <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#F6FAFB'>
                    <tbody>
                        <tr>
                            <td valign='top' align='center'>
                                <table class='container' width='600' cellspacing='0' cellpadding='0' border='0'>
                                    <tbody>
                                        <tr>
                                          <td style='padding:48px 0 30px 0; text-align: center;'>
                                            <img src='https://ojt.kamsite.com/api/uploads/systemFiles/logo.png' 
                                                 alt='Company Logo' 
                                                 style='width: 100px; height: 100px; border-radius: 50%; object-fit: cover;'>
                                          </td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 40px 30px; background: #ffffff; color: #000000;'>
                                                <h2 style='margin:0 0 16px 0;'>Hello " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . ",</h2>
                                                <p style='font-size:14px; margin:0 0 20px 0;'>
                                                    Thank you for signing up. Please confirm your email address by clicking the button below:
                                                </p>
                                                <a href='" . htmlspecialchars($verificationLink, ENT_QUOTES, 'UTF-8') . "' class='btn'>Verify Email</a>
                                                <p style='font-size:14px; margin:20px 0 0 0;'>
                                                    If you did not create an account, please ignore this email.
                                                </p>
                                                <p style='font-size:14px; margin-top:30px;'>
                                                    Best regards, <br><strong>Ojt Track</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        ";
        return ['subject' => self::$subject, 'body' => self::$body];
    }
}
