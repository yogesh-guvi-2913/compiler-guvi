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

// Get the JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Get problem ID from input data
$id = isset($data['id']) ? $data['id'] : '';
$title = isset($data['title']) ? $data['title'] : '';
$description = isset($data['description']) ? $data['description'] : '';
$sampleIO = isset($data['sampleIO']) ? $data['sampleIO'] : [];
$hiddenIO = isset($data['hiddenIO']) ? $data['hiddenIO'] : [];
$languageIO = isset($data['languageIO']) ? $data['languageIO'] : [];

if (empty($id)) {
    echo json_encode(['error' => 'ID is required']);
    exit();
}

try {
    // Update the problem details
    $updateResult = $collection->updateOne(
        ['_id' => new MongoDB\BSON\ObjectId($id)],
        ['$set' => [
            'title' => $title,
            'description' => $description,
            'sampleIO' => $sampleIO,
            'hiddenIO' => $hiddenIO,
            'languageIO' => $languageIO,
        ]]
    );

    if ($updateResult->getModifiedCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'No changes made']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
