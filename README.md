# HealthBridge Medical App

A comprehensive digital healthcare platform that connects patients with healthcare providers, enabling seamless medical consultations, prescription management, and health monitoring. Built with Next.js 15, modern UI components, and real-time features.

## Features

### Core Functionality
- 🏥 **Doctor-Patient Consultations** - Real-time chat and video consultations
- 📹 **Video Consultations** - Secure telehealth video calls with room management
- 💊 **Prescription Management** - Digital prescription writing, tracking, and pharmacy integration
- 🔍 **Symptom Checker** - Interactive symptom analysis and preliminary assessments
- 📱 **Real-time Messaging** - Secure chat system for consultations
- 🔐 **Role-based Access Control** - Patient, Doctor, and Admin dashboards

### Patient Features
- 👤 **Patient Portal** - Personal health records and appointment management
- 📋 **Medical Records** - Comprehensive health history tracking
- 💊 **Prescription Access** - View and manage digital prescriptions
- ⏰ **Health Reminders** - Medication and appointment reminders
- 📊 **Health Summary** - Visual health metrics and progress tracking

### Doctor Features
- 👩‍⚕️ **Doctor Dashboard** - Patient queue, earnings, and consultation management
- 📝 **Prescription Writing** - Advanced prescription creation with drug interactions
- 👥 **Patient Records** - Access patient history and medical records
- ⚕️ **Consultation Notes** - Detailed consultation documentation
- 📅 **Schedule Management** - Availability settings and appointment scheduling
- ✅ **Verification System** - Medical license verification and credentialing

### Admin Features
- 🛡️ **Admin Panel** - User management, analytics, and system oversight
- 📊 **Analytics Dashboard** - Platform usage statistics and reporting
- 💰 **Financial Management** - Revenue tracking and financial reporting
- 🔍 **User Management** - Doctor verification and user administration
- 📈 **System Reports** - Comprehensive platform analytics

### Additional Features
- 💳 **Billing & Payments** - Integrated payment processing with Stripe
- 🔐 **Secure Authentication** - HIPAA-compliant user authentication with Clerk
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Real-time Updates** - Live chat and notifications with Supabase

## Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/docs)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs)** - Utility-first styling
- **[Shadcn/ui](https://ui.shadcn.com/docs/installation)** - Modern UI components
- **[Framer Motion](https://www.framer.com/motion/introduction/)** - Smooth animations
- **[Lucide React](https://lucide.dev/guide/packages/lucide-react)** - Beautiful icons

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/about/)** - Primary database
- **[Supabase](https://supabase.com/)** - Backend as a service with real-time features
- **[Drizzle ORM](https://orm.drizzle.team/docs/get-started-postgresql)** - Type-safe database operations
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Full-stack data mutations

### Authentication & Payments
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Stripe](https://stripe.com/)** - Payment processing and billing

### Development & Deployment
- **[Vercel](https://vercel.com/)** - Hosting and deployment
- **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)** - Code quality and formatting

## Prerequisites

You will need accounts for the following services.

They all have free plans that you can use to get started.

- Create a [GitHub](https://github.com/) account
- Create a [Supabase](https://supabase.com/) account
- Create a [Clerk](https://clerk.com/) account
- Create a [Stripe](https://stripe.com/) account
- Create a [Vercel](https://vercel.com/) account

You will likely not need paid plans unless you are building a business.

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:54322/postgres
# Access Supabase Studio here: http://127.0.0.1:54323/project/default

# Supabase (for real-time features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=your_yearly_payment_link
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=your_monthly_payment_link
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/LaibaBatool01/HealthBridge-MedicalApp.git
   cd HealthBridge-MedicalApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in the environment variables listed above

4. **Set up the database**
   ```bash
   npx supabase start
   npx drizzle-kit push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Sign up as a doctor or patient to explore the platform

## Project Structure

```
HealthBridge-MedicalApp/
├── app/
│   ├── (authenticated)/          # Protected routes requiring authentication
│   │   ├── dashboard/           # Role-based dashboards (patient, doctor, admin)
│   │   │   └── (pages)/        # Dashboard sub-pages
│   │   │       ├── admin/      # Admin panel pages
│   │   │       ├── consultations/ # Consultation management
│   │   │       ├── earnings/   # Doctor earnings
│   │   │       ├── medical-records/ # Patient records
│   │   │       ├── prescriptions/ # Prescription management
│   │   │       └── ...         # Other role-specific pages
│   │   └── consultation/        # Active consultation pages
│   │       ├── book/           # Consultation booking flow
│   │       ├── chat/           # Real-time chat interface
│   │       └── video/          # Video consultation room
│   ├── (unauthenticated)/      # Public routes
│   │   ├── (auth)/             # Authentication pages
│   │   └── (marketing)/        # Landing and marketing pages
│   └── api/                    # API endpoints
│       ├── consultations/      # Consultation API routes
│       └── messages/           # Real-time messaging API
├── actions/                    # Server actions for data operations
│   ├── admin.ts               # Admin-specific actions
│   ├── consultations.ts       # Consultation management
│   ├── doctors.ts             # Doctor-related actions
│   ├── messages.ts            # Real-time messaging
│   ├── users.ts               # User management
│   └── ...                    # Other domain-specific actions
├── components/                 # Reusable UI components
│   └── ui/                    # Shadcn UI components
├── db/                        # Database layer
│   ├── schema/                # Drizzle ORM schemas
│   ├── migrations/            # Database migrations
│   └── index.ts               # Database connection
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions and configurations
└── middleware.ts              # Next.js middleware for auth/routing
```

## Key Features in Detail

### Patient Experience
- **🔍 Find Doctors** - Search and filter healthcare providers by specialty, rating, and availability
- **📅 Book Consultations** - Flexible booking with chat, video, or in-person options
- **💬 Real-time Chat** - Secure messaging with healthcare providers during consultations
- **📹 Video Consultations** - HD video calls with screen sharing and recording capabilities
- **💊 Digital Prescriptions** - View, track, and manage prescriptions with pharmacy integration
- **📋 Health Records** - Comprehensive medical history and document storage
- **⏰ Smart Reminders** - Medication alerts and appointment notifications
- **📊 Health Dashboard** - Visual health metrics and progress tracking

### Doctor Workflow
- **👥 Patient Queue** - Real-time patient management and consultation scheduling
- **💰 Earnings Dashboard** - Revenue tracking with detailed financial analytics
- **📝 Prescription Writer** - Advanced prescription creation with drug interaction warnings
- **📋 Patient Records** - Complete patient history with notes and attachments
- **⚕️ Consultation Tools** - Integrated chat, video, and documentation tools
- **📅 Schedule Management** - Flexible availability settings and automated booking
- **✅ License Verification** - Streamlined credential verification process
- **📊 Performance Analytics** - Consultation metrics and patient feedback tracking

### Admin Control Panel
- **👤 User Management** - Comprehensive user administration and role assignment
- **📈 Platform Analytics** - Real-time usage statistics and performance metrics
- **💼 Doctor Verification** - Medical license validation and approval workflow
- **💰 Financial Dashboard** - Revenue tracking and financial reporting
- **🔧 System Settings** - Platform configuration and feature management
- **📋 Report Generation** - Automated reporting for compliance and analytics
- **🛡️ Security Monitoring** - User activity tracking and security oversight

## Development Commands

### Available Scripts
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run types        # Run TypeScript type checking
npm run format:write # Format code with Prettier
npm run clean        # Run both lint:fix and format:write

# Database
npx drizzle-kit push      # Push schema changes to database
npx drizzle-kit generate  # Generate migration files
npx drizzle-kit migrate   # Run migrations
npx bun db/seed          # Seed database with sample data

# Supabase
npx supabase start       # Start local Supabase instance
npx supabase stop        # Stop local Supabase instance
npx supabase status      # Check Supabase status

# Testing (if implemented)
npm run test             # Run all tests
npm run test:unit        # Run Jest unit tests
npm run test:e2e         # Run Playwright e2e tests

# UI Components
npx shadcn@latest add [component-name]  # Add Shadcn UI components
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git fork https://github.com/LaibaBatool01/HealthBridge-MedicalApp.git
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HealthBridge-MedicalApp.git
   cd HealthBridge-MedicalApp
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

5. **Run quality checks**
   ```bash
   npm run clean        # Format and lint
   npm run types        # Type check
   npm run build        # Test build
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then open a Pull Request on GitHub
   ```

### Code Style Guidelines
- Use TypeScript for all new code
- Follow the existing file structure and naming conventions
- Write meaningful commit messages using conventional commits
- Ensure all new features work across patient, doctor, and admin roles
- Test your changes thoroughly before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the development team.
