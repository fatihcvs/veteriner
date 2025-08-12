export const APP_NAME = 'VetTrack Pro';
export const APP_DESCRIPTION = 'Veteriner Klinik Yönetim Sistemi';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLINIC_ADMIN: 'CLINIC_ADMIN', 
  VET: 'VET',
  STAFF: 'STAFF',
  PET_OWNER: 'PET_OWNER',
} as const;

export const PET_SPECIES_MAP = {
  DOG: 'Köpek',
  CAT: 'Kedi',
  BIRD: 'Kuş',
  RABBIT: 'Tavşan',
  HAMSTER: 'Hamster',
  FISH: 'Balık',
  OTHER: 'Diğer',
} as const;

export const PET_SPECIES = [
  { value: 'DOG', label: 'Köpek' },
  { value: 'CAT', label: 'Kedi' },
  { value: 'BIRD', label: 'Kuş' },
  { value: 'RABBIT', label: 'Tavşan' },
  { value: 'HAMSTER', label: 'Hamster' },
  { value: 'FISH', label: 'Balık' },
  { value: 'OTHER', label: 'Diğer' },
];

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
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF']
  },
  {
    key: 'appointments',
    label: 'Randevular',
    petOwnerLabel: 'Randevularım',
    icon: 'fas fa-calendar-check',
    href: '/appointments',
    badge: true,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'pets',
    label: 'Evcil Hayvanlar',
    petOwnerLabel: 'Hayvanlarım',
    icon: 'fas fa-paw',
    href: '/pets',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'owners',
    label: 'Hayvan Sahipleri',
    icon: 'fas fa-users',
    href: '/pet-owners',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF'] // Pet owners can't see other owners
  },
  {
    key: 'vaccinations',
    label: 'Aşı Kayıtları',
    icon: 'fas fa-syringe',
    href: '/vaccinations',
    badge: true,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF']
  },
  {
    key: 'feeding',
    label: 'Mama Takibi',
    icon: 'fas fa-bowl-food',
    href: '/feeding',
    badge: true,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF']
  },
  {
    key: 'medical-records',
    label: 'Tıbbi Kayıtlar',
    icon: 'fas fa-file-medical',
    href: '/medical-records',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF']
  },
];

export const ECOMMERCE_ITEMS = [
  {
    key: 'shop',
    label: 'Mağaza',
    petOwnerLabel: 'Mağaza',
    icon: 'fas fa-store',
    href: '/shop',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'orders',
    label: 'Siparişler',
    petOwnerLabel: 'Siparişlerim',
    icon: 'fas fa-shopping-cart',
    href: '/orders',
    badge: true,
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'inventory',
    label: 'Envanter',
    icon: 'fas fa-boxes',
    href: '/inventory',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF'] // Only clinic staff
  },
];

export const MANAGEMENT_ITEMS = [
  {
    key: 'profile',
    label: 'Profil',
    petOwnerLabel: 'Profilim',
    icon: 'fas fa-user-circle',
    href: '/profile',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'staff',
    label: 'Personel',
    icon: 'fas fa-user-md',
    href: '/staff',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] // Only admins
  },
  {
    key: 'notifications',
    label: 'Bildirimler',
    petOwnerLabel: 'Bildirimlerim',
    icon: 'fas fa-bell',
    href: '/notifications',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF', 'PET_OWNER']
  },
  {
    key: 'admin',
    label: 'Admin Paneli',
    icon: 'fas fa-shield-alt',
    href: '/admin',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] // Only admins
  },
  {
    key: 'settings',
    label: 'Ayarlar',
    icon: 'fas fa-cog',
    href: '/settings',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'VET', 'STAFF'] // Only staff members
  },
];

// Helper function to check if user has access to navigation item
export const hasAccess = (item: any, userRole: string) => {
  if (!item.roles) return true; // If no roles specified, everyone has access
  return item.roles.includes(userRole);
};
