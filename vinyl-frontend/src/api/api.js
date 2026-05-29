// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptors
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Notification
export const showNotification = (message, type = 'success') => {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// ============ ФУНКЦИИ ДЛЯ ЛОКАЛЬНОЙ КОЛЛЕКЦИИ (для обратной совместимости) ============
export const getCollection = () => {
    const saved = localStorage.getItem('vinyl_collection');
    return saved ? JSON.parse(saved) : [];
};

export const addToCollection = (vinyl) => {
    const collection = getCollection();
    if (!collection.some(v => v.id === vinyl.id)) {
        collection.unshift(vinyl);
        localStorage.setItem('vinyl_collection', JSON.stringify(collection));
        return true;
    }
    return false;
};

export const removeFromCollection = (id) => {
    const collection = getCollection();
    const filtered = collection.filter(v => v.id !== id);
    localStorage.setItem('vinyl_collection', JSON.stringify(filtered));
};

// ============ ФУНКЦИИ ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ ============
// Получить коллекцию пользователя из БД
// Получить коллекцию пользователя из БД
export const getUserCollection = async (userId) => {
    try {
        const response = await api.get(`/collection/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки коллекции:', error);
        return [];
    }
};

// Добавить пластинку в коллекцию пользователя в БД
export const addToUserCollection = async (userId, vinylData, userRating, userComment, userPhotos) => {
    try {
        const response = await api.post(`/collection/${userId}/add`, {
            vinylData,
            userRating,
            userComment,
            userPhotos
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка добавления в коллекцию:', error);
        return { success: false, message: 'Ошибка при добавлении' };
    }
};

// Удалить пластинку из коллекции пользователя в БД
export const removeFromUserCollection = async (userId, collectionId) => {
    try {
        const response = await api.delete(`/collection/${userId}/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка удаления из коллекции:', error);
        return { success: false, message: 'Ошибка при удалении' };
    }
};
export const updateUserCollectionItem = async (userId, collectionId, userRating, userComment, userPhotos) => {
    try {
        const response = await api.put(`/collection/${userId}/${collectionId}`, {
            userRating,
            userComment,
            userPhotos
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка обновления коллекции:', error);
        return { success: false, message: 'Ошибка при обновлении' };
    }
};
export const searchYandexMusic = async (query, limit = 10) => {
    try {
        const response = await api.get('/yandex/search', {
            params: { q: query, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка поиска на Яндекс.Музыке:', error);
        return { tracks: [], total: 0 };
    }
};

export const getYandexTrack = async (artist, title) => {
    try {
        const response = await api.get('/yandex/track', {
            params: { artist, title }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка получения трека:', error);
        return null;
    }
};

export const playYandexTrack = async (trackId) => {
    try {
        const response = await api.get(`/yandex/play/${trackId}`);
        return response.data.url;
    } catch (error) {
        console.error('Ошибка получения URL трека:', error);
        return null;
    }
};
export const searchYandexTrack = async (artist, title) => {
    try {
        const response = await api.get('/yandex/track', {
            params: { artist, title }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка поиска на Яндекс.Музыке:', error);
        return null;
    }
};
export default api;