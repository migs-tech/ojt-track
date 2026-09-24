<?php

function isOnline(): bool {
    $connected = @fsockopen("www.google.com", 80);
    if ($connected) {
        fclose($connected);
        return true;
    }
    return false;
}

function getClientIp(): string {
    $ip = '';

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]); 
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }

    return $ip === '::1' ? '127.0.0.1' : $ip;
}

function isMobileDevice(): bool {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $mobileRegex = '/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i';

    return (bool) preg_match($mobileRegex, $userAgent);
}

function getBrowser(): string {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    if (preg_match('/MSIE|Trident/', $userAgent)) {
        return 'Internet Explorer';
    }
    if (preg_match('/Edge/', $userAgent)) {
        return 'Edge';
    }
    if (preg_match('/Chrome/', $userAgent)) {
        return 'Chrome';
    }
    if (preg_match('/Safari/', $userAgent) && !preg_match('/Chrome/', $userAgent)) {
        return 'Safari';
    }
    if (preg_match('/Firefox/', $userAgent)) {
        return 'Firefox';
    }
    if (preg_match('/Opera|OPR/', $userAgent)) {
        return 'Opera';
    }

    return 'Unknown';
}
