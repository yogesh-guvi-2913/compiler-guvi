<?php
require '../vendor/autoload.php'; // Ensure MongoDB library is included

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
} catch (Exception $e) {
    // If the connection fails, it might output HTML error messages
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
?>