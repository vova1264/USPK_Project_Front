// ComingSoon.jsx

// ComingSoon.jsx

const ComingSoon = () => {
    // Функция для возврата назад средствами браузера
    const handleGoBack = () => {
        window.history.back();
        window.history.back();
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{ background: '#f8f9fa' }}
        >
            <div
                className="card border-0 shadow-lg p-4 p-md-5 text-center"
                style={{ maxWidth: '500px', borderRadius: '20px' }}
            >
                <div className="card-body">
                    <div className="display-1 mb-3">🚧</div>

                    <h1 className="h3 fw-bold text-dark mb-3">
                        Страница в разработке
                    </h1>

                    <p className="text-muted mb-4">
                        Мы усердно работаем над этой страницей.
                        Скоро здесь появится что-то интересное!
                    </p>

                    <button
                        className="btn btn-primary btn-lg rounded-pill px-4"
                        onClick={handleGoBack}
                    >
                        ← Вернуться назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;