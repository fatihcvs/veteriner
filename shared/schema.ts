import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  whatsappPhone: varchar("whatsapp_phone"),
  whatsappOptIn: boolean("whatsapp_opt_in").default(false),
  locale: varchar("locale").default('tr'),
  role: varchar("role").notNull().default('PET_OWNER'), // SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  timeZone: varchar("time_zone").default('Europe/Istanbul'),
  locale: varchar("locale").default('tr'),
  logoUrl: varchar("logo_url"),
  ownerUserId: varchar("owner_user_id").references(() => users.id),
  whatsappBusinessNumber: varchar("whatsapp_business_number"),
  whatsappProvider: varchar("whatsapp_provider").default('META'), // META|TWILIO
  whatsappSenderId: varchar("whatsapp_sender_id"),
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clinicMembers = pgTable("clinic_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: uuid("clinic_id").references(() => clinics.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").notNull(), // CLINIC_ADMIN, VET, STAFF
  createdAt: timestamp("created_at").defaultNow(),
});

export const petOwnerProfiles = pgTable("pet_owner_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  defaultClinicId: uuid("default_clinic_id").references(() => clinics.id),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: uuid("clinic_id").references(() => clinics.id).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  species: varchar("species").notNull(), // DOG, CAT, BIRD, etc.
  breed: varchar("breed"),
  sex: varchar("sex"), // MALE, FEMALE
  birthDate: date("birth_date"),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }),
  microchipNo: varchar("microchip_no"),
  avatarUrl: varchar("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vaccines = pgTable("vaccines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  species: varchar("species").notNull(),
  defaultIntervalDays: integer("default_interval_days").default(365),
  manufacturer: varchar("manufacturer"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaccinationEvents = pgTable("vaccination_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  vaccineId: uuid("vaccine_id").references(() => vaccines.id).notNull(),
  lotNo: varchar("lot_no"),
  administeredAt: timestamp("administered_at").notNull(),
  dueAt: timestamp("due_at"),
  vetUserId: varchar("vet_user_id").references(() => users.id).notNull(),
  certificateNo: varchar("certificate_no"),
  nextDueAt: timestamp("next_due_at"),
  status: varchar("status").default('SCHEDULED'), // SCHEDULED, DONE, OVERDUE
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  type: varchar("type").notNull(), // VACCINATION, DEWORMING, CHECKUP, SURGERY
  notes: text("notes"),
  createdByUserId: varchar("created_by_user_id").references(() => users.id).notNull(),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const foodProducts = pgTable("food_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  brand: varchar("brand"),
  packageSizeGrams: integer("package_size_grams"),
  species: varchar("species"), // DOG, CAT, etc.
  sku: varchar("sku").unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQty: integer("stock_qty").default(0),
  description: text("description"),
  images: jsonb("images").default([]),
  clinicId: uuid("clinic_id").references(() => clinics.id), // null for global products
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedingPlans = pgTable("feeding_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  petWeightKg: integer("pet_weight_kg").notNull(), // Köpek ağırlığı kg cinsinden
  dailyGramsRecommended: integer("daily_grams_recommended").notNull(), // Günlük mama miktarı gram cinsinden
  foodProductId: uuid("food_product_id").references(() => foodProducts.id).notNull(),
  startDate: date("start_date").notNull(),
  packageSizeGrams: integer("package_size_grams").notNull(), // Paket büyüklüğü gram cinsinden
  expectedDepletionDate: date("expected_depletion_date"), // Tahmini bitiş tarihi
  estimatedDaysLeft: integer("estimated_days_left"), // Kalan gün sayısı
  notificationSent: boolean("notification_sent").default(false), // Bildirim gönderildi mi?
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clinicId: uuid("clinic_id").references(() => clinics.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: uuid("cart_id").references(() => carts.id).notNull(),
  productId: uuid("product_id").references(() => foodProducts.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clinicId: uuid("clinic_id").references(() => clinics.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default('PENDING'), // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
  paymentIntentId: varchar("payment_intent_id"),
  shippingAddress: jsonb("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => foodProducts.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  clinicId: uuid("clinic_id").references(() => clinics.id),
  type: varchar("type").notNull(), // VACCINATION_REMINDER, FOOD_DEPLETION, ORDER_UPDATE
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  channels: jsonb("channels").default(['WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP']),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  status: varchar("status").default('PENDING'), // PENDING, SENT, FAILED
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whatsappMessageLogs = pgTable("whatsapp_message_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: uuid("notification_id").references(() => notifications.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider").notNull(), // META, TWILIO
  templateKey: varchar("template_key"),
  to: varchar("to").notNull(),
  from: varchar("from").notNull(),
  payload: jsonb("payload"),
  providerMessageId: varchar("provider_message_id"),
  status: varchar("status").default('PENDING'), // PENDING, SENT, DELIVERED, READ, FAILED
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobAudits = pgTable("job_audits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull(),
  payload: jsonb("payload"),
  scheduledFor: timestamp("scheduled_for"),
  status: varchar("status").default('PENDING'), // PENDING, RUNNING, COMPLETED, FAILED
  runAt: timestamp("run_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: uuid("clinic_id").references(() => clinics.id).notNull(),
  petId: uuid("pet_id").references(() => pets.id).notNull(),
  vetUserId: varchar("vet_user_id").references(() => users.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(30), // minutes
  type: varchar("type").notNull(), // CHECKUP, VACCINATION, SURGERY, EMERGENCY
  status: varchar("status").default('SCHEDULED'), // SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertClinic = typeof clinics.$inferInsert;
export type Clinic = typeof clinics.$inferSelect;

export type InsertPet = typeof pets.$inferInsert;
export type Pet = typeof pets.$inferSelect;

export type InsertVaccine = typeof vaccines.$inferInsert;
export type Vaccine = typeof vaccines.$inferSelect;

export type InsertVaccinationEvent = typeof vaccinationEvents.$inferInsert;
export type VaccinationEvent = typeof vaccinationEvents.$inferSelect;

export type InsertFoodProduct = typeof foodProducts.$inferInsert;
export type FoodProduct = typeof foodProducts.$inferSelect;

export type InsertFeedingPlan = typeof feedingPlans.$inferInsert;
export type FeedingPlan = typeof feedingPlans.$inferSelect;

export type InsertOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export type InsertAppointment = typeof appointments.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVaccinationEventSchema = createInsertSchema(vaccinationEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedingPlanSchema = createInsertSchema(feedingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  expectedDepletionDate: true,
  estimatedDaysLeft: true,
  notificationSent: true,
});

export const insertFoodProductSchema = createInsertSchema(foodProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
