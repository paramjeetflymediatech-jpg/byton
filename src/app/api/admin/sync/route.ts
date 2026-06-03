import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Product } from '@/lib/db/models';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel');

    if (!channel || (channel !== 'ebay' && channel !== 'tiktok')) {
      return NextResponse.json(
        { error: 'Valid channel (ebay or tiktok) is required.' },
        { status: 400 }
      );
    }

    // Fetch a sample product to link to the mock order
    const products = await Product.findAll();
    const product = products[0] || { id: 1, title: 'Mock Product', price: 19.99 };

    const timestamp = Date.now();
    let mockOrder;

    if (channel === 'ebay') {
      const orderId = `EB-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
      mockOrder = await Order.create({
        id: orderId,
        customerName: 'John eBay Customer',
        customerEmail: `john.ebay.${timestamp}@example.com`,
        shippingAddress: '12 Market Street',
        shippingCity: 'Birmingham',
        shippingPostcode: 'B1 1AY',
        shippingPhone: '07700900123',
        totalAmount: product.price + 5.95,
        shippingCost: 5.95,
        status: 'completed',
        apcTrackingNumber: `APCEB${Math.floor(100000 + Math.random() * 900000)}`,
        apcLabelUrl: `/labels/apc-${orderId}.pdf`
      });

      // Create a linked OrderItem
      await OrderItem.create({
        orderId,
        productId: product.id,
        productTitle: product.title,
        quantity: 1,
        price: product.price
      });
    } else {
      const orderId = `TT-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
      mockOrder = await Order.create({
        id: orderId,
        customerName: 'Sarah TikTok Buyer',
        customerEmail: `sarah.tiktok.${timestamp}@example.com`,
        shippingAddress: '88 Trend Avenue',
        shippingCity: 'London',
        shippingPostcode: 'W1A 1AA',
        shippingPhone: '07700900456',
        totalAmount: (product.price * 2) + 5.95,
        shippingCost: 5.95,
        status: 'completed',
        apcTrackingNumber: `APCTT${Math.floor(100000 + Math.random() * 900000)}`,
        apcLabelUrl: `/labels/apc-${orderId}.pdf`
      });

      // Create a linked OrderItem
      await OrderItem.create({
        orderId,
        productId: product.id,
        productTitle: product.title,
        quantity: 2,
        price: product.price
      });
    }

    return NextResponse.json({
      success: true,
      message: `${channel.toUpperCase()} order synchronized successfully.`,
      order: mockOrder
    });
  } catch (error: any) {
    console.error('Error syncing order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync mock order.' },
      { status: 500 }
    );
  }
}
