// Conversion tracking utility for TikTok Pixel and Pinterest Tag

export interface TrackingEventData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_id?: string | number;
  content_type?: string;
  contents?: Array<{
    id: string | number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export class ConversionTracking {
  /**
   * Track event on TikTok Pixel
   */
  public static trackTikTok(eventName: string, data: TrackingEventData = {}) {
    if (typeof window !== 'undefined' && (window as any).ttq) {
      (window as any).ttq.track(eventName, {
        value: data.value,
        currency: data.currency || 'GBP',
        content_type: data.content_type || 'product',
        content_id: data.content_id,
        content_name: data.content_name,
        contents: data.contents?.map(item => ({
          content_id: item.id,
          content_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
      console.log(`[TikTok Pixel] Tracked: ${eventName}`, data);
    }
  }

  /**
   * Track event on Pinterest Tag
   */
  public static trackPinterest(eventName: string, data: TrackingEventData = {}) {
    if (typeof window !== 'undefined' && (window as any).pintrk) {
      (window as any).pintrk('track', eventName, {
        value: data.value,
        currency: data.currency || 'GBP',
        line_items: data.contents?.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_quantity: item.quantity,
          product_price: item.price
        })),
        content_ids: data.content_id ? [data.content_id] : data.contents?.map(item => item.id)
      });
      console.log(`[Pinterest Tag] Tracked: ${eventName}`, data);
    }
  }

  /**
   * Fire PageView event on all platforms
   */
  public static pageView() {
    this.trackTikTok('PageView');
    this.trackPinterest('pagevisit');
  }

  /**
   * Fire ViewContent event when a user looks at a product
   */
  public static viewProduct(product: { id: number; title: string; price: number }) {
    const data: TrackingEventData = {
      value: product.price,
      currency: 'GBP',
      content_name: product.title,
      content_id: product.id,
      content_type: 'product'
    };
    this.trackTikTok('ViewContent', data);
    this.trackPinterest('viewcontent', data);
  }

  /**
   * Fire AddToCart event
   */
  public static addToCart(product: { id: number; title: string; price: number; quantity: number }) {
    const data: TrackingEventData = {
      value: product.price * product.quantity,
      currency: 'GBP',
      contents: [{
        id: product.id,
        name: product.title,
        quantity: product.quantity,
        price: product.price
      }]
    };
    this.trackTikTok('AddToCart', data);
    this.trackPinterest('addtocart', data);
  }

  /**
   * Fire Purchase event
   */
  public static purchase(order: { id: string; totalAmount: number; items: Array<{ id: number; title: string; price: number; quantity: number }> }) {
    const data: TrackingEventData = {
      value: order.totalAmount,
      currency: 'GBP',
      contents: order.items.map(item => ({
        id: item.id,
        name: item.title,
        quantity: item.quantity,
        price: item.price
      }))
    };
    this.trackTikTok('CompletePayment', data);
    this.trackPinterest('checkout', data);
  }
}
