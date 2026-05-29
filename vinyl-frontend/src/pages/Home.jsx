// Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { addToUserCollection, getUserCollection, showNotification } from '../api/api';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const [vinyls, setVinyls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [collection, setCollection] = useState([]);
    const [activeGenre, setActiveGenre] = useState('all');
    const [selectedVinyl, setSelectedVinyl] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [tracklists, setTracklists] = useState({});
    const [loadingTracklist, setLoadingTracklist] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // RuTube states - ТОЛЬКО ОДИН РАЗ
    const [rutubeResults, setRuTubeResults] = useState({});
    const [searchingRuTube, setSearchingRuTube] = useState({});
    const [expandedVideo, setExpandedVideo] = useState({});
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Функция открытия видео в отдельном окне
    const openVideoModal = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };

    // Функция закрытия видео
    const closeVideoModal = () => {
        setSelectedVideo(null);
        setShowVideoModal(false);
    };
    const genres = [
        { id: 'all', name: 'Все', emoji: '🎵' },
        { id: 'Rock', name: 'Рок', emoji: '🎸' },
        { id: 'Pop', name: 'Поп', emoji: '🎤' },
        { id: 'Jazz', name: 'Джаз', emoji: '🎷' },
        { id: 'Electronic', name: 'Электроника', emoji: '🎹' },
        { id: 'Hip Hop', name: 'Хип-хоп', emoji: '🎧' },
        { id: 'Classical', name: 'Классика', emoji: '🎻' }
    ];

    // Демо-треклисты для известных пластинок
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
            234689: [
                { position: 'A1', title: 'Come Together', duration: '4:20' },
                { position: 'A2', title: 'Something', duration: '3:03' },
                { position: 'A3', title: 'Maxwell\'s Silver Hammer', duration: '3:27' },
                { position: 'A4', title: 'Oh! Darling', duration: '3:26' },
                { position: 'A5', title: 'Octopus\'s Garden', duration: '2:51' },
                { position: 'B1', title: 'I Want You (She\'s So Heavy)', duration: '7:47' },
                { position: 'B2', title: 'Here Comes the Sun', duration: '3:05' },
                { position: 'B3', title: 'Because', duration: '2:45' },
                { position: 'B4', title: 'You Never Give Me Your Money', duration: '4:02' },
                { position: 'B5', title: 'Sun King', duration: '2:26' },
                { position: 'B6', title: 'Mean Mr. Mustard', duration: '1:06' },
                { position: 'B7', title: 'Polythene Pam', duration: '1:12' },
                { position: 'B8', title: 'She Came In Through the Bathroom Window', duration: '1:57' },
                { position: 'B9', title: 'Golden Slumbers', duration: '1:31' },
                { position: 'B10', title: 'Carry That Weight', duration: '1:36' },
                { position: 'B11', title: 'The End', duration: '2:19' }
            ],
            123456: [
                { position: 'A1', title: 'Speak to Me', duration: '1:30' },
                { position: 'A2', title: 'Breathe', duration: '2:43' },
                { position: 'A3', title: 'On the Run', duration: '3:30' },
                { position: 'A4', title: 'Time', duration: '7:01' },
                { position: 'A5', title: 'The Great Gig in the Sky', duration: '4:36' },
                { position: 'B1', title: 'Money', duration: '6:30' },
                { position: 'B2', title: 'Us and Them', duration: '7:40' },
                { position: 'B3', title: 'Any Colour You Like', duration: '3:24' },
                { position: 'B4', title: 'Brain Damage', duration: '3:50' },
                { position: 'B5', title: 'Eclipse', duration: '1:45' }
            ],
            456789: [
                { position: 'A1', title: 'So What', duration: '9:22' },
                { position: 'A2', title: 'Freddie Freeloader', duration: '9:46' },
                { position: 'A3', title: 'Blue in Green', duration: '5:37' },
                { position: 'B1', title: 'All Blues', duration: '11:33' },
                { position: 'B2', title: 'Flamenco Sketches', duration: '9:26' }
            ],
            789012: [
                { position: 'A1', title: 'Black Dog', duration: '4:55' },
                { position: 'A2', title: 'Rock and Roll', duration: '3:40' },
                { position: 'A3', title: 'The Battle of Evermore', duration: '5:51' },
                { position: 'A4', title: 'Stairway to Heaven', duration: '8:02' },
                { position: 'B1', title: 'Misty Mountain Hop', duration: '4:38' },
                { position: 'B2', title: 'Four Sticks', duration: '4:44' },
                { position: 'B3', title: 'Going to California', duration: '3:36' },
                { position: 'B4', title: 'When the Levee Breaks', duration: '7:08' }
            ]
        };

        if (demoTracklists[vinylId]) {
            return demoTracklists[vinylId];
        }

        const titleLower = (title || '').toLowerCase();
        const artistLower = (artist || '').toLowerCase();

        if (titleLower.includes('queen') || artistLower.includes('queen')) {
            return demoTracklists[3110951];
        }
        if (titleLower.includes('abbey road')) {
            return demoTracklists[234689];
        }
        if (titleLower.includes('dark side') || titleLower.includes('pink floyd')) {
            return demoTracklists[123456];
        }
        if (titleLower.includes('kind of blue') || titleLower.includes('miles davis')) {
            return demoTracklists[456789];
        }
        if (titleLower.includes('led zeppelin')) {
            return demoTracklists[789012];
        }

        return [];
    };

    // Функция поиска на RuTube
    const searchRuTube = async (artist, title, trackIndex) => {
        setSearchingRuTube(prev => ({ ...prev, [trackIndex]: true }));

        try {
            const response = await api.get('/rutube/track', {
                params: { artist, track: title }
            });

            setRuTubeResults(prev => ({
                ...prev,
                [trackIndex]: response.data.videos || []
            }));
        } catch (error) {
            console.error('Ошибка поиска на RuTube:', error);
        } finally {
            setSearchingRuTube(prev => ({ ...prev, [trackIndex]: false }));
        }
    };

    // Функция открытия/закрытия видео
    const toggleVideo = (trackIndex) => {
        setExpandedVideo(prev => ({
            ...prev,
            [trackIndex]: !prev[trackIndex]
        }));
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsAuthenticated(true);
            setCurrentUser(JSON.parse(userData));
            loadUserCollection(JSON.parse(userData).id);
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setCollection([]);
        }

        loadRandomVinyls();
    }, []);

    const loadUserCollection = async (userId) => {
        const userCollection = await getUserCollection(userId);
        setCollection(userCollection);
    };

    const loadRandomVinyls = async () => {
        setLoading(true);
        setActiveGenre('all');
        try {
            const response = await api.get('/vinyls/discogs/random?limit=12');
            const vinylsData = response.data;
            setVinyls(vinylsData);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadByGenre = async (genre) => {
        if (genre === 'all') {
            loadRandomVinyls();
            return;
        }

        setLoading(true);
        setActiveGenre(genre);
        try {
            const response = await api.get(`/vinyls/discogs/filter?genre=${genre}&limit=12`);
            const vinylsData = response.data;
            setVinyls(vinylsData);
        } catch (error) {
            console.error('Ошибка загрузки по жанру:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchDiscogs = async () => {
        if (!searchTerm.trim()) {
            loadRandomVinyls();
            return;
        }

        setLoading(true);
        setActiveGenre('all');
        try {
            const response = await api.get(`/vinyls/discogs/search?query=${encodeURIComponent(searchTerm)}&limit=12`);
            const vinylsData = response.data;
            setVinyls(vinylsData);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTracklist = async (vinylId, vinylTitle, vinylArtist) => {
        if (tracklists[vinylId]) {
            return;
        }

        setLoadingTracklist(true);

        try {
            const response = await api.get(`/vinyls/discogs/tracklist/${vinylId}`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setTracklists(prev => ({
                    ...prev,
                    [vinylId]: response.data
                }));
                console.log('✅ Треклист загружен через API для', vinylId);
            } else {
                console.log('📀 API вернул пустой треклист, используем демо-данные для', vinylId);
                const demoTracklist = getDemoTracklist(vinylId, vinylTitle, vinylArtist);
                setTracklists(prev => ({
                    ...prev,
                    [vinylId]: demoTracklist
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки треклиста:', error);
            const demoTracklist = getDemoTracklist(vinylId, vinylTitle, vinylArtist);
            setTracklists(prev => ({
                ...prev,
                [vinylId]: demoTracklist
            }));
        } finally {
            setLoadingTracklist(false);
        }
    };

    const handleAddToCollection = async (vinyl, e) => {
        e.stopPropagation();

        if (!isAuthenticated || !currentUser) {
            showNotification('🔒 Войдите в аккаунт, чтобы добавить пластинку в коллекцию', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const vinylData = {
            id: vinyl.id,
            title: vinyl.title,
            artist: vinyl.artist,
            year: vinyl.year,
            genre: vinyl.genre,
            coverImage: vinyl.coverImage,
            label: vinyl.label,
            country: vinyl.country,
            format: vinyl.format,
            tracklist: tracklists[vinyl.id] || []
        };

        const result = await addToUserCollection(
            currentUser.id,
            vinylData,
            0,
            null,
            null
        );

        if (result.success) {
            showNotification(`✅ "${vinyl.title}" добавлена в коллекцию!`, 'success');
            await loadUserCollection(currentUser.id);
        } else {
            showNotification(`❌ "${vinyl.title}" уже есть в коллекции`, 'error');
        }
    };

    const handleVinylClick = async (vinyl) => {
        setSelectedVinyl(vinyl);
        setShowDetailModal(true);
        await loadTracklist(vinyl.id, vinyl.title, vinyl.artist);
    };

    const isInCollection = (vinylId) => {
        if (!isAuthenticated || !collection) return false;
        return collection.some(item => item.vinylData?.id === vinylId);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>🎵 Загрузка пластинок с Discogs...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="hero-section">
                <h1 className="hero-title">Найди свою идеальную пластинку</h1>
                <p className="hero-subtitle">Более 13 миллионов релизов на Discogs</p>
                <button className="random-btn" onClick={loadRandomVinyls}>
                    🎲 Случайные пластинки
                </button>
            </div>

            <div className="genres-filter">
                {genres.map(genre => (
                    <button
                        key={genre.id}
                        className={`genre-btn ${activeGenre === genre.id ? 'active' : ''}`}
                        onClick={() => loadByGenre(genre.id)}
                    >
                        <span>{genre.emoji}</span>
                        <span>{genre.name}</span>
                    </button>
                ))}
            </div>

            <div className="search-section">
                <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Поиск по исполнителю или названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchDiscogs()}
                    />
                    <button className="search-btn" onClick={searchDiscogs}>Найти на Discogs</button>
                    <button className="reset-btn" onClick={loadRandomVinyls}>🔄 Обновить</button>
                </div>
            </div>

            <div className="vinyls-grid">
                {vinyls.map((vinyl, index) => (
                    <div key={vinyl.id || index} className="vinyl-card" onClick={() => handleVinylClick(vinyl)}>
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
                            {vinyl.genre && <div className="vinyl-genre-tag">{vinyl.genre}</div>}
                            <div className="vinyl-buttons">
                                <button
                                    className={`collection-btn ${isInCollection(vinyl.id) ? 'in-collection' : ''}`}
                                    onClick={(e) => handleAddToCollection(vinyl, e)}
                                    disabled={!isAuthenticated || isInCollection(vinyl.id)}
                                >
                                    {!isAuthenticated ? '🔒 Войдите' : (isInCollection(vinyl.id) ? '✓ В коллекции' : '📀 В коллекцию')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {vinyls.length === 0 && (
                <div className="empty-state">
                    <h3>😢 Ничего не найдено</h3>
                    <p>Попробуйте другой жанр или поисковый запрос</p>
                    <button className="shop-btn" onClick={loadRandomVinyls}>
                        🎲 Показать случайные пластинки
                    </button>
                </div>
            )}

            {/* Модальное окно с деталями пластинки и треклистом */}
            {showDetailModal && selectedVinyl && (
                <div className="detail-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="detail-modal-close" onClick={() => setShowDetailModal(false)}>×</button>

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
                                        <p className="detail-label"><span>🏷️ Лейбл:</span> {selectedVinyl.label}</p>
                                    )}
                                    {selectedVinyl.country && (
                                        <p className="detail-country"><span>🌍 Страна:</span> {selectedVinyl.country}</p>
                                    )}
                                </div>
                            </div>

                            {/* Треклист */}
                            {loadingTracklist ? (
                                <div className="tracklist-loading-modal">
                                    <div className="small-spinner"></div>
                                    <p>Загрузка треклиста...</p>
                                </div>
                            ) : tracklists[selectedVinyl.id] && tracklists[selectedVinyl.id].length > 0 ? (
                                <div className="detail-tracklist-section">
                                    <h3>🎵 Треклист</h3>
                                    <div className="detail-tracklist">
                                        <div className="detail-tracklist-header">
                                            <div>#</div>
                                            <div>Название трека</div>
                                            <div>Длительность</div>
                                            <div></div>
                                        </div>
                                        {tracklists[selectedVinyl.id].map((track, idx) => (
                                            <div key={idx} className="detail-track-item-with-rutube">
                                                <div className="detail-track-position">{idx + 1}</div>
                                                <div className="detail-track-title">{track.title}</div>
                                                <div className="detail-track-duration">{track.duration || '—'}</div>
                                                <div className="detail-track-actions">
                                                    {/* Кнопка поиска на RuTube */}
                                                    <button
                                                        className="rutube-search-btn"
                                                        onClick={() => searchRuTube(selectedVinyl.artist, track.title, idx)}
                                                        disabled={searchingRuTube[idx]}
                                                        title="Найти на RuTube"
                                                    >
                                                        {searchingRuTube[idx] ? '⏳' : '📺'}
                                                    </button>

                                                    {/* Кнопка открытия видео в отдельном окне (есть результаты) */}
                                                    {rutubeResults[idx] && rutubeResults[idx].length > 0 && (
                                                        <button
                                                            className="rutube-watch-btn"
                                                            onClick={() => openVideoModal(rutubeResults[idx][0])}
                                                            title="Смотреть видео"
                                                        >
                                                            ▶️
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="tracklist-empty-modal">
                                    <p>📝 Треклист не найден для этой пластинки</p>
                                </div>
                            )}

                            {/* Модальное окно для видео */}
                            {showVideoModal && selectedVideo && (
                                <div className="video-modal-overlay" onClick={closeVideoModal}>
                                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                                        <button className="video-modal-close" onClick={closeVideoModal}>×</button>
                                        <h3>{selectedVideo.title}</h3>
                                        <div className="video-container">
                                            <iframe
                                                src={`https://rutube.ru/play/embed/${selectedVideo.id}`}
                                                title={selectedVideo.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="video-iframe"
                                            ></iframe>
                                        </div>
                                        <div className="video-details">
                                            <p>📺 Канал: {selectedVideo.author}</p>
                                            <p>👁️ Просмотров: {selectedVideo.views?.toLocaleString() || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-info-grid">
                                <div className="detail-info-item">
                                    <div className="detail-info-icon">📀</div>
                                    <div className="detail-info-text">
                                        <div className="detail-info-label">Формат</div>
                                        <div className="detail-info-value">{selectedVinyl.format || 'Vinyl, LP'}</div>
                                    </div>
                                </div>
                                {selectedVinyl.rating && (
                                    <div className="detail-info-item">
                                        <div className="detail-info-icon">⭐</div>
                                        <div className="detail-info-text">
                                            <div className="detail-info-label">Рейтинг на Discogs</div>
                                            <div className="detail-info-value">{selectedVinyl.rating} / 5</div>
                                        </div>
                                    </div>
                                )}
                                <div className="detail-info-item">
                                    <div className="detail-info-icon">👥</div>
                                    <div className="detail-info-text">
                                        <div className="detail-info-label">ID на Discogs</div>
                                        <div className="detail-info-value">{selectedVinyl.id}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-modal-actions">
                                <button
                                    className={`detail-add-collection-btn ${isInCollection(selectedVinyl.id) ? 'in-collection' : ''}`}
                                    onClick={(e) => {
                                        handleAddToCollection(selectedVinyl, e);
                                        if (!isInCollection(selectedVinyl.id) && isAuthenticated) {
                                            setTimeout(() => setShowDetailModal(false), 1000);
                                        }
                                    }}
                                    disabled={!isAuthenticated || isInCollection(selectedVinyl.id)}
                                >
                                    {!isAuthenticated ? '🔒 Войдите' : (isInCollection(selectedVinyl.id) ? '✓ Уже в коллекции' : '📀 Добавить в коллекцию')}
                                </button>
                                <button className="detail-close-btn" onClick={() => setShowDetailModal(false)}>
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;