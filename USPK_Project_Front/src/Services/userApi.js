import axios from 'axios';
import { authService } from './authService';

const API_URL = '/api/admin'; // Замените на ваш URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Если не авторизован, выходим из системы
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const userApi = {
    getUsers: () => api.get('/users'),
    getUser: (id) => api.get(`/users/${id}`),
    createUser: (userData) => api.post('/users', userData),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
    changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};