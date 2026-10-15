const Navbar = ({ onNavigate }) => {
    const handleNavClick = (view, e) => {
        if (e) e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg uspk-navbar">
            <div className="container-fluid px-4">

                {/* Логотип */}
                <a
                    className="navbar-brand"
                    href="#"
                    onClick={(e) => handleNavClick('home', e)}
                >
                    <span className="brand-mark">U</span>
                    <span className="brand-text">
                        <span className="uspk">USPK</span>
                        <span className="project">Project</span>
                    </span>
                </a>

              
                <button
                    className="navbar-toggler border-0 text-white"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <i className="bi bi-list" style={{ fontSize: '1.6rem', color: '#fff' }}></i>
                </button>

                {/* Меню */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a
                                className="nav-link active"
                                href="#"
                                onClick={(e) => handleNavClick('home', e)}
                            >
                                Главная
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => handleNavClick('schedule', e)}
                            >
                                Расписание
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => handleNavClick('teachers', e)}
                            >
                                Преподаватели
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => handleNavClick('groups', e)}
                            >
                                Группы
                            </a>
                        </li>
                    </ul>

                    {/* Правый блок: поиск + кнопки */}
                    <div className="d-flex align-items-center gap-3 flex-wrap">

                        {/* Поиск */}
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input type="text" placeholder="Поиск..." />
                        </div>

                        {/* Кнопка "Войти" */}
                        <a
                            href="#"
                            className="btn-nav-login"
                            onClick={(e) => handleNavClick('login', e)}
                        >
                            <i className="bi bi-person"></i>
                            Войти
                        </a>

                        {/* Кнопка "Регистрация" */}
                        <a
                            href="#"
                            className="btn-nav-register"
                            onClick={(e) => handleNavClick('register', e)}
                        >
                            Регистрация
                        </a>
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;