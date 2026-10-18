import { useState, useRef } from 'react';

// ---------- Справочники ----------
const ROLES = [
    { value: 'student', label: 'Студент' },
    { value: 'teacher', label: 'Преподаватель' },
    { value: 'applicant', label: 'Абитуриент' },
    { value: 'parent', label: 'Родитель / законный представитель' },
    { value: 'staff', label: 'Сотрудник колледжа' },
    { value: 'other', label: 'Другое' },
];

const CATEGORIES = [
    { value: 'login', label: 'Вход в личный кабинет / пароль' },
    { value: 'schedule', label: 'Расписание и оценки' },
    { value: 'content', label: 'Ошибка на странице или в материалах' },
    { value: 'admission', label: 'Подача документов / приёмная кампания' },
    { value: 'files', label: 'Загрузка и скачивание файлов' },
    { value: 'display', label: 'Сайт отображается некорректно' },
    { value: 'other', label: 'Другой вопрос' },
];

const PRIORITIES = [
    { value: 'low', label: 'Низкий' },
    { value: 'normal', label: 'Обычный' },
    { value: 'high', label: 'Высокий (работа заблокирована)' },
];

const FAQ = [
    {
        q: 'Не могу войти в личный кабинет',
        a: 'Проверьте раскладку клавиатуры и Caps Lock. Если пароль утерян, выберите тему «Вход в личный кабинет / пароль» — мы сбросим его и вышлем новый на вашу почту.',
    },
    {
        q: 'Страница не открывается или выглядит «сломанной»',
        a: 'Обновите страницу сочетанием Ctrl + F5 и попробуйте другой браузер. Если проблема осталась — пришлите нам адрес страницы и название браузера.',
    },
    {
        q: 'Как быстро мне ответят?',
        a: 'Обычно в течение одного рабочего дня. Обращения с высоким приоритетом рассматриваются в первую очередь.',
    },
];

// ---------- Проверка полей ----------
const LIMITS = {
    nameMin: 2,
    nameMax: 100,
    subjectMin: 3,
    subjectMax: 150,
    messageMin: 10,
    messageMax: 5000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
    const errors = {};
    const name = values.name.trim();
    const subject = values.subject.trim();
    const message = values.message.trim();

    if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
        errors.name = `Укажите имя (от ${LIMITS.nameMin} до ${LIMITS.nameMax} символов)`;
    }
    if (!EMAIL_RE.test(values.email.trim())) {
        errors.email = 'Укажите корректный адрес электронной почты';
    }
    if (!values.role) errors.role = 'Выберите, кто вы';
    if (!values.category) errors.category = 'Выберите тему обращения';
    if (subject.length < LIMITS.subjectMin || subject.length > LIMITS.subjectMax) {
        errors.subject = `Тема должна содержать от ${LIMITS.subjectMin} до ${LIMITS.subjectMax} символов`;
    }
    if (message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) {
        errors.message = `Опишите проблему подробнее (от ${LIMITS.messageMin} до ${LIMITS.messageMax} символов)`;
    }
    if (!values.consent) {
        errors.consent = 'Необходимо согласие на обработку персональных данных';
    }
    return errors;
}

const INITIAL = {
    name: '',
    email: '',
    role: '',
    category: '',
    priority: 'normal',
    subject: '',
    message: '',
    consent: false,
    website: '', // honeypot
};

export default function SupportForm() {
    const [values, setValues] = useState(INITIAL);
    const [touched, setTouched] = useState({});
    const [serverErrors, setServerErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [errorText, setErrorText] = useState('');
    const [ticket, setTicket] = useState('');
    const [confirmationSent, setConfirmationSent] = useState(true);
    const [openFaq, setOpenFaq] = useState(null); // Для аккордеона
    const formRef = useRef(null);

    const clientErrors = validate(values);
    const errors = { ...serverErrors, ...clientErrors };
    const showError = (field) => Boolean(touched[field] && errors[field]);
    const sending = status === 'sending';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
        if (serverErrors[name]) {
            setServerErrors((s) => {
                const newErrors = { ...s };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (e) => {
        setTouched((t) => ({ ...t, [e.target.name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.keys(clientErrors).length) {
            setTouched(Object.fromEntries(Object.keys(INITIAL).map((k) => [k, true])));
            formRef.current?.querySelector('.is-invalid')?.focus();
            return;
        }

        setStatus('sending');
        setErrorText('');
        setServerErrors({});

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, pageUrl: document.referrer || window.location.href }),
                signal: controller.signal,
            });

            let payload = {};
            try {
                payload = await res.json();
            } catch (e) {
                console.error("Не удалось прочитать ответ сервера как JSON", e);
            }

            if (res.ok && payload.ok) {
                setTicket(payload.ticket || 'Без номера');
                setConfirmationSent(payload.confirmationSent !== false);
                setStatus('success');
                return;
            }

            if (payload.errors) setServerErrors(payload.errors);
            setErrorText(payload.error || 'Не удалось отправить обращение. Попробуйте ещё раз.');
            setStatus('error');
        } catch (err) {
            setErrorText(
                err.name === 'AbortError'
                    ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
                    : 'Нет связи с сервером. Проверьте подключение к интернету.'
            );
            setStatus('error');
        } finally {
            clearTimeout(timer);
        }
    };

    const reset = () => {
        setValues(INITIAL);
        setTouched({});
        setServerErrors({});
        setErrorText('');
        setStatus('idle');
    };

    return (
        <div className="bg-light pb-5">
            {/* Шапка страницы (Hero) на стандартном синем фоне Bootstrap */}
            <header className="bg-dark text-white py-5 mb-4 shadow-sm w-100">
                <div className="container">
                    <h1 className="display-5 fw-bold mb-3">Техническая поддержка</h1>
                    <p className="lead mb-0 text-light opacity-75">
                        Что-то не работает на сайте колледжа? Опишите проблему — мы получим обращение
                        и ответим вам на электронную почту.
                    </p>
                </div>
            </header>

            <main className="container">
                <div className="row g-4">
                    {/* Левая колонка: Форма */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4 p-md-5">
                                {status === 'success' ? (
                                    <div className="text-center py-5" role="status">
                                        <div className="display-1 text-success mb-3" aria-hidden="true">✓</div>
                                        <h2 className="h4 mb-3">Обращение отправлено</h2>
                                        <p className="mb-2">
                                            Номер заявки: <strong className="text-primary">{ticket}</strong>
                                        </p>
                                        <p className="text-muted mb-4">
                                            {confirmationSent
                                                ? `Мы отправили подтверждение на ${values.email}. Ответ придёт на этот же адрес.`
                                                : `Ответ придёт на ${values.email}. Сохраните номер заявки.`}
                                        </p>
                                        <button className="btn btn-primary" onClick={reset}>
                                            Отправить ещё одно обращение
                                        </button>
                                    </div>
                                ) : (
                                    <form ref={formRef} noValidate onSubmit={handleSubmit} aria-busy={sending}>
                                        <h2 className="h4 mb-4">Напишите нам</h2>

                                        {status === 'error' && (
                                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                {errorText}
                                                <button type="button" className="btn-close" onClick={() => setStatus('idle')} aria-label="Close"></button>
                                            </div>
                                        )}

                                        {/* Honeypot */}
                                        <div className="d-none" aria-hidden="true">
                                            <label htmlFor="website">Не заполняйте это поле</label>
                                            <input
                                                id="website"
                                                name="website"
                                                type="text"
                                                tabIndex={-1}
                                                autoComplete="off"
                                                value={values.website}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="name" className="form-label">Ваше имя <span className="text-danger">*</span></label>
                                                    <input
                                                        id="name"
                                                        name="name"
                                                        type="text"
                                                        className={`form-control ${showError('name') ? 'is-invalid' : ''}`}
                                                        autoComplete="name"
                                                        placeholder="Иван Иванов"
                                                        value={values.name}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        maxLength={LIMITS.nameMax}
                                                        disabled={sending}
                                                    />
                                                    {showError('name') && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="email" className="form-label">Электронная почта <span className="text-danger">*</span></label>
                                                    <input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        className={`form-control ${showError('email') ? 'is-invalid' : ''}`}
                                                        inputMode="email"
                                                        autoComplete="email"
                                                        autoCapitalize="none"
                                                        autoCorrect="off"
                                                        spellCheck={false}
                                                        placeholder="name@example.ru"
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled={sending}
                                                    />
                                                    {showError('email') && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="role" className="form-label">Вы <span className="text-danger">*</span></label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        className={`form-select ${showError('role') ? 'is-invalid' : ''}`}
                                                        value={values.role}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled={sending}
                                                    >
                                                        <option value="">Выберите…</option>
                                                        {ROLES.map((r) => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                    {showError('role') && <div className="invalid-feedback">{errors.role}</div>}
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="category" className="form-label">Тема обращения <span className="text-danger">*</span></label>
                                                    <select
                                                        id="category"
                                                        name="category"
                                                        className={`form-select ${showError('category') ? 'is-invalid' : ''}`}
                                                        value={values.category}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled={sending}
                                                    >
                                                        <option value="">Выберите…</option>
                                                        {CATEGORIES.map((c) => (
                                                            <option key={c.value} value={c.value}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                    {showError('category') && <div className="invalid-feedback">{errors.category}</div>}
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="mb-3">
                                                    <label htmlFor="priority" className="form-label">Срочность</label>
                                                    <select
                                                        id="priority"
                                                        name="priority"
                                                        className="form-select"
                                                        value={values.priority}
                                                        onChange={handleChange}
                                                        disabled={sending}
                                                    >
                                                        {PRIORITIES.map((p) => (
                                                            <option key={p.value} value={p.value}>{p.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="mb-3">
                                                    <label htmlFor="subject" className="form-label">Заголовок <span className="text-danger">*</span></label>
                                                    <input
                                                        id="subject"
                                                        name="subject"
                                                        type="text"
                                                        className={`form-control ${showError('subject') ? 'is-invalid' : ''}`}
                                                        placeholder="Кратко: что не работает"
                                                        value={values.subject}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        maxLength={LIMITS.subjectMax}
                                                        disabled={sending}
                                                    />
                                                    {showError('subject') && <div className="invalid-feedback">{errors.subject}</div>}
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="mb-3">
                                                    <label htmlFor="message" className="form-label">Описание проблемы <span className="text-danger">*</span></label>
                                                    <textarea
                                                        id="message"
                                                        name="message"
                                                        className={`form-control ${showError('message') ? 'is-invalid' : ''}`}
                                                        rows={6}
                                                        placeholder="Что вы делали, что ожидали увидеть и что произошло на самом деле. Если появилось сообщение об ошибке — скопируйте его."
                                                        value={values.message}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        maxLength={LIMITS.messageMax}
                                                        disabled={sending}
                                                    ></textarea>
                                                    {showError('message') && <div className="invalid-feedback d-block">{errors.message}</div>}
                                                    <div className="form-text text-end">
                                                        {values.message.length} / {LIMITS.messageMax}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="mb-3 form-check">
                                                    <input
                                                        id="consent"
                                                        name="consent"
                                                        type="checkbox"
                                                        className={`form-check-input ${showError('consent') ? 'is-invalid' : ''}`}
                                                        checked={values.consent}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        disabled={sending}
                                                    />
                                                    <label htmlFor="consent" className="form-check-label">
                                                        Я согласен(на) на обработку персональных данных для рассмотрения моего обращения
                                                    </label>
                                                    {showError('consent') && <div className="invalid-feedback">{errors.consent}</div>}
                                                </div>
                                            </div>

                                            <div className="col-12 d-flex flex-wrap align-items-center gap-3 mt-4">
                                                <button type="submit" className="btn btn-primary btn-lg px-4" disabled={sending}>
                                                    {sending ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Отправка…
                                                        </>
                                                    ) : (
                                                        'Отправить обращение'
                                                    )}
                                                </button>
                                                <span className="text-secondary small">
                                                    Поля, отмеченные <span className="text-danger">*</span>, обязательны
                                                </span>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка: Инфо и FAQ */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body">
                                <h2 className="h5">Часы работы</h2>
                                <p className="mb-1">Пн–Пт: 9:00 – 17:00</p>
                                <p className="text-secondary small mb-0">
                                    Обращения, отправленные в выходные, обрабатываются в понедельник.
                                </p>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h2 className="h5 mb-3">Частые вопросы</h2>
                                <div className="accordion accordion-flush">
                                    {FAQ.map((item, i) => (
                                        <div className="accordion-item" key={i}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${openFaq !== i ? 'collapsed' : ''}`}
                                                    type="button"
                                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                >
                                                    {item.q}
                                                </button>
                                            </h2>
                                            <div className={`accordion-collapse collapse ${openFaq === i ? 'show' : ''}`}>
                                                <div className="accordion-body small text-secondary">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}