<?php
/**
 * Where files end up after they're saved.
 *
 * - With CLOUDINARY_URL set (cloudinary://<api_key>:<api_secret>@<cloud_name>), files are uploaded
 *   to Cloudinary and its HTTPS URL is returned. Use this on hosts whose disk is wiped on restart (Render).
 * - Otherwise files stay in api/uploads/ and are served by this server.
 */
class Storage {
    public static function usesCloudinary(): bool {
        return self::cloudinary() !== null;
    }

    /** Random, unguessable suffix for file names that would otherwise be predictable. */
    public static function randomName(string $prefix, string $ext): string {
        $prefix = preg_replace('/[^A-Za-z0-9_-]/', '_', $prefix);
        return $prefix . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    }

    /**
     * Publishes a file that is already inside api/uploads/ and returns its public URL.
     * The local copy is kept for the rest of the request (e.g. for email attachments).
     */
    public static function publish(string $absPath, string $mime = ''): string {
        $uploadsRoot = realpath(__DIR__ . '/../uploads');
        $real = realpath($absPath);
        if (!$real || strpos($real, $uploadsRoot) !== 0) {
            throw new RuntimeException('File is outside the uploads folder.');
        }
        $relative = str_replace('\\', '/', substr($real, strlen($uploadsRoot) + 1));

        if (self::usesCloudinary()) {
            $folder = trim(dirname($relative), './');
            $name = pathinfo($relative, PATHINFO_FILENAME);
            $isImage = strpos($mime ?: (mime_content_type($real) ?: ''), 'image/') === 0;
            return self::uploadToCloudinary($real, $folder, $name, $isImage ? 'image' : 'raw', pathinfo($relative, PATHINFO_EXTENSION));
        }

        return rtrim(BASE_URL, '/') . '/api/uploads/' . $relative;
    }

    /** Parses CLOUDINARY_URL into [cloud, key, secret], or null when not configured. */
    private static function cloudinary(): ?array {
        $url = defined('CLOUDINARY_URL') ? CLOUDINARY_URL : (getenv('CLOUDINARY_URL') ?: '');
        if (!$url || !preg_match('#^cloudinary://([^:]+):([^@]+)@(.+)$#', $url, $m)) {
            return null;
        }
        return ['key' => $m[1], 'secret' => $m[2], 'cloud' => $m[3]];
    }

    private static function uploadToCloudinary(string $path, string $folder, string $publicId, string $type, string $ext): string {
        $c = self::cloudinary();
        $folder = 'ojt-track' . ($folder !== '' ? '/' . $folder : '');
        // Raw files keep their extension in the public ID so they download with the right type.
        if ($type === 'raw' && $ext !== '') {
            $publicId .= '.' . $ext;
        }

        $params = ['folder' => $folder, 'public_id' => $publicId, 'timestamp' => time()];
        ksort($params);
        $toSign = urldecode(http_build_query($params));
        $params['signature'] = sha1($toSign . $c['secret']);
        $params['api_key'] = $c['key'];
        $params['file'] = new CURLFile($path);

        $ch = curl_init("https://api.cloudinary.com/v1_1/{$c['cloud']}/{$type}/upload");
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $params,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 60,
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $data = $body ? json_decode($body, true) : null;
        if ($status !== 200 || empty($data['secure_url'])) {
            error_log('[storage] Cloudinary upload failed (' . $status . '): ' . ($error ?: substr((string) $body, 0, 300)));
            throw new RuntimeException('Could not save the file.');
        }
        return $data['secure_url'];
    }
}
