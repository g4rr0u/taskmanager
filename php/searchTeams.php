<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$username = 'root';
$password = '';
$db_name = 'tasker';

$mysqli = new mysqli($host, $username, $password, $db_name);

if($mysqli->connect_error){
    die("Connection failed: " . $mysqli->connect_error);
}

if(isset($_POST['searchQuery']) && isset($_POST['user_id'])) {
    $searchQuery = $_POST['searchQuery'];
    $userId = $_POST['user_id'];

    $stmt = $mysqli->prepare("SELECT team.* 
                              FROM team 
                              LEFT JOIN teamMembership ON team.team_id = teamMembership.team_id
                              WHERE team_name LIKE ? AND (teamMembership.user_id IS NULL OR teamMembership.user_id <> ?)");
    $searchQuery = '%' . $searchQuery . '%'; 
    $stmt->bind_param("si", $searchQuery, $userId);
    $stmt->execute();

    $result = $stmt->get_result();

    $searchResults = array();

    while ($row = $result->fetch_assoc()) {
        $searchResults[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($searchResults);
} else {
    $response = array('success' => false, 'error' => 'Поисковый запрос или user_id отсутствует');
    header('Content-Type: application/json');
    echo json_encode($response);
}

$stmt->close();
$mysqli->close();
?>
