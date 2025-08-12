import { storage } from '../storage';
import { WhatsAppService } from './whatsapp';

export interface NotificationChannel {
  send(userId: string, title: string, body: string, meta?: any): Promise<boolean>;
}

export class WhatsAppChannel implements NotificationChannel {
  constructor(private whatsappService: WhatsAppService) {}

  async send(userId: string, title: string, body: string, meta?: any): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.whatsappPhone || !user.whatsappOptIn) {
        return false;
      }

      let messageId: string;
      
      if (meta?.type === 'vaccination_reminder') {
        messageId = await this.whatsappService.sendVaccinationReminder(
          user.whatsappPhone,
          meta.petName,
          meta.vaccineName,
          meta.dueDate
        );
      } else if (meta?.type === 'food_depletion') {
        messageId = await this.whatsappService.sendFoodDepletionReminder(
          user.whatsappPhone,
          meta.petName,
          meta.date,
          meta.dailyGrams
        );
      } else if (meta?.type === 'order_update') {
        messageId = await this.whatsappService.sendOrderUpdate(
          user.whatsappPhone,
          meta.status,
          meta.orderNumber
        );
      } else {
        // Generic message
        messageId = await this.whatsappService.sendMessage(user.whatsappPhone, body);
      }

      console.log(`WhatsApp message sent: ${messageId}`);
      return true;
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }
}

export class EmailChannel implements NotificationChannel {
  async send(userId: string, title: string, body: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.email) {
        return false;
      }

      // In a real implementation, integrate with Resend or SendGrid
      console.log(`Email would be sent to ${user.email}: ${title} - ${body}`);
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }
}

export class InAppChannel implements NotificationChannel {
  async send(userId: string, title: string, body: string): Promise<boolean> {
    try {
      await storage.createNotification({
        userId,
        title,
        body,
        type: 'IN_APP',
        channels: ['IN_APP'],
      });
      return true;
    } catch (error) {
      console.error('In-app notification failed:', error);
      return false;
    }
  }
}

export class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    // Initialize channels
    this.setupChannels();
  }

  private setupChannels() {
    // Initialize WhatsApp provider based on configuration
    const whatsappProvider = WhatsAppService.createProvider('META', {});
    const whatsappService = new WhatsAppService(whatsappProvider);
    
    this.channels.set('WHATSAPP', new WhatsAppChannel(whatsappService));
    this.channels.set('EMAIL', new EmailChannel());
    this.channels.set('IN_APP', new InAppChannel());
  }

  async notify(
    userId: string,
    title: string,
    body: string,
    options: {
      channels?: string[];
      scheduledFor?: Date;
      meta?: any;
    } = {}
  ): Promise<void> {
    const { channels = ['WHATSAPP', 'EMAIL', 'IN_APP'], scheduledFor, meta } = options;

    // Create notification record
    const notification = await storage.createNotification({
      userId,
      title,
      body,
      channels,
      scheduledFor,
      type: meta?.type || 'GENERAL',
      meta,
    });

    // If scheduled for future, don't send now (would be handled by scheduler)
    if (scheduledFor && scheduledFor > new Date()) {
      return;
    }

    // Try channels in order until one succeeds
    for (const channelName of channels) {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          const success = await channel.send(userId, title, body, meta);
          if (success) {
            await storage.markNotificationSent(notification.id);
            break;
          }
        } catch (error) {
          console.error(`Channel ${channelName} failed:`, error);
          continue;
        }
      }
    }
  }

  async sendVaccinationReminder(userId: string, petName: string, vaccineName: string, dueDate: string): Promise<void> {
    await this.notify(
      userId,
      'Aşı Hatırlatması',
      `${petName} için ${vaccineName} aşısı ${dueDate} tarihinde yapılmalı.`,
      {
        channels: ['WHATSAPP', 'EMAIL'],
        meta: {
          type: 'vaccination_reminder',
          petName,
          vaccineName,
          dueDate,
        }
      }
    );
  }

  async sendFoodDepletionReminder(userId: string, petName: string, depletionDate: string, dailyGrams: number): Promise<void> {
    await this.notify(
      userId,
      'Mama Bitiyor',
      `${petName} için mama yaklaşık ${depletionDate} tarihinde bitecek.`,
      {
        channels: ['WHATSAPP', 'EMAIL'],
        meta: {
          type: 'food_depletion',
          petName,
          date: depletionDate,
          dailyGrams: dailyGrams.toString(),
        }
      }
    );
  }
}

export const notificationService = new NotificationService();
