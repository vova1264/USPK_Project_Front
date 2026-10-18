// src/components/SupportPage.jsx
import { useState } from 'react';

const FaqItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header">
                <button
                    className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                >
                    {question}
                </button>
            </h2>

            <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                <div className="accordion-body">{answer}</div>
            </div>
        </div>
    );
};

const SupportPage = ({ onNavigate }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const faq = [
        {
            q: 'Как найти расписание своей группы?',
            a: 'Откройте вкладку «Студенту» и выберите свою группу из списка.',
        },
        {
            q: 'Как связаться с поддержкой?',
            a: 'Напишите на cloud.wrld@mail.ru — отвечаем в рабочие дни.',
        },
        {
            q: 'Кто авторы этого проекта?',
            a: 'Проект разработан в рамках кружка WEB-разработки.',
        },
    ];

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);
    const handleNavClick = (e, view) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(view);
        }
    };
    return (
        <div className="d-flex flex-column gap-4 container">
            <div className="card shadow-sm border-0 w-100">
                <div className="card-body p-4">
                    <h3 className="mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-question-circle text-primary"></i>
                        Частые вопросы
                    </h3>

                    <div className="accordion">
                        {faq.map((item, i) => (
                            <FaqItem
                                key={i}
                                question={item.q}
                                answer={item.a}
                                isOpen={openIndex === i}
                                onToggle={() => toggle(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="card shadow-sm border-0 w-100">
                <div className="card-body p-4">
                    <h3 className="mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-life-preserver text-primary"></i>
                        Поддержка
                    </h3>

                    <p className="text-muted mb-4">
                        Если у вас возникли проблемы с расписанием или вы нашли ошибку — напишите нам.
                    </p>

                    <ul className="list-unstyled mb-4">
                        <li className="mb-2 d-flex align-items-center gap-2">
                            <i className="bi bi-envelope-fill text-secondary"></i>
                            <a href="mailto:uspk@inbox.ru" className="text-decoration-none">
                                uspk@inbox.ru
                            </a>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <i className="bi bi-clock-fill text-secondary"></i>
                            <span>Пн–Пт, 9:00–18:00</span>
                        </li>
                    </ul>

                    <a href="#support"
                        className="btn btn-primary"
                        onClick={(e) => handleNavClick(e, 'support')}
                    >
                        <i className="bi bi-send me-2"></i>
                        Написать в поддержку
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;