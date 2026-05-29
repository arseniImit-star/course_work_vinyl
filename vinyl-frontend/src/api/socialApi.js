// ============ ПОЛЬЗОВАТЕЛИ ============
export const getUsers = () => {
    const users = localStorage.getItem('social_users');
    return users ? JSON.parse(users) : [];
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
    localStorage.setItem('current_user', JSON.stringify(user));
};

export const getUserById = (userId) => {
    const users = getUsers();
    return users.find(u => u.id === userId);
};

export const createUser = (userData) => {
    const users = getUsers();
    const newUser = {
        id: Date.now(),
        ...userData,
        friends: [],
        joinDate: new Date().toISOString(),
        avatar: userData.avatar || '🎵'
    };
    users.push(newUser);
    localStorage.setItem('social_users', JSON.stringify(users));
    return newUser;
};

// ============ ДРУЗЬЯ ============
export const addFriend = (currentUserId, friendId) => {
    const users = getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    if (currentUser && !currentUser.friends.includes(friendId)) {
        currentUser.friends.push(friendId);
        localStorage.setItem('social_users', JSON.stringify(users));
        return true;
    }
    return false;
};

export const removeFriend = (currentUserId, friendId) => {
    const users = getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    if (currentUser) {
        currentUser.friends = currentUser.friends.filter(f => f !== friendId);
        localStorage.setItem('social_users', JSON.stringify(users));
        return true;
    }
    return false;
};

export const getFriends = (userId) => {
    const user = getUserById(userId);
    if (!user) return [];
    const users = getUsers();
    return users.filter(u => user.friends.includes(u.id));
};

// ============ СООБЩЕНИЯ ============
export const getMessages = (userId1, userId2) => {
    const messages = localStorage.getItem('social_messages');
    const allMessages = messages ? JSON.parse(messages) : [];

    return allMessages.filter(msg =>
    (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
    (msg.fromUserId === userId2 && msg.toUserId === userId1)
    ).sort((a, b) => a.timestamp - b.timestamp);
};

export const sendMessage = (fromUserId, toUserId, text) => {
    const messages = localStorage.getItem('social_messages');
    const allMessages = messages ? JSON.parse(messages) : [];

    const newMessage = {
        id: Date.now(),
        fromUserId,
        toUserId,
        text,
        timestamp: Date.now(),
        read: false
    };

    allMessages.push(newMessage);
    localStorage.setItem('social_messages', JSON.stringify(allMessages));
    return newMessage;
};

export const getChats = (userId) => {
    const messages = localStorage.getItem('social_messages');
    const allMessages = messages ? JSON.parse(messages) : [];

    const chatUsers = new Set();
    allMessages.forEach(msg => {
        if (msg.fromUserId === userId) chatUsers.add(msg.toUserId);
        if (msg.toUserId === userId) chatUsers.add(msg.fromUserId);
    });

    const users = getUsers();
    return Array.from(chatUsers).map(chatUserId => {
        const user = users.find(u => u.id === chatUserId);
        const lastMessage = allMessages.filter(msg =>
        (msg.fromUserId === userId && msg.toUserId === chatUserId) ||
        (msg.fromUserId === chatUserId && msg.toUserId === userId)
        ).pop();

        return { user, lastMessage };
    });
};

// ============ ОБЪЯВЛЕНИЯ ============
export const getListings = () => {
    const listings = localStorage.getItem('marketplace_listings');
    return listings ? JSON.parse(listings) : [];
};

export const createListing = (listing) => {
    const listings = getListings();
    const newListing = {
        id: Date.now(),
        ...listing,
        createdAt: new Date().toISOString()
    };
    listings.push(newListing);
    localStorage.setItem('marketplace_listings', JSON.stringify(listings));
    return newListing;
};

export const deleteListing = (listingId) => {
    const listings = getListings();
    const filtered = listings.filter(l => l.id !== listingId);
    localStorage.setItem('marketplace_listings', JSON.stringify(filtered));
};

export const getUserListings = (userId) => {
    const listings = getListings();
    return listings.filter(l => l.userId === userId);
};