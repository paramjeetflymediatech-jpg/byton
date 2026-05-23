import { NextResponse, NextRequest } from 'next/server';
import { Order, OrderItem, Setting } from '../../../lib/db/models';

// GET orders and settings
export async function GET() {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });

    const settings = await Setting.findAll();

    return NextResponse.json({
      success: true,
      orders,
      settings: settings.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin dashboard information.' },
      { status: 500 }
    );
  }
}

// POST updates to settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body; // Object of { key: value }

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings object is required.' },
        { status: 400 }
      );
    }

    for (const key of Object.keys(settings)) {
      await Setting.upsert({
        key,
        value: String(settings[key])
      });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to write settings updates.' },
      { status: 500 }
    );
  }
}
