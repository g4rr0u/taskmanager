<?php
if(isset($_POST['taskId'])) {
    $taskId = $_POST['taskId'];

    $host =    getenv('DB_HOST');
    $username =getenv('DB_USER');
    $password =getenv('DB_PASS');
    $db_name = getenv('DB_NAME');

    
    $mysqli = new mysqli($host, $username, $password, $db_name);

    if($mysqli->connect_error){
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt = $mysqli->prepare("DELETE FROM task WHERE task_id = ?");
    if($stmt) {
        $stmt->bind_param("i", $taskId);
        $stmt->execute();
        
        if($stmt->affected_rows > 0) {
            $response = array('success' => true);
        } else {
            $response = array('success' => false, 'error' => 'Не удалось удалить задачу');
        }

        $stmt->close();
    } else {
        $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса для удаления задачи');
    }

    $mysqli->close();
} else {
    $response = array('success' => false, 'error' => 'Отсутствует идентификатор задачи');
}

header('Content-Type: application/json');
echo json_encode($response);
?>
