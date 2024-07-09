<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $host = getenv('DB_HOST');
    $db =   getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');
    
    $mysqli = new mysqli($host, $user, $pass, $db);

    if ($mysqli->connect_error) {
        die(json_encode(['success' => false, 'error' => 'Ошибка подключения к базе данных']));
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'];
    $userSurname = $data['user_surname'];
    $userName = $data['user_name'];
    $userEmail = $data['user_email'];

    $updateQuery = "UPDATE user SET user_surname = ?, user_name = ?, user_email = ? WHERE user_id = ?";
    $updateStmt = $mysqli->prepare($updateQuery);
    $updateStmt->bind_param('sssi', $userSurname, $userName, $userEmail, $userId);

    if ($updateStmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка обновления данных пользователя: ' . $mysqli->error]);
    }

    $updateStmt->close();
    $mysqli->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Неверный метод запроса']);
}
?>
