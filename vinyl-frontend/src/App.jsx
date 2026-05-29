// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import AddVinylPage from './pages/AddVinylPage';
import Profile from './pages/Profile';
import OtherUserProfile from './pages/OtherUserProfile'; // ← ДОБАВЬТЕ
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import ListingDetail from './pages/ListingDetail';
import './App.css';

// Navigation component
function Navigation({ isAuthenticated, user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">🎵 VinylStore</Link>
                <div className="nav-links">
                    <Link to="/">Главная</Link>
                    <Link to="/collection">Коллекция</Link>
                    <Link to="/add-vinyl">Добавить пластинку</Link>
                    <Link to="/marketplace">Маркетплейс</Link>

                    {isAuthenticated ? (
                        <div className="nav-user">
                            <Link to="/messages" className="nav-messages">
                                💬 Сообщения
                            </Link>
                            <Link to="/profile" className="nav-profile">
                                <span className="nav-profile-name">{user?.username}</span>
                            </Link>
                            <button onClick={handleLogout} className="logout-btn">
                                🚪 Выйти
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth">
                            <Link to="/login" className="nav-login">Войти</Link>
                            <Link to="/register" className="nav-register">Регистрация</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

// Main App Content
function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <>
            <Navigation
                isAuthenticated={isAuthenticated}
                user={user}
                onLogout={handleLogout}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/add-vinyl" element={<AddVinylPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<OtherUserProfile />} /> {/* ← ДОБАВЬТЕ ЭТУ СТРОКУ */}
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<ListingDetail />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            </Routes>
        </>
    );
}

// Root App
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;