<?php
/**
 * Safe file storage for user uploads.
 * - The file type is detected from the file's contents, never from the name or the client's claim.
 * - The stored name is random and its extension comes from the detected type,
 *   so an uploaded script can never be saved as .php.
 */
class Upload {
    const IMAGE_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/gif'  => 'gif',
        'image/webp' => 'webp',
    ];
    const DOCUMENT_TYPES = [
        'application/pdf' => 'pdf',
    ];
    const MAX_BYTES = 5 * 1024 * 1024;

    /**
     * Validates and stores one uploaded file.
     *
     * @param array  $file    One entry in $_FILES format (name, tmp_name, size, error)
     * @param string $subdir  Folder under uploads/, e.g. "reports" or "profile_images"
     * @param array  $allowed Map of MIME type => extension
     * @return array ['url' => ..., 'path' => ..., 'name' => ..., 'type' => ..., 'size' => ...]
     * @throws RuntimeException with a user-safe message when the file is rejected
     */
    public static function store(array $file, string $subdir, array $allowed = self::IMAGE_TYPES): array {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new RuntimeException('File upload failed.');
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            throw new RuntimeException('Invalid upload.');
        }
        if (($file['size'] ?? 0) > self::MAX_BYTES) {
            throw new RuntimeException('File is too large (max 5 MB).');
        }

        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!isset($allowed[$mime])) {
            throw new RuntimeException('File type not allowed.');
        }
        if (isset(self::IMAGE_TYPES[$mime]) && @getimagesize($file['tmp_name']) === false) {
            throw new RuntimeException('File is not a valid image.');
        }

        $subdir = trim(preg_replace('/[^a-z0-9_]/i', '', $subdir));
        $dir = __DIR__ . '/../uploads/' . $subdir . '/';
        if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
            throw new RuntimeException('Could not save the file.');
        }

        $name = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        if (!move_uploaded_file($file['tmp_name'], $dir . $name)) {
            throw new RuntimeException('Could not save the file.');
        }

        return [
            'url'  => rtrim(BASE_URL, '/') . '/api/uploads/' . $subdir . '/' . $name,
            'path' => $dir . $name,
            'name' => $name,
            'original_name' => basename((string) ($file['name'] ?? '')),
            'type' => $mime,
            'size' => (int) $file['size'],
        ];
    }

    /** Turns the multi-file $_FILES layout (name[], tmp_name[], ...) into a list of single files. */
    public static function normalize(array $files): array {
        if (!isset($files['name']) || !is_array($files['name'])) {
            return isset($files['name']) ? [$files] : [];
        }
        $list = [];
        foreach ($files['name'] as $i => $name) {
            $list[] = [
                'name'     => $name,
                'type'     => $files['type'][$i] ?? '',
                'tmp_name' => $files['tmp_name'][$i] ?? '',
                'error'    => $files['error'][$i] ?? UPLOAD_ERR_NO_FILE,
                'size'     => $files['size'][$i] ?? 0,
            ];
        }
        return $list;
    }
}
