

import axios from 'axios';

const API_BASE_URL = '/api'; // Ваш URL бэкенда

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ✅ Не делаем редирект сразу, а пробрасываем ошибку дальше
        if (error.response?.status === 401) {
            // Проверяем, не пытаемся ли мы залогиниться
            const isLoginRequest = error.config.url === '/auth/login';

            if (!isLoginRequest) {
                // Только для не-login запросов делаем редирект
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;