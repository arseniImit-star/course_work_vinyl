// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getCollection, removeFromCollection } from '../api/api';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();

    // Все хуки должны быть на верхнем уровне - ДО любых условий и return
    const [user, setUser] = useState({
        username: '',
        email: '',
        collectingSince: 2020,
        favoriteGenres: [],
        bio: '',
        avatar: 'https://i.pravatar.cc/150?img=7'
    });
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [favoriteVinyls, setFavoriteVinyls] = useState([]);
    const [myCollection, setMyCollection] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [tracklists, setTracklists] = useState({});
    const [expandedVinyl, setExpandedVinyl] = useState(null);
    const [totalRating, setTotalRating] = useState(0);
    const [avgRating, setAvgRating] = useState(0);

    const genreOptions = ['Рок', 'Поп', 'Джаз', 'Классика', 'Электроника', 'Хип-хоп', 'Металл', 'Блюз', 'Фанк', 'Соул'];

    // useEffect на верхнем уровне
    useEffect(() => {
        loadAllData();
    }, []);

    // useEffect для обновления статистики при изменении коллекции
    useEffect(() => {
        const total = myCollection.reduce((sum, v) => sum + (v.userRating || 0), 0);
        setTotalRating(total);
        const avg = myCollection.length > 0 ? (total / myCollection.length).toFixed(1) : 0;
        setAvgRating(avg);
    }, [myCollection]);

    // Функции загрузки данных
    const loadAllData = async () => {
        setLoading(true);

        // Загружаем данные пользователя из localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(prev => ({
                ...prev,
                username: parsedUser.username,
                id: parsedUser.id
            }));
            setFormData(prev => ({
                ...prev,
                username: parsedUser.username,
                id: parsedUser.id
            }));
        } else {
            navigate('/login');
            return;
        }

        await loadMyCollection();
        await loadFavoriteVinyls();

        setLoading(false);
    };

    const loadMyCollection = async () => {
        const savedCollection = getCollection();
        setMyCollection(savedCollection);

        // Загружаем треклисты для пластинок в коллекции
        for (const vinyl of savedCollection) {
            if (vinyl.id && !tracklists[vinyl.id]) {
                await loadTracklist(vinyl.id);
            }
        }
    };

    const loadTracklist = async (vinylId) => {
        try {
            const response = await api.get(`/vinyls/discogs/tracklist/${vinylId}`);
            setTracklists(prev => ({
                ...prev,
                [vinylId]: response.data
            }));
        } catch (error) {
            setTracklists(prev => ({
                ...prev,
                [vinylId]: []
            }));
        }
    };

    const loadFavoriteVinyls = async () => {
        try {
            const response = await api.get('/users/favorites');
            setFavoriteVinyls(response.data || []);
        } catch (error) {
            // Демо-данные
            const demoFavorites = [
                { id: 1, title: 'Abbey Road', artist: 'The Beatles', year: 1969, price: 3500, coverImage: 'https://images.unsplash.com/photo-1603048588669-1b6e9b9c8f8f?w=200' },
                { id: 2, title: 'Kind of Blue', artist: 'Miles Davis', year: 1959, price: 4200, coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200' }
            ];
            setFavoriteVinyls(demoFavorites);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUser({ ...formData });
        setEditing(false);

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...userData, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            if (api && formData.id) {
                await api.put(`/users/${formData.id}`, formData);
            }
            alert('✅ Профиль обновлен!');
        } catch (error) {
            alert('✅ Данные сохранены локально!');
        }
    };

    const handleRemoveFromCollection = (vinyl) => {
        if (window.confirm(`Удалить "${vinyl.title}" из коллекции?`)) {
            removeFromCollection(vinyl.id);
            loadMyCollection();
            alert('❌ Пластинка удалена из коллекции');
        }
    };

    const handleRemoveFromFavorites = async (vinylId) => {
        if (window.confirm('Удалить пластинку из избранного?')) {
            setFavoriteVinyls(favoriteVinyls.filter(v => v.id !== vinylId));
            alert('❌ Пластинка удалена из избранного');
        }
    };

    const handleExpandTracklist = (vinylId) => {
        if (expandedVinyl === vinylId) {
            setExpandedVinyl(null);
        } else {
            setExpandedVinyl(vinylId);
            if (!tracklists[vinylId]) {
                loadTracklist(vinylId);
            }
        }
    };

    const getYearsSince = () => {
        const currentYear = new Date().getFullYear();
        return currentYear - (user.collectingSince || 2020);
    };

    // Проверка на загрузку после всех хуков
    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    // Рендер компонента
    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Hero Section */}
                <div className="profile-hero">
                    <div className="profile-hero-content">
                        <div className="profile-avatar">
                            <img src={user.avatar} alt={user.username} />
                            <div className="avatar-badge">🎵</div>
                        </div>
                        <div className="profile-hero-info">
                            <h1>{user.username || 'Коллекционер'}</h1>
                            <p className="profile-badge">🎵 Коллекционер винила</p>
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{myCollection.length}</span>
                                    <span className="stat-label">пластинок</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{favoriteVinyls.length}</span>
                                    <span className="stat-label">в избранном</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{avgRating}</span>
                                    <span className="stat-label">средний рейтинг</span>
                                </div>
                            </div>
                        </div>
                        <button className="edit-profile-btn" onClick={() => setEditing(!editing)}>
                            {editing ? '✖️ Отмена' : '✏️ Редактировать'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <span>👤</span> Обо мне
                    </button>
                    <button className={activeTab === 'collection' ? 'active' : ''} onClick={() => setActiveTab('collection')}>
                        <span>🎵</span> Моя коллекция ({myCollection.length})
                    </button>
                    <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>
                        <span>❤️</span> Избранное ({favoriteVinyls.length})
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-card">
                        {editing ? (
                            <form onSubmit={handleUpdate} className="profile-form">
                                <div className="form-group">
                                    <label>👤 Имя пользователя</label>
                                    <input
                                        type="text"
                                        value={formData.username || ''}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>📧 Email</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>📅 Год начала коллекционирования</label>
                                    <input
                                        type="number"
                                        value={formData.collectingSince}
                                        onChange={(e) => setFormData({...formData, collectingSince: parseInt(e.target.value)})}
                                        min="1950"
                                        max="2026"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🎸 Любимые жанры</label>
                                    <div className="genres-checkbox">
                                        {genreOptions.map(genre => (
                                            <label key={genre} className="genre-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.favoriteGenres?.includes(genre)}
                                                    onChange={(e) => {
                                                        let updated = [...(formData.favoriteGenres || [])];
                                                        if (e.target.checked) updated.push(genre);
                                                        else updated = updated.filter(g => g !== genre);
                                                        setFormData({...formData, favoriteGenres: updated});
                                                    }}
                                                />
                                                <span>{genre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>📝 О себе</label>
                                    <textarea
                                        rows="4"
                                        value={formData.bio || ''}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        placeholder="Расскажите о своей коллекции, любимых пластинках..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🖼️ URL аватара</label>
                                    <input
                                        type="text"
                                        value={formData.avatar || ''}
                                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn">💾 Сохранить изменения</button>
                                    <button type="button" className="cancel-btn" onClick={() => {
                                        setFormData({...user});
                                        setEditing(false);
                                    }}>✖️ Отмена</button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="info-section">
                                    <h3>📋 Основная информация</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">👤 Имя пользователя</span>
                                            <span className="info-value">{user.username || '—'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">📧 Email</span>
                                            <span className="info-value">{user.email || 'не указан'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">📅 Коллекционирую с</span>
                                            <span className="info-value">{user.collectingSince} год ({getYearsSince()} лет)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3>🎸 Любимые жанры</h3>
                                    <div className="genres-tags">
                                        {user.favoriteGenres?.map(g => (
                                            <span key={g} className="genre-tag">{g}</span>
                                        ))}
                                        {(!user.favoriteGenres || user.favoriteGenres.length === 0) && (
                                            <span className="no-data">Не указаны</span>
                                        )}
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3>📝 О себе</h3>
                                    <p className="bio-text">{user.bio || 'Расскажите о себе и своей коллекции'}</p>
                                </div>

                                <div className="info-section">
                                    <h3>📊 Статистика коллекции</h3>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{myCollection.length}</div>
                                            <div className="stat-label">всего пластинок</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{totalRating}</div>
                                            <div className="stat-label">всего звёзд</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{avgRating}</div>
                                            <div className="stat-label">средний рейтинг</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Collection Tab */}
                {activeTab === 'collection' && (
                    <div className="vinyls-grid">
                        {myCollection.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📀</div>
                                <h3>Коллекция пуста</h3>
                                <p>Добавьте пластинки в коллекцию через каталог</p>
                                <button onClick={() => navigate('/add-vinyl')} className="shop-btn">
                                    🎵 Добавить пластинку
                                </button>
                            </div>
                        ) : (
                            myCollection.map((vinyl) => (
                                <div key={vinyl.id} className="vinyl-card">
                                    <div className="vinyl-image">
                                        {vinyl.coverImage ? (
                                            <img src={vinyl.coverImage} alt={vinyl.title} />
                                        ) : (
                                            <div className="no-image">🎵</div>
                                        )}
                                    </div>
                                    <div className="vinyl-info">
                                        <div className="vinyl-title">{vinyl.title}</div>
                                        <div className="vinyl-artist">{vinyl.artist}</div>
                                        <div className="vinyl-year">📅 {vinyl.year || '—'}</div>
                                        {vinyl.userRating > 0 && (
                                            <div className="vinyl-rating">
                                                {'★'.repeat(vinyl.userRating)}{'☆'.repeat(5 - vinyl.userRating)}
                                            </div>
                                        )}

                                        {/* Треклист */}
                                        {expandedVinyl === vinyl.id && tracklists[vinyl.id] && tracklists[vinyl.id].length > 0 && (
                                            <div className="vinyl-tracklist">
                                                <div className="tracklist-title">🎵 Треклист:</div>
                                                <div className="tracklist-items">
                                                    {tracklists[vinyl.id].slice(0, 5).map((track, idx) => (
                                                        <div key={idx} className="tracklist-item">
                                                            <span className="track-num">{track.position || idx + 1}</span>
                                                            <span className="track-name">{track.title}</span>
                                                            <span className="track-time">{track.duration}</span>
                                                        </div>
                                                    ))}
                                                    {tracklists[vinyl.id].length > 5 && (
                                                        <div className="tracklist-more">+ ещё {tracklists[vinyl.id].length - 5} треков</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {vinyl.userComment && (
                                            <div className="vinyl-comment">
                                                💬 {vinyl.userComment.length > 50 ? vinyl.userComment.substring(0, 50) + '...' : vinyl.userComment}
                                            </div>
                                        )}

                                        <button
                                            className="expand-tracklist-btn"
                                            onClick={() => handleExpandTracklist(vinyl.id)}
                                        >
                                            {expandedVinyl === vinyl.id ? '▲ Скрыть треки' : '▼ Показать треки'}
                                        </button>

                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemoveFromCollection(vinyl)}
                                        >
                                            ❌ Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                    <div className="vinyls-grid">
                        {favoriteVinyls.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">❤️</div>
                                <h3>Избранное пусто</h3>
                                <p>Добавьте пластинки в избранное из каталога</p>
                                <button onClick={() => navigate('/')} className="shop-btn">
                                    🎵 Перейти в каталог
                                </button>
                            </div>
                        ) : (
                            favoriteVinyls.map(vinyl => (
                                <div key={vinyl.id} className="vinyl-card">
                                    <div className="vinyl-image">
                                        {vinyl.coverImage ? (
                                            <img src={vinyl.coverImage} alt={vinyl.title} />
                                        ) : (
                                            <div className="no-image">🎵</div>
                                        )}
                                    </div>
                                    <div className="vinyl-info">
                                        <div className="vinyl-title">{vinyl.title}</div>
                                        <div className="vinyl-artist">{vinyl.artist}</div>
                                        <div className="vinyl-year">📅 {vinyl.year || '—'}</div>
                                        {vinyl.price && <div className="vinyl-price">💰 {vinyl.price} ₽</div>}
                                        <button
                                            className="remove-fav-btn"
                                            onClick={() => handleRemoveFromFavorites(vinyl.id)}
                                        >
                                            ❤️ Удалить из избранного
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;