import { Setting } from '../db/models';

export interface APCShippingQuote {
  serviceName: string;
  cost: number;
  currency: string;
  estimatedDays: number;
}

export interface APCBookingResult {
  success: boolean;
  trackingNumber: string;
  labelUrl: string;
  consignmentId: string;
}

export class APCService {
  /**
   * Calculate delivery rates from APC Overnight base rules
   */
  public static async calculateRate(totalWeightKg: number, postcode: string): Promise<APCShippingQuote> {
    // Read pricing constants from settings table
    const baseRateSetting = await Setting.findByPk('apc_base_shipping_rate');
    const perKgSetting = await Setting.findByPk('apc_per_kg_rate');

    const baseRate = baseRateSetting ? parseFloat(baseRateSetting.value) : 12.50;
    const perKgRate = perKgSetting ? parseFloat(perKgSetting.value) : 1.20;

    let finalCost = baseRate;
    
    // Additional charge per kg if over 5kg
    if (totalWeightKg > 5) {
      finalCost += (totalWeightKg - 5) * perKgRate;
    }

    // APC postcodes surcharge check (e.g. Scottish Highlands, Islands)
    const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const isRemote = /^(AB3|AB4|AB5|FK17|FK18|FK19|FK20|FK21|IV|HS|KA27|KA28|KW|PA20|PA21|PA22|PA23|PA24|PA25|PA26|PA27|PA28|PA29|PA3|PA4|PA6|PA7|PH19|PH2|PH3|PH4|PH50|ZE|BT|IM|TR21|TR22|TR23|TR24|TR25)/i.test(normalizedPostcode);

    if (isRemote) {
      finalCost += 15.00; // Remote area surcharge
    }

    return {
      serviceName: totalWeightKg > 30 ? 'APC Heavy Cargo (Palletized)' : 'APC Overnight Liquid/Parcel',
      cost: parseFloat(finalCost.toFixed(2)),
      currency: 'GBP',
      estimatedDays: isRemote ? 2 : 1, // Next-day or 2-day delivery
    };
  }

  /**
   * Book consignment with APC Overnight API (Simulated/Mocked)
   */
  public static async bookConsignment(orderDetails: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    address: string;
    city: string;
    postcode: string;
    phone: string;
    totalWeightKg: number;
  }): Promise<APCBookingResult> {
    const apiKeySetting = await Setting.findByPk('apc_api_key');
    const apiKey = apiKeySetting ? apiKeySetting.value : 'NO_KEY_SET';

    console.log(`[APC SHIPPING] Connecting to APC API with key: ${apiKey.substring(0, 5)}...`);
    console.log(`[APC SHIPPING] Booking order: ${orderDetails.orderId} (Weight: ${orderDetails.totalWeightKg}kg)`);

    // Simulated network response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate simulated booking identifiers
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `APC${orderDetails.postcode.substring(0, 3).toUpperCase()}${randomSuffix}`;
    const consignmentId = `CNS-${orderDetails.orderId}-${randomSuffix}`;
    
    // Dummy labels matching APC Overnight PDF structures
    const labelUrl = `/labels/apc-${orderDetails.orderId}.pdf`;

    return {
      success: true,
      trackingNumber,
      labelUrl,
      consignmentId,
    };
  }

  /**
   * Fetch tracking checkpoints for APC Overnight shipments
   */
  public static async getTrackingStatus(trackingNumber: string): Promise<any> {
    // Return mock checkpoints based on the tracking number structure
    return {
      trackingNumber,
      courier: 'APC Overnight',
      status: 'In Transit',
      events: [
        {
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          location: 'Coventry Sorting Depot',
          description: 'Consignment received at hub and sorted'
        },
        {
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          location: 'Birmingham Terminal',
          description: 'Manifest uploaded and scanned'
        },
        {
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          location: 'Bayton Horticulture Warehouse',
          description: 'Shipment picked up by courier'
        }
      ]
    };
  }
}
