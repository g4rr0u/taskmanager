<?php
header('Content-Type: application/json');

$host =    getenv('DB_HOST');
$username =getenv('DB_USER');
$password =getenv('DB_PASS');
$db_name = getenv('DB_NAME');

$mysqli = new mysqli($host, $username, $password, $db_name);

if ($mysqli->connect_error) {
    die(json_encode(array('success' => false, 'error' => 'Ошибка подключения к базе данных')));
}

$team_id = isset($_POST['team_id']) ? $_POST['team_id'] : null;

if (!$team_id) {
    die(json_encode(array('success' => false, 'error' => 'Не передан идентификатор команды')));
}

$stmt1 = $mysqli->prepare("DELETE FROM teamJoinRequests WHERE joiningTeam_id = ?");
$stmt1->bind_param("i", $team_id);
$stmt1->execute();
$stmt1->close();

$stmt2 = $mysqli->prepare("DELETE FROM teamMembership WHERE team_id = ?");
$stmt2->bind_param("i", $team_id);
$stmt2->execute();
$stmt2->close();

$stmt3 = $mysqli->prepare("DELETE FROM team WHERE team_id = ?");
$stmt3->bind_param("i", $team_id);
$stmt3->execute();

if ($stmt3->affected_rows > 0) {
    echo json_encode(array('success' => true));
} else {
    echo json_encode(array('success' => false, 'error' => 'Команда не найдена'));
}

$stmt3->close();
$mysqli->close();
?>
