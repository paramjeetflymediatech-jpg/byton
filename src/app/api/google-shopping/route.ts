import { NextResponse } from 'next/server';
import { Product, Setting } from '../../../lib/db/models';

export async function GET() {
  try {
    // 1. Fetch products
    const products = await Product.findAll();

    // 2. Fetch Merchant ID
    const merchantIdSetting = await Setting.findByPk('google_shopping_merchant_id');
    const merchantId = merchantIdSetting ? merchantIdSetting.value : '123456789';

    // 3. Construct XML string
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Bayton Horticulture Centre Product Feed</title>
    <link>https://baytonhorticulturecentre.co.uk</link>
    <description>Garden products, grow lights, tents, and hydroponics gear in Coventry.</description>
    <merchant_id>${merchantId}</merchant_id>
`;

    for (const p of products) {
      const description = p.excerpt || p.description || 'Quality horticulture and hydroponics gear';
      const cleanDescription = description
        .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .substring(0, 1000);

      const cleanTitle = p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const productLink = `https://baytonhorticulturecentre.co.uk/product/${p.slug}`;
      const imageLink = p.image || 'https://baytonhorticulturecentre.co.uk/wp-content/uploads/2024/07/cropped-future-logo.png';

      xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${cleanTitle}</g:title>
      <g:description>${cleanDescription}</g:description>
      <g:link>${productLink}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 || p.stockStatus === 'instock' ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price.toFixed(2)} GBP</g:price>
      <g:brand>Bayton Horticulture</g:brand>
      <g:mpn>${p.sku || `MPN${p.id}`}</g:mpn>
      <g:google_product_category>Home &amp; Garden &gt; Lawn &amp; Garden &gt; Gardening &gt; Hydroponics</g:google_product_category>
      <g:shipping_weight>${(p.weight || 0.1).toFixed(2)} kg</g:shipping_weight>
    </item>
`;
    }

    xml += `  </channel>
</rss>`;

    // 4. Return XML response
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating Google Shopping feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate products feed' },
      { status: 500 }
    );
  }
}
