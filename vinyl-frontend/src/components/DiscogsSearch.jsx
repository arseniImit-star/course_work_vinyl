import React, { useState } from 'react';
import api from '../api/api';

function DiscogsSearch({ onSelectRelease }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRelease, setSelectedRelease] = useState(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await api.get(`/vinyls/discogs/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
            setResults(response.data);
        } catch (error) {
            console.error('Ошибка поиска на Discogs:', error);
            alert('Ошибка при поиске на Discogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (release) => {
        setLoading(true);
        try {
            const response = await api.get(`/vinyls/discogs/release/${release.discogsId}`);
            setSelectedRelease(response.data);
            if (onSelectRelease) {
                onSelectRelease(response.data);
            }
        } catch (error) {
            console.error('Ошибка получения деталей:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="discogs-search">
            <h4>Поиск на Discogs</h4>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Введите название пластинки или исполнителя..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Поиск...' : 'Найти на Discogs'}
                </button>
            </div>

            {results.length > 0 && (
                <div className="discogs-results">
                    <h5>Результаты поиска:</h5>
                    {results.map((release, idx) => (
                        <div key={idx} className="discogs-result-item" onClick={() => handleSelect(release)}>
                            {release.coverImage && (
                                <img src={release.coverImage} alt={release.title} width="50" height="50" />
                            )}
                            <div>
                                <strong>{release.title}</strong>
                                <p>{release.artist} {release.year ? `(${release.year})` : ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedRelease && (
                <div className="discogs-details">
                    <h5>Информация с Discogs:</h5>
                    <p><strong>Исполнитель:</strong> {selectedRelease.artist}</p>
                    <p><strong>Год:</strong> {selectedRelease.year}</p>
                    {selectedRelease.genres?.length > 0 && (
                        <p><strong>Жанры:</strong> {selectedRelease.genres.join(', ')}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default DiscogsSearch;