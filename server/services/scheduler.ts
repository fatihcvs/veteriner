import { storage } from '../storage';
import { notificationService } from './notifications';

export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    // Check for due reminders every hour
    this.intervalId = setInterval(() => {
      this.processScheduledTasks();
    }, 60 * 60 * 1000); // 1 hour

    console.log('Scheduler started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Scheduler stopped');
  }

  private async processScheduledTasks() {
    try {
      await this.checkVaccinationReminders();
      await this.checkFoodDepletionReminders();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }

  private async checkVaccinationReminders() {
    // This would normally query the database for vaccinations due soon
    // For now, we'll simulate the logic
    console.log('Checking vaccination reminders...');
    
    // In a real implementation:
    // 1. Query vaccinations due in -7, -1, 0, +7 days
    // 2. Check if reminders already sent
    // 3. Send reminders via notification service
  }

  private async checkFoodDepletionReminders() {
    console.log('Checking food depletion reminders...');
    
    try {
      // Get all active feeding plans
      const feedingPlans = await storage.getFeedingPlans();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const plan of feedingPlans) {
        if (!plan.expectedDepletionDate || plan.notificationSent) continue;
        
        const depletionDate = new Date(plan.expectedDepletionDate);
        const timeDiff = depletionDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Send notification 7 days before or 1 day before
        if (daysLeft === 7 || daysLeft === 1) {
          const pet = plan.pet;
          const owner = pet ? await storage.getUser(pet.ownerId) : null;
          
          if (owner && pet) {
            await notificationService.sendFoodDepletionReminder(
              owner.id,
              pet.name,
              plan.expectedDepletionDate,
              plan.dailyGramsRecommended
            );
            
            // Mark notification as sent
            await storage.updateFeedingPlan(plan.id, { notificationSent: true });
            console.log(`Food depletion reminder sent for ${pet.name} (${daysLeft} days left)`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking food depletion reminders:', error);
    }
  }

  async scheduleVaccinationReminder(petId: string, vaccineId: string, dueDate: Date) {
    // Calculate reminder dates: -7 days, -1 day, 0 (due date), +7 days
    const reminderDates = [
      new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000), // -7 days
      new Date(dueDate.getTime() - 1 * 24 * 60 * 60 * 1000), // -1 day
      dueDate, // due date
      new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
    ];

    // Store scheduled jobs (in a real implementation, this would use BullMQ)
    console.log(`Scheduled vaccination reminders for pet ${petId}, vaccine ${vaccineId} on:`, reminderDates);
  }

  async scheduleFoodDepletionReminder(feedingPlanId: string, depletionDate: Date) {
    // Calculate reminder dates: -7 days, -1 day
    const reminderDates = [
      new Date(depletionDate.getTime() - 7 * 24 * 60 * 60 * 1000), // -7 days
      new Date(depletionDate.getTime() - 1 * 24 * 60 * 60 * 1000), // -1 day
    ];

    console.log(`Scheduled food depletion reminders for feeding plan ${feedingPlanId} on:`, reminderDates);
  }
}

export const schedulerService = new SchedulerService();
