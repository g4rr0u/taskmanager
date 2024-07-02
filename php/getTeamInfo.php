<?php
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$db_name = 'tasker';

$mysqli = new mysqli($host, $username, $password, $db_name);

if ($mysqli->connect_error) {
    die(json_encode(array('success' => false, 'error' => 'Ошибка подключения к базе данных')));
}

$team_id = $_GET['team_id'];

$stmt = $mysqli->prepare("SELECT * FROM team WHERE team_id = ?");
$stmt->bind_param("i", $team_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $teamInfo = $result->fetch_assoc();

    $stmt_members = $mysqli->prepare("SELECT user.user_id, user.user_name, user.user_login, teamMembership.role
                                      FROM teamMembership 
                                      JOIN user ON teamMembership.user_id = user.user_id 
                                      WHERE teamMembership.team_id = ?");
    $stmt_members->bind_param("i", $team_id);
    $stmt_members->execute();
    $result_members = $stmt_members->get_result();

    $members = array();
    while ($row = $result_members->fetch_assoc()) {
        $members[] = $row;
    }

    $teamInfo['members'] = $members;

    echo json_encode(array('success' => true, 'teamInfo' => $teamInfo));
} else {
    echo json_encode(array('success' => false, 'error' => 'Команда не найдена'));
}

$stmt->close();
$stmt_members->close();
$mysqli->close();
?>
