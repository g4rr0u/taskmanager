<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tasker";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

$requestData = json_decode(file_get_contents("php://input"), true);

$requestId = $requestData['request_id'];

$sqlUpdateRequest = "UPDATE teamJoinRequests SET status='rejected' WHERE request_id=?";
if ($stmtUpdateRequest = $conn->prepare($sqlUpdateRequest)) {
    $stmtUpdateRequest->bind_param("i", $requestId);
    if (!$stmtUpdateRequest->execute()) {
        $response = array("success" => false, "error" => "Ошибка при обновлении статуса заявки: " . $conn->error);
        echo json_encode($response);
        exit();
    }
    $stmtUpdateRequest->close();
} else {
    $response = array("success" => false, "error" => "Ошибка при подготовке запроса: " . $conn->error);
    echo json_encode($response);
    exit();
}

$response = array("success" => true);
echo json_encode($response);

$conn->close();
?>
