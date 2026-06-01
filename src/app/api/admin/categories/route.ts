import { NextResponse, NextRequest } from 'next/server';
import { Category } from '@/lib/db/models';

export async function GET() {
  try {
    const categories = await Category.findAll();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve categories.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, slug, description, image } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and Slug are required.' },
        { status: 400 }
      );
    }

    const payload = {
      name,
      slug,
      description: description || '',
      image: image || ''
    };

    if (id) {
      // Update
      const updatedCategory = await Category.update(Number(id), payload);
      return NextResponse.json({
        success: true,
        message: 'Category updated successfully.',
        category: updatedCategory
      });
    } else {
      // Create
      const newCategory = await Category.create(payload);
      return NextResponse.json({
        success: true,
        message: 'Category created successfully.',
        category: newCategory
      });
    }
  } catch (error: any) {
    console.error('Error saving category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save category.' },
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
        { error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    await Category.delete(Number(id));

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
