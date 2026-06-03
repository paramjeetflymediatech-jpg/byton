import { NextResponse, NextRequest } from 'next/server';
import { Blog } from '@/lib/db/models';
import { getCachedBlogs, invalidateBlogsCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
    const search = searchParams.get('search') || '';

    const allBlogs = await getCachedBlogs();

    let filtered = allBlogs;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = allBlogs.filter((p: any) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q) ||
        (p.categories || '').toLowerCase().includes(q) ||
        (p.tags || '').toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginatedBlogs = filtered.slice(offset, offset + limit);

    return NextResponse.json({ success: true, blogs: paginatedBlogs, total, page, limit });
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

    // Invalidate blogs cache
    await invalidateBlogsCache();

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

    // Invalidate blogs cache
    await invalidateBlogsCache();

    return NextResponse.json({ success: true, message: 'Blog deleted.' });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog.' }, { status: 500 });
  }
}
