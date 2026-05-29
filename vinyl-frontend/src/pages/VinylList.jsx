import { useEffect, useState } from "react";
import api from "../api/api";

export default function VinylList() {
    const [vinyls, setVinyls] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVinyls();
    }, []);

    const loadVinyls = async () => {
        try {
            const response = await api.get("/vinyls");
            setVinyls(response.data);
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            loadVinyls();
            return;
        }

        try {
            // Поиск по исполнителю или названию
            const response = await api.get(`/vinyls/search?query=${search}`);
            setVinyls(response.data);
        } catch (error) {
            console.error("Ошибка поиска:", error);
        }
    };

    const handleAddToCart = async (vinylId) => {
        const userId = localStorage.getItem("userId") || 1;
        try {
            await api.post(`/cart/add?userId=${userId}&vinylId=${vinylId}&quantity=1`);
            alert("Товар добавлен в корзину!");
        } catch (error) {
            console.error("Ошибка добавления:", error);
            alert("Ошибка при добавлении в корзину");
        }
    };

    if (loading) {
        return <div className="text-center">Загрузка...</div>;
    }

    return (
        <div className="container">
            <h1>Vinyl Collection</h1>

            <div className="search-bar">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по исполнителю или названию..."
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch}>Поиск</button>
                <button onClick={loadVinyls}>Сбросить</button>
            </div>

            <div className="vinyl-grid">
                {vinyls.map(vinyl => (
                    <div key={vinyl.id} className="vinyl-card">
                        <h3>{vinyl.title}</h3>
                        <p className="artist">{vinyl.artist}</p>
                        {vinyl.year && <p className="year">Год: {vinyl.year}</p>}
                        <p className="price">{vinyl.price} ₽</p>
                        <p className="stock">В наличии: {vinyl.stockQuantity}</p>
                        <button
                            onClick={() => handleAddToCart(vinyl.id)}
                            disabled={vinyl.stockQuantity === 0}
                        >
                            {vinyl.stockQuantity > 0 ? "В корзину" : "Нет в наличии"}
                        </button>
                    </div>
                ))}
            </div>

            {vinyls.length === 0 && (
                <p className="text-center">Товаров не найдено</p>
            )}
        </div>
    );
}