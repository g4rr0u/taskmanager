<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $host = getenv('DB_HOST');
    $db =   getenv('DB_USER');
    $user = getenv('DB_PASS');
    $pass = getenv('DB_NAME');

    $mysqli = new mysqli($host, $user, $pass, $db);

    if ($mysqli->connect_error) {
        die(json_encode(['success' => false, 'error' => 'Ошибка подключения к базе данных']));
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'];
    $oldPassword = $data['oldPassword'];
    $newPassword = $data['newPassword'];
    $selectQuery = "SELECT user_passwordHash FROM user WHERE user_id = ?";
    $selectStmt = $mysqli->prepare($selectQuery);
    $selectStmt->bind_param('i', $userId);
    $selectStmt->execute();
    $selectStmt->bind_result($userPasswordHash);
    $selectStmt->fetch();

    if (password_verify($oldPassword, $userPasswordHash)) {
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $updateQuery = "UPDATE user SET user_passwordHash = ? WHERE user_id = ?";
        $updateStmt = $mysqli->prepare($updateQuery);
        $updateStmt->bind_param('si', $newPasswordHash, $userId);
        if ($updateStmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Ошибка обновления пароля: ' . $mysqli->error]);
        }
        $updateStmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Неверный старый пароль']);
    }
    $selectStmt->close();
    $mysqli->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Неверный метод запроса']);
}
?>
