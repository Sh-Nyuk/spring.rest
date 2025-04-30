// Заполнение данных юзера
function loadUserInfo() {
    fetch('/api/user-info')
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось получить информацию о пользователе");
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('userId').textContent = user.id;
            document.getElementById('userUsername').textContent = user.username;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAge').textContent = user.age;
            document.getElementById('userRoles').textContent =
                user.roles.map(role => role.name.replace('ROLE_', '')).join(', ');
        })
        .catch(error => {
            console.error(error);
        });
}

// Заполнение navbar'а
document.addEventListener('DOMContentLoaded', loadUserInfo);

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user-info')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('userEmailNav').textContent = user.email;
            document.getElementById('userRolesNav').textContent = user.roles
                .map(role => role.name.replace('ROLE_', ''))
                .join(', ');
        })
        .catch(error => {
            console.error(error);
        });
});