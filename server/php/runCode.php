<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function runCode($source_code, $language_id, $testCases)
{
    $url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';

    $results = []; // Array to store results for each test case

    foreach ($testCases as $testCase) {
        $input = $testCase['input'];

        $data = [
            'source_code' => $source_code,
            'language_id' => $language_id,
            'stdin' => $input // Set the input for the test case
        ];

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-rapidapi-key: a079865d6bmshfae37ab1478bb82p13180cjsn613a72e2d2d2', // use environment variable for security
            'x-rapidapi-host: judge0-ce.p.rapidapi.com'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            curl_close($ch);
            return ['error' => 'cURL error: ' . curl_error($ch)];
        }

        $result = json_decode($response, true); // Add the result for this test case to the results array

        if (isset($result['stdout'])) {
            $result['stdout'] = trim($result['stdout']); // Remove any trailing new lines
        }

        $results[] = [
            'testCaseInput' => $input,
            'output' => $result['stdout'],
            'expectedOutput' => $testCase['output'], // Assuming expected output is part of test case
            'status' => $result['status']['description'],
            'time' => $result['time'],
            'memory' => $result['memory'],
        ];

        curl_close($ch);
    }

    return $results;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $source_code = $_POST['code'];
    $language = $_POST['language'];
    $testCases = json_decode($_POST['testCases'], true); // Parse test cases JSON

    // Log the received input for debugging
    error_log("Received code: $source_code");
    error_log("Language: $language");
    error_log("Test Cases: " . print_r($testCases, true));

    // Map the language to Judge0 language_id
    $language_map = [
        'javascript' => 63,
        'java' => 62,
        'python' => 71,
        'c' => 50,
        'cpp' => 54,
    ];

    if (array_key_exists($language, $language_map)) {
        $language_id = $language_map[$language];
        $result = runCode($source_code, $language_id, $testCases);

        if ($result) {
            echo json_encode($result);
        } else {
            echo json_encode(['error' => 'Failed to execute code.']);
        }
    } else {
        echo json_encode(['error' => 'Unsupported language']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
