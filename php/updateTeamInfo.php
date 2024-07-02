<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tasker";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

$teamId = $_POST['teamId']; 
$teamName = $_POST['teamNameInput']; 
$teamDescription = $_POST['teamDescriptionInput']; 

if (!empty($_FILES['teamAvatarInput']['name'])) {
    $uploadDirectory = 'C:\OSPanel\domains\taskmanager\media/'; 

    $avatarName = uniqid('team_avatar_') . '.' . pathinfo($_FILES['teamAvatarInput']['name'], PATHINFO_EXTENSION);

    $targetFile = $uploadDirectory . $avatarName;

    if(move_uploaded_file($_FILES['teamAvatarInput']['tmp_name'], $targetFile)) {
        $sql = "UPDATE team SET team_name=?, team_description=?, team_avatarPath=? WHERE team_id=?";

        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param("sssi", $teamName, $teamDescription, $avatarName, $teamId);

            if ($stmt->execute()) {
                $response = array("success" => true);
                echo json_encode($response);
            } else {
                $response = array("success" => false, "error" => "Ошибка при обновлении информации о команде: " . $conn->error);
                echo json_encode($response);
            }

            $stmt->close();
        } else {
            $response = array("success" => false, "error" => "Ошибка при подготовке запроса: " . $conn->error);
            echo json_encode($response);
        }
    } else {
        $response = array("success" => false, "error" => "Произошла ошибка при загрузке файла.");
        echo json_encode($response);
    }
} else {
    $sql = "UPDATE team SET team_name=?, team_description=? WHERE team_id=?";

    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ssi", $teamName, $teamDescription, $teamId);

        if ($stmt->execute()) {
            $response = array("success" => true);
            echo json_encode($response);
        } else {
            $response = array("success" => false, "error" => "Ошибка при обновлении информации о команде: " . $conn->error);
            echo json_encode($response);
        }

        $stmt->close();
    } else {
        $response = array("success" => false, "error" => "Ошибка при подготовке запроса: " . $conn->error);
        echo json_encode($response);
    }
}

$conn->close();
?>
