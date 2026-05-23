'use client';

import React from 'react';
import { useCart } from '../lib/context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating to the detail page if card is clicked
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <button 
      onClick={handleAdd} 
      className="btn btn-secondary" 
      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
    >
      <ShoppingCart size={14} style={{ marginRight: '4px' }} />
      Add to Basket
    </button>
  );
}
