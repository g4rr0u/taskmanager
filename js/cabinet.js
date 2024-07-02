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
        window.location.href = ("index.html");
    });

    const userSurnameSpan = document.getElementById('user_surname');
    const userNameSpan = document.getElementById('user_name');
    const userEmailSpan = document.getElementById('user_email');
    const user_id = localStorage.getItem("user_id");

    // Fetch user data from the server
    const formData = new FormData();
    formData.append('user_id', user_id);

    fetch('php/getUserData.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const userData = data.user;
            console.log(data.user)
            localStorage.setItem('user_surname', userData.user_surname);
            localStorage.setItem('user_name', userData.user_name);
            localStorage.setItem('user_email', userData.user_email);

            userSurnameSpan.textContent = userData.user_surname;
            userNameSpan.textContent = userData.user_name;
            userEmailSpan.textContent = userData.user_email;
        } else {
            console.error('Ошибка при получении данных пользователя:', data.message);
        }
    })
    .catch(error => {
        console.error('Произошла ошибка при выполнении fetch запроса:', error);
    });

    document.getElementById("backToPage").addEventListener('click', function () {
        window.location.href = "teamMembership.html";
    });

    document.getElementById('editUserData').addEventListener('click', function () {
        const modal = document.getElementById('changeUserData');
        modal.style.display = 'block';

        document.getElementById('new_surname').value = userSurnameSpan.textContent;
        document.getElementById('new_name').value = userNameSpan.textContent;
        document.getElementById('new_email').value = userEmailSpan.textContent;
    });

    document.getElementById('cancelEdit').addEventListener('click', function () {
        const modal = document.getElementById('changeUserData');
        modal.style.display = 'none';
    });

    document.getElementById('userNewData').addEventListener('submit', function (e) {
        e.preventDefault();

        const newSurname = document.getElementById('new_surname').value;
        const newName = document.getElementById('new_name').value;
        const newEmail = document.getElementById('new_email').value;

        const data = {
            user_surname: newSurname,
            user_name: newName,
            user_email: newEmail
        };

        fetch('php/changeUserData.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                alert('Данные успешно сохранены');
                localStorage.setItem('user_surname', newSurname);
                localStorage.setItem('user_name', newName);
                localStorage.setItem('user_email', newEmail);

                userSurnameSpan.textContent = newSurname;
                userNameSpan.textContent = newName;
                userEmailSpan.textContent = newEmail;

                const modal = document.getElementById('changeUserData');
                modal.style.display = 'none';
            } else {
                alert('Произошла ошибка при сохранении данных');
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении fetch запроса:', error);
        });
    });

    document.getElementById('changePasswordButton').addEventListener('click', function () {
        const modal = document.getElementById('changePasswordModal');
        modal.style.display = 'block';
    });

    document.getElementById('cancelPasswordChange').addEventListener('click', function () {
        const modal = document.getElementById('changePasswordModal');
        modal.style.display = 'none';
    });

    document.getElementById('passwordChangeForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const oldPassword = document.getElementById('old_password').value;
        const newPassword = document.getElementById('new_password').value;

        const data = {
            old_password: oldPassword,
            new_password: newPassword,
            user_id: user_id
        };

        fetch('php/changePassword.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                alert('Пароль успешно изменен');
                const modal = document.getElementById('changePasswordModal');
                modal.style.display = 'none';
            } else {
                alert('Произошла ошибка при смене пароля');
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении fetch запроса:', error);
        });
    });
});
