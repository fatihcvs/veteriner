# VetTrack Pro

## Overview

VetTrack Pro is a comprehensive veterinary clinic management SaaS application that combines a pet health record system, e-commerce platform, and automated WhatsApp notification system. The application provides veterinarians with tools to manage pet records, track vaccinations, schedule appointments, and sell pet products, while offering pet owners digital health records and automated reminders via WhatsApp.

The system is designed as a multi-tenant application supporting different user roles (SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER) with clinic-based data isolation.

## Recent Updates (August 2024)

### Role-Based Access Control Implementation
- **Complete navigation filtering**: All sidebar menu items now filter based on user roles
- **Page-level protection**: Admin panel restricted to SUPER_ADMIN and CLINIC_ADMIN only
- **RoleGuard component**: Created for flexible component-level access control
- **Dynamic UI**: Users only see menu sections they have permission to access

### Sample Data Population
- **10 diverse users**: Added with realistic Turkish names and different roles (6 pet owners, 2 vets, 2 staff)
- **10 pets**: Includes dogs, cats, birds, and rabbits with Turkish names (Karabaş, Pamuk, Bruno, Minnoş, etc.)
- **6 pet owner profiles**: Complete with addresses, emergency contacts, and personal information
- **8 appointments**: Mix of completed and scheduled appointments
- **6 vaccination records**: Real vaccination data for different species
- **6 food products**: Pet food inventory with proper pricing and stock levels
- **3 orders**: Sample e-commerce transactions with different statuses

**New Features Added:**
- **Comprehensive Admin Panel**: Full administrative control system for SUPER_ADMIN and CLINIC_ADMIN users
- **Complete Navigation System**: All sidebar menu sections are now functional and accessible
- **Role-Based Access Control**: Advanced permissions system with admin-only features 

## Recent Changes (August 2025)
- **E-commerce Enhancement**: Added top 10 trending pet products for 2024 based on market research
- **Product Catalog**: Integrated authentic, high-selling products including smart feeders, premium organic foods, interactive toys, GPS trackers, CBD wellness products, and luxury pet tech
- **Market Research Integration**: Products selected based on real market data showing growth rates of 5.8%-200% in their respective categories

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes based on authentication state
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with custom CSS variables for theming, medical-focused color palette
- **Navigation**: Complete sidebar navigation system with role-based menu filtering and admin panel access
- **Profile Management**: Comprehensive user profile system with personal information, emergency contacts, and address details

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth integration with OpenID Connect, session-based authentication
- **API Design**: RESTful endpoints with proper error handling and request logging
- **File Structure**: Separation of concerns with dedicated services for notifications, PDF generation, scheduling, and WhatsApp integration

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM (using in-memory storage for development)
- **Schema**: Multi-tenant design with clinic-based data isolation
- **Key Entities**: Users, Clinics, Pets, Vaccinations, Appointments, Products, Orders, Notifications, PetOwnerProfiles
- **Session Storage**: Database-backed sessions using connect-pg-simple
- **Data Validation**: Zod schemas for runtime type checking and API validation
- **Profile System**: Extended user profiles with personal details, emergency contacts, address information, and customizable fields

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Five-tier role system (SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER)
- **Multi-Tenancy**: Clinic-based data isolation with user-clinic relationships
- **Admin Panel**: Comprehensive administrative interface for system management and user control

### Notification System
- **Primary Channel**: WhatsApp integration with provider abstraction layer
- **Providers**: Meta WhatsApp Business Cloud API (primary), Twilio WhatsApp (fallback)
- **Message Types**: Vaccination reminders, food depletion alerts, appointment notifications, order updates
- **Scheduling**: Background job processing for automated reminder delivery
- **Compliance**: User opt-in tracking and delivery status monitoring

### PDF Generation & QR Codes
- **Library**: pdf-lib for PDF document generation
- **Use Case**: Digital vaccination cards with QR codes for verification
- **QR Generation**: qrcode library for creating verification codes
- **Template System**: Programmatic PDF layout with clinic branding support

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Hosted PostgreSQL database service
- **Replit Hosting**: Primary hosting platform with integrated authentication

### Communication Services
- **Meta WhatsApp Business Cloud API**: Primary WhatsApp messaging provider
- **Twilio WhatsApp API**: Fallback WhatsApp messaging provider

### UI & Styling
- **Radix UI**: Accessible component primitives (@radix-ui/* packages)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide Icons**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

### Form Handling & Validation
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Schema validation for forms and API endpoints
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Frontend build tool with HMR and optimization
- **ESBuild**: Backend bundling for production deployment
- **tsx**: TypeScript execution for development server

### Session & State Management
- **TanStack Query**: Server state management with caching and synchronization
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for authentication state

### PDF & Document Generation
- **pdf-lib**: PDF document creation and manipulation
- **qrcode**: QR code generation for vaccination cards

### Date & Internationalization
- **date-fns**: Date manipulation and formatting with Turkish locale support
- **next-intl**: Internationalization with English and Turkish language support