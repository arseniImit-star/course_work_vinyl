// pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api, { showNotification } from '../api/api';
import './Messages.css';

function Messages() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const location = useLocation();
    const listing = location.state?.listing || null;

    const [user, setUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
            return;
        }
    }, []);

    // Загружаем диалоги после того, как user установлен
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    useEffect(() => {
        if (currentConversation) {
            loadMessages(currentConversation.id);
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(() => {
                loadMessages(currentConversation.id, true);
            }, 3000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [currentConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        if (!user) return;

        try {
            console.log('Загрузка диалогов для userId:', user.id);
            const response = await api.get('/messages/conversations', {
                params: { userId: user.id }
            });
            console.log('Диалоги загружены:', response.data);
            setConversations(response.data);

            // Если есть userId в URL, создаем или открываем диалог
            if (userId && parseInt(userId) !== user.id) {
                await createOrOpenConversation(parseInt(userId));
            }
        } catch (error) {
            console.error('Ошибка загрузки диалогов:', error);
            console.error('Детали:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const createOrOpenConversation = async (otherUserId) => {
        // Не даем создать диалог с самим собой
        if (otherUserId === user?.id) {
            showNotification('❌ Нельзя начать диалог с самим собой', 'error');
            return;
        }

        if (creatingConversation || !user) return;

        // Проверяем, есть ли уже диалог в списке
        const existingConv = conversations.find(c => c.otherUserId === otherUserId);

        if (existingConv) {
            setCurrentConversation(existingConv);
            return;
        }

        setCreatingConversation(true);
        try {
            console.log('Создание диалога с пользователем:', otherUserId);
            const response = await api.post('/messages/conversations', {
                currentUserId: user.id,
                otherUserId: otherUserId,
                listingId: listing?.id
            });

            console.log('Ответ сервера:', response.data);

            // Если диалог уже существовал, просто открываем его
            if (response.data.alreadyExists) {
                // Обновляем список диалогов
                await loadConversations();
                // Находим существующий диалог
                const updatedConv = conversations.find(c => c.otherUserId === otherUserId) ||
                                    { id: response.data.id, otherUserId, otherUsername: response.data.otherUsername };
                setCurrentConversation(updatedConv);
                return;
            }

            // Добавляем новый диалог в список
            const newConversation = {
                id: response.data.id,
                otherUserId: otherUserId,
                otherUsername: response.data.otherUsername,
                lastMessage: null,
                lastMessageTime: null,
                unreadCount: 0
            };

            setConversations(prev => {
                // Проверяем, не появился ли уже диалог в списке (на случай гонки)
                const exists = prev.some(c => c.otherUserId === otherUserId);
                if (exists) return prev;
                return [newConversation, ...prev];
            });
            setCurrentConversation(newConversation);

        } catch (error) {
            console.error('Ошибка создания диалога:', error);
            if (error.response?.data?.error) {
                showNotification(`❌ ${error.response.data.error}`, 'error');
            } else {
                showNotification('❌ Не удалось создать диалог', 'error');
            }
        } finally {
            setCreatingConversation(false);
        }
    };

    const loadMessages = async (conversationId, isPolling = false) => {
        if (!user) return;

        try {
            const response = await api.get(`/messages/conversations/${conversationId}`, {
                params: { userId: user.id }
            });
            setMessages(response.data);
            if (!isPolling) {
                scrollToBottom();
            }
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    const sendMessage = async () => {
        if ((!messageText.trim() && !selectedPhoto) || !currentConversation || !user) return;

        setSending(true);

        let photoBase64 = null;
        if (selectedPhoto) {
            const reader = new FileReader();
            photoBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(selectedPhoto);
            });
        }

        try {
            const response = await api.post(`/messages/conversations/${currentConversation.id}/send`, {
                senderId: user.id,
                message: messageText,
                photo: photoBase64
            });

            setMessages(prev => [...prev, response.data]);
            setMessageText('');
            setSelectedPhoto(null);
            setPhotoPreview(null);
            scrollToBottom();

            // Обновляем последнее сообщение в списке диалогов
            setConversations(prev => prev.map(conv =>
                conv.id === currentConversation.id
                    ? { ...conv, lastMessage: messageText || '📸 Фото', lastMessageTime: new Date().toISOString() }
                    : conv
            ));
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showNotification('❌ Ошибка отправки сообщения', 'error');
        } finally {
            setSending(false);
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'только что';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="vinyl-spinner"></div>
                <p>Загрузка сообщений...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="messages-page">
            <div className="messages-container">
                {/* Список диалогов */}
                <div className="conversations-sidebar">
                    <div className="sidebar-header">
                        <h2>💬 Сообщения</h2>
                    </div>
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="no-conversations">
                                <p>Нет диалогов</p>
                                <p className="hint">Начните переписку с продавцом</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => setCurrentConversation(conv)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.otherUserAvatar ? (
                                            <img src={conv.otherUserAvatar} alt={conv.otherUsername} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-name">{conv.otherUsername}</div>
                                        <div className="conversation-last-message">
                                            {conv.lastMessage?.substring(0, 30) || 'Нет сообщений'}
                                        </div>
                                    </div>
                                    <div className="conversation-meta">
                                        {conv.unreadCount > 0 && (
                                            <span className="unread-badge">{conv.unreadCount}</span>
                                        )}
                                        {conv.lastMessageTime && (
                                            <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Область чата */}
                <div className="chat-area">
                    {currentConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="chat-avatar">
                                        {currentConversation.otherUserAvatar ? (
                                            <img src={currentConversation.otherUserAvatar} alt="" />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{currentConversation.otherUsername}</h3>
                                        {listing && (
                                            <p className="chat-listing-ref">
                                                Объявление: {listing.title}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="messages-area">
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p>Напишите первое сообщение</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOwn = msg.senderId === user?.id;
                                        return (
                                            <div key={idx} className={`message ${isOwn ? 'own' : 'other'}`}>
                                                <div className="message-bubble">
                                                    {msg.photoUrl && (
                                                        <img
                                                            src={msg.photoUrl}
                                                            alt="Фото"
                                                            className="message-photo"
                                                            onClick={() => window.open(msg.photoUrl, '_blank')}
                                                        />
                                                    )}
                                                    {msg.message && <div className="message-text">{msg.message}</div>}
                                                    <div className="message-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="message-input-area">
                                {photoPreview && (
                                    <div className="photo-preview">
                                        <img src={photoPreview} alt="Preview" />
                                        <button onClick={() => {
                                            setSelectedPhoto(null);
                                            setPhotoPreview(null);
                                        }}>×</button>
                                    </div>
                                )}
                                <div className="input-wrapper">
                                    <label className="photo-label">
                                        📸
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Введите сообщение..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        disabled={creatingConversation}
                                    />
                                    <button onClick={sendMessage} disabled={sending || creatingConversation}>
                                        {sending ? '...' : '📤'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="no-chat-icon">💬</div>
                            <h3>Выберите диалог</h3>
                            <p>Начните переписку с другим коллекционером</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;