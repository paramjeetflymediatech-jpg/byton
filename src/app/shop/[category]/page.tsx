import React from 'react';
import Link from 'next/link';
import { Product, Category } from '../../../lib/db/models'; // interfaces only
import { supabase } from '../../../lib/supabase';
import AddToCartButton from '../../../components/AddToCartButton';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import SortSelect from '../../../components/SortSelect';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;

  if (categorySlug === 'all') {
    return {
      title: 'Shop All Gardening & Hydroponics Products - Bayton Horticulture Centre',
      description: 'Explore the full catalog of professional grow equipment, LED & HPS lights, tents, nutrients, lawn care, and garden furniture at Bayton Horticulture Coventry.',
    };
  }

  try {
    // Fetch current category details from Supabase
    const { data: categoryData, error: categoryErr } = await supabase
      .from('categories')
      .select('id,name,slug')
      .eq('slug', categorySlug)
      .single();
    if (categoryData) {
      const description = `Shop quality ${categoryData.name} supplies at Bayton Horticulture Centre Coventry. Browse our select range of garden products, grow supplies, and horticulture essentials.`;
      return {
        title: `${categoryData.name} - Bayton Horticulture Centre`,
        description: description,
        openGraph: {
          title: `${categoryData.name} | Gardening & Hydroponics Store`,
          description: description,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata for shop category page:', error);
  }

  return {
    title: 'Browse Shop - Bayton Horticulture Centre',
    description: 'Browse professional gardening, urban farming, and hydroponic supplies at Bayton Horticulture Centre Coventry.',
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const search = resolvedSearchParams.search || '';
  const sort = resolvedSearchParams.sort || 'latest';
  const minPrice = parseFloat(resolvedSearchParams.minPrice || '') || 0;
  const maxPrice = parseFloat(resolvedSearchParams.maxPrice || '') || 99999;

  // 1. Fetch categories for sidebar filter
  // Fetch all categories for sidebar filter
  let allCategories: Category[] = [];
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (catErr) {
    console.error('Error loading categories:', catErr);
  } else if (catData) {
    allCategories = catData as Category[];
  }

  // 2. Fetch current category details
  // Fetch current category (if not 'all')
  let currentCategory: Category | null = null;
  if (categorySlug !== 'all') {
    const { data: curCat, error: curCatErr } = await supabase
      .from('categories')
      .select('id,name,slug')
      .eq('slug', categorySlug)
      .single();
    if (curCatErr) {
      console.error('Error loading current category:', curCatErr);
    } else if (curCat) {
      currentCategory = curCat as Category;
    }
  }

  // Build Supabase filter conditions
  const filters: any = [];
  if (search) {
    // ilike is case-insensitive pattern match in Supabase
    filters.push({ column: 'title', operator: 'ilike', value: `%${search}%` });
  }
  // Price range filter
  filters.push({ column: 'price', operator: 'gte', value: minPrice });
  filters.push({ column: 'price', operator: 'lte', value: maxPrice });

  // Build sorting
  const sortMap: Record<string, { column: string; order: 'asc' | 'desc' }> = {
    latest: { column: 'id', order: 'desc' },
    'price-asc': { column: 'price', order: 'asc' },
    'price-desc': { column: 'price', order: 'desc' },
    'title-asc': { column: 'title', order: 'asc' },
  };
  const sortConfig = sortMap[sort] || sortMap['latest'];

  // Virtual/special slugs that don't map to a real DB category
  const VIRTUAL_SLUGS: Record<string, string> = {
    'best-selling': 'Best Selling',
    'new-arrivals': 'New Arrivals',
    'on-sale': 'On Sale',
    'featured': 'Featured Products',
  };
  const isVirtualSlug = categorySlug in VIRTUAL_SLUGS;

  // 5. Fetch products
  let products: Product[] = [];
  try {
    if (categorySlug === 'all' || isVirtualSlug) {
      // For 'all' and virtual slugs: fetch all products with filters
      let query = supabase.from('products').select('*');

      // For 'on-sale': only products with a sale_price set
      if (categorySlug === 'on-sale') {
        query = query.not('sale_price', 'is', null);
      }

      filters.forEach((f: any) => {
        query = query.filter(f.column, f.operator, f.value);
      });

      // For virtual slugs, override the default sort to something meaningful
      let effectiveSortConfig = sortConfig;
      if (sort === 'latest') {
        if (categorySlug === 'best-selling') {
          // Proxy: in-stock first, then by price desc (higher-priced = popular)
          effectiveSortConfig = { column: 'price', order: 'desc' };
        } else if (categorySlug === 'new-arrivals') {
          effectiveSortConfig = { column: 'id', order: 'desc' };
        } else if (categorySlug === 'on-sale') {
          effectiveSortConfig = { column: 'sale_price', order: 'asc' };
        }
      }

      const { data, error } = await query
        .order(effectiveSortConfig.column, { ascending: effectiveSortConfig.order === 'asc' })
        .limit(1000);
      if (error) throw error;
      products = (data || []).map((row: any) => Product.fromRow(row));
    } else if (currentCategory) {
      // Fetch product IDs linked to this category via join table
      const { data: linkData, error: linkErr } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', currentCategory.id);
      if (linkErr) throw linkErr;
      const productIds = (linkData || []).map((row: any) => row.product_id);
      if (productIds.length === 0) {
        products = [];
      } else {
        let query = supabase.from('products').select('*').in('id', productIds);
        filters.forEach((f: any) => {
          query = query.filter(f.column, f.operator, f.value);
        });
        const { data, error } = await query.order(sortConfig.column, { ascending: sortConfig.order === 'asc' }).limit(1000);
        if (error) throw error;
        products = (data || []).map((row: any) => Product.fromRow(row));
      }
    }
  } catch (error: any) {
    console.error('Error fetching catalog products:', error);
  }

  const categoryTitle = currentCategory
    ? currentCategory.name
    : isVirtualSlug
    ? VIRTUAL_SLUGS[categorySlug]
    : 'All Products';

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop/all">Shop</Link>
        {currentCategory && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text)' }}>{categoryTitle}</span>
          </>
        )}
      </div>

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          {/* Categories list */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>Categories</h3>
            <ul className="custom-scrollbar" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              <li style={{ fontWeight: categorySlug === 'all' ? 600 : 400 }}>
                <Link href="/shop/all" style={{ color: categorySlug === 'all' ? 'var(--primary)' : 'inherit' }}>All Products</Link>
              </li>
              {allCategories.map(cat => (
                <li key={cat.id} style={{ fontWeight: categorySlug === cat.slug ? 600 : 400 }}>
                  <Link href={`/shop/${cat.slug}`} style={{ color: categorySlug === cat.slug ? 'var(--primary)' : 'inherit' }}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter Form */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>Filter by Price</h3>
            <form method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {search && <input type="hidden" name="search" value={search} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  name="minPrice" 
                  placeholder="Min £" 
                  defaultValue={minPrice > 0 ? minPrice : ''} 
                  className="form-control" 
                  style={{ width: '50%', padding: '8px' }}
                />
                <input 
                  type="number" 
                  name="maxPrice" 
                  placeholder="Max £" 
                  defaultValue={maxPrice < 99999 ? maxPrice : ''} 
                  className="form-control" 
                  style={{ width: '50%', padding: '8px' }}
                />
              </div>
              <button type="submit" className="btn" style={{ padding: '8px', justifyContent: 'center' }}>Apply Price</button>
            </form>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div>
          {/* Header toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{categoryTitle}</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Showing {products.length} items</p>
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <SortSelect currentSort={sort} />
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No products match your search or price criteria.</p>
              <Link href={`/shop/${categorySlug}`} className="btn">Reset Filters</Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => {
                const isSale = p.salePrice && p.salePrice < p.price;
                const displayPrice = isSale ? p.salePrice! : p.price;

                return (
                  <div key={p.id} className="product-card">
                    <Link href={`/product/${p.slug}`} className="product-img-wrapper">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="product-img" />
                      ) : (
                        <div style={{ color: '#94a3b8' }}>No Image</div>
                      )}
                    </Link>
                    <div className="product-info">
                      <span className="product-category">{categoryTitle}</span>
                      <Link href={`/product/${p.slug}`}>
                        <h3 className="product-title">{p.title}</h3>
                      </Link>
                      <div className="product-price-row">
                        <div className="price">
                          {isSale && (
                            <span className="price-regular-strike">£{p.price.toFixed(2)}</span>
                          )}
                          <span className={isSale ? 'price-sale' : ''}>£{displayPrice.toFixed(2)}</span>
                        </div>
                        <AddToCartButton 
                          product={{
                            id: p.id,
                            title: p.title,
                            price: displayPrice,
                            image: p.image || ''
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
