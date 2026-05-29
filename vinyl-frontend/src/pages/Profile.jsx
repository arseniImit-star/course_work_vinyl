// Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, {
    getUserCollection,
    removeFromUserCollection,
    showNotification
} from '../api/api';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        id: null,
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        city: '',
        bio: '',
        avatar: null,
        collectingSince: new Date().getFullYear(),
        favoriteGenres: []
    });

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });
    const [myCollection, setMyCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tracklists, setTracklists] = useState({});
    const [expandedVinyl, setExpandedVinyl] = useState(null);
    const [totalRating, setTotalRating] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [activeTab, setActiveTab] = useState('profile');

    const genreOptions = ['Рок', 'Поп', 'Джаз', 'Классика', 'Электроника', 'Хип-хоп', 'Металл', 'Блюз', 'Фанк', 'Соул'];

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        const total = myCollection.reduce((sum, v) => sum + (v.userRating || 0), 0);
        setTotalRating(total);
        const avg = myCollection.length > 0 ? (total / myCollection.length).toFixed(1) : 0;
        setAvgRating(avg);
    }, [myCollection]);

    const loadAllData = async () => {
        setLoading(true);

        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);

        try {
            // Пытаемся получить данные с бэкенда
            const response = await api.get(`/users/${parsedUser.id}`);
            setUser({
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                city: response.data.city || '',
                bio: response.data.bio || '',
                avatar: response.data.avatar || parsedUser.avatar || null,
                collectingSince: response.data.collectingSince || new Date().getFullYear(),
                favoriteGenres: response.data.favoriteGenres || []
            });
            setFormData({
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                city: response.data.city || '',
                bio: response.data.bio || '',
                avatar: response.data.avatar || parsedUser.avatar || null,
                collectingSince: response.data.collectingSince || new Date().getFullYear(),
                favoriteGenres: response.data.favoriteGenres || []
            });
        } catch (error) {
            // Если бэкенд недоступен, используем данные из localStorage
            console.log('Используем локальные данные пользователя');
            setUser(prev => ({
                ...prev,
                id: parsedUser.id,
                username: parsedUser.username,
                email: parsedUser.email || '',
                avatar: parsedUser.avatar || null
            }));
            setFormData(prev => ({
                ...prev,
                id: parsedUser.id,
                username: parsedUser.username,
                email: parsedUser.email || '',
                avatar: parsedUser.avatar || null
            }));
        }

        // Загружаем коллекцию
        await loadMyCollection();

        setLoading(false);
    };

    // Загрузка коллекции из БД
    const loadMyCollection = async () => {
        if (user.id) {
            try {
                const collection = await getUserCollection(user.id);
                console.log('Загружена коллекция из БД:', collection);
                setMyCollection(collection);

                // Загружаем треклисты для пластинок
                for (const item of collection) {
                    const vinylId = item.vinylData?.id;
                    if (vinylId && !tracklists[vinylId]) {
                        await loadTracklist(vinylId);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки коллекции:', error);
                setMyCollection([]);
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
            console.error('Ошибка загрузки треклиста:', error);
            setTracklists(prev => ({
                ...prev,
                [vinylId]: []
            }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            if (api && user.id) {
                await api.put(`/users/${user.id}`, formData);
            }

            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...userData, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setUser({ ...formData });
            setEditing(false);

            showNotification('✅ Профиль успешно обновлен!', 'success');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            showNotification('⚠️ Данные сохранены локально', 'info');
            setUser({ ...formData });
            setEditing(false);
        }
    };

    const handleRemoveFromCollection = async (collectionItem) => {
        if (window.confirm(`Удалить "${collectionItem.vinylData?.title}" из коллекции?`)) {
            const result = await removeFromUserCollection(user.id, collectionItem.id);
            if (result.success) {
                showNotification('✅ Пластинка удалена из коллекции', 'success');
                await loadMyCollection(); // Перезагружаем коллекцию
            } else {
                showNotification('❌ Ошибка при удалении', 'error');
            }
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
        return currentYear - (user.collectingSince || new Date().getFullYear());
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Hero Section */}
                <div className="profile-hero">
                    <div className="profile-hero-content">
                        <div className="profile-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder">
                                    <span>🎵</span>
                                </div>
                            )}
                            <div className="avatar-badge">🎵</div>
                        </div>
                        <div className="profile-hero-info">
                            <h1>{user.username || 'Коллекционер'}</h1>
                            <p className="profile-badge">
                                🎵 Коллекционер винила
                                {user.city && ` • ${user.city}`}
                            </p>
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{myCollection.length}</span>
                                    <span className="stat-label">пластинок</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{avgRating}</span>
                                    <span className="stat-label">средний рейтинг</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{getYearsSince()}</span>
                                    <span className="stat-label">лет в коллекционировании</span>
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
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-card">
                        {editing ? (
                            <form onSubmit={handleUpdate} className="profile-form">
                                <div className="form-group">
                                    <label>👤 Имя пользователя *</label>
                                    <input
                                        type="text"
                                        value={formData.username || ''}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>📝 Имя</label>
                                        <input
                                            type="text"
                                            value={formData.firstName || ''}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            placeholder="Ваше имя"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>📝 Фамилия</label>
                                        <input
                                            type="text"
                                            value={formData.lastName || ''}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            placeholder="Ваша фамилия"
                                        />
                                    </div>
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
                                    <label>🏙️ Город</label>
                                    <input
                                        type="text"
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        placeholder="Ваш город"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>📅 Год начала коллекционирования</label>
                                    <input
                                        type="number"
                                        value={formData.collectingSince}
                                        onChange={(e) => setFormData({...formData, collectingSince: parseInt(e.target.value)})}
                                        min="1950"
                                        max={new Date().getFullYear()}
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
                                        {user.firstName && (
                                            <div className="info-item">
                                                <span className="info-label">📝 Имя</span>
                                                <span className="info-value">{user.firstName} {user.lastName}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">📧 Email</span>
                                            <span className="info-value">{user.email || 'не указан'}</span>
                                        </div>
                                        {user.city && (
                                            <div className="info-item">
                                                <span className="info-label">🏙️ Город</span>
                                                <span className="info-value">{user.city}</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">📅 Коллекционирую с</span>
                                            <span className="info-value">{user.collectingSince} год ({getYearsSince()} лет)</span>
                                        </div>
                                    </div>
                                </div>

                                {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                                    <div className="info-section">
                                        <h3>🎸 Любимые жанры</h3>
                                        <div className="genres-tags">
                                            {user.favoriteGenres.map(g => (
                                                <span key={g} className="genre-tag">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.bio && (
                                    <div className="info-section">
                                        <h3>📝 О себе</h3>
                                        <p className="bio-text">{user.bio}</p>
                                    </div>
                                )}

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
                            myCollection.map((item) => (
                                <div key={item.id} className="vinyl-card">
                                    <div className="vinyl-image">
                                        {item.vinylData?.coverImage ? (
                                            <img src={item.vinylData.coverImage} alt={item.vinylData.title} />
                                        ) : (
                                            <div className="no-image">🎵</div>
                                        )}
                                    </div>
                                    <div className="vinyl-info">
                                        <div className="vinyl-title">{item.vinylData?.title}</div>
                                        <div className="vinyl-artist">{item.vinylData?.artist}</div>
                                        <div className="vinyl-year">📅 {item.vinylData?.year || '—'}</div>
                                        {item.vinylData?.genre && (
                                            <div className="vinyl-genre">🎸 {item.vinylData.genre}</div>
                                        )}
                                        {item.userRating > 0 && (
                                            <div className="vinyl-rating">
                                                {'★'.repeat(item.userRating)}{'☆'.repeat(5 - item.userRating)}
                                            </div>
                                        )}

                                        {expandedVinyl === item.vinylData?.id && tracklists[item.vinylData?.id] && tracklists[item.vinylData?.id].length > 0 && (
                                            <div className="vinyl-tracklist">
                                                <div className="tracklist-title">🎵 Треклист:</div>
                                                <div className="tracklist-items">
                                                    {tracklists[item.vinylData.id].slice(0, 5).map((track, idx) => (
                                                        <div key={idx} className="tracklist-item">
                                                            <span className="track-num">{track.position || idx + 1}</span>
                                                            <span className="track-name">{track.title}</span>
                                                            <span className="track-time">{track.duration}</span>
                                                        </div>
                                                    ))}
                                                    {tracklists[item.vinylData.id].length > 5 && (
                                                        <div className="tracklist-more">+ ещё {tracklists[item.vinylData.id].length - 5} треков</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {item.userComment && (
                                            <div className="vinyl-comment">
                                                💬 {item.userComment.length > 60 ? item.userComment.substring(0, 60) + '...' : item.userComment}
                                            </div>
                                        )}

                                        <div className="vinyl-buttons">
                                            <button
                                                className="tracklist-btn"
                                                onClick={() => handleExpandTracklist(item.vinylData?.id)}
                                            >
                                                {expandedVinyl === item.vinylData?.id ? '▲ Скрыть треки' : '▼ Показать треки'}
                                            </button>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveFromCollection(item)}
                                            >
                                                ❌ Удалить
                                            </button>
                                        </div>
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