// PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Marketplace.css';

function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Здесь будет API запрос
        const demoPosts = [
            {
                id: 1,
                type: 'FOR_SALE',
                title: 'Продам редкий винил The Beatles',
                content: 'Отличное состояние, пластинка почти не крутилась. Оригинальное издание 1969 года. Пластинка хранилась в специальном конверте, без царапин и потертостей. Звук чистый, без шумов и треска.',
                vinylTitle: 'Abbey Road',
                vinylArtist: 'The Beatles',
                vinylYear: 1969,
                condition: 'Very Good',
                price: '3500',
                location: 'Москва',
                contactInfo: '@beatles_fan',
                user: { username: 'Коллекционер', avatar: '🎸', rating: 4.8, joinedDate: '2023-01-15' },
                createdAt: new Date().toISOString(),
                views: 156,
                coverImage: 'https://images.unsplash.com/photo-1603048588669-1b6e9b9c8f8f?w=800'
            }
        ];

        const foundPost = demoPosts.find(p => p.id === parseInt(id));
        setPost(foundPost);
        setLoading(false);
    }, [id]);

    const getTypeColor = (type) => {
        const colors = {
            'FOR_SALE': '#28a745',
            'WANTED': '#ffc107',
            'TRADE': '#17a2b8',
            'SHOWCASE': '#6f42c1'
        };
        return colors[type] || '#6c757d';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка объявления...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="marketplace-container">
                <div className="empty-state">
                    <div className="empty-icon">😢</div>
                    <h3>Объявление не найдено</h3>
                    <button className="shop-btn" onClick={() => navigate('/marketplace')}>
                        Вернуться к объявлениям
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            <div className="marketplace-container">
                <button className="back-btn" onClick={() => navigate('/marketplace')}>
                    ← Назад к объявлениям
                </button>

                <div className="post-detail-card">
                    <div className="detail-image">
                        <img src={post.coverImage} alt={post.vinylTitle} />
                        <div className="detail-badge" style={{ background: getTypeColor(post.type) }}>
                            {post.type === 'FOR_SALE' && '💵 Продам'}
                            {post.type === 'WANTED' && '🔍 Ищу'}
                            {post.type === 'TRADE' && '🔄 Обменяю'}
                            {post.type === 'SHOWCASE' && '🎵 Показываю'}
                        </div>
                    </div>

                    <div className="detail-content">
                        <div className="detail-header">
                            <div className="user-info">
                                <span className="user-avatar">{post.user.avatar}</span>
                                <div>
                                    <div className="user-name">{post.user.username}</div>
                                    <div className="user-meta">
                                        ⭐ {post.user.rating} • с {new Date(post.user.joinedDate).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>
                            <div className="post-stats">
                                <span>👁️ {post.views} просмотров</span>
                                <span>📅 {new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>

                        <h1 className="detail-title">{post.title}</h1>

                        <div className="detail-vinyl">
                            <h3>🎵 О пластинке</h3>
                            <p><strong>{post.vinylTitle}</strong> — {post.vinylArtist}</p>
                            {post.vinylYear && <p>📅 Год выпуска: {post.vinylYear}</p>}
                            {post.condition && <p>💿 Состояние: {post.condition}</p>}
                        </div>

                        <div className="detail-description">
                            <h3>📝 Описание</h3>
                            <p>{post.content}</p>
                        </div>

                        <div className="detail-info">
                            {post.location && (
                                <div className="info-item">
                                    <span className="info-icon">📍</span>
                                    <span>{post.location}</span>
                                </div>
                            )}
                            {post.price && (
                                <div className="info-item price">
                                    <span className="info-icon">💰</span>
                                    <span className="price-value">{post.price.toLocaleString()} ₽</span>
                                </div>
                            )}
                            {post.contactInfo && (
                                <div className="info-item">
                                    <span className="info-icon">📱</span>
                                    <span>{post.contactInfo}</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-actions">
                            <button className="contact-btn" onClick={() => window.location.href = `https://t.me/${post.contactInfo.replace('@', '')}`}>
                                📩 Связаться с продавцом
                            </button>
                            <button className="report-btn">🚨 Пожаловаться</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostDetail;