<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$db_name = 'tasker';
$username = 'root';
$password = '';

$mysqli = new mysqli($host, $username, $password, $db_name);

if($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$user_surname = $_POST['user_surname'];
$user_name = $_POST['user_name'];
$user_login = $_POST['user_login'];
$user_email = $_POST['user_email'];
$user_password = $_POST['user_password'];

$sql_checkForData = "SELECT * FROM user WHERE user_login = ? OR user_email = ?";
$stmt_checkForData = $mysqli->prepare($sql_checkForData);
$stmt_checkForData->bind_param("ss", $user_login, $user_email);
$stmt_checkForData->execute();
$result = $stmt_checkForData->get_result();

if($result->num_rows > 0) {
    $response = array('success' => false, 'error' => "logORemail");
} else {
    $hashed_user_password = password_hash($user_password, PASSWORD_DEFAULT);

    $sql_insertData = "INSERT INTO user (user_surname, user_name, user_login, user_email, user_passwordHash) VALUES (?, ?, ?, ?, ?)";
    $stmt_insertData = $mysqli->prepare($sql_insertData);

    if($stmt_insertData) {
        $stmt_insertData->bind_param('sssss', $user_surname, $user_name, $user_login, $user_email, $hashed_user_password);
        $stmt_insertData->execute();

        if($stmt_insertData->affected_rows > 0) {
            $user_id = $stmt_insertData->insert_id; // Получаем ID только что созданного пользователя
            $response = array('success' => true, 'user_id' => $user_id);
        } else {
            $response = array('success' => false, 'error' => "error");
        }

        $stmt_insertData->close();
    } else {
        $response = array('success' => false, 'error' => "error2");
    }
}

$stmt_checkForData->close();
$mysqli->close();

header('Content-Type: application/json');
echo json_encode($response);
die();
?>
