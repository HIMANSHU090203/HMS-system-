# Hospital Management System (HMS)

## 🏥 Project Overview

A comprehensive desktop-based Hospital Management System built with Electron, React, and TypeScript. This system is designed for hospital staff to manage patients, appointments, laboratory tests, pharmacy operations, and billing.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui components
- **Desktop:** Electron (for .exe packaging)
- **State Management:** React Context API + React Query
- **Forms:** React Hook Form + Zod validation
- **Calendar:** FullCalendar React
- **Notifications:** Electron Native + React Toast

### Backend
- **Runtime:** Node.js 18+ with Express.js
- **Language:** TypeScript
- **ORM:** Prisma (for PostgreSQL)
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.IO for WebSocket communication
- **File Upload:** Multer (local storage)
- **PDF Generation:** PDFKit or react-pdf

### Database
- **RDBMS:** PostgreSQL 14+ (Central Server)
- **Connection:** SSL/TLS encrypted
- **Backup:** Automated daily backups

## 📁 Project Structure

```
hms-desktop/
├── src/                    # Frontend React application
├── backend/                # Node.js Express API server
├── database/               # Database schemas and migrations
├── docs/                   # Documentation
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

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

## 📋 Development Timeline

This project follows an 8-week development plan with 4 sprints:

- **Sprint 1:** Foundation & User Management (1 Week, 3 Days)
- **Sprint 2:** Patient & Appointment Management (2 Weeks, 3 Days)
- **Sprint 3:** Laboratory & Pharmacy Management (2 Weeks)
- **Sprint 4:** Billing, Testing & Release (2 Weeks)

## 👥 Target Users

- **Admin:** System administration and user management
- **Doctor:** Patient management, appointments, prescriptions
- **Lab Technician:** Lab test management and results
- **Pharmacy Staff:** Medicine inventory and prescription fulfillment
- **Accounts:** Billing and financial management

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- SSL/TLS encryption
- Audit logging
- Data encryption at rest

## 📊 Key Features

- Patient registration and management
- Appointment scheduling with calendar
- Laboratory test ordering and results
- Prescription management
- Pharmacy inventory control
- Automated billing with GST
- Real-time notifications
- Comprehensive reporting

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

**Status:** In Development - Sprint 1, Day 1
**Last Updated:** October 10, 2025
