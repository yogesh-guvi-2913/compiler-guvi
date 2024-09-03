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

try {
    // Fetch all problems
    $problems = $collection->find([], ['projection' => ['_id' => 1, 'title' => 1, 'description' => 1]]);
    
    $result = [];
    foreach ($problems as $problem) {
        // Rename '_id' to 'id'
        $problem['_id'] = (string) $problem['_id'];
        $result[] = $problem;
    }
    
    // Output as JSON
    echo json_encode($result);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
