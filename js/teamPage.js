document.addEventListener('DOMContentLoaded', function() {
    function ucFirst(str) {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team_id');
    const userId = localStorage.getItem('user_id');

    const editTeamButton = document.getElementById('editTeam');
    const cancelEditTeamButton = document.getElementById('cancel');
    const editTeamForm = document.getElementById('editTeamForm');
    const alertOverlay = document.querySelector('.alert-overlay');

    cancelEditTeamButton.addEventListener('click', function() {
        editTeamForm.style.display = 'none';
        alertOverlay.style.display = 'none';
    });

    editTeamButton.addEventListener('click', function() {
        editTeamForm.style.display = 'block';
        alertOverlay.style.display = 'block';
        document.getElementById('teamNameInput').value = document.getElementById('team_name').textContent;
        document.getElementById('teamDescriptionInput').value = document.getElementById('team_description').textContent;
    });

    const teamEditForm = document.getElementById('teamEditForm');

    teamEditForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(teamEditForm);
        formData.append('teamId', teamId);

        fetch('php/updateTeamInfo.php', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                alert('Ошибка при обновлении информации о команде: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
            alert('Произошла ошибка при обновлении информации о команде');
        });
    });

    fetch('php/checkUserRole.php', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, team_id: teamId }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('is_leader', data.is_leader);
            if (data.is_leader) {
                document.getElementById('teamLeaderManageButtons').style.display = 'flex';
                const deleteButtons = document.getElementsByClassName('deleteBtn');
                for (let i = 0; i < deleteButtons.length; i++) {
                    deleteButtons[i].style.display = 'inline-block';
                }
            }
        } else {
            console.error('Ошибка при проверке роли пользователя:', data.error);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении запроса:', error);
    });

    fetch(`php/getTeamInfo.php?team_id=${teamId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const teamInfo = data.teamInfo;
                document.getElementById("teamName").textContent = teamInfo.team_name;
                document.getElementById("team_name").textContent = teamInfo.team_name;
                document.getElementById("team_avatar").src = "media/" + teamInfo.team_avatarPath;
                document.getElementById("team_creationDate").textContent = teamInfo.team_creationDate;
                document.getElementById("team_description").textContent = teamInfo.team_description;

                const tbody = document.querySelector('tbody');
                tbody.innerHTML = '';
                teamInfo.members.forEach(member => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${member.user_name}</td>
                        <td>${member.user_login}</td>
                        <td>${member.role}</td>
                        <td><button class="deleteBtn" data-user-id="${member.user_id}" style="display: none;">x</button></td>
                    `;
                    tbody.appendChild(tr);
                });

                const isLeader = localStorage.getItem('is_leader') === 'true';
                if (isLeader) {
                    const deleteButtons = document.getElementsByClassName('deleteBtn');
                    for (let i = 0; i < deleteButtons.length; i++) {
                        deleteButtons[i].style.display = 'inline-block';
                    }
                }
            } else {
                console.error('Ошибка при получении информации о команде:', data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });

    document.getElementById('deleteTeam').addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите удалить команду?')) {
            const formData = new FormData();
            formData.append('team_id', teamId);

            fetch('php/deleteTeam.php', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'teamMembership.html';
                } else {
                    alert('Ошибка при удалении команды: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении запроса:', error);
                alert('Произошла ошибка при удалении команды');
            });
        }
    });

    const showAlert = function(message, onConfirm, onCancel) {
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
    };

    document.getElementById('logout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    document.getElementById('backToPage').addEventListener('click', function() {
        window.location.href = 'teamMembership.html';
    });

    document.getElementById('showRequest').addEventListener('click', function() {
        window.location.href = 'teamRequest.html?team_id=' + teamId;
    });

    document.querySelector('tbody').addEventListener('click', function(event) {
        if (event.target.classList.contains('deleteBtn')) {
            const userIdToDelete = event.target.dataset.userId;
            const isLeader = localStorage.getItem('is_leader') === 'true';

            if (isLeader) {
                const formData = new FormData();
                formData.append('team_id', teamId);
                formData.append('user_id', userIdToDelete);

                fetch('php/deleteUserFromTeam.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        alert('Ошибка при удалении пользователя: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Произошла ошибка при выполнении запроса:', error);
                    alert('Произошла ошибка при удалении пользователя');
                });
            } else {
                window.location.reload();
            }
        }
    });

    const firstLetter = ucFirst(localStorage.getItem('user_login'));
    document.getElementById('firstLetter').textContent = firstLetter[0];
    document.getElementById('who').textContent = 'Личный кабинет пользователя ' + localStorage.getItem('user_login');

    document.getElementById('logout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'logIn.html';
    });
});
