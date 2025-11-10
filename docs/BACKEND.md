# HMS Backend Documentation

**Version:** 1.0.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Backend Overview](#backend-overview)
2. [Project Structure](#project-structure)
3. [Server Configuration](#server-configuration)
4. [Authentication & Authorization](#authentication--authorization)
5. [Middleware](#middleware)
6. [Routes & Controllers](#routes--controllers)
7. [Services](#services)
8. [Error Handling](#error-handling)
9. [Logging](#logging)
10. [File Uploads](#file-uploads)
11. [Database Integration](#database-integration)
12. [API Response Format](#api-response-format)

---

## 🏗️ Backend Overview

The HMS backend is a **Node.js + Express.js** RESTful API server built with **TypeScript**. It provides all business logic, data validation, authentication, and database operations for the desktop application.

### Key Characteristics

- **Framework:** Express.js 5.1.0
- **Language:** TypeScript 5.9.3
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod schemas
- **Logging:** Winston
- **File Handling:** Multer

### Server Details

- **Default Port:** 3000
- **Base URL:** `http://localhost:3000/api`
- **Health Check:** `http://localhost:3000/health`
- **Environment:** Development/Production

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── controllers/             # Business logic (22 files)
│   │   ├── admissionController.ts
│   │   ├── appointmentController.ts
│   │   ├── auditController.ts
│   │   ├── bedController.ts
│   │   ├── billingController.ts
│   │   ├── catalogController.ts
│   │   ├── configController.ts
│   │   ├── consultationController.ts
│   │   ├── dailyRoundController.ts
│   │   ├── dischargeSummaryController.ts
│   │   ├── inpatientBillController.ts
│   │   ├── labTestController.ts
│   │   ├── medicineController.ts
│   │   ├── nursingShiftController.ts
│   │   ├── patientController.ts
│   │   ├── prescriptionController.ts
│   │   ├── safetyController.ts
│   │   ├── userController.ts
│   │   ├── vitalSignController.ts
│   │   └── wardController.ts
│   │
│   ├── routes/                  # API route definitions (22 files)
│   │   ├── admissions.ts
│   │   ├── appointments.ts
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── beds.ts
│   │   ├── billing.ts
│   │   ├── bills.ts
│   │   ├── catalog.ts
│   │   ├── config.ts
│   │   ├── consultations.ts
│   │   ├── dailyRounds.ts
│   │   ├── discharge.ts
│   │   ├── inpatientBills.ts
│   │   ├── labTests.ts
│   │   ├── medicines.ts
│   │   ├── nursingShifts.ts
│   │   ├── patients.ts
│   │   ├── prescriptions.ts
│   │   ├── safety.ts
│   │   ├── users.ts
│   │   ├── vitalSigns.ts
│   │   └── wards.ts
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── requestLogger.ts     # Request logging
│   │   └── upload.ts            # File upload (Multer)
│   │
│   ├── services/                # Business services
│   │   └── fileParserService.ts # File parsing (Excel, PDF, Word)
│   │
│   └── utils/                   # Utility functions
│       └── logger.ts            # Winston logger
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data
│
├── uploads/                     # File upload directory
│   └── logos/                   # Hospital logos
│
├── logs/                        # Log files
│   ├── combined.log
│   ├── error.log
│   ├── debug.log
│   ├── exceptions.log
│   └── rejections.log
│
├── dist/                        # Compiled JavaScript (build output)
├── package.json
├── tsconfig.json
└── .env                         # Environment variables
```

---

## ⚙️ Server Configuration

### Entry Point: `src/index.ts`

The main server file initializes Express, configures middleware, loads routes, and starts the server.

#### Key Features:

1. **Express App Initialization**
   ```typescript
   const app = express();
   const PORT = process.env.PORT || 3000;
   ```

2. **Security Middleware**
   - Helmet.js for HTTP headers
   - CORS configuration
   - Body parsing (JSON, URL-encoded)
   - File size limits (10MB)

3. **Static File Serving**
   ```typescript
   app.use('/api/uploads', express.static('uploads'));
   ```

4. **Health Check Endpoint**
   ```typescript
   app.get('/health', (req, res) => {
     res.status(200).json({
       success: true,
       status: 'OK',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       environment: process.env.NODE_ENV || 'development',
     });
   });
   ```

5. **Dynamic Route Loading**
   - 22 route modules loaded dynamically
   - Error handling for failed route loads
   - Logging of loaded routes

6. **Error Handling**
   - 404 handler for unknown routes
   - Global error handler middleware
   - Graceful shutdown handling

7. **Database Connection**
   - Prisma client initialization
   - Connection timeout (10 seconds)
   - Graceful error handling

### Environment Variables

Required environment variables (`.env` file):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hms_database"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"

# Application
APP_NAME="HMS Desktop"
HOSPITAL_NAME="Your Hospital Name"
```

---

## 🔐 Authentication & Authorization

### Authentication Middleware: `src/middleware/auth.ts`

#### `authenticateToken` Middleware

Validates JWT tokens on protected routes.

**Process:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature with JWT_SECRET
3. Checks token expiry
4. Validates user exists and is active
5. Attaches user info to `req.user`

**Usage:**
```typescript
router.use(authenticateToken); // Apply to all routes
```

**Request Extension:**
```typescript
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    fullName: string;
  };
}
```

#### `requireRole` Middleware

Enforces role-based access control.

**Usage:**
```typescript
router.get('/admin-only', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  controllerFunction
);
```

**Multiple Roles:**
```typescript
router.get('/doctors-and-admin', 
  authenticateToken, 
  requireRole(UserRole.ADMIN, UserRole.DOCTOR), 
  controllerFunction
);
```

**Predefined Role Middleware:**
- `requireAdmin` - Admin only
- `requireDoctor` - Doctor only
- `requireLabTech` - Lab Technician only
- `requirePharmacy` - Pharmacy only
- `requireReceptionist` - Receptionist only

#### Helper Functions

```typescript
canAccessPatientData(userRole: UserRole): boolean
canAccessFinancialData(userRole: UserRole): boolean
canManageUsers(userRole: UserRole): boolean
canManageSystem(userRole: UserRole): boolean
```

---

## 🛡️ Middleware

### 1. Error Handler: `src/middleware/errorHandler.ts`

Centralized error handling middleware.

**Features:**
- Catches all errors from routes
- Formats error responses
- Logs errors
- Handles validation errors
- Handles Prisma errors
- Returns appropriate HTTP status codes

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### 2. Request Logger: `src/middleware/requestLogger.ts`

Logs all incoming HTTP requests.

**Information Logged:**
- Request method and URL
- Request timestamp
- Response status code
- Response time
- User information (if authenticated)
- IP address

**Log Format:**
```
[timestamp] [method] [url] [status] [responseTime]ms [user]
```

### 3. File Upload: `src/middleware/upload.ts`

Multer configuration for file uploads.

**Configuration:**
- Storage: Local filesystem (`uploads/` directory)
- File size limit: 10MB
- Allowed file types: Images, PDFs, Excel, Word documents

**Usage:**
```typescript
router.post('/upload', 
  authenticateToken, 
  upload.single('file'), 
  controllerFunction
);
```

**File Access:**
- Uploaded files accessible at: `/api/uploads/<filename>`
- Hospital logos: `/api/uploads/logos/<filename>`

---

## 🛣️ Routes & Controllers

### Route Structure

All routes follow this pattern:
```
/api/<module>/<action>
```

Example:
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Route Modules

#### 1. Authentication Routes (`/api/auth`)

**File:** `src/routes/auth.ts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/register` | Register new user | Admin only |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh` | Refresh access token | Yes |
| POST | `/logout` | User logout | Yes |

**Controller:** `src/controllers/userController.ts` (auth functions)

---

#### 2. User Routes (`/api/users`)

**File:** `src/routes/users.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all users | Yes | Admin |
| GET | `/:id` | Get user by ID | Yes | Admin |
| POST | `/` | Create user | Yes | Admin |
| PUT | `/:id` | Update user | Yes | Admin |
| DELETE | `/:id` | Delete user | Yes | Admin |
| PATCH | `/:id/status` | Toggle user status | Yes | Admin |

**Controller:** `src/controllers/userController.ts`

---

#### 3. Patient Routes (`/api/patients`)

**File:** `src/routes/patients.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all patients | Yes | All |
| GET | `/:id` | Get patient by ID | Yes | All |
| POST | `/` | Create patient | Yes | Admin, Receptionist |
| PUT | `/:id` | Update patient | Yes | Admin, Receptionist |
| DELETE | `/:id` | Delete patient | Yes | Admin |
| GET | `/:id/allergies` | Get patient allergies | Yes | All |
| POST | `/:id/allergies` | Add allergy | Yes | Doctor, Admin |
| DELETE | `/:id/allergies/:allergyId` | Remove allergy | Yes | Doctor, Admin |
| GET | `/:id/conditions` | Get chronic conditions | Yes | All |
| POST | `/:id/conditions` | Add condition | Yes | Doctor, Admin |

**Controller:** `src/controllers/patientController.ts`

---

#### 4. Appointment Routes (`/api/appointments`)

**File:** `src/routes/appointments.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all appointments | Yes | Admin, Doctor, Receptionist |
| GET | `/:id` | Get appointment by ID | Yes | Admin, Doctor, Receptionist |
| POST | `/` | Create appointment | Yes | Admin, Receptionist |
| PUT | `/:id` | Update appointment | Yes | Admin, Receptionist |
| DELETE | `/:id` | Cancel appointment | Yes | Admin, Receptionist |
| PATCH | `/:id/status` | Update status | Yes | Admin, Doctor, Receptionist |
| GET | `/doctor/:doctorId` | Get doctor's appointments | Yes | Admin, Doctor |
| GET | `/patient/:patientId` | Get patient's appointments | Yes | All |

**Controller:** `src/controllers/appointmentController.ts`

---

#### 5. Consultation Routes (`/api/consultations`)

**File:** `src/routes/consultations.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all consultations | Yes | Admin, Doctor |
| GET | `/:id` | Get consultation by ID | Yes | Admin, Doctor |
| POST | `/` | Create consultation | Yes | Doctor, Admin |
| PUT | `/:id` | Update consultation | Yes | Doctor, Admin |
| DELETE | `/:id` | Delete consultation | Yes | Admin |
| GET | `/patient/:patientId` | Get patient consultations | Yes | Admin, Doctor |
| GET | `/doctor/:doctorId` | Get doctor consultations | Yes | Admin, Doctor |
| POST | `/:id/diagnosis` | Add diagnosis | Yes | Doctor, Admin |
| DELETE | `/:id/diagnosis/:diagnosisId` | Remove diagnosis | Yes | Doctor, Admin |

**Controller:** `src/controllers/consultationController.ts`

---

#### 6. Prescription Routes (`/api/prescriptions`)

**File:** `src/routes/prescriptions.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all prescriptions | Yes | Admin, Doctor, Pharmacy |
| GET | `/:id` | Get prescription by ID | Yes | Admin, Doctor, Pharmacy |
| POST | `/` | Create prescription | Yes | Doctor, Admin |
| PUT | `/:id` | Update prescription | Yes | Doctor, Admin |
| DELETE | `/:id` | Cancel prescription | Yes | Doctor, Admin |
| POST | `/:id/dispense` | Dispense prescription | Yes | Pharmacy, Admin |
| GET | `/patient/:patientId` | Get patient prescriptions | Yes | All |
| GET | `/pending` | Get pending prescriptions | Yes | Pharmacy, Admin |
| GET | `/:id/interactions` | Check drug interactions | Yes | Doctor, Admin |
| GET | `/templates` | Get prescription templates | Yes | Doctor, Admin |
| POST | `/templates` | Create template | Yes | Doctor, Admin |

**Controller:** `src/controllers/prescriptionController.ts`

---

#### 7. Lab Test Routes (`/api/lab-tests`)

**File:** `src/routes/labTests.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all lab tests | Yes | Admin, Doctor, Lab Tech |
| GET | `/:id` | Get test by ID | Yes | Admin, Doctor, Lab Tech |
| POST | `/` | Order lab test | Yes | Doctor, Admin |
| PUT | `/:id` | Update test | Yes | Lab Tech, Admin |
| DELETE | `/:id` | Cancel test | Yes | Admin |
| POST | `/:id/results` | Enter test results | Yes | Lab Tech, Admin |
| POST | `/:id/report` | Upload report file | Yes | Lab Tech, Admin |
| GET | `/pending` | Get pending tests | Yes | Lab Tech, Admin |
| GET | `/catalog` | Get test catalog | Yes | All |
| GET | `/patient/:patientId` | Get patient tests | Yes | All |

**Controller:** `src/controllers/labTestController.ts`

---

#### 8. Medicine Routes (`/api/medicines`)

**File:** `src/routes/medicines.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all medicines | Yes | Admin, Pharmacy, Doctor |
| GET | `/:id` | Get medicine by ID | Yes | Admin, Pharmacy, Doctor |
| POST | `/` | Create medicine | Yes | Admin, Pharmacy |
| PUT | `/:id` | Update medicine | Yes | Admin, Pharmacy |
| DELETE | `/:id` | Delete medicine | Yes | Admin, Pharmacy |
| PATCH | `/:id/stock` | Update stock | Yes | Admin, Pharmacy |
| GET | `/stats` | Get medicine statistics | Yes | Admin, Pharmacy |
| GET | `/low-stock` | Get low stock medicines | Yes | Admin, Pharmacy |
| GET | `/transactions` | Get transactions | Yes | Admin, Pharmacy |
| POST | `/import` | Import catalog (Excel/CSV) | Yes | Admin, Pharmacy |
| POST | `/orders` | Create purchase order | Yes | Admin, Pharmacy |
| GET | `/orders` | Get all orders | Yes | Admin, Pharmacy |
| GET | `/orders/:id` | Get order by ID | Yes | Admin, Pharmacy |
| PUT | `/orders/:id/status` | Update order status | Yes | Admin, Pharmacy |
| POST | `/orders/:orderId/invoice` | Upload invoice | Yes | Admin, Pharmacy |
| GET | `/suppliers` | Get suppliers | Yes | Admin, Pharmacy |
| POST | `/suppliers` | Create supplier | Yes | Admin, Pharmacy |

**Controller:** `src/controllers/medicineController.ts`

---

#### 9. IPD Routes

##### Admission Routes (`/api/admissions`)

**File:** `src/routes/admissions.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all admissions | Yes | Admin, Doctor, Nurse |
| GET | `/:id` | Get admission by ID | Yes | Admin, Doctor, Nurse |
| POST | `/` | Admit patient | Yes | Admin, Doctor |
| PUT | `/:id` | Update admission | Yes | Admin, Doctor |
| POST | `/:id/discharge` | Discharge patient | Yes | Admin, Doctor |
| GET | `/active` | Get active admissions | Yes | Admin, Doctor, Nurse |
| GET | `/patient/:patientId` | Get patient admissions | Yes | All |

**Controller:** `src/controllers/admissionController.ts`

##### Ward Routes (`/api/wards`)

**File:** `src/routes/wards.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all wards | Yes | Admin, Ward Manager |
| GET | `/:id` | Get ward by ID | Yes | Admin, Ward Manager |
| POST | `/` | Create ward | Yes | Admin |
| PUT | `/:id` | Update ward | Yes | Admin |
| DELETE | `/:id` | Delete ward | Yes | Admin |
| GET | `/:id/beds` | Get ward beds | Yes | Admin, Ward Manager |

**Controller:** `src/controllers/wardController.ts`

##### Bed Routes (`/api/beds`)

**File:** `src/routes/beds.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all beds | Yes | Admin, Ward Manager |
| GET | `/:id` | Get bed by ID | Yes | Admin, Ward Manager |
| POST | `/` | Create bed | Yes | Admin |
| PUT | `/:id` | Update bed | Yes | Admin |
| DELETE | `/:id` | Delete bed | Yes | Admin |
| GET | `/available` | Get available beds | Yes | Admin, Ward Manager |
| GET | `/ward/:wardId` | Get beds by ward | Yes | Admin, Ward Manager |

**Controller:** `src/controllers/bedController.ts`

##### Daily Round Routes (`/api/daily-rounds`)

**File:** `src/routes/dailyRounds.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all rounds | Yes | Admin, Doctor |
| GET | `/:id` | Get round by ID | Yes | Admin, Doctor |
| POST | `/` | Create round | Yes | Doctor, Admin |
| PUT | `/:id` | Update round | Yes | Doctor, Admin |
| GET | `/admission/:admissionId` | Get admission rounds | Yes | Admin, Doctor |

**Controller:** `src/controllers/dailyRoundController.ts`

##### Vital Sign Routes (`/api/vital-signs`)

**File:** `src/routes/vitalSigns.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all vital signs | Yes | Admin, Doctor, Nurse |
| GET | `/:id` | Get vital sign by ID | Yes | Admin, Doctor, Nurse |
| POST | `/` | Record vital signs | Yes | Nurse, Doctor, Admin |
| GET | `/admission/:admissionId` | Get admission vitals | Yes | Admin, Doctor, Nurse |

**Controller:** `src/controllers/vitalSignController.ts`

##### Nursing Shift Routes (`/api/nursing-shifts`)

**File:** `src/routes/nursingShifts.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all shifts | Yes | Admin, Nurse |
| GET | `/:id` | Get shift by ID | Yes | Admin, Nurse |
| POST | `/` | Create shift | Yes | Nurse, Admin |
| PUT | `/:id` | Update shift | Yes | Nurse, Admin |
| GET | `/admission/:admissionId` | Get admission shifts | Yes | Admin, Nurse |

**Controller:** `src/controllers/nursingShiftController.ts`

##### Discharge Routes (`/api/discharge`)

**File:** `src/routes/discharge.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all summaries | Yes | Admin, Doctor |
| GET | `/:id` | Get summary by ID | Yes | Admin, Doctor |
| POST | `/` | Create summary | Yes | Doctor, Admin |
| PUT | `/:id` | Update summary | Yes | Doctor, Admin |
| GET | `/admission/:admissionId` | Get by admission | Yes | Admin, Doctor |

**Controller:** `src/controllers/dischargeSummaryController.ts`

---

#### 10. Billing Routes

##### OPD Bills (`/api/bills`)

**File:** `src/routes/bills.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all bills | Yes | Admin, Receptionist |
| GET | `/:id` | Get bill by ID | Yes | Admin, Receptionist |
| POST | `/` | Create bill | Yes | Receptionist, Admin |
| PUT | `/:id` | Update bill | Yes | Receptionist, Admin |
| PATCH | `/:id/payment` | Update payment | Yes | Receptionist, Admin |
| GET | `/patient/:patientId` | Get patient bills | Yes | Admin, Receptionist |

**Controller:** `src/controllers/billingController.ts`

##### IPD Bills (`/api/inpatient-bills`)

**File:** `src/routes/inpatientBills.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all IPD bills | Yes | Admin, Receptionist |
| GET | `/:id` | Get bill by ID | Yes | Admin, Receptionist |
| POST | `/` | Create IPD bill | Yes | Receptionist, Admin |
| PUT | `/:id` | Update bill | Yes | Receptionist, Admin |
| GET | `/admission/:admissionId` | Get by admission | Yes | Admin, Receptionist |

**Controller:** `src/controllers/inpatientBillController.ts`

##### General Billing (`/api/billing`)

**File:** `src/routes/billing.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/stats` | Get billing statistics | Yes | Admin, Receptionist |
| GET | `/revenue` | Get revenue data | Yes | Admin, Receptionist |
| GET | `/reports` | Generate reports | Yes | Admin, Receptionist |

**Controller:** `src/controllers/billingController.ts`

---

#### 11. Configuration Routes (`/api/config`)

**File:** `src/routes/config.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/hospital` | Get hospital config | Yes | All |
| PUT | `/hospital` | Update config | Yes | Admin |
| POST | `/hospital/logo` | Upload logo | Yes | Admin |
| GET | `/setup-status` | Check setup status | No |

**Controller:** `src/controllers/configController.ts`

---

#### 12. Catalog Routes (`/api/catalog`)

**File:** `src/routes/catalog.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/diagnosis` | Get diagnosis catalog | Yes | All |
| POST | `/diagnosis` | Add diagnosis | Yes | Admin |
| GET | `/allergies` | Get allergy catalog | Yes | All |
| POST | `/allergies` | Add allergy | Yes | Admin |
| GET | `/conditions` | Get conditions catalog | Yes | All |
| POST | `/conditions` | Add condition | Yes | Admin |
| GET | `/tests` | Get test catalog | Yes | All |
| POST | `/tests` | Add test | Yes | Admin |

**Controller:** `src/controllers/catalogController.ts`

---

#### 13. Safety Routes (`/api/safety`)

**File:** `src/routes/safety.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/interactions` | Get drug interactions | Yes | Doctor, Admin |
| POST | `/interactions` | Add interaction | Yes | Admin |
| GET | `/interactions/check` | Check interactions | Yes | Doctor, Admin |
| GET | `/templates` | Get prescription templates | Yes | Doctor, Admin |
| POST | `/templates` | Create template | Yes | Doctor, Admin |

**Controller:** `src/controllers/safetyController.ts`

---

#### 14. Audit Routes (`/api/audit`)

**File:** `src/routes/audit.ts`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get audit logs | Yes | Admin |
| GET | `/:id` | Get log by ID | Yes | Admin |
| GET | `/user/:userId` | Get user logs | Yes | Admin |
| GET | `/table/:tableName` | Get table logs | Yes | Admin |

**Controller:** `src/controllers/auditController.ts`

---

## 🔧 Services

### File Parser Service: `src/services/fileParserService.ts`

Parses uploaded files for medicine catalog import.

**Supported Formats:**
- Excel (.xlsx, .xls)
- CSV (.csv)
- PDF (.pdf)
- Word (.docx, .doc)

**Methods:**
- `parseExcel(filePath: string): Promise<MedicineData[]>`
- `parseCSV(filePath: string): Promise<MedicineData[]>`
- `parsePDF(filePath: string): Promise<MedicineData[]>`
- `parseWord(filePath: string): Promise<MedicineData[]>`

**Usage:**
Used by `medicineController.importMedicineCatalog()` to parse uploaded catalog files.

---

## ⚠️ Error Handling

### Error Handler Middleware

**Location:** `src/middleware/errorHandler.ts`

**Error Types Handled:**

1. **Validation Errors (Zod)**
   - Status: 400
   - Returns validation error details

2. **Authentication Errors**
   - Status: 401
   - Message: "Unauthorized"

3. **Authorization Errors**
   - Status: 403
   - Message: "Insufficient permissions"

4. **Not Found Errors**
   - Status: 404
   - Message: "Resource not found"

5. **Prisma Errors**
   - Unique constraint: 409 Conflict
   - Foreign key: 400 Bad Request
   - Other: 500 Internal Server Error

6. **Generic Errors**
   - Status: 500
   - Message: "Internal server error"

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

---

## 📝 Logging

### Winston Logger: `src/utils/logger.ts`

**Log Levels:**
- `error` - Error logs
- `warn` - Warning logs
- `info` - Informational logs
- `debug` - Debug logs (development only)

**Log Files:**
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/debug.log` - Debug logs (development)
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

**Log Rotation:**
- Max file size: 5MB
- Max files: 5 (combined, error), 3 (debug)

**Contextual Logging:**
```typescript
const logger = loggerWithContext('ControllerName');
logger.info('Message', { metadata });
logger.error('Error message', error, { metadata });
```

---

## 📤 File Uploads

### Multer Configuration: `src/middleware/upload.ts`

**Storage:** Local filesystem (`uploads/` directory)

**File Limits:**
- Max file size: 10MB
- Allowed types: Images, PDFs, Excel, Word

**Upload Endpoints:**
- Medicine catalog import: `/api/medicines/import`
- Lab test reports: `/api/lab-tests/:id/report`
- Invoice uploads: `/api/medicines/orders/:orderId/invoice`
- Hospital logo: `/api/config/hospital/logo`

**File Access:**
- Static files served at: `/api/uploads/<filename>`
- Logos: `/api/uploads/logos/<filename>`

---

## 🗄️ Database Integration

### Prisma ORM

**Client Initialization:**
```typescript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});
```

**Connection Management:**
- Auto-connect on first query
- Graceful disconnection on shutdown
- Connection timeout: 10 seconds

**Query Patterns:**
- All queries use Prisma client
- Type-safe queries
- Transaction support
- Relation includes

**Example:**
```typescript
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    appointments: true,
    prescriptions: true,
  },
});
```

---

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database

# Linting
npm run lint
npm run lint:fix
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [Zod Documentation](https://zod.dev/)
- [Winston Documentation](https://github.com/winstonjs/winston)

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0



