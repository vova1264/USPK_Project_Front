import { useState } from 'react';
import { authService } from '../../Services/authService';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [consent, setConsent] = useState(false); // ✅ Добавлен state для чекбокса
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(formData.email, formData.password);
            console.log('Login response:', response); // Отладка
            if (onLogin) {
                onLogin();
            }
        } catch (error) {
            console.error('Login error:', error);
            // ✅ Улучшенная обработка ошибок
            if (error.response?.status === 401) {
                setError('Неверный логин или пароль');
            } else if (error.response?.data) {
                // Если бэкенд возвращает строку
                if (typeof error.response.data === 'string') {
                    setError(error.response.data);
                }
                // Если бэкенд возвращает объект с message
                else if (error.response.data.message) {
                    setError(error.response.data.message);
                }
                // Если бэкенд возвращает объект с title (как в вашем случае)
                else if (error.response.data.title) {
                    setError(error.response.data.title);
                }
                else {
                    setError('Ошибка при входе в систему');
                }
            } else {
                setError('Ошибка соединения с сервером');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="position-relative py-4 py-xl-5">
            <div className="container">
                <div className="row mb-4">
                    <div className="col-md-8 col-xl-6 text-center mx-auto">
                        <h2 className="text-coclor">Вход</h2>
                    </div>
                </div>
                <div className="row d-flex justify-content-center">
                    <div className="col-md-6 col-xl-4">
                        <div className="card mb-5 form-radius">
                            <div className="card-body formlogin d-flex flex-column">
                                <form onSubmit={handleSubmit}>
                                    <fieldset>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Пароль</label>
                                            <input
                                                className="form-control"
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3 form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="consent"
                                                checked={consent}
                                                onChange={(e) => setConsent(e.target.checked)} // ✅ Исправлен checkbox
                                                required
                                            />
                                            <label className="form-check-label text-coclor" htmlFor="consent">
                                                Согласен(а) на обработку персональных данных
                                            </label>
                                        </div>
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <button
                                                className="btn btn-primary d-block w-100"
                                                type="submit"
                                                disabled={loading || !consent} // ✅ Блокируем если нет согласия
                                            >
                                                {loading ? 'Выполняется вход...' : 'Выполнить вход'}
                                            </button>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;