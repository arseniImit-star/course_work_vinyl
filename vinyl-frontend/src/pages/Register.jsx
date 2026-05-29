// Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

function Register({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        city: '',
        avatar: null
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        checks: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        }
    });

    // Проверка сложности пароля
    const checkPasswordStrength = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;

        let message = '';
        if (score === 5) message = 'Отличный пароль!';
        else if (score === 4) message = 'Хороший пароль';
        else if (score === 3) message = 'Средний пароль';
        else if (score >= 1) message = 'Слабый пароль';
        else message = 'Введите пароль';

        setPasswordStrength({ score, message, checks });
        return score >= 3;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
        setErrors({});

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверка типа
        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение');
            return;
        }

        // Проверка размера (до 5 MB — можно оставить)
        if (file.size > 5 * 1024 * 1024) {
            setError('Размер изображения не должен превышать 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Целевой размер аватара (квадрат)
                const TARGET_SIZE = 150; // 150x150 пикселей

                // Создаём canvas и обрезаем/уменьшаем
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Определяем координаты для центральной обрезки (crop)
                const size = Math.min(img.width, img.height);
                const offsetX = (img.width - size) / 2;
                const offsetY = (img.height - size) / 2;

                // Устанавливаем размеры canvas = TARGET_SIZE x TARGET_SIZE
                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;

                // Рисуем обрезанное и масштабированное изображение
                ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, TARGET_SIZE, TARGET_SIZE);

                // Получаем DataURL (можно также blob)
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85); // качество 85%

                setAvatarPreview(resizedDataUrl);
                setFormData((prev) => ({ ...prev, avatar: resizedDataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
        } else if (formData.username.length > 50) {
            newErrors.username = 'Имя пользователя не должно превышать 50 символов';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Введите корректный email адрес';
        }

        if (!formData.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Пароль должен содержать минимум 8 символов';
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = 'Пароль должен содержать хотя бы одну заглавную букву';
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = 'Пароль должен содержать хотя бы одну строчную букву';
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = 'Пароль должен содержать хотя бы одну цифру';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Пароли не совпадают';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const registerData = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                firstName: formData.firstName.trim() || null,
                lastName: formData.lastName.trim() || null,
                city: formData.city.trim() || null,
                avatar: formData.avatar || null
            };

            const response = await api.post('/auth/register', registerData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                role: response.data.role || 'USER',
                avatar: formData.avatar
            }));

            setIsAuthenticated(true);
            navigate('/');
        } catch (err) {
            console.error('Ошибка регистрации:', err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Ошибка при регистрации. Попробуйте другой username или email.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-hero">
                    <div className="auth-hero-icon">💿</div>
                    <h1>Создать аккаунт</h1>
                    <p>Присоединяйтесь к сообществу коллекционеров винила</p>
                </div>

                <div className="auth-card">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Выбор аватара */}
                        <div className="form-group">
                            <label>🖼️ Аватар</label>
                            <div className="avatar-upload-section">
                                <div className="avatar-preview">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="avatar-preview-img" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <span>🎵</span>
                                        </div>
                                    )}
                                </div>
                                <div className="avatar-upload-btn-wrapper">
                                    <button
                                        type="button"
                                        className="avatar-upload-btn"
                                        onClick={() => document.getElementById('avatar-input').click()}
                                    >
                                        📸 Загрузить фото
                                    </button>
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                    />
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            className="avatar-remove-btn"
                                            onClick={() => {
                                                setAvatarPreview(null);
                                                setFormData({ ...formData, avatar: null });
                                            }}
                                        >
                                            ✖️ Удалить
                                        </button>
                                    )}
                                </div>
                                <p className="avatar-hint">Рекомендуемый размер: 150x150px. Максимум 5MB</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>👤 Имя пользователя *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? 'error' : ''}
                                    placeholder="Введите имя пользователя (мин. 3 символа)"
                                />
                                {errors.username && <span className="field-error">{errors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label>📧 Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="example@mail.com"
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>👤 Имя</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Ваше имя"
                                />
                            </div>

                            <div className="form-group">
                                <label>👤 Фамилия</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Ваша фамилия"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>🏙️ Город</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Ваш город"
                            />
                        </div>

                        {/* Поле ввода пароля */}
                        <div className="form-group">
                            <label>🔒 Пароль *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder="Минимум 8 символов"
                            />
                            {errors.password && <span className="field-error">{errors.password}</span>}

                            {/* Отображаем требования к паролю */}
                            {formData.password && (
                                <div className="password-requirements">
                                    <p>Пароль должен содержать:</p>
                                    <ul>
                                        <li className={passwordStrength.checks.length ? 'met' : 'unmet'}>
                                            {passwordStrength.checks.length ? '✅' : '❌'} минимум 8 символов
                                        </li>
                                        <li className={passwordStrength.checks.uppercase ? 'met' : 'unmet'}>
                                            {passwordStrength.checks.uppercase ? '✅' : '❌'} хотя бы одну заглавную букву (A–Z)
                                        </li>
                                        <li className={passwordStrength.checks.lowercase ? 'met' : 'unmet'}>
                                            {passwordStrength.checks.lowercase ? '✅' : '❌'} хотя бы одну строчную букву (a–z)
                                        </li>
                                        <li className={passwordStrength.checks.number ? 'met' : 'unmet'}>
                                            {passwordStrength.checks.number ? '✅' : '❌'} хотя бы одну цифру (0–9)
                                        </li>
                                        <li className={passwordStrength.checks.special ? 'met' : 'unmet'}>
                                            {passwordStrength.checks.special ? '✅' : '❌'} хотя бы один спецсимвол (!@#$%^&*...)
                                        </li>
                                    </ul>
                                    <div className="strength-bar">
                                        <div className={`strength-fill strength-${passwordStrength.score}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                                    </div>
                                    <span className={`strength-text strength-${passwordStrength.score}`}>{passwordStrength.message}</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>🔒 Подтвердите пароль *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="Повторите пароль"
                            />
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Регистрация...
                                </>
                            ) : (
                                '📀 Зарегистрироваться'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;