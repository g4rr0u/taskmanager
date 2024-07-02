document.addEventListener('DOMContentLoaded', function() {

    function showAlert(message, onConfirm, onCancel) {
        const alertOverlay = document.createElement('div');
        alertOverlay.classList.add('alert-overlay');

        const alertBox = document.createElement('div');
        alertBox.classList.add('alert-box');

        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        alertBox.appendChild(messageParagraph);

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Подтвердить';
        confirmButton.addEventListener('click', function() {
            onConfirm();
            alertOverlay.remove();
        });
        alertBox.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Отмена';
        cancelButton.addEventListener('click', function() {
            onCancel();
            alertOverlay.remove();
        });
        alertBox.appendChild(cancelButton);

        alertOverlay.appendChild(alertBox);
        document.body.appendChild(alertOverlay);
    }

    function addTeamToPage(team) {
        const teamContainer = document.createElement('div');
        teamContainer.setAttribute('id', 'teamContainer');
        teamContainer.addEventListener('click', function () {
            window.location.href = "teamPage.html?team_id=" + team.team_id;

        });
        const backgroundImg = document.createElement('img');
        backgroundImg.style.objectFit = 'cover';
        backgroundImg.src = "media/" + team.team_avatarPath;
        // backgroundImg.alt = 'Background Image';
        teamContainer.appendChild(backgroundImg);

        const teamNameSpan = document.createElement('span');
        teamNameSpan.setAttribute('id', 'teamNameSpan');
        teamNameSpan.textContent = team.team_name;
        teamContainer.appendChild(teamNameSpan);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.id = 'buttonWrapper';

        const checkTasksBtn = document.createElement('button');
        checkTasksBtn.textContent = 'Посмотреть задачи';
        checkTasksBtn.id = 'checkTasks';
        checkTasksBtn.addEventListener('click', function (event) {
            event.stopPropagation();            

            window.location.href = "teamTasks.html?team_id=" + team.team_id;
        });
        buttonWrapper.appendChild(checkTasksBtn);

        const quitBtn = document.createElement('button');
        quitBtn.textContent = 'Покинуть команду';
        quitBtn.id = 'quit';
        quitBtn.addEventListener('click', function (event) {
            event.stopPropagation();            
            showAlert('Вы уверены, что хотите покинуть команду?', function() {
                const teamId = team.team_id;
                const userId = localStorage.getItem('user_id');

                fetch('php/quitTeam.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `team_id=${encodeURIComponent(teamId)}&user_id=${encodeURIComponent(userId)}`,
                    })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (data.teamDeleted) {
                            window.location.reload();
                        } else {
                            window.location.reload();
                        }
                    } else {
                        console.error('Ошибка при покидании команды:', data.error);
                        alert('Произошла ошибка при покидании команды');
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка при выполнении fetch запроса:', error);
                    alert('Произошла ошибка при выполнении запроса');
                });
            }, function() {
            });
        });
        buttonWrapper.appendChild(quitBtn);

        teamContainer.appendChild(buttonWrapper);

        document.getElementById('teamSection').appendChild(teamContainer);
    }

    const userId = localStorage.getItem('user_id');
    fetch('php/getUserTeams.php', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(team => {
            addTeamToPage(team);
        });
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении fetch запроса:', error);
    });

    document.getElementById('addTeam').addEventListener('click', function () {
        window.location.href = "addTeamPage.html";
    });

    document.getElementById('searchTeam').addEventListener('click', function () {
        window.location.href = "searchTeamPage.html";
    });

    document.getElementById('logout').addEventListener('click', function() { 
        localStorage.clear();
        window.location.href = ("login.html");
    });
    
    function ucFirst(str) {
        if (!str) return str;
            return str[0].toUpperCase() + str.slice(1);
        }
    firstLetter = ucFirst(localStorage.getItem("user_login"))
    document.getElementById("firstLetter").textContent = firstLetter[0];
    document.getElementById("who").textContent = "Личный кабинет пользователя " + localStorage.getItem('user_login');
    
    document.getElementById('logout').addEventListener('click', function() { 
        localStorage.clear();
        window.location.href = ("logIn.html")
    })
});
