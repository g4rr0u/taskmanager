document.addEventListener('DOMContentLoaded', function() {

    const logimForm = document.getElementById('loginForm');

    logimForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(logimForm);
        const user_login = document.getElementById('user_login').value;
        const error_info = document.getElementById('error_info');
        
        fetch('php/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                console.log(data);
                localStorage.setItem('user_login', user_login);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('user_email', data.user_email);
                localStorage.setItem('user_name', data.user_name);
                localStorage.setItem('user_surname', data.user_surname);
                if(data.user_role === 2){
                    window.location.href = 'admin-panel.html';
                } else {
                    window.location.href = 'cabinet.html';
                }
               
            } else {
                if(data.error === 'User not found') {
                    error_info.textContent = 'Пользователь не найден. Проверьте введенные данные';
                    error_info.style.display = 'block';
                    setTimeout(function() {
                        error_info.style.display = 'none';
                    }, 3000)
                } 
                if(data.error === 'Invalid password') {
                    error_info.textContent = 'Неверный пароль';
                    error_info.style.display = 'block';
                    setTimeout(function() {
                        error_info.style.display = 'none';
                    }, 3000) 
                }
            }
        })
    })
})