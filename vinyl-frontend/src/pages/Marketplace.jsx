import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { showNotification, getUserCollection } from '../api/api';
import './Marketplace.css';

function Marketplace() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [user, setUser] = useState(null);
    const [userCollection, setUserCollection] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [formData, setFormData] = useState({
        type: 'SALE',
        title: '',
        description: '',
        price: '',
        desiredRecords: '',
        selectedVinyl: null,
        searchVinylQuery: ''
    });

    const [vinylSearchResults, setVinylSearchResults] = useState([]);
    const [searchingVinyl, setSearchingVinyl] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            setUser(JSON.parse(userData));
            loadListings();
            loadUserCollection(JSON.parse(userData).id);
        } else {
            navigate('/login');
        }
    }, []);

    const loadListings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/marketplace/listings');
            setListings(response.data);
        } catch (error) {
            console.error('Ошибка загрузки объявлений:', error);
            showNotification('❌ Ошибка загрузки объявлений', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadUserCollection = async (userId) => {
        try {
            const collection = await getUserCollection(userId);
            setUserCollection(collection);
        } catch (error) {
            console.error('Ошибка загрузки коллекции:', error);
        }
    };

    const searchVinylOnDiscogs = async () => {
        if (!formData.searchVinylQuery.trim()) return;

        setSearchingVinyl(true);
        try {
            const response = await api.get(`/vinyls/discogs/search?query=${encodeURIComponent(formData.searchVinylQuery)}&limit=6`);
            setVinylSearchResults(response.data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setSearchingVinyl(false);
        }
    };

    const selectVinyl = (vinyl) => {
        setFormData({
            ...formData,
            selectedVinyl: vinyl,
            title: `${vinyl.artist} - ${vinyl.title}`,
            searchVinylQuery: ''
        });
        setVinylSearchResults([]);
    };

    const selectFromCollection = (vinyl) => {
        setFormData({
            ...formData,
            selectedVinyl: vinyl,
            title: `${vinyl.artist} - ${vinyl.title}`
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.type === 'SALE' && !formData.selectedVinyl) {
            showNotification('❌ Выберите пластинку из вашей коллекции', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const listingData = {
                userId: user.id,
                type: formData.type,
                title: formData.title,
                description: formData.description,
                vinylData: formData.selectedVinyl,
                price: formData.type === 'SALE' ? parseFloat(formData.price) : null,
                desiredRecords: formData.type === 'EXCHANGE' ? formData.desiredRecords : null
            };

            const response = await api.post('/marketplace/listings', listingData);

            if (response.data.success) {
                showNotification('✅ Объявление создано!', 'success');
                setShowCreateForm(false);
                resetForm();
                loadListings();
            }
        } catch (error) {
            console.error('Ошибка создания:', error);
            showNotification(`❌ Ошибка при создании объявления`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'SALE',
            title: '',
            description: '',
            price: '',
            desiredRecords: '',
            selectedVinyl: null,
            searchVinylQuery: ''
        });
        setVinylSearchResults([]);
    };

    const handleDelete = async (listingId, e) => {
        e.stopPropagation();
        try {
            const response = await api.delete(`/marketplace/listings/${listingId}`);
            if (response.data.success) {
                showNotification('✅ Объявление удалено', 'success');
                setListings(prev => prev.filter(l => l.id !== listingId));
            } else {
                showNotification('❌ Не удалось удалить объявление', 'error');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showNotification('❌ Ошибка при удалении', 'error');
        }
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

    const goToListingDetail = (listingId) => {
        navigate(`/marketplace/${listingId}`);
    };

    const startChat = (listing, e) => {
        e.stopPropagation();
        navigate(`/messages/${listing.userId}`, { state: { listing } });
    };

    const renderFormFields = () => {
        switch(formData.type) {
            case 'SALE':
                return (
                    <>
                        <div className="form-group">
                            <label>🎵 Выберите пластинку из вашей коллекции</label>
                            <div className="collection-select">
                                {userCollection.length === 0 ? (
                                    <div className="empty-collection-hint">
                                        <p>Ваша коллекция пуста.</p>
                                        <Link to="/add-vinyl">➕ Добавить пластинки</Link>
                                    </div>
                                ) : (
                                    <div className="collection-items">
                                        {userCollection.map(item => {
                                            const vinyl = item.vinylData;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`collection-item ${formData.selectedVinyl?.id === vinyl?.id ? 'selected' : ''}`}
                                                    onClick={() => selectFromCollection(vinyl)}
                                                >
                                                    {vinyl?.coverImage ? (
                                                        <img src={vinyl.coverImage} alt={vinyl?.title} />
                                                    ) : (
                                                        <div className="no-image-placeholder">🎵</div>
                                                    )}
                                                    <div className="title">{vinyl?.title || 'Без названия'}</div>
                                                    <div className="artist">{vinyl?.artist || 'Неизвестный исполнитель'}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>💰 Цена (₽)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                placeholder="3500"
                                required
                            />
                        </div>
                    </>
                );
            case 'EXCHANGE':
                return (
                    <>
                        <div className="form-group">
                            <label>🔄 Что хотите получить?</label>
                            <textarea
                                rows="2"
                                value={formData.desiredRecords}
                                onChange={(e) => setFormData({...formData, desiredRecords: e.target.value})}
                                placeholder="Например: Хочу обменять на The Beatles - Abbey Road или Pink Floyd - Dark Side of the Moon"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>🎵 Что предлагаете?</label>
                            <div className="collection-select">
                                {userCollection.length === 0 ? (
                                    <div className="empty-collection-hint">
                                        <p>Ваша коллекция пуста.</p>
                                        <Link to="/add-vinyl">➕ Добавить пластинки</Link>
                                    </div>
                                ) : (
                                    <div className="collection-items">
                                        {userCollection.map(item => {
                                            const vinyl = item.vinylData;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`collection-item ${formData.selectedVinyl?.id === vinyl?.id ? 'selected' : ''}`}
                                                    onClick={() => selectFromCollection(vinyl)}
                                                >
                                                    {vinyl?.coverImage ? (
                                                        <img src={vinyl.coverImage} alt={vinyl?.title} />
                                                    ) : (
                                                        <div className="no-image-placeholder">🎵</div>
                                                    )}
                                                    <div className="title">{vinyl?.title || 'Без названия'}</div>
                                                    <div className="artist">{vinyl?.artist || 'Неизвестный исполнитель'}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            case 'SEARCH':
                return (
                    <>
                        <div className="form-group">
                            <label>🔍 Какую пластинку ищете?</label>
                            <div className="vinyl-search">
                                <input
                                    type="text"
                                    placeholder="Введите название пластинки или исполнителя..."
                                    value={formData.searchVinylQuery}
                                    onChange={(e) => setFormData({...formData, searchVinylQuery: e.target.value})}
                                />
                                <button type="button" onClick={searchVinylOnDiscogs} disabled={searchingVinyl}>
                                    {searchingVinyl ? 'Поиск...' : 'Найти на Discogs'}
                                </button>
                            </div>
                            {vinylSearchResults.length > 0 && (
                                <div className="vinyl-results">
                                    {vinylSearchResults.map(vinyl => (
                                        <div key={vinyl.id} className="vinyl-result-item" onClick={() => selectVinyl(vinyl)}>
                                            <img src={vinyl.coverImage || 'https://via.placeholder.com/50'} alt={vinyl.title} />
                                            <div>
                                                <div className="title">{vinyl.title}</div>
                                                <div className="artist">{vinyl.artist}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'RECORD':
                return (
                    <>
                        <div className="form-group">
                            <label>🎵 Какую пластинку хотите показать?</label>
                            <div className="vinyl-search">
                                <input
                                    type="text"
                                    placeholder="Введите название пластинки или исполнителя..."
                                    value={formData.searchVinylQuery}
                                    onChange={(e) => setFormData({...formData, searchVinylQuery: e.target.value})}
                                />
                                <button type="button" onClick={searchVinylOnDiscogs} disabled={searchingVinyl}>
                                    {searchingVinyl ? 'Поиск...' : 'Найти на Discogs'}
                                </button>
                            </div>
                            {vinylSearchResults.length > 0 && (
                                <div className="vinyl-results">
                                    {vinylSearchResults.map(vinyl => (
                                        <div key={vinyl.id} className="vinyl-result-item" onClick={() => selectVinyl(vinyl)}>
                                            <img src={vinyl.coverImage || 'https://via.placeholder.com/50'} alt={vinyl.title} />
                                            <div>
                                                <div className="title">{vinyl.title}</div>
                                                <div className="artist">{vinyl.artist}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             listing.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || listing.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка объявлений...</p>
            </div>
        );
    }

    return (
        <div className="marketplace-page">
            <div className="marketplace-container">
                <div className="marketplace-hero">
                    <div className="marketplace-hero-icon">🛒</div>
                    <h1>Маркетплейс</h1>
                    <p>Продавайте, обменивайте, ищите и показывайте свой винил</p>
                    <button className="create-listing-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? '✖️ Отмена' : '➕ Создать объявление'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="create-listing-form">
                        <h2>Создать объявление</h2>
                        <div className="form-group">
                            <label>📋 Тип объявления</label>
                            <div className="type-selector">
                                <button
                                    type="button"
                                    className={`type-btn ${formData.type === 'SALE' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, type: 'SALE', selectedVinyl: null})}
                                >
                                    💰 Продажа
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${formData.type === 'EXCHANGE' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, type: 'EXCHANGE', selectedVinyl: null})}
                                >
                                    🔄 Обмен
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${formData.type === 'SEARCH' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, type: 'SEARCH', selectedVinyl: null})}
                                >
                                    🔍 Поиск
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${formData.type === 'RECORD' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, type: 'RECORD', selectedVinyl: null})}
                                >
                                    🎵 На показ
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {renderFormFields()}
                            <div className="form-group">
                                <label>📝 Заголовок объявления</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Краткое описание..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>📖 Подробное описание</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Опишите состояние, комплектацию, причину продажи/обмена и т.д."
                                />
                            </div>
                            {formData.selectedVinyl && (
                                <div className="selected-vinyl-preview">
                                    <h4>Выбранная пластинка:</h4>
                                    <div className="selected-vinyl">
                                        <img src={formData.selectedVinyl.coverImage || 'https://via.placeholder.com/60'} alt="" />
                                        <div>
                                            <strong>{formData.selectedVinyl.title}</strong>
                                            <span>{formData.selectedVinyl.artist} ({formData.selectedVinyl.year})</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                                    Отмена
                                </button>
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? 'Публикация...' : '📢 Опубликовать'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="marketplace-filters">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="🔍 Поиск объявлений..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-buttons">
                        <button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>Все</button>
                        <button className={filterType === 'SALE' ? 'active' : ''} onClick={() => setFilterType('SALE')}>💰 Продажа</button>
                        <button className={filterType === 'EXCHANGE' ? 'active' : ''} onClick={() => setFilterType('EXCHANGE')}>🔄 Обмен</button>
                        <button className={filterType === 'SEARCH' ? 'active' : ''} onClick={() => setFilterType('SEARCH')}>🔍 Поиск</button>
                        <button className={filterType === 'RECORD' ? 'active' : ''} onClick={() => setFilterType('RECORD')}>🎵 На показ</button>
                    </div>
                </div>

                {filteredListings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>Нет объявлений</h3>
                        <p>Станьте первым, кто создаст объявление</p>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {filteredListings.map((listing) => (
                            <div
                                key={listing.id}
                                className="listing-card"
                                onClick={() => goToListingDetail(listing.id)}
                                style={{ borderTop: `4px solid ${getTypeColor(listing.type)}`, cursor: 'pointer' }}
                            >
                                <div className="listing-badge" style={{ background: getTypeColor(listing.type) }}>
                                    {getTypeIcon(listing.type)} {getTypeLabel(listing.type)}
                                </div>
                                <div className="listing-cover">
                                    <img src={listing.vinylData?.coverImage || 'https://via.placeholder.com/300'} alt={listing.title} />
                                </div>
                                <div className="listing-info">
                                    <h3>{listing.title}</h3>
                                    <p className="listing-description">{listing.description?.substring(0, 100)}...</p>
                                    <div className="listing-details">
                                        <span>🎵 {listing.vinylData?.artist}</span>
                                        <span>📅 {listing.vinylData?.year || '—'}</span>
                                        {listing.type === 'SALE' && <span className="price">💰 {listing.price} ₽</span>}
                                        {listing.type === 'EXCHANGE' && listing.desiredRecords && (
                                            <span className="desired">🔄 Хочу: {listing.desiredRecords}</span>
                                        )}
                                        {listing.type === 'SEARCH' && <span className="search-badge">🔍 Ищу эту пластинку</span>}
                                        {listing.type === 'RECORD' && <span className="showcase-badge">🎵 Показываю</span>}
                                    </div>
                                    <div className="listing-seller">
                                        <div className="seller-info">
                                            <span className="seller-avatar">👤</span>
                                            <span>{listing.username}</span>
                                        </div>
                                        <div className="listing-actions">
                                            {listing.userId === user?.id && (
                                                <button
                                                    className="delete-listing-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Без alert — сразу удаляем
                                                        handleDelete(listing.id, e);
                                                    }}
                                                    title="Удалить объявление"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                            <button className="chat-btn" onClick={(e) => startChat(listing, e)}>
                                                💬 Написать
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Marketplace;