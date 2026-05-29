// AddVinylPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { addToCollection, showNotification } from '../api/api';
import './AddVinyl.css';

function AddVinylPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVinyl, setSelectedVinyl] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [tracklist, setTracklist] = useState([]);
    const [loadingTracklist, setLoadingTracklist] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Яндекс.Музыка states
    const [yandexTracks, setYandexTracks] = useState({});
    const [searchingYandex, setSearchingYandex] = useState({});
    const [playingTrack, setPlayingTrack] = useState(null);
    const audioRef = useRef(null);
    const [loadingTrack, setLoadingTrack] = useState({});

    // RuTube states
    const [rutubeResults, setRuTubeResults] = useState({});
    const [searchingRuTube, setSearchingRuTube] = useState({});
    // Добавьте новые состояния в секцию с useState
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState({}); // { trackIndex: true/false }
    const toggleVideo = (trackIndex, video) => {
        setExpandedVideo(prev => ({
            ...prev,
            [trackIndex]: !prev[trackIndex]
        }));
        if (!expandedVideo[trackIndex]) {
            setSelectedVideo(video);
        } else {
            setSelectedVideo(null);
        }
    };
    // Демо-треклисты для известных пластинок (fallback)
    const getDemoTracklist = (vinylId, title, artist) => {
        const demoTracklists = {
            3110951: [
                { position: 'A1', title: 'Keep Yourself Alive', duration: '3:47' },
                { position: 'A2', title: 'Doing All Right', duration: '4:09' },
                { position: 'A3', title: 'Great King Rat', duration: '5:43' },
                { position: 'A4', title: 'My Fairy King', duration: '4:08' },
                { position: 'B1', title: 'Liar', duration: '6:25' },
                { position: 'B2', title: 'The Night Comes Down', duration: '4:23' },
                { position: 'B3', title: 'Modern Times Rock\'n\'Roll', duration: '1:48' },
                { position: 'B4', title: 'Son and Daughter', duration: '3:21' },
                { position: 'B5', title: 'Jesus', duration: '3:44' },
                { position: 'B6', title: 'Seven Seas of Rhye...', duration: '1:15' }
            ],
            196784: [
                { position: 'A1', title: 'Rain (Original Mix)', duration: '5:39' },
                { position: 'B1', title: 'Rain (Pacific Link Remix)', duration: '6:55' },
                { position: 'B2', title: 'Rain (Cool Mix)', duration: '5:52' }
            ]
        };

        if (demoTracklists[vinylId]) {
            return demoTracklists[vinylId];
        }
        return [];
    };

    // Функция поиска трека на Яндекс.Музыке
    const searchYandexTrack = async (artist, title, trackIndex) => {
        setSearchingYandex(prev => ({ ...prev, [trackIndex]: true }));

        const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
        const query = `${artist} ${cleanTitle}`;

        try {
            const response = await api.get('/yandex/search', {
                params: { q: query, limit: 10 }
            });

            if (response.data.tracks && response.data.tracks.length > 0) {
                let bestMatch = null;
                let bestScore = 0;

                for (const track of response.data.tracks) {
                    let score = 0;

                    const trackArtist = track.artist.toLowerCase();
                    const searchArtist = artist.toLowerCase();
                    if (trackArtist.includes(searchArtist) || searchArtist.includes(trackArtist)) {
                        score += 3;
                    }

                    const trackTitle = track.title.toLowerCase();
                    const searchTitle = cleanTitle.toLowerCase();
                    if (trackTitle === searchTitle) {
                        score += 5;
                    } else if (trackTitle.includes(searchTitle) || searchTitle.includes(trackTitle)) {
                        score += 2;
                    }

                    if (trackTitle.startsWith(searchTitle) || searchTitle.startsWith(trackTitle)) {
                        score += 1;
                    }

                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = track;
                    }
                }

                if (bestMatch && bestScore >= 2) {
                    setYandexTracks(prev => ({
                        ...prev,
                        [trackIndex]: bestMatch
                    }));
                    console.log(`✅ Найден трек: ${bestMatch.artist} - ${bestMatch.title} (score: ${bestScore})`);
                } else {
                    setYandexTracks(prev => ({
                        ...prev,
                        [trackIndex]: null
                    }));
                    console.log(`❌ Трек не найден: ${artist} - ${cleanTitle}`);
                }
            } else {
                setYandexTracks(prev => ({
                    ...prev,
                    [trackIndex]: null
                }));
            }
        } catch (error) {
            console.error('Ошибка поиска на Яндекс.Музыке:', error);
            setYandexTracks(prev => ({
                ...prev,
                [trackIndex]: null
            }));
        } finally {
            setSearchingYandex(prev => ({ ...prev, [trackIndex]: false }));
        }
    };

    // Функция воспроизведения preview
    const playPreview = (previewUrl, trackIndex) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;

            if (playingTrack === trackIndex) {
                setPlayingTrack(null);
                return;
            }
        }

        if (!previewUrl) {
            showNotification('Нет доступного отрывка для прослушивания', 'error');
            return;
        }

        setLoadingTrack(prev => ({ ...prev, [trackIndex]: true }));
        setPlayingTrack(trackIndex);

        try {
            const audio = new Audio(previewUrl);
            audio.play();
            audioRef.current = audio;

            audio.onended = () => {
                setPlayingTrack(null);
                audioRef.current = null;
                setLoadingTrack(prev => ({ ...prev, [trackIndex]: false }));
            };

            audio.onerror = () => {
                console.error('Ошибка воспроизведения');
                setPlayingTrack(null);
                audioRef.current = null;
                setLoadingTrack(prev => ({ ...prev, [trackIndex]: false }));
                showNotification('Не удалось воспроизвести отрывок', 'error');
            };

        } catch (error) {
            console.error('Ошибка воспроизведения:', error);
            setPlayingTrack(null);
            setLoadingTrack(prev => ({ ...prev, [trackIndex]: false }));
            showNotification('Ошибка при воспроизведении', 'error');
        }
    };

    // Функция поиска на RuTube
    const searchRuTube = async (artist, title, trackIndex) => {
        // Проверяем, что это всё ещё текущая пластинка
        if (!selectedVinyl) return;

        setSearchingRuTube(prev => ({ ...prev, [trackIndex]: true }));

        try {
            const response = await api.get('/rutube/track', {
                params: { artist, track: title }
            });

            // Проверяем, что пластинка не изменилась за время запроса
            if (selectedVinyl) {
                setRuTubeResults(prev => ({
                    ...prev,
                    [trackIndex]: response.data.videos || []
                }));
            }
        } catch (error) {
            console.error('Ошибка поиска на RuTube:', error);
        } finally {
            setSearchingRuTube(prev => ({ ...prev, [trackIndex]: false }));
        }
    };

    // Функция открытия видео на RuTube
    const openRuTubeVideo = (video) => {
        setSelectedVideo(video);
        setShowVideoPlayer(true);
    };

    // Функция закрытия плеера
    const closeVideoPlayer = () => {
        setSelectedVideo(null);
        setShowVideoPlayer(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/vinyls/discogs/search?query=${encodeURIComponent(searchQuery)}&limit=12`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            showNotification('Ошибка при поиске на Discogs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadTracklist = async (vinylId, vinylTitle, vinylArtist) => {
        setLoadingTracklist(true);

        try {
            const response = await api.get(`/vinyls/discogs/tracklist/${vinylId}`);

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                console.log('✅ Треклист загружен через API для', vinylId);
                setTracklist(response.data);
            } else {
                console.log('📀 API вернул пустой треклист, используем демо-данные для', vinylId);
                const demoTracklist = getDemoTracklist(vinylId, vinylTitle, vinylArtist);
                setTracklist(demoTracklist);
            }
        } catch (error) {
            console.error('Ошибка загрузки треклиста:', error);
            const demoTracklist = getDemoTracklist(vinylId, vinylTitle, vinylArtist);
            setTracklist(demoTracklist);
        } finally {
            setLoadingTracklist(false);
        }
    };


    // После загрузки треклиста ищем треки на Яндекс.Музыке
    // Очистка при размонтировании компонента
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotos([...photos, ...files]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };
    const handleVinylClick = async (vinyl) => {
        // Очищаем предыдущие результаты перед загрузкой новой пластинки
        setYandexTracks({});
        setSearchingYandex({});
        setRuTubeResults({});
        setSearchingRuTube({});
        setPlayingTrack(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setSelectedVinyl(vinyl);
        setShowDetails(true);
        await loadTracklist(vinyl.id, vinyl.title, vinyl.artist);
    };
const handleCloseModal = () => {
    setShowDetails(false);
    setSelectedVinyl(null);
    setTracklist([]);
    setYandexTracks({});
    setSearchingYandex({});
    setRuTubeResults({});
    setSearchingRuTube({});
    setPlayingTrack(null);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
};

    const handleAddToCollection = async () => {
        if (!selectedVinyl) return;

        setUploading(true);

        const vinylWithDetails = {
            ...selectedVinyl,
            tracklist: tracklist,
            yandexTracks: yandexTracks,
            userComment: comment,
            userRating: rating,
            addedDate: new Date().toISOString(),
            userPhotos: photoPreviews
        };

        const added = addToCollection(vinylWithDetails);

        if (added) {
            showNotification(`✅ "${selectedVinyl.title}" добавлена в коллекцию с оценкой ${rating}★!`, 'success');
            setShowDetails(false);
            setSelectedVinyl(null);
            setTracklist([]);
            setYandexTracks({});
            setComment('');
            setRating(0);
            setPhotos([]);
            setPhotoPreviews([]);
            navigate('/collection');
        } else {
            showNotification(`❌ "${selectedVinyl.title}" уже есть в коллекции`, 'error');
        }

        setUploading(false);
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

                {/* Results Grid */}
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
                    <div className="detail-modal-overlay" onClick={handleCloseModal}>
                        <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="detail-modal-close" onClick={handleCloseModal}>×</button>

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

                                {/* Треклист с Яндекс.Музыкой и RuTube */}
                                {loadingTracklist ? (
                                    <div className="tracklist-loading">
                                        <div className="small-spinner"></div>
                                        <p>Загрузка треклиста с Discogs...</p>
                                    </div>
                                ) : tracklist.length > 0 && (
                                    <div className="tracklist-section">
                                        <h4>🎵 Треклист</h4>
                                        <div className="tracklist-items">
                                            {tracklist.map((track, idx) => (
                                                <div key={idx} className="tracklist-item-simple">
                                                    <div className="tracklist-item-main">
                                                        <span className="track-num">{track.position || idx + 1}</span>
                                                        <span className="track-name">{track.title}</span>
                                                        <span className="track-duration">{track.duration || '—'}</span>

                                                        {/* Индикатор поиска на Яндекс.Музыке */}
                                                        {searchingYandex[idx] ? (
                                                            <span className="yandex-loading">⏳</span>
                                                        ) : yandexTracks[idx] ? (
                                                            <>
                                                                <button
                                                                    className={`play-track-btn ${playingTrack === idx ? 'playing' : ''}`}
                                                                    onClick={() => playPreview(yandexTracks[idx].previewUrl, idx)}
                                                                    disabled={!yandexTracks[idx].previewUrl}
                                                                    title={yandexTracks[idx].previewUrl ? 'Прослушать отрывок (30 сек)' : 'Нет отрывка'}
                                                                >
                                                                    {playingTrack === idx ? '⏸️' : (yandexTracks[idx].previewUrl ? '🎵' : '🔇')}
                                                                </button>
                                                                <span className="yandex-found" title="Найдено на Яндекс.Музыке">✅</span>
                                                            </>
                                                        ) : (
                                                            <span className="yandex-not-found" title="Не найдено на Яндекс.Музыке"></span>
                                                        )}

                                                        {/* Кнопка поиска на RuTube */}
                                                        <button
                                                            className="rutube-search-btn"
                                                            onClick={() => searchRuTube(selectedVinyl.artist, track.title, idx)}
                                                            disabled={searchingRuTube[idx]}
                                                            title="Искать на RuTube"
                                                        >
                                                            {searchingRuTube[idx] ? '⏳' : '📺'}
                                                        </button>
                                                    </div>

                                                    {/* Результаты поиска на RuTube - без лишних надписей и фото */}
                                                    {rutubeResults[idx] && rutubeResults[idx].length > 0 && (
                                                        <div className="rutube-results">
                                                            <div className="rutube-results-header">
                                                                <span>📺 Найдено на RuTube:</span>
                                                                <button
                                                                    className="rutube-clear-results"
                                                                    onClick={() => {
                                                                        setRuTubeResults(prev => ({ ...prev, [idx]: [] }));
                                                                    }}
                                                                    title="Закрыть результаты"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            {rutubeResults[idx].slice(0, 1).map((video, vidIdx) => (
                                                                <div
                                                                    key={vidIdx}
                                                                    className="rutube-video-item"
                                                                    onClick={() => openRuTubeVideo(video)}
                                                                >
                                                                    <img
                                                                        src={video.thumbnailUrl}
                                                                        alt={video.title}
                                                                        className="rutube-video-thumbnail"
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                    <div className="rutube-video-info">
                                                                        <div className="rutube-video-title">{video.title}</div>
                                                                        <div className="rutube-video-channel">{video.author}</div>
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
                                                        onClick={() => {
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
                                {/* RuTube Video Player Modal */}
                                {showVideoPlayer && selectedVideo && (
                                    <div className="video-modal-overlay" onClick={closeVideoPlayer}>
                                        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                                            <button className="video-modal-close" onClick={closeVideoPlayer}>×</button>
                                            <h3>{selectedVideo.title}</h3>
                                            <div className="video-container">
                                                <iframe
                                                    width="100%"
                                                    height="400"
                                                    src={`https://rutube.ru/play/embed/${selectedVideo.id}`}
                                                    title={selectedVideo.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <div className="video-details">
                                                <p>📺 Канал: {selectedVideo.author}</p>
                                                <p>👁️ Просмотров: {selectedVideo.views?.toLocaleString() || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddVinylPage;