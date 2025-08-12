import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { insertPetSchema, insertVaccinationEventSchema, insertAppointmentSchema, insertFoodProductSchema, updateUserProfileSchema, updatePetOwnerProfileSchema } from "@shared/schema";
import { schedulerService } from "./services/scheduler";
import { notificationService } from "./services/notifications";
import { pdfService } from "./services/pdf";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  
  // Admin routes
  setupAdminRoutes(app);

  // Start scheduler service
  schedulerService.start();

  // Dashboard stats
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's clinic(s)
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id;

      if (!clinicId) {
        return res.json({
          todayAppointments: 0,
          overdueVaccinations: 0,
          activePatients: 0,
          monthlyRevenue: 0,
        });
      }

      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = await storage.getClinicAppointments(clinicId, today);
      
      // Get overdue vaccinations
      const overdueVaccinations = await storage.getOverdueVaccinations(clinicId);
      
      // Get active patients
      const activePatients = await storage.getClinicPets(clinicId);
      
      res.json({
        todayAppointments: todayAppointments.length,
        overdueVaccinations: overdueVaccinations.length,
        activePatients: activePatients.length,
        monthlyRevenue: 45200, // Mock data for now
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Profile endpoints
  app.get('/api/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      
      res.json({
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phone: user?.phone,
          whatsappPhone: user?.whatsappPhone,
          whatsappOptIn: user?.whatsappOptIn,
        },
        profile: profile || null,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Profil bilgileri alınamadı" });
    }
  });

  app.put('/api/profile/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ message: error.message || "Kullanıcı profili güncellenemedi" });
    }
  });

  app.put('/api/profile/details', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updatePetOwnerProfileSchema.parse(req.body);
      
      const updatedProfile = await storage.updateUserProfile(userId, validatedData);
      res.json({ success: true, profile: updatedProfile });
    } catch (error: any) {
      console.error("Error updating profile details:", error);
      res.status(400).json({ message: error.message || "Profil detayları güncellenemedi" });
    }
  });

  // Get all appointments
  app.get('/api/appointments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id;

      if (!clinicId) {
        return res.json([]);
      }

      const appointments = await storage.getClinicAllAppointments(clinicId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get today's appointments
  app.get('/api/appointments/today', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id;

      if (!clinicId) {
        return res.json([]);
      }

      const today = new Date().toISOString().split('T')[0];
      const appointments = await storage.getClinicAppointments(clinicId, today);
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Pet routes
  app.get('/api/pets', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let pets;
      if (user.role === 'PET_OWNER') {
        pets = await storage.getUserPets(userId);
      } else {
        // Clinic staff - get pets for their clinic
        const clinics = await storage.getUserClinics(userId);
        const clinicId = clinics[0]?.id;
        if (!clinicId) {
          return res.json([]);
        }
        pets = await storage.getClinicPets(clinicId);
      }
      
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.post('/api/pets', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Prepare data with proper types and defaults
      const petData = {
        ...req.body,
        ownerId: req.body.ownerId || userId,
        clinicId: req.body.clinicId || 'admin-clinic-id',
        weightKg: req.body.weightKg ? String(req.body.weightKg) : undefined
      };
      
      const validatedData = insertPetSchema.parse(petData);
      
      const pet = await storage.createPet(validatedData);
      res.json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(500).json({ message: "Failed to create pet" });
    }
  });

  app.put('/api/pets/:id', requireAuth, async (req: any, res) => {
    try {
      const petId = req.params.id;
      const userId = req.user.id;
      
      // Check if user owns this pet or is clinic staff
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role === 'PET_OWNER' && pet.ownerId !== userId) {
        return res.status(403).json({ message: "You can only edit your own pets" });
      }
      
      // Prepare data with proper types
      const petData = {
        ...req.body,
        weightKg: req.body.weightKg ? String(req.body.weightKg) : undefined
      };
      
      const validatedData = updatePetSchema.parse(petData);
      const updatedPet = await storage.updatePet(petId, validatedData);
      
      res.json(updatedPet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).json({ message: "Failed to update pet" });
    }
  });

  app.delete('/api/pets/:id', requireAuth, async (req: any, res) => {
    try {
      const petId = req.params.id;
      const userId = req.user.id;
      
      // Check if user owns this pet or is clinic staff
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role === 'PET_OWNER' && pet.ownerId !== userId) {
        return res.status(403).json({ message: "You can only delete your own pets" });
      }
      
      await storage.deletePet(petId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting pet:", error);
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });

  // Vaccination routes
  app.get('/api/vaccinations/overdue', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id;

      if (!clinicId) {
        return res.json([]);
      }

      const overdueVaccinations = await storage.getOverdueVaccinations(clinicId);
      res.json(overdueVaccinations);
    } catch (error) {
      console.error("Error fetching overdue vaccinations:", error);
      res.status(500).json({ message: "Failed to fetch overdue vaccinations" });
    }
  });

  app.get('/api/vaccines', requireAuth, async (req: any, res) => {
    try {
      const vaccines = await storage.getVaccines();
      res.json(vaccines);
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      res.status(500).json({ message: "Failed to fetch vaccines" });
    }
  });

  app.post('/api/vaccinations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const vaccinationData = insertVaccinationEventSchema.parse(req.body);
      
      // Set vet to current user
      vaccinationData.vetUserId = userId;
      
      // Set status to DONE and calculate next due date
      vaccinationData.status = 'DONE';
      
      // Get vaccine info for interval calculation
      const vaccine = await storage.getVaccines().then(vaccines => 
        vaccines.find(v => v.id === vaccinationData.vaccineId)
      );
      
      if (vaccine && vaccinationData.administeredAt) {
        const administeredDate = new Date(vaccinationData.administeredAt);
        const nextDueDate = new Date(administeredDate);
        nextDueDate.setDate(nextDueDate.getDate() + (vaccine.defaultIntervalDays || 365));
        vaccinationData.nextDueAt = nextDueDate;
      }
      
      const vaccination = await storage.createVaccinationEvent(vaccinationData);
      
      // Schedule reminders
      if (vaccination.nextDueAt) {
        await schedulerService.scheduleVaccinationReminder(
          vaccination.petId,
          vaccination.vaccineId,
          new Date(vaccination.nextDueAt)
        );
      }
      
      res.json(vaccination);
    } catch (error) {
      console.error("Error creating vaccination:", error);
      res.status(500).json({ message: "Failed to create vaccination" });
    }
  });

  // Generate vaccination card PDF
  app.get('/api/pets/:petId/vaccination-card', requireAuth, async (req: any, res) => {
    try {
      const { petId } = req.params;
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      const vaccinations = await storage.getPetVaccinations(petId);
      const clinic = await storage.getClinic(pet.clinicId);
      const owner = await storage.getUser(pet.ownerId);
      
      const cardData = {
        pet: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          birthDate: pet.birthDate?.toString() || '',
          microchipNo: pet.microchipNo || '',
          owner: owner ? `${owner.firstName} ${owner.lastName}` : '',
        },
        clinic: {
          name: clinic?.name || 'Veteriner Kliniği',
          address: clinic?.address || '',
          phone: clinic?.phone || '',
        },
        vaccinations: vaccinations.map(v => ({
          vaccineName: v.vaccineId, // In real app, would join with vaccine table
          administeredAt: v.administeredAt.toLocaleDateString('tr-TR'),
          vetName: v.vetUserId, // In real app, would join with user table
          lotNo: v.lotNo || '',
          nextDueAt: v.nextDueAt?.toLocaleDateString('tr-TR') || '',
        })),
      };

      const pdfBytes = await pdfService.generateVaccinationCard(cardData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="vaccination-card-${pet.name}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating vaccination card:", error);
      res.status(500).json({ message: "Failed to generate vaccination card" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getFoodProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productData = insertFoodProductSchema.parse(req.body);
      
      // Set clinic if staff member
      const clinics = await storage.getUserClinics(userId);
      if (clinics.length > 0) {
        productData.clinicId = clinics[0].id;
      }
      
      const product = await storage.createFoodProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Order routes
  app.get('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items, shippingAddress } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items are required' });
      }
      
      // Calculate total
      let totalAmount = 0;
      const products = await storage.getFoodProducts();
      
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalAmount += parseFloat(product.price) * item.quantity;
        }
      }
      
      const order = await storage.createOrder({
        userId,
        totalAmount: totalAmount.toString(),
        shippingAddress,
        status: 'PENDING',
      });
      
      // Send order confirmation
      await notificationService.notify(
        userId,
        'Sipariş Onaylandı',
        `Siparişiniz (#${order.id.slice(-6)}) alınmıştır. Toplam tutar: ₺${totalAmount}`,
        {
          channels: ['WHATSAPP', 'EMAIL'],
          meta: {
            type: 'order_update',
            status: 'Onaylandı',
            orderNumber: order.id.slice(-6),
          }
        }
      );
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Appointment routes
  app.get('/api/appointments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id;

      if (!clinicId) {
        return res.json([]);
      }

      const appointments = await storage.getClinicAppointments(clinicId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post('/api/appointments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Set vet to current user if not specified
      if (!appointmentData.vetUserId) {
        appointmentData.vetUserId = userId;
      }
      
      // Get user's clinic
      const clinics = await storage.getUserClinics(userId);
      const clinicId = clinics[0]?.id || appointmentData.clinicId;
      
      if (!clinicId) {
        return res.status(400).json({ message: 'No clinic assigned' });
      }
      
      appointmentData.clinicId = clinicId;
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // WhatsApp webhook
  app.post('/api/webhooks/whatsapp', async (req, res) => {
    try {
      const { object, entry } = req.body;
      
      if (object === 'whatsapp_business_account') {
        for (const entryItem of entry) {
          const changes = entryItem.changes;
          for (const change of changes) {
            if (change.field === 'messages') {
              const value = change.value;
              
              // Handle message statuses
              if (value.statuses) {
                for (const status of value.statuses) {
                  console.log(`Message ${status.id} status: ${status.status}`);
                  // Update message log status in database
                }
              }
              
              // Handle incoming messages
              if (value.messages) {
                for (const message of value.messages) {
                  await this.handleIncomingMessage(message);
                }
              }
            }
          }
        }
      }
      
      res.sendStatus(200);
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.sendStatus(500);
    }
  });

  // Feeding Plans
  app.get('/api/feeding-plans', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const feedingPlans = await storage.getFeedingPlans(userId);
      res.json(feedingPlans);
    } catch (error) {
      console.error("Error fetching feeding plans:", error);
      res.status(500).json({ message: "Failed to fetch feeding plans" });
    }
  });

  app.post('/api/feeding-plans', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const planData = req.body;
      
      // Validate the pet belongs to user
      const pet = await storage.getPet(planData.petId);
      if (!pet || pet.ownerId !== userId) {
        return res.status(403).json({ message: "Pet not found or access denied" });
      }

      const feedingPlan = await storage.createFeedingPlan(planData);
      res.status(201).json(feedingPlan);
    } catch (error) {
      console.error("Error creating feeding plan:", error);
      res.status(500).json({ message: "Failed to create feeding plan" });
    }
  });

  app.get('/api/feeding-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const feedingPlan = await storage.getFeedingPlan(id);
      
      if (!feedingPlan) {
        return res.status(404).json({ message: "Feeding plan not found" });
      }

      // Check if user owns the pet
      if (feedingPlan.pet?.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(feedingPlan);
    } catch (error) {
      console.error("Error fetching feeding plan:", error);
      res.status(500).json({ message: "Failed to fetch feeding plan" });
    }
  });

  app.put('/api/feeding-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;
      
      const existingPlan = await storage.getFeedingPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Feeding plan not found" });
      }

      // Check if user owns the pet
      if (existingPlan.pet?.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedPlan = await storage.updateFeedingPlan(id, updates);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating feeding plan:", error);
      res.status(500).json({ message: "Failed to update feeding plan" });
    }
  });

  app.delete('/api/feeding-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const existingPlan = await storage.getFeedingPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Feeding plan not found" });
      }

      // Check if user owns the pet
      if (existingPlan.pet?.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteFeedingPlan(id);
      res.json({ message: "Feeding plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting feeding plan:", error);
      res.status(500).json({ message: "Failed to delete feeding plan" });
    }
  });

  // Notifications
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function handleIncomingMessage(message: any) {
  const from = message.from;
  const text = message.text?.body?.toLowerCase();
  
  if (!text) return;
  
  // Handle text commands
  if (text.includes('stop') || text.includes('durdur')) {
    // Handle opt-out
    console.log(`User ${from} opted out of WhatsApp`);
    // Update user whatsappOptIn to false
  } else if (text.includes('confirm') || text.includes('onayla')) {
    // Handle confirmation
    console.log(`User ${from} confirmed reminder`);
  } else if (text.includes('snooze') || text.includes('ertele')) {
    // Handle snooze
    const days = text.match(/(\d+)/)?.[1] || '7';
    console.log(`User ${from} snoozed for ${days} days`);
  }
}
