# HealthBridge Medical App

A comprehensive digital healthcare platform that connects patients with healthcare providers, enabling seamless medical consultations, prescription management, and health monitoring.

## Features

- 🏥 **Doctor-Patient Consultations** - Book and manage medical appointments
- 📹 **Video Consultations** - Secure telehealth video calls
- 💊 **Prescription Management** - Digital prescription writing and tracking
- 🔍 **Symptom Checker** - AI-powered symptom analysis tool
- 👩‍⚕️ **Doctor Dashboard** - Comprehensive provider management interface
- 👤 **Patient Portal** - Personal health records and appointment management
- 💳 **Billing & Payments** - Integrated payment processing for medical services
- 🔐 **Secure Authentication** - HIPAA-compliant user authentication
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- Frontend: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs/guides/nextjs), [Shadcn](https://ui.shadcn.com/docs/installation), [Framer Motion](https://www.framer.com/motion/introduction/)
- Backend: [PostgreSQL](https://www.postgresql.org/about/), [Supabase](https://supabase.com/), [Drizzle](https://orm.drizzle.team/docs/get-started-postgresql), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Auth: [Clerk](https://clerk.com/)
- Payments: [Stripe](https://stripe.com/)

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
# DB
DATABASE_URL=
# Access Supabase Studio here: http://127.0.0.1:54323/project/default

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=
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
├── app/
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── consultation/        # Consultation management
│   │   └── onboarding/         # User onboarding flows
│   ├── (unauthenticated)/      # Public routes
│   │   └── (marketing)/        # Landing pages
│   └── api/                    # API endpoints
├── components/                 # Reusable UI components
├── db/                        # Database schema and migrations
├── actions/                   # Server actions
└── lib/                      # Utility functions
```

## Key Features in Detail

### For Patients
- **Find Doctors** - Search and filter healthcare providers by specialty
- **Book Consultations** - Schedule appointments with preferred doctors
- **Video Calls** - Secure, HIPAA-compliant video consultations
- **Prescription Access** - View and manage digital prescriptions
- **Symptom Checker** - Get preliminary health assessments

### For Healthcare Providers
- **Doctor Dashboard** - Manage appointments and patient records
- **Prescription Writing** - Create and send digital prescriptions
- **Patient Management** - Access patient history and consultation notes
- **Video Consultations** - Conduct secure telehealth appointments
- **Billing Integration** - Process payments and manage billing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the GitHub repository or contact the development team.
