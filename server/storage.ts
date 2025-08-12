import {
  users,
  clinics,
  clinicMembers,
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
  type UpdatePet,
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
import { db } from './db';
import { eq, sql, desc, and, gte, lt, or } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

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
  getAllPetsWithOwners(): Promise<any[]>;
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
  
  // Inventory operations
  getInventoryItems(clinicId?: string): Promise<any[]>;
  createInventoryItem(item: any): Promise<any>;
  updateInventoryItem(id: string, updates: any): Promise<any>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<any | undefined>;
  getUserOrders(userId: string): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getClinicAppointments(clinicId: string, date?: string): Promise<any[]>;
  getClinicAllAppointments(clinicId: string): Promise<any[]>;
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
  getAllNotifications(): Promise<Notification[]>;
  markNotificationSent(id: string): Promise<void>;
  markNotificationRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  updateNotificationStatus(id: string, status: string): Promise<Notification>;
  getNotificationStats(): Promise<any>;
  
  // Staff operations
  getStaffMembers(clinicId?: string): Promise<any[]>;
  getStaffMember(staffId: string): Promise<any | undefined>;
  createStaffMember(staffData: any): Promise<any>;
  updateStaffMember(staffId: string, updates: any): Promise<any>;
  deleteStaffMember(staffId: string): Promise<void>;
  getStaffStats(): Promise<any>;

  // Admin operations
  getAdminStats(): Promise<any>;
  getAllUsers(): Promise<any[]>;
  updateUserByAdmin(userId: string, updates: any): Promise<User | undefined>;
  deleteUser(userId: string): Promise<void>;
  getAllClinics(): Promise<any[]>;
  updateClinic(clinicId: string, updates: any): Promise<any>;
  getAllPetsWithOwners(): Promise<any[]>;
  updatePetByAdmin(petId: string, updates: any): Promise<Pet | undefined>;
  createPetByAdmin(petData: any): Promise<Pet>;
  deletePet(petId: string): Promise<void>;
  getSystemLogs(): Promise<any[]>;
  createSystemBackup(): Promise<any>;
  restoreSystemBackup(backupId: string): Promise<any>;
  updateSystemSettings(settings: any): Promise<any>;
  getSystemSettings(): Promise<any>;
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
  public sessionStore: any = null;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create admin user
    const adminUser = {
      id: 'admin-user-id',
      email: 'admin@vettrack.pro',
      password: '78b7f6c9abf008e9b60bc50a789c4c80c30d62484c61520760e59af055744e0d1fe73161c0e2fcf8dd6af83a9b0650b5c3d9117e90e0f0f11187b9fe4c65eb31.61a87298444f26f09aa2df8684673d21', // hashed: admin123
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+90 555 123 4567',
      whatsappPhone: '+90 555 123 4567',
      whatsappOptIn: true,
      locale: 'tr',
      role: 'SUPER_ADMIN',
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create admin clinic
    const adminClinic = {
      id: 'admin-clinic-id',
      name: 'VetTrack Pro Admin Klinik',
      address: 'İstanbul, Türkiye',
      phone: '+90 555 123 4567',
      timeZone: 'Europe/Istanbul',
      locale: 'tr',
      ownerUserId: adminUser.id,
      whatsappBusinessNumber: '+90 555 123 4567',
      whatsappProvider: 'META',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clinics.set(adminClinic.id, adminClinic);

    // Add admin as clinic member
    const adminMembership = {
      id: 'admin-membership-id',
      clinicId: adminClinic.id,
      userId: adminUser.id,
      role: 'CLINIC_ADMIN',
      createdAt: new Date(),
    };
    this.clinicMembers.set(adminMembership.id, adminMembership);

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

    // Top 10 trending pet products for 2024 based on market research
    const products = [
      {
        id: randomUUID(),
        name: 'Akıllı Otomatik Besleyici Pro',
        brand: 'PetSafe',
        packageSizeGrams: null,
        species: 'DOG',
        sku: 'PS-SMART-FEEDER-PRO',
        price: '899.00',
        stockQty: 15,
        description: 'Akıllı telefon uygulaması ile kontrol edilebilen otomatik besleyici. Portion kontrolü, zamanlayıcı ve video kamera özellikli. 2024\'ün en çok satan akıllı pet ürünü (%200 satış artışı).',
        images: ['https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Premium Organik Köpek Maması',
        brand: 'The Farmer\'s Dog',
        packageSizeGrams: 12000,
        species: 'DOG',
        sku: 'TFD-ORGANIC-PREMIUM-12KG',
        price: '680.00',
        stockQty: 25,
        description: 'Taze, organik malzemelerle hazırlanmış premium köpek maması. Tahılsız, yüksek protein içerikli. Veteriner hekim onaylı, %8.4 pazar büyümesi ile 2024\'ün en çok tercih edilen premium maması.',
        images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'İnteraktif Puzzle Oyuncak Seti',
        brand: 'Nina Ottosson',
        packageSizeGrams: 800,
        species: 'DOG',
        sku: 'NO-PUZZLE-SET-ADV',
        price: '289.00',
        stockQty: 35,
        description: 'Zihinsel stimülasyon sağlayan interaktif puzzle oyuncak seti. 3 farklı zorluk seviyesi, BPA-free malzeme. Köpeklerin zekasını geliştiren, %30 satış artışı gösteren trend ürün.',
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'GPS Takip Akıllı Tasma',
        brand: 'Whistle Go',
        packageSizeGrams: 150,
        species: 'DOG',
        sku: 'WG-GPS-TRACKER-V3',
        price: '1250.00',
        stockQty: 18,
        description: 'Real-time GPS takip, aktivite monitörü ve sağlık takibi özellikli akıllı tasma. Su geçirmez, 20 gün pil ömrü. %40 pazar büyümesi ile güvenlik kategorisinin lideri.',
        images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Premium Kedi Yaş Maması Çeşit Paketi',
        brand: 'Sheba Perfect Portions',
        packageSizeGrams: 2400,
        species: 'CAT',
        sku: 'SPP-VARIETY-PACK-24',
        price: '189.00',
        stockQty: 40,
        description: '24 adet çeşitli lezzetlerde premium kedi yaş maması. Porsiyon kontrollü, fresh sealed paketlerde. %5.8 kategori büyümesi ile Amazon\'un en çok satan kedi maması.',
        images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'CBD Sakinleştirici Köpek Bisküvisi',
        brand: 'Honest Paws',
        packageSizeGrams: 450,
        species: 'DOG',
        sku: 'HP-CBD-CALM-TREATS',
        price: '425.00',
        stockQty: 22,
        description: 'Doğal CBD içerikli sakinleştirici bisküvi. Kaygı ve stres azaltıcı, veteriner onaylı. %48 kullanıcı tercihi ile trend wellness kategorisinin yükselen ürünü.',
        images: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Otomatik Kedi Tuvaleti Pro',
        brand: 'Litter Robot 4',
        packageSizeGrams: null,
        species: 'CAT',
        sku: 'LR4-AUTO-LITTER-PRO',
        price: '3200.00',
        stockQty: 8,
        description: 'Self-cleaning otomatik kedi tuvaleti. App kontrollü, çoklu kedi desteği, koku kontrol sistemi. Luxury pet tech kategorisinin premium ürünü, %35 segment büyümesi.',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Doğal Dental Çiğneme Kemikleri',
        brand: 'Greenies',
        packageSizeGrams: 1020,
        species: 'DOG',
        sku: 'GR-DENTAL-CHEWS-36CT',
        price: '156.00',
        stockQty: 45,
        description: '36 adet doğal dental çiğneme kemiği. Diş temizliği ve ağız kokusuna karşı etkili. Veteriner diş hekimi onaylı, Amazon best-seller kategorisinde 1 numaralı ürün.',
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Eco-Friendly Kedi Mobilya Seti',
        brand: 'Catit Vesper',
        packageSizeGrams: null,
        species: 'CAT',
        sku: 'CV-ECO-FURNITURE-SET',
        price: '1450.00',
        stockQty: 12,
        description: 'Sürdürülebilir malzemelerden üretilmiş modern kedi mobilya seti. Tırmalama, uyku ve oyun alanları. %51 pet sahibi eco-friendly ürünler için premium ödemeye hazır.',
        images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Pet Monitoring Kamera 360°',
        brand: 'Furbo',
        packageSizeGrams: null,
        species: 'DOG',
        sku: 'FB-360-PET-CAM-PRO',
        price: '1890.00',
        stockQty: 20,
        description: '360° döner pet kamera. İki yönlü ses, gece görüş, treat atma özelliği ve AI powered barking alert. Pet monitoring kategorisinde %7.63 yıllık büyüme lideri.',
        images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        clinicId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    products.forEach(product => {
      this.foodProducts.set(product.id, product);
    });

    // Create sample users and pets for demonstration
    this.createSampleUsersAndPets();
  }

  private createSampleUsersAndPets() {
    // Sample users with Turkish names
    const sampleUsers = [
      {
        id: 'user1',
        email: 'mehmet.kaya@email.com',
        password: '78b7f6c9abf008e9b60bc50a789c4c80c30d62484c61520760e59af055744e0d1fe73161c0e2fcf8dd6af83a9b0650b5c3d9117e90e0f0f11187b9fe4c65eb31.61a87298444f26f09aa2df8684673d21',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        phone: '+90 532 111 1111',
        whatsappPhone: '+90 532 111 1111',
        whatsappOptIn: true,
        locale: 'tr',
        role: 'PET_OWNER',
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user2',
        email: 'ayse.demir@email.com',
        password: '78b7f6c9abf008e9b60bc50a789c4c80c30d62484c61520760e59af055744e0d1fe73161c0e2fcf8dd6af83a9b0650b5c3d9117e90e0f0f11187b9fe4c65eb31.61a87298444f26f09aa2df8684673d21',
        firstName: 'Ayşe',
        lastName: 'Demir',
        phone: '+90 533 222 2222',
        whatsappPhone: '+90 533 222 2222',
        whatsappOptIn: true,
        locale: 'tr',
        role: 'PET_OWNER',
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user3',
        email: 'can.ozkan@email.com',
        password: '78b7f6c9abf008e9b60bc50a789c4c80c30d62484c61520760e59af055744e0d1fe73161c0e2fcf8dd6af83a9b0650b5c3d9117e90e0f0f11187b9fe4c65eb31.61a87298444f26f09aa2df8684673d21',
        firstName: 'Can',
        lastName: 'Özkan',
        phone: '+90 534 333 3333',
        whatsappPhone: '+90 534 333 3333',
        whatsappOptIn: true,
        locale: 'tr',
        role: 'PET_OWNER',
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample users to storage
    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Sample pets with Turkish names
    const samplePets = [
      {
        id: randomUUID(),
        name: 'Karabaş',
        species: 'DOG',
        breed: 'Golden Retriever',
        birthDate: '2020-05-15',
        gender: 'MALE',
        weightKg: '32.5',
        isNeutered: false,
        microchipId: 'TR001234567890',
        ownerId: 'user1',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok enerjik ve sevimli bir köpek',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Pamuk',
        species: 'CAT',
        breed: 'Ankara Kedisi',
        birthDate: '2019-08-20',
        gender: 'FEMALE',
        weightKg: '4.2',
        isNeutered: true,
        microchipId: 'TR001234567891',
        ownerId: 'user1',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok sakin ve uyumlu bir kedi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Bruno',
        species: 'DOG',
        breed: 'Labrador',
        birthDate: '2021-03-10',
        gender: 'MALE',
        weightKg: '28.0',
        isNeutered: false,
        microchipId: 'TR001234567892',
        ownerId: 'user2',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok akıllı ve itaatkar bir köpek',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Minnoş',
        species: 'CAT',
        breed: 'British Shorthair',
        birthDate: '2020-12-05',
        gender: 'FEMALE',
        weightKg: '5.8',
        isNeutered: true,
        microchipId: 'TR001234567893',
        ownerId: 'user2',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok sevecen ve oyuncu bir kedi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Tarçın',
        species: 'RABBIT',
        breed: 'Holland Lop',
        birthDate: '2022-01-15',
        gender: 'FEMALE',
        weightKg: '1.8',
        isNeutered: false,
        microchipId: 'TR001234567894',
        ownerId: 'user3',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok sevimli ve sakin bir tavşan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Cıvıl',
        species: 'BIRD',
        breed: 'Muhabbet Kuşu',
        birthDate: '2023-06-01',
        gender: 'MALE',
        weightKg: '0.04',
        isNeutered: false,
        microchipId: 'TR001234567895',
        ownerId: 'user3',
        clinicId: 'admin-clinic-id',
        images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        description: 'Çok konuşkan ve eğlenceli bir muhabbet kuşu',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample pets to storage
    samplePets.forEach(pet => {
      this.pets.set(pet.id, pet);
    });

    // Create sample pet owner profiles
    const sampleProfiles = [
      {
        id: randomUUID(),
        userId: 'user1',
        address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
        city: 'İstanbul',
        postalCode: '34710',
        emergencyContactName: 'Fatma Kaya',
        emergencyContactPhone: '+90 532 111 1112',
        veterinarianPreference: 'Dr. Ali Yılmaz',
        notes: 'Köpek alerjisi var, dikkatli olunmalı',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: 'user2',
        address: 'Nispetiye Caddesi No:456, Levent, İstanbul',
        city: 'İstanbul',
        postalCode: '34330',
        emergencyContactName: 'Mustafa Demir',
        emergencyContactPhone: '+90 533 222 2223',
        veterinarianPreference: 'Dr. Zeynep Kaya',
        notes: 'Kedi ve köpek sahibi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: 'user3',
        address: 'Atatürk Bulvarı No:789, Çankaya, Ankara',
        city: 'Ankara',
        postalCode: '06680',
        emergencyContactName: 'Elif Özkan',
        emergencyContactPhone: '+90 534 333 3334',
        veterinarianPreference: 'Dr. Mehmet Öz',
        notes: 'Tavşan ve kuş uzmanı tercih ediyor',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample profiles to storage
    sampleProfiles.forEach(profile => {
      this.petOwnerProfiles.set(profile.id, profile);
    });

    // Create sample appointments
    const sampleAppointments = [
      {
        id: randomUUID(),
        petId: samplePets[0].id, // Karabaş
        clinicId: 'admin-clinic-id',
        vetUserId: 'admin-user-id',
        appointmentDate: new Date('2025-08-15T10:00:00'),
        duration: 30,
        purpose: 'Aşı kontrolü',
        notes: 'Yıllık aşı kontrolü için',
        status: 'SCHEDULED',
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        petId: samplePets[1].id, // Pamuk
        clinicId: 'admin-clinic-id',
        vetUserId: 'admin-user-id',
        appointmentDate: new Date('2025-08-13T14:30:00'),
        duration: 45,
        purpose: 'Genel muayene',
        notes: 'Kilo kontrolü ve genel sağlık muayenesi',
        status: 'COMPLETED',
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        petId: samplePets[2].id, // Bruno
        clinicId: 'admin-clinic-id',
        vetUserId: 'admin-user-id',
        appointmentDate: new Date('2025-08-14T09:15:00'),
        duration: 60,
        purpose: 'Diş kontrolü',
        notes: 'Diş taşı temizliği gerekli',
        status: 'SCHEDULED',
        createdBy: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample appointments to storage
    sampleAppointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });

    // Create sample orders
    const sampleOrders = [
      {
        id: randomUUID(),
        userId: 'user1',
        totalAmount: '450.00',
        shippingAddress: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
        status: 'DELIVERED',
        createdAt: new Date('2025-08-10T12:00:00'),
        updatedAt: new Date('2025-08-11T16:30:00'),
      },
      {
        id: randomUUID(),
        userId: 'user2',
        totalAmount: '1275.00',
        shippingAddress: 'Nispetiye Caddesi No:456, Levent, İstanbul',
        status: 'PENDING',
        createdAt: new Date('2025-08-12T14:20:00'),
        updatedAt: new Date('2025-08-12T14:20:00'),
      },
      {
        id: randomUUID(),
        userId: 'user3',
        totalAmount: '180.00',
        shippingAddress: 'Atatürk Bulvarı No:789, Çankaya, Ankara',
        status: 'SHIPPED',
        createdAt: new Date('2025-08-11T09:45:00'),
        updatedAt: new Date('2025-08-12T10:15:00'),
      },
    ];

    // Add sample orders to storage
    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });

    // Create sample vaccination events
    const sampleVaccinations = [
      {
        id: randomUUID(),
        petId: samplePets[0].id, // Karabaş
        vaccineId: Array.from(this.vaccines.values())[0].id, // Rabies Vaccine
        vetUserId: 'admin-user-id',
        administeredAt: new Date('2024-08-15'),
        nextDueAt: new Date('2025-08-15'),
        lotNo: 'RAB2024001',
        status: 'DONE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        petId: samplePets[2].id, // Bruno
        vaccineId: Array.from(this.vaccines.values())[1].id, // DHPP Vaccine
        vetUserId: 'admin-user-id',
        administeredAt: new Date('2024-03-20'),
        nextDueAt: new Date('2025-03-20'),
        lotNo: 'DHPP2024005',
        status: 'DONE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Add sample vaccinations to storage
    sampleVaccinations.forEach(vaccination => {
      this.vaccinationEvents.set(vaccination.id, vaccination);
    });

    // Create sample notifications
    const sampleNotifications = [
      {
        id: 'notification-1',
        userId: 'user-owner-1', // Ahmet Yılmaz
        clinicId: 'main-clinic-id',
        type: 'VACCINATION_REMINDER',
        title: 'Aşı Hatırlatması - Karabaş',
        body: 'Sevgili Ahmet Bey, köpeğiniz Karabaş için kuduz aşısının zamanı geldi. Lütfen 5 gün içinde kliniğimize gelmenizi rica ederiz.',
        channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'PENDING',
        meta: {
          petName: 'Karabaş',
          vaccineType: 'Kuduz',
          petId: 'pet-1'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'notification-2',
        userId: 'user-owner-2', // Zeynep Demir
        clinicId: 'main-clinic-id',
        type: 'APPOINTMENT_REMINDER',
        title: 'Randevu Hatırlatması - Pamuk',
        body: 'Merhaba Zeynep Hanım, kedişiniz Pamuk için yarın saat 14:00\'te randevunuz bulunmaktadır. Kontrol muayenesi için bekleriz.',
        channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
        status: 'SENT',
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        meta: {
          petName: 'Pamuk',
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          appointmentTime: '14:00',
          petId: 'pet-2'
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: 'notification-3',
        userId: 'user-owner-3', // Mehmet Kaya
        clinicId: 'main-clinic-id',
        type: 'FOOD_DEPLETION',
        title: 'Mama Stoku Azalıyor - Bruno',
        body: 'Merhaba Mehmet Bey, köpeğiniz Bruno için sipariş ettiğiniz Royal Canin mama stokunuz %20 seviyesine düştü. Yeni sipariş vermek ister misiniz?',
        channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        status: 'PENDING',
        meta: {
          petName: 'Bruno',
          foodProduct: 'Royal Canin Adult',
          stockLevel: 20,
          petId: 'pet-3'
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: 'notification-4',
        userId: 'user-owner-4', // Fatma Öz
        clinicId: 'main-clinic-id',
        type: 'ORDER_UPDATE',
        title: 'Sipariş Kargoya Verildi',
        body: 'Merhaba Fatma Hanım, #3 numaralı siparişiniz kargoya verilmiştir. Kargo takip numaranız: TR123456789. Tahmini teslimat süresi 2-3 iş günüdür.',
        channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
        scheduledFor: new Date(),
        status: 'SENT',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        meta: {
          orderNumber: '3',
          trackingNumber: 'TR123456789',
          deliveryEstimate: '2-3 iş günü',
          orderId: 'order-3'
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'notification-5',
        userId: 'admin-user-id', // Admin user
        clinicId: 'main-clinic-id',
        type: 'SYSTEM',
        title: 'Sistem Güncellemesi',
        body: 'VetTrack Pro sistemimiz bu gece 02:00-04:00 arası güncellenecektir. Bu süre zarfında sisteme erişim sınırlı olabilir.',
        channels: ['EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        status: 'PENDING',
        meta: {
          maintenanceStart: new Date(Date.now() + 8 * 60 * 60 * 1000),
          maintenanceEnd: new Date(Date.now() + 10 * 60 * 60 * 1000),
          affectedServices: ['web', 'mobile']
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'notification-6',
        userId: 'user-owner-5', // Ayşe Çelik
        clinicId: 'main-clinic-id',
        type: 'CUSTOM',
        title: 'Kış Bakım Önerileri',
        body: 'Sevgili Ayşe Hanım, kuşunuz Minnoş için kış aylarında dikkat edilmesi gereken hususlar hakkında bilgilendirme broşürümüzü randevunuzda size vereceğiz.',
        channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        status: 'PENDING',
        meta: {
          petName: 'Minnoş',
          petSpecies: 'BIRD',
          seasonalCare: 'winter',
          petId: 'pet-5'
        },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      // Add notifications for admin user
      {
        id: 'notification-admin-1',
        userId: 'admin-user-id', // Admin user
        clinicId: 'main-clinic-id',
        type: 'SYSTEM',
        title: 'Günlük Rapor Hazır',
        body: 'Bugünün hasta raporu hazır. 8 randevu tamamlandı, 3 yeni kayıt oluşturuldu.',
        channels: ['EMAIL', 'IN_APP'],
        scheduledFor: new Date(),
        status: 'SENT',
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        meta: {
          appointmentsCompleted: 8,
          newRegistrations: 3,
          reportType: 'daily'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'notification-admin-2',
        userId: 'admin-user-id', // Admin user
        clinicId: 'main-clinic-id',
        type: 'VACCINATION_REMINDER',
        title: 'Toplu Aşı Hatırlatması',
        body: 'Bu hafta 5 hastanın aşı zamanı geldi. Detaylar için aşı takip bölümünü kontrol edin.',
        channels: ['EMAIL', 'IN_APP'],
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'PENDING',
        meta: {
          petsCount: 5,
          weeklyReminder: true
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      }
    ];

    sampleNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
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

  async getUserPets(userId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.ownerId === userId);
  }

  async getAllPetsWithOwners(): Promise<any[]> {
    return Array.from(this.pets.values()).map(pet => {
      const owner = this.users.get(pet.ownerId);
      return {
        ...pet,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
        ownerEmail: owner?.email || '',
        ownerPhone: owner?.phone || ''
      };
    });
  }

  async getClinicPets(clinicId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.clinicId === clinicId);
  }

  async updatePet(id: string, updates: UpdatePet): Promise<Pet> {
    const pet = this.pets.get(id);
    if (!pet) throw new Error('Pet not found');
    
    const updatedPet = { ...pet, ...updates, updatedAt: new Date() };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  async deletePet(id: string): Promise<void> {
    const pet = this.pets.get(id);
    if (!pet) throw new Error('Pet not found');
    
    this.pets.delete(id);
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
  
  async getInventoryItems(clinicId?: string): Promise<any[]> {
    const products = await this.getFoodProducts(clinicId);
    
    return products.map(product => {
      const currentStock = product.stockQty || 0;
      const minimumStock = 10; // Default minimum stock
      const maximumStock = 100; // Default maximum stock
      
      let status = 'IN_STOCK';
      if (currentStock === 0) status = 'OUT_OF_STOCK';
      else if (currentStock <= minimumStock) status = 'LOW_STOCK';
      
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: 'FOOD', // Since these are food products
        sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
        currentStock,
        minimumStock,
        maximumStock,
        unit: product.packageSizeGrams ? 'gram' : 'adet',
        price: product.price,
        costPrice: (parseFloat(product.price) * 0.7).toFixed(2), // Estimated cost price
        supplier: product.brand,
        location: 'Depo A',
        expiryDate: null, // Food products don't have expiry in current schema
        lastRestocked: product.updatedAt?.toISOString().split('T')[0],
        status,
        description: product.description,
        images: product.images || [],
      };
    });
  }
  
  async createInventoryItem(itemData: any): Promise<any> {
    // Convert inventory item to food product
    const productData = {
      name: itemData.name,
      brand: itemData.brand,
      packageSizeGrams: itemData.unit === 'gram' ? 1000 : null,
      species: 'DOG', // Default
      sku: itemData.sku,
      price: itemData.price,
      stockQty: itemData.currentStock,
      description: itemData.description || '',
      images: itemData.images || [],
      clinicId: null,
    };
    
    const product = await this.createFoodProduct(productData);
    return this.getInventoryItems().then(items => 
      items.find(item => item.id === product.id)
    );
  }
  
  async updateInventoryItem(id: string, updates: any): Promise<any> {
    const product = this.foodProducts.get(id);
    if (!product) throw new Error('Inventory item not found');
    
    // Update the food product with inventory data
    const updatedProduct = {
      ...product,
      name: updates.name || product.name,
      brand: updates.brand || product.brand,
      price: updates.price || product.price,
      stockQty: updates.currentStock !== undefined ? updates.currentStock : product.stockQty,
      description: updates.description || product.description,
      updatedAt: new Date(),
    };
    
    this.foodProducts.set(id, updatedProduct);
    
    return this.getInventoryItems().then(items => 
      items.find(item => item.id === id)
    );
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

  async getAllOrders(): Promise<any[]> {
    return Array.from(this.orders.values()).map(order => {
      const user = this.users.get(order.userId);
      return {
        ...order,
        customerName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || ''
      };
    });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date()
    };
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
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

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error('Appointment not found');
    
    const updatedAppointment = { ...appointment, ...updates, updatedAt: new Date() };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
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

  async getClinicAllAppointments(clinicId: string): Promise<any[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.clinicId === clinicId)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
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

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = 'DELIVERED';
      notification.updatedAt = new Date();
      this.notifications.set(id, notification);
    }
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications.delete(id);
  }

  async updateNotificationStatus(id: string, status: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.status = status as any;
    notification.updatedAt = new Date();
    if (status === 'SENT') {
      notification.sentAt = new Date();
    }
    
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationStats(): Promise<any> {
    const notifications = Array.from(this.notifications.values());
    
    return {
      total: notifications.length,
      pending: notifications.filter(n => n.status === 'PENDING').length,
      sent: notifications.filter(n => n.status === 'SENT').length,
      delivered: notifications.filter(n => n.status === 'DELIVERED').length,
      failed: notifications.filter(n => n.status === 'FAILED').length,
      recentlySent: notifications.filter(n => 
        n.sentAt && new Date(n.sentAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };
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

  // Admin operations
  async getAdminStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      totalClinics: this.clinics.size,
      totalPets: this.pets.size,
      totalAppointments: this.appointments.size,
      totalOrders: this.orders.size,
      totalRevenue: Array.from(this.orders.values())
        .reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0),
      activeUsers: Array.from(this.users.values())
        .filter(user => user.verifiedAt).length,
      systemHealth: 'ONLINE',
    };
  }

  async getAllUsers(): Promise<any[]> {
    return Array.from(this.users.values()).map(user => {
      const clinic = Array.from(this.clinics.values())
        .find(c => c.ownerUserId === user.id);
      return {
        ...user,
        clinicId: clinic?.id,
        clinicName: clinic?.name,
        status: user.verifiedAt ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }

  async updateUserByAdmin(userId: string, updates: any): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    // Don't delete super admins
    const user = this.users.get(userId);
    if (user?.role === 'SUPER_ADMIN') {
      throw new Error('Cannot delete super admin');
    }
    
    this.users.delete(userId);
  }

  async getAllClinics(): Promise<any[]> {
    return Array.from(this.clinics.values()).map(clinic => {
      const userCount = Array.from(this.users.values())
        .filter(user => user.id === clinic.ownerUserId).length;
      const petCount = Array.from(this.pets.values())
        .filter(pet => pet.clinicId === clinic.id).length;
      
      return {
        ...clinic,
        userCount,
        petCount,
        status: 'ACTIVE',
      };
    });
  }

  async updateClinic(clinicId: string, updates: any): Promise<any> {
    const clinic = this.clinics.get(clinicId);
    if (!clinic) throw new Error('Clinic not found');

    const updatedClinic = { ...clinic, ...updates, updatedAt: new Date() };
    this.clinics.set(clinicId, updatedClinic);
    return updatedClinic;
  }

  async getSystemLogs(): Promise<any[]> {
    // Mock system logs
    return [
      {
        id: '1',
        level: 'INFO',
        message: 'User login successful',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: 'User admin@vettrack.pro logged in successfully',
      },
      {
        id: '2',
        level: 'INFO',
        message: 'System startup completed',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        details: 'All services initialized successfully',
      },
      {
        id: '3',
        level: 'WARN',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        details: 'Memory usage at 85%, consider optimization',
      },
    ];
  }

  async createSystemBackup(): Promise<any> {
    const backupId = randomUUID();
    return {
      id: backupId,
      created: new Date(),
      size: '2.5MB',
      status: 'COMPLETED',
    };
  }

  async restoreSystemBackup(backupId: string): Promise<any> {
    return {
      id: backupId,
      restored: new Date(),
      status: 'COMPLETED',
    };
  }

  async updateSystemSettings(settings: any): Promise<any> {
    // In a real implementation, this would save to database or file
    return settings;
  }

  async getSystemSettings(): Promise<any> {
    return {
      siteName: 'VetTrack Pro',
      systemEmail: 'system@vettrack.pro',
      maintenanceMode: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      twoFactorRequired: false,
    };
  }
}

// Database implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<PetOwnerProfile | undefined> {
    const [profile] = await db.select().from(petOwnerProfiles).where(eq(petOwnerProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(userId: string, profileData: UpdatePetOwnerProfile): Promise<PetOwnerProfile> {
    const [profile] = await db
      .insert(petOwnerProfiles)
      .values({
        id: randomUUID(),
        userId,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, profileData: UpdatePetOwnerProfile): Promise<PetOwnerProfile> {
    const existing = await this.getUserProfile(userId);
    if (existing) {
      const [profile] = await db
        .update(petOwnerProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(petOwnerProfiles.userId, userId))
        .returning();
      return profile;
    } else {
      return this.createUserProfile(userId, profileData);
    }
  }

  // Food products
  async getFoodProducts(): Promise<FoodProduct[]> {
    return await db.select().from(foodProducts).orderBy(desc(foodProducts.createdAt));
  }

  async getFoodProduct(id: string): Promise<FoodProduct | undefined> {
    const [product] = await db.select().from(foodProducts).where(eq(foodProducts.id, id));
    return product;
  }

  async createFoodProduct(productData: InsertFoodProduct): Promise<FoodProduct> {
    const [product] = await db
      .insert(foodProducts)
      .values({
        id: randomUUID(),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return product;
  }

  // Pets
  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }

  async getUserPets(userId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.ownerId, userId));
  }

  async getClinicPets(clinicId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.clinicId, clinicId));
  }

  async getUserClinics(userId: string): Promise<any[]> {
    // Get user's clinics through clinic_members or if user is clinic owner
    const userClinics = await db
      .select({
        id: clinics.id,
        name: clinics.name,
        address: clinics.address,
        phone: clinics.phone,
      })
      .from(clinics)
      .leftJoin(clinicMembers, eq(clinics.id, clinicMembers.clinicId))
      .where(
        or(
          eq(clinics.ownerUserId, userId),
          eq(clinicMembers.userId, userId)
        )
      );
    
    // If no clinics found, return the default clinic
    if (userClinics.length === 0) {
      const defaultClinics = await db.select().from(clinics).limit(1);
      return defaultClinics;
    }
    
    return userClinics;
  }

  async createPet(petData: InsertPet): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values({
        id: randomUUID(),
        ...petData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return pet;
  }

  async updatePet(id: string, updates: any): Promise<Pet> {
    const [pet] = await db
      .update(pets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pets.id, id))
      .returning();
    return pet;
  }

  async deletePet(id: string): Promise<void> {
    await db.delete(pets).where(eq(pets.id, id));
  }

  // Admin pet operations
  async getAllPetsWithOwners(): Promise<any[]> {
    const result = await db
      .select({
        id: pets.id,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        birthDate: pets.birthDate,
        weight: pets.weightKg,
        gender: pets.sex,
        microchipNo: pets.microchipNo,
        ownerId: pets.ownerId,
        clinicId: pets.clinicId,
        createdAt: pets.createdAt,
        updatedAt: pets.updatedAt,
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName,
        ownerEmail: users.email,
      })
      .from(pets)
      .leftJoin(users, eq(pets.ownerId, users.id))
      .orderBy(desc(pets.createdAt));
    
    // Calculate age from birthDate
    return result.map(pet => ({
      ...pet,
      age: pet.birthDate ? 
        Math.floor((new Date().getTime() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
        null,
      description: null, // Add description field for compatibility
    }));
  }

  async updatePetByAdmin(petId: string, updates: any): Promise<Pet | undefined> {
    const [pet] = await db
      .update(pets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pets.id, petId))
      .returning();
    return pet;
  }

  async createPetByAdmin(petData: any): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values({
        id: randomUUID(),
        ...petData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return pet;
  }

  // Staff operations
  async getStaffMembers(clinicId?: string): Promise<any[]> {
    const staff = Array.from(this.users.values())
      .filter(user => ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF'].includes(user.role!))
      .map(user => {
        const clinic = Array.from(this.clinics.values())
          .find(c => c.ownerUserId === user.id || 
                 Array.from(this.clinicMembers.values())
                   .some(member => member.userId === user.id && member.clinicId === c.id));
        
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          specialization: user.role === 'VET' ? 'Genel Veteriner' : undefined,
          licenseNumber: user.role === 'VET' ? `VET${user.id.slice(-6)}` : undefined,
          joinedAt: user.createdAt,
          lastLoginAt: user.verifiedAt, // Using verifiedAt as proxy for last login
          status: user.verifiedAt ? 'ACTIVE' : 'INACTIVE',
          clinicId: clinic?.id,
          clinicName: clinic?.name,
          workingHours: user.role !== 'PET_OWNER' ? {
            monday: '09:00-17:00',
            tuesday: '09:00-17:00',
            wednesday: '09:00-17:00',
            thursday: '09:00-17:00',
            friday: '09:00-17:00',
            saturday: '09:00-13:00',
            sunday: 'Kapalı'
          } : undefined,
          permissions: this.getUserPermissions(user.role!)
        };
      });

    if (clinicId) {
      return staff.filter(member => member.clinicId === clinicId);
    }
    
    return staff;
  }

  async getStaffMember(staffId: string): Promise<any | undefined> {
    const staff = await this.getStaffMembers();
    return staff.find(member => member.id === staffId);
  }

  async createStaffMember(staffData: any): Promise<any> {
    const newUser = await this.createUser({
      email: staffData.email,
      password: '$2b$10$defaulthash', // Default password - user should change on first login
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      phone: staffData.phone,
      role: staffData.role,
      verifiedAt: new Date(), // Auto-verify staff
      whatsappOptIn: false,
      locale: 'tr'
    });

    // Add to clinic if specified
    if (staffData.clinicId) {
      this.clinicMembers.set(randomUUID(), {
        id: randomUUID(),
        clinicId: staffData.clinicId,
        userId: newUser.id,
        role: staffData.role,
        createdAt: new Date()
      });
    }

    return this.getStaffMember(newUser.id);
  }

  async updateStaffMember(staffId: string, updates: any): Promise<any> {
    await this.updateUserByAdmin(staffId, {
      firstName: updates.firstName,
      lastName: updates.lastName,
      email: updates.email,
      phone: updates.phone,
      role: updates.role
    });
    
    return this.getStaffMember(staffId);
  }

  async deleteStaffMember(staffId: string): Promise<void> {
    await this.deleteUser(staffId);
    
    // Remove from clinic memberships
    for (const [id, member] of this.clinicMembers.entries()) {
      if (member.userId === staffId) {
        this.clinicMembers.delete(id);
      }
    }
  }

  async getStaffStats(): Promise<any> {
    const staff = await this.getStaffMembers();
    
    return {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === 'ACTIVE').length,
      veterinarians: staff.filter(s => s.role === 'VET').length,
      admins: staff.filter(s => ['SUPER_ADMIN', 'CLINIC_ADMIN'].includes(s.role)).length,
      staffOnLeave: staff.filter(s => s.status === 'ON_LEAVE').length,
      recentJoins: staff.filter(s => 
        new Date(s.joinedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    };
  }

  private getUserPermissions(role: string): string[] {
    switch (role) {
      case 'SUPER_ADMIN':
        return ['all'];
      case 'CLINIC_ADMIN':
        return ['manage_clinic', 'manage_staff', 'view_reports', 'manage_inventory'];
      case 'VET':
        return ['manage_pets', 'manage_appointments', 'manage_vaccinations', 'view_medical_records'];
      case 'STAFF':
        return ['view_appointments', 'manage_inventory', 'basic_operations'];
      default:
        return [];
    }
  }

  // Stub implementations for other methods
  async getClinic(id: string): Promise<any> { return null; }
  async createClinic(data: any): Promise<any> { return null; }
  async getUserClinics(userId: string): Promise<any[]> { return []; }
  async getVaccines(): Promise<Vaccine[]> { return []; }
  async getVaccine(id: string): Promise<Vaccine | undefined> { return undefined; }
  async createVaccine(data: InsertVaccine): Promise<Vaccine> { throw new Error('Not implemented'); }
  async updateVaccine(id: string, updates: any): Promise<Vaccine> { throw new Error('Not implemented'); }
  async deleteVaccine(id: string): Promise<void> {}
  async getPetVaccinations(petId: string): Promise<VaccinationEvent[]> { return []; }
  async createVaccinationEvent(data: InsertVaccinationEvent): Promise<VaccinationEvent> { throw new Error('Not implemented'); }
  async updateVaccinationEvent(id: string, updates: any): Promise<VaccinationEvent> { throw new Error('Not implemented'); }
  async deleteVaccinationEvent(id: string): Promise<void> {}
  async updateFoodProduct(id: string, updates: any): Promise<FoodProduct> { throw new Error('Not implemented'); }
  async deleteFoodProduct(id: string): Promise<void> {}
  async getOrders(userId?: string): Promise<Order[]> { return []; }
  async getOrder(id: string): Promise<Order | undefined> { return undefined; }
  async createOrder(data: InsertOrder): Promise<Order> { throw new Error('Not implemented'); }
  async updateOrder(id: string, updates: any): Promise<Order> { throw new Error('Not implemented'); }
  async deleteOrder(id: string): Promise<void> {}
  async getAppointments(clinicId?: string): Promise<Appointment[]> { return []; }
  async getClinicAppointments(clinicId: string): Promise<Appointment[]> { return []; }
  async getUserAppointments(userId: string): Promise<Appointment[]> { return []; }
  async getAppointment(id: string): Promise<Appointment | undefined> { return undefined; }
  async createAppointment(data: InsertAppointment): Promise<Appointment> { throw new Error('Not implemented'); }
  async updateAppointment(id: string, updates: any): Promise<Appointment> { throw new Error('Not implemented'); }
  async deleteAppointment(id: string): Promise<void> {}
  async getNotifications(userId: string): Promise<Notification[]> { return []; }
  async createNotification(data: InsertNotification): Promise<Notification> { throw new Error('Not implemented'); }
  async markNotificationRead(id: string): Promise<void> {}
  async deleteNotification(id: string): Promise<void> {}
  async getFeedingPlans(petId: string): Promise<any[]> { return []; }
  async createFeedingPlan(data: any): Promise<any> { throw new Error('Not implemented'); }
  async updateFeedingPlan(id: string, updates: any): Promise<any> { throw new Error('Not implemented'); }
  async deleteFeedingPlan(id: string): Promise<void> {}
  async getMedicalRecords(userId?: string): Promise<MedicalRecord[]> {
    const allRecords = this.medicalRecords;
    if (!userId) return allRecords;
    
    // Get user's pets
    const userPets = this.pets.filter(pet => pet.ownerId === userId);
    const userPetIds = userPets.map(pet => pet.id);
    
    return allRecords.filter(record => userPetIds.includes(record.petId));
  }
  
  async getPetMedicalRecords(petId: string): Promise<MedicalRecord[]> {
    return this.medicalRecords.filter(record => record.petId === petId);
  }
  
  async createMedicalRecord(data: InsertMedicalRecord): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = {
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.medicalRecords.push(newRecord);
    return newRecord;
  }
  
  async updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const index = this.medicalRecords.findIndex(record => record.id === id);
    if (index === -1) throw new Error('Medical record not found');
    
    this.medicalRecords[index] = {
      ...this.medicalRecords[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.medicalRecords[index];
  }
  
  async deleteMedicalRecord(id: string): Promise<void> {
    const index = this.medicalRecords.findIndex(record => record.id === id);
    if (index !== -1) {
      this.medicalRecords.splice(index, 1);
    }
  }

  // Admin operations for DatabaseStorage
  async getAdminStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [clinicCount] = await db.select({ count: sql<number>`count(*)` }).from(clinics);
    const [petCount] = await db.select({ count: sql<number>`count(*)` }).from(pets);
    const [appointmentCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments);
    
    return {
      totalUsers: userCount.count || 0,
      totalClinics: clinicCount.count || 0,
      totalPets: petCount.count || 0,
      totalAppointments: appointmentCount.count || 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeUsers: userCount.count || 0,
      systemHealth: 'ONLINE',
    };
  }

  async getAllUsers(): Promise<any[]> {
    const allUsers = await db.select().from(users);
    return allUsers.map(user => ({
      ...user,
      clinicId: null,
      clinicName: null,
      status: user.verifiedAt ? 'ACTIVE' : 'INACTIVE',
    }));
  }

  async updateUserByAdmin(userId: string, updates: any): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error updating user by admin:', error);
      return undefined;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getAllClinics(): Promise<any[]> {
    const allClinics = await db.select().from(clinics);
    return allClinics.map(clinic => ({
      ...clinic,
      userCount: 1,
      petCount: 0,
      status: 'ACTIVE',
    }));
  }

  async updateClinic(clinicId: string, updates: any): Promise<any> {
    const [clinic] = await db
      .update(clinics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clinics.id, clinicId))
      .returning();
    return clinic;
  }

  async getSystemLogs(): Promise<any[]> {
    // Mock system logs for database implementation
    return [
      {
        id: '1',
        level: 'INFO',
        message: 'User login successful',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: 'Database user logged in successfully',
      },
      {
        id: '2',
        level: 'INFO',
        message: 'Database connection established',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        details: 'PostgreSQL connection initialized',
      },
      {
        id: '3',
        level: 'WARN',
        message: 'Cache miss detected',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        details: 'Query cache optimization needed',
      },
    ];
  }

  async createSystemBackup(): Promise<any> {
    const backupId = randomUUID();
    return {
      id: backupId,
      created: new Date(),
      size: '5.2MB',
      status: 'COMPLETED',
    };
  }

  async restoreSystemBackup(backupId: string): Promise<any> {
    return {
      id: backupId,
      restored: new Date(),
      status: 'COMPLETED',
    };
  }

  async updateSystemSettings(settings: any): Promise<any> {
    // In a real implementation, this would save to database table
    return settings;
  }

  async getSystemSettings(): Promise<any> {
    return {
      siteName: 'VetTrack Pro',
      systemEmail: 'system@vettrack.pro',
      maintenanceMode: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      twoFactorRequired: false,
    };
  }

  // Session store placeholder
  sessionStore = null;
}

// Initialize database storage and seed data
export const storage = new MemStorage();

// Seed initial data
async function seedData() {
  try {
    // Check if admin user exists
    const adminUser = await storage.getUserByEmail('admin@vettrack.pro');
    if (!adminUser) {
      console.log('Creating admin user...');
      await storage.createUser({
        email: 'admin@vettrack.pro',
        password: await hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        phone: '+90555123456',
        whatsappPhone: '+90555123456',
        whatsappOptIn: true,
        locale: 'tr',
        verifiedAt: new Date(),
      });
    }

    // Check if products exist
    const existingProducts = await storage.getFoodProducts();
    if (existingProducts.length === 0) {
      console.log('Adding trending pet products...');
      
      const trendingProducts = [
        {
          name: 'Akıllı Otomatik Besleyici Pro',
          brand: 'PetSafe',
          packageSizeGrams: null,
          species: 'DOG',
          sku: 'PS-SMART-FEEDER-PRO',
          price: '899.00',
          stockQty: 15,
          description: 'Akıllı telefon uygulaması ile kontrol edilebilen otomatik besleyici. Portion kontrolü, zamanlayıcı ve video kamera özellikli.',
          images: ['https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          clinicId: null,
        },
        {
          name: 'Premium Organik Köpek Maması',
          brand: 'The Farmer\'s Dog',
          packageSizeGrams: 12000,
          species: 'DOG',
          sku: 'TFD-ORGANIC-PREMIUM-12KG',
          price: '680.00',
          stockQty: 25,
          description: 'Taze, organik malzemelerle hazırlanmış premium köpek maması. Tahılsız, yüksek protein içerikli.',
          images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          clinicId: null,
        },
        {
          name: 'İnteraktif Puzzle Oyuncak Seti',
          brand: 'Nina Ottosson',
          packageSizeGrams: 800,
          species: 'DOG',
          sku: 'NO-PUZZLE-SET-ADV',
          price: '289.00',
          stockQty: 35,
          description: 'Zihinsel stimülasyon sağlayan interaktif puzzle oyuncak seti. 3 farklı zorluk seviyesi.',
          images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          clinicId: null,
        },
        {
          name: 'GPS Takip Akıllı Tasma',
          brand: 'Whistle Go',
          packageSizeGrams: 150,
          species: 'DOG',
          sku: 'WG-GPS-TRACKER-V3',
          price: '1250.00',
          stockQty: 18,
          description: 'Real-time GPS takip, aktivite monitörü ve sağlık takibi özellikli akıllı tasma.',
          images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          clinicId: null,
        },
        {
          name: 'Premium Kedi Yaş Maması Çeşit Paketi',
          brand: 'Sheba Perfect Portions',
          packageSizeGrams: 2400,
          species: 'CAT',
          sku: 'SPP-VARIETY-PACK-24',
          price: '189.00',
          stockQty: 40,
          description: '24 adet çeşitli lezzetlerde premium kedi yaş maması. Porsiyon kontrollü paketlerde.',
          images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          clinicId: null,
        },
      ];

      for (const product of trendingProducts) {
        await storage.createFoodProduct(product);
      }
    }

    // Ensure all users except admin@vettrack.pro have PET_OWNER role
    const allUsers = await storage.getAllUsers();
    for (const user of allUsers) {
      if (user.email !== 'admin@vettrack.pro' && user.role !== 'PET_OWNER') {
        console.log(`Updating user ${user.email} role from ${user.role} to PET_OWNER`);
        await storage.updateUserByAdmin(user.id, { role: 'PET_OWNER' });
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run seed data
seedData();
