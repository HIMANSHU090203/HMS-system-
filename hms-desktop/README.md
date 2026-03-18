# ZenHosp – Hospital Management System (HMS)

## 🏥 Project Overview

A comprehensive desktop-based Hospital Management System (**ZenHosp**) built with Electron, React, and TypeScript. It supports patient management, appointments, consultations, prescriptions, laboratory tests, pharmacy, billing, IPD (inpatient), and OT (operation theatre) management.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **UI:** Tailwind CSS
- **Desktop:** Electron (packaged with Electron Forge / Squirrel)
- **Build:** Vite (via Electron Forge plugin)
- **State:** React Context API (e.g. HospitalConfigContext)
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios (with auth interceptors)

### Backend
- **Runtime:** Node.js 18+ with Express 5
- **Language:** TypeScript
- **ORM:** Prisma (PostgreSQL)
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Zod
- **Logging:** Winston
- **Security:** Helmet, CORS, rate limiting, input sanitization
- **File Upload:** Multer (e.g. hospital logo)
- **Scheduling:** node-cron (e.g. currency exchange rates)

### Database
- **RDBMS:** PostgreSQL 14+
- **Schema & migrations:** `backend/prisma/schema.prisma` and `backend/prisma/migrations/`

## 📁 Project Structure

```
hms-desktop/
├── src/                    # Frontend React application
│   ├── main.ts             # Electron main process
│   ├── renderer.tsx        # React entry point
│   ├── components/         # App, dashboard, patients, IPD, OT, etc.
│   ├── lib/                # API client, services, hooks, utils
│   ├── config/             # Environment (API_URL, etc.)
│   └── types/              # Shared TypeScript types
├── backend/
│   ├── api/                # Backend API (entry and all server code)
│   │   ├── index.ts        # Express app, routes, health check
│   │   ├── routes/         # Auth, patients, appointments, etc.
│   │   ├── controllers/    # Business logic
│   │   └── middleware/     # Auth, error handling, rate limit
│   └── prisma/             # Schema, seed, migrations
├── docs/                   # (See repository root /docs for full documentation)
├── package.json            # Scripts: start, build, make, test
└── README.md               # This file
```

**Note:** Backend application code lives under `backend/api/` (not `backend/src/`). See `backend/RENAME_SRC_TO_API.md` for the one-time rename that was applied.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

## 📋 Documentation

- **Full docs index:** See the repository root folder `/docs` (README, ARCHITECTURE, BACKEND_API, PATIENT_ID, modules for IPD and OT).
- **Patient ID migration:** `backend/docs/MIGRATION_PATIENT_ID.md`
- **Next tasks:** Repository root `next_tasks.md` (health check, build, tests, security, deployment)

## 👥 Target Users (roles)

- **Admin:** Full access (users, config, all modules)
- **Doctor:** Patients, appointments, consultations, prescriptions, lab tests, IPD, OT
- **Receptionist:** Patients, appointments, billing, IPD, OT
- **Lab Technician:** Patients, lab tests
- **Pharmacy:** Patients, prescriptions, medicines
- **Nurse / Ward Manager / Nursing Supervisor:** IPD and OT (sub-module access varies)

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- SSL/TLS encryption
- Audit logging
- Data encryption at rest

## 📊 Key Features

- Patient registration and management (human-readable patient ID: name_last4)
- Appointment scheduling
- Consultations and prescriptions (with dispensing and PDF)
- Laboratory test ordering, results, and catalog
- Pharmacy: medicine catalog, inventory, orders, low-stock alerts
- OPD and IPD billing; finance and expense tracking
- IPD: wards, beds, admissions, daily rounds, vital signs, nursing shifts, discharge summaries
- OT: operation theatres, surgery scheduling, pre/post-op care, team, inventory, billing
- Hospital configuration (single-tenant), catalogs (diagnosis, allergy, medicine, test, procedure)
- Audit logging; drug interaction safety checks
- Currency (INR base; optional display currency and exchange rates)

## 🧪 Testing

- Unit Testing: Jest (target >80% coverage)
- Integration Testing: Cypress (E2E)
- Load Testing: k6 (50 concurrent users)

## 📦 Deployment

The application will be packaged as a Windows .exe installer for local deployment within the hospital network.

## 📄 License

MIT License

## 👨‍💻 Development Team

- **Developer:** [Your Name]
- **Email:** sharmajay9982@gmail.com

---

**Status:** In development; core OPD, IPD, and OT modules implemented.  
**Last Updated:** March 2026
