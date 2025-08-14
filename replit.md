# VetTrack Pro

## Overview

VetTrack Pro is a comprehensive SaaS application for veterinary clinic management, combining a pet health record system, e-commerce platform, and automated WhatsApp notification system. It enables veterinarians to manage pet records, track vaccinations, schedule appointments, and sell products, while offering pet owners digital health records and automated reminders. The system is designed as a multi-tenant application supporting various user roles (SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER) with clinic-based data isolation.

The core vision is to establish Turkey's first AI-powered pet health ecosystem, serving as a digital pet health passport and smart life assistant. It aims to unify the entire pet economy, from pet owners and veterinary clinics to pet care service providers and e-commerce businesses.

Key value propositions include:
1.  **Digital Pet Health Passport**: QR code-based digital vaccination cards and health history, blockchain-ready verifiable health records, and emergency health info access.
2.  **AI-Powered Pet Care Assistant**: Symptom analysis, personalized nutrition plans, behavior analysis, and veterinary appointment suggestions.
3.  **Smart Pet Commerce**: AI-supported personalized product recommendations, automated recurring orders, and price optimization based on pet profiles.
4.  **WhatsApp Integration & Communication Hub**: Automated reminders for vaccinations and check-ups, emergency notifications, order tracking, and direct communication with vets.
5.  **Pet Community & Social Network**: A social platform for pet owners, lost pet alert system, and a local pet care provider network.

The primary target market is pet owners (25-45, tech-savvy, mid-to-high income, urban), followed by veterinary clinics and pet service providers. Revenue is generated through SaaS subscriptions, e-commerce commissions, AI service fees, and WhatsApp Business API usage.

## User Preferences

Preferred communication style: Simple, everyday language.
Development Authority: Complete autonomous development authority. Continuous development cycle (plan -> develop -> test -> deploy). Autonomous problem-solving (find -> fix -> optimize). No scope limitation; develop all features from small to large. Full authority in all areas: Database, API, UI, UX, deployment. Remain focused on the core vision. Adopt a systematic approach with phased development to achieve goals.

**Daily Auto-Dev System**: Unlimited autonomous development system implemented with GPT-4o integration. Daily planning, implementation, testing, and deployment with automatic rollback capabilities. System operates via GitHub Actions workflow with comprehensive monitoring and safety features.

## System Architecture

### Frontend Architecture
-   **Framework**: React with TypeScript, using Vite.
-   **Routing**: Wouter for client-side routing with protected routes.
-   **UI Components**: shadcn/ui built on Radix UI primitives with Tailwind CSS.
-   **State Management**: TanStack Query for server state and caching.
-   **Forms**: React Hook Form with Zod validation.
-   **Styling**: Tailwind CSS with custom CSS variables and a medical-focused color palette.
-   **Navigation**: Complete sidebar navigation with role-based menu filtering.

### Backend Architecture
-   **Framework**: Express.js server with TypeScript.
-   **Database ORM**: Drizzle ORM with PostgreSQL dialect.
-   **Authentication**: Replit Auth integration with OpenID Connect and session-based authentication.
-   **API Design**: RESTful endpoints with error handling and request logging.
-   **File Structure**: Separation of concerns for notifications, PDF generation, scheduling, and WhatsApp integration.

### Database Design
-   **Primary Database**: PostgreSQL with Drizzle ORM (in-memory for dev).
-   **Schema**: Multi-tenant design with clinic-based data isolation.
-   **Key Entities**: Users, Clinics, Pets, Vaccinations, Appointments, Products, Orders, Notifications, PetOwnerProfiles.
-   **Session Storage**: Database-backed sessions using `connect-pg-simple`.
-   **Data Validation**: Zod schemas for runtime type checking and API validation.
-   **Profile System**: Extended user profiles with personal details, emergency contacts, address, and customizable fields.

### Authentication & Authorization
-   **Provider**: Replit Auth with OpenID Connect.
-   **Session Management**: Server-side sessions stored in PostgreSQL.
-   **Role-Based Access**: Five-tier system (SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER).
-   **Multi-Tenancy**: Clinic-based data isolation.
-   **Admin Panel**: Comprehensive administrative interface for system management.

### Notification System
-   **Primary Channel**: WhatsApp integration via a provider abstraction layer.
-   **Providers**: Meta WhatsApp Business Cloud API (primary), Twilio WhatsApp (fallback).
-   **Message Types**: Vaccination reminders, food depletion alerts, appointment notifications, order updates.
-   **Scheduling**: Background job processing for automated delivery.

### PDF Generation & QR Codes
-   **Library**: `pdf-lib` for PDF document generation.
-   **Use Case**: Digital vaccination cards with QR codes for verification.
-   **QR Generation**: `qrcode` library.
-   **Template System**: Programmatic PDF layout with clinic branding support.

## External Dependencies

### Database & Infrastructure
-   **Neon Database**: Hosted PostgreSQL database service.
-   **Replit Hosting**: Primary hosting platform.

### Communication Services
-   **Meta WhatsApp Business Cloud API**: Primary WhatsApp messaging provider.
-   **Twilio WhatsApp API**: Fallback WhatsApp messaging provider.

### UI & Styling
-   **Radix UI**: Accessible component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Lucide Icons**: Icon library.
-   **Google Fonts**: Inter font family.

### Form Handling & Validation
-   **React Hook Form**: Form state management.
-   **Zod**: Schema validation.
-   **@hookform/resolvers**: Integration for React Hook Form and Zod.

### Development Tools
-   **TypeScript**: Static type checking.
-   **Vite**: Frontend build tool.
-   **ESBuild**: Backend bundling.
-   **tsx**: TypeScript execution for development server.

### Session & State Management
-   **TanStack Query**: Server state management.
-   **connect-pg-simple**: PostgreSQL session store.
-   **express-session**: Session middleware.

### PDF & Document Generation
-   **pdf-lib**: PDF document creation.
-   **qrcode**: QR code generation.

### Date & Internationalization
-   **date-fns**: Date manipulation and formatting.
-   **next-intl**: Internationalization.