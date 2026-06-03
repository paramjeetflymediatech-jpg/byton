import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Product, Category } from '@/lib/db/models';
import ProductInteractivePanel from '@/components/ProductInteractivePanel';
import ProductViewTracker from '@/components/ProductViewTracker';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const product = await Product.findOne({ where: { slug } });
    if (product) {
      const rawDesc = product.excerpt || product.description || '';
      const cleanDesc = rawDesc
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

      return {
        title: `${product.title} - Bayton Horticulture Centre`,
        description: cleanDesc,
        openGraph: {
          title: product.title,
          description: cleanDesc,
          images: product.image ? [{ url: product.image }] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata for product page:', error);
  }

  return {
    title: 'Product Details - Bayton Horticulture Centre',
    description: 'View garden product specifications, stock levels, and place your order at Bayton Horticulture Centre Coventry.',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let product: Product | null = null;
  let productCategories: Category[] = [];

  try {
    // 1. Fetch product by slug
    product = await Product.findOne({
      where: { slug }
    });

    if (product) {
      // 2. Fetch associated categories
      productCategories = await (product as any).getCategories();
    }
  } catch (error) {
    console.error('Error fetching product detail page:', error);
  }

  if (!product) {
    notFound();
  }

  const isSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = isSale ? product.salePrice! : product.price;
  const primaryCategory = productCategories[0] || null;

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Product tracker mounts client-side to fire TikTok and Pinterest tag triggers */}
      <ProductViewTracker product={{ id: product.id, title: product.title, price: displayPrice }} />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px', flexWrap: 'wrap' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href="/shop/all">Shop</Link>
        {productCategories.map(cat => (
          <React.Fragment key={cat.id}>
            <ChevronRight size={14} />
            <Link href={`/shop/${cat.slug}`}>{cat.name}</Link>
          </React.Fragment>
        ))}
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
          {product.title}
        </span>
      </div>

      <Link href={primaryCategory ? `/shop/${primaryCategory.slug}` : '/shop/all'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--primary)', marginBottom: '24px', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to browsing
      </Link>

      <div className="product-detail-grid">
        {/* Gallery */}
        <div className="product-gallery">
          {product.image ? (
            <img src={product.image} alt={product.title} />
          ) : (
            <div style={{ color: '#94a3b8' }}>No image available</div>
          )}
        </div>

        {/* Product meta & actions */}
        <div className="product-meta-panel">
          <div>
            <span className={`stock-tag ${product.stockStatus === 'instock' ? 'in' : 'out'}`}>
              {product.stockStatus === 'instock' ? 'In Stock' : 'Out of Stock'}
            </span>
            <h1 className="detail-title" style={{ marginTop: '12px' }}>{product.title}</h1>
            {product.sku && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>SKU: {product.sku}</p>
            )}
          </div>

          <div className="detail-price">
            {isSale && (
              <span className="price-regular-strike" style={{ fontSize: '20px', marginRight: '10px' }}>
                £{product.price.toFixed(2)}
              </span>
            )}
            <span className={isSale ? 'price-sale' : ''}>£{displayPrice.toFixed(2)}</span>
          </div>

          <ProductInteractivePanel
            product={{
              id: product.id,
              title: product.title,
              price: displayPrice,
              image: product.image || '',
              stock: product.stock,
              stockStatus: product.stockStatus
            }}
          />

          {/* Core Specs */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            {product.weight > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Weight:</span>
                <span style={{ fontWeight: 600 }}>{product.weight.toFixed(2)} kg</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Courier Partner:</span>
              <span style={{ fontWeight: 600 }}>APC Overnight</span>
            </div>
          </div>

          {/* Categories Aside Section */}
          {productCategories.length > 0 && (
            <aside style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Related Categories
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {productCategories.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/shop/${cat.slug}`} 
                    style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      border: '1px solid rgba(94, 180, 70, 0.15)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Description tab */}
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginTop: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '10px' }}>
          Product Description
        </h2>
        {/* Render description as HTML to support formatted lists/elements from the WordPress source */}
        <div 
          className="detail-desc"
          style={{ border: 'none', paddingTop: 0 }}
          dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} 
        />
      </div>
    </div>
  );
}
