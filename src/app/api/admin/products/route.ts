import { NextResponse, NextRequest } from 'next/server';
import { Product } from '@/lib/db/models';
import { supabase } from '@/lib/supabase';
import { getCachedProducts, invalidateProductsCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const search = searchParams.get('search') || '';

    const allProducts = await getCachedProducts();

    let filtered = allProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = allProducts.filter((p: any) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedProducts = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      total,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      description,
      excerpt,
      price,
      regularPrice,
      salePrice,
      sku,
      stock,
      stockStatus,
      weight,
      image,
      categoryIds
    } = body;

    if (!title || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Title, Slug, and Price are required.' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price) || 0;
    const parsedRegularPrice = parseFloat(regularPrice) || parsedPrice;
    const parsedSalePrice = salePrice ? parseFloat(salePrice) : null;
    const parsedStock = parseInt(stock) || 0;
    const parsedWeight = parseFloat(weight) || 0.0;

    const payload = {
      title,
      slug,
      description: description || '',
      excerpt: excerpt || '',
      price: parsedPrice,
      regularPrice: parsedRegularPrice,
      salePrice: parsedSalePrice,
      sku: sku || '',
      stock: parsedStock,
      stockStatus: stockStatus || 'instock',
      weight: parsedWeight,
      image: image || ''
    };

    let savedProduct;
    if (id) {
      // Update
      savedProduct = await Product.update(Number(id), payload);
    } else {
      // Create
      savedProduct = await Product.create(payload);
    }

    // Update categories links in the product_categories join table
    if (categoryIds && Array.isArray(categoryIds)) {
      // Delete existing
      const { error: delErr } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', savedProduct.id);
      
      if (delErr) {
        console.error('Error deleting product categories:', delErr);
      }

      // Insert new
      if (categoryIds.length > 0) {
        const insertRows = categoryIds.map((catId: any) => ({
          product_id: savedProduct.id,
          category_id: Number(catId)
        }));
        const { error: insErr } = await supabase
          .from('product_categories')
          .insert(insertRows);
        
        if (insErr) {
          console.error('Error inserting product categories:', insErr);
        }
      }
    }

    // Invalidate products cache
    await invalidateProductsCache();

    return NextResponse.json({
      success: true,
      message: id ? 'Product updated successfully.' : 'Product created successfully.',
      product: savedProduct
    });
  } catch (error: any) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    await Product.delete(Number(id));

    // Invalidate products cache
    await invalidateProductsCache();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
