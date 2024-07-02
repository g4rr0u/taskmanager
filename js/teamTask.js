document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team_id');
    const userId = localStorage.getItem('user_id');
    let leader = false;

    document.getElementById('myTasks').addEventListener('click', function() {
        const taskRows = document.querySelectorAll('tr');
        
        
        taskRows.forEach(row => {
            row.style.display = 'none';
        });
        
        document.getElementById('thead').style.display = '';
        const userTaskRows = document.querySelectorAll(`tr.user-${userId}`);
        userTaskRows.forEach(row => {
            row.style.display = '';
        });
    });

    document.getElementById('allTasks').addEventListener('click', function() {
        const taskRows = document.querySelectorAll('tr');
        
        
        taskRows.forEach(row => {
            row.style.display = '';
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
            if (data.is_leader) {
                document.getElementById('addTaskButton').style.display = 'block';
                leader = true;
            } else {
                document.getElementById('addTaskButton').style.display = 'none';
            }
        } else {
            console.error('Ошибка при проверке роли пользователя:', data.error);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении запроса:', error);
    });

    fetch('php/getTasks.php?team_id=' + teamId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const tasks = data.tasks;
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';

            tasks.forEach(task => {
                const tr = document.createElement('tr');
                tr.classList.add(`user-${task.task_assignedUserID}`); 
                tr.setAttribute('data-task-id', task.task_id); 

                const keys = ['task_name', 'task_description', 'task_creationDate', 'task_dueDate', 'task_status', 'task_priority'];
                keys.forEach(key => {
                    const td = document.createElement('td');
                    td.textContent = task[key];
                    tr.appendChild(td);
                });

                const userFullName = document.createElement('td');
                userFullName.textContent = task.user_surname + ' ' + task.user_name;
                tr.appendChild(userFullName);

                const changeBtn = document.createElement('button');
                changeBtn.textContent = 'CHN';
                changeBtn.classList.add('showMore');
                changeBtn.setAttribute('data-task-id', task.task_id);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'DEL';
                deleteBtn.classList.add('showMore');
                deleteBtn.setAttribute('data-task-id', task.task_id);

                const tdChange = document.createElement('td');
                tdChange.appendChild(changeBtn);
                const tdDelete = document.createElement('td');
                tdDelete.appendChild(deleteBtn);
                if (leader) {
                    tr.appendChild(tdChange);
                    tr.appendChild(tdDelete);
                } else {
                    tr.appendChild(tdChange);
                }
                
                tbody.appendChild(tr);

                deleteBtn.addEventListener("click", function() {
                    const taskId = task.task_id;
                    showAlert("Вы уверены, что хотите удалить эту задачу?", function() {
                        deleteTask(taskId);
                    }, function() {});
                });

                changeBtn.addEventListener("click", function() {
                    const taskId = task.task_id;
                    if (leader || task.task_assignedUserID == userId) {
                        toggleStatusSelector(tr, task.task_status);
                    }
                });
            });
        } else {
            console.error('Ошибка при получении задач:', data.error);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении запроса:', error);
    });

    const deleteTask = function(taskId) {
        fetch("php/deleteTask.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "taskId=" + encodeURIComponent(taskId)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const taskRow = document.querySelector(`tr[data-task-id="${taskId}"]`);
                if (taskRow) {
                    taskRow.remove();
                }
                window.location.reload();
            } else {
                window.location.reload();
            }
        })
        .catch(error => {
            window.location.reload();
        });
    };

    const toggleStatusSelector = function(row, currentStatus) {
        const statusCell = row.children[4];
        const statusSelector = document.createElement('select');
        const statuses = ['open', 'in_progress', 'completed']; 

        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            if (status === currentStatus) {
                option.selected = true;
            }
            statusSelector.appendChild(option);
        });

        statusCell.innerHTML = '';
        statusCell.appendChild(statusSelector);

        statusSelector.addEventListener('change', function() {
            const newStatus = statusSelector.value;
            const taskId = row.getAttribute('data-task-id');
            updateTaskStatus(taskId, newStatus);
        });
    };
    const updateTaskStatus = function(taskId, newStatus) {
        const formData = new FormData();
        formData.append('task_id', taskId);
        formData.append('task_status', newStatus);
    
        fetch('php/updateTaskStatus.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                console.error('Ошибка при обновлении статуса задачи:', data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
    };
    

    fetch('php/getTeamMembers.php?team_id=' + teamId)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const users = data.users;
            const usersList = document.getElementById('usersList');
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.user_login;
                option.textContent = `${user.user_surname} ${user.user_name} (${user.user_login})`;
                usersList.appendChild(option);
            });
        } else {
            console.error('Ошибка при получении списка сотрудников:', data.error);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении запроса:', error);
    });

    document.getElementById('taskForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const taskDueDate = document.getElementById('taskDueDate').value;
        const taskPriority = document.getElementById('taskPriority').value;
        const usersList = document.getElementById('usersList').value;
        let currentDate = new Date();

        let year = currentDate.getFullYear();
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let day = String(currentDate.getDate()).padStart(2, '0');

        let formattedDate = `${year}-${month}-${day}`;

        const formData = new FormData();
        formData.append('task_name', taskName);
        formData.append('task_description', taskDescription);
        formData.append('task_creationDate', formattedDate);
        formData.append('task_dueDate', taskDueDate);
        formData.append('task_priority', taskPriority);
        formData.append('task_assignedUser', usersList);
        formData.append('task_TeamID', urlParams.get('team_id'));

        fetch('php/addTask.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
                alert('Задача успешно добавлена');
            } else {
                alert('Произошла ошибка при добавлении задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
            alert('Произошла ошибка при выполнении запроса');
        });
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
    fetch(`php/getTeamInfo.php?team_id=${teamId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const teamInfo = data.teamInfo;
            document.getElementById("team_name").textContent = teamInfo.team_name;
        } else {
            console.error('Ошибка при получении информации о команде:', data.error);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении запроса:', error);
    });
    document.getElementById("backToPage").addEventListener('click', function () {
        window.location.href = "teamMembership.html";
    });

    document.getElementById('logout').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = ("login.html");
    });

    const ucFirst = function(str) {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
    };

    const firstLetter = ucFirst(localStorage.getItem("user_login"));
    document.getElementById("firstLetter").textContent = firstLetter[0];
    document.getElementById("who").textContent = "Личный кабинет пользователя " + localStorage.getItem('user_login');

    document.getElementById('addTaskButton').addEventListener('click', function() {
        document.getElementById('newTaskCreation').style.display = 'block';
    });

    document.getElementById('cancelTask').addEventListener('click', function() {
        document.getElementById('newTaskCreation').style.display = 'none';
    });

    document.getElementById('taskForm').addEventListener('submit', function(event) {
        event.preventDefault();
        document.getElementById('newTaskCreation').style.display = 'none';
    });
});
