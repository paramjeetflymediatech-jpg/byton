import { supabase } from '@/lib/supabase';
import { Product } from '../lib/db/models';
import { Leaf, ArrowRight, Lightbulb, Package, Sprout, Wind, Hammer, Sofa, Sparkles, Smile } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
// Force dynamic so that database reads are fresh on load
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  let products: Product[] = [];
  
  try {
    // Fetch top 8 products from Supabase
    // Ensure a 'products' table exists in Supabase with columns matching the Product interface (id, title, slug, description, excerpt, price, regularPrice, salePrice, sku, stock, stockStatus, weight, image)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })
      .limit(8);
    if (error) {
      console.error('Failed to query products:', error);
    } else {
      // @ts-ignore - supabase returns any[]; we trust shape matches Product interface
      products = data as Product[];
    }
  } catch (error) {
    console.error('Failed to query products for home page:', error);
  }

  // Pre-defined categories for the visual department grid
  const departments = [
    { name: 'LED Grow Lights', slug: 'led-lighting', icon: <Lightbulb size={24} /> },
    { name: 'HPS Grow Lights', slug: 'hps-lighting', icon: <Sparkles size={24} /> },
    { name: 'Grow Systems & Pots', slug: 'grow-systems-pots', icon: <Package size={24} /> },
    { name: 'Propagation', slug: 'propagation', icon: <Sprout size={24} /> },
    { name: 'Grow Tents & Ventilation', slug: 'grow-environment-ventilation', icon: <Wind size={24} /> },
    { name: 'Garden Furniture', slug: 'garden-furniture', icon: <Sofa size={24} /> },
    { name: 'Egg Chairs', slug: 'egg-chairs', icon: <Smile size={24} /> },
    { name: 'Garden Power Tools', slug: 'garden-power-tools', icon: <Hammer size={24} /> },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Cultivating the <span>Future of Growing</span>
            </h1>
            <p className="hero-desc">
              Explore Coventry's premier superstore for high-performance garden furniture, LED grow lights, complete tents, nutrients, and hydroponics setups.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/shop/all" className="btn">
                Shop Product Catalog <ArrowRight size={18} />
              </Link>
              <Link href="/shop/garden-furniture" className="btn btn-secondary">
                View Garden Furniture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ backgroundColor: 'var(--card-bg)', padding: '30px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', gap: '30px', flexWrap: 'wrap', textAlign: 'center' }}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--dark)' }}>🚀 Fast UK Delivery</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Overnight parcel delivery with APC Courier</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--dark)' }}>🏪 Huge Coventry Superstore</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Come visit us in-store to inspect our stock</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--dark)' }}>💡 Hydroponic Specialists</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Free expert advice from seasoned growers</p>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="container">
        <h2 className="section-title">Shop by Department</h2>
        <div className="categories-grid">
          {departments.map((dept) => (
            <Link key={dept.slug} href={`/shop/${dept.slug}`}>
              <span className="category-card">
                <div className="category-icon">{dept.icon}</div>
                <span className="category-name">{dept.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic Products Grid */}
      <section className="container">
        <h2 className="section-title">Featured Products</h2>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0' }}>No products found in the database. Run the seeding script to populate.</p>
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
                      <div style={{ color: '#94a3b8' }}>No Image available</div>
                    )}
                  </Link>
                  <div className="product-info">
                    <span className="product-category">Hydroponics & Garden</span>
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
      </section>
    </div>
  );
}
