// Supabase-based data models

import { supabase } from '@/lib/supabase';

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

  static async upsert({ key, value }: { key: string; value: string }) {
    const { error } = await supabase.from('settings').upsert({ key, value });
    if (error) throw error;
    return true;
  }

  static async findAll(): Promise<Setting[]> {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => new Setting(item));
  }

  static async bulkCreate(records: { key: string; value: string }[]) {
    // Supabase upsert supports on conflict; we ignore duplicate handling here.
    const { data, error } = await supabase.from('settings').upsert(records);
    if (error) throw error;
    return data;
  }



}

// Placeholder interfaces for other entities (retain typings for compilation)
// Initialize database (placeholder for Sequelize sync). Currently a no‑op for Supabase.
export async function initDatabase(force: boolean = false): Promise<void> {
  // In a Supabase setup, tables are managed outside the app.
  // This function exists to satisfy imports and can be expanded later.
  console.log(`initDatabase called with force=${force}`);
}

// Add bulkCreate to Category for seeding
export class Category {
  id!: number;
  name!: string;
  slug!: string;
  description?: string;
  image?: string;

  constructor(data: Partial<Category>) {
    Object.assign(this, data);
  }

  static async findOne({ where }: { where: { slug: string } }) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', where.slug)
      .single();
    if (error) throw error;
    return data ? new Category(data as any) : null;
  }

  static async bulkCreate(records: any[]) {
    // Insert multiple categories; Supabase can accept an array.
    const { data, error } = await supabase.from('categories').insert(records);
    if (error) throw error;
    return data;
  }
}


export class Product {
  id!: number;
  title!: string;
  slug!: string;
  description?: string;
  excerpt?: string;
  price!: number;
  regularPrice!: number;
  salePrice?: number;
  sku?: string;
  stock!: number;
  stockStatus!: string;
  weight!: number;
  image?: string;

  constructor(data: Partial<Product>) {
    Object.assign(this, data);
  }

  static async findOne({ where }: { where: { slug: string } }) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', where.slug)
      .single();
    if (error) throw error;
    return data ? new Product(data as any) : null;
  }

  static async findByPk(id: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? new Product(data as any) : null;
  }

  static async bulkCreate(records: any[]) {
    const { data, error } = await supabase.from('products').insert(records);
    if (error) throw error;
    return data;
  }


  static async findAll() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => new Product(item));
  }

  async getCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('product_id', (this as any).id);
    if (error) return [];
    const ids = data?.map((c: any) => c.category_id);
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .in('id', ids);
    return cats || [];
  }
}

export class Order {
  id!: string;
  customerName!: string;
  customerEmail!: string;
  shippingAddress!: string;
  shippingCity!: string;
  shippingPostcode!: string;
  shippingPhone!: string;
  totalAmount!: number;
  shippingCost!: number;
  status!: string;
  apcTrackingNumber?: string;
  apcLabelUrl?: string;

  constructor(data: Partial<Order>) {
    Object.assign(this, data);
  }

  static async findAll(_options?: any) {
    // Simple stub: fetch all orders. Options (include, order) are ignored for now.
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => new Order(item));
  }

  static async create(payload: any) {
    const { data, error } = await supabase.from('orders').insert(payload).single();
    if (error) throw error;
    return new Order(data as any);
  }
}

// 5. OrderItem linking orders to products
export class OrderItem {
  id!: number;
  orderId!: string;
  productId!: number;
  quantity!: number;
  unitPrice!: number;

  constructor(data: Partial<OrderItem>) {
    Object.assign(this, data);
  }

  static async create(payload: any) {
    const { data, error } = await supabase.from('order_items').insert(payload).single();
    if (error) throw error;
    return new OrderItem(data as any);
  }
}


// 6. ProductCategory linking products to categories
export class ProductCategory {
  productId!: number;
  categoryId!: number;

  constructor(data: Partial<ProductCategory>) {
    Object.assign(this, data);
  }

  static async bulkCreate(records: any[]) {
    const { data, error } = await supabase.from('product_categories').insert(records);
    if (error) throw error;
    return data;
  }
}

// Additional models can be added similarly with Supabase queries.
