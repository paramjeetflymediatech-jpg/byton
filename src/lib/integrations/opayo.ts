import { Setting } from '../db/models';

export interface OpayoPaymentResult {
  success: boolean;
  transactionId?: string;
  authCode?: string;
  status: string;
  errorMessage?: string;
}

export class OpayoService {
  /**
   * Generates a mock Merchant Session Key (MSK) for secure client-side card tokenization.
   */
  public static async generateMerchantSessionKey(): Promise<string> {
    const vendorSetting = await Setting.findByPk('opayo_vendor_name');
    const vendor = vendorSetting ? vendorSetting.value : 'baytonhorticulture';

    console.log(`[OPAYO] Requesting Merchant Session Key for Vendor: ${vendor}`);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const uuidPart = Math.floor(1000 + Math.random() * 9000);
    return `msk-prod-${vendor}-${Date.now()}-${uuidPart}`;
  }

  /**
   * Process a payment request using Opayo Pi API (Simulated/Mocked)
   */
  public static async processPayment(details: {
    token: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    orderId: string;
  }): Promise<OpayoPaymentResult> {
    const integrationKeySetting = await Setting.findByPk('opayo_integration_key');
    const integrationKey = integrationKeySetting ? integrationKeySetting.value : 'OPAYO_MOCK_KEY_98765';

    console.log(`[OPAYO] Connecting to Opayo Gateway with Integration Key: ${integrationKey.substring(0, 8)}...`);
    console.log(`[OPAYO] Processing transaction for Order ${details.orderId} (Amount: £${details.amount.toFixed(2)})`);

    // Simulate gateway network response delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple business logic for card validations or mock declines:
    // If the token is derived from a card number ending in '0000', simulate a mock card decline!
    if (details.token.includes('declined') || details.token.includes('0000')) {
      console.log(`[OPAYO] Transaction DECLINED for Order ${details.orderId}`);
      return {
        success: false,
        status: 'Rejected',
        errorMessage: 'The card was declined. Please verify your details or try a different card.'
      };
    }

    if (details.token.includes('expired')) {
      console.log(`[OPAYO] Transaction REJECTED (Expired card) for Order ${details.orderId}`);
      return {
        success: false,
        status: 'Expired',
        errorMessage: 'The card has expired. Please use a valid card.'
      };
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `OPY-TX-${details.orderId}-${randomSuffix}`;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`[OPAYO] Payment AUTHORISED. TxID: ${transactionId}, AuthCode: ${authCode}`);

    return {
      success: true,
      transactionId,
      authCode,
      status: 'Authorised'
    };
  }
}
