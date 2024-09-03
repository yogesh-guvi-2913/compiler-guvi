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

// Get the problem ID from query parameters
$id = isset($_GET['id']) ? $_GET['id'] : '';

if (empty($id)) {
    echo json_encode(['error' => 'ID is required']);
    exit();
}

try {
    // Fetch the problem details by ID
    $problem = $collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);

    if ($problem) {
        $problemArray = [
            'id' => (string)$problem->_id,
            'title' => $problem->title,
            'description' => $problem->description,
            'sampleIO' => $problem->sampleIO ?? [],
            'hiddenIO' => $problem->hiddenIO ?? [],
            'languageIO' => $problem->languageIO ?? [],
        ];
        echo json_encode($problemArray);
    } else {
        echo json_encode(['error' => 'Problem not found']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
