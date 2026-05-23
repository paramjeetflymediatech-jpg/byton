import React from 'react';
import Link from 'next/link';
import { Product, Category } from '../../../lib/db/models';
import { Op } from 'sequelize';
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
    const category = await Category.findOne({ where: { slug: categorySlug } });
    if (category) {
      const description = `Shop quality ${category.name} supplies at Bayton Horticulture Centre Coventry. Browse our select range of garden products, grow supplies, and horticulture essentials.`;
      return {
        title: `${category.name} - Bayton Horticulture Centre`,
        description: description,
        openGraph: {
          title: `${category.name} | Gardening & Hydroponics Store`,
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
  let allCategories: Category[] = [];
  try {
    allCategories = await Category.findAll({ order: [['name', 'ASC']] });
  } catch (e) {
    console.error(e);
  }

  // 2. Fetch current category details
  let currentCategory: Category | null = null;
  if (categorySlug !== 'all') {
    try {
      currentCategory = await Category.findOne({ where: { slug: categorySlug } });
    } catch (e) {
      console.error(e);
    }
  }

  // 3. Build product where clause
  const whereClause: any = {};
  
  if (search) {
    whereClause.title = { [Op.like]: `%${search}%` };
  }

  whereClause.price = {
    [Op.between]: [minPrice, maxPrice]
  };

  // 4. Build sorting order
  let orderClause: any = [['id', 'DESC']];
  if (sort === 'price-asc') {
    orderClause = [['price', 'ASC']];
  } else if (sort === 'price-desc') {
    orderClause = [['price', 'DESC']];
  } else if (sort === 'title-asc') {
    orderClause = [['title', 'ASC']];
  }

  // 5. Fetch products
  let products: Product[] = [];
  try {
    if (categorySlug === 'all') {
      products = await Product.findAll({
        where: whereClause,
        order: orderClause
      });
    } else if (currentCategory) {
      products = await Product.findAll({
        include: [{
          model: Category,
          as: 'categories',
          where: { id: currentCategory.id },
          attributes: [] // exclude category columns from result
        }],
        where: whereClause,
        order: orderClause
      });
    }
  } catch (error) {
    console.error('Error fetching catalog products:', error);
  }

  const categoryTitle = currentCategory ? currentCategory.name : 'All Products';

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

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
        {/* Sidebar Filters */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Categories list */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>Categories</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
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
