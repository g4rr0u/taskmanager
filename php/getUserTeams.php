<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);

if(isset($data['user_id'])) {
    $user_id = $data['user_id'];

    $host = 'localhost';
    $username = 'root';
    $password = '';
    $db_name = 'tasker';

    $mysqli = new mysqli($host, $username, $password, $db_name);

    if($mysqli->connect_error){
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt_getTeams = $mysqli->prepare("SELECT t.* FROM team AS t INNER JOIN teamMembership AS tm ON t.team_id = tm.team_id WHERE tm.user_id = ?");
    if($stmt_getTeams) {
        $stmt_getTeams->bind_param("i", $user_id);
        $stmt_getTeams->execute();
        $result = $stmt_getTeams->get_result();
        
        $teams = array();
        while ($row = $result->fetch_assoc()) {
            $teams[] = $row;
        }

        $stmt_getTeams->close();

        header('Content-Type: application/json');
        echo json_encode($teams);
    } else {
        $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса для получения команд');
        echo json_encode($response);
    }

    $mysqli->close();
} else {
    $response = array('success' => false, 'error' => 'Не удалось получить идентификатор пользователя');
    echo json_encode($response);
}
?>
