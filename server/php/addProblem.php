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

// Get the posted data
$inputData = json_decode(file_get_contents("php://input"), true);

if ($inputData) {
    $errors = [];

    // Validate required fields
    if (empty($inputData['title'])) {
        $errors[] = "Problem title is required.";
    }

    if (empty($inputData['description'])) {
        $errors[] = "Description is required.";
    }

    if (empty($inputData['languageIO'])) {
        $errors[] = "Language is required.";
    }

    // Validate sample I/O fields, but only for enabled cases
    if (empty($inputData['sampleIO']) || !array_filter($inputData['sampleIO'], fn($sample) => $sample['enabled'])) {
        $errors[] = "At least one enabled sample input/output is required.";
    } else {
        foreach ($inputData['sampleIO'] as $index => $sample) {
            if ($sample['enabled']) {
                if (empty($sample['output'])) {
                    $errors[] = "Output is required for Sample " . ($index + 1);
                }
                if (empty($sample['explanation'])) {
                    $errors[] = "Explanation is required for Sample " . ($index + 1);
                }
            }
        }
    }

    // Validate hidden I/O fields, but only for enabled cases
    if (empty($inputData['hiddenIO']) || !array_filter($inputData['hiddenIO'], fn($hidden) => $hidden['enabled'])) {
        $errors[] = "At least one enabled hidden input/output is required.";
    } else {
        foreach ($inputData['hiddenIO'] as $index => $hidden) {
            if ($hidden['enabled']) {
                if (empty($hidden['output'])) {
                    $errors[] = "Hidden output is required for Hidden Input/Output " . ($index + 1);
                }
            }
        }
    }

    // Check for duplicate inputs, but only for enabled cases
    function hasDuplicateInputs($data)
    {
        $enabledInputs = array_filter($data, fn($item) => $item['enabled']);
        $inputs = array_map(function ($item) {
            return $item['input'];
        }, $enabledInputs);
        return count($inputs) !== count(array_unique($inputs));
    }

    if (hasDuplicateInputs($inputData['sampleIO'])) {
        $errors[] = "Duplicate sample inputs are not allowed.";
    }

    if (hasDuplicateInputs($inputData['hiddenIO'])) {
        $errors[] = "Duplicate hidden inputs are not allowed.";
    }

    if (!empty($errors)) {
        echo json_encode(["success" => false, "errors" => $errors]);
        exit();
    }

    // Insert or update the problem
    if (isset($inputData['id'])) {
        // Update logic
        $result = $collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($inputData['id'])],
            ['$set' => [
                'title' => $inputData['title'],
                'description' => $inputData['description'],
                'sampleIO' => $inputData['sampleIO'],
                'hiddenIO' => $inputData['hiddenIO'],
                'languageIO' => $inputData['languageIO'],
            ]]
        );

        if ($result->getModifiedCount() > 0) {
            echo json_encode(["success" => true, "message" => "Problem updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update problem"]);
        }
    } else {
        // Insert logic
        $result = $collection->insertOne([
            'title' => $inputData['title'],
            'description' => $inputData['description'],
            'sampleIO' => $inputData['sampleIO'],
            'hiddenIO' => $inputData['hiddenIO'],
            'languageIO' => $inputData['languageIO'],
        ]);

        if ($result->getInsertedCount() > 0) {
            echo json_encode(["success" => true, "message" => "Problem saved successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save problem"]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "No data received"]);
}
