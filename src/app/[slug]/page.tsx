import React from 'react';
import { notFound } from 'next/navigation';
import { Setting } from '../../lib/db/models';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface DynamicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const pageSetting = await Setting.findByPk(`page_content_${slug}`);
    if (pageSetting) {
      const pageData = JSON.parse(pageSetting.value);
      const rawContent = pageData.content || '';
      const cleanDesc = rawContent
        .replace(/\[\/?vc_[^\]]*\]/g, '')
        .replace(/\[\/?elementor[^\]]*\]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

      return {
        title: `${pageData.title} - Bayton Horticulture Centre`,
        description: cleanDesc || `Information page about ${pageData.title} at Bayton Horticulture Centre.`,
        openGraph: {
          title: pageData.title,
          description: cleanDesc,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata for dynamic page:', error);
  }

  return {
    title: 'Bayton Horticulture Centre',
    description: 'Coventry superstore for garden products, urban farming, CEA, grow lights, tents, and hydroponics gear.',
  };
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let pageData: { title: string; content: string } | null = null;

  try {
    // Query page content from database settings
    const pageSetting = await Setting.findByPk(`page_content_${slug}`);
    
    if (pageSetting) {
      pageData = JSON.parse(pageSetting.value);
    }
  } catch (error) {
    console.error(`Error loading page content for slug: ${slug}`, error);
  }

  // Fallback to 404 if page content doesn't exist in the database
  if (!pageData) {
    notFound();
  }

  // Clean HTML from wordpress shortcodes if any
  const cleanContent = pageData.content
    .replace(/\[\/?vc_[^\]]*\]/g, '') // remove visual composer tags
    .replace(/\[\/?elementor[^\]]*\]/g, ''); // remove elementor tags

  return (
    <div className="container" style={{ paddingTop: '50px', maxWidth: '800px' }}>
      <article style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 
          className="section-title" 
          style={{ marginTop: 0, textAlign: 'left', fontSize: '32px' }}
        >
          {pageData.title}
        </h1>
        
        {/* Render HTML content directly */}
        <div 
          className="detail-desc"
          style={{ border: 'none', paddingTop: '20px', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      </article>
    </div>
  );
}
