import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '../../lib/blog-data';
import { Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Bayton Horticulture Centre',
  description: 'Read the latest gardening advice, advanced grow room environment guides, and mycorrhizal nutrients information from Coventry\'s premier horticulture centre.',
};

export default function BlogIndexPage() {
  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', padding: '60px 0' }}>
      {/* Blog Hero/Header */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span 
          style={{ 
            backgroundColor: 'var(--primary-glow)', 
            color: 'var(--primary)', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '1px solid var(--primary)',
            display: 'inline-block',
            marginBottom: '16px'
          }}
        >
          Knowledge Hub
        </span>
        <h1 
          className="section-title" 
          style={{ 
            marginTop: 0, 
            fontSize: 'clamp(32px, 5vw, 42px)', 
            fontWeight: 700, 
            fontFamily: "'Outfit', sans-serif" 
          }}
        >
          Grower Tips &amp; Insights
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', margin: '10px auto 0', lineHeight: 1.6 }}>
          Explore professional advice, advanced guides, and horticultural insights to maximize your harvest and cultivate thriving gardens.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '30px' 
          }}
        >
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.slug}
              className="product-card"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition)'
              }}
            >
              {/* Image Banner */}
              <div 
                style={{ 
                  height: '200px', 
                  width: '100%', 
                  overflow: 'hidden', 
                  position: 'relative',
                  backgroundColor: '#f1f5f9'
                }}
              >
                <img 
                  src={post.image} 
                  alt={post.title}
                  style={{ 
                    height: '100%', 
                    width: '100%', 
                    objectFit: 'contain',
                    transition: 'var(--transition)'
                  }}
                  className="product-img"
                />
                <span 
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    left: '12px', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}
                >
                  {post.category}
                </span>
              </div>

              {/* Text Info */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {post.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {post.readTime}
                  </span>
                </div>

                <h3 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: 'var(--dark)', 
                    lineHeight: 1.4, 
                    marginBottom: '10px',
                    height: '50px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  {post.title}
                </h3>

                <p 
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.6, 
                    marginBottom: '20px',
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {post.excerpt}
                </p>

                <Link 
                  href={`/blog/${post.slug}`}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'var(--primary)',
                    marginTop: 'auto',
                    transition: 'var(--transition)'
                  }}
                  className="read-more-link"
                >
                  Read Full Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
