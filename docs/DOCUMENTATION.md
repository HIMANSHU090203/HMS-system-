# Hospital Management System (HMS) - Complete Documentation

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** In Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Documentation Structure](#documentation-structure)
5. [Quick Start Guide](#quick-start-guide)
6. [Feature Overview](#feature-overview)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Module Descriptions](#module-descriptions)
9. [Security Features](#security-features)
10. [Deployment Guide](#deployment-guide)

---

## 🏥 Project Overview

The Hospital Management System (HMS) is a comprehensive desktop-based application designed to manage all aspects of hospital operations. Built with Electron, React, and Node.js, it provides a complete solution for patient management, appointments, consultations, prescriptions, laboratory tests, pharmacy operations, billing, and inpatient care.

### Key Characteristics

- **Type:** Desktop Application (Electron)
- **Architecture:** Full-stack (Frontend + Backend + Database)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based with role-based access control
- **Target Users:** Hospital staff (Admin, Doctors, Nurses, Lab Techs, Pharmacists, Receptionists)

### Project Goals

1. Streamline hospital operations
2. Improve patient care management
3. Enhance billing and financial tracking
4. Maintain comprehensive medical records
5. Ensure data security and compliance
6. Provide real-time inventory management

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Desktop App                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React Frontend (Renderer Process)            │   │
│  │  - UI Components                                      │   │
│  │  - State Management                                   │   │
│  │  - API Services                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕ HTTP/HTTPS                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Node.js Backend (Express API Server)            │   │
│  │  - RESTful API                                        │   │
│  │  - Business Logic                                     │   │
│  │  - Authentication & Authorization                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕ Prisma ORM                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                        │   │
│  │  - 35+ Tables                                         │   │
│  │  - Relational Data                                    │   │
│  │  - Audit Logs                                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

1. **Presentation Layer** (Frontend)
   - React components
   - UI/UX interfaces
   - Client-side routing
   - State management

2. **Application Layer** (Backend)
   - Express.js routes
   - Controllers (business logic)
   - Middleware (auth, validation, logging)
   - Services (file parsing, utilities)

3. **Data Layer** (Database)
   - PostgreSQL database
   - Prisma ORM
   - Migrations
   - Seed data

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | ~4.5.4 | Type safety |
| **Electron** | 38.2.2 | Desktop wrapper |
| **Tailwind CSS** | 3.4.18 | Styling |
| **React Router DOM** | 7.9.4 | Client-side routing |
| **Axios** | 1.12.2 | HTTP client |
| **React Hook Form** | 7.64.0 | Form management |
| **Zod** | 4.1.12 | Schema validation |
| **Lucide React** | 0.545.0 | Icons |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Prisma** | 6.19.0 | ORM & database toolkit |
| **PostgreSQL** | 14+ | Relational database |
| **JWT** | 9.0.2 | Authentication |
| **bcryptjs** | 3.0.2 | Password hashing |
| **Winston** | 3.18.3 | Logging |
| **Multer** | 2.0.2 | File uploads |
| **Zod** | 4.1.12 | Request validation |
| **Helmet** | 8.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |

### Development Tools

- **Nodemon** - Auto-reload for development
- **ts-node** - TypeScript execution
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Electron Forge** - Packaging & distribution

---

## 📚 Documentation Structure

This documentation is organized into multiple parts:

1. **[DOCUMENTATION.md](./DOCUMENTATION.md)** (This file) - Overview & general information
2. **[BACKEND.md](./BACKEND.md)** - Backend architecture, API structure, controllers
3. **[FRONTEND.md](./FRONTEND.md)** - Frontend components, services, state management
4. **[DATABASE.md](./DATABASE.md)** - Database schema, relationships, migrations
5. **[API.md](./API.md)** - Complete API endpoint documentation

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HMS-system-
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd hms-desktop
   npm install
   cd backend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb hms_database
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run Database Migrations**
   ```bash
   cd hms-desktop/backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm start
   
   # Or separately:
   # Terminal 1 - Backend
   cd hms-desktop/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd hms-desktop
   npm run start:desktop-only
   ```

6. **Access the Application**
   - Desktop app will launch automatically
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Default Login Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change default password after first login!

---

## 🎯 Feature Overview

### Core Modules

1. **User Management** - Multi-role user system with permissions
2. **Patient Management** - Complete patient profiles and medical history
3. **Appointment System** - Scheduling and management
4. **Consultation Module** - Doctor consultations with diagnosis
5. **Prescription Management** - Multi-medicine prescriptions with safety checks
6. **Laboratory Management** - Test ordering and result tracking
7. **Pharmacy Management** - Inventory, orders, and dispensing
8. **Billing System** - OPD and IPD billing with multiple payment modes
9. **IPD Management** - Inpatient care, wards, beds, rounds, vitals
10. **Hospital Configuration** - System settings and customization

### Advanced Features

- **Drug Interaction Database** - Safety checks for prescriptions
- **Prescription Templates** - Reusable prescription patterns
- **Medical Catalogs** - ICD-10 diagnosis, allergies, chronic conditions
- **Audit Logging** - Complete action tracking
- **File Uploads** - PDF reports, invoices, images
- **Low Stock Alerts** - Automated inventory warnings
- **Purchase Orders** - Supplier and order management
- **Discharge Summaries** - Complete IPD documentation

---

## 👥 User Roles & Permissions

### Available Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | System Administrator | Full system access, user management, configuration |
| **DOCTOR** | Medical Doctor | Patients, appointments, consultations, prescriptions, lab tests |
| **RECEPTIONIST** | Front Desk Staff | Patients, appointments, billing |
| **LAB_TECH** | Laboratory Technician | Lab tests, test results, reports |
| **PHARMACY** | Pharmacist | Medicines, prescriptions, inventory, orders |
| **NURSE** | Nursing Staff | IPD patients, vital signs, nursing shifts |
| **WARD_MANAGER** | Ward Administrator | IPD management, ward operations |
| **NURSING_SUPERVISOR** | Senior Nursing Staff | IPD oversight, reports |

### Module Access Matrix

| Module | Admin | Doctor | Receptionist | Lab Tech | Pharmacy | Nurse | Ward Manager |
|--------|:-----:|:------:|:------------:|:--------:|:--------:|:-----:|:------------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consultations | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Lab Tests | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Medicines | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Billing | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| IPD | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 📦 Module Descriptions

### 1. User Management Module

**Purpose:** Manage system users and their roles

**Features:**
- Create, read, update, delete users
- Role assignment
- User activation/deactivation
- Password management
- User profile management

**Access:** Admin only

---

### 2. Patient Management Module

**Purpose:** Comprehensive patient information management

**Features:**
- Patient registration
- Medical history tracking
- Allergies management (structured catalog)
- Chronic conditions tracking
- Emergency contact information
- Patient search and filtering
- Patient type: OPD, IPD, Emergency

**Access:** All roles (with different permissions)

---

### 3. Appointment System

**Purpose:** Schedule and manage patient appointments

**Features:**
- Appointment booking
- Doctor availability
- Appointment status tracking
- Calendar view
- Appointment history
- Reminders and notifications

**Access:** Admin, Doctor, Receptionist

---

### 4. Consultation Module

**Purpose:** Doctor consultations and diagnosis

**Features:**
- Consultation creation
- ICD-10 diagnosis codes
- Vital signs recording (OPD)
- Consultation notes
- Follow-up scheduling
- Diagnosis linking (primary/secondary)

**Access:** Admin, Doctor

---

### 5. Prescription Management

**Purpose:** Create and manage prescriptions

**Features:**
- Multi-medicine prescriptions
- Dosage, frequency, duration
- Food instructions
- Prescription templates
- Drug interaction checks
- Prescription dispensing
- Prescription history

**Access:** Admin, Doctor (create), Pharmacy (dispense)

---

### 6. Laboratory Management

**Purpose:** Lab test ordering and result management

**Features:**
- Test catalog with pricing
- Test ordering
- Result entry
- Report file upload (PDF/images)
- Technician assignment
- Test status tracking
- Lab type categorization (MRI, CT, X-Ray, etc.)

**Access:** Admin, Doctor (order), Lab Tech (perform)

---

### 7. Pharmacy Management

**Purpose:** Medicine inventory and dispensing

**Features:**
- Medicine catalog management
- Stock tracking
- Low stock alerts
- Purchase orders
- Supplier management
- Invoice management
- Medicine dispensing
- Transaction history
- Catalog import (Excel/CSV/PDF/Word)

**Access:** Admin, Pharmacy

---

### 8. Billing System

**Purpose:** Financial transactions and billing

**Features:**
- OPD billing
- IPD billing
- Multiple payment modes (Cash, Card, UPI, Net Banking, Insurance)
- Invoice generation
- Payment status tracking
- Tax calculation
- Financial reports

**Access:** Admin, Receptionist

---

### 9. IPD Management

**Purpose:** Inpatient department operations

**Features:**
- Ward management
- Bed allocation
- Patient admission/discharge
- Daily rounds documentation
- Vital signs monitoring
- Nursing shift tracking
- Discharge summaries
- Day care support

**Access:** Admin, Doctor, Nurse, Ward Manager

---

### 10. Hospital Configuration

**Purpose:** System settings and customization

**Features:**
- Hospital information
- Branding (logo upload)
- Operational settings
- Module enablement
- Payment settings
- Medicine pricing configuration
- Working hours
- Tax rates

**Access:** Admin only

---

## 🔒 Security Features

### Authentication

- **JWT Tokens:** Access tokens (1h expiry) + Refresh tokens (7d expiry)
- **Password Hashing:** bcryptjs with 12 rounds
- **Token Verification:** On every protected route
- **Session Management:** Secure token storage

### Authorization

- **Role-Based Access Control (RBAC):** Fine-grained permissions
- **Middleware Protection:** `authenticateToken` + `requireRole`
- **Frontend Route Guards:** Module access checks
- **API Endpoint Protection:** All routes require authentication

### Data Security

- **Input Validation:** Zod schemas for all inputs
- **SQL Injection Prevention:** Prisma ORM parameterized queries
- **XSS Protection:** Helmet.js security headers
- **CORS Configuration:** Controlled cross-origin access
- **File Upload Security:** Type and size validation

### Audit & Compliance

- **Audit Logging:** All CRUD operations tracked
- **User Action Tracking:** Complete audit trail
- **Error Logging:** Winston logger with file rotation
- **Data Integrity:** Foreign key constraints and cascades

---

## 🚢 Deployment Guide

### Development Environment

1. Follow Quick Start Guide above
2. Use `npm run dev` for hot-reload
3. Access via Electron desktop app

### Production Build

1. **Build Backend**
   ```bash
   cd hms-desktop/backend
   npm run build
   ```

2. **Build Frontend**
   ```bash
   cd hms-desktop
   npm run build
   ```

3. **Package Application**
   ```bash
   npm run make
   ```

4. **Create Installer**
   ```bash
   npm run package
   ```

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secrets
- [ ] Set up database backups
- [ ] Configure CORS for production
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure log rotation
- [ ] Test all modules
- [ ] Security audit

---

## 📊 System Statistics

- **Total API Routes:** 22 modules
- **Total Controllers:** 22 controllers
- **Database Tables:** 35+ tables
- **User Roles:** 7 roles
- **Frontend Components:** 50+ components
- **API Services:** 26 service files
- **Lines of Code:** ~15,000+ lines

---

## 📞 Support & Contact

- **Developer:** HMS Development Team
- **Email:** sharmajay9982@gmail.com
- **License:** MIT

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Core modules implemented
- IPD management added
- Enhanced pharmacy features
- Drug interaction database
- Prescription templates
- Hospital configuration

---

## 🔗 Related Documentation

- [Backend Documentation](./BACKEND.md)
- [Frontend Documentation](./FRONTEND.md)
- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)
- [Setup Instructions](../hms-desktop/backend/SETUP_INSTRUCTIONS.md)

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0



