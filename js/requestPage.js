document.addEventListener('DOMContentLoaded', function () {
    function ucFirst(str) {
        if (!str) return str;
    
        return str[0].toUpperCase() + str.slice(1);
    }

    firstLetter = ucFirst(localStorage.getItem("user_login"))
    document.getElementById("firstLetter").textContent = firstLetter[0];
    document.getElementById("who").textContent = "Личный кабинет пользователя " + localStorage.getItem('user_login');
    
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team_id');
    const userId = localStorage.getItem('user_id');

    document.getElementById('logout').addEventListener('click', function() { 
        localStorage.clear();
        window.location.href = ("logIn.html")
    })

    document.getElementById("backToPage").addEventListener('click', function () {
        window.location.href = "teamMembership.html?team_id=" + teamId;
    });

    // Функция для создания элементов HTML для заявки на вступление в команду
    function createRequestElement(requestData) {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        const userAvatarDiv = document.createElement('div');
        userAvatarDiv.id = 'userAvatarRequest';
        const firstLetterSpan = document.createElement('span');
        firstLetterSpan.id = 'firstLetterRequest';
        firstLetterSpan.textContent = requestData.user_name[0].toUpperCase()
        userAvatarDiv.appendChild(firstLetterSpan);

        const resultTeamInfoDiv = document.createElement('div');
        resultTeamInfoDiv.id = 'resultTeamInfo';
        const userIdParagraph = document.createElement('p');
        userIdParagraph.id = 'user_id';
        userIdParagraph.textContent = requestData.user_id;
        const userNameSpan = document.createElement('span');
        userNameSpan.id = 'user_name';
        userNameSpan.textContent = requestData.user_surname + " " + requestData.user_name;
        const userLoginSpan = document.createElement('span');
        userLoginSpan.id = 'user_login';
        userLoginSpan.textContent = requestData.user_login;
        const buttonWrapperDiv = document.createElement('div');
        buttonWrapperDiv.id = 'buttonWrapper';
        const acceptButton = document.createElement('button');
        acceptButton.setAttribute('id', 'accept');
        acceptButton.textContent = 'Принять';
        acceptButton.dataset.requestId = requestData.request_id;
        const refuseButton = document.createElement('button');
        refuseButton.setAttribute('id','refuse');
        refuseButton.textContent = 'Отклонить';
        refuseButton.dataset.requestId = requestData.request_id;

        buttonWrapperDiv.appendChild(acceptButton);
        buttonWrapperDiv.appendChild(refuseButton);
        resultTeamInfoDiv.appendChild(userIdParagraph);
        resultTeamInfoDiv.appendChild(userNameSpan);
        resultTeamInfoDiv.appendChild(userLoginSpan);
        resultTeamInfoDiv.appendChild(buttonWrapperDiv);

        resultDiv.appendChild(userAvatarDiv);
        resultDiv.appendChild(resultTeamInfoDiv);

        return resultDiv;
    }
    function handleAcceptRequest(requestId) {
        fetch('php/acceptJoinRequest.php', {
            method: 'POST',
            body: JSON.stringify({ request_id: requestId }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
            } else {
                console.error('Ошибка при обработке запроса на сервере:', data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
    }
    document.getElementById('requestContainer').addEventListener('click', function(event) {
        if (event.target.id === 'refuse') {
            const requestId = event.target.dataset.requestId;
            fetch('php/rejectJoinRequest.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ request_id: requestId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    console.error('Ошибка при отклонении заявки:', data.error);
                }
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении запроса:', error);
            });
        }
    });
    fetch(`php/getTeamJoinRequests.php?team_id=${teamId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const requestContainer = document.getElementById('requestContainer');
                data.requests.forEach(requestData => {
                    const requestElement = createRequestElement(requestData);
                    requestContainer.appendChild(requestElement);

                    const acceptButton = requestElement.querySelector('#accept');
                    acceptButton.addEventListener('click', function() {
                        handleAcceptRequest(requestData.request_id);
                    });
                });
            } else {
                console.error('Ошибка при получении заявок на вступление в команду:', data.error);
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
            } else {
                console.error('Ошибка при получении информации о команде:', data.error);
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
});
