export const APP_NAME = 'VetTrack Pro';
export const APP_DESCRIPTION = 'Veteriner Klinik Yönetim Sistemi';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLINIC_ADMIN: 'CLINIC_ADMIN', 
  VET: 'VET',
  STAFF: 'STAFF',
  PET_OWNER: 'PET_OWNER',
} as const;

export const PET_SPECIES = {
  DOG: 'Köpek',
  CAT: 'Kedi',
  BIRD: 'Kuş',
  RABBIT: 'Tavşan',
  HAMSTER: 'Hamster',
  FISH: 'Balık',
  OTHER: 'Diğer',
} as const;

export const APPOINTMENT_TYPES = {
  CHECKUP: 'Rutin Kontrol',
  VACCINATION: 'Aşı',
  SURGERY: 'Cerrahi Operasyon',
  EMERGENCY: 'Acil',
  GROOMING: 'Tıraş',
  DENTAL: 'Diş Bakımı',
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Planlandı',
  CONFIRMED: 'Onaylandı',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi',
} as const;

export const ORDER_STATUS = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
} as const;

export const VACCINATION_STATUS = {
  SCHEDULED: 'Planlandı',
  DONE: 'Tamamlandı',
  OVERDUE: 'Gecikti',
} as const;

export const NAVIGATION_ITEMS = [
  {
    key: 'dashboard',
    label: 'Pano',
    icon: 'fas fa-chart-pie',
    href: '/',
  },
  {
    key: 'appointments',
    label: 'Randevular',
    icon: 'fas fa-calendar-check',
    href: '/appointments',
    badge: true,
  },
  {
    key: 'pets',
    label: 'Evcil Hayvanlar',
    icon: 'fas fa-paw',
    href: '/pets',
  },
  {
    key: 'owners',
    label: 'Hayvan Sahipleri',
    icon: 'fas fa-users',
    href: '/owners',
  },
  {
    key: 'vaccinations',
    label: 'Aşı Kayıtları',
    icon: 'fas fa-syringe',
    href: '/vaccinations',
    badge: true,
  },
  {
    key: 'medical-records',
    label: 'Tıbbi Kayıtlar',
    icon: 'fas fa-file-medical',
    href: '/medical-records',
  },
];

export const ECOMMERCE_ITEMS = [
  {
    key: 'shop',
    label: 'Ürünler',
    icon: 'fas fa-store',
    href: '/shop',
  },
  {
    key: 'orders',
    label: 'Siparişler',
    icon: 'fas fa-shopping-cart',
    href: '/orders',
    badge: true,
  },
  {
    key: 'inventory',
    label: 'Envanter',
    icon: 'fas fa-boxes',
    href: '/inventory',
  },
];

export const MANAGEMENT_ITEMS = [
  {
    key: 'staff',
    label: 'Personel',
    icon: 'fas fa-user-md',
    href: '/staff',
  },
  {
    key: 'notifications',
    label: 'Bildirimler',
    icon: 'fas fa-bell',
    href: '/notifications',
  },
  {
    key: 'settings',
    label: 'Ayarlar',
    icon: 'fas fa-cog',
    href: '/settings',
  },
];
