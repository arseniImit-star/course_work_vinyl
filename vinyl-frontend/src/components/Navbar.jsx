import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    <span className="logo-icon">🎵</span>
                    <span className="logo-text">vinyl</span>
                    <span className="logo-dot">.</span>
                    <span className="logo-text-light">collector</span>
                </Link>
                <div className="nav-links">
                    <Link to="/">Каталог</Link>
                    <Link to="/marketplace">Маркетплейс</Link>
                    <Link to="/collection">Моя коллекция</Link>
                    <Link to="/profile">Профиль</Link>
                    {isAuthenticated ? (
                        <>
                            <button onClick={handleLogout} className="logout-btn">
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-login-btn">Войти</Link>
                            <Link to="/register" className="nav-register-btn">Регистрация</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;