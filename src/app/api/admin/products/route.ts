import { NextResponse, NextRequest } from 'next/server';
import { Product } from '@/lib/db/models';

export async function GET() {
  try {
    const products = await Product.findAll();
    return NextResponse.json({ success: true, products });
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
      image
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

    if (id) {
      // Update
      const updatedProduct = await Product.update(Number(id), payload);
      return NextResponse.json({
        success: true,
        message: 'Product updated successfully.',
        product: updatedProduct
      });
    } else {
      // Create
      const newProduct = await Product.create(payload);
      return NextResponse.json({
        success: true,
        message: 'Product created successfully.',
        product: newProduct
      });
    }
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
