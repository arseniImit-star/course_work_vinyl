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

// ============ ФУНКЦИИ ДЛЯ ЛОКАЛЬНОЙ КОЛЛЕКЦИИ (резервное копирование) ============

// Получить локальную коллекцию (из localStorage)
export const getLocalCollection = () => {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const key = `user_collection_${currentUser.id}`;
        const collection = localStorage.getItem(key);
        return collection ? JSON.parse(collection) : [];
    } catch (error) {
        console.error('Ошибка загрузки локальной коллекции:', error);
        return [];
    }
};

// Сохранить локальную коллекцию (резервная копия)
export const saveLocalCollection = (collection) => {
    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
            const key = `user_collection_${currentUser.id}`;
            localStorage.setItem(key, JSON.stringify(collection));
        }
    } catch (error) {
        console.error('Ошибка сохранения локальной коллекции:', error);
    }
};

// ============ ФУНКЦИИ ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ (ОСНОВНЫЕ) ============

// Получить коллекцию пользователя из БД (с локальным кэшем)
export const getUserCollection = async (userId) => {
    try {
        const response = await api.get(`/collection/${userId}`);

        // Сохраняем копию в localStorage
        if (response.data && Array.isArray(response.data)) {
            saveLocalCollection(response.data);
        }

        return response.data;
    } catch (error) {
        console.error('Ошибка загрузки коллекции из БД:', error);

        // Если ошибка, возвращаем локальную копию
        const localCollection = getLocalCollection();
        if (localCollection.length > 0) {
            console.log('Загружена локальная копия коллекции');
            return localCollection;
        }

        return [];
    }
};

// Добавить пластинку в коллекцию пользователя в БД
export const addToUserCollection = async (userId, vinylData, userRating = 0, userComment = '', userPhotos = []) => {
    try {
        const response = await api.post(`/collection/${userId}/add`, {
            vinylData,
            userRating,
            userComment,
            userPhotos
        });

        if (response.data.success) {
            // Обновляем локальную копию
            const updatedCollection = await getUserCollection(userId);
            saveLocalCollection(updatedCollection);
        }

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

        if (response.data.success) {
            // Обновляем локальную копию
            const updatedCollection = await getUserCollection(userId);
            saveLocalCollection(updatedCollection);
        }

        return response.data;
    } catch (error) {
        console.error('Ошибка удаления из коллекции:', error);
        return { success: false, message: 'Ошибка при удалении' };
    }
};

// Обновить пластинку в коллекции
export const updateUserCollectionItem = async (userId, collectionId, userRating, userComment, userPhotos) => {
    try {
        const response = await api.put(`/collection/${userId}/${collectionId}`, {
            userRating,
            userComment,
            userPhotos
        });

        if (response.data.success) {
            // Обновляем локальную копию
            const updatedCollection = await getUserCollection(userId);
            saveLocalCollection(updatedCollection);
        }

        return response.data;
    } catch (error) {
        console.error('Ошибка обновления коллекции:', error);
        return { success: false, message: 'Ошибка при обновлении' };
    }
};

// ============ ФУНКЦИИ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ (для старого кода) ============

// Получить коллекцию (совместимость со старым кодом)
export const getCollection = () => {
    return getLocalCollection();
};

// Сохранить коллекцию (совместимость)
export const saveCollection = (collection) => {
    saveLocalCollection(collection);
};

// Добавить в коллекцию (локально)
export const addToCollection = (vinyl) => {
    const collection = getLocalCollection();
    if (!collection.find(v => v.id === vinyl.id)) {
        collection.push(vinyl);
        saveLocalCollection(collection);
    }
    return collection;
};

// Удалить из коллекции (локально)
export const removeFromCollection = (vinylId) => {
    let collection = getLocalCollection();
    collection = collection.filter(v => v.id !== vinylId);
    saveLocalCollection(collection);
    return collection;
};

// Синхронизировать локальную коллекцию с БД
export const syncCollectionWithServer = async (userId) => {
    try {
        // Получаем данные с сервера
        const serverCollection = await getUserCollection(userId);
        const localCollection = getLocalCollection();

        // Если на сервере пусто, а локально есть данные - отправляем локальные
        if (serverCollection.length === 0 && localCollection.length > 0) {
            for (const vinyl of localCollection) {
                await addToUserCollection(userId, vinyl.vinylData || vinyl, vinyl.userRating || 0, vinyl.userComment || '');
            }
            console.log('Локальные данные синхронизированы с сервером');
        }

        // Если на сервере есть данные, а локально нет - сохраняем локально
        if (serverCollection.length > 0 && localCollection.length === 0) {
            saveLocalCollection(serverCollection);
            console.log('Данные с сервера сохранены локально');
        }

        return await getUserCollection(userId);
    } catch (error) {
        console.error('Ошибка синхронизации:', error);
        return getLocalCollection();
    }
};

// ============ ФУНКЦИИ ДЛЯ РАБОТЫ С YANDEX MUSIC ============

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