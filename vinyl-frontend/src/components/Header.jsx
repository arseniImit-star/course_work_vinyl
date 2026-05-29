import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ========== ПОЛЬЗОВАТЕЛИ ==========
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// ========== КОЛЛЕКЦИЯ ==========
export const getCollection = () => {
    const collection = localStorage.getItem('vinylCollection');
    return collection ? JSON.parse(collection) : [];
};

export const addToCollection = (vinyl) => {
    const collection = getCollection();
    if (!collection.some(item => item.id === vinyl.id)) {
        collection.push(vinyl);
        localStorage.setItem('vinylCollection', JSON.stringify(collection));
        return true;
    }
    return false;
};

export const removeFromCollection = (vinylId) => {
    const collection = getCollection().filter(item => item.id !== vinylId);
    localStorage.setItem('vinylCollection', JSON.stringify(collection));
    return collection;
};

export const isInCollection = (vinylId) => {
    return getCollection().some(item => item.id === vinylId);
};

export default api;