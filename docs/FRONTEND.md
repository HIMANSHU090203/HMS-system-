# HMS Frontend Documentation

**Version:** 1.0.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Frontend Overview](#frontend-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Application Architecture](#application-architecture)
5. [Component Structure](#component-structure)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Routing & Navigation](#routing--navigation)
9. [Authentication Flow](#authentication-flow)
10. [Styling & UI](#styling--ui)
11. [Key Components](#key-components)
12. [Development Guide](#development-guide)

---

## 🎨 Frontend Overview

The HMS frontend is a **React-based desktop application** wrapped in **Electron**. It provides a modern, responsive user interface for all hospital management operations.

### Key Characteristics

- **Framework:** React 19.2.0
- **Language:** JavaScript/TypeScript (mixed)
- **Desktop:** Electron 38.2.2
- **Styling:** Tailwind CSS 3.4.18
- **Routing:** React Router DOM 7.9.4
- **HTTP Client:** Axios 1.12.2
- **Forms:** React Hook Form 7.64.0
- **Validation:** Zod 4.1.12

### Application Type

- **Desktop Application** (Electron wrapper)
- **Single Page Application (SPA)**
- **Role-Based Access Control (RBAC)**
- **Module-Based Architecture**

---

## 📁 Project Structure

```
hms-desktop/
├── src/
│   ├── components/              # React components
│   │   ├── App.js              # Main app component
│   │   ├── ErrorBoundary.jsx   # Error boundary
│   │   │
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.js
│   │   │   ├── ChangePasswordModal.js
│   │   │   └── ForgotPasswordModal.js
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── RoleBasedDashboard.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Header.js
│   │   │   └── Sidebar.js
│   │   │
│   │   ├── patients/           # Patient management
│   │   │   └── PatientManagement.js
│   │   │
│   │   ├── appointments/       # Appointment management
│   │   │   └── AppointmentManagement.js
│   │   │
│   │   ├── consultations/      # Consultation management
│   │   │   └── ConsultationManagement.js
│   │   │
│   │   ├── prescriptions/      # Prescription management
│   │   │   ├── PrescriptionManagement.js
│   │   │   └── PrescriptionTemplates.js
│   │   │
│   │   ├── labTests/           # Lab test management
│   │   │   └── LabTestManagement.js
│   │   │
│   │   ├── medicines/          # Pharmacy management
│   │   │   ├── MedicineManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   └── ImportCatalogWizard.jsx
│   │   │
│   │   ├── billing/            # Billing management
│   │   │   └── BillingManagement.jsx
│   │   │
│   │   ├── ipd/                # IPD management (9 components)
│   │   │   ├── IPDManagement.js
│   │   │   ├── IPDDashboard.js
│   │   │   ├── WardManagement.js
│   │   │   ├── BedManagement.js
│   │   │   ├── AdmissionManagement.js
│   │   │   ├── PatientCare.js
│   │   │   ├── NursingCare.js
│   │   │   ├── DischargeManagement.js
│   │   │   └── IPDBilling.js
│   │   │
│   │   ├── users/              # User management
│   │   │   └── UserManagement.js
│   │   │
│   │   ├── config/             # Configuration
│   │   │   ├── ConfigurationManagement.js
│   │   │   ├── SystemConfig.js
│   │   │   └── CatalogManagement.js
│   │   │
│   │   ├── setup/              # Setup wizards
│   │   │   ├── HospitalSetupWizard.js
│   │   │   └── UserOnboardingWizard.js
│   │   │
│   │   └── common/             # Shared components
│   │       ├── LoadingSpinner.js
│   │       ├── InfoButton.js
│   │       ├── MedicineSearchAutocomplete.js
│   │       ├── SafetyWarning.js
│   │       └── AuditLogs.js
│   │
│   ├── lib/                    # Libraries and utilities
│   │   ├── api/                # API services
│   │   │   ├── config.ts       # Axios configuration
│   │   │   ├── index.ts        # API client export
│   │   │   ├── types.ts        # TypeScript types
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   └── services/       # API service files (26 files)
│   │   │       ├── authService.ts
│   │   │       ├── userService.ts
│   │   │       ├── patientService.ts
│   │   │       ├── appointmentService.ts
│   │   │       ├── consultationService.ts
│   │   │       ├── prescriptionService.ts
│   │   │       ├── labTestService.ts
│   │   │       ├── medicineService.ts
│   │   │       ├── billingService.ts
│   │   │       ├── admissionService.ts
│   │   │       ├── wardService.ts
│   │   │       ├── bedService.ts
│   │   │       ├── dailyRoundService.ts
│   │   │       ├── vitalSignService.ts
│   │   │       ├── nursingShiftService.ts
│   │   │       ├── dischargeService.ts
│   │   │       ├── inpatientBillService.ts
│   │   │       ├── catalogService.ts
│   │   │       ├── configService.ts
│   │   │       ├── safetyService.ts
│   │   │       └── auditService.ts
│   │   │
│   │   ├── contexts/           # React contexts
│   │   │   └── HospitalConfigContext.js
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useAuth.ts
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── rolePermissions.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   │
│   │   └── infoContent.js      # Info content for modules
│   │
│   ├── config/                 # Configuration files
│   │   └── environment.ts      # Environment configuration
│   │
│   ├── styles/                 # Global styles
│   │   ├── index.css           # Main CSS file
│   │   └── software-theme.js   # Theme configuration
│   │
│   ├── utils/                  # Additional utilities
│   │   └── connectionTest.js   # Connection testing
│   │
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Electron preload script
│   ├── renderer.js             # React renderer entry point
│   └── index.css               # Global CSS
│
├── index.html                  # HTML entry point
├── package.json
├── tsconfig.json
├── tailwind.config.js          # Tailwind configuration
├── vite.main.config.ts         # Vite config for main process
├── vite.preload.config.ts      # Vite config for preload
└── vite.renderer.config.ts     # Vite config for renderer
```

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | ~4.5.4 | Type safety |
| **Electron** | 38.2.2 | Desktop wrapper |
| **Vite** | 5.4.20 | Build tool |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.18 | Utility-first CSS |
| **Lucide React** | 0.545.0 | Icon library |
| **Radix UI** | Various | UI primitives |

### State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Context API** | Built-in | Global state |
| **Axios** | 1.12.2 | HTTP client |
| **React Hook Form** | 7.64.0 | Form management |
| **Zod** | 4.1.12 | Schema validation |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Router DOM** | 7.9.4 | Client-side routing |

---

## 🏗️ Application Architecture

### Electron Architecture

```
┌─────────────────────────────────────────┐
│         Electron Application            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   Main Process (main.ts)          │  │
│  │   - Window management              │  │
│  │   - Menu creation                  │  │
│  │   - App lifecycle                  │  │
│  └───────────────────────────────────┘  │
│              ↕ IPC                      │
│  ┌───────────────────────────────────┐  │
│  │   Preload (preload.ts)            │  │
│  │   - Secure bridge                 │  │
│  └───────────────────────────────────┘  │
│              ↕                          │
│  ┌───────────────────────────────────┐  │
│  │   Renderer Process (React)        │  │
│  │   - UI components                 │  │
│  │   - State management              │  │
│  │   - API calls                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### React Component Hierarchy

```
App
├── HospitalSetupWizard (if no config)
├── UserOnboardingWizard (if no users)
├── LoginForm (if not authenticated)
└── Main Application (if authenticated)
    ├── Navigation
    └── Current Module
        ├── Dashboard
        ├── PatientManagement
        ├── AppointmentManagement
        ├── ConsultationManagement
        ├── PrescriptionManagement
        ├── LabTestManagement
        ├── MedicineManagement
        ├── BillingManagement
        ├── IPDManagement
        ├── UserManagement
        └── ConfigurationManagement
```

---

## 🧩 Component Structure

### Component Categories

#### 1. **Layout Components**
- `App.js` - Main application wrapper
- `Header.js` - Top navigation bar
- `Sidebar.js` - Side navigation menu
- `RoleBasedDashboard.js` - Role-specific dashboard

#### 2. **Feature Components**
- **Patient Management:** `PatientManagement.js`
- **Appointments:** `AppointmentManagement.js`
- **Consultations:** `ConsultationManagement.js`
- **Prescriptions:** `PrescriptionManagement.js`
- **Lab Tests:** `LabTestManagement.js`
- **Medicines:** `MedicineManagement.jsx`
- **Billing:** `BillingManagement.jsx`
- **IPD:** `IPDManagement.js` + 8 sub-components
- **Users:** `UserManagement.js`
- **Config:** `ConfigurationManagement.js`

#### 3. **Shared Components**
- `LoadingSpinner.js` - Loading indicator
- `InfoButton.js` - Information tooltip
- `MedicineSearchAutocomplete.js` - Medicine search
- `SafetyWarning.js` - Drug interaction warnings
- `AuditLogs.js` - Audit log viewer

#### 4. **Form Components**
- `LoginForm.js` - User login
- `ChangePasswordModal.js` - Password change
- `ForgotPasswordModal.js` - Password recovery

#### 5. **Setup Components**
- `HospitalSetupWizard.js` - Initial hospital setup
- `UserOnboardingWizard.js` - First user creation

---

## 🔄 State Management

### State Management Approach

The application uses a **hybrid state management** approach:

1. **Local State (useState)**
   - Component-specific state
   - Form inputs
   - UI toggles

2. **Context API (React Context)**
   - Global application state
   - User authentication
   - Hospital configuration

3. **Local Storage**
   - JWT tokens
   - User preferences
   - Session data

### Context Providers

#### HospitalConfigContext

**Location:** `src/lib/contexts/HospitalConfigContext.js`

**Purpose:** Provides hospital configuration to all components

**State:**
- Hospital name
- Logo URL
- Configuration settings
- Module enablement

**Usage:**
```javascript
import { HospitalConfigProvider } from '../lib/contexts/HospitalConfigContext';

<HospitalConfigProvider>
  <App />
</HospitalConfigProvider>
```

### Authentication State

**Storage:** `localStorage`

**Items:**
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token

**State Flow:**
1. User logs in → Token stored in localStorage
2. Token attached to API requests via Axios interceptor
3. Token validated on app load
4. Token cleared on logout

---

## 🌐 API Integration

### API Client Configuration

**Location:** `src/lib/api/config.ts`

**Features:**
- Base URL configuration
- Request interceptors (add auth token)
- Response interceptors (handle errors)
- Token refresh logic
- Error handling

**Configuration:**
```typescript
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

Automatically adds JWT token to requests:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

Handles authentication errors:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  }
);
```

### API Services

**Location:** `src/lib/api/services/`

**26 Service Files:**

1. `authService.ts` - Authentication
2. `userService.ts` - User management
3. `patientService.ts` - Patient operations
4. `appointmentService.ts` - Appointments
5. `consultationService.ts` - Consultations
6. `prescriptionService.ts` - Prescriptions
7. `labTestService.ts` - Lab tests
8. `medicineService.ts` - Medicines
9. `billingService.ts` - Billing
10. `admissionService.ts` - IPD admissions
11. `wardService.ts` - Ward management
12. `bedService.ts` - Bed management
13. `dailyRoundService.ts` - Daily rounds
14. `vitalSignService.ts` - Vital signs
15. `nursingShiftService.ts` - Nursing shifts
16. `dischargeService.ts` - Discharge summaries
17. `inpatientBillService.ts` - IPD billing
18. `catalogService.ts` - Medical catalogs
19. `configService.ts` - Configuration
20. `safetyService.ts` - Drug safety
21. `auditService.ts` - Audit logs

**Service Pattern:**
```typescript
export const getPatients = async () => {
  const response = await apiClient.get('/patients');
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await apiClient.post('/patients', patientData);
  return response.data;
};
```

---

## 🧭 Routing & Navigation

### Navigation System

**Type:** Module-based navigation (not React Router)

**Implementation:** Custom navigation in `App.js`

**Navigation Flow:**
1. User clicks module in dashboard
2. `handleNavigation(module, action)` called
3. `currentModule` state updated
4. `renderCurrentModule()` renders appropriate component

### Available Modules

| Module | Component | Access Roles |
|--------|-----------|--------------|
| `dashboard` | `RoleBasedDashboard` | All |
| `patients` | `PatientManagement` | All |
| `appointments` | `AppointmentManagement` | Admin, Doctor, Receptionist |
| `consultations` | `ConsultationManagement` | Admin, Doctor |
| `prescriptions` | `PrescriptionManagement` | Admin, Doctor, Pharmacy |
| `labTests` | `LabTestManagement` | Admin, Doctor, Lab Tech |
| `medicines` | `MedicineManagement` | Admin, Pharmacy, Doctor |
| `billing` | `BillingManagement` | Admin, Receptionist |
| `ipd` | `IPDManagement` | Admin, Doctor, Nurse, Ward Manager |
| `users` | `UserManagement` | Admin |
| `config` | `ConfigurationManagement` | Admin |
| `catalog` | `CatalogManagement` | Admin |

### Navigation Guards

**Location:** `src/lib/utils/rolePermissions.js`

**Function:** `hasModuleAccess(userRole, module)`

**Usage:**
```javascript
if (hasModuleAccess(user.role, 'patients')) {
  // Allow access
} else {
  // Show access denied
}
```

---

## 🔐 Authentication Flow

### Login Flow

1. **User enters credentials** → `LoginForm.js`
2. **Form submission** → `handleLogin(credentials)`
3. **API call** → `authService.login(credentials)`
4. **Token received** → Stored in `localStorage`
5. **User state updated** → `setUser(response.user)`
6. **Authentication flag** → `setIsAuthenticated(true)`
7. **Redirect** → Dashboard

### Authentication Check

**On App Load:**
1. Check for token in `localStorage`
2. Validate token format (3 parts)
3. Call `authService.getCurrentUser()`
4. If valid → Set user state
5. If invalid → Clear tokens

### Logout Flow

1. **User clicks logout** → `handleLogout()`
2. **Clear tokens** → `localStorage.removeItem('accessToken')`
3. **Clear user state** → `setUser(null)`
4. **Set auth flag** → `setIsAuthenticated(false)`
5. **Reset navigation** → `setCurrentModule('dashboard')`
6. **Redirect** → Login form

### Token Management

**Storage:**
- `accessToken` - Short-lived (1 hour)
- `refreshToken` - Long-lived (7 days)

**Refresh Logic:**
- Automatic refresh on 401 errors
- Manual refresh via `/api/auth/refresh`
- Token expiry handling

---

## 🎨 Styling & UI

### Tailwind CSS

**Configuration:** `tailwind.config.js`

**Features:**
- Utility-first CSS
- Custom color palette
- Responsive design
- Dark mode support (ready)

### Component Styling

**Pattern:** Utility classes + inline styles

**Example:**
```jsx
<div className="p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-800">
    Title
  </h2>
</div>
```

### Icons

**Library:** Lucide React

**Usage:**
```jsx
import { User, Settings, LogOut } from 'lucide-react';

<User size={20} />
```

### Theme

**Location:** `src/styles/software-theme.js`

**Customization:**
- Color schemes
- Typography
- Spacing
- Component styles

---

## 🎯 Key Components

### 1. App Component

**File:** `src/components/App.js`

**Responsibilities:**
- Application initialization
- Setup state management
- Authentication flow
- Module routing
- Backend connection handling

**Key Features:**
- Setup wizards (hospital, user onboarding)
- Backend offline detection
- Auto-retry mechanism
- Module-based navigation

### 2. RoleBasedDashboard

**File:** `src/components/dashboard/RoleBasedDashboard.js`

**Responsibilities:**
- Role-specific dashboard rendering
- Module cards display
- Quick actions
- Dashboard widgets
- Statistics display

**Role-Specific Features:**
- Admin: System overview, user stats
- Doctor: Today's appointments, consultations
- Receptionist: Patient queue, billing
- Lab Tech: Pending tests, equipment status
- Pharmacy: Low stock alerts, pending prescriptions

### 3. PatientManagement

**File:** `src/components/patients/PatientManagement.js`

**Features:**
- Patient list with search/filter
- Patient registration form
- Patient details view
- Medical history
- Allergies management
- Chronic conditions

### 4. PrescriptionManagement

**File:** `src/components/prescriptions/PrescriptionManagement.js`

**Features:**
- Prescription creation
- Multi-medicine support
- Dosage, frequency, duration
- Drug interaction checks
- Prescription templates
- Dispensing workflow

### 5. IPDManagement

**File:** `src/components/ipd/IPDManagement.js`

**Sub-components:**
- `IPDDashboard.js` - IPD overview
- `WardManagement.js` - Ward operations
- `BedManagement.js` - Bed allocation
- `AdmissionManagement.js` - Patient admission
- `PatientCare.js` - Patient care tracking
- `NursingCare.js` - Nursing operations
- `DischargeManagement.js` - Discharge process
- `IPDBilling.js` - IPD billing

### 6. MedicineManagement

**File:** `src/components/medicines/MedicineManagement.jsx`

**Features:**
- Medicine catalog
- Stock management
- Low stock alerts
- Purchase orders
- Supplier management
- Catalog import (Excel/CSV/PDF)

---

## 🛠️ Development Guide

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package Electron app
npm run make
```

### Development Scripts

```json
{
  "start": "Start both backend and desktop",
  "backend": "Start backend only",
  "desktop": "Start desktop only",
  "build": "Build for production",
  "make": "Package Electron app"
}
```

### Code Style

- **JavaScript/JSX** for components
- **TypeScript** for API services
- **Functional components** with hooks
- **ES6+ syntax**

### Best Practices

1. **Component Organization**
   - One component per file
   - Descriptive file names
   - Folder structure by feature

2. **State Management**
   - Use local state for component-specific data
   - Use Context for global state
   - Avoid prop drilling

3. **API Calls**
   - Use service functions from `lib/api/services`
   - Handle errors gracefully
   - Show loading states

4. **Error Handling**
   - Use ErrorBoundary for component errors
   - Display user-friendly error messages
   - Log errors to console

5. **Performance**
   - Use React.memo for expensive components
   - Lazy load heavy modules
   - Optimize re-renders

---

## 📱 Responsive Design

### Desktop-First Approach

- Optimized for desktop screens (1400x900 minimum)
- Electron window size: 1400x900
- Responsive grid layouts
- Scrollable content areas

### Breakpoints

- **Desktop:** 1400px+
- **Tablet:** 768px - 1399px
- **Mobile:** < 768px (not optimized)

---

## 🔍 Debugging

### Developer Tools

**Access:** F12 or Ctrl+Shift+I

**Features:**
- React DevTools
- Console logging
- Network monitoring
- Component inspection

### Logging

**Console Logs:**
- Component lifecycle
- API calls
- State changes
- Error messages

**Example:**
```javascript
console.log('Component mounted');
console.error('Error occurred:', error);
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Axios Documentation](https://axios-http.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0



