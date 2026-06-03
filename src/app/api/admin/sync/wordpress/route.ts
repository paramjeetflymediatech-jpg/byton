import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/admin/sync/wordpress
 *
 * Fetches orders from the live WooCommerce REST API at baytonhorticulturecentre.co.uk
 * and upserts them into the Supabase `orders` + `order_items` tables.
 *
 * Requires in .env:
 *   WC_SITE_URL        = https://baytonhorticulturecentre.co.uk
 *   WC_CONSUMER_KEY    = ck_...
 *   WC_CONSUMER_SECRET = cs_...
 */

const WC_STATUS_MAP: Record<string, string> = {
  pending:    'pending',
  processing: 'processing',
  'on-hold':  'on-hold',
  completed:  'completed',
  cancelled:  'cancelled',
  refunded:   'refunded',
  failed:     'failed',
  trash:      'cancelled',
};

async function fetchWCPage(baseUrl: string, auth: string, page: number): Promise<any[]> {
  const url = `${baseUrl}/wp-json/wc/v3/orders?per_page=100&page=${page}&orderby=date&order=desc`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    // Bypass cache so we always get fresh data
    cache: 'no-store',
  });

  if (res.status === 401) {
    throw new Error('WooCommerce API authentication failed. Check your Consumer Key and Secret.');
  }
  if (res.status === 404) {
    throw new Error('WooCommerce REST API not found. Ensure the WooCommerce plugin is active and REST API is enabled on the site.');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`WooCommerce API error ${res.status}: ${body.substring(0, 200)}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const siteUrl        = process.env.WC_SITE_URL?.replace(/\/$/, '') || '';
    const consumerKey    = process.env.WC_CONSUMER_KEY    || '';
    const consumerSecret = process.env.WC_CONSUMER_SECRET || '';

    if (!siteUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'WooCommerce credentials are not configured. Set WC_SITE_URL, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET in your .env file.' },
        { status: 400 }
      );
    }

    if (consumerKey.includes('your_consumer_key_here')) {
      return NextResponse.json(
        { error: 'WooCommerce credentials are still set to placeholder values. Please generate real API keys from your WordPress dashboard: WooCommerce → Settings → Advanced → REST API.' },
        { status: 400 }
      );
    }

    // Base64 encode "consumerKey:consumerSecret" for HTTP Basic Auth
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // Paginate through all orders (WooCommerce max per_page is 100)
    let allOrders: any[] = [];
    let page = 1;
    while (true) {
      const batch = await fetchWCPage(siteUrl, auth, page);
      if (!batch || batch.length === 0) break;
      allOrders = allOrders.concat(batch);
      if (batch.length < 100) break; // last page
      page++;
    }

    if (allOrders.length === 0) {
      return NextResponse.json({
        success: true,
        synced:  0,
        message: 'No orders found in the live WooCommerce store.',
      });
    }

    let syncedCount  = 0;
    let skippedCount = 0;

    for (const wcOrder of allOrders) {
      const orderId = `WC-${wcOrder.id}`;

      // Build customer name from billing
      const billing   = wcOrder.billing || {};
      const fullName  = `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || 'Unknown Customer';
      const fullAddr  = [billing.address_1, billing.address_2].filter(Boolean).join(', ');

      // Upsert order into Supabase
      const { error: orderErr } = await supabase
        .from('orders')
        .upsert(
          {
            id:                orderId,
            customer_name:     fullName,
            customer_email:    billing.email    || '',
            shipping_address:  fullAddr,
            shipping_city:     billing.city     || '',
            shipping_postcode: billing.postcode || '',
            shipping_phone:    billing.phone    || '',
            total_amount:      parseFloat(wcOrder.total        || '0'),
            shipping_cost:     parseFloat(wcOrder.shipping_total || '0'),
            status:            WC_STATUS_MAP[wcOrder.status] ?? wcOrder.status,
            channel:           'website',
            created_at:        wcOrder.date_created_gmt
              ? `${wcOrder.date_created_gmt}Z`
              : new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: false }
        );

      if (orderErr) {
        console.error(`Failed to upsert WC order ${orderId}:`, orderErr.message);
        skippedCount++;
        continue;
      }

      // Re-insert line items
      const lineItems: any[] = wcOrder.line_items || [];
      if (lineItems.length > 0) {
        await supabase.from('order_items').delete().eq('order_id', orderId);
        await supabase.from('order_items').insert(
          lineItems.map((item: any) => ({
            order_id:      orderId,
            product_id:    null,            // WC product IDs don't exist in Supabase — always null
            product_title: item.name        || 'Product',
            quantity:      item.quantity    || 1,
            price:         parseFloat(item.price || item.subtotal || '0'),
          }))
        );
      }

      syncedCount++;
    }

    return NextResponse.json({
      success:  true,
      synced:   syncedCount,
      skipped:  skippedCount,
      total:    allOrders.length,
      message:  `WooCommerce sync complete. ${syncedCount} orders imported from ${siteUrl}, ${skippedCount} skipped.`,
    });
  } catch (error: any) {
    console.error('WooCommerce sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync WooCommerce orders.' },
      { status: 500 }
    );
  }
}
