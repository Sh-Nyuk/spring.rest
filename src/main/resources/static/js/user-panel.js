document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user-info', { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка получения информации о пользователе');
            }
            return response.json();
        })
        .then(user => {
            updateMainUserInfo(user);
            updateNavbarUserInfo(user);
            updateSidebarByRoles(user);
        })
        .catch(error => {
            console.error("Ошибка загрузки данных пользователя:", error);
        });
});

// Заполнение основной информации на странице (ID, имя, email и т.д.)
function updateMainUserInfo(user) {
    const el = (id, value) => {
        const e = document.getElementById(id);
        if (e) e.textContent = value;
    };

    el('userId', user.id);
    el('userUsername', user.username);
    el('userEmail', user.email);
    el('userAge', user.age);
    el('userRoles', user.roles.map(role => role.name.replace('ROLE_', '')).join(', '));
}

// Заполнение данных в navbar (email и роли)
function updateNavbarUserInfo(user) {
    const el = (id, value) => {
        const e = document.getElementById(id);
        if (e) e.textContent = value;
    };

    el('userEmailNav', user.email);
    el('userRolesNav', user.roles.map(role => role.name.replace('ROLE_', '')).join(', '));
}

// Отображение ссылок в боковой панели по ролям и подсветка активной
function updateSidebarByRoles(user) {
    const roles = user.roles.map(r => r.name);
    const show = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    };

    if (roles.includes("ROLE_ADMIN")) {
        show("admin-link");
    }
    if (roles.includes("ROLE_USER") || roles.includes("ROLE_ADMIN")) {
        show("user-link");
    }

    const path = window.location.pathname;
    const highlight = (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.add("btn-primary", "font-weight-bold");
            btn.classList.remove("btn-link");
        }
    };

    if (path.includes("admin.html")) {
        highlight("admin-btn");
    }
    if (path.includes("user.html")) {
        highlight("user-btn");
    }
}
