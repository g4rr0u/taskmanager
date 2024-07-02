<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tasker";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

$teamId = $_GET['team_id'];

$sql = "SELECT tr.request_id, tr.joiningUser_id, tr.joiningTeam_id, tr.status, u.user_surname, u.user_name, u.user_login FROM teamJoinRequests AS tr INNER JOIN user AS u ON tr.joiningUser_id = u.user_id WHERE tr.joiningTeam_id = ? && tr.status = 'pending'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $teamId);
$stmt->execute();
$result = $stmt->get_result();

$requests = array();
while ($row = $result->fetch_assoc()) {
    $request = array(
        "request_id" => $row["request_id"],
        "user_id" => $row["joiningUser_id"],
        "team_id" => $row["joiningTeam_id"],
        "status" => $row["status"],
        "user_surname" => $row["user_surname"],
        "user_name" => $row["user_name"],
        "user_login" => $row["user_login"]
    );
    array_push($requests, $request);
}

$response = array(
    "success" => true,
    "requests" => $requests
);
echo json_encode($response);

$stmt->close();
$conn->close();
?>
