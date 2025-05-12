document.addEventListener('DOMContentLoaded', function () {

    // Загрузка ролей в формы добавления и редактирования
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

    loadRoles('roles');
    loadRoles('editRoles');

    // Загрузка пользователей в таблицу
    function fetchUsers() {
        fetch('/api/users_list')
            .then(response => response.json())
            .then(users => {
                const tbody = document.getElementById('users-table');
                tbody.innerHTML = '';
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

    fetchUsers();

    // Навигация и пользовательская панель (email, роли, меню)
    fetch('/api/user-info', { credentials: "include" })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка авторизации');
            return response.json();
        })
        .then(user => {
            // navbar
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userRoles').textContent = user.roles
                .map(role => role.name.replace('ROLE_', ''))
                .join(', ');

            const roles = user.roles.map(r => r.name);

            // показать ссылки по ролям
            if (roles.includes("ROLE_ADMIN")) {
                document.getElementById("admin-link").style.display = "block";
            }
            if (roles.includes("ROLE_USER") || roles.includes("ROLE_ADMIN")) {
                document.getElementById("user-link").style.display = "block";
            }

            // выделить активную ссылку
            const path = window.location.pathname;
            if (path.includes("admin.html")) {
                document.getElementById("admin-btn").classList.add("btn-primary", "font-weight-bold");
                document.getElementById("admin-btn").classList.remove("btn-link");
            }
            if (path.includes("user.html")) {
                document.getElementById("user-btn").classList.add("btn-primary", "font-weight-bold");
                document.getElementById("user-btn").classList.remove("btn-link");
            }
        })
        .catch(error => console.warn("Не авторизован:", error));


    // Обработка модального окна "Изменить пользователя"
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

    // Сохранение редактированного пользователя
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

        fetch('/api/edit', {
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
            })
            .catch(error => {
                console.error(error);
                alert("Ошибка при сохранении пользователя");
            });
    });

    // Открытие модального окна "Удалить пользователя"
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

    // Удаление пользователя
    document.getElementById('deleteUserForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
        const userId = document.getElementById('deleteUserId').value;

        fetch('/api/delete', {
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

        fetch('/api/add', {
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
});
