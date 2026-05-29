import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getCurrentUser, addFriend, removeFriend, getFriends } from '../../api/socialApi';

function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        const current = getCurrentUser();
        setCurrentUser(current);

        const profileUser = getUserById(parseInt(userId));
        setUser(profileUser);

        if (current && profileUser) {
            setIsFriend(current.friends?.includes(profileUser.id) || false);
        }
    }, [userId]);

    const handleAddFriend = () => {
        if (addFriend(currentUser.id, user.id)) {
            setIsFriend(true);
            alert(`✅ ${user.username} добавлен в друзья!`);
        }
    };

    const handleRemoveFriend = () => {
        if (removeFriend(currentUser.id, user.id)) {
            setIsFriend(false);
            alert(`❌ ${user.username} удалён из друзей`);
        }
    };

    const handleSendMessage = () => {
        navigate('/messenger');
    };

    if (!user) return <div>Загрузка...</div>;

    return (
        <div className="vinyl-detail-compact">
            <div className="vinyl-detail-compact-card" style={{ maxWidth: '600px', margin: '20px auto' }}>
                <div style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '80px' }}>{user.avatar || '🎵'}</div>
                    <h1>{user.username}</h1>
                    <p>{user.bio || 'Коллекционер винила'}</p>
                    <p>📍 {user.city || 'Город не указан'}</p>
                    <p>📅 В коллекции: {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Недавно'}</p>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                        {currentUser && currentUser.id !== user.id && (
                            <>
                                {!isFriend ? (
                                    <button onClick={handleAddFriend} className="add-collection-compact">
                                        ➕ Добавить в друзья
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleSendMessage} className="add-collection-compact">
                                            💬 Написать
                                        </button>
                                        <button onClick={handleRemoveFriend} style={{ background: '#ff4444' }}>
                                            ❌ Удалить из друзей
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {currentUser && currentUser.id === user.id && (
                            <button onClick={() => navigate('/profile')}>✏️ Редактировать профиль</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;