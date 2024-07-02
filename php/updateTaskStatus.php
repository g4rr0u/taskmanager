<?php
$host = 'localhost';
$username = 'root';
$password = '';
$db_name = 'tasker';

$mysqli = new mysqli($host, $username, $password, $db_name);

if($mysqli->connect_error){
    die("Connection failed: " . $mysqli->connect_error);
}

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['task_id']) && isset($_POST['task_status'])) {
        $taskId = $_POST['task_id'];
        $newStatus = $_POST['task_status'];

        $sql = "UPDATE task SET task_status=? WHERE task_id=?";
        
        $stmt = $mysqli->prepare($sql);
        
        $stmt->bind_param("si", $newStatus, $taskId);
        
        if ($stmt->execute()) {
            echo json_encode(array("success" => true));
        } else {
            echo json_encode(array("success" => false, "error" => "Ошибка при выполнении запроса"));
        }

        $stmt->close();
        $mysqli->close();
    } else {
        echo json_encode(array("success" => false, "error" => "Недостаточно данных для выполнения запроса"));
    }
} else {
    echo json_encode(array("success" => false, "error" => "Неверный метод запроса"));
}
?>
