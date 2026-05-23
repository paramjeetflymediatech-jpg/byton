// src/lib/db/seedSupabase.ts
import 'dotenv/config';
import { supabase } from '@/lib/supabase';
import path from 'path';
import fs from 'fs';

// Path to the scratch folder where the JSON dumps are stored (same as used in other seed scripts)
const SCRATCH_PATH = '/Users/flymedia/.gemini/antigravity-ide/brain/2242e8b3-dac7-4555-9db1-f74f2fe51607/scratch';

interface CategoryRaw {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface ProductRaw {
  id: number;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  price: number;
  regularPrice: number;
  salePrice?: number | null;
  sku?: string;
  stock: number;
  stockStatus: string;
  weight: number;
  image?: string;
}

interface ProductCategoryRaw {
  productId: number;
  categoryId: number;
}

async function loadJson<T>(filename: string): Promise<T[]> {
  const filePath = path.join(SCRATCH_PATH, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
}

async function seedCategories() {
  const categories = await loadJson<CategoryRaw>('parsed_categories.json');
  if (categories.length === 0) return;
  const payload = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    image: c.image ?? null,
  }));
  const { data, error } = await supabase.from('categories').upsert(payload, { onConflict: 'id' }) as { data: any[] | null; error: any };
  if (error) console.error('Seed categories error:', error);
  else console.log(`Seeded ${Array.isArray(data) ? data.length : 0} categories`);

}

async function seedProducts() {
  const products = await loadJson<ProductRaw>('parsed_products.json');
  if (products.length === 0) return;
  const payload = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description ?? null,
    excerpt: p.excerpt ?? null,
    price: p.price,
    regular_price: p.regularPrice,
    sale_price: p.salePrice ?? null,
    sku: p.sku ?? null,
    stock: p.stock,
    stock_status: p.stockStatus,
    weight: p.weight,
    image: p.image ?? null,
  }));
  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'id' }) as { data: any[] | null; error: any };
  if (error) console.error('Seed products error:', error);
  else console.log(`Seeded ${Array.isArray(data) ? data.length : 0} products`);
}

async function seedProductCategories() {
  const rels = await loadJson<ProductCategoryRaw>('parsed_product_categories.json');
  if (rels.length === 0) return;
  const payload = rels.map((r) => ({ product_id: r.productId, category_id: r.categoryId }));
  const { data, error } = await supabase.from('product_categories').upsert(payload) as { data: any[] | null; error: any };
  if (error) console.error('Seed product_categories error:', error);
  else console.log(`Seeded ${Array.isArray(data) ? data.length : 0} product-category links`);
}

async function main() {
  console.log('Starting Supabase seeding...');
  await seedCategories();
  await seedProducts();
  await seedProductCategories();
  console.log('Supabase seeding completed');
}

main().catch((e) => console.error('Seeding failed:', e));
