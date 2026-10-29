import { useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../../public/content/Index.css';

const Home = ({ onNavigate }) => {
    const globeRef = useRef(null);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
        return () => AOS.refresh();
    }, []);

    useEffect(() => {
        // Не инициализируем глобус на мобильных (<= 991px)
        if (window.matchMedia('(max-width: 991.98px)').matches) return;

        if (window.UspcGlobe) {
            window.UspcGlobe.init();
        }
        return () => {
            if (globeRef.current && globeRef.current.__uspcGlobe) {
                globeRef.current.__uspcGlobe.destroy();
            }
        };
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f5f8' }}>
            <section className="py-5">
                <div className="container py-4 px-3">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6 text-center text-lg-start" data-aos="fade-right">
                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 mb-3 d-inline-flex align-items-center gap-2">
                                <i className="bi bi-mortarboard-fill"></i>
                                Учебный портал
                            </span>

                            <h1 className="display-4 fw-bold text-dark mb-3 lh-sm">
                                Усть-Лабинский{' '}
                                <span className="text-primary">социально-педагогический</span>{' '}
                                колледж
                            </h1>

                            <p className="fs-5 text-secondary mb-4">
                                Расписание занятий, преподаватели, учебные группы — в одном удобном портале.
                            </p>

                            <div className="d-flex gap-3 flex-wrap justify-content-center justify-content-lg-start">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
                                    className="btn btn-primary btn-lg rounded-pill px-4 d-flex align-items-center justify-content-center gap-2 fs-5"
                                >
                                    <i className="bi bi-arrow-right"></i>
                                    Личный кабинет
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                                    className="btn btn-outline-dark btn-lg rounded-pill px-4 d-flex align-items-center justify-content-center fs-5"
                                >
                                    Наши специальности
                                </a>
                            </div>

                            <div className="row g-4 pt-4 border-top border-white border-opacity-25">
                                <div className="col-6 col-md-3">
                                    <div className="h3 fw-bold mb-0">3000+</div>
                                    <div className="small opacity-50">Студентов</div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="h3 fw-bold mb-0">98%</div>
                                    <div className="small opacity-50">Трудоустройство</div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="h3 fw-bold mb-0">30+</div>
                                    <div className="small opacity-50">Лет опыта</div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="h3 fw-bold mb-0">1173+</div>
                                    <div className="small opacity-50">Зявлений на поступление</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 hero-globe-col" data-aos="fade-left">
                            <div className="hero-photo-wrap w-100">
                                <div className="hero-photo overflow-hidden" style={{ maxWidth: '100%' }}>
                                    <div
                                        ref={globeRef}
                                        className="uspc-globe-container w-100 h-100"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-5">
                <div className="container py-4 px-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4" data-aos="fade-up">
                        <div>
                            <h2 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                                <span className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                    <i className="bi bi-grid-1x2-fill"></i>
                                </span>
                                Разделы портала
                            </h2>
                            <p className="text-secondary mb-0">
                                Выберите нужный раздел и перейдите к просмотру информации.
                            </p>
                        </div>
                    </div>

                    <div className="row g-4">

                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="100">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate('teachers'); }}
                                className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card"
                            >
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 p-2 mb-3 align-self-start">
                                        <i className="bi bi-person-badge fs-4"></i>
                                    </div>
                                    <div className="card-illu mb-3">
                                        <img src="/Resources/teachers.png" alt="Расписание преподавателей" className="img-fluid rounded-3" />
                                    </div>
                                    <h3 className="h5 fw-bold mb-2">Расписание преподавателей</h3>
                                    <p className="text-secondary small mb-0">Занятия и учебная нагрузка преподавателей.</p>
                                    <div className="mt-auto pt-3 text-primary">
                                        <i className="bi bi-arrow-right fs-5"></i>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                                className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card"
                            >
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 p-2 mb-3 align-self-start">
                                        <i className="bi bi-calendar-week fs-4"></i>
                                    </div>
                                    <div className="card-illu mb-3">
                                        <img src="/Resources/weeks.png" alt="Расписание по неделям" className="img-fluid rounded-3" />
                                    </div>
                                    <h3 className="h5 fw-bold mb-2">Расписание кружков</h3>
                                    <p className="text-secondary small mb-0">Просмотр учебного расписания кружков.</p>
                                    <div className="mt-auto pt-3 text-primary">
                                        <i className="bi bi-arrow-right fs-5"></i>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="300">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate('groups'); }}
                                className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card"
                            >
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 p-2 mb-3 align-self-start">
                                        <i className="bi bi-people-fill fs-4"></i>
                                    </div>
                                    <div className="card-illu mb-3">
                                        <img src="/Resources/groups.png" alt="Расписание групп" className="img-fluid rounded-3" />
                                    </div>
                                    <h3 className="h5 fw-bold mb-2">Расписание групп</h3>
                                    <p className="text-secondary small mb-0">Расписание занятий для каждой учебной группы.</p>
                                    <div className="mt-auto pt-3 text-primary">
                                        <i className="bi bi-arrow-right fs-5"></i>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 mt-5">
                        <div className="card-body p-4">
                            <div className="row g-4 align-items-center">
                                <div className="col-6 col-md-3" data-aos="fade-right">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                            <i className="bi bi-mortarboard-fill"></i>
                                        </div>
                                        <div>
                                            <h5 className="h6 fw-bold mb-1 text-dark">Удобный доступ</h5>
                                            <p className="text-secondary small mb-0">С компьютера и телефона</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3" data-aos="fade-right">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                            <i className="bi bi-clock-fill"></i>
                                        </div>
                                        <div>
                                            <h5 className="h6 fw-bold mb-1 text-dark">Актуальная информация</h5>
                                            <p className="text-secondary small mb-0">Всегда под рукой</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3" data-aos="fade-left">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                            <i className="bi bi-people-fill"></i>
                                        </div>
                                        <div>
                                            <h5 className="h6 fw-bold mb-1 text-dark">Для студентов и преподавателей</h5>
                                            <p className="text-secondary small mb-0">Разные уровни доступа</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3" data-aos="fade-left">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                            <i className="bi bi-shield-fill-check"></i>
                                        </div>
                                        <div>
                                            <h5 className="h6 fw-bold mb-1 text-dark">Надёжная система</h5>
                                            <p className="text-secondary small mb-0">Ваши данные под защитой</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-4 px-3">
                    <div className="d-flex justify-content-between align-items-end mb-4" data-aos="fade-up">
                        <div>
                            <h2 className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                                <span className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-2">
                                    <i className="bi bi-newspaper"></i>
                                </span>
                                Недавние новости
                            </h2>
                            <p className="text-muted mb-0">Последние события из жизни колледжа.</p>
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('allnews'); }} className="text-purple text-decoration-none fw-semibold">
                            Все новости →
                        </a>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="100">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }} className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                                <div className="card-body p-4 d-flex flex-column">
                                    <img src="/Resources/NewsImage/News4.jpg" className="card-img-top rounded-3 mb-3" alt="МультиЛаб" style={{ height: '200px', objectFit: 'cover' }} />
                                    <p className="card-text text-muted small mb-2">02 июня 2026 г.</p>
                                    <h3 className="h5 fw-bold mb-2">"МУЛЬТИЛАБ ЭН+": МИССИЯ ВЫПОЛНЕНА! Грандиозный финал, который задает тренды!</h3>
                                </div>
                            </a>
                        </div>

                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }} className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                                <div className="card-body p-4 d-flex flex-column">
                                    <img src="/Resources/NewsImage/News5.jpg" className="card-img-top rounded-3 mb-3" alt="Церемония" style={{ height: '200px', objectFit: 'cover' }} />
                                    <p className="card-text text-muted small mb-2">03 июня 2026 г.</p>
                                    <h3 className="h5 fw-bold mb-2">Выпускники «МультиЛаб ЭН+» — новая орбита IT-поколения Кубани</h3>
                                </div>
                            </a>
                        </div>

                        <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="300">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }} className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                                <div className="card-body p-4 d-flex flex-column">
                                    <img src="/Resources/NewsImage/News6.jpg" className="card-img-top rounded-3 mb-3" alt="Помощь СВО" style={{ height: '200px', objectFit: 'cover' }} />
                                    <p className="card-text text-muted small mb-2">15 мая 2026 г.</p>
                                    <h3 className="h5 fw-bold mb-2">Наша помощь в зоне СВО: добро без границ</h3>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;