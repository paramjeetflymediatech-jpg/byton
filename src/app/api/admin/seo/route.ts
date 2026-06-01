import { NextResponse, NextRequest } from 'next/server';
import { Seo } from '@/lib/db/models';

export async function GET() {
  try {
    const seoData = await Seo.findAll();
    return NextResponse.json({ success: true, seo: seoData });
  } catch (error: any) {
    console.error('Error fetching SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SEO configurations.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pageType,
      pageId,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageUrl
    } = body;

    if (!pageType && !canonicalUrl && !slug) {
      return NextResponse.json(
        { error: 'At least one of pageType, slug, or canonicalUrl is required.' },
        { status: 400 }
      );
    }

    const seo = await Seo.upsert({
      pageType: pageType || 'custom',
      pageId: pageId || slug || canonicalUrl || '',
      slug: slug || '',
      canonicalUrl: canonicalUrl || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      keywords: keywords || '',
      ogTitle: ogTitle || '',
      ogDescription: ogDescription || '',
      ogImageUrl: ogImageUrl || ''
    });

    return NextResponse.json({
      success: true,
      message: 'SEO configuration saved successfully.',
      seo
    });
  } catch (error: any) {
    console.error('Error saving SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to write SEO configuration.' },
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
        { error: 'SEO record ID is required.' },
        { status: 400 }
      );
    }

    await Seo.delete(Number(id));

    return NextResponse.json({
      success: true,
      message: 'SEO configuration deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to delete SEO configuration.' },
      { status: 500 }
    );
  }
}
