export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

export interface PaymentLinkData {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify: {
    sms: boolean;
    email: boolean;
  };
  callback_url?: string;
  callback_method?: string;
}

export async function createPaymentLink(
  config: RazorpayConfig,
  data: PaymentLinkData
): Promise<{ short_url: string; id: string } | null> {
  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${config.keyId}:${config.keySecret}`)
      },
      body: JSON.stringify({
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        description: data.description,
        customer: data.customer,
        notify: data.notify,
        callback_url: data.callback_url,
        callback_method: data.callback_method || 'get'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment link');
    }

    const result = await response.json();
    return {
      short_url: result.short_url,
      id: result.id
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    return null;
  }
}

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = localStorage.getItem('razorpay_key_id');
  const keySecret = localStorage.getItem('razorpay_key_secret');

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
}

export function setRazorpayConfig(keyId: string, keySecret: string) {
  localStorage.setItem('razorpay_key_id', keyId);
  localStorage.setItem('razorpay_key_secret', keySecret);
}

export function clearRazorpayConfig() {
  localStorage.removeItem('razorpay_key_id');
  localStorage.removeItem('razorpay_key_secret');
}
