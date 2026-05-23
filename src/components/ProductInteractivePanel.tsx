'use client';

import React, { useState } from 'react';
import { useCart } from '../lib/context/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface ProductPanelProps {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
    stock: number;
    stockStatus: string;
  };
}

export default function ProductInteractivePanel({ product }: ProductPanelProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const isOutOfStock = product.stockStatus === 'outofstock';

  const handleAdd = () => {
    addToCart(product, qty);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Quantity:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid var(--border)', borderRadius: '8px', padding: '2px' }}>
          <button 
            onClick={() => setQty(q => Math.max(1, q - 1))}
            disabled={isOutOfStock}
            className="qty-btn"
            style={{ border: 'none', background: 'none' }}
          >
            <Minus size={14} />
          </button>
          <input 
            type="number" 
            value={qty} 
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isOutOfStock}
            style={{ width: '40px', textAlign: 'center', border: 'none', fontWeight: 600, fontSize: '15px' }}
          />
          <button 
            onClick={() => setQty(q => q + 1)}
            disabled={isOutOfStock}
            className="qty-btn"
            style={{ border: 'none', background: 'none' }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <button 
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="btn"
        style={{ width: '100%', justifyContent: 'center', height: '48px', opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
      >
        <ShoppingCart size={18} style={{ marginRight: '8px' }} />
        {isOutOfStock ? 'Out of Stock' : 'Add to Basket'}
      </button>
    </div>
  );
}
