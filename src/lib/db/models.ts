// Supabase-based data models

import { supabase } from '@/lib/supabase';

// 1. User model
export class User {
  id!: number;
  email!: string;
  role!: string;
  passwordHash!: string;
  createdAt?: string;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  static fromRow(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      role: row.role,
      passwordHash: row.password_hash ?? row.passwordHash,
      createdAt: row.created_at ?? row.createdAt
    });
  }

  static async findOne({ where }: { where: { email: string } }) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', where.email)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return User.fromRow(data[0]);
  }

  static async create(payload: any) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: payload.email,
        role: payload.role || 'USER',
        password_hash: payload.passwordHash
      })
      .select()
      .single();
    if (error) throw error;
    return User.fromRow(data);
  }

  static async findAll() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => User.fromRow(item));
  }

  static async update(id: number, payload: any) {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: payload.role,
        email: payload.email
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return User.fromRow(data);
  }

  static async delete(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
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

  static async delete(key: string): Promise<boolean> {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key);
    if (error) throw error;
    return true;
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

  static async findAll(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => new Category(item));
  }

  static async create(payload: any): Promise<Category> {
    const insertPayload: any = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description || '',
      image: payload.image || ''
    };
    if (payload.id) {
      insertPayload.id = payload.id;
    }
    const { data, error } = await supabase
      .from('categories')
      .insert(insertPayload)
      .select()
      .single();
    if (error) throw error;
    return new Category(data as any);
  }

  static async update(id: number, payload: any): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        image: payload.image
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return new Category(data as any);
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
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

  // Map snake_case Supabase DB columns → camelCase Product fields
  static fromRow(row: any): Product {
    return new Product({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      excerpt: row.excerpt,
      price: row.price,
      regularPrice: row.regular_price ?? row.regularPrice,
      salePrice: row.sale_price ?? row.salePrice,
      sku: row.sku,
      stock: row.stock,
      stockStatus: row.stock_status ?? row.stockStatus,
      weight: row.weight,
      image: row.image,
    });
  }

  static async findOne({ where }: { where: { slug: string } }) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', where.slug)
      .single();
    if (error) throw error;
    return data ? Product.fromRow(data) : null;
  }

  static async findByPk(id: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? Product.fromRow(data) : null;
  }

  static async bulkCreate(records: any[]) {
    const { data, error } = await supabase.from('products').insert(records);
    if (error) throw error;
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => Product.fromRow(item));
  }

  static async create(payload: any): Promise<Product> {
    const insertPayload: any = {
      title: payload.title,
      slug: payload.slug,
      description: payload.description || '',
      excerpt: payload.excerpt || '',
      price: payload.price,
      regular_price: payload.regularPrice,
      sale_price: payload.salePrice,
      sku: payload.sku || '',
      stock: payload.stock || 0,
      stock_status: payload.stockStatus || 'instock',
      weight: payload.weight || 0.0,
      image: payload.image || ''
    };
    if (payload.id) {
      insertPayload.id = payload.id;
    }
    const { data, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();
    if (error) throw error;
    return Product.fromRow(data);
  }

  static async update(id: number, payload: any): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        excerpt: payload.excerpt,
        price: payload.price,
        regular_price: payload.regularPrice,
        sale_price: payload.salePrice,
        sku: payload.sku,
        stock: payload.stock,
        stock_status: payload.stockStatus,
        weight: payload.weight,
        image: payload.image
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return Product.fromRow(data);
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
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

  // Map snake_case Supabase DB columns → camelCase Order fields
  static fromRow(row: any): Order {
    return new Order({
      id: row.id,
      customerName: row.customer_name ?? row.customerName,
      customerEmail: row.customer_email ?? row.customerEmail,
      shippingAddress: row.shipping_address ?? row.shippingAddress,
      shippingCity: row.shipping_city ?? row.shippingCity,
      shippingPostcode: row.shipping_postcode ?? row.shippingPostcode,
      shippingPhone: row.shipping_phone ?? row.shippingPhone,
      totalAmount: row.total_amount ?? row.totalAmount,
      shippingCost: row.shipping_cost ?? row.shippingCost,
      status: row.status,
      apcTrackingNumber: row.apc_tracking_number ?? row.apcTrackingNumber,
      apcLabelUrl: row.apc_label_url ?? row.apcLabelUrl,
    });
  }

  static async findAll(_options?: any) {
    // Simple stub: fetch all orders. Options (include, order) are ignored for now.
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return (data || []).map((item: any) => Order.fromRow(item));
  }

  static async create(payload: any) {
    const { data, error } = await supabase.from('orders').insert(payload).single();
    if (error) throw error;
    return Order.fromRow(data as any);
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
