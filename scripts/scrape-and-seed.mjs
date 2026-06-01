/**
 * scrape-and-seed.mjs
 * Scrapes categories + products from baytonhorticulturecentre.co.uk
 * using the public WordPress REST API, then seeds into Supabase.
 *
 * Run: node scripts/scrape-and-seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'https://baytonhorticulturecentre.co.uk/wp-json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

/** Fetch ALL pages of a WP REST endpoint (handles Link: rel="next" pagination) */
async function fetchAllPages(endpoint, params = {}) {
  const results = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const qs = new URLSearchParams({ per_page: perPage, page, ...params }).toString();
    const url = `${BASE_URL}${endpoint}?${qs}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  ⚠️  HTTP ${res.status} for page ${page} of ${endpoint} – stopping.`);
        break;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      results.push(...data);
      if (data.length < perPage) break; // last page
      page++;
      await sleep(300); // be polite
    } catch (err) {
      console.error(`  Error fetching page ${page} of ${endpoint}:`, err.message);
      break;
    }
  }
  return results;
}

/** Strip HTML tags */
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8211;/g, '–').trim();
}

/** Generate a URL-safe slug */
function makeSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─────────────────────────────────────────────
// 1. Scrape Categories
// ─────────────────────────────────────────────

async function scrapeCategories() {
  console.log('\n📂  Fetching categories from WP REST API…');
  const raw = await fetchAllPages('/wp/v2/product_cat');
  // filter out empty or uncategorized
  const cats = raw.filter(c => c.count > 0 || c.slug !== 'uncategorized');
  console.log(`  Found ${cats.length} categories (${raw.length} total).`);

  return cats.map(c => ({
    id: c.id,
    name: c.name.replace(/&amp;/g, '&').replace(/&#8211;/g, '–'),
    slug: c.slug,
    description: c.description ? stripHtml(c.description) : null,
    image: null, // category images require auth, skip
  }));
}

// ─────────────────────────────────────────────
// 2. Scrape Products
// ─────────────────────────────────────────────

async function scrapeProducts() {
  console.log('\n🛒  Fetching products from WP REST API…');

  // WP REST API exposes products at /wp/v2/product
  // We need: id, title, slug, content, excerpt, product_cat (taxonomy), featured_media
  const fields = 'id,title,slug,content,excerpt,product_cat,featured_media,date,meta';
  const raw = await fetchAllPages('/wp/v2/product', { _fields: fields });
  console.log(`  Found ${raw.length} products.`);

  return raw;
}

// ─────────────────────────────────────────────
// 3. Scrape product page for price via JSON-LD or page HTML
// ─────────────────────────────────────────────

async function fetchProductPrice(slug) {
  try {
    const url = `https://baytonhorticulturecentre.co.uk/product/${slug}/`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return { price: 0, regularPrice: 0, salePrice: null, sku: null, image: null, stock: 1, stockStatus: 'instock', weight: 0 };
    const html = await res.text();

    // Try JSON-LD schema first
    const ldMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (ldMatch) {
      for (const block of ldMatch) {
        try {
          const inner = block.replace(/<[^>]+>/g, '');
          const schema = JSON.parse(inner);
          const product = Array.isArray(schema) ? schema.find(s => s['@type'] === 'Product') : schema['@type'] === 'Product' ? schema : null;
          if (product) {
            const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
            const price = parseFloat(offers?.price || 0);
            const sku = product.sku || null;
            const image = (Array.isArray(product.image) ? product.image[0] : product.image) || null;
            const availability = offers?.availability || '';
            const stockStatus = availability.includes('InStock') ? 'instock' : 'outofstock';
            
            // Try to extract weight from description or dimensions
            const weightMatch = html.match(/(\d+(?:\.\d+)?)\s*kg/i);
            const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

            // Check for sale price
            const salePriceMatch = html.match(/class="woocommerce-Price-amount[^"]*">.*?<bdi>.*?(\d+\.\d+).*?<\/bdi>/g);
            let salePrice = null;
            let regularPrice = price;

            // Look for regular price in struck-through
            const strikePriceMatch = html.match(/class="[^"]*price-old[^"]*"[^>]*>.*?(\d+\.\d+)/);
            if (strikePriceMatch) {
              regularPrice = parseFloat(strikePriceMatch[1]);
              salePrice = price;
            }

            return { price, regularPrice, salePrice, sku, image, stock: stockStatus === 'instock' ? 10 : 0, stockStatus, weight };
          }
        } catch (_) {}
      }
    }

    // Fallback: regex scrape woocommerce price
    const priceMatch = html.match(/"price":"(\d+(?:\.\d+)?)"/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    // Image from og:image
    const ogImageMatch = html.match(/property="og:image" content="([^"]+)"/);
    const image = ogImageMatch ? ogImageMatch[1] : null;

    // SKU
    const skuMatch = html.match(/class="sku"[^>]*>([^<]+)</);
    const sku = skuMatch ? skuMatch[1].trim() : null;

    // Stock
    const instock = html.includes('in-stock') || html.includes('In stock') || html.includes('instock');
    const stockStatus = instock ? 'instock' : 'outofstock';

    const weightMatch = html.match(/(\d+(?:\.\d+)?)\s*kg/i);
    const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;

    return { price, regularPrice: price, salePrice: null, sku, image, stock: instock ? 10 : 0, stockStatus, weight };
  } catch (err) {
    console.warn(`    ⚠️  Could not fetch price for ${slug}: ${err.message}`);
    return { price: 0, regularPrice: 0, salePrice: null, sku: null, image: null, stock: 0, stockStatus: 'outofstock', weight: 0 };
  }
}

// ─────────────────────────────────────────────
// 4. Fetch featured image URL from media endpoint
// ─────────────────────────────────────────────
const mediaCache = new Map();
async function fetchMediaUrl(mediaId) {
  if (!mediaId) return null;
  if (mediaCache.has(mediaId)) return mediaCache.get(mediaId);
  try {
    const data = await fetchJson(`${BASE_URL}/wp/v2/media/${mediaId}?_fields=source_url`);
    const url = data?.source_url || null;
    mediaCache.set(mediaId, url);
    return url;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// 5. Seed into Supabase
// ─────────────────────────────────────────────

async function seedCategories(categories) {
  console.log(`\n💾  Seeding ${categories.length} categories into Supabase…`);
  const CHUNK = 50;
  for (let i = 0; i < categories.length; i += CHUNK) {
    const chunk = categories.slice(i, i + CHUNK);
    const { error } = await supabase.from('categories').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('  Category upsert error:', error.message);
    else console.log(`  ✅  Seeded categories ${i + 1}–${Math.min(i + CHUNK, categories.length)}`);
  }
}

async function seedProducts(products) {
  console.log(`\n💾  Seeding ${products.length} products into Supabase…`);
  const CHUNK = 50;
  for (let i = 0; i < products.length; i += CHUNK) {
    const chunk = products.slice(i, i + CHUNK);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('  Product upsert error:', error.message);
    else console.log(`  ✅  Seeded products ${i + 1}–${Math.min(i + CHUNK, products.length)}`);
  }
}

async function seedProductCategories(links) {
  console.log(`\n💾  Seeding ${links.length} product-category links…`);
  const CHUNK = 200;
  for (let i = 0; i < links.length; i += CHUNK) {
    const chunk = links.slice(i, i + CHUNK);
    const { error } = await supabase.from('product_categories').upsert(chunk, { onConflict: 'product_id,category_id' });
    if (error) console.error('  product_categories upsert error:', error.message);
    else console.log(`  ✅  Seeded links ${i + 1}–${Math.min(i + CHUNK, links.length)}`);
  }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  console.log('🚀  Bayton Scraper & Seeder starting…');
  console.log(`    Supabase: ${supabaseUrl}`);

  // ── Categories ──
  const rawCategories = await scrapeCategories();
  await seedCategories(rawCategories);

  // ── Products ──
  const rawProducts = await scrapeProducts();

  const dbProducts = [];
  const productCategoryLinks = [];

  const total = rawProducts.length;
  let done = 0;

  console.log(`\n🔍  Fetching prices & images for ${total} products (this may take a few minutes)…`);

  for (const p of rawProducts) {
    done++;
    const slug = p.slug;
    const title = stripHtml(p.title?.rendered || '');
    const description = p.content?.rendered || '';
    const excerpt = stripHtml(p.excerpt?.rendered || '').substring(0, 500);

    process.stdout.write(`  [${done}/${total}] ${title.substring(0, 50)}…\r`);

    // Fetch product image from featured_media
    let image = null;
    if (p.featured_media) {
      image = await fetchMediaUrl(p.featured_media);
      await sleep(100);
    }

    // Fetch price info from product page
    const priceInfo = await fetchProductPrice(slug);
    await sleep(200);

    // Use image from page if not from media API
    if (!image && priceInfo.image) image = priceInfo.image;

    dbProducts.push({
      id: p.id,
      title,
      slug,
      description,
      excerpt,
      price: priceInfo.price,
      regular_price: priceInfo.regularPrice,
      sale_price: priceInfo.salePrice,
      sku: priceInfo.sku,
      stock: priceInfo.stock,
      stock_status: priceInfo.stockStatus,
      weight: priceInfo.weight,
      image,
    });

    // Product → category links
    if (Array.isArray(p.product_cat)) {
      for (const catId of p.product_cat) {
        productCategoryLinks.push({ product_id: p.id, category_id: catId });
      }
    }
  }

  console.log('\n'); // newline after progress line

  await seedProducts(dbProducts);
  await seedProductCategories(productCategoryLinks);

  // Summary
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

  console.log('\n🎉  Done!');
  console.log(`    Categories in DB : ${catCount}`);
  console.log(`    Products in DB   : ${prodCount}`);
}

main().catch((err) => {
  console.error('\n❌  Fatal error:', err);
  process.exit(1);
});
