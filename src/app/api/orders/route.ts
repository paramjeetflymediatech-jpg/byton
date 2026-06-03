import { NextRequest, NextResponse } from 'next/server';
import { Order, OrderItem, Product } from '../../../lib/db/models';
import { APCService } from '../../../lib/integrations/apc';
import { OpayoService } from '../../../lib/integrations/opayo';

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
      cartItems, // Array of { id, price, quantity }
      opayoToken
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
    const finalAmount = subtotal + shippingQuote.cost;
    const orderId = `BHC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Process payment via Opayo Gateway
    if (!opayoToken) {
      return NextResponse.json(
        { error: 'Payment card token is required to complete transaction.' },
        { status: 400 }
      );
    }

    const paymentResult = await OpayoService.processPayment({
      token: opayoToken,
      amount: finalAmount,
      currency: 'GBP',
      customerName,
      customerEmail,
      orderId
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.errorMessage || 'Payment was declined by Opayo.' },
        { status: 402 } // Payment Required / Declined
      );
    }

    // 4. Book shipment with APC Overnight
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

    // 5. Create Order in DB
    const finalOrder = await Order.create({
      id: orderId,
      customerName,
      customerEmail,
      shippingAddress,
      shippingCity,
      shippingPostcode,
      shippingPhone,
      totalAmount: finalAmount,
      shippingCost: shippingQuote.cost,
      status: 'completed', // paid and finalized
      apcTrackingNumber: apcBooking.trackingNumber,
      apcLabelUrl: apcBooking.labelUrl
    });

    // 6. Create OrderItems in DB
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
      items: itemsToCreate,
      opayoTransactionId: paymentResult.transactionId
    });
  } catch (error) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout transaction.' },
      { status: 500 }
    );
  }
}
