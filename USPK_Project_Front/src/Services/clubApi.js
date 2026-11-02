import api from './api.js';

export const clubApi = {
    // Получение всех записей с фильтрами
    getAll: async (params) => {
        // Путь /club (так как контроллер ClubController)
        const response = await api.get('/club', { params });
        return response.data;
    },

    // Получение списка площадок
    getLocations: async () => {
        // В контроллере C# метод GetLocations имеет маршрут [HttpGet("locations")]
        const response = await api.get('/club/locations');
        return response.data;
    },

    // Добавление записи
    add: async (record) => {
        // Путь /club
        const response = await api.post('/club', record);
        return response.data;
    },

    // Удаление записи
    remove: async (id) => {
        // Путь /club/{id}
        const response = await api.delete(`/club/${id}`);
        return response.data;
    }
};