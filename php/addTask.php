<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $task_name = $_POST['task_name'];
    $task_description = $_POST['task_description'];
    $task_creationDate = $_POST['task_creationDate'];
    $task_dueDate = $_POST['task_dueDate'];
    $task_priority = $_POST['task_priority'];
    $task_assignedUser = $_POST['task_assignedUser'];
    $task_TeamID = $_POST['task_TeamID'];

    $host = 'localhost';
    $username = 'root';
    $password = '';
    $db_name = 'tasker';

    $mysqli = new mysqli($host, $username, $password, $db_name);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt_user = $mysqli->prepare("SELECT user_id FROM user WHERE user_login = ?");
    $stmt_user->bind_param("s", $task_assignedUser);
    $stmt_user->execute();
    $result_user = $stmt_user->get_result();
    if ($result_user->num_rows > 0) {
        $row_user = $result_user->fetch_assoc();
        $task_assignedUserID = $row_user["user_id"];
    } else {
        $taskAssignedUserID = null;
    }
    $stmt_user->close();

    $stmt_task = $mysqli->prepare("INSERT INTO task (task_name, task_description, task_creationDate, task_dueDate, task_status, task_priority, task_assignedUserID, task_TeamID) VALUES (?, ?, ?, ?, 'open', ?, ?, ?)");
    $stmt_task->bind_param("sssssii", $task_name, $task_description, $task_creationDate, $task_dueDate, $task_priority, $task_assignedUserID, $task_TeamID);


    if ($stmt_task->execute()) {
        $response = array('success' => true);
    } else {
        $response = array('success' => false, 'error' => $stmt_task->error);
    }
    $stmt_task->close();

    $mysqli->close();

    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    $response = array('success' => false, 'error' => 'Метод запроса не поддерживается');
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>
