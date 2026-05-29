import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, getChats, getMessages, sendMessage } from '../../api/socialApi';
import './Messenger.css';

function Messenger() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            loadChats(user.id);
        }
    }, []);

    useEffect(() => {
        if (selectedChat && currentUser) {
            loadMessages(currentUser.id, selectedChat.user.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChats = (userId) => {
        const userChats = getChats(userId);
        setChats(userChats);
    };

    const loadMessages = (userId1, userId2) => {
        const msgs = getMessages(userId1, userId2);
        setMessages(msgs);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat || !currentUser) return;

        const message = sendMessage(currentUser.id, selectedChat.user.id, newMessage);
        setMessages([...messages, message]);
        setNewMessage('');
        loadChats(currentUser.id);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!currentUser) {
        return (
            <div className="messenger-auth-required">
                <div className="vinyl-card">
                    <h3>🔒 Требуется авторизация</h3>
                    <p>Войдите в профиль, чтобы использовать мессенджер</p>
                    <button onClick={() => window.location.href = '/profile'}>Войти</button>
                </div>
            </div>
        );
    }

    return (
        <div className="messenger-container">
            <div className="messenger-sidebar">
                <div className="messenger-header">
                    <h2>💬 Сообщения</h2>
                </div>
                <div className="chats-list">
                    {chats.length === 0 ? (
                        <div className="no-chats">
                            <p>🤝 Нет чатов</p>
                            <small>Найдите друзей в каталоге</small>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.user.id}
                                className={`chat-item ${selectedChat?.user.id === chat.user.id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="chat-avatar">{chat.user.avatar || '🎵'}</div>
                                <div className="chat-info">
                                    <div className="chat-name">{chat.user.username}</div>
                                    <div className="chat-last-message">
                                        {chat.lastMessage?.text?.slice(0, 30) || 'Новое сообщение'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="messenger-main">
                {!selectedChat ? (
                    <div className="no-chat-selected">
                        <div className="vinyl-compact-cover-empty" style={{ fontSize: '48px' }}>💬</div>
                        <h3>Выберите диалог</h3>
                        <p>Начните общение с другим коллекционером</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-avatar">{selectedChat.user.avatar || '🎵'}</div>
                            <div className="chat-header-info">
                                <h3>{selectedChat.user.username}</h3>
                                <small>Коллекционер винила</small>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.map(msg => {
                                const isOwn = msg.fromUserId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                                        <div className="message-bubble">
                                            <div className="message-text">{msg.text}</div>
                                            <div className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input-area">
                            <textarea
                                className="message-input"
                                placeholder="Введите сообщение..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                rows="3"
                            />
                            <button className="send-message-btn" onClick={handleSendMessage}>
                                📩 Отправить
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Messenger;