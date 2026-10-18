const Navbar = ({ currentUser, onLogout, onNavigate, isAdmin }) => {
    const handleNavClick = (view, e) => {
        if (e) e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
        }
    };
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom box-shadow mb-3 py-3">
            <div className="container">
                <a
                    className="navbar-brand d-flex align-items-center fs-1"
                    href="#"
                    onClick={(e) => handleNavClick('home', e)}
                >
                    <img className="bs-icon-sm bs-icon-rounded bs-icon-primary d-flex justify-content-center align-items-center me-2"
                        src="https://fin-sales.ru/favicon.ico"
                        alt="Логотип"
                        style={{ width: '50px' }}
                    />
                    <span className="text-white fs-4 fw-bold">УСПК<span className="text-primary fw-bold">WEB</span></span>
                </a>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                    <ul className="navbar-nav flex-grow-1">
                      {/*   <li className="nav-item">
                            <a className="nav-link fs-5" href="#" onClick={(e) => handleNavClick('groups', e)}>Новости</a>
                        </li> */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle fs-5" href="#" id="studentDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Студенту
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="studentDropdown">
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Расписание</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Образовательная среда</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Тор Моя Школа</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle fs-5" href="#" id="teacherDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Преподавателю
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="teacherDropdown">
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('teachers', e)}>Расписание</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Учебно-методический портал</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Тор Моя Школа</a></li>
                            </ul>
                        </li>
                        {currentUser ? (
                            <>
                                {/* для всех аторизованных пользователей */}
                            </>
                        ) : null}
                        {isAdmin && (
                            /* меню к левома краю*/
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle fs-5" href="#" id="teacherDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Администрирование
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="teacherDropdown">
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('userList', e)}>Список пользователей</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('dashboard', e)}>Панель администратора</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={(e) => handleNavClick('groups', e)}>Страница 3</a></li>
                                </ul>
                            </li>
                        )}
                    </ul>

                    {/* меню к левома краю*/}
                    <div className="navbar-nav ms-auto">
                        {currentUser ? (
                            <ul className="navbar-nav">
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle d-flex align-items-center fs-5"
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
                                            <button className="dropdown-item text-danger fs-5" onClick={onLogout}>
                                                Выйти
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        ) : (
                            <ul className="navbar-nav navbar-right">
                                <li className="nav-item">
                                    <a className="nav-link fs-5" href="#" onClick={(e) => handleNavClick('login', e)}>
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