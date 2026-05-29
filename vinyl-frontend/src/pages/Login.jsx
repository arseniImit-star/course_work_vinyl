// Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

function Login({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                role: response.data.role
            }));

            setIsAuthenticated(true);
            navigate('/');
        } catch (err) {
            console.error('Ошибка входа:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('❌ Неверное имя пользователя или пароль');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-hero">
                    <div className="auth-hero-icon">🎵</div>
                    <h1>Добро пожаловать!</h1>
                    <p>Войдите в свой аккаунт, чтобы продолжить</p>
                </div>

                <div className="auth-card">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>👤 Имя пользователя</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Введите имя пользователя"
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label>🔒 Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Введите пароль"
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Вход...
                                </>
                            ) : (
                                '🚀 Войти'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;