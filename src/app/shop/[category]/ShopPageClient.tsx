'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Product, Category } from '../../../lib/db/models';
import { supabase } from '../../../lib/supabase';
import AddToCartButton from '../../../components/AddToCartButton';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import SortSelect from '../../../components/SortSelect';

const sortMap: Record<string, { column: string; order: 'asc' | 'desc' }> = {
  latest: { column: 'id', order: 'desc' },
  'price-asc': { column: 'price', order: 'asc' },
  'price-desc': { column: 'price', order: 'desc' },
  'title-asc': { column: 'title', order: 'asc' },
};

const VIRTUAL_SLUGS: Record<string, string> = {
  'best-selling': 'Best Selling',
  'new-arrivals': 'New Arrivals',
  'on-sale': 'On Sale',
  'featured': 'Featured Products',
};

interface ShopPageClientProps {
  initialProducts: any[];
  allCategories: any[];
  categorySlug: string;
  initialSort: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  initialSearch: string;
  initialPage: number;
  initialTotalCount: number;
}

export default function ShopPageClient({
  initialProducts,
  allCategories,
  categorySlug: initialCategorySlug,
  initialSort,
  initialMinPrice,
  initialMaxPrice,
  initialSearch,
  initialPage,
  initialTotalCount
}: ShopPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Pure client-side filter and navigation states
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  const [products, setProducts] = useState<Product[]>(initialProducts.map(p => Product.fromRow(p)));
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [relatedCategoryIds, setRelatedCategoryIds] = useState<number[] | null>(null);

  // Sync states if initial props change (e.g. when user navigates using Header Links or redirects)
  useEffect(() => {
    setCategorySlug(initialCategorySlug);
    setSearch(initialSearch);
    setSort(initialSort);
    setMinPrice(initialMinPrice);
    setMaxPrice(initialMaxPrice);
    setCurrentPage(initialPage);
    setTotalCount(initialTotalCount);
  }, [initialCategorySlug, initialSearch, initialSort, initialMinPrice, initialMaxPrice, initialPage, initialTotalCount]);

  // Sync state on URL back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/');
      const slug = pathParts[pathParts.length - 1] || 'all';

      const params = new URLSearchParams(window.location.search);
      const s = params.get('search') || '';
      const st = params.get('sort') || 'latest';
      const min = params.get('minPrice') || '';
      const max = params.get('maxPrice') || '';
      const p = parseInt(params.get('page') || '1', 10) || 1;

      setCategorySlug(slug);
      setSearch(s);
      setSort(st);
      setMinPrice(min);
      setMaxPrice(max);
      setCurrentPage(p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update browser URL query strings without refreshing Server Component tree
  const updateUrl = (
    newSlug: string,
    newSearch: string,
    newSort: string,
    newMin: string,
    newMax: string,
    newPage: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newSort && newSort !== 'latest') params.set('sort', newSort);
    if (newMin) params.set('minPrice', newMin);
    if (newMax) params.set('maxPrice', newMax);
    if (newPage > 1) params.set('page', String(newPage));

    const queryStr = params.toString();
    const newPath = `/shop/${newSlug}${queryStr ? '?' + queryStr : ''}`;
    window.history.pushState(null, '', newPath);
  };

  // Fetch products and related categories whenever filters, sort, search or page changes
  useEffect(() => {
    let isMounted = true;

    const fetchProductsAndCategories = async () => {
      setLoadingProducts(true);
      try {
        // --- 1. Fetch related categories if search is active ---
        if (search.trim()) {
          // Fetch products matching the search query
          const { data: matchedProdData } = await supabase
            .from('products')
            .select('id')
            .ilike('title', `%${search}%`);

          const matchedProdIds = (matchedProdData || []).map(p => p.id);

          // Get categories directly containing these products
          let linkedCatIds: number[] = [];
          if (matchedProdIds.length > 0) {
            const { data: linkData } = await supabase
              .from('product_categories')
              .select('category_id')
              .in('product_id', matchedProdIds);
            linkedCatIds = (linkData || []).map(l => l.category_id);
          }

          // Get categories whose name matches the search query
          const { data: matchedCatData } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', `%${search}%`);
          const directCatIds = (matchedCatData || []).map(c => c.id);

          // Combine and filter unique IDs
          const uniqueRelatedIds = Array.from(new Set([...linkedCatIds, ...directCatIds]));
          if (isMounted) {
            setRelatedCategoryIds(uniqueRelatedIds);
          }
        } else {
          if (isMounted) {
            setRelatedCategoryIds(null);
          }
        }

        // --- 2. Fetch products for current page and filters ---
        let query = supabase.from('products').select('*', { count: 'exact' });

        const isVirtualSlug = categorySlug in VIRTUAL_SLUGS;

        // Apply category filter
        if (categorySlug !== 'all' && !isVirtualSlug) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

          if (catData) {
            const { data: linkData } = await supabase
              .from('product_categories')
              .select('product_id')
              .eq('category_id', catData.id);

            const ids = (linkData || []).map((r: any) => r.product_id);
            if (ids.length === 0) {
              if (isMounted) {
                setProducts([]);
                setTotalCount(0);
              }
              setLoadingProducts(false);
              return;
            }
            query = query.in('id', ids);
          }
        } else if (categorySlug === 'on-sale') {
          query = query.not('sale_price', 'is', null);
        }

        // Apply price filters
        if (minPrice) {
          query = query.gte('price', parseFloat(minPrice) || 0);
        }
        if (maxPrice) {
          query = query.lte('price', parseFloat(maxPrice) || 99999);
        }

        // Apply search query
        if (search) {
          query = query.ilike('title', `%${search}%`);
        }

        // Apply sorting
        let effectiveSortConfig = sortMap[sort] || sortMap['latest'];
        if (sort === 'latest') {
          if (categorySlug === 'best-selling') {
            effectiveSortConfig = { column: 'price', order: 'desc' };
          } else if (categorySlug === 'new-arrivals') {
            effectiveSortConfig = { column: 'id', order: 'desc' };
          } else if (categorySlug === 'on-sale') {
            effectiveSortConfig = { column: 'sale_price', order: 'asc' };
          }
        }

        // Pagination math
        const limit = 12;
        const from = (currentPage - 1) * limit;
        const to = currentPage * limit - 1;

        const { data, error, count } = await query
          .order(effectiveSortConfig.column, {
            ascending: effectiveSortConfig.order === 'asc'
          })
          .range(from, to);

        if (error) throw error;

        if (isMounted) {
          setProducts((data || []).map(row => Product.fromRow(row)));
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchProductsAndCategories();

    return () => {
      isMounted = false;
    };
  }, [categorySlug, sort, minPrice, maxPrice, search, currentPage]);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    if (slug === 'all') {
      setSearch(''); // Clear search query when explicitly resetting to All Products
      setCurrentPage(1);
      updateUrl('all', '', sort, minPrice, maxPrice, 1);
    } else {
      setCurrentPage(1);
      updateUrl(slug, search, sort, minPrice, maxPrice, 1);
    }
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1);
    updateUrl(categorySlug, search, newSort, minPrice, maxPrice, 1);
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get('minPrice') as string;
    const max = formData.get('maxPrice') as string;

    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
    updateUrl(categorySlug, search, sort, min, max, 1);
  };

  const handleResetFilters = () => {
    setCategorySlug('all');
    setSearch('');
    setSort('latest');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
    updateUrl('all', '', 'latest', '', '', 1);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    updateUrl(categorySlug, search, sort, minPrice, maxPrice, pageNum);
    // Scroll smoothly to top of products catalog
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCategory = allCategories.find(c => c.slug === categorySlug) || null;
  const isVirtualSlug = categorySlug in VIRTUAL_SLUGS;
  const categoryTitle = isVirtualSlug
    ? VIRTUAL_SLUGS[categorySlug]
    : categorySlug === 'all'
    ? 'All Products'
    : currentCategory
    ? currentCategory.name
    : 'Shop';

  // Helper to format showing results description
  const getShowingText = () => {
    if (loadingProducts) return 'Loading products...';
    if (totalCount === 0) return 'Showing 0 items';
    const start = (currentPage - 1) * 12 + 1;
    const end = Math.min(currentPage * 12, totalCount);
    return `Showing ${start}-${end} of ${totalCount} items`;
  };

  const totalPages = Math.ceil(totalCount / 12);

  // Helper to get paginated number array (max 5 visible centered around current)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  // Filter categories displayed in the sidebar if search is active
  const displayedCategories = relatedCategoryIds
    ? allCategories.filter(cat => relatedCategoryIds.includes(cat.id))
    : allCategories;

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px', flexWrap: 'wrap' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <span onClick={() => handleCategoryChange('all')} style={{ cursor: 'pointer' }}>Shop</span>
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
          <input type="checkbox" id="filter-toggle-cb" className="filter-toggle-checkbox" style={{ display: 'none' }} />
          <label htmlFor="filter-toggle-cb" className="filter-toggle-label">
            <SlidersHorizontal size={16} />
            <span>Filters & Categories</span>
          </label>
          <div className="filter-content">
            {/* Categories list */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>Categories</h3>
              <ul className="custom-scrollbar" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                <li style={{ fontWeight: categorySlug === 'all' ? 600 : 400 }}>
                  <button 
                    onClick={() => handleCategoryChange('all')}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left', color: categorySlug === 'all' ? 'var(--primary)' : 'inherit', fontWeight: categorySlug === 'all' ? 700 : 400 }}
                  >
                    All Products
                  </button>
                </li>
                {displayedCategories.map(cat => (
                  <li key={cat.id} style={{ fontWeight: categorySlug === cat.slug ? 600 : 400 }}>
                    <button 
                      onClick={() => handleCategoryChange(cat.slug)}
                      style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left', color: categorySlug === cat.slug ? 'var(--primary)' : 'inherit', fontWeight: categorySlug === cat.slug ? 700 : 400 }}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
                {displayedCategories.length === 0 && (
                  <li style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', paddingLeft: '4px' }}>
                    No related categories
                  </li>
                )}
              </ul>
            </div>

            {/* Price Range Filter Form */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>Filter by Price</h3>
              <form onSubmit={handlePriceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number" 
                    name="minPrice" 
                    placeholder="Min £" 
                    defaultValue={minPrice} 
                    className="form-control" 
                    style={{ width: '50%', padding: '8px' }}
                  />
                  <input 
                    type="number" 
                    name="maxPrice" 
                    placeholder="Max £" 
                    defaultValue={maxPrice} 
                    className="form-control" 
                    style={{ width: '50%', padding: '8px' }}
                  />
                </div>
                <button type="submit" className="btn" style={{ padding: '8px', justifyContent: 'center' }}>Apply Price</button>
              </form>
            </div>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <div>
          {/* Header toolbar */}
          <div className="shop-toolbar">
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>{categoryTitle}</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{getShowingText()}</span>
                {search && (
                  <span style={{ fontSize: '12px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    Search: "{search}"
                    <button 
                      onClick={() => {
                        setSearch('');
                        setCurrentPage(1);
                        updateUrl(categorySlug, '', sort, minPrice, maxPrice, 1);
                      }}
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: '14px', lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}
                      title="Clear Search"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <SortSelect currentSort={sort} onChange={handleSortChange} />
            </div>
          </div>

          {/* Product grid */}
          {loadingProducts ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No products match your search or price criteria.</p>
              <button onClick={handleResetFilters} className="btn">Reset Filters</button>
            </div>
          ) : (
            <>
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

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="pagination-btn pagination-arrow"
                  >
                    &larr; Prev
                  </button>

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="pagination-btn pagination-arrow"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
