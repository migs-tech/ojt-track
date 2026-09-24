<?php
class OpenAIClient {
    private static $apiKey = OPENAI_API_KEY; 
    private static $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public static function sendMessage($message, $model = 'gpt-3.5-turbo') {
        if (!self::$apiKey) {
            throw new Exception('OpenAI API key is not defined.');
        }
    
        $systemMessage = [
            "role" => "system",
            "content" => "You are an assistant that always responds in grammatically correct sentences. Do not use numbers, bullets, or lists. Limit your response to 5 sentences only."
        ];
    
        if (is_string($message)) {
            $messages = [
                $systemMessage,
                ["role" => "user", "content" => $message]
            ];
        } elseif (is_array($message)) {
            $messages = array_merge([$systemMessage], $message);
            foreach ($messages as $msg) {
                if (!is_array($msg) || !isset($msg['role']) || !isset($msg['content'])) {
                    throw new Exception('Each message must be an object with "role" and "content".');
                }
            }
        } else {
            throw new Exception('Invalid type for messages: must be string or array of objects.');
        }
    
        $data = [
            'model' => $model,
            'messages' => $messages
        ];
    
        $headers = [
            'Content-Type: application/json',
            'Authorization: ' . 'Bearer ' . self::$apiKey
        ];
    
        $ch = curl_init(self::$apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception('Request Error: ' . curl_error($ch));
        }
        curl_close($ch);

        return json_decode($response, true);
    }


    /**
     * Summarize daily report with optional image
     */
    public static function sendReportSummarize($params) {
        $description = $params['description'] ?? '';
        $image = $params['image_url'] ?? ''; // optional

        $data = [
            "model" => "gpt-4o-mini",
            "messages" => [
                [
                    "role" => "system",
                    "content" => "You are an assistant that writes natural and professional daily accomplishment summaries for IT OJT students. Each summary should be clear, detailed, and written in the past tense using 2–4 sentences. Avoid starting with repetitive phrases like 'Today, I...' or 'I created...'. Instead, use varied sentence structures that naturally describe what was done or achieved. Do not include introductions, titles, or lists — only the descriptive accomplishment paragraph."
                ],
                [
                    "role" => "user",
                    "content" => array_filter([
                        [
                            "type" => "text",
                            "text" => $description
                        ],
                        $image ? [
                            "type" => "image_url",
                            "image_url" => [
                                "url" => $image
                            ]
                        ] : null
                    ])
                ]
            ]
        ];

        $headers = [
            "Content-Type: application/json",
            "Authorization: " . "Bearer " . self::$apiKey
        ];

        $ch = curl_init(self::$apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception('Request Error: ' . curl_error($ch));
        }
        curl_close($ch);

        $result = json_decode($response, true);

        return $result['choices'][0]['message']['content'] ?? null;
    }

    /**
     * For debugging
     */
    public static function test() {
        return "check api key: " . self::$apiKey;
    }
}
