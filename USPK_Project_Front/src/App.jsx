import Navbar from './Views/Shared/Navbar';

function App() {
    return (
        <div className="App d-flex flex-column min-vh-100 app-bg">

            {/* ======================= NAVBAR ======================= */}
            <Navbar onNavigate={(view) => console.log('Переход на:', view)} />

            {/* ======================= HERO ======================= */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center g-5">

                        {/* Левая колонка */}
                        <div className="col-lg-6">
                            <div className="hero-badge">
                                <i className="bi bi-mortarboard-fill"></i>
                                Учебный портал
                            </div>

                            <h1 className="hero-title">
                                Усть-Лабинский{' '}
                                <span className="accent">социально-педагогический</span>{' '}
                                колледж
                            </h1>

                            <p className="hero-desc">
                                Расписание занятий, преподаватели, учебные группы — в одном удобном портале.
                            </p>

                            <div className="d-flex gap-3 flex-wrap">
                                <a href="#" onClick={(e) => e.preventDefault()} className="btn-hero-primary">
                                    <i className="bi bi-arrow-right"></i>
                                    Зарегистрироваться
                                </a>
                                <a href="#" onClick={(e) => e.preventDefault()} className="btn-hero-outline">
                                    Войти
                                </a>
                            </div>

                            {/* Точки-индикаторы */}
                            <div className="hero-dots">
                                <span className="active"></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        {/* Правая колонка: фото / видео */}
                        <div className="col-lg-6">
                            <div className="hero-photo-wrap">
                                <div className="hero-photo">
                                    <video autoPlay muted loop playsInline>
                                        <source src="/content/college.mp4" type="video/mp4" />
                                        Ваш браузер не поддерживает видео.
                                    </video>
                                </div>

                              
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ======================= РАЗДЕЛЫ ПОРТАЛА ======================= */}
            <section className="section-portal">
                <div className="container">

                    <div className="section-header">
                        <div>
                            <h2>
                                <span className="ico"><i className="bi bi-grid-1x2-fill"></i></span>
                                Разделы портала
                            </h2>
                            <p>Выберите нужный раздел и перейдите к просмотру информации.</p>
                        </div>
                        <a href="#" onClick={(e) => e.preventDefault()} className="link-all">
                            Все разделы <i className="bi bi-arrow-right"></i>
                        </a>
                    </div>

                    <div className="row g-4">

                        {/* Карточка 1 — Преподаватели */}
                        <div className="col-md-6 col-lg-4">
                            <a href="#" className="portal-card" onClick={(e) => e.preventDefault()}>
                                <div className="card-icon"><i className="bi bi-person-badge"></i></div>
                                <div className="card-illu">
                                    <img src="/content/teachers.png" alt="Расписание преподавателей" />
                                </div>
                                <h3>Расписание преподавателей</h3>
                                <p className="desc">Занятия и учебная нагрузка преподавателей.</p>
                                <div className="card-arrow"><i className="bi bi-arrow-right"></i></div>
                            </a>
                        </div>

                        {/* Карточка 2 — Недели */}
                        <div className="col-md-6 col-lg-4">
                            <a href="#" className="portal-card" onClick={(e) => e.preventDefault()}>
                                <div className="card-icon"><i className="bi bi-calendar-week"></i></div>
                                <div className="card-illu">
                                    <img src="/content/weeks.png" alt="Расписание по неделям" />
                                </div>
                                <h3>Расписание по неделям</h3>
                                <p className="desc">Просмотр учебного расписания по неделям.</p>
                                <div className="card-arrow"><i className="bi bi-arrow-right"></i></div>
                            </a>
                        </div>

                        {/* Карточка 3 — Группы */}
                        <div className="col-md-6 col-lg-4">
                            <a href="#" className="portal-card" onClick={(e) => e.preventDefault()}>
                                <div className="card-icon"><i className="bi bi-people-fill"></i></div>
                                <div className="card-illu">
                                    <img src="/content/groups.png" alt="Расписание групп" />
                                </div>
                                <h3>Расписание групп</h3>
                                <p className="desc">Расписание занятий для каждой учебной группы.</p>
                                <div className="card-arrow"><i className="bi bi-arrow-right"></i></div>
                            </a>
                        </div>

                    </div>

                    {/* ============== ПОЛОСА ПРЕИМУЩЕСТВ ============== */}
                    <div className="features-strip">

                        <div className="feature-item">
                            <div className="fi-icon"><i className="bi bi-mortarboard-fill"></i></div>
                            <div className="fi-text">
                                <h5>Удобный доступ</h5>
                                <p>С компьютера и телефона</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="fi-icon"><i className="bi bi-clock-fill"></i></div>
                            <div className="fi-text">
                                <h5>Актуальная информация</h5>
                                <p>Всегда под рукой</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="fi-icon"><i className="bi bi-people-fill"></i></div>
                            <div className="fi-text">
                                <h5>Для студентов и преподавателей</h5>
                                <p>Разные уровни доступа</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="fi-icon"><i className="bi bi-shield-fill-check"></i></div>
                            <div className="fi-text">
                                <h5>Надёжная система</h5>
                                <p>Ваши данные под защитой</p>
                            </div>
                        </div>

                        <div className="features-handwrite">
                            УСПК —<br />это мы ♡
                        </div>

                    </div>

                </div>
            </section>

            {/* ======================= Подвал ======================= */}
            <footer className="uspk-footer mt-auto">
                <div className="container">
                    <div className="fbrand">
                        USPK<span>Project</span>
                    </div>
                    <div>&copy; 2026 Усть-Лабинский социально-педагогический колледж</div>
                </div>
            </footer>

        </div>
    );
}

export default App;