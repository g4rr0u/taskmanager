document.addEventListener('DOMContentLoaded', function () {
    const signUpForm = document.getElementById('signUpForm');
    const submitBtn = document.getElementById('submitBtn');

    signUpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var k_pattern = /^[А-Яа-яЁё\s\-]+$/;
        var l_pattern = /^[a-zA-Z\-]+$/;

        var user_fullname = document.getElementById('user_surname').value + " " + document.getElementById('user_name').value;

        var user_password = document.getElementById('user_password').value;
        var user_password_repeat = document.getElementById('user_password_repeat').value;

        var user_login = document.getElementById('user_login').value;

        var full_name_error = document.getElementById('nameError');
        var user_login_error = document.getElementById('logError');
        var pass_match_error = document.getElementById('passError');

        var name = false;
        var login = false;
        var pass = false;
        if (user_password === user_password_repeat) {
            pass = true;
        } else {
            pass_match_error.textContent = 'Пароли не совпадают';
            pass_match_error.style.display = 'block';
            setTimeout(function () {
                pass_match_error.style.display = 'none';
            }, 3000);
            return;
        }
        if (k_pattern.test(user_fullname)) {
            name = true;
        } else {
            full_name_error.textContent = 'Имя должно содержать только кириллицу';
            full_name_error.style.display = 'block';
            setTimeout(function () {
                full_name_error.style.display = 'none';
            }, 3000);
            return;
        }
        if (l_pattern.test(user_login)) {
            login = true;
        } else {
            user_login_error.textContent = 'Логин должен содержать только латиницу и дефис';
            user_login_error.style.display = 'block';
            setTimeout(function () {
                user_login_error.style.display = 'none';
            }, 3000);
            return;
        }

        if (name && login && pass) {
            const fullData = new FormData(signUpForm);
            const formDataObject = {};
            fullData.forEach((value, key) => {
                formDataObject[key] = value;
            });
            delete formDataObject.user_password_repeat;
            delete formDataObject.user_agreement;

            const formData = new FormData();
            for (const key in formDataObject) {
                formData.append(key, formDataObject[key]);
            }

            fetch('php/signUp.php', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('user_id', data.user_id);
                        localStorage.setItem('user_login', user_login);
                        localStorage.setItem('fullName', user_fullname);
                        window.location.href = 'teamMembership.html';
                    } else {
                        if (data.error === 'logORemail') {
                            pass_match_error.textContent = 'Такая почта или логин уже используются';
                            pass_match_error.style.display = 'block';
                            setTimeout(function () {
                                pass_match_error.style.display = 'none';
                            }, 3000);
                        } else {
                            console.log('Unknown error:', data.error);
                        }
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error.message);
                });
        }
    });
});
