// Supabase-based data models

import { supabase } from '../supabase';

// 1. User interface (used for auth)
export interface User {
  id: number;
  email: string;
  role: string;
  // Add other fields as needed
}

// 2. Setting model for configuration values
export class Setting {
  key: string;
  value: string;

  constructor(data: { key: string; value: string }) {
    this.key = data.key;
    this.value = data.value;
  }

  static async findByPk(key: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', key)
      .single();
    if (error || !data) return null;
    return new Setting(data as any);
  }
}

// Placeholder interfaces for other entities (retain typings for compilation)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  price: number;
  regularPrice: number;
  salePrice?: number;
  sku?: string;
  stock: number;
  stockStatus: string;
  weight: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostcode: string;
  shippingPhone: string;
  totalAmount: number;
  shippingCost: number;
  status: string;
  apcTrackingNumber?: string;
  apcLabelUrl?: string;
}

// Additional models can be added similarly with Supabase queries.
