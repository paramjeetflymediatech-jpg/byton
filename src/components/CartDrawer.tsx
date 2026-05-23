'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../lib/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Your Basket</h2>
          <button onClick={() => setIsCartOpen(false)} className="icon-btn">
            <X size={22} />
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '20px' }}>Your basket is currently empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn">Continue Shopping</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>No Image</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-price">£{item.price.toFixed(2)}</p>
                  
                  <div className="cart-item-qty">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      className="qty-btn"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      className="qty-btn"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="icon-btn" 
                  style={{ color: '#ef4444', alignSelf: 'center' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Subtotal:</span>
              <span>£{cartTotal.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Shipping and taxes calculated at checkout. Shipping is calculated dynamically using APC Overnight.
            </p>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <span className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Checkout <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
