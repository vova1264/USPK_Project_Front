import { useEffect } from 'react'; // Импортируем useEffect

const Navbar = ({ currentUser, onLogout, onNavigate, isAdmin }) => {

    // Функция для принудительного закрытия меню на мобильных устройствах
    const closeMobileMenu = () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            // Убираем класс 'show', чтобы меню закрылось
            navbarCollapse.classList.remove('show');
        }
    };

    const handleNavClick = (view, e) => {
        if (e) e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
        }
        // Вызываем закрытие меню после навигации
        closeMobileMenu();
    };

    useEffect(() => {
        closeMobileMenu();
    }, [currentUser, isAdmin]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
                <a
                    className="navbar-brand d-flex align-items-center fs-1"
                    href="#"
                    onClick={(e) => handleNavClick('home', e)}
                >
                    <img className="bs-icon-sm bs-icon-rounded bs-icon-primary d-flex justify-content-center align-items-center me-2"
                        src="/Resources/favicon.png"
                        alt="Логотип"
                        style={{ width: '50px' }}
                    />
                    <span className="text-dark fs-4 fw-bold">УСПК<span className="text-primary fw-bold">WEB</span></span>
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="navbar-collapse collapse justify-content-between" id="navbarSupportedContent">
                    <ul className="navbar-nav flex-grow-1">
                        <li className="nav-item">
                            <a className="nav-link text-dark fs-5" href="#" onClick={(e) => handleNavClick('allnews', e)}>Новости</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle text-dark fs-5" href="#" id="studentDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Студенту
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="studentDropdown">
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Расписание</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('NonExistent', e)}>Образовательная среда</a></li>
                                <li><a className="dropdown-item" target="_blank" href="https://spo.rso23.ru/security/#/login">Сетевой город</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle text-dark fs-5" href="#" id="teacherDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Преподавателю
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="teacherDropdown">
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('teachers', e)}>Расписание</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('NonExistent', e)}>Учебно-методический портал</a></li>
                                <li><a className="dropdown-item" target="_blank" href="https://spo.rso23.ru/security/#/login">Сетевой город</a></li>
                            </ul>
                        </li>
                        {currentUser ? (
                            <>
                                {/* для всех аторизованных пользователей */}
                            </>
                        ) : null}
                        {isAdmin && (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle text-dark fs-5" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Администрирование
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('userList', e)}>Список пользователей</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('dashboard', e)}>Панель администратора</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('scheduleAdmin', e)}>Расписание</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Страница 3</a></li>
                                </ul>
                            </li>
                        )}
                    </ul>

                    <div className="navbar-nav ms-auto">
                        {currentUser ? (
                            <ul className="navbar-nav">
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle d-flex align-items-center text-dark fs-5"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        <span className="me-2">
                                            Профиль | {currentUser.email}
                                            {isAdmin && <span className="badge bg-primary ms-2">Admin</span>}
                                        </span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <a className="dropdown-item" href="#" onClick={(e) => handleNavClick('profile', e)}>
                                                Профиль
                                            </a>
                                        </li>
                                        <li>
                                            {/* Для выхода используем стрелочную функцию, чтобы передать событие и закрыть меню */}
                                            <button className="dropdown-item text-danger fs-5" onClick={(e) => {
                                                e.preventDefault();
                                                onLogout();
                                                closeMobileMenu();
                                            }}>
                                                Выйти
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        ) : (
                            <ul className="navbar-nav navbar-right">
                                <li className="nav-item">
                                    <a className="nav-link text-dark fs-5" href="#" onClick={(e) => handleNavClick('login', e)}>
                                        Выполнить вход
                                    </a>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;