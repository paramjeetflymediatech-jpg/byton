import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Blog } from '../../lib/db/models';
import { Calendar, Clock, BookOpen, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog - Bayton Horticulture Centre',
  description: 'Read the latest gardening advice, advanced grow room environment guides, and mycorrhizal nutrients information from Coventry\'s premier horticulture centre.',
};

interface BlogIndexPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams.page ?? 1));
  const limit = 12;
  const offset = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.findAll({ limit, offset }),
    Blog.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

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
          {blogs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'inline-block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>No Articles Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                We are currently importing and updating our blogs. Please check back shortly!
              </p>
            </div>
          ) : (
            blogs.map((post) => {
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
                <article 
                  key={post.slug || post.id}
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
                      src={imageUrl} 
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
                      {category}
                    </span>
                  </div>

                  {/* Text Info */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {formattedDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {readTime}
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
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '50px' 
            }}
          >
            {/* Previous Page Link */}
            {page > 1 ? (
              <Link
                href={`/blog?page=${page - 1}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  color: 'var(--dark)',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
                className="pagination-btn"
              >
                Prev
              </Link>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: '#f1f5f9',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'not-allowed',
                }}
              >
                Prev
              </span>
            )}

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              return (
                <Link
                  key={pageNum}
                  href={`/blog?page=${pageNum}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isActive ? 'var(--primary)' : 'white',
                    color: isActive ? 'white' : 'var(--dark)',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'var(--transition)',
                  }}
                  className={isActive ? '' : 'pagination-btn'}
                >
                  {pageNum}
                </Link>
              );
            })}

            {/* Next Page Link */}
            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  color: 'var(--dark)',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
                className="pagination-btn"
              >
                Next
              </Link>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: '#f1f5f9',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'not-allowed',
                }}
              >
                Next
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

