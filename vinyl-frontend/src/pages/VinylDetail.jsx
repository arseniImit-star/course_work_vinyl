import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import api, { addToCollection, getCollection } from '../api/api';

function VinylDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const playerRef = useRef(null);

    const [vinyl, setVinyl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inCollection, setInCollection] = useState(false);
    const [tracklist, setTracklist] = useState([]);
    const [loadingTracklist, setLoadingTracklist] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [youtubeVideoId, setYoutubeVideoId] = useState(null);

    useEffect(() => {
        if (location.state?.vinyl) {
            setVinyl(location.state.vinyl);
            setInCollection(getCollection().some(item => item.id === location.state.vinyl.id));
            loadTracklist(location.state.vinyl.id);
            setLoading(false);
        } else {
            loadVinylDetails();
        }
    }, [id]);

    const loadVinylDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/vinyls/discogs/release/${id}`);
            setVinyl(response.data);
            setInCollection(getCollection().some(item => item.id === response.data.id));
            loadTracklist(id);
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTracklist = async (releaseId) => {
        setLoadingTracklist(true);
        try {
            const response = await api.get(`/vinyls/discogs/tracklist/${releaseId}`);
            setTracklist(response.data || []);
        } catch (error) {
            console.error('Ошибка загрузки треклиста:', error);
            setTracklist([]);
        } finally {
            setLoadingTracklist(false);
        }
    };

    const playTrack = async (track, index) => {
        setShowPlayer(true);
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
        setIsPlaying(true);

        // Всегда используем демо-видео (без API ключа)
        setYoutubeVideoId("jfKfPfyJRdk");
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            playerRef.current?.pauseVideo();
        } else {
            playerRef.current?.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    const onPlayerReady = (event) => {
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const handleAddToCollection = () => {
        const vinylWithDetails = { ...vinyl, tracklist };
        const added = addToCollection(vinylWithDetails);
        if (added) {
            setInCollection(true);
            alert(`✅ "${vinyl.title}" добавлена в коллекцию!`);
        } else {
            alert(`❌ "${vinyl.title}" уже есть в коллекции`);
        }
    };

    const youtubeOpts = {
        height: '0',
        width: '0',
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, rel: 0 }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>🎵 Загрузка информации о пластинке...</p>
            </div>
        );
    }

    if (!vinyl) {
        return (
            <div className="empty-state">
                <h3>❌ Пластинка не найдена</h3>
                <button onClick={() => navigate('/')} className="shop-btn">Вернуться в каталог</button>
            </div>
        );
    }

    return (
        <div className="vinyl-detail-container">
            <button className="back-btn" onClick={() => navigate('/')}>← Назад к каталогу</button>

            {showPlayer && youtubeVideoId && (
                <div style={{ display: 'none' }}>
                    <YouTube
                        videoId={youtubeVideoId}
                        opts={youtubeOpts}
                        onReady={onPlayerReady}
                        ref={playerRef}
                    />
                </div>
            )}

            <div className="vinyl-detail-content">
                <div className="vinyl-detail-image">
                    {vinyl.coverImage ? <img src={vinyl.coverImage} alt={vinyl.title} /> : <div className="no-image-large">🎵</div>}
                </div>

                <div className="vinyl-detail-info">
                    <h1>{vinyl.title}</h1>
                    <h2>{vinyl.artist}</h2>

                    <div className="detail-specs">
                        {vinyl.year && <span className="spec-tag">📅 {vinyl.year}</span>}
                        {vinyl.genre && <span className="spec-tag">🎸 {vinyl.genre}</span>}
                    </div>

                    {showPlayer && currentTrack && (
                        <div className="audio-player">
                            <div className="player-info">
                                <div className="player-track-title">🎵 {currentTrack.title}</div>
                                <div className="player-track-artist">{vinyl.artist}</div>
                            </div>
                            <div className="player-controls">
                                <button className="player-btn" onClick={handlePlayPause}>
                                    {isPlaying ? '⏸️' : '▶️'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="detail-tracklist">
                        <h3>🎵 Список треков</h3>
                        {loadingTracklist ? (
                            <div className="tracklist-loading"><div className="mini-spinner"></div><p>Загрузка треков...</p></div>
                        ) : tracklist?.length > 0 ? (
                            <div className="tracklist-container">
                                {tracklist.map((track, idx) => (
                                    <div key={idx} className={`tracklist-line ${currentTrackIndex === idx ? 'active' : ''}`}>
                                        <span className="track-number">{track.position || (idx + 1)}</span>
                                        <span className="track-title" onClick={() => playTrack(track, idx)}>{track.title}</span>
                                        <span className="track-duration">{track.duration || '—'}</span>
                                        <button className="track-play-btn" onClick={() => playTrack(track, idx)}>
                                            {currentTrackIndex === idx && isPlaying ? '⏸️' : '▶️'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="tracklist-empty"><p>📀 Нет информации о треках</p></div>
                        )}
                    </div>

                    <div className="detail-buttons">
                        <button className={`add-collection-btn ${inCollection ? 'in-collection' : ''}`} onClick={handleAddToCollection} disabled={inCollection}>
                            {inCollection ? '✓ В моей коллекции' : '📀 Добавить в коллекцию'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VinylDetail;