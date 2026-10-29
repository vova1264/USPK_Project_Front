import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || '';

const authHeaders = () => {
    const token = authService.getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const scheduleApi = {
    getFiles: async () => {
        const res = await fetch(`${API_URL}/api/schedule/files`, {
            headers: { ...authHeaders() },
        });
        if (!res.ok) throw new Error(`Ошибка загрузки списка (${res.status})`);
        return res.json();
    },

    // ---------- один файл (совместимость) ----------
    upload: async (file) => {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${API_URL}/api/schedule/upload`, {
            method: 'POST',
            headers: { ...authHeaders() }, // Content-Type НЕ ставим — boundary сам
            body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Ошибка загрузки (${res.status})`);
        return data;
    },

    // ---------- несколько файлов ----------
    uploadMany: async (files) => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));

        const res = await fetch(`${API_URL}/api/schedule/upload-many`, {
            method: 'POST',
            headers: { ...authHeaders() }, // Content-Type НЕ ставим
            body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            // подтягиваем детали ошибок, если бэкенд их прислал
            const details = Array.isArray(data.errors)
                ? ' ' + data.errors.map(e => `${e.name}: ${e.reason}`).join('; ')
                : '';
            throw new Error((data.message || `Ошибка загрузки (${res.status})`) + details);
        }
        return data; // { message, uploaded: [...], skipped: [...] }
    },

    // ---------- один файл (совместимость) ----------
    delete: async (name) => {
        const res = await fetch(`${API_URL}/api/schedule/files/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            headers: { ...authHeaders() },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Ошибка удаления (${res.status})`);
        return data;
    },

    // ---------- несколько файлов ----------
    deleteMany: async (names) => {
        const res = await fetch(`${API_URL}/api/schedule/files`, {
            method: 'DELETE',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json', // здесь тело JSON — заголовок нужен
            },
            body: JSON.stringify({ names }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Ошибка удаления (${res.status})`);
        return data; // { message, deleted: [...], notFound: [...] }
    },
};