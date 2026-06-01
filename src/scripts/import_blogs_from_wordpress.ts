// src/scripts/import_blogs_from_wordpress.ts
// Imports full blog post content from WordPress into the `blogs` table.
// Fetches: title, content, excerpt, featured image, categories, tags, publish date.

import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(process.cwd(), '.env'), override: false });

import { fetchAll, fetchWordPressJson } from '@/lib/wordpress';

const WP_BASE = 'https://baytonhorticulturecentre.co.uk';

interface WPTerm { id: number; name: string; taxonomy: string; }
interface WPMedia { source_url?: string; }
interface WPUser  { name?: string; }

interface WPPost {
  id: number;
  slug: string;
  link: string;
  date: string;           // ISO 8601 publish date
  status: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  author: number;
  _embedded?: {
    'wp:term'?: WPTerm[][];
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    author?: WPUser[];
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').trim();
}

function extractTerms(embedded: WPPost['_embedded'], taxonomy: string): string {
  const allTerms: WPTerm[] = (embedded?.['wp:term'] ?? []).flat();
  return allTerms.filter(t => t.taxonomy === taxonomy).map(t => stripHtml(t.name)).join(', ');
}

function extractFeaturedImage(embedded: WPPost['_embedded']): string {
  return embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '';
}

function extractAuthor(embedded: WPPost['_embedded']): string {
  return embedded?.author?.[0]?.name ?? '';
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set. Check your .env file.');
    process.exit(1);
  }
  console.log(`✅ Supabase URL: ${supabaseUrl}\n`);

  // Dynamic import so Supabase client initialises AFTER env vars are loaded
  const { Blog, Seo } = await import('@/lib/db/models');

  console.log('📥 Importing WordPress blog content...\n');

  const posts = await fetchAll<WPPost>(WP_BASE, '/wp-json/wp/v2/posts', {
    _embed: 'wp:term,wp:featuredmedia,author',
    status: 'publish',
  });

  console.log(`Found ${posts.length} published posts.\n`);

  let imported = 0;
  let failed = 0;

  for (const p of posts) {
    try {
      const categories    = extractTerms(p._embedded, 'category');
      const tags          = extractTerms(p._embedded, 'post_tag');
      const featuredImage = extractFeaturedImage(p._embedded);
      const author        = extractAuthor(p._embedded);
      const excerpt       = stripHtml(p.excerpt?.rendered ?? '').slice(0, 500);
      const title         = stripHtml(p.title?.rendered ?? '');

      // 1. Save full blog content to `blogs` table
      await Blog.upsert({
        wpId:         p.id,
        slug:         p.slug,
        title,
        content:      p.content?.rendered ?? '',
        excerpt,
        featuredImage,
        categories,
        tags,
        author,
        status:       p.status,
        publishedAt:  p.date,
        canonicalUrl: p.link,
      });

      // 2. Save SEO metadata to `seo` table
      await Seo.upsert({
        pageType:        'post',
        pageId:          String(p.id),
        slug:            p.slug,
        canonicalUrl:    p.link,
        metaTitle:       title,
        metaDescription: excerpt.slice(0, 320),
        keywords:        tags,           // post tags → keywords
        ogTitle:         title,
        ogDescription:   excerpt.slice(0, 200),
        ogImageUrl:      featuredImage,
      });

      console.log(`  ✓ [${p.id}] "${title.slice(0, 55)}"`);
      imported++;
    } catch (err: any) {
      console.error(`  ✗ [${p.id}] ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Import complete: ${imported} posts saved.`);
  console.log(`   → blogs table : ${imported} records`);
  console.log(`   → seo table   : ${imported} records (pageType = 'post')`);
  if (failed > 0) console.log(`   ✗ ${failed} failed — check errors above.`);
  console.log('\n   Check Supabase → blogs & seo tables to verify.');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
