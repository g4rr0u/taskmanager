<?php
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['team_id'])) {
    $teamId = $_GET['team_id'];

    $host =    getenv('DB_HOST');
    $username =getenv('DB_USER');
    $password =getenv('DB_PASS');
    $db_name = getenv('DB_NAME');

    $mysqli = new mysqli($host, $username, $password, $db_name);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt = $mysqli->prepare("SELECT user.user_id, user.user_surname, user.user_name, user.user_login FROM teamMembership JOIN user ON teamMembership.user_id = user.user_id WHERE teamMembership.team_id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $teamId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $users = array();
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            $response = array('success' => true, 'users' => $users);
        } else {
            $response = array('success' => false, 'error' => 'В команде нет сотрудников');
        }

        $stmt->close();
    } else {
        $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса');
    }

    $mysqli->close();

    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    $response = array('success' => false, 'error' => 'Некорректный запрос');
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>
