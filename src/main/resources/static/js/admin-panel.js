
// Открытие модального окна для редактирования пользователя
document.addEventListener('DOMContentLoaded', function () {

    $('#editUserModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');
        const username = button.data('user-username');
        const email = button.data('user-email');
        const age = button.data('user-age');

        document.getElementById('editUserId').value = userId;
        document.getElementById('editUsername').value = username;
        document.getElementById('editEmail').value = email;
        document.getElementById('editAge').value = age;

    });

    // Обработка отправки формы редактирования пользователя
    document.getElementById('editUserForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
        const formData = new FormData(this);
        const selectedRoles = Array.from(document.getElementById('editRoles').selectedOptions)
            .map(option => option.value);

        const user = {
            id: formData.get('id'),
            username: formData.get('username'),
            email: formData.get('email'),
            age: formData.get('age'),
            password: formData.get('password'),
            rolesId: selectedRoles
        };

        fetch('/admin/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(user)
        })
            .then(() => {
                $('#editUserModal').modal('hide');
                fetchUsers();
                return fetch('/user-info');
            })
            .catch(error => {
                console.error(error);
                alert("Ошибка при сохранении пользователя");
            });
    });

    // Открытие модального окна для удаления пользователя
    $('#deleteUserModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const userId = button.data('user-id');
        const username = button.data('user-username');
        const email = button.data('user-email');
        const age = button.data('user-age');
        const roles = button.data('user-roles');

        document.getElementById('deleteUserId').value = userId;
        document.getElementById('deleteUsername').value = username;
        document.getElementById('deleteEmail').value = email;
        document.getElementById('deleteAge').value = age;
        document.getElementById('deleteRoles').value = roles;

    });

    document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
        const userId = document.getElementById('deleteUserId').value;

        fetch('/admin/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                [csrfHeader]: csrfToken
            },
            body: `id=${encodeURIComponent(userId)}`
        })
            .then(response => {
                if (response.status === 401) {
                    window.location.href = '/login';
                } else if (!response.ok) {
                    throw new Error("Ошибка при удалении");
                }
                $('#deleteUserModal').modal('hide');
                fetchUsers();
            })
            .catch(error => {
                console.error(error);
                alert("Ошибка при удалении пользователя");
            });
    });
});


// Список пользователей для главной таблицы
function fetchUsers() {
    fetch('/api/users_list')
        .then(response => response.json())
        .then(users => {
            const tbody = document.getElementById('users-table');
            tbody.innerHTML = ''; // очистка
            users.forEach(user => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.age}</td>
                            <td>${user.roles.map(r => r.name).join(', ')}</td>
                            <td>
                                <button class="btn btn-info" data-toggle="modal" data-target="#editUserModal"
                                    data-user-id="${user.id}"
                                    data-user-username="${user.username}"
                                    data-user-email="${user.email}"
                                    data-user-age="${user.age}">
                                    Изменить
                                </button>
                            </td>
                            <td>
                                <button class="btn btn-danger" data-toggle="modal" data-target="#deleteUserModal"
                                    data-user-id="${user.id}"
                                    data-user-username="${user.username}"
                                    data-user-email="${user.email}"
                                    data-user-age="${user.age}"
                                    data-user-roles="${user.roles.map(r => r.name).join(', ')}">
                                    Удалить
                                </button>
                            </td>
                        `;
                tbody.appendChild(tr);
            });
        });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();

});


// Список ролей для ADD и EDIT
function loadRoles(selectId) {
    fetch('/api/roles_list')
        .then(response => response.json())
        .then(roles => {
            const select = document.getElementById(selectId);
            select.innerHTML = '';
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Ошибка при загрузке ролей:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    loadRoles('roles');
    loadRoles('editRoles');
});

// Кнопка добавления пользователя
document.getElementById("addUserForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
    const formData = new FormData(this);
    const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        age: formData.get("age"),
        password: formData.get("password"),
        rolesId: Array.from(document.getElementById("roles").selectedOptions).map(opt => opt.value)
    };

    fetch('/admin/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            this.reset();
            fetchUsers();
        } else {
            response.text().then(text => {
                alert("Ошибка добавления: " + text);
                console.error("Ошибка от сервера:", text);
            });
        }
    });
});

// Заполнение navbar'а
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user-info')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userRoles').textContent = user.roles
                .map(role => role.name.replace('ROLE_', ''))
                .join(', ');
        })
        .catch(error => {
            console.error(error);
        });
});