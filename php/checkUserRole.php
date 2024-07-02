<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

if(isset($data['user_id']) && isset($data['team_id'])) {
    $user_id = $data['user_id'];
    $team_id = $data['team_id'];

    $host = 'localhost';
    $username = 'root';
    $password = '';
    $db_name = 'tasker';

    $mysqli = new mysqli($host, $username, $password, $db_name);

    if($mysqli->connect_error){
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt = $mysqli->prepare("SELECT role FROM teamMembership WHERE user_id = ? AND team_id = ?");
    $stmt->bind_param("ii", $user_id, $team_id);
    $stmt->execute();
    $stmt->bind_result($role);
    $stmt->fetch();
    $stmt->close();

    $is_leader = false;
    if ($role === 'leader') {
        $is_leader = true;
    }

    echo json_encode(array('success' => true, 'is_leader' => $is_leader));
} else {
    echo json_encode(array('success' => false, 'error' => 'Отсутствуют необходимые данные'));
}
?>
