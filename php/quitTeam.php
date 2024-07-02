<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$user_id = $_POST['user_id'];
$team_id = $_POST['team_id'];

$host = 'localhost';
$username = 'root';
$password = '';
$db_name = 'tasker';

$mysqli = new mysqli($host, $username, $password, $db_name);

if($mysqli->connect_error){
    die("Connection failed: " . $mysqli->connect_error);
}

// Удаляем участника из команды
$stmt_removeMember = $mysqli->prepare("DELETE FROM teamMembership WHERE user_id = ? AND team_id = ?");
if($stmt_removeMember) {
    $stmt_removeMember->bind_param("ii", $user_id, $team_id);
    $stmt_removeMember->execute();
    $stmt_removeMember->close();
} else {
    $response = array('success' => false, 'error' => 'Ошибка при удалении участника из команды');
    echo json_encode($response);
    exit();
}

$stmt_removeRequests = $mysqli->prepare("DELETE FROM teamJoinRequests WHERE joiningUser_id = ? AND joiningTeam_id = ?");
if($stmt_removeRequests) {
    $stmt_removeRequests->bind_param("ii", $user_id, $team_id);
    $stmt_removeRequests->execute();
    $stmt_removeRequests->close();
} else {
    $response = array('success' => false, 'error' => 'Ошибка при удалении записей из teamJoinRequests');
    echo json_encode($response);
    exit();
}

$stmt_checkMembers = $mysqli->prepare("SELECT COUNT(*) AS member_count FROM teamMembership WHERE team_id = ?");
if($stmt_checkMembers) {
    $stmt_checkMembers->bind_param("i", $team_id);
    $stmt_checkMembers->execute();
    $result = $stmt_checkMembers->get_result();
    $row = $result->fetch_assoc();
    $member_count = $row['member_count'];

    $stmt_checkMembers->close();
} else {
    $response = array('success' => false, 'error' => 'Ошибка при подготовке запроса для проверки участников команды');
    echo json_encode($response);
    exit();
}

if ($member_count == 0) {
    $stmt_deleteTeam = $mysqli->prepare("DELETE FROM team WHERE team_id = ?");
    if($stmt_deleteTeam) {
        $stmt_deleteTeam->bind_param("i", $team_id);
        $stmt_deleteTeam->execute();
        $stmt_deleteTeam->close();

        $response = array('success' => true, 'teamDeleted' => true);
        echo json_encode($response);
    } else {
        $response = array('success' => false, 'error' => 'Ошибка при удалении команды');
        echo json_encode($response);
    }
} else {
    // В команде остались другие участники
    $response = array('success' => true, 'teamDeleted' => false);
    echo json_encode($response);
}

$mysqli->close();
?>
