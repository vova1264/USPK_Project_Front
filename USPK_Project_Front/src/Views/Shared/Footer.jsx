const Footer = ({ onNavigate }) => {
    const handleNavClick = (e, view) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
        }
    };

    return (
        <footer className="bg-dark text-white py-4 mt-auto">
            <div className="container">
                <div className="row gy-4">
                    {/* Колонка 1: Бренд и описание */}
                    <div className="col-lg-4 col-md-6">
                        <h5 className="fw-bold mb-3 text-white">
                            USPK<span className="text-primary">Project</span>
                        </h5>
                        <p className="text-secondary small mb-0">
                            Усть-Лабинский социально-педагогический колледж.
                            Образовательная платформа.
                        </p>
                    </div>

                    {/* Колонка 2: Контакты */}
                    <div className="col-lg-4 col-md-6">
                        <h6 className="fw-bold mb-3 text-uppercase text-secondary">Контакты</h6>
                        <ul className="list-unstyled mb-0">
                            {/* Адрес */}
                            <li className="mb-2 d-flex align-items-start">
                                <i className="bi bi-geo-alt me-2 mt-1 text-secondary"></i>
                                <span className="text-secondary small">
                                    Краснодарский край, Усть-Лабинский район,<br />
                                    г. Усть-Лабинск, ул. Площадь Революции 15
                                </span>
                            </li>

                            {/* Телефон */}
                            <li className="mb-2 d-flex align-items-center">
                                <i className="bi bi-telephone me-2 text-secondary"></i>
                                <a href="tel:+78613552055" className="text-decoration-none text-light">
                                    +7 (86135) 5-20-55
                                </a>
                            </li>

                            {/* Почта */}
                            <li className="mb-2 d-flex align-items-center">
                                <i className="bi bi-envelope me-2 text-secondary"></i>
                                <a href="mailto:uspk@inbox.ru" className="text-decoration-none text-light">
                                    uspk@inbox.ru
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Колонка 3: Поддержка */}
                    <div className="col-lg-4 col-md-12">
                        <h6 className="fw-bold mb-3 text-uppercase text-secondary">Поддержка</h6>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <a
                                    href="#support"
                                    className="text-decoration-none text-light"
                                    onClick={(e) => handleNavClick(e, 'support')}
                                >
                                    Написать в поддержку
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="help"
                                    className="text-decoration-none text-light"
                                    onClick={(e) => handleNavClick(e, 'help')}
                                >
                                    Инструкции и руководства</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Нижняя линия: Копирайт */}
                <hr className="border-secondary my-4" />
                <div className="row align-items-center">
                    <div className="col-md-12 text-center text-md-start">
                        <small className="text-secondary">
                            &copy; 2026 Усть-Лабинский социально-педагогический колледж. Все права защищены.
                        </small>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;