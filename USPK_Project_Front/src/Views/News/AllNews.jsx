import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AllNews = ({ onNavigate }) => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
        return () => AOS.refresh();
    }, []);

    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-4 border-bottom pb-2 fw-bold">Все новости колледжа</h2>
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News4.jpg"
                                className="card-img-top"
                                alt="МультиЛаб"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">02 июня 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">"МУЛЬТИЛАБ ЭН+": МИССИЯ ВЫПОЛНЕНА! Грандиозный финал...</h5>
                                <p className="card-text mb-0">Сегодняшний день войдет в историю образовательного проекта «МультиЛаб ЭН+» как триумф идей и инноваций!</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News5.jpg"
                                className="card-img-top"
                                alt="Церемония"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">03 июня 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">Выпускники «МультиЛаб ЭН+» — новая орбита IT-поколения Кубани</h5>
                                <p className="card-text mb-0">Сегодня в Районном дворце культуры «Кубань» состоялась торжественная церемония вручения сертификатов.</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News6.jpg"
                                className="card-img-top"
                                alt="Помощь СВО"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">15 мая 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">Наша помощь в зоне СВО: добро без границ</h5>
                                <p className="card-text mb-0">Студенты нашего колледжа в очередной раз доказали, что неравнодушные и активная жизненная позиция — это главные черты нашей молодежи.</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News1.jpg"
                                className="card-img-top"
                                alt="Чемпионат Д1"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">12 февраля 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">В Усть-Лабинском социально-педагогическом колледже прошёл первый соревновательный день  ...</h5>
                                <p className="card-text mb-0">Сегодня участники сделали важный шаг — приступили к выполнению конкурсных заданий Регионального чемпионата «Профессионалы».</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News2.jpg"
                                className="card-img-top"
                                alt="Чемпионат Д2"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">13 февраля 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">Второй день «Д 2» чемпионата «Профессионалы» — в самом разгаре!</h5>
                                <p className="card-text mb-0">Сегодня в колледже кипела настоящая работа! Участники выложились на 100%: выполняли сложные конкурсные задания.</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="col-md-6 col-lg-4">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); onNavigate('NonExistent'); }}
                        className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark portal-card">
                        <div cclassName="card-body p-4 d-flex flex-column">
                            <img
                                src="../Resources/NewsImage/News3.jpg"
                                className="card-img-top"
                                alt="Итоги чемпионата"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body p-4">
                                <p className="card-text text-muted small mb-2">09 марта 2026 г.</p>
                                <h5 className="card-title fw-bold mb-3">Итоги «Профессионалы»: УСПК завоевал 13 медалей!</h5>
                                <p className="card-text mb-0">Усть-Лабинский социально-педагогический колледж показал блестящий результат: 13 медалей!</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AllNews;



