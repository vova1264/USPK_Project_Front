
const Footer = ({ onNavigate }) => {
    const handleNavClick = (e, view) => {
        e.preventDefault(); // Отменяем перезагрузку страницы
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
                            <li className="mb-2">
                                <a href="tel:+78001234567" className="text-decoration-none text-light">
                                    <span className="me-2">📞</span> +7 (800) 123-45-67
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="mailto:info@uspk.ru" className="text-decoration-none text-light">
                                    <span className="me-2">✉️</span> info@uspk.ru
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Колонка 3: Поддержка */}
                    <div className="col-lg-4 col-md-12">
                        <h6 className="fw-bold mb-3 text-uppercase text-secondary">Поддержка</h6>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                {/* ✅ Используем обработчик onClick вместо href */}
                                <a 
                                    href="#support" 
                                    className="text-decoration-none text-light"
                                    onClick={(e) => handleNavClick(e, 'support')}
                                >
                                    Написать в поддержку
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-light">Инструкции и руководства</a>
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