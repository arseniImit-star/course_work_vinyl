import React from 'react';

function HomePage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
                🎵 Добро пожаловать в vinyl.collector!
            </h1>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px' }}>
                Коллекционируйте винил, общайтесь с другими коллекционерами и продавайте пластинки
            </p>
        </div>
    );
}

export default HomePage;