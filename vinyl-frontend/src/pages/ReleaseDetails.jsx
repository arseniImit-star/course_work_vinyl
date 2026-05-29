import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReleaseDetails, addToCart, getCart } from '../api/api';
import './ReleaseDetails.css';

function ReleaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [release, setRelease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadRelease();
        checkIfInCart();
    }, [id]);

    const loadRelease = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReleaseDetails(id);
            setRelease(response.data);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError('Не удалось загрузить информацию о пластинке');
        } finally {
            setLoading(false);
        }
    };

    const checkIfInCart = () => {
        const cart = getCart();
        const exists = cart.find(item => item.discogsId === parseInt(id));
        if (exists) {
            setAddedToCart(true);
            setQuantity(exists.quantity);
        }
    };

    const handleAddToCart = () => {
        if (release) {
            addToCart({
                discogsId: release.discogsId,
                title: release.title,
                artist: release.artist,
                year: release.year,
                coverImage: release.coverImage,
                price: release.lowestPrice || 19.99
            });
            setAddedToCart(true);
            // Показываем уведомление
            const btn = document.querySelector('.add-to-cart-btn');
            if (btn) {
                btn.textContent = '✅ Добавлено!';
                setTimeout(() => {
                    btn.textContent = '🛒 Добавлено в корзину';
                }, 2000);
            }
        }
    };

    const goToCart = () => {
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="details-loading">
                <div className="spinner"></div>
                <p>Загружаем информацию о пластинке...</p>
            </div>
        );
    }

    if (error || !release) {
        return (
            <div className="details-error">
                <p>{error || 'Пластинка не найдена'}</p>
                <button onClick={() => navigate('/')}>Вернуться в каталог</button>
            </div>
        );
    }

    return (
        <div className="release-details">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Назад к каталогу
            </button>

            <div className="details-container">
                <div className="details-image">
                    <img
                        src={release.coverImage}
                        alt={release.title}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x400?text=No+Cover';
                        }}
                    />
                </div>

                <div className="details-info">
                    <h1>{release.title}</h1>
                    <h2>{release.artist}</h2>

                    <div className="details-meta">
                        <span className="meta-item">📅 {release.year || '—'}</span>
                        <span className="meta-item">🌍 {release.country || '—'}</span>
                        <span className="meta-item">💿 {release.format || 'Vinyl'}</span>
                    </div>

                    {release.genres && release.genres.length > 0 && (
                        <div className="details-genres">
                            <strong>Жанры:</strong>
                            {release.genres.map((genre, i) => (
                                <span key={i} className="genre-tag">{genre}</span>
                            ))}
                        </div>
                    )}

                    {release.styles && release.styles.length > 0 && (
                        <div className="details-styles">
                            <strong>Стили:</strong>
                            {release.styles.map((style, i) => (
                                <span key={i} className="style-tag">{style}</span>
                            ))}
                        </div>
                    )}

                    <div className="details-price">
                        <div className="price-main">
                            {release.lowestPrice || 19.99} $
                        </div>
                        {release.numForSale > 0 && (
                            <div className="price-note">
                                📦 В продаже: {release.numForSale} экземпляров
                            </div>
                        )}
                    </div>

                    <div className="details-quantity">
                        <label>Количество:</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                    </div>

                    <div className="details-actions">
                        {!addedToCart ? (
                            <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                🛒 Добавить в корзину
                            </button>
                        ) : (
                            <button className="go-to-cart-btn" onClick={goToCart}>
                                🛍️ Перейти в корзину
                            </button>
                        )}
                    </div>

                    <a
                        href={release.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="discogs-link"
                    >
                        🔗 Смотреть на Discogs
                    </a>
                </div>
            </div>

            {release.tracklist && release.tracklist.length > 0 && (
                <div className="details-tracklist">
                    <h3>Треклист</h3>
                    <ul>
                        {release.tracklist.map((track, i) => (
                            <li key={i}>
                                <span className="track-position">{track.position}</span>
                                <span className="track-title">{track.title}</span>
                                <span className="track-duration">{track.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ReleaseDetails;