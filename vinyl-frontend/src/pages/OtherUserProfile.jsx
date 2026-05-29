// pages/OtherUserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { showNotification, getUserCollection } from '../api/api';
import './OtherUserProfile.css';

function OtherUserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
        loadUserProfile();
    }, [userId]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            // Загружаем информацию о пользователе
            const userResponse = await api.get(`/users/${userId}`);
            setProfileUser(userResponse.data);

            // Загружаем коллекцию пользователя
            const collectionData = await getUserCollection(parseInt(userId));
            setCollection(collectionData);

        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            if (error.response?.status === 404) {
                showNotification('❌ Пользователь не найден', 'error');
            } else {
                showNotification('❌ Ошибка загрузки профиля', 'error');
            }
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const startChat = () => {
        if (!currentUser) {
            showNotification('🔒 Войдите, чтобы написать сообщение', 'error');
            navigate('/login');
            return;
        }

        // Не даем написать сообщение самому себе
        if (currentUser.id === parseInt(userId)) {
            showNotification('❌ Нельзя написать сообщение самому себе', 'error');
            return;
        }

        navigate(`/messages/${userId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка профиля...</p>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h3>Пользователь не найден</h3>
                <button onClick={() => navigate('/marketplace')} className="shop-btn">
                    ← Вернуться
                </button>
            </div>
        );
    }

    return (
        <div className="other-profile-page">
            <div className="other-profile-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Назад
                </button>

                {/* Информация о пользователе */}
                <div className="profile-card">
                    <div className="profile-avatar-large">
                        {profileUser.avatarPath ? (
                            <img src={profileUser.avatarPath} alt={profileUser.username} />
                        ) : (
                            <span>👤</span>
                        )}
                    </div>
                    <div className="profile-info">
                        <h1>{profileUser.username}</h1>
                        {profileUser.firstName && profileUser.lastName && (
                            <p className="profile-name">{profileUser.firstName} {profileUser.lastName}</p>
                        )}
                        {profileUser.city && <p className="profile-city">📍 {profileUser.city}</p>}
                        {profileUser.bio && <p className="profile-bio">{profileUser.bio}</p>}
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="stat-value">{collection.length}</span>
                                <span className="stat-label">пластинок</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{profileUser.rating || 0}</span>
                                <span className="stat-label">рейтинг</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{new Date(profileUser.createdAt).getFullYear()}</span>
                                <span className="stat-label">на сайте</span>
                            </div>
                        </div>
                        {currentUser && currentUser.id !== parseInt(userId) && (
                            <button className="message-btn" onClick={startChat}>
                                💬 Написать сообщение
                            </button>
                        )}
                    </div>
                </div>

                {/* Коллекция пользователя */}
                <div className="user-collection">
                    <h2>Коллекция {profileUser.username}</h2>
                    {collection.length === 0 ? (
                        <div className="empty-collection">
                            <p>У пользователя пока нет пластинок в коллекции</p>
                        </div>
                    ) : (
                        <div className="collection-grid">
                            {collection.map((item) => {
                                const vinyl = item.vinylData;
                                return (
                                    <div key={item.id} className="vinyl-card">
                                        <div className="vinyl-image">
                                            {vinyl?.coverImage ? (
                                                <img src={vinyl.coverImage} alt={vinyl.title} />
                                            ) : (
                                                <div className="no-image">🎵</div>
                                            )}
                                        </div>
                                        <div className="vinyl-info">
                                            <div className="vinyl-title">{vinyl?.title || 'Без названия'}</div>
                                            <div className="vinyl-artist">{vinyl?.artist || 'Неизвестный исполнитель'}</div>
                                            <div className="vinyl-year">📅 {vinyl?.year || '—'}</div>
                                            {item.userRating > 0 && (
                                                <div className="vinyl-rating">
                                                    {'★'.repeat(item.userRating)}{'☆'.repeat(5 - item.userRating)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OtherUserProfile;