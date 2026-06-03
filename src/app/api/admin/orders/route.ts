import { NextRequest, NextResponse } from 'next/server';
import { Order, Product } from '@/lib/db/models';
import { APCService } from '@/lib/integrations/apc';
import { supabase } from '@/lib/supabase';

// GET list of orders (with search/filtering)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search  = searchParams.get('search')?.trim().toLowerCase() || '';
    const channel = searchParams.get('channel')?.trim().toLowerCase() || 'all';
    const status  = searchParams.get('status')?.trim().toLowerCase()  || 'all';

    // Build Supabase query with server-side channel filter where possible
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    // Apply channel filter at DB level if possible
    if (channel === 'ebay') {
      // Legacy EB- prefix OR channel column
      query = query.or('id.like.EB-%,channel.eq.ebay');
    } else if (channel === 'tiktok') {
      query = query.or('id.like.TT-%,channel.eq.tiktok');
    } else if (channel === 'website') {
      // WooCommerce synced orders (WC-) + native website orders without EB-/TT- prefix
      query = query.or('id.like.WC-%,channel.eq.website');
    }

    const { data, error } = await query;
    if (error) throw error;

    let allOrders = (data || []).map((row: any) => ({
      id:               row.id,
      customerName:     row.customer_name,
      customerEmail:    row.customer_email,
      shippingAddress:  row.shipping_address,
      shippingCity:     row.shipping_city,
      shippingPostcode: row.shipping_postcode,
      shippingPhone:    row.shipping_phone,
      totalAmount:      Number(row.total_amount || 0),
      shippingCost:     Number(row.shipping_cost || 0),
      status:           row.status,
      channel:          row.channel || deriveChannel(row.id),
      apcTrackingNumber: row.apc_tracking_number,
      apcLabelUrl:      row.apc_label_url,
      createdAt:        row.created_at,
      items: (row.order_items || []).map((oi: any) => ({
        id:           oi.id,
        orderId:      oi.order_id,
        productId:    oi.product_id,
        productTitle: oi.product_title,
        quantity:     oi.quantity,
        price:        Number(oi.price || 0),
      })),
    }));

    // For 'all' channel, do a client-side fallback dedup by ID prefix for legacy records
    // (orders created before the channel column was added)
    if (channel === 'all') {
      // No additional filter needed; all orders returned
    }

    // Filter by APC Courier status
    if (status !== 'all') {
      allOrders = allOrders.filter((o) => {
        const isBooked = !!o.apcTrackingNumber;
        if (status === 'booked')   return isBooked;
        if (status === 'unbooked') return !isBooked;
        return true;
      });
    }

    // Filter by search query (id, name, email, postcode, tracking number, city)
    if (search) {
      allOrders = allOrders.filter((o) =>
        o.id.toLowerCase().includes(search)           ||
        (o.customerName  || '').toLowerCase().includes(search) ||
        (o.customerEmail || '').toLowerCase().includes(search) ||
        (o.shippingPostcode || '').toLowerCase().includes(search) ||
        (o.shippingCity  || '').toLowerCase().includes(search) ||
        (o.apcTrackingNumber || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, orders: allOrders });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve admin orders.' },
      { status: 500 }
    );
  }
}

/** Derive channel from order ID prefix for legacy records without channel column */
function deriveChannel(id: string): string {
  if (id?.startsWith('EB-')) return 'ebay';
  if (id?.startsWith('TT-')) return 'tiktok';
  return 'website';
}

// POST to book APC Courier for a specific order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    // Fetch order with items
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.apcTrackingNumber) {
      return NextResponse.json(
        { error: 'Courier booking is already complete for this order.' },
        { status: 400 }
      );
    }

    // Calculate total shipping weight
    let totalWeightKg = 0;
    for (const item of order.items || []) {
      const quantity = item.quantity || 1;
      let productWeight = 1.0; // default 1kg

      if (item.productId) {
        try {
          const product = await Product.findByPk(item.productId);
          if (product && product.weight) {
            productWeight = Number(product.weight);
          }
        } catch (e) {
          console.warn(`Could not query weight for product ID: ${item.productId}`, e);
        }
      }
      totalWeightKg += quantity * productWeight;
    }

    // Call APC Courier booking service
    const bookingResult = await APCService.bookConsignment({
      orderId:        order.id,
      customerName:   order.customerName,
      customerEmail:  order.customerEmail,
      address:        order.shippingAddress,
      city:           order.shippingCity,
      postcode:       order.shippingPostcode,
      phone:          order.shippingPhone || '07700900000',
      totalWeightKg:  totalWeightKg || 1.0,
    });

    if (!bookingResult.success) {
      return NextResponse.json({ error: 'APC Courier booking failed.' }, { status: 500 });
    }

    // Update order in Supabase with tracking number and label URL
    const updatedOrder = await Order.update(orderId, {
      apcTrackingNumber: bookingResult.trackingNumber,
      apcLabelUrl:       bookingResult.labelUrl,
      status:            'shipped',
    });

    return NextResponse.json({
      success: true,
      message: 'APC Courier booking completed successfully.',
      order:   updatedOrder,
    });
  } catch (error: any) {
    console.error('Error booking courier:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process courier booking.' },
      { status: 500 }
    );
  }
}
