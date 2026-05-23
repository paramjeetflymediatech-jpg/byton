import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Product } from '../../../lib/db/models';
import { APCService } from '../../../lib/integrations/apc';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      shippingAddress,
      shippingCity,
      shippingPostcode,
      shippingPhone,
      cartItems // Array of { id, price, quantity }
    } = body;

    // Validate inputs
    if (!customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingPostcode || !shippingPhone || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'All customer and checkout details are required.' },
        { status: 400 }
      );
    }

    // 1. Calculate totals and total weight
    let subtotal = 0;
    let totalWeight = 0;
    const itemsToCreate = [];

    for (const item of cartItems) {
      const dbProduct = await Product.findByPk(item.id);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product with ID ${item.id} not found.` },
          { status: 404 }
        );
      }

      const itemPrice = dbProduct.price;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += itemPrice * quantity;
      totalWeight += (dbProduct.weight || 0.1) * quantity;

      itemsToCreate.push({
        productId: dbProduct.id,
        productTitle: dbProduct.title,
        quantity,
        price: itemPrice
      });
    }

    // 2. Query shipping cost from APC
    const shippingQuote = await APCService.calculateRate(totalWeight, shippingPostcode);

    // 3. Book shipment with APC Overnight
    const orderId = `BHC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const apcBooking = await APCService.bookConsignment({
      orderId,
      customerName,
      customerEmail,
      address: shippingAddress,
      city: shippingCity,
      postcode: shippingPostcode,
      phone: shippingPhone,
      totalWeightKg: totalWeight
    });

    // 4. Create Order in DB
    const finalOrder = await Order.create({
      id: orderId,
      customerName,
      customerEmail,
      shippingAddress,
      shippingCity,
      shippingPostcode,
      shippingPhone,
      totalAmount: subtotal + shippingQuote.cost,
      shippingCost: shippingQuote.cost,
      status: 'completed', // paid and finalized
      apcTrackingNumber: apcBooking.trackingNumber,
      apcLabelUrl: apcBooking.labelUrl
    });

    // 5. Create OrderItems in DB
    for (const item of itemsToCreate) {
      await OrderItem.create({
        orderId: finalOrder.id,
        productId: item.productId,
        productTitle: item.productTitle,
        quantity: item.quantity,
        price: item.price
      });
    }

    return NextResponse.json({
      success: true,
      order: finalOrder,
      items: itemsToCreate
    });
  } catch (error) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout transaction.' },
      { status: 500 }
    );
  }
}
