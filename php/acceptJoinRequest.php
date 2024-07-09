<?php
$servername = getenv('DB_HOST');
$username   = getenv('DB_USER');
$password   = getenv('DB_PASS');
$dbname     = getenv('DB_NAME');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

$requestData = json_decode(file_get_contents("php://input"), true);

$requestId = $requestData['request_id'];

$sqlUpdateRequest = "UPDATE teamJoinRequests SET status='accepted' WHERE request_id=?";
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

$sqlJoinRequest = "SELECT joiningUser_id, joiningTeam_id FROM teamJoinRequests WHERE request_id=?";
if ($stmtJoinRequest = $conn->prepare($sqlJoinRequest)) {
    $stmtJoinRequest->bind_param("i", $requestId);
    if (!$stmtJoinRequest->execute()) {
        $response = array("success" => false, "error" => "Ошибка при получении данных о заявке: " . $conn->error);
        echo json_encode($response);
        exit();
    }
    $result = $stmtJoinRequest->get_result();
    $row = $result->fetch_assoc();
    $joiningUserId = $row['joiningUser_id'];
    $joiningTeamId = $row['joiningTeam_id'];
    $stmtJoinRequest->close();
} else {
    $response = array("success" => false, "error" => "Ошибка при подготовке запроса: " . $conn->error);
    echo json_encode($response);
    exit();
}

$sqlAddMembership = "INSERT INTO teamMembership (user_id, team_id, role) VALUES (?, ?, 'member')";
if ($stmtAddMembership = $conn->prepare($sqlAddMembership)) {
    $stmtAddMembership->bind_param("ii", $joiningUserId, $joiningTeamId);
    if (!$stmtAddMembership->execute()) {
        $response = array("success" => false, "error" => "Ошибка при добавлении записи в таблицу teamMembership: " . $conn->error);
        echo json_encode($response);
        exit();
    }
    $stmtAddMembership->close();
} else {
    $response = array("success" => false, "error" => "Ошибка при подготовке запроса: " . $conn->error);
    echo json_encode($response);
    exit();
}

$response = array("success" => true);
echo json_encode($response);

$conn->close();
?>
