<?php
header("Content-Type: application/json");
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from your React app
header("Access-Control-Allow-Methods: DELETE, OPTIONS"); // Allow necessary HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db/connect_mongo.php'; // Ensure this path is correct

// Get the ID from the request
$input = json_decode(file_get_contents('php://input'), true);
$problemId = $input['id'] ?? null;

if ($problemId) {
    try {
        // Connect to MongoDB
        $collection = $client->selectCollection('guvitask', 'problems');

        
        // Delete the problem with the specified ID
        $result = $collection->deleteOne(['_id' => new MongoDB\BSON\ObjectId($problemId)]);

        if ($result->getDeletedCount() > 0) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'Problem not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'No ID provided']);
}
?>
