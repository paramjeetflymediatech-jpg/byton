import Redis from 'ioredis';
import { supabase } from './supabase';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const globalForRedis = global as unknown as { redis: Redis | undefined };

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 2000);
  }
});

redis.on('error', (err) => {
  console.error('[REDIS ERROR] Connection failed:', err.message);
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Caching Products (full list with category associations)
export async function getCachedProducts() {
  const cacheKey = 'products:all';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err: any) {
    console.error('[REDIS] Failed to get products cache:', err.message);
  }

  // Fetch from Supabase using relational join to get category IDs in 1 query
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(category_id)')
    .order('id', { ascending: false });

  if (error) {
    console.error('[SUPABASE] Error fetching products:', error);
    throw error;
  }

  const formatted = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    excerpt: row.excerpt,
    price: row.price,
    regularPrice: row.regular_price ?? row.price,
    salePrice: row.sale_price ?? null,
    sku: row.sku,
    stock: row.stock,
    stockStatus: row.stock_status,
    weight: row.weight,
    image: row.image,
    categoryIds: row.product_categories ? row.product_categories.map((pc: any) => pc.category_id) : []
  }));

  try {
    await redis.set(cacheKey, JSON.stringify(formatted), 'EX', 3600); // cache for 1 hour
  } catch (err: any) {
    console.error('[REDIS] Failed to set products cache:', err.message);
  }

  return formatted;
}

export async function invalidateProductsCache() {
  const cacheKey = 'products:all';
  try {
    await redis.del(cacheKey);
  } catch (err: any) {
    console.error('[REDIS] Failed to invalidate products cache:', err.message);
  }
}

// Caching Categories
export async function getCachedCategories() {
  const cacheKey = 'categories:all';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err: any) {
    console.error('[REDIS] Failed to get categories cache:', err.message);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[SUPABASE] Error fetching categories:', error);
    throw error;
  }

  try {
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400); // cache for 24 hours
  } catch (err: any) {
    console.error('[REDIS] Failed to set categories cache:', err.message);
  }

  return data;
}

export async function invalidateCategoriesCache() {
  const cacheKey = 'categories:all';
  try {
    await redis.del(cacheKey);
  } catch (err: any) {
    console.error('[REDIS] Failed to invalidate categories cache:', err.message);
  }
}

// Caching Blogs
export async function getCachedBlogs() {
  const cacheKey = 'blogs:all';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err: any) {
    console.error('[REDIS] Failed to get blogs cache:', err.message);
  }

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[SUPABASE] Error fetching blogs:', error);
    throw error;
  }

  const formatted = (data || []).map((row: any) => ({
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
  }));

  try {
    await redis.set(cacheKey, JSON.stringify(formatted), 'EX', 3600); // cache for 1 hour
  } catch (err: any) {
    console.error('[REDIS] Failed to set blogs cache:', err.message);
  }

  return formatted;
}

export async function invalidateBlogsCache() {
  const cacheKey = 'blogs:all';
  try {
    await redis.del(cacheKey);
  } catch (err: any) {
    console.error('[REDIS] Failed to invalidate blogs cache:', err.message);
  }
}

