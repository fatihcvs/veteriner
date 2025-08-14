# VetTrack Pro - Turkey's First AI-Powered Pet Health Ecosystem

[![Daily Auto-Dev](https://github.com/fatihcvs/veteriner/actions/workflows/daily-auto-dev-unlimited.yml/badge.svg)](https://github.com/fatihcvs/veteriner/actions/workflows/daily-auto-dev-unlimited.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Türkiye'nin ilk dijital pet sağlık pasaportu ve akıllı bakım asistanı platformu**

## 🌟 Overview

VetTrack Pro is a comprehensive SaaS application that combines veterinary clinic management, AI-powered pet care consultation, e-commerce platform, and automated WhatsApp notification system. Built with modern TypeScript technologies and powered by OpenAI GPT-4o, it serves as Turkey's first intelligent pet health ecosystem.

### Key Features

- **🤖 AI Pet Care Assistant**: 7/24 veterinary consultation with symptom analysis
- **📱 Digital Health Passport**: QR code-based pet health records
- **🛒 Smart E-commerce**: AI-powered product recommendations
- **📲 WhatsApp Integration**: Automated reminders and notifications
- **👥 Multi-tenant System**: Support for clinics, vets, and pet owners
- **🔒 Role-based Access**: Granular permissions (SUPER_ADMIN, CLINIC_ADMIN, VET, STAFF, PET_OWNER)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/fatihcvs/veteriner.git
cd veteriner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# Optional (for auto-deployment)
HEALTHCHECK_URL=https://your-app.replit.app/health
REPLIT_DEPLOY_HOOK=https://...
ROLLBACK_COMMITS=1
```

## 🤖 Daily Auto-Dev (Unlimited)

VetTrack Pro features an autonomous development system powered by GPT-4o that automatically:

- **📊 Analyzes** metrics, user feedback, and roadmap daily
- **🎯 Plans** high-impact improvements based on data
- **⚡ Implements** code changes across the entire stack
- **🧪 Tests** and validates all modifications
- **🚀 Deploys** to production automatically
- **🔄 Rolls back** if issues are detected

### How It Works

1. **Daily Planning (07:00 UTC)**: AI analyzes project telemetry and generates improvement proposals
2. **Implementation**: GPT-4o writes and applies code changes across frontend, backend, and database
3. **Testing**: Automated linting, formatting, and test execution
4. **Deployment**: Push to main branch and trigger production deployment
5. **Health Monitoring**: Post-deployment health checks with automatic rollback
6. **Documentation**: Updates changelog and metrics automatically

### Monitoring Files

- `telemetry/metrics.json` - System performance and feature usage
- `telemetry/feedback.md` - User requests and technical debt
- `telemetry/roadmap.md` - Strategic priorities and development phases
- `CHANGELOG.md` - Automated release documentation
- `auto/proposal.md` - Daily improvement plans (generated)

### Scripts

```bash
# Health check (requires HEALTHCHECK_URL)
npm run health:check

# Run all tests
npm run test:all

# Lint and fix code formatting
npm run lint:fix

# Manual AI planning (requires OPENAI_API_KEY)
npx ts-node scripts/auto-plan.ts

# Manual implementation (requires OPENAI_API_KEY)
npx ts-node scripts/auto-implement.ts
```

### GitHub Secrets Configuration

For full autonomous operation, configure these secrets in your GitHub repository:

```
OPENAI_API_KEY          # Required: GPT-4o access for AI development
HEALTHCHECK_URL         # Optional: Health check endpoint for monitoring
REPLIT_DEPLOY_HOOK      # Optional: Webhook for triggering deployments
ROLLBACK_COMMITS        # Optional: Number of commits to rollback (default: 1)
```

### Controlling Auto-Dev

- **Enable**: The workflow runs automatically at 07:00 UTC daily
- **Manual Trigger**: Use "Actions" → "Daily Auto-Dev (Unlimited)" → "Run workflow"
- **Disable**: Delete or rename `.github/workflows/daily-auto-dev-unlimited.yml`
- **Emergency Stop**: Create an empty `auto/STOP` file to pause operations

### Safety Features

- **Incremental Changes**: Each day focuses on one high-impact improvement
- **Automatic Testing**: All changes are validated before deployment
- **Health Monitoring**: Continuous monitoring with automatic rollback
- **Issue Creation**: Failed deployments automatically create GitHub issues
- **Version Control**: All changes are tracked with detailed commit messages

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** build system
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Replit Auth** authentication
- **OpenAI GPT-4o** integration

### Database
- **PostgreSQL** with automated migrations
- **Multi-tenant** architecture
- **Role-based** access control

## 📊 Current Status

- **Users**: 156 total, 45 daily active
- **Pets**: 127 registered across multiple clinics
- **AI Consultations**: 92% success rate, 0.85 average confidence
- **E-commerce**: 15.2% conversion rate, ₺5,420 monthly revenue
- **Uptime**: 99.9% with <300ms average response time

## 🗺️ Roadmap

### Phase 1: AI-Powered Core Foundation ✅
- [x] OpenAI GPT-4o integration
- [x] AI Pet Care Assistant
- [x] Smart product recommendations
- [x] Database schema and API routes

### Phase 2: Smart E-commerce & WhatsApp (Aug 17-19)
- [ ] Meta WhatsApp Business Cloud API
- [ ] Automated notifications and reminders
- [ ] Enhanced AI recommendations
- [ ] Subscription-based orders

### Phase 3: Digital Health Passport v2.0 (Aug 20-22)
- [ ] QR code generation system
- [ ] PDF health reports with AI summaries
- [ ] Veterinarian verification
- [ ] Mobile-first design

### Phase 4: Community & Social Features (Aug 23-25)
- [ ] Pet owner social network
- [ ] Lost pet alert system
- [ ] Local service provider network

## 🤝 Contributing

VetTrack Pro uses an AI-first development approach. While human contributions are welcome, most improvements are automatically generated and implemented by the Daily Auto-Dev system.

### For Human Contributors

1. Check `telemetry/feedback.md` for current priorities
2. Create detailed issues with user impact analysis
3. Follow existing TypeScript and React patterns
4. Ensure changes align with the strategic roadmap

### For AI Contributors

The autonomous system continuously monitors and improves the platform based on:
- User feedback and satisfaction metrics
- System performance and reliability data
- Strategic business objectives
- Code quality and technical debt

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Production**: [VetTrack Pro Live](https://your-app.replit.app)
- **Documentation**: [API Docs](https://your-app.replit.app/docs)
- **GitHub**: [Source Code](https://github.com/fatihcvs/veteriner)
- **Issues**: [Report Bugs](https://github.com/fatihcvs/veteriner/issues)

---

**Powered by AI** 🤖 | **Built for Turkey** 🇹🇷 | **Loved by Pets** 🐾

*VetTrack Pro evolves continuously through autonomous AI development, ensuring it stays at the forefront of veterinary technology.*