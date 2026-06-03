import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;

  try {
    // Fetch orders for this email
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    const orderIds = (ordersData || []).map(o => o.id);

    // Fetch order items for these orders
    let itemsData: any[] = [];
    if (orderIds.length > 0) {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (!error && data) {
        itemsData = data;
      }
    }

    // Map items to their respective orders
    const orders = (ordersData || []).map(orderRow => {
      const order = Order.fromRow(orderRow);
      const items = itemsData
        .filter(item => item.order_id === order.id)
        .map(item => ({
          id: item.id,
          productId: item.product_id,
          productTitle: item.product_title,
          quantity: item.quantity,
          price: item.price
        }));
      return {
        ...order,
        items
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error('Error fetching customer orders:', err);
    return NextResponse.json({ error: err.message || 'Failed to retrieve orders.' }, { status: 500 });
  }
}
