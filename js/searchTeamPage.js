document.addEventListener("DOMContentLoaded", function () {
    function searchTeams(query) {
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = "";

        const userId = localStorage.getItem("user_id"); 

        fetch("php/searchTeams.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "searchQuery=" + encodeURIComponent(query) + "&user_id=" + encodeURIComponent(userId) 
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(team => {
                const result = document.createElement("div");
                result.classList.add("result");

                const teamAvatar = document.createElement("img");
                teamAvatar.src = "media/" + team.team_avatarPath; 
                teamAvatar.alt = "Avatar";
                teamAvatar.setAttribute('id', 'teamAvatar')

                const resultTeamInfo = document.createElement("div");
                resultTeamInfo.id = "resultTeamInfo";

                const teamId = document.createElement("p");
                teamId.textContent = "ID: " + team.team_id;
                teamId.setAttribute('id', 'team_id')

                const teamName = document.createElement("span");
                teamName.textContent = team.team_name;

                const membersCount = document.createElement("span");
                membersCount.textContent = team.members_count + " человек";

                const requestJoin = document.createElement("button");
                requestJoin.textContent = "Подать заявку";
                requestJoin.setAttribute('id', 'requestJoin')

                requestJoin.addEventListener("click", function () {
                    const userId = localStorage.getItem("user_id"); 
                    const teamId = team.team_id; 

                    fetch("php/sendJoinRequest.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: "userId=" + encodeURIComponent(userId) + "&teamId=" + encodeURIComponent(teamId)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert("Заявка успешно отправлена");
                        } else {
                            alert("Ошибка при отправке заявки: " + data.error);
                        }
                    })
                    .catch(error => {
                        console.error("Ошибка при отправке запроса:", error);
                    });
                });

                resultTeamInfo.appendChild(teamId);
                resultTeamInfo.appendChild(teamName);
                resultTeamInfo.appendChild(requestJoin);

                result.appendChild(teamAvatar);
                result.appendChild(resultTeamInfo);

                resultContainer.appendChild(result);
            });
        })
        .catch(error => {
            console.error("Ошибка при отправке запроса:", error);
        });
    }

    document.getElementById("searchTeam").addEventListener("input", function () {
        const query = this.value.trim();
        if (query !== "") {
            searchTeams(query);
        }
    });
    
    document.getElementById("backToPage").addEventListener('click', function () {
        window.location.href = "teamMembership.html"
    })

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
