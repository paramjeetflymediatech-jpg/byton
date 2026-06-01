import { NextResponse, NextRequest } from 'next/server';
import { Blog } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
    const offset = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.findAll({ limit, offset }),
      Blog.count(),
    ]);

    return NextResponse.json({ success: true, blogs, total, page, limit });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to retrieve blogs.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...payload } = body;

    let blog;
    if (id) {
      blog = await Blog.update(Number(id), payload);
    } else {
      blog = await Blog.upsert(payload);
    }

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error('Error saving blog:', error);
    return NextResponse.json({ error: 'Failed to save blog.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Blog ID is required.' }, { status: 400 });

    await Blog.delete(Number(id));
    return NextResponse.json({ success: true, message: 'Blog deleted.' });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog.' }, { status: 500 });
  }
}
