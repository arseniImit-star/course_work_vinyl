// AddVinylModal.jsx
import React, { useState, useEffect } from 'react';  // ← ДОБАВЬТЕ useEffect
import api from '../api/api';
import './AddVinylModal.css';
import { addToCollection, showNotification } from '../api/api';

function AddVinylModal({ isOpen, onClose, onAdd }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVinyl, setSelectedVinyl] = useState(null);
    const [tracklist, setTracklist] = useState([]);
    const [loadingTracklist, setLoadingTracklist] = useState(false);
    const [step, setStep] = useState('search');
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    // YouTube states
    const [videoResults, setVideoResults] = useState({});
    const [loadingVideo, setLoadingVideo] = useState({});
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);

    // Яндекс.Музыка states
    const [yandexTracks, setYandexTracks] = useState({});
    const [searchingYandex, setSearchingYandex] = useState({});

    // Демо-треклисты для известных пластинок (если API не работает)
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
            ],
            234689: [
                { position: 'A1', title: 'Come Together', duration: '4:20' },
                { position: 'A2', title: 'Something', duration: '3:03' },
                { position: 'A3', title: 'Maxwell\'s Silver Hammer', duration: '3:27' },
                { position: 'B1', title: 'Here Comes the Sun', duration: '3:05' },
                { position: 'B2', title: 'Because', duration: '2:45' }
            ]
        };

        if (demoTracklists[vinylId]) {
            return demoTracklists[vinylId];
        }

        return [
            { position: 'A1', title: `${title || 'Track'} - Part 1`, duration: '—' },
            { position: 'A2', title: `${title || 'Track'} - Part 2`, duration: '—' },
            { position: 'B1', title: `${title || 'Track'} - Part 3`, duration: '—' },
            { position: 'B2', title: `${title || 'Track'} - Part 4`, duration: '—' }
        ];
    };

    // Функция поиска трека на Яндекс.Музыке
    const searchYandexTrack = async (artist, title, trackIndex) => {
        setSearchingYandex(prev => ({ ...prev, [trackIndex]: true }));

        try {
            const response = await api.get('/yandex/track', {
                params: {
                    artist: artist,
                    title: title
                }
            });

            if (response.data) {
                setYandexTracks(prev => ({
                    ...prev,
                    [trackIndex]: response.data
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

    const loadTracklistFromDiscogs = async (vinylId, vinylTitle, vinylArtist) => {
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

    const handleSelectVinyl = async (vinyl) => {
        setSelectedVinyl(vinyl);
        setStep('details');
        await loadTracklistFromDiscogs(vinyl.id, vinyl.title, vinyl.artist);

        // После загрузки треклиста, запускаем поиск на Яндекс.Музыке для каждого трека
        if (tracklist.length > 0 && vinyl.artist) {
            setTimeout(() => {
                tracklist.forEach((track, idx) => {
                    if (track.title) {
                        searchYandexTrack(vinyl.artist, track.title, idx);
                    }
                });
            }, 500);
        }
    };

    // При изменении треклиста запускаем поиск на Яндекс.Музыке
    React.useEffect(() => {
        if (tracklist.length > 0 && selectedVinyl?.artist) {
            tracklist.forEach((track, idx) => {
                if (track.title && !yandexTracks[idx] && !searchingYandex[idx]) {
                    searchYandexTrack(selectedVinyl.artist, track.title, idx);
                }
            });
        }
    }, [tracklist, selectedVinyl]);

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
                [trackIndex]: [{
                    videoId: 'dQw4w9WgXcQ',
                    title: `${artist} - ${trackTitle}`,
                    videoUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
                    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                    channelTitle: 'YouTube'
                }]
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

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPhotos([...photos, ...files]);
        setPhotoPreviews([...photoPreviews, ...newPreviews]);
    };

    const handleAddToCollection = async () => {
        if (!selectedVinyl) return;

        setUploading(true);

        const vinylWithDetails = {
            ...selectedVinyl,
            tracklist: tracklist,
            userComment: comment,
            userRating: rating,
            addedDate: new Date().toISOString(),
            userPhotos: photoPreviews,
            yandexTracks: yandexTracks
        };

        const added = onAdd(vinylWithDetails);

        if (added) {
            showNotification(`✅ "${selectedVinyl.title}" добавлена в коллекцию с оценкой ${rating}★!`, 'success');
            onClose();
            resetForm();
        } else {
            showNotification(`❌ "${selectedVinyl.title}" уже есть в коллекции`, 'error');
        }

        setUploading(false);
    };

    const resetForm = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedVinyl(null);
        setTracklist([]);
        setStep('search');
        setComment('');
        setRating(0);
        setPhotos([]);
        setPhotoPreviews([]);
        setVideoResults({});
        setLoadingVideo({});
        setSelectedVideo(null);
        setShowVideoPlayer(false);
        setYandexTracks({});
        setSearchingYandex({});
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>➕ Добавить пластинку в коллекцию</h2>
                    <p>Найдите пластинку на Discogs и добавьте свои впечатления</p>
                </div>

                {step === 'search' && (
                    <div className="modal-body">
                        <div className="search-section">
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

                        {loading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Поиск на Discogs...</p>
                            </div>
                        )}

                        {searchResults.length > 0 && (
                            <div className="results-grid">
                                {searchResults.map((result, index) => (
                                    <div key={result.id || index} className="result-card" onClick={() => handleSelectVinyl(result)}>
                                        <div className="result-image">
                                            {result.coverImage ? (
                                                <img src={result.coverImage} alt={result.title} />
                                            ) : (
                                                <div className="no-image-small">🎵</div>
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <div className="result-title">{result.title}</div>
                                            <div className="result-artist">{result.artist}</div>
                                            <div className="result-year">{result.year || '—'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchResults.length === 0 && !loading && searchQuery && (
                            <div className="empty-results">
                                <p>😢 Ничего не найдено</p>
                                <p>Попробуйте другой поисковый запрос</p>
                            </div>
                        )}
                    </div>
                )}

                {step === 'details' && selectedVinyl && (
                    <div className="modal-body">
                        <div className="vinyl-preview">
                            <div className="vinyl-preview-image">
                                {selectedVinyl.coverImage ? (
                                    <img src={selectedVinyl.coverImage} alt={selectedVinyl.title} />
                                ) : (
                                    <div className="no-image-large">🎵</div>
                                )}
                            </div>
                            <div className="vinyl-preview-info">
                                <h3>{selectedVinyl.title}</h3>
                                <p className="artist">{selectedVinyl.artist}</p>
                                <p className="year">📅 Год выпуска: {selectedVinyl.year || '—'}</p>
                                <p className="genre">🎸 Жанр: {selectedVinyl.genre || 'Various'}</p>
                            </div>
                        </div>

                        {/* Треклист с интеграцией YouTube и Яндекс.Музыки */}
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

                        <div className="modal-buttons">
                            <button className="back-btn" onClick={() => setStep('search')}>
                                ← Назад
                            </button>
                            <button className="add-btn" onClick={handleAddToCollection} disabled={uploading}>
                                {uploading ? 'Добавление...' : '✅ Добавить в коллекцию'}
                            </button>
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

export default AddVinylModal;