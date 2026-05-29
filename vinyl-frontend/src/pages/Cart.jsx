import React, { useState, useEffect } from 'react';
import { getCart, removeFromCart, clearCart, updateCartQuantity } from '../api/api';

function Cart() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cartData = getCart();
        setCart(cartData);
        calculateTotal(cartData);
    };

    const calculateTotal = (cartData) => {
        const sum = cartData.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
        setTotal(sum);
    };

    const handleRemove = (id) => {
        removeFromCart(id);
        loadCart();
    };

    const handleQuantityChange = (id, quantity) => {
        updateCartQuantity(id, parseInt(quantity));
        loadCart();
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        if (window.confirm('Оформить заказ?')) {
            clearCart();
            loadCart();
            alert('✅ Заказ оформлен! Спасибо за покупку!');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="empty-state">
                <h3>🛒 Корзина пуста</h3>
                <p>Добавьте пластинки из каталога</p>
                <button onClick={() => window.location.href = '/'} className="shop-btn">
                    🛍️ В каталог
                </button>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h2>🛒 Ваша корзина</h2>

            {cart.map(item => (
                <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                        <h4>{item.title}</h4>
                        <p>{item.artist}</p>
                        <p className="year">{item.year}</p>
                    </div>
                    <div className="cart-item-controls">
                        <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="quantity-input"
                        />
                        <span className="cart-item-price">{item.price * (item.quantity || 1)} ₽</span>
                        <button onClick={() => handleRemove(item.id)} className="remove-btn">
                            ❌
                        </button>
                    </div>
                </div>
            ))}

            <div className="cart-total">
                <h3>Итого: {total} ₽</h3>
                <button className="checkout-btn" onClick={handleCheckout}>
                    💳 Оформить заказ
                </button>
            </div>
        </div>
    );
}

export default Cart;