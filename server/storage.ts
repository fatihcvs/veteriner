import {
  users,
  clinics,
  pets,
  vaccines,
  vaccinationEvents,
  foodProducts,
  feedingPlans,
  orders,
  orderItems,
  notifications,
  appointments,
  petOwnerProfiles,
  type User,
  type UpsertUser,
  type Pet,
  type InsertPet,
  type Vaccine,
  type InsertVaccine,
  type VaccinationEvent,
  type InsertVaccinationEvent,
  type FoodProduct,
  type InsertFoodProduct,
  type Order,
  type InsertOrder,
  type Appointment,
  type InsertAppointment,
  type Notification,
  type InsertNotification,
  type PetOwnerProfile,
  type InsertPetOwnerProfile,
  type UpdateUserProfile,
  type UpdatePetOwnerProfile,
} from '@shared/schema';
import { randomUUID } from 'crypto';

// Interface for storage operations
export interface IStorage {
  // User operations (for email-based auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUserProfile): Promise<User>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<PetOwnerProfile | undefined>;
  createUserProfile(userId: string, profile: UpdatePetOwnerProfile): Promise<PetOwnerProfile>;
  updateUserProfile(userId: string, profile: UpdatePetOwnerProfile): Promise<PetOwnerProfile>;
  
  // Clinic operations
  getClinic(id: string): Promise<any | undefined>;
  createClinic(clinic: any): Promise<any>;
  getUserClinics(userId: string): Promise<any[]>;
  
