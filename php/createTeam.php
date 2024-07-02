<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$uploadDirectory = 'C:\OSPanel\domains\taskmanager\media/'; 
$defaultAvatar = 'default_avatar.png'; // Путь к изображению по умолчанию

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $team_name = $_POST['team_name'];
    $team_description = $_POST['team_description'];
    $user_id = $_POST['user_id'];
    $team_creationDate = date('Y-m-d H:i:s'); 

    if(isset($_FILES['teamAvatar']) && $_FILES['teamAvatar']['error'] === UPLOAD_ERR_OK) {
        $avatarName = uniqid('team_avatar_') . '.' . pathinfo($_FILES['teamAvatar']['name'], PATHINFO_EXTENSION);
        $targetFile = $uploadDirectory . $avatarName;

        if(!move_uploaded_file($_FILES['teamAvatar']['tmp_name'], $targetFile)) {
            echo json_encode(['success' => false, 'error' => 'Ошибка при загрузке аватара команды']);
            exit;
        }
    } else {
        $avatarName = $defaultAvatar; // Используем изображение по умолчанию
    }

    $host = 'localhost';
    $username = 'root';
    $password = '';
    $dbname = 'tasker';

    $mysqli = new mysqli($host, $username, $password, $dbname);

    if ($mysqli->connect_error) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $mysqli->connect_error]));
    }

    $stmt_checkTeam = $mysqli->prepare("SELECT * FROM team WHERE team_name = ?");
    if ($stmt_checkTeam) {
        $stmt_checkTeam->bind_param("s", $team_name);
        $stmt_checkTeam->execute();
        $result = $stmt_checkTeam->get_result();
        if ($result->num_rows > 0) {
            echo json_encode(['success' => false, 'error' => 'Команда с таким названием уже существует']);
            exit;
        }

        $stmt_insertTeam = $mysqli->prepare("INSERT INTO team (team_avatarPath, team_name, team_description, team_creationDate) VALUES (?, ?, ?, ?)");
        if ($stmt_insertTeam) {
            $stmt_insertTeam->bind_param("ssss", $avatarName, $team_name, $team_description, $team_creationDate);
            $stmt_insertTeam->execute();

            if ($stmt_insertTeam->affected_rows > 0) {
                $team_id = $mysqli->insert_id;
                $role = 'leader';

                $stmt_membership = $mysqli->prepare("INSERT INTO teamMembership (user_id, team_id, role) VALUES (?, ?, ?)");
                if ($stmt_membership) {
                    $stmt_membership->bind_param("iis", $user_id, $team_id, $role);
                    $stmt_membership->execute();

                    if ($stmt_membership->affected_rows > 0) {
                        echo json_encode(['success' => true, 'message' => 'Команда успешно создана']);
                    } else {
                        echo json_encode(['success' => false, 'error' => 'Не удалось добавить пользователя в команду']);
                    }

                    $stmt_membership->close();
                } else {
                    echo json_encode(['success' => false, 'error' => 'Ошибка при подготовке запроса для teamMembership']);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'Не удалось создать команду']);
            }

            $stmt_insertTeam->close();
        } else {
            echo json_encode(['success' => false, 'error' => 'Ошибка при подготовке запроса для команды']);
        }

        $stmt_checkTeam->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при подготовке запроса для проверки команды']);
    }

    $mysqli->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Неверный метод запроса']);
}
?>
