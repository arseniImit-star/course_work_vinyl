// Collection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCollection, removeFromUserCollection, updateUserCollectionItem, showNotification } from '../api/api';
import api from '../api/api';
import './Collection.css';

function Collection() {
    const navigate = useNavigate();
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVinyl, setSelectedVinyl] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [tracklist, setTracklist] = useState([]);
    const [loadingTracklist, setLoadingTracklist] = useState(false);
    const [user, setUser] = useState(null);

    // Редактирование
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editPhotos, setEditPhotos] = useState([]);
    const [editPhotoPreviews, setEditPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // YouTube states
    const [videoResults, setVideoResults] = useState({});
    const [loadingVideo, setLoadingVideo] = useState({});
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            loadCollection(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const loadCollection = async (userId) => {
        setLoading(true);
        const data = await getUserCollection(userId);
        setCollection(data);
        setLoading(false);
    };

    const handleRemove = async (item) => {
        const vinylTitle = item.vinylData?.title || 'пластинка';
        if (window.confirm(`Удалить "${vinylTitle}" из коллекции?`)) {
            const result = await removeFromUserCollection(user.id, item.id);
            if (result.success) {
                showNotification(`❌ "${vinylTitle}" удалена из коллекции`, 'error');
                await loadCollection(user.id);
            } else {
                showNotification(`Ошибка при удалении`, 'error');
            }
        }
    };

    // Загрузка треклиста из Discogs
    const loadTracklist = async (vinylId) => {
        setLoadingTracklist(true);
        try {
            const response = await api.get(`/vinyls/discogs/tracklist/${vinylId}`);
            if (response.data && Array.isArray(response.data)) {
                setTracklist(response.data);
            } else {
                setTracklist([]);
            }
        } catch (error) {
            console.error('Ошибка загрузки треклиста:', error);
            setTracklist([]);
        } finally {
            setLoadingTracklist(false);
        }
    };

    // Поиск видео на YouTube для трека
    const searchVideoForTrack = async (artist, trackTitle, trackIndex) => {
        setLoadingVideo(prev => ({ ...prev, [trackIndex]: true }));

        try {
            const response = await api.get('/youtube/track', {
                params: {
                    artist: artist,
                    track: trackTitle
                }
            });

            setVideoResults(prev => ({
                ...prev,
                [trackIndex]: response.data.videos || []
            }));
        } catch (error) {
            console.error('Ошибка поиска видео:', error);
            setVideoResults(prev => ({
                ...prev,
                [trackIndex]: []
            }));
        } finally {
            setLoadingVideo(prev => ({ ...prev, [trackIndex]: false }));
        }
    };

    // Воспроизведение видео
    const playVideo = (video) => {
        setSelectedVideo(video);
        setShowVideoPlayer(true);
    };

    const handleViewDetails = async (item) => {
        const vinyl = item.vinylData;
        setSelectedVinyl({ ...item, vinylData: vinyl });
        setEditRating(item.userRating || 0);
        setEditComment(item.userComment || '');
        setEditPhotoPreviews(item.userPhotos || []);
        setShowDetails(true);
        setIsEditing(false);
        if (vinyl?.id) {
            await loadTracklist(vinyl.id);
        }
    };

    // Сохранение изменений
    const handleSaveChanges = async () => {
        if (!selectedVinyl) return;

        setUploading(true);
        const result = await updateUserCollectionItem(
            user.id,
            selectedVinyl.id,
            editRating,
            editComment,
            editPhotoPreviews
        );

        if (result.success) {
            showNotification(`✅ Изменения сохранены!`, 'success');
            await loadCollection(user.id);
            setSelectedVinyl({
                ...selectedVinyl,
                userRating: editRating,
                userComment: editComment,
                userPhotos: editPhotoPreviews
            });
            setIsEditing(false);
        } else {
            showNotification(`❌ Ошибка при сохранении`, 'error');
        }
        setUploading(false);
    };

    // Загрузка нового фото
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setEditPhotos([...editPhotos, ...files]);
        setEditPhotoPreviews([...editPhotoPreviews, ...newPreviews]);
    };

    // Удаление фото
    const removePhoto = (index) => {
        const newPreviews = editPhotoPreviews.filter((_, i) => i !== index);
        const newPhotos = editPhotos.filter((_, i) => i !== index);
        setEditPhotoPreviews(newPreviews);
        setEditPhotos(newPhotos);
    };

    const totalRating = collection.reduce((sum, item) => sum + (item.userRating || 0), 0);
    const avgRating = collection.length > 0 ? (totalRating / collection.length).toFixed(1) : 0;

    const goToAddVinyl = () => {
        navigate('/add-vinyl');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка коллекции...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="collection-page">
                <div className="collection-container">
                    <div className="collection-empty">
                        <div className="collection-empty-icon">🔒</div>
                        <h3>Требуется авторизация</h3>
                        <p>Войдите в аккаунт, чтобы просмотреть свою коллекцию</p>
                        <button onClick={() => navigate('/login')} className="collection-add-btn">
                            🔑 Войти
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="collection-page">
            <div className="collection-container">
                {/* Шапка коллекции */}
                <div className="collection-header">
                    <div className="collection-header-icon">💿</div>
                    <h1>Моя коллекция</h1>
                    <p>Ваши виниловые сокровища</p>
                    <button onClick={goToAddVinyl} className="collection-add-btn">
                        ➕ Добавить пластинку
                    </button>
                </div>

                {/* Статистика */}
                <div className="collection-stats">
                    <div className="stat-block">
                        <div className="stat-value">{collection.length}</div>
                        <div className="stat-label">пластинок</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-value">{totalRating}</div>
                        <div className="stat-label">всего звёзд</div>
                    </div>
                    <div className="stat-block">
                        <div className="stat-value">{avgRating}</div>
                        <div className="stat-label">средний рейтинг</div>
                    </div>
                </div>

                {/* Сетка коллекции */}
                {collection.length > 0 ? (
                    <div className="collection-grid">
                        {collection.map((item) => {
                            const vinyl = item.vinylData;
                            return (
                                <div key={item.id} className="collection-card" onClick={() => handleViewDetails(item)}>
                                    <div className="collection-card-cover">
                                        {vinyl?.coverImage ? (
                                            <img src={vinyl.coverImage} alt={vinyl.title} />
                                        ) : (
                                            <div className="collection-card-cover-empty">🎵</div>
                                        )}
                                    </div>
                                    <div className="collection-card-info">
                                        <div className="collection-card-title">{vinyl?.title || 'Без названия'}</div>
                                        <div className="collection-card-artist">{vinyl?.artist || 'Неизвестный исполнитель'}</div>
                                        <div className="collection-card-year">📅 {vinyl?.year || '—'}</div>
                                        {item.userRating > 0 && (
                                            <div className="collection-card-rating">
                                                {'★'.repeat(item.userRating)}{'☆'.repeat(5 - item.userRating)}
                                            </div>
                                        )}
                                        {item.userComment && (
                                            <div className="collection-card-comment">
                                                💬 {item.userComment.length > 40 ? item.userComment.substring(0, 40) + '...' : item.userComment}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="collection-card-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="collection-empty">
                        <div className="collection-empty-icon">📀</div>
                        <h3>Коллекция пуста</h3>
                        <p>Добавьте первую пластинку через поиск на Discogs</p>
                        <button onClick={goToAddVinyl} className="collection-add-btn">
                            ➕ Добавить пластинку
                        </button>
                    </div>
                )}

                {/* Модальное окно с деталями и редактированием */}
                {showDetails && selectedVinyl && (
                    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="modal-detail" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowDetails(false)}>✕</button>

                            <div className="modal-detail-layout">
                                <div className="modal-detail-cover">
                                    {selectedVinyl.vinylData?.coverImage ? (
                                        <img src={selectedVinyl.vinylData.coverImage} alt={selectedVinyl.vinylData.title} />
                                    ) : (
                                        <div className="modal-detail-cover-empty">🎵</div>
                                    )}
                                </div>
                                <div className="modal-detail-info">
                                    <h2>{selectedVinyl.vinylData?.title || 'Без названия'}</h2>
                                    <p className="modal-artist">{selectedVinyl.vinylData?.artist || 'Неизвестный исполнитель'}</p>

                                    {/* Информационная сетка */}
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item">
                                            <span className="detail-info-icon">📅</span>
                                            <span className="detail-info-label">Год выпуска:</span>
                                            <span className="detail-info-value">{selectedVinyl.vinylData?.year || '—'}</span>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-info-icon">🎸</span>
                                            <span className="detail-info-label">Жанр:</span>
                                            <span className="detail-info-value">{selectedVinyl.vinylData?.genre || '—'}</span>
                                        </div>
                                        {selectedVinyl.vinylData?.label && (
                                            <div className="detail-info-item">
                                                <span className="detail-info-icon">🏷️</span>
                                                <span className="detail-info-label">Лейбл:</span>
                                                <span className="detail-info-value">{selectedVinyl.vinylData.label}</span>
                                            </div>
                                        )}
                                        {selectedVinyl.vinylData?.country && (
                                            <div className="detail-info-item">
                                                <span className="detail-info-icon">🌍</span>
                                                <span className="detail-info-label">Страна:</span>
                                                <span className="detail-info-value">{selectedVinyl.vinylData.country}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Треклист из Discogs */}
                                    {loadingTracklist ? (
                                        <div className="tracklist-loading">
                                            <div className="small-spinner"></div>
                                            <p>Загрузка треклиста...</p>
                                        </div>
                                    ) : tracklist.length > 0 && (
                                        <div className="modal-tracklist">
                                            <strong>🎵 Треклист</strong>
                                            <div className="tracklist-items">
                                                {tracklist.map((track, idx) => (
                                                    <div key={idx} className="tracklist-item">
                                                        <div className="tracklist-item-header">
                                                            <span className="track-num">{track.position || idx + 1}</span>
                                                            <span className="track-name">{track.title}</span>
                                                            <span className="track-duration">{track.duration || '—'}</span>
                                                            <button
                                                                className="youtube-search-btn"
                                                                onClick={() => searchVideoForTrack(
                                                                    selectedVinyl.vinylData?.artist,
                                                                    track.title,
                                                                    idx
                                                                )}
                                                                disabled={loadingVideo[idx]}
                                                                title="Найти на YouTube"
                                                            >
                                                                {loadingVideo[idx] ? '⏳' : '🎵'}
                                                            </button>
                                                        </div>

                                                        {/* Результаты поиска YouTube */}
                                                        {videoResults[idx] && videoResults[idx].length > 0 && (
                                                            <div className="video-results">
                                                                {videoResults[idx].slice(0, 3).map((video, vidIdx) => (
                                                                    <div
                                                                        key={vidIdx}
                                                                        className="video-result-item"
                                                                        onClick={() => playVideo(video)}
                                                                    >
                                                                        <img src={video.thumbnailUrl} alt={video.title} />
                                                                        <div className="video-info">
                                                                            <div className="video-title">{video.title.substring(0, 50)}</div>
                                                                            <div className="video-channel">{video.channelTitle}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!loadingTracklist && tracklist.length === 0 && (
                                        <div className="modal-tracklist-empty">
                                            <p>📝 Треклист не найден для этой пластинки</p>
                                        </div>
                                    )}

                                    {/* Редактирование оценки и комментария */}
                                    {!isEditing ? (
                                        <>
                                            {selectedVinyl.userRating > 0 && (
                                                <div className="rating-section">
                                                    <label>⭐ Ваша оценка:</label>
                                                    <div className="stars">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} className={`star ${(selectedVinyl.userRating || 0) >= star ? 'active' : ''}`}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedVinyl.userComment && (
                                                <div className="comment-section">
                                                    <label>💬 Ваш комментарий:</label>
                                                    <p className="comment-text">{selectedVinyl.userComment}</p>
                                                </div>
                                            )}

                                            {selectedVinyl.userPhotos && selectedVinyl.userPhotos.length > 0 && (
                                                <div className="photos-section">
                                                    <label>📸 Фотографии вашей пластинки:</label>
                                                    <div className="photo-previews">
                                                        {selectedVinyl.userPhotos.map((photo, idx) => (
                                                            <div key={idx} className="photo-preview">
                                                                <img src={photo} alt={`Фото ${idx + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                className="edit-btn"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                ✏️ Редактировать
                                            </button>
                                        </>
                                    ) : (
                                        <div className="edit-section">
                                            <h4>✏️ Редактировать</h4>

                                            <div className="rating-section">
                                                <label>⭐ Ваша оценка:</label>
                                                <div className="stars">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span
                                                            key={star}
                                                            className={`star ${editRating >= star ? 'active' : ''}`}
                                                            onClick={() => setEditRating(star)}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="comment-section">
                                                <label>💬 Ваш комментарий:</label>
                                                <textarea
                                                    className="comment-input"
                                                    placeholder="Поделитесь впечатлениями о пластинке..."
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    rows="3"
                                                />
                                            </div>

                                            <div className="photos-section">
                                                <label>📸 Фотографии вашей пластинки:</label>
                                                <div className="photo-upload-area">
                                                    <input
                                                        type="file"
                                                        id="photo-upload"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="photo-upload" className="upload-label">
                                                        📸 Нажмите или перетащите фото
                                                    </label>
                                                    <p className="upload-hint">Обложка, пластинка, конверт — до 5 фото</p>
                                                </div>

                                                {editPhotoPreviews.length > 0 && (
                                                    <div className="photo-previews">
                                                        {editPhotoPreviews.map((preview, idx) => (
                                                            <div key={idx} className="photo-preview">
                                                                <img src={preview} alt={`preview-${idx}`} />
                                                                <button
                                                                    className="remove-photo"
                                                                    onClick={() => removePhoto(idx)}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="edit-buttons">
                                                <button
                                                    className="save-btn"
                                                    onClick={handleSaveChanges}
                                                    disabled={uploading}
                                                >
                                                    {uploading ? 'Сохранение...' : '💾 Сохранить'}
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditRating(selectedVinyl.userRating || 0);
                                                        setEditComment(selectedVinyl.userComment || '');
                                                        setEditPhotoPreviews(selectedVinyl.userPhotos || []);
                                                    }}
                                                >
                                                    ✖️ Отмена
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="modal-date">
                                        Добавлено: {new Date(selectedVinyl.addedDate).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* YouTube Player Modal */}
                {showVideoPlayer && selectedVideo && (
                    <div className="video-modal-overlay" onClick={() => setShowVideoPlayer(false)}>
                        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="video-modal-close" onClick={() => setShowVideoPlayer(false)}>×</button>
                            <h3>{selectedVideo.title}</h3>
                            <div className="video-container">
                                <iframe
                                    width="100%"
                                    height="400"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="video-details">
                                <p>📺 Канал: {selectedVideo.channelTitle}</p>
                                <p>👁️ Просмотров: {selectedVideo.viewCount?.toLocaleString() || '—'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Collection;