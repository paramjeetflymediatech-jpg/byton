import { NextRequest, NextResponse } from 'next/server';
import { APCService } from '../../../lib/integrations/apc';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { weight, postcode } = body;

    if (weight === undefined || !postcode) {
      return NextResponse.json(
        { error: 'Weight and postcode are required' },
        { status: 400 }
      );
    }

    const quote = await APCService.calculateRate(parseFloat(weight), postcode);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error in APC shipping calculation:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping rate' },
      { status: 500 }
    );
  }
}
