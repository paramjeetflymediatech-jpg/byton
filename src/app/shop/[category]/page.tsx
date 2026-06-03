import React from 'react';
import { Product, Category } from '../../../lib/db/models';
import { supabase } from '../../../lib/supabase';
import ShopPageClient from './ShopPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;

  if (categorySlug === 'all') {
    return {
      title: 'Shop All Gardening & Hydroponics Products - Bayton Horticulture Centre',
      description: 'Explore the full catalog of professional grow equipment, LED & HPS lights, tents, nutrients, lawn care, and garden furniture at Bayton Horticulture Coventry.',
    };
  }

  try {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id,name,slug')
      .eq('slug', categorySlug)
      .single();
    if (categoryData) {
      const description = `Shop quality ${categoryData.name} supplies at Bayton Horticulture Centre Coventry. Browse our select range of garden products, grow supplies, and horticulture essentials.`;
      return {
        title: `${categoryData.name} - Bayton Horticulture Centre`,
        description: description,
        openGraph: {
          title: `${categoryData.name} | Gardening & Hydroponics Store`,
          description: description,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata for shop category page:', error);
  }

  return {
    title: 'Browse Shop - Bayton Horticulture Centre',
    description: 'Browse professional gardening, urban farming, and hydroponic supplies at Bayton Horticulture Centre Coventry.',
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
  const search = resolvedSearchParams.search || '';
  const sort = resolvedSearchParams.sort || 'latest';
  const minPrice = parseFloat(resolvedSearchParams.minPrice || '') || 0;
  const maxPrice = parseFloat(resolvedSearchParams.maxPrice || '') || 99999;
  const page = parseInt(resolvedSearchParams.page || '1', 10) || 1;

  // 1. Fetch categories
  let allCategories: Category[] = [];
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
    allCategories = (catData as any[]).map((row) => new Category(row));

  // 2. Fetch initial products for SSR/SEO
  let initialProducts: Product[] = [];
  let initialTotalCount = 0;
  const VIRTUAL_SLUGS: Record<string, string> = {
    'best-selling': 'Best Selling',
    'new-arrivals': 'New Arrivals',
    'on-sale': 'On Sale',
    'featured': 'Featured Products',
  };
  const isVirtualSlug = categorySlug in VIRTUAL_SLUGS;

  try {
    let query = supabase.from('products').select('*', { count: 'exact' });
    if (categorySlug !== 'all' && !isVirtualSlug) {
      const { data: curCat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (curCat) {
        const { data: linkData } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', curCat.id);
        const productIds = (linkData || []).map((row: any) => row.product_id);
        if (productIds.length > 0) {
          query = query.in('id', productIds);
        } else {
          query = query.in('id', [-1]); // Empty filter helper
        }
      }
    } else if (categorySlug === 'on-sale') {
      query = query.not('sale_price', 'is', null);
    }

    if (search) query = query.ilike('title', `%${search}%`);
    query = query.gte('price', minPrice).lte('price', maxPrice);

    // Apply sorting
    const sortMap: Record<string, { column: string; order: 'asc' | 'desc' }> = {
      latest: { column: 'id', order: 'desc' },
      'price-asc': { column: 'price', order: 'asc' },
      'price-desc': { column: 'price', order: 'desc' },
      'title-asc': { column: 'title', order: 'asc' },
    };
    const sortConfig = sortMap[sort] || sortMap['latest'];

    // Pagination math
    const limit = 12;
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, count } = await query
      .order(sortConfig.column, { ascending: sortConfig.order === 'asc' })
      .range(from, to);

    if (data) {
      initialProducts = (data || []).map((row: any) => Product.fromRow(row));
    }
    if (count !== null && count !== undefined) {
      initialTotalCount = count;
    }
  } catch (error) {
    console.error('Error fetching initial products:', error);
  }

  // Serialize models as plain JS objects for client-safe serialization
  const serializedCategories = allCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image: cat.image || ''
  }));

  const serializedProducts = initialProducts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    excerpt: p.excerpt || '',
    price: p.price,
    regularPrice: p.regularPrice,
    salePrice: p.salePrice || null,
    sku: p.sku || '',
    stock: p.stock,
    stockStatus: p.stockStatus,
    weight: p.weight,
    image: p.image || ''
  }));

  return (
    <ShopPageClient
      initialProducts={serializedProducts}
      allCategories={serializedCategories}
      categorySlug={categorySlug}
      initialSort={sort}
      initialMinPrice={resolvedSearchParams.minPrice || ''}
      initialMaxPrice={resolvedSearchParams.maxPrice || ''}
      initialSearch={search}
      initialPage={page}
      initialTotalCount={initialTotalCount}
    />
  );
}
