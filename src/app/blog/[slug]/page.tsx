import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Blog, Seo } from '../../../lib/db/models';
import { Calendar, Clock, ArrowLeft, Leaf, MessageSquare } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await Blog.findBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found - Bayton Horticulture Centre',
    };
  }

  // Fetch SEO configuration from the database
  const seo = await Seo.findBySlug(slug, 'post');

  const title = seo?.metaTitle || `${post.title} - Bayton Horticulture Centre`;
  const description = seo?.metaDescription || post.excerpt;
  const keywords = seo?.keywords || post.tags;
  const canonicalUrl = seo?.canonicalUrl || post.canonicalUrl || `https://baytonhorticulturecentre.co.uk/blog/${post.slug}`;
  const ogTitle = seo?.ogTitle || post.title;
  const ogDescription = seo?.ogDescription || post.excerpt;
  const ogImageUrl = seo?.ogImageUrl || post.featuredImage || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImageUrl }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await Blog.findBySlug(slug);

  if (!post) {
    notFound();
  }

  // Suggest other recent articles
  const allBlogs = await Blog.findAll({ limit: 4 });
  const otherPosts = allBlogs.filter((p) => p.slug !== slug).slice(0, 3);

  const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';
  const imageUrl = post.featuredImage || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop';
  const category = post.categories ? post.categories.split(',')[0].trim() : 'Gardening';

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Back Button */}
        <Link 
          href="/blog" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px', 
            fontWeight: 600, 
            color: 'var(--text-muted)', 
            marginBottom: '30px',
            transition: 'var(--transition)'
          }}
          className="back-btn"
        >
          <ArrowLeft size={16} /> Back to Blogs
        </Link>

        {/* Responsive grid styles to keep left side wider and right side narrower on desktop */}
        <style dangerouslySetInnerHTML={{ __html: `
          .blog-layout-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            align-items: flex-start;
          }
          @media (min-width: 992px) {
            .blog-layout-grid {
              grid-template-columns: 2.7fr 1fr;
            }
          }
        `}} />

        <div className="blog-layout-grid">
          
          {/* Main Article Content */}
          <article 
            style={{ 
              backgroundColor: 'white', 
              padding: '40px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)',
              flex: '1 1 700px'
            }}
          >
            {/* Banner Image */}
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '350px', marginBottom: '30px', backgroundColor: '#f1f5f9' }}>
              <img src={imageUrl} alt={post.title} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
            </div>

            <span 
              style={{ 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '16px',
                display: 'inline-block'
              }}
            >
              {category}
            </span>

            <h1 
              style={{ 
                fontSize: 'clamp(24px, 4vw, 36px)', 
                fontWeight: 700, 
                lineHeight: 1.3, 
                color: 'var(--dark)', 
                marginBottom: '16px',
                fontFamily: "'Outfit', sans-serif" 
              }}
            >
              {post.title}
            </h1>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '30px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} /> {formattedDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> {readTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Leaf size={15} style={{ color: 'var(--primary)' }} /> Verified Expert
              </span>
            </div>

            {/* HTML Render */}
            <div 
              style={{ 
                lineHeight: 1.8, 
                fontSize: '15px', 
                color: 'var(--text)'
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author box */}
            <div style={{ marginTop: '50px', borderTop: '1px solid var(--border)', paddingTop: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', height: '54px', width: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Leaf size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>{post.author || 'Bayton Editorial Team'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Professional agronomists and urban farming advisors sharing verified scientific guides for home and commercial setups.
                </p>
              </div>
            </div>

          </article>

          {/* Sidebar */}
          <aside 
            style={{ 
              flex: '1 1 300px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '30px',
              position: 'sticky',
              top: '140px',
              alignSelf: 'flex-start'
            }}
          >
            
            {/* Recent Posts Widget */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>
                Recent Articles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {otherPosts.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No other articles found.</p>
                ) : (
                  otherPosts.map((op) => {
                    const opDate = op.publishedAt
                      ? new Date(op.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Draft';
                    const opImage = op.featuredImage || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop';
                    return (
                      <div key={op.slug || op.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                          <img src={opImage} alt={op.title} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 4px 0', lineHeight: 1.4, height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            <Link href={`/blog/${op.slug}`} style={{ color: 'inherit' }}>{op.title}</Link>
                          </h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opDate}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Newsletter widget */}
            <div style={{ background: 'linear-gradient(135deg, #1b3a1a 0%, #0c1b0a 100%)', padding: '30px', borderRadius: 'var(--radius-lg)', color: 'white', textAlign: 'center' }}>
              <MessageSquare size={30} style={{ color: 'var(--primary)', marginBottom: '14px', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Growers Newsletter</h3>
              <p style={{ fontSize: '13px', color: '#c5d9c2', lineHeight: 1.5, marginBottom: '20px' }}>
                Subscribe to receive special discount codes, lighting blueprints, and crop recipes directly in your inbox.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="email" placeholder="Your Email Address" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#090a0c', color: 'white', fontSize: '13px' }} required />
                <button type="button" className="btn" style={{ padding: '10px', fontSize: '13px', fontWeight: 600, justifyContent: 'center' }}>Subscribe</button>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

