// src/scripts/import_seo_from_wordpress.ts
//
// Keywords are extracted from WordPress post/page tags (wp:term).
// We use _embed=wp:term to get them in the same API response (no extra requests).

import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env'), override: false });

import { fetchAll, fetchWordPressJson } from '@/lib/wordpress';

const WP_BASE = 'https://baytonhorticulturecentre.co.uk';

interface WPTerm {
  id: number;
  name: string;
  taxonomy: string; // 'post_tag' or 'category'
}

interface WPMedia {
  source_url?: string;
}

interface WPPost {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:term'?: WPTerm[][];   // array of arrays: [categories[], tags[]]
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
  };
}

/** Strip all HTML tags and decode basic entities */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();
}

/** Extract tag names from _embedded['wp:term'] — tags have taxonomy = 'post_tag' */
function extractKeywords(embedded?: WPPost['_embedded']): string {
  if (!embedded?.['wp:term']) return '';
  const allTerms: WPTerm[] = embedded['wp:term'].flat();
  return allTerms
    .filter((t) => t.taxonomy === 'post_tag')
    .map((t) => stripHtml(t.name))
    .join(', ');
}

/** Get featured image URL from embedded media (no extra HTTP call needed) */
function extractFeaturedImage(embedded?: WPPost['_embedded']): string {
  const media = embedded?.['wp:featuredmedia'];
  if (!media || media.length === 0) return '';
  return media[0]?.source_url || '';
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set. Check your .env file.');
    process.exit(1);
  }
  console.log(`✅ Supabase URL: ${supabaseUrl}\n`);

  const { Seo } = await import('@/lib/db/models');

  console.log('📥 Starting WordPress SEO import...\n');

  const types: Array<{ endpoint: string; pageType: 'post' | 'page' }> = [
    { endpoint: '/wp-json/wp/v2/posts', pageType: 'post' },
    { endpoint: '/wp-json/wp/v2/pages', pageType: 'page' },
  ];

  let totalImported = 0;

  for (const { endpoint, pageType } of types) {
    console.log(`Fetching ${pageType}s...`);

    // _embed=wp:term,wp:featuredmedia — gets tags + featured image in same response
    const items = await fetchAll<WPPost>(WP_BASE, endpoint, {
      _embed: 'wp:term,wp:featuredmedia',
    });

    console.log(`  Found ${items.length} ${pageType}s.`);

    for (const p of items) {
      const metaTitle = stripHtml(p.title?.rendered || '');
      const metaDescription = stripHtml(p.excerpt?.rendered || '').slice(0, 320);
      const keywords = extractKeywords(p._embedded);
      const ogImageUrl = extractFeaturedImage(p._embedded);

      await Seo.upsert({
        pageType,
        pageId: String(p.id),
        slug: p.slug,
        canonicalUrl: p.link || `${WP_BASE}/${p.slug}`,
        metaTitle,
        metaDescription,
        keywords,
        ogTitle: metaTitle,
        ogDescription: metaDescription,
        ogImageUrl,
      });

      const kwPreview = keywords ? ` | tags: ${keywords.slice(0, 40)}` : '';
      console.log(`  ✓ ${pageType} ${p.id} | "${metaTitle.slice(0, 45)}"${kwPreview}`);
      totalImported++;
    }
    console.log('');
  }

  console.log(`✅ SEO import completed. Total: ${totalImported} records saved to the 'seo' table.`);
}

main().catch((err) => {
  console.error('\n❌ Error during SEO import:', err);
  process.exit(1);
});
