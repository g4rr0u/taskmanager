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

$team_id = $_GET['team_id'];

$stmt = $mysqli->prepare("SELECT task.*, user.user_surname, user.user_name FROM task JOIN user ON task.task_assignedUserID = user.user_id WHERE task.task_TeamID = ?");
$stmt->bind_param("i", $team_id);
$stmt->execute();
$result = $stmt->get_result();

$tasks = array();
while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

$stmt->close();
$mysqli->close();

echo json_encode(array('success' => true, 'tasks' => $tasks));
?>