  // Pet operations
  getPet(id: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  getClinicPets(clinicId: string): Promise<Pet[]>;
  getUserPets(userId: string): Promise<Pet[]>;
  updatePet(id: string, updates: Partial<Pet>): Promise<Pet>;
  
  // Vaccination operations
  getVaccines(): Promise<Vaccine[]>;
  createVaccine(vaccine: InsertVaccine): Promise<Vaccine>;
  getVaccinationEvent(id: string): Promise<VaccinationEvent | undefined>;
  createVaccinationEvent(event: InsertVaccinationEvent): Promise<VaccinationEvent>;
  getPetVaccinations(petId: string): Promise<VaccinationEvent[]>;
  getOverdueVaccinations(clinicId: string): Promise<any[]>;
  
  // Product operations
  getFoodProducts(clinicId?: string): Promise<FoodProduct[]>;
  createFoodProduct(product: InsertFoodProduct): Promise<FoodProduct>;
  updateProductStock(productId: string, quantity: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<any | undefined>;
  getUserOrders(userId: string): Promise<any[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getClinicAppointments(clinicId: string, date?: string): Promise<any[]>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  
  // Feeding plan operations
  createFeedingPlan(plan: any): Promise<any>;
  getFeedingPlans(userId?: string, clinicId?: string): Promise<any[]>;
  getFeedingPlan(id: string): Promise<any | undefined>;
  updateFeedingPlan(id: string, updates: any): Promise<any>;
  deleteFeedingPlan(id: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationSent(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private clinics = new Map<string, any>();
  private clinicMembers = new Map<string, any>();
  private petOwnerProfiles = new Map<string, PetOwnerProfile>();
  private pets = new Map<string, Pet>();
  private vaccines = new Map<string, Vaccine>();
  private vaccinationEvents = new Map<string, VaccinationEvent>();
  private foodProducts = new Map<string, FoodProduct>();
  private feedingPlans = new Map<string, any>();
  private orders = new Map<string, Order>();
  private orderItems = new Map<string, any>();
  private appointments = new Map<string, Appointment>();
  private notifications = new Map<string, Notification>();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create sample vaccines
    const vaccines = [
      {
        id: randomUUID(),
        name: 'Rabies Vaccine',
        species: 'DOG',
        defaultIntervalDays: 365,
        manufacturer: 'Nobivac',
        description: 'Kuduz aşısı',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'DHPP Vaccine',
        species: 'DOG',
        defaultIntervalDays: 365,
        manufacturer: 'Vanguard',
        description: 'Karma köpek aşısı',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'FVRCP Vaccine',
        species: 'CAT',
        defaultIntervalDays: 365,
        manufacturer: 'Purevax',
        description: 'Karma kedi aşısı',
        createdAt: new Date(),
      },
    ];

    vaccines.forEach(vaccine => {
      this.vaccines.set(vaccine.id, vaccine);
    });

    // Create sample food products
    const products = [
      {
        id: randomUUID(),
        name: 'Royal Canin Adult',
        brand: 'Royal Canin',
        packageSizeGrams: 15000,
        species: 'DOG',
        sku: 'RC-DOG-ADULT-15',
        price: '245.00',
        stockQty: 12,
        description: 'Yetişkin köpekler için premium mama',
        images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Feline Vaccine Kit',
        brand: 'Nobivac',
        packageSizeGrams: null,
        species: 'CAT',
        sku: 'NB-CAT-VAC-KIT',
        price: '85.00',
        stockQty: 3,
        description: 'Kedi aşı seti',
        images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Vitamin Takviyeleri',
        brand: 'VitaPet',
        packageSizeGrams: 500,
        species: 'DOG',
        sku: 'VP-VIT-DOG-500',
        price: '120.00',
        stockQty: 25,
        description: 'Köpekler için vitamin takviyeleri',
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    products.forEach(product => {
      this.foodProducts.set(product.id, product);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        id: randomUUID(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  async updateUser(id: string, updates: UpdateUserProfile): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<PetOwnerProfile | undefined> {
    return Array.from(this.petOwnerProfiles.values()).find(p => p.userId === userId);
  }

  async createUserProfile(userId: string, profile: UpdatePetOwnerProfile): Promise<PetOwnerProfile> {
    const newProfile: PetOwnerProfile = {
      id: randomUUID(),
      userId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.petOwnerProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: UpdatePetOwnerProfile): Promise<PetOwnerProfile> {
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      const updatedProfile = { ...existingProfile, ...profile, updatedAt: new Date() };
      this.petOwnerProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    } else {
      return this.createUserProfile(userId, profile);
    }
  }

  // Clinic operations
  async getClinic(id: string): Promise<any | undefined> {
    return this.clinics.get(id);
  }

  async createClinic(clinicData: any): Promise<any> {
    const clinic = {
      id: randomUUID(),
      ...clinicData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clinics.set(clinic.id, clinic);
    return clinic;
  }

  async getUserClinics(userId: string): Promise<any[]> {
    return Array.from(this.clinicMembers.values())
      .filter(member => member.userId === userId)
      .map(member => this.clinics.get(member.clinicId))
      .filter(Boolean);
  }

  // Pet operations
  async getPet(id: string): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async createPet(petData: InsertPet): Promise<Pet> {
    const pet: Pet = {
      id: randomUUID(),
      ...petData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pet;
    this.pets.set(pet.id, pet);
    return pet;
  }

  async getClinicPets(clinicId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.clinicId === clinicId);
  }

  async getUserPets(userId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.ownerId === userId);
  }

  async updatePet(id: string, updates: Partial<Pet>): Promise<Pet> {
    const pet = this.pets.get(id);
    if (!pet) throw new Error('Pet not found');
    
    const updatedPet = { ...pet, ...updates, updatedAt: new Date() };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  // Vaccination operations
  async getVaccines(): Promise<Vaccine[]> {
    return Array.from(this.vaccines.values());
  }

  async createVaccine(vaccineData: InsertVaccine): Promise<Vaccine> {
    const vaccine: Vaccine = {
      id: randomUUID(),
      ...vaccineData,
      createdAt: new Date(),
    } as Vaccine;
    this.vaccines.set(vaccine.id, vaccine);
    return vaccine;
  }

  async getVaccinationEvent(id: string): Promise<VaccinationEvent | undefined> {
    return this.vaccinationEvents.get(id);
  }

  async createVaccinationEvent(eventData: InsertVaccinationEvent): Promise<VaccinationEvent> {
    const event: VaccinationEvent = {
      id: randomUUID(),
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as VaccinationEvent;
    this.vaccinationEvents.set(event.id, event);
    return event;
  }

  async getPetVaccinations(petId: string): Promise<VaccinationEvent[]> {
    return Array.from(this.vaccinationEvents.values()).filter(event => event.petId === petId);
  }

  async getOverdueVaccinations(clinicId: string): Promise<any[]> {
    const clinicPets = await this.getClinicPets(clinicId);
    const now = new Date();
    
    return Array.from(this.vaccinationEvents.values())
      .filter(event => {
        const pet = clinicPets.find(p => p.id === event.petId);
        return pet && event.nextDueAt && new Date(event.nextDueAt) < now;
      })
      .map(event => {
        const pet = clinicPets.find(p => p.id === event.petId);
        const vaccine = this.vaccines.get(event.vaccineId);
        return { ...event, pet, vaccine };
      });
  }

  // Product operations
  async getFoodProducts(clinicId?: string): Promise<FoodProduct[]> {
    return Array.from(this.foodProducts.values()).filter(product => 
      !clinicId || product.clinicId === null || product.clinicId === clinicId
    );
  }

  async createFoodProduct(productData: InsertFoodProduct): Promise<FoodProduct> {
    const product: FoodProduct = {
      id: randomUUID(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FoodProduct;
    this.foodProducts.set(product.id, product);
    return product;
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    const product = this.foodProducts.get(productId);
    if (product) {
      product.stockQty = (product.stockQty || 0) + quantity;
      product.updatedAt = new Date();
      this.foodProducts.set(productId, product);
    }
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const order: Order = {
      id: randomUUID(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;
    this.orders.set(order.id, order);
    return order;
  }

  async getOrder(id: string): Promise<any | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: string): Promise<any[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      this.orders.set(id, order);
    }
  }

  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      id: randomUUID(),
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Appointment;
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getClinicAppointments(clinicId: string, date?: string): Promise<any[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => {
        if (appointment.clinicId !== clinicId) return false;
        if (date) {
          const appointmentDate = new Date(appointment.scheduledAt).toISOString().split('T')[0];
          return appointmentDate === date;
        }
        return true;
      })
      .map(appointment => {
        const pet = this.pets.get(appointment.petId);
        const vet = this.users.get(appointment.vetUserId);
        const owner = pet ? this.users.get(pet.ownerId) : null;
        return { ...appointment, pet, vet, owner };
      });
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error('Appointment not found');
    
    const updatedAppointment = { ...appointment, ...updates, updatedAt: new Date() };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      ...notificationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Notification;
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => notification.userId === userId);
  }

  async markNotificationSent(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = 'SENT';
      notification.sentAt = new Date();
      notification.updatedAt = new Date();
      this.notifications.set(id, notification);
    }
  }

  // Feeding plan operations
  async createFeedingPlan(planData: any): Promise<any> {
    const plan = {
      id: randomUUID(),
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.feedingPlans.set(plan.id, plan);
    return plan;
  }

  async getFeedingPlans(userId?: string, clinicId?: string): Promise<any[]> {
    return Array.from(this.feedingPlans.values())
      .filter(plan => {
        if (userId) {
          const pet = this.pets.get(plan.petId);
          if (!pet || pet.ownerId !== userId) return false;
        }
        if (clinicId) {
          const pet = this.pets.get(plan.petId);
          if (!pet || pet.clinicId !== clinicId) return false;
        }
        return plan.active;
      })
      .map(plan => {
        const pet = this.pets.get(plan.petId);
        const foodProduct = this.foodProducts.get(plan.foodProductId);
        return { ...plan, pet, foodProduct };
      });
  }

  async getFeedingPlan(id: string): Promise<any | undefined> {
    const plan = this.feedingPlans.get(id);
    if (plan) {
      const pet = this.pets.get(plan.petId);
      const foodProduct = this.foodProducts.get(plan.foodProductId);
      return { ...plan, pet, foodProduct };
    }
    return undefined;
  }

  async updateFeedingPlan(id: string, updates: any): Promise<any> {
    const plan = this.feedingPlans.get(id);
    if (!plan) throw new Error('Feeding plan not found');
    
    const updatedPlan = { ...plan, ...updates, updatedAt: new Date() };
    this.feedingPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteFeedingPlan(id: string): Promise<void> {
    this.feedingPlans.delete(id);
  }
}

export const storage = new MemStorage();
