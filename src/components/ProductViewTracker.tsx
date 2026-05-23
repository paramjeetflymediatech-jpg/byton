'use client';

import { useEffect } from 'react';
import { ConversionTracking } from '../lib/integrations/tracking';

interface ProductTrackerProps {
  product: {
    id: number;
    title: string;
    price: number;
  };
}

export default function ProductViewTracker({ product }: ProductTrackerProps) {
  useEffect(() => {
    ConversionTracking.viewProduct(product);
  }, [product]);

  return null; // This component doesn't render any UI
}
