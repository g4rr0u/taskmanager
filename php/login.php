<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host =    getenv('DB_HOST');
$username =getenv('DB_USER');
$password =getenv('DB_PASS');
$db_name = getenv('DB_NAME');

$mysqli = new mysqli($host, $username, $password, $db_name);

if($mysqli->connect_error){
    die("Connection failed: " . $mysqli->connect_error);
}

$user_login = $_POST['user_login'];
$user_passwordHash  = $_POST['user_password'];

$stmt_checkForData = "SELECT * FROM user WHERE user_login = ?";
$stmt_checkForData = $mysqli->prepare($stmt_checkForData);

if($stmt_checkForData){
    $stmt_checkForData->bind_param("s", $user_login);
    $stmt_checkForData->execute();
    $result = $stmt_checkForData->get_result();

    if($result->num_rows > 0){
        $user_data = $result->fetch_assoc();
        if(password_verify($user_passwordHash, $user_data['user_passwordHash'])){
            $user_id = $user_data['user_id'];
            $user_email = $user_data['user_email'];
            $user_surname = $user_data['user_surname'];
            $user_name = $user_data['user_name'];
            $response = array('success' => true, 'user_id' => $user_id, 'user_email' => $user_email, 'user_surname' => $user_surname, 'user_name' => $user_name);
        } else {
            $response = array('success' => false, 'error' => 'Invalid password');
        }
    } else {
        $response = array('success' => false, 'error' => 'User not found');
    }

    $stmt_checkForData->close();
} else {
    $response = array('success' => false, 'error' => 'error preparing statement');
}

$mysqli->close();

header('Content-Type: application/json');
echo json_encode($response);
die();
?>