import React, { useState, useEffect } from 'react';
import api from '../api/api';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [vinyls, setVinyls] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = 1;

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const [ordersRes, vinylsRes] = await Promise.all([
                api.get(`/orders/user/${userId}`),
                api.get('/vinyls')
            ]);
            setOrders(ordersRes.data);
            setVinyls(vinylsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            'PENDING': '🟡 В обработке',
            'PAID': '🟢 Оплачен',
            'SHIPPED': '📦 Отправлен',
            'DELIVERED': '✅ Доставлен'
        };
        return statuses[status] || status;
    };

    if (loading) return <div className="loading">Загрузка заказов...</div>;

    if (orders.length === 0) {
        return (
            <div className="empty-state">
                <h3>📦 У вас пока нет заказов</h3>
                <p>Оформите первый заказ в каталоге</p>
            </div>
        );
    }

    return (
        <div>
            <h2>📦 Мои заказы</h2>

            {orders.map(order => (
                <div key={order.id} className="order-card">
                    <div className="order-header">
                        <strong>Заказ #{order.id}</strong>
                        <span>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</span>
                        <span className={`order-status status-${order.status}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    {order.orderItems?.map(item => {
                        const vinyl = vinyls.find(v => v.id === item.vinyl.id);
                        if (!vinyl) return null;

                        return (
                            <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                {vinyl.title} - {vinyl.artist} × {item.quantity} = {item.price * item.quantity} ₽
                            </div>
                        );
                    })}

                    <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                        Общая сумма: {order.totalAmount} ₽
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Orders;