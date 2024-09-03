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
    // Fetch only the problem IDs
    $problemIds = $collection->find([], ['projection' => ['_id' => 1]]);

    // Extract the IDs into an array
    $ids = [];
    foreach ($problemIds as $problem) {
        $ids[] = (string) $problem->_id;
    }

    // Return the IDs as a JSON response
    echo json_encode($ids);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error fetching problem IDs']);
}
