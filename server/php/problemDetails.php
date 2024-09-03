<?php
header("Content-Type: application/json");
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from your React app
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow the necessary HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db/connect_mongo.php';

$collection = $client->guvitask->problems;

if (isset($_GET['id'])) {
    $problemId = $_GET['id'];

    try {
        // Find the problem by ID
        $problem = $collection->findOne(['_id' => new MongoDB\BSON\ObjectId($problemId)]);

        if ($problem) {
            // Convert MongoDB BSON document to a PHP array
            $problemArray = [
                'title' => $problem['title'],
                'description' => $problem['description'],
                'sampleIO' => $problem['sampleIO'],
                'hiddenIO' => $problem['hiddenIO']
            ];

            // Check if languageIO exists and is of type BSONArray
            if (isset($problem['languageIO']) && $problem['languageIO'] instanceof MongoDB\Model\BSONArray) {
                // Convert BSONArray to a PHP array
                $languageIOArray = iterator_to_array($problem['languageIO'], false);

                // Filter only enabled languages
                $enabledLanguages = array_filter($languageIOArray, function ($language) {
                    return isset($language['enabled']) && $language['enabled'] === true;
                });

                // Reset array keys after filtering
                $enabledLanguages = array_values($enabledLanguages);

                // Add filtered languageIO to the problemArray
                $problemArray['languageIO'] = $enabledLanguages;
            } else {
                // If languageIO does not exist or is not a BSONArray, initialize it as an empty array
                $problemArray['languageIO'] = [];
            }

            // Return the complete problem details with filtered languageIO
            echo json_encode($problemArray);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Problem not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Error fetching problem details: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'No problem ID provided']);
}
