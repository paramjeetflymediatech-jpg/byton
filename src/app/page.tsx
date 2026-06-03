import { Product } from '../lib/db/models';
import { getCachedProducts, getCachedCategories } from '@/lib/redis';
import { Leaf, ArrowRight, Lightbulb, Package, Sprout, Wind, Hammer, Sofa, Sparkles, Smile, ShieldCheck } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import PromoCarousel from '@/components/PromoCarousel';
import BrandsCarousel from '@/components/BrandsCarousel';

// Force dynamic so that database reads are fresh on load
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  let products: Product[] = [];
  let furnitureProducts: Product[] = [];

  try {
    const allProducts = await getCachedProducts();
    // Slice top 8 products and map to Product instance
    products = allProducts.slice(0, 8).map((p: any) => Product.fromRow(p));

    const categories = await getCachedCategories();
    const furnitureCat = categories.find((c: any) => c.slug === 'garden-furniture');
    if (furnitureCat) {
      furnitureProducts = allProducts
        .filter((p: any) => p.categoryIds.includes(furnitureCat.id))
        .slice(0, 4)
        .map((p: any) => Product.fromRow(p));
    }
  } catch (error) {
    console.error('Failed to fetch cached products for homepage:', error);
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
      {/* Hero Section Carousel */}
      <HeroCarousel />

      {/* Intro Text Section with Background */}
      <section style={{ 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.95)), url(/bgimg.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        padding: '80px 0' 
      }}>
        <div className="container" style={{ textAlign: 'center',  margin: '0 auto' }}>
          <h3 style={{ color: '#5EB446', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
            Range of Products
          </h3>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#090a0c', marginBottom: '24px', lineHeight: 1.3 }}>
            Find Answers for All Your Needs with Us!
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#334155', lineHeight: 1.7, fontWeight: 500 }}>
            At Bayton Horticulture Centre, you do not have to worry about anything! From basic gardening tools to housing advanced products that only professionals need, Bayton’s diverse range of products is ideal for both hobbyists and professionals in an extensive manner. Find what you need under one roof with the help of Bayton today!
          </p>

          {/* Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginTop: '48px',
            textAlign: 'left'
          }}>
            {/* Card 1 */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'rgba(94, 180, 70, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sprout size={24} color="#5EB446" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#090a0c', marginBottom: '12px' }}>Fertilisers</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>Looking to enhance the way plants grow? Explore an expansive range of fertilisers that address all your needs.</p>
            </div>

            {/* Card 2 */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'rgba(94, 180, 70, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sofa size={24} color="#5EB446" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#090a0c', marginBottom: '12px' }}>Garden Furniture</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>Want to add a sitting area in your garden? Peruse our exclusive garden furniture range!</p>
            </div>

            {/* Card 3 */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'rgba(94, 180, 70, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Lightbulb size={24} color="#5EB446" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#090a0c', marginBottom: '12px' }}>Grow Lights</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>Have an indoor garden? Looking for grow lights to simulate the sun? Find them through our service!</p>
            </div>

            {/* Card 4 */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'rgba(94, 180, 70, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={24} color="#5EB446" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#090a0c', marginBottom: '12px' }}>Pest Control</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>Afraid of a pest attack? Find the right pesticides that resolve your specific concerns through our range!</p>
            </div>
          </div>
        </div>
      </section>

 
      {/* New Garden Furniture Intro Section */}
      <section className="container" style={{ textAlign: 'center', padding: '60px 20px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#090a0c', marginBottom: '20px', lineHeight: 1.3 }}>
            Checkout Our New Garden Furniture
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.7 }}>
            With Bayton Horticulture Centre, you can make certain that you are able to elevate your gardening game by investing in the right products!
          </p>
        </div>
        
        {furnitureProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No garden furniture products available at the moment.</p>
        ) : (
          <div className="products-grid" style={{ textAlign: 'left' }}>
            {furnitureProducts.map((p) => {
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
                    <span className="product-category">Garden Furniture</span>
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


      {/* Promotional Images Carousel */}
      <PromoCarousel />

      {/* Brands Marquee Section */}
      <BrandsCarousel />

     {/* Static Hero Image Banner */}
      <section style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000' }}>
        <img 
          src="/heroimage.png" 
          alt="Bayton Horticulture Promotional Banner" 
          style={{ width: '100%', height: 'auto', display: 'block' }}   
        />
      </section>

      {/* Departments Section */}
      <section className="container" style={{ paddingTop: '20px' }}>
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

      {/* Closing SEO Text Section */}
      <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', marginTop: '40px' }}>
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px',   margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#090a0c', marginBottom: '24px', lineHeight: 1.3 }}>
            Bayton Horticulture Centre – The Perfect Place for All Your Gardening Needs!
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.8, maxWidth: '900px', margin: '0 auto' }}>
            From soil to coco coir to hydroponics – no matter your system, you can find what you need through our services. We understand that buying products for hydroponics can be difficult. However, with the help of the leading hydroponics store in the UK, you do not have to worry about anything!
          </p>

          {/* SEO Cards Grid */}
          <style dangerouslySetInnerHTML={{__html: `
            .seo-card {
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.04);
              border: 1px solid #f1f5f9;
              display: flex;
              flex-direction: column;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              cursor: pointer;
            }
            .seo-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 15px 35px rgba(94, 180, 70, 0.15);
              border-color: #cbd5e1;
            }
            .seo-card .img-wrapper {
              width: 100%;
              height: 250px;
              padding: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              position: relative;
              overflow: hidden;
            }
            .seo-card img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              transition: transform 0.5s ease;
            }
            .seo-card:hover img {
              transform: scale(1.08);
            }
            .seo-card-content {
              padding: 30px 24px;
              background: #a8e1b9ff;
              flex-grow: 1;
              position: relative;
            }
            .seo-card h4 {
              font-size: 1.25rem;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 12px;
              transition: color 0.3s ease;
            }
            
            .seo-card p.desc { 
              font-size: 0.95rem;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .seo-card p.meta { 
              font-size: 1rem;
              background: transparent;
              padding: 0px;
              border-radius: 8px;
              display: inline-block;
              margin: 0;
            }
          `}} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginTop: '56px',
            textAlign: 'left'
          }}>
            {/* Card 1 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/chair.png" alt="Asteria Single Egg Chair" />
              </div>
              <div className="seo-card-content">
                <h4>Asteria Single Egg Chair</h4>
                <p className="desc">The Asteria Single Egg Chair is made of durable PE rattan and a sturdy steel frame. It features a comfortable cushioned seat for a cozy lounging experience.</p>
                <p className="meta">Egg chair with cushions for outdoor relaxation.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/sofa.png" alt="Verdora 4pc Outdoor Sofa Set" />
              </div>
              <div className="seo-card-content">
                <h4>Verdora 4pc Outdoor Sofa Set</h4>
                <p className="desc">Upgrade your outdoor living space with this elegant 4-piece rattan patio set, designed for both comfort and durability.</p>
                <p className="meta">Outdoor garden furniture set with wicker chairs and a glass-topped table.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/soil.png" alt="Effective Soil" />
              </div>
              <div className="seo-card-content">
                <h4>Effective Soil</h4>
                <p className="desc">Are you looking for the perfect soil for your garden? Try to purchase nutritious and supportive soil from Bayton Horticulture Centre!</p>
                <p className="meta">Coco Natural Plant Growing Medium Bag for Gardening.</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/seedling.png" alt="Seedling Propagator" />
              </div>
              <div className="seo-card-content">
                <h4>Seedling Propagator</h4>
                <p className="desc">Want something to promote the seed growth to that of saplings? Invest in our range of seedling propagators today!</p>
                <p className="meta">Plastic plant propagation seed tray with humidity cover.</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/bird.png" alt="Bird Feed" />
              </div>
              <div className="seo-card-content">
                <h4>Bird Feed</h4>
                <p className="desc">If you are trying to find a way to feed your birds, you can invest in our extensive range of bird feeds in a comprehensive manner. Start feeding today!</p>
                <p className="meta">Seed mix for wild birds, Robins, and Sparrows.</p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="seo-card">
              <div className="img-wrapper">
                <img src="/prod/nutrient.png" alt="Nutrient Supplements" />
              </div>
              <div className="seo-card-content">
                <h4>Nutrient Supplements</h4>
                <p className="desc">Want to enhance the growth of your plants? Want to make sure that your plants are receiving the right quality of nutrients? Explore our range today!</p>
                <p className="meta">Premium nutrient supplements for accelerated plant growth.</p>
              </div>
            </div>
          </div>
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
