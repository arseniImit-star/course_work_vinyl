import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { showNotification } from '../api/api';
import './ListingDetail.css';

function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            setUser(JSON.parse(userData));
        }

        loadListing();
        loadComments();
    }, [id]);

    const loadListing = async () => {
        try {
            const response = await api.get(`/marketplace/listings/${id}`);
            setListing(response.data);
        } catch (error) {
            console.error('Ошибка загрузки объявления:', error);
            showNotification('❌ Ошибка загрузки объявления', 'error');
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const response = await api.get(`/marketplace/listings/${id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Ошибка загрузки комментариев:', error);
            setComments([]);
        }
    };

    // 🔥 Функция удаления объявления (добавлена)
    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;

        try {
            const response = await api.delete(`/marketplace/listings/${id}`);
            if (response.data.success) {
                showNotification('✅ Объявление удалено', 'success');
                navigate('/marketplace'); // Перенаправляем на список объявлений
            } else {
                showNotification('❌ Не удалось удалить объявление', 'error');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showNotification('❌ Ошибка при удалении объявления', 'error');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            showNotification('🔒 Войдите, чтобы оставить комментарий', 'error');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/marketplace/listings/${id}/comments`, {
                content: newComment,
                userId: user.id
            });

            if (response.data.success) {
                showNotification('✅ Комментарий добавлен', 'success');
                setNewComment('');
                loadComments();
            } else {
                showNotification(response.data.error || '❌ Ошибка при добавлении', 'error');
            }
        } catch (error) {
            console.error('Ошибка добавления комментария:', error);
            showNotification('❌ Ошибка при добавлении комментария', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const goToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const startChat = () => {
        if (!user) {
            showNotification('🔒 Войдите, чтобы написать сообщение', 'error');
            navigate('/login');
            return;
        }

        if (user.id === listing.userId) {
            showNotification('❌ Это ваше объявление, вы не можете написать себе', 'error');
            return;
        }

        navigate(`/messages/${listing.userId}`, { state: { listing } });
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'SALE': return '💰';
            case 'EXCHANGE': return '🔄';
            case 'SEARCH': return '🔍';
            case 'RECORD': return '🎵';
            default: return '📦';
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'SALE': return 'Продажа';
            case 'EXCHANGE': return 'Обмен';
            case 'SEARCH': return 'Поиск';
            case 'RECORD': return 'На показ';
            default: return type;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'SALE': return '#28a745';
            case 'EXCHANGE': return '#17a2b8';
            case 'SEARCH': return '#ffc107';
            case 'RECORD': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка объявления...</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>Объявление не найдено</h3>
                <button onClick={() => navigate('/marketplace')} className="shop-btn">
                    ← Вернуться к объявлениям
                </button>
            </div>
        );
    }

    return (
        <div className="listing-detail-page">
            <div className="listing-detail-container">
                <button className="back-btn" onClick={() => navigate('/marketplace')}>
                    ← Назад к объявлениям
                </button>

                <div className="detail-card">
                    <div className="detail-header">
                        <div className="listing-type-badge" style={{ background: getTypeColor(listing.type) }}>
                            {getTypeIcon(listing.type)} {getTypeLabel(listing.type)}
                        </div>
                        {/* 🔥 Кнопка удаления для владельца (добавлена в шапку) */}
                        {listing.userId === user?.id && (
                            <button className="delete-listing-btn-header" onClick={handleDelete}>
                                🗑️ Удалить объявление
                            </button>
                        )}
                    </div>

                    <div className="detail-content">
                        <div className="detail-image">
                            <img src={listing.vinylData?.coverImage || 'https://via.placeholder.com/400'} alt={listing.title} />
                        </div>

                        <div className="detail-info">
                            <h1>{listing.title}</h1>
                            <div className="detail-meta">
                                <span>🎵 {listing.vinylData?.artist}</span>
                                <span>📅 {listing.vinylData?.year || '—'}</span>
                                {listing.type === 'SALE' && listing.price && (
                                    <span className="price">💰 {listing.price} ₽</span>
                                )}
                                {listing.type === 'EXCHANGE' && listing.desiredRecords && (
                                    <span className="desired">🔄 Хочу: {listing.desiredRecords}</span>
                                )}
                            </div>

                            <div className="detail-description">
                                <h3>📖 Описание</h3>
                                <p>{listing.description || 'Описание отсутствует'}</p>
                            </div>

                            <div className="seller-section">
                                <h3>👤 Продавец</h3>
                                <div className="seller-card">
                                    <div className="seller-avatar-large">
                                        {listing.userAvatar ? (
                                            <img src={listing.userAvatar} alt={listing.username} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div className="seller-details">
                                        <div className="seller-name">{listing.username}</div>
                                        <Link to={`/profile/${listing.userId}`} className="view-profile-btn">
                                            📋 Просмотреть профиль
                                        </Link>
                                    </div>
                                    {listing.userId !== user?.id && (
                                        <button className="message-seller-btn" onClick={startChat}>
                                            💬 Написать продавцу
                                        </button>
                                    )}
                                    {/* 🔥 Альтернативный вариант: кнопка удаления также может быть здесь */}
                                    {/* {listing.userId === user?.id && (
                                        <button className="delete-listing-btn" onClick={handleDelete}>
                                            🗑️ Удалить объявление
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="comments-section">
                    <h3>💬 Комментарии ({comments.length})</h3>

                    {user ? (
                        <form onSubmit={handleAddComment} className="add-comment-form">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Напишите комментарий..."
                                rows="3"
                                disabled={submitting}
                            />
                            <button type="submit" disabled={submitting || !newComment.trim()}>
                                {submitting ? 'Отправка...' : '📝 Отправить'}
                            </button>
                        </form>
                    ) : (
                        <div className="login-to-comment">
                            <p>🔒 <Link to="/login">Войдите</Link>, чтобы оставить комментарий</p>
                        </div>
                    )}

                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <div className="no-comments">
                                <p>Нет комментариев. Будьте первым!</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-avatar">
                                        {comment.userAvatar ? (
                                            <img src={comment.userAvatar} alt={comment.username} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                <Link to={`/profile/${comment.userId}`}>{comment.username}</Link>
                                            </span>
                                            <span className="comment-date">
                                                {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <p className="comment-text">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListingDetail;