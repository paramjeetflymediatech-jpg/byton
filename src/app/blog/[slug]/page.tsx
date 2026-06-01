import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '../../../lib/blog-data';
import { Calendar, Clock, ArrowLeft, Leaf, MessageSquare } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Article Not Found - Bayton Horticulture Centre',
    };
  }

  return {
    title: `${post.title} - Bayton Horticulture Centre`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Suggest other recent articles
  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
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
          <ArrowLeft size={16} /> Back to Hub
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'flex-start' }}>
          
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
              <img src={post.image} alt={post.title} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
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
              {post.category}
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
                <Calendar size={15} /> {post.date}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> {post.readTime}
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
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>Bayton Editorial Team</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Professional agronomists and urban farming advisors sharing verified scientific guides for home and commercial setups.
                </p>
              </div>
            </div>

          </article>

          {/* Sidebar */}
          <aside style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Recent Posts Widget */}
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', display: 'inline-block' }}>
                Recent Articles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {otherPosts.map((op) => (
                  <div key={op.slug} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                      <img src={op.image} alt={op.title} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', margin: '0 0 4px 0', lineHeight: 1.4, height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        <Link href={`/blog/${op.slug}`} style={{ color: 'inherit' }}>{op.title}</Link>
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{op.date}</span>
                    </div>
                  </div>
                ))}
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
export const dynamic = 'force-static';
