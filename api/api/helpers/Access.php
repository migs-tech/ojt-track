<?php
/**
 * Route access rules. Every callable endpoint must be listed here;
 * anything missing is rejected, so new controller methods are private by default.
 *
 * Rule values:
 *   'public' - no login required
 *   'auth'   - any logged-in user
 *   'cron'   - scheduled jobs; requires the CRON_SECRET (header X-Cron-Secret or ?key=)
 *   [roles]  - logged-in user whose role is in the list
 *
 * Roles: 1 = trainee, 2 = supervisor, 3 = coordinator, 4 = admin
 */
class Access {
    const TRAINEE = 1;
    const SUPERVISOR = 2;
    const COORDINATOR = 3;
    const ADMIN = 4;

    const STAFF = [self::COORDINATOR, self::ADMIN];

    private static $rules = [
        'user' => [
            'register'                => 'public',
            'login'                   => 'public',
            'logout'                  => 'auth',
            'forgotPassword'          => 'public',
            'verifyForgotPasswordOtp' => 'public',
            'resetPassword'           => 'public',
            'verifyEmailToken'        => 'public',

            'fetchOrGenerateQrCode'   => [self::TRAINEE],
            'generateQRCode'          => [self::TRAINEE],
            'regenerateQrCode'        => [self::TRAINEE],
            'report'                  => [self::TRAINEE],
            'sendSupervisorRequest'   => [self::TRAINEE],
            'fetchSupervisor'         => 'auth',
            'fetchRequestsSupervisors'=> 'auth',
            'AIAssistant'             => [self::TRAINEE],
            'generateOtp'             => 'auth',
            'verifyOtp'               => 'auth',
            'saveOjtCompletion'       => [self::TRAINEE],
            'getOjtCompletion'        => 'auth',
            'checkOjtCompletionStatus'=> 'auth',
            'createRequest'           => [self::TRAINEE],
            'getRequestHistory'       => 'auth',

            'scanQrCode'              => [self::SUPERVISOR],
            'getSupervisorRequests'   => [self::SUPERVISOR],
            'getTrainee'              => [self::SUPERVISOR],
            'fetchAllAttendance'      => [self::SUPERVISOR],
            'noAttendance'            => [self::SUPERVISOR],
            'recordAttendance'        => [self::SUPERVISOR],
            'getTotalAttendanceToday' => [self::SUPERVISOR],

            'getAttendance'           => 'auth',
            'getTotalHours'           => 'auth',
            'saveDeviceToken'         => 'auth',
            'getReports'              => 'auth',
            'getNotifications'        => 'auth',
            'markNotificationRead'    => 'auth',
            'changePassword'          => 'auth',
            'updateUserProfile'       => 'auth',
            'getUserProfile'          => 'auth',
            'sendVerificationEmail'   => 'auth',
            'checkIfEmailIsVerified'  => 'auth',

            'exportUsersToExcel'      => self::STAFF,
            'exportUserHoursToExcel'  => self::STAFF,
        ],
        'trainee' => [
            'getTraineeDataById'      => 'auth',   // ownership checked in controller
            'getTraineeReportListById'=> 'auth',   // ownership checked in controller
            'updateTraineeReport'     => [self::TRAINEE],
            'fetchRequestedTrainees'  => [self::SUPERVISOR],
            'updateTraineeRequest'    => [self::SUPERVISOR],
            'getTraineeLatestReport'  => [self::SUPERVISOR],
            'saveTraineeEvaluation'   => [self::SUPERVISOR],
            'saveEvaluationV2'        => [self::SUPERVISOR],
            'checkEvaluationExists'   => [self::SUPERVISOR],
            'unEnrollTrainee'         => [self::SUPERVISOR],
        ],
        'attendance' => [
            'getAttendanceByUserId'   => 'auth',
            'getTotalHours'           => 'auth',
            'timeOut'                 => 'auth',
        ],
        'notification' => [
            'deleteNotification'      => 'auth',
            'markNotificationRead'    => 'auth',
            'getNotifications'        => 'auth',
        ],
        'dashboard' => [
            'getTotalTrainees'        => self::STAFF,
            'getTotalSupervisors'     => self::STAFF,
            'getTotalUsers'           => self::STAFF,
            'getTraineeByDepartment'  => self::STAFF,
            'getTraineeByMonth'       => self::STAFF,
            'getDashboardData'        => self::STAFF,
            'getAttendanceByMonth'    => self::STAFF,
        ],
        'admin' => [
            'getTraineeList'          => self::STAFF,
            'getSupervisorList'       => self::STAFF,
            'getTraineeRequestList'   => self::STAFF,
            'getTraineeNoSupervisor'  => self::STAFF,
            'assignSupervisor'        => self::STAFF,
            'getTraineeDataById'      => self::STAFF,
            'generateTraineeMonthlyHoursReport'       => self::STAFF,
            'generateTraineeWeeklyAccomplishmentReport' => self::STAFF,
            'getReportRequest'        => self::STAFF,
            'updateReportRequestStatus' => self::STAFF,
            'getRecentEvaluations'    => self::STAFF,
            'getOjtHoursCompletionStats' => self::STAFF,
            'getEvaluationsTrainee'   => self::STAFF,
            'getAllEvaluations'       => self::STAFF,
            'getCompletedOjtTrainees' => self::STAFF,
            'generateTraineeDetails'  => self::STAFF,
            'getTeacherList'          => [self::ADMIN],
            'verifyTeacherAccount'    => [self::ADMIN],
            'deleteTeacherAccount'    => [self::ADMIN],
            'addTeacherAccount'       => [self::ADMIN],
            'updateTeacherAccount'    => self::STAFF, // coordinators may only edit themselves (checked in controller)
        ],
        'report' => [
            'generateWeeklyReports'          => self::STAFF,
            'generateWeeklyReportsAndHours'  => self::STAFF,
            'generateTraineeMonthlyHoursReport' => self::STAFF,
        ],
        'cron' => [
            'runAutoTimeOut'                  => 'cron',
            'runDailyAttendanceChecker'       => 'cron',
            'runCheckInDailyReminder'         => 'cron',
            'runCheckOutDailyReminder'        => 'cron',
            'runAutoGenerateMonthlyHoursReport' => 'cron',
            'runWeeklyAccomplishmentReport'   => 'cron',
            'runDailyQuote'                   => 'cron',
            'runDailyReportReminder'          => 'cron',
            'runWeeklyReportReminder'         => 'cron',
            'runWeeklyReportsAndHours'        => 'cron',
        ],
        // 'cron_job' (AutomateReportController) is old test code and is not exposed.
    ];

    /** Returns the rule for a route, or null if the route is not exposed. */
    public static function rule(string $controller, ?string $method) {
        if ($method === null || $method === '') return null;
        return self::$rules[$controller][$method] ?? null;
    }

    /** Stops the request unless the caller satisfies the route's rule. */
    public static function enforce(string $controller, ?string $method): void {
        $rule = self::rule($controller, $method);

        if ($rule === null) {
            sendJsonResponse(['error' => 'Resource not found'], 404);
        }
        if ($rule === 'public') {
            return;
        }
        if ($rule === 'cron') {
            $given = $_SERVER['HTTP_X_CRON_SECRET'] ?? ($_GET['key'] ?? '');
            if (!defined('CRON_SECRET') || CRON_SECRET === '' || !hash_equals(CRON_SECRET, (string) $given)) {
                sendJsonResponse(['error' => 'Forbidden'], 403);
            }
            return;
        }

        $user = AuthHelper::validateToken();
        if (!$user) {
            sendJsonResponse(['error' => 'Unauthorized'], 401);
        }
        if (is_array($rule) && !in_array((int) $user['role'], $rule, true)) {
            sendJsonResponse(['error' => 'Forbidden'], 403);
        }
    }
}
