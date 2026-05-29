// AddVinyl.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { addToCollection } from '../api/api';
import './AddVinyl.css';

function AddVinyl() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVinyl, setSelectedVinyl] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [tracklist, setTracklist] = useState([]);
    const [loadingTracklist, setLoadingTracklist] = useState(false);
    const [tracklistError, setTracklistError] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/vinyls/discogs/search?query=${encodeURIComponent(searchQuery)}&limit=12`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            alert('Ошибка при поиске на Discogs');
        } finally {
            setLoading(false);
        }
    };

    const handleVinylClick = async (vinyl) => {
        setSelectedVinyl(vinyl);
        setShowDetails(true);
        setTracklistError(false);

        // Загружаем треклист для выбранной пластинки через бэкенд
        await loadTracklist(vinyl.id);
    };

    const loadTracklist = async (vinylId) => {
        setLoadingTracklist(true);
        setTracklistError(false);

        try {
            // Запрос к бэкенду, который уже имеет токен Discogs
            const response = await api.get(`/vinyls/discogs/tracklist/${vinylId}`);

            if (response.data && Array.isArray(response.data)) {
                setTracklist(response.data);
                console.log('Треклист загружен:', response.data.length, 'треков');
            } else {
                setTracklist([]);
                setTracklistError(true);
            }
        } catch (error) {
            console.error('Ошибка загрузки треклиста:', error);
            console.error('Детали ошибки:', error.response?.data);
            setTracklist([]);
            setTracklistError(true);

            // Показываем более информативное сообщение об ошибке
            if (error.response?.status === 401) {
                console.error('Ошибка авторизации Discogs. Проверьте токен.');
            } else if (error.response?.status === 404) {
                console.error('Треклист не найден для этого релиза');
            }
        } finally {
            setLoadingTracklist(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotos([...photos, ...files]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };

    const handleAddToCollection = (vinyl) => {
        addToCollection(vinyl);
        // Обновляем отображение
        loadCollection();
    };

    return (
        <div className="add-vinyl-page">
            <div className="add-vinyl-container">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-content">
                        <div className="hero-icon">🎵</div>
                        <h1 className="hero-title">Добавить пластинку в коллекцию</h1>
                        <p className="hero-subtitle">Найдите пластинку на Discogs и добавьте свои впечатления</p>
                    </div>
                </div>

                {/* Search Section */}
                <div className="search-section-wrapper">
                    <div className="search-card">
                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="🔍 Введите название пластинки или исполнителя..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="search-btn" onClick={handleSearch} disabled={loading}>
                                {loading ? 'Поиск...' : 'Найти на Discogs'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="vinyl-spinner"></div>
                        <p>🔍 Поиск на Discogs...</p>
                    </div>
                )}

                {/* Results Grid - 3 columns */}
                {searchResults.length > 0 && !loading && (
                    <div className="results-section">
                        <div className="results-header">
                            <h2>🔍 Результаты поиска</h2>
                            <p>Найдено {searchResults.length} пластинок</p>
                        </div>
                        <div className="results-grid">
                            {searchResults.map((result, index) => (
                                <div key={result.id || index} className="result-card" onClick={() => handleVinylClick(result)}>
                                    <div className="result-image">
                                        {result.coverImage ? (
                                            <img src={result.coverImage} alt={result.title} />
                                        ) : (
                                            <div className="no-image">🎵</div>
                                        )}
                                    </div>
                                    <div className="result-info">
                                        <div className="result-title">{result.title}</div>
                                        <div className="result-artist">{result.artist}</div>
                                        <div className="result-year">📅 {result.year || '—'}</div>
                                        {result.genre && <div className="result-genre">{result.genre}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {searchResults.length === 0 && !loading && searchQuery && (
                    <div className="empty-state">
                        <div className="empty-icon">😢</div>
                        <h3>Ничего не найдено</h3>
                        <p>Попробуйте другой поисковый запрос</p>
                        <button className="reset-search-btn" onClick={() => setSearchQuery('')}>
                            🔄 Очистить поиск
                        </button>
                    </div>
                )}

                {searchResults.length === 0 && !loading && !searchQuery && (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Начните поиск</h3>
                        <p>Введите название пластинки или исполнителя для поиска на Discogs</p>
                    </div>
                )}

                {/* Modal for Vinyl Details */}
                {showDetails && selectedVinyl && (
                    <div className="detail-modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="detail-modal-close" onClick={() => setShowDetails(false)}>×</button>

                            <div className="detail-modal-body">
                                <div className="detail-vinyl-preview">
                                    <div className="detail-vinyl-image">
                                        {selectedVinyl.coverImage ? (
                                            <img src={selectedVinyl.coverImage} alt={selectedVinyl.title} />
                                        ) : (
                                            <div className="detail-no-image">🎵</div>
                                        )}
                                    </div>
                                    <div className="detail-vinyl-info">
                                        <h2>{selectedVinyl.title}</h2>
                                        <p className="detail-artist">{selectedVinyl.artist}</p>
                                        <p className="detail-year">📅 Год выпуска: {selectedVinyl.year || '—'}</p>
                                        <p className="detail-genre">🎸 Жанр: {selectedVinyl.genre || '—'}</p>
                                        {selectedVinyl.label && (
                                            <p className="detail-label">🏷️ Лейбл: {selectedVinyl.label}</p>
                                        )}
                                        {selectedVinyl.country && (
                                            <p className="detail-country">🌍 Страна: {selectedVinyl.country}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Треклист */}
                                {loadingTracklist && (
                                    <div className="tracklist-loading">
                                        <div className="small-spinner"></div>
                                        <p>Загрузка треклиста с Discogs...</p>
                                    </div>
                                )}

                                {!loadingTracklist && tracklistError && (
                                    <div className="tracklist-error">
                                        <p>⚠️ Не удалось загрузить треклист</p>
                                        <button
                                            className="retry-tracklist-btn"
                                            onClick={() => loadTracklist(selectedVinyl.id)}
                                        >
                                            🔄 Повторить попытку
                                        </button>
                                    </div>
                                )}

                                {!loadingTracklist && !tracklistError && tracklist.length > 0 && (
                                    <div className="tracklist-section">
                                        <h4>🎵 Треклист</h4>
                                        <div className="tracklist-items">
                                            {tracklist.map((track, idx) => (
                                                <div key={idx} className="tracklist-item-with-yandex">
                                                    <div className="tracklist-item-main">
                                                        <span className="track-num">{track.position || idx + 1}</span>
                                                        <span className="track-name">{track.title}</span>
                                                        <span className="track-duration">{track.duration || '—'}</span>

                                                        {/* Индикатор поиска на Яндекс.Музыке */}
                                                        {searchingYandex[idx] ? (
                                                            <span className="yandex-loading">⏳</span>
                                                        ) : yandexTracks[idx] ? (
                                                            <span className="yandex-found" title="Найдено на Яндекс.Музыке">✅</span>
                                                        ) : (
                                                            <span className="yandex-not-found" title="Не найдено на Яндекс.Музыке">❌</span>
                                                        )}

                                                        {/* Кнопка прослушивания отрывка (если есть preview) */}
                                                        {yandexTracks[idx] && yandexTracks[idx].previewUrl ? (
                                                            <button
                                                                className={`play-track-btn ${playingTrack === idx ? 'playing' : ''}`}
                                                                onClick={() => playTrack(yandexTracks[idx].previewUrl, idx)}
                                                                title={playingTrack === idx ? 'Остановить' : 'Прослушать отрывок'}
                                                            >
                                                                {playingTrack === idx ? '⏸️' : '🎵'}
                                                            </button>
                                                        ) : yandexTracks[idx] && (
                                                            <button
                                                                className="play-track-btn disabled"
                                                                disabled
                                                                title="Нет доступного отрывка"
                                                            >
                                                                🔇
                                                            </button>
                                                        )}

                                                        {/* Кнопка поиска на YouTube */}
                                                        <button
                                                            className="youtube-fallback-btn"
                                                            onClick={() => searchOnYouTube(selectedVinyl.artist, track.title)}
                                                            title="Искать на YouTube"
                                                        >
                                                            🎬
                                                        </button>
                                                    </div>

                                                    {/* Информация о найденном треке на Яндекс.Музыке */}
                                                    {yandexTracks[idx] && (
                                                        <div className="yandex-track-info">
                                                            {yandexTracks[idx].coverUrl && (
                                                                <img
                                                                    src={yandexTracks[idx].coverUrl}
                                                                    alt={yandexTracks[idx].title}
                                                                    className="yandex-track-cover"
                                                                />
                                                            )}
                                                            <div className="yandex-track-details">
                                                                <div className="yandex-track-title">{yandexTracks[idx].title}</div>
                                                                <div className="yandex-track-artist">{yandexTracks[idx].artist}</div>
                                                                {yandexTracks[idx].album && (
                                                                    <div className="yandex-track-album">{yandexTracks[idx].album}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Если трек не найден, показываем кнопку поиска на YouTube */}
                                                    {!searchingYandex[idx] && !yandexTracks[idx] && (
                                                        <div className="yandex-track-notfound">
                                                            <span>❌ Не найдено на Яндекс.Музыке</span>
                                                            <button
                                                                className="search-youtube-btn"
                                                                onClick={() => searchOnYouTube(selectedVinyl.artist, track.title)}
                                                            >
                                                                🔍 Искать на YouTube
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                {!loadingTracklist && !tracklistError && tracklist.length === 0 && (
                                    <div className="tracklist-empty">
                                        <p>📝 Треклист не доступен для этой пластинки</p>
                                    </div>
                                )}

                                <div className="rating-section">
                                    <label>⭐ Ваша оценка:</label>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={`star ${rating >= star ? 'active' : ''}`}
                                                onClick={() => setRating(star)}
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
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
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

                                    {photoPreviews.length > 0 && (
                                        <div className="photo-previews">
                                            {photoPreviews.map((preview, idx) => (
                                                <div key={idx} className="photo-preview">
                                                    <img src={preview} alt={`preview-${idx}`} />
                                                    <button
                                                        className="remove-photo"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newPreviews = photoPreviews.filter((_, i) => i !== idx);
                                                            const newPhotos = photos.filter((_, i) => i !== idx);
                                                            setPhotoPreviews(newPreviews);
                                                            setPhotos(newPhotos);
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="detail-modal-actions">
                                    <button
                                        className="detail-back-btn"
                                        onClick={() => setShowDetails(false)}
                                    >
                                        ← Назад к поиску
                                    </button>
                                    <button
                                        className="detail-add-btn"
                                        onClick={handleAddToCollection}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Добавление...' : '✅ Добавить в коллекцию'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddVinyl;