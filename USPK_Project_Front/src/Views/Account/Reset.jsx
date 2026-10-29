import { useState } from 'react';

const ForgotPassword = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Простая валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Пожалуйста, введите корректный email адрес');
            return;
        }

        setLoading(true);

        // Имитация отправки запроса на сервер
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            // Здесь в будущем будет вызов API: await authService.forgotPassword(email);
        }, 1500);
    };

    return (
        <main className="d-flex align-items-center justify-content-center min-vh-100 py-4 px-3" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="w-100" style={{ maxWidth: '440px' }}>

                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4 p-sm-5">

                        <div className="text-center mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-4 bg-primary-subtle text-primary mb-3 p-3">
                                <i className="bi bi-shield-lock fs-3"></i>
                            </div>
                            <h1 className="h4 fw-semibold mb-2 text-body-emphasis">Восстановление доступа</h1>
                            <p className="text-body-secondary small mb-0 mx-auto" style={{ maxWidth: '320px' }}>
                                Введите email, указанный при регистрации — мы отправим ссылку для сброса пароля
                            </p>
                        </div>

                        {success ? (
                            <div className="alert alert-success text-center" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Ссылка для сброса пароля отправлена на <strong>{email}</strong>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label small fw-medium text-body-secondary">
                                        Email адрес
                                    </label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-body-tertiary border-end-0">
                                            <i className="bi bi-envelope text-body-secondary"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className={`form-control border-start-0 ps-0 ${error ? 'is-invalid' : ''}`}
                                            id="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {error && (
                                        <div className="invalid-feedback d-block small mt-1">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 fw-semibold d-flex align-items-center justify-content-center"
                                    disabled={loading}
                                >
                                    <span className="btn-text">{loading ? 'Отправка...' : 'Отправить ссылку'}</span>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="d-flex align-items-center gap-3 my-4 text-body-tertiary">
                            <hr className="flex-grow-1 m-0" />
                            <span className="small text-uppercase text-body-secondary" style={{ letterSpacing: '1px' }}>или</span>
                            <hr className="flex-grow-1 m-0" />
                        </div>

                        <div className="d-flex flex-column flex-sm-row justify-content-between small">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('login'); }}
                                className="link-primary text-decoration-none d-inline-flex align-items-center gap-1"
                            >
                                <i className="bi bi-arrow-left"></i> Вернуться к входу
                            </a>
                        </div>

                    </div>
                </div>

                {/* Подписи под карточкой */}
                <p className="text-center text-body-secondary small mt-4 mb-2">
                    Не приходит письмо? Проверьте «Спам» или{' '}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('support'); }}
                        className="link-secondary"
                    >
                        обратитесь в поддержку
                    </a>
                </p>
            </div>
        </main>
    );
};

export default ForgotPassword;