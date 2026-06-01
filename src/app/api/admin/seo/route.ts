import { NextResponse, NextRequest } from 'next/server';
import { Setting } from '@/lib/db/models';

// Helper to slugify canonical URL for keys
function makeKeyFriendly(url: string) {
  return url
    .toLowerCase()
    .replace(/https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function GET() {
  try {
    const allSettings = await Setting.findAll();
    const seoData = allSettings
      .filter((s) => s.key.startsWith('seo_'))
      .map((s) => {
        try {
          return JSON.parse(s.value);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

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
      productId,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImageUrl
    } = body;

    // Validate we have at least productId or canonicalUrl
    if (!productId && !canonicalUrl) {
      return NextResponse.json(
        { error: 'Product ID or Canonical URL is required.' },
        { status: 400 }
      );
    }

    const keySuffix = productId ? `product_${productId}` : `page_${makeKeyFriendly(canonicalUrl)}`;
    const key = `seo_${keySuffix}`;

    const seoRecord = {
      id: key,
      productId: productId || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      keywords: keywords || '',
      canonicalUrl: canonicalUrl || '',
      ogTitle: ogTitle || '',
      ogDescription: ogDescription || '',
      ogImageUrl: ogImageUrl || ''
    };

    await Setting.upsert({
      key,
      value: JSON.stringify(seoRecord)
    });

    return NextResponse.json({
      success: true,
      message: 'SEO configuration saved successfully.',
      seo: seoRecord
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
    const key = searchParams.get('id');

    if (!key || !key.startsWith('seo_')) {
      return NextResponse.json(
        { error: 'Valid SEO configuration ID is required.' },
        { status: 400 }
      );
    }

    await Setting.delete(key);

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
