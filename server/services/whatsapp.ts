export interface WhatsAppProvider {
  sendMessage(to: string, message: string, templateKey?: string, variables?: Record<string, string>): Promise<string>;
  sendTemplate(to: string, templateKey: string, variables: Record<string, string>): Promise<string>;
  verifyWebhook(signature: string, body: string): boolean;
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;
  private webhookSecret: string;

  constructor(accessToken: string, phoneNumberId: string, webhookSecret: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.webhookSecret = webhookSecret;
  }

  async sendMessage(to: string, message: string): Promise<string> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.messages[0].id;
  }

  async sendTemplate(to: string, templateKey: string, variables: Record<string, string>): Promise<string> {
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateKey,
          language: { code: 'tr' },
          components: [{
            type: 'body',
            parameters: Object.values(variables).map(value => ({ type: 'text', text: value }))
          }]
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.messages[0].id;
  }

  verifyWebhook(signature: string, body: string): boolean {
    // Implement webhook verification logic
    return true;
  }
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendMessage(to: string, message: string): Promise<string> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${this.fromNumber}`,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Twilio API error: ${data.message || 'Unknown error'}`);
    }

    return data.sid;
  }

  async sendTemplate(to: string, templateKey: string, variables: Record<string, string>): Promise<string> {
    // Twilio doesn't use templates the same way, so we'll send as regular message
    const templateMessages = {
      'reminder.vaccine.tr': '{petName} için {vaccineName} aşısı {dueDate} tarihinde yapılmalı. Randevu için lütfen arayın.',
      'reminder.food.tr': '{petName} için mama yaklaşık {date} tarihinde bitecek. Günlük {dailyGrams}g öneriliyor. Yeni sipariş vermeniz gerekiyor mu?',
    };

    let message = templateMessages[templateKey as keyof typeof templateMessages] || templateKey;
    
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });

    return this.sendMessage(to, message);
  }

  verifyWebhook(signature: string, body: string): boolean {
    // Implement Twilio webhook verification
    return true;
  }
}

export class WhatsAppService {
  private provider: WhatsAppProvider;

  constructor(provider: WhatsAppProvider) {
    this.provider = provider;
  }

  static createProvider(type: 'META' | 'TWILIO', config: Record<string, string>): WhatsAppProvider {
    if (type === 'META') {
      return new MetaWhatsAppProvider(
        config.accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN || '',
        config.phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
        config.webhookSecret || process.env.META_WHATSAPP_WEBHOOK_SECRET || ''
      );
    } else {
      return new TwilioWhatsAppProvider(
        config.accountSid || process.env.TWILIO_ACCOUNT_SID || '',
        config.authToken || process.env.TWILIO_AUTH_TOKEN || '',
        config.fromNumber || process.env.TWILIO_WHATSAPP_NUMBER || ''
      );
    }
  }

  async sendVaccinationReminder(to: string, petName: string, vaccineName: string, dueDate: string): Promise<string> {
    return this.provider.sendTemplate(to, 'reminder.vaccine.tr', {
      petName,
      vaccineName,
      dueDate
    });
  }

  async sendFoodDepletionReminder(to: string, petName: string, date: string, dailyGrams: string): Promise<string> {
    return this.provider.sendTemplate(to, 'reminder.food.tr', {
      petName,
      date,
      dailyGrams
    });
  }

  async sendOrderUpdate(to: string, orderStatus: string, orderNumber: string): Promise<string> {
    const message = `Sipariş durumu güncellemesi: #${orderNumber} - ${orderStatus}`;
    return this.provider.sendMessage(to, message);
  }
}
