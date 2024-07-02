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

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $team_id = $_POST['team_id'];
    $user_id = $_POST['user_id'];
    $current_user_id = $_SESSION['user_id'];

    $stmt = $mysqli->prepare('SELECT role FROM teamMembership WHERE team_id = ? AND user_id = ?');
    $stmt->bind_param('ii', $team_id, $current_user_id);
    $stmt->execute();
    $stmt->bind_result($current_user_role);
    $stmt->fetch();
    $stmt->close();

   
        $delete_stmt = $mysqli->prepare('DELETE FROM teamMembership WHERE team_id = ? AND user_id = ?');
        $delete_stmt->bind_param('ii', $team_id, $user_id);

        if ($delete_stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Не удалось удалить пользователя']);
        }
        $delete_stmt->close();
    
    
} else {
    echo json_encode(['success' => false, 'error' => 'Неправильный метод запроса']);
}

$mysqli->close();
?>
