document.addEventListener('DOMContentLoaded', function () {
    function ucFirst(str) {
        if (!str) return str;
        return str[0].toUpperCase() + str.slice(1);
    }

    const firstLetter = ucFirst(localStorage.getItem("user_login"));
    document.getElementById("firstLetter").textContent = firstLetter[0];
    document.getElementById("who").textContent = "Личный кабинет пользователя " + localStorage.getItem('user_login');

    document.getElementById('logout').addEventListener('click', function() { 
        localStorage.clear();
        window.location.href = ("logIn.html")
    });

    document.getElementById('teamAvatarInput').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('teamAvatarPreview').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("createTeam").addEventListener('click', function () {
        const formData = new FormData();
        const fileInput = document.getElementById('teamAvatarInput');
        if (fileInput.files.length > 0) {
            formData.append('teamAvatar', fileInput.files[0]);
        }
        formData.append('team_name', document.getElementById('team_name').value);
        formData.append('team_description', document.getElementById('team_description').value);
        formData.append('user_id', localStorage.getItem('user_id'));

        fetchData('php/createTeam.php', formData)
            .then(response => {
                if (response.success) {
                    window.location.href = "teamMembership.html"
                } else {
                    alert('Произошла ошибка при создании команды: ' + response.error);
                }
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении fetch запроса:', error);
            });
    });

    function fetchData(url, data) {
        return fetch(url, {
            method: 'POST',
            body: data,
        })
        .then(response => response.json());
    }

    document.getElementById("backToPage").addEventListener('click', function () {
        window.location.href = "teamMembership.html"
    });
});
