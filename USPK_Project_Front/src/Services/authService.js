

import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                email: response.data.email,
                role: response.data.role
            }));
        }

        return response.data;
    },

    register: async (email, password) => {
        const response = await api.post('/auth/register', {
            email,
            password
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};