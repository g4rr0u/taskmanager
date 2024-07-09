<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if(isset($_POST['userId']) && isset($_POST['teamId'])) {
    $userId = $_POST['userId'];
    $teamId = $_POST['teamId'];

    $host =    getenv('DB_HOST');
    $username =getenv('DB_USER');
    $password =getenv('DB_PASS');
    $db_name = getenv('DB_NAME');

    $mysqli = new mysqli($host, $username, $password, $db_name);

    if($mysqli->connect_error){
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt_checkRequest = $mysqli->prepare("SELECT * FROM teamJoinRequests WHERE joiningUser_id = ? AND joiningTeam_id = ?");
    if($stmt_checkRequest) {
        $stmt_checkRequest->bind_param("ii", $userId, $teamId);
        $stmt_checkRequest->execute();
        $result = $stmt_checkRequest->get_result();
        if($result->num_rows > 0) {
            $response = array('success' => false, 'error' => 'Вы уже отправили заявку на вступление в эту команду');
        } else {
            $status = 'pending';
            $stmt_insertRequest = $mysqli->prepare("INSERT INTO teamJoinRequests (joiningUser_id, joiningTeam_id, status) VALUES (?, ?, ?)");
            if($stmt_insertRequest) {
                $stmt_insertRequest->bind_param("iis", $userId, $teamId, $status);
                $stmt_insertRequest->execute();
                if($stmt_insertRequest->affected_rows > 0) {
                    $response = array('success' => true, 'message' => 'Заявка успешно отправлена');
                } else {
                    $response = array('success' => false, 'error' => 'Не удалось создать заявку');
                }
                $stmt_insertRequest->close();
            } else {
                $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса для создания заявки');
            }
        }
        $stmt_checkRequest->close();
    } else {
        $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса для проверки заявки');
    }

    $mysqli->close();
} else {
    $response = array('success' => false, 'error' => 'Отсутствуют данные для создания заявки');
}

header('Content-Type: application/json');
echo json_encode($response);
?>
