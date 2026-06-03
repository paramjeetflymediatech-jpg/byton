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

// 3. Seo model — dedicated table for SEO metadata
export class Seo {
  id!: number;
  pageType!: string;
  pageId!: string;
  slug!: string;
  canonicalUrl!: string;
  metaTitle!: string;
  metaDescription!: string;
  keywords!: string;
  ogTitle!: string;
  ogDescription!: string;
  ogImageUrl!: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<Seo>) {
    Object.assign(this, data);
  }

  static fromRow(row: any): Seo {
    return new Seo({
      id: row.id,
      pageType: row.page_type ?? row.pageType ?? '',
      pageId: row.page_id ?? row.pageId ?? '',
      slug: row.slug ?? '',
      canonicalUrl: row.canonical_url ?? row.canonicalUrl ?? '',
      metaTitle: row.meta_title ?? row.metaTitle ?? '',
      metaDescription: row.meta_description ?? row.metaDescription ?? '',
      keywords: row.keywords ?? '',
      ogTitle: row.og_title ?? row.ogTitle ?? '',
      ogDescription: row.og_description ?? row.ogDescription ?? '',
      ogImageUrl: row.og_image_url ?? row.ogImageUrl ?? '',
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    });
  }

  static async findAll(): Promise<Seo[]> {
    const { data, error } = await supabase.from('seo').select('*').order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map((item: any) => Seo.fromRow(item));
  }

  static async findByPk(id: number): Promise<Seo | null> {
    const { data, error } = await supabase.from('seo').select('*').eq('id', id).single();
    if (error || !data) return null;
    return Seo.fromRow(data);
  }

  static async findByPage(pageType: string, pageId: string): Promise<Seo | null> {
    const { data, error } = await supabase
      .from('seo')
      .select('*')
      .eq('page_type', pageType)
      .eq('page_id', pageId)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return Seo.fromRow(data[0]);
  }

  static async findBySlug(slug: string, pageType = 'post'): Promise<Seo | null> {
    const { data, error } = await supabase
      .from('seo')
      .select('*')
      .eq('slug', slug)
      .eq('page_type', pageType)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return Seo.fromRow(data[0]);
  }

  static async upsert(payload: Partial<Seo>): Promise<Seo> {
    const row = {
      page_type: payload.pageType || '',
      page_id: payload.pageId || '',
      slug: payload.slug || '',
      canonical_url: payload.canonicalUrl || '',
      meta_title: payload.metaTitle || '',
      meta_description: payload.metaDescription || '',
      keywords: payload.keywords || '',
      og_title: payload.ogTitle || '',
      og_description: payload.ogDescription || '',
      og_image_url: payload.ogImageUrl || '',
    };
    const { data, error } = await supabase
      .from('seo')
      .upsert(row, { onConflict: 'page_type,page_id' })
      .select()
      .single();
    if (error) throw error;
    return Seo.fromRow(data);
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from('seo').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}

// 4. Blog model — dedicated table for WordPress blog content
export class Blog {
  id!: number;
  wpId!: number;
  slug!: string;
  title!: string;
  content!: string;
  excerpt!: string;
  featuredImage!: string;
  categories!: string;
  tags!: string;
  author!: string;
  status!: string;
  publishedAt?: string;
  canonicalUrl!: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<Blog>) {
    Object.assign(this, data);
  }

  static fromRow(row: any): Blog {
    return new Blog({
      id: row.id,
      wpId: row.wp_id ?? row.wpId,
      slug: row.slug ?? '',
      title: row.title ?? '',
      content: row.content ?? '',
      excerpt: row.excerpt ?? '',
      featuredImage: row.featured_image ?? row.featuredImage ?? '',
      categories: row.categories ?? '',
      tags: row.tags ?? '',
      author: row.author ?? '',
      status: row.status ?? 'publish',
      publishedAt: row.published_at ?? row.publishedAt,
      canonicalUrl: row.canonical_url ?? row.canonicalUrl ?? '',
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    });
  }

  static async findAll(options?: { limit?: number; offset?: number }): Promise<Blog[]> {
    let query = supabase.from('blogs').select('*').order('published_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => Blog.fromRow(item));
  }

  static async count(): Promise<number> {
    const { count, error } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  }

  static async findByPk(id: number): Promise<Blog | null> {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (error || !data) return null;
    return Blog.fromRow(data);
  }

  static async findBySlug(slug: string): Promise<Blog | null> {
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
    if (error || !data) return null;
    return Blog.fromRow(data);
  }

  static async upsert(payload: Partial<Blog>): Promise<Blog> {
    const row = {
      wp_id: payload.wpId,
      slug: payload.slug ?? '',
      title: payload.title ?? '',
      content: payload.content ?? '',
      excerpt: payload.excerpt ?? '',
      featured_image: payload.featuredImage ?? '',
      categories: payload.categories ?? '',
      tags: payload.tags ?? '',
      author: payload.author ?? '',
      status: payload.status ?? 'publish',
      published_at: payload.publishedAt ?? null,
      canonical_url: payload.canonicalUrl ?? '',
    };
    const { data, error } = await supabase
      .from('blogs')
      .upsert(row, { onConflict: 'wp_id' })
      .select()
      .single();
    if (error) throw error;
    return Blog.fromRow(data);
  }

  static async update(id: number, payload: Partial<Blog>): Promise<Blog> {
    const row: any = {};
    if (payload.title !== undefined) row.title = payload.title;
    if (payload.content !== undefined) row.content = payload.content;
    if (payload.excerpt !== undefined) row.excerpt = payload.excerpt;
    if (payload.featuredImage !== undefined) row.featured_image = payload.featuredImage;
    if (payload.categories !== undefined) row.categories = payload.categories;
    if (payload.tags !== undefined) row.tags = payload.tags;
    if (payload.status !== undefined) row.status = payload.status;
    if (payload.canonicalUrl !== undefined) row.canonical_url = payload.canonicalUrl;
    const { data, error } = await supabase.from('blogs').update(row).eq('id', id).select().single();
    if (error) throw error;
    return Blog.fromRow(data);
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
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
    const dbPayload = {
      id: payload.id,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      shipping_address: payload.shippingAddress,
      shipping_city: payload.shippingCity,
      shipping_postcode: payload.shippingPostcode,
      shipping_phone: payload.shippingPhone,
      total_amount: payload.totalAmount,
      shipping_cost: payload.shippingCost,
      status: payload.status,
      apc_tracking_number: payload.apcTrackingNumber,
      apc_label_url: payload.apcLabelUrl
    };
    const { data, error } = await supabase
      .from('orders')
      .insert(dbPayload)
      .select()
      .single();
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
    const dbPayload = {
      order_id: payload.orderId,
      product_id: payload.productId,
      product_title: payload.productTitle,
      quantity: payload.quantity,
      price: payload.price
    };
    const { data, error } = await supabase
      .from('order_items')
      .insert(dbPayload)
      .select()
      .single();
    if (error) throw error;
    return new OrderItem({
      id: data.id,
      orderId: data.order_id,
      productId: data.product_id,
      productTitle: data.product_title,
      quantity: data.quantity,
      price: data.price
    } as any);
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


// 7. Brand model — dedicated table for brands
export class Brand {
  id!: number;
  name!: string;
  logoUrl!: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: Partial<Brand>) {
    Object.assign(this, data);
  }

  static fromRow(row: any): Brand {
    return new Brand({
      id: row.id,
      name: row.name ?? '',
      logoUrl: row.logo_url ?? row.logoUrl ?? '',
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    });
  }

  static async findAll(): Promise<Brand[]> {
    const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((item: any) => Brand.fromRow(item));
  }
}

