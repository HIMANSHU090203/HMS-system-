# HMS Database Documentation

**Version:** 1.0.0  
**Last Updated:** January 2025

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Architecture](#schema-architecture)
3. [Table Descriptions](#table-descriptions)
4. [Relationships](#relationships)
5. [Enums](#enums)
6. [Indexes](#indexes)
7. [Migrations](#migrations)
8. [Seed Data](#seed-data)
9. [Database Operations](#database-operations)

---

## 🗄️ Database Overview

### Database System

- **RDBMS:** PostgreSQL 14+
- **ORM:** Prisma 6.19.0
- **Connection:** PostgreSQL connection string
- **Migrations:** Prisma Migrate

### Database Statistics

- **Total Tables:** 35+ tables
- **Total Enums:** 12+ enums
- **Relationships:** Complex relational structure
- **Indexes:** Primary keys, foreign keys, unique constraints

### Database Name

Default: `hms_database`

---

## 🏗️ Schema Architecture

### Schema Organization

The database schema is organized into **4 phases**:

1. **Phase 1: Core System** (12 tables)
2. **Phase 2: Medical Catalogs** (6 tables)
3. **Phase 3: IPD Management** (8 tables)
4. **Phase 4: Enhanced Features** (9+ tables)

### Schema File

**Location:** `backend/prisma/schema.prisma`

**Generator:**
```prisma
generator client {
  provider = "prisma-client-js"
}
```

**Datasource:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📊 Table Descriptions

### Phase 1: Core System Tables

#### 1. User Table

**Table Name:** `users`

**Purpose:** System users and authentication

**Fields:**
- `id` (String, Primary Key, CUID)
- `username` (String, Unique)
- `passwordHash` (String)
- `role` (UserRole Enum)
- `fullName` (String)
- `qualifications` (String, Optional)
- `registrationNumber` (String, Optional)
- `phone` (String, Optional)
- `email` (String, Optional)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Appointments (as doctor)
- Consultations (as doctor)
- Prescriptions (as doctor, dispensed by)
- Lab Tests (ordered by, performed by)
- Bills (created by)
- Audit Logs
- IPD operations (admissions, rounds, vitals, etc.)

---

#### 2. Patient Table

**Table Name:** `patients`

**Purpose:** Patient information and medical profiles

**Fields:**
- `id` (String, Primary Key, CUID)
- `name` (String)
- `age` (Int)
- `gender` (Gender Enum)
- `phone` (String, Unique)
- `address` (String)
- `bloodGroup` (String, Optional)
- `allergies` (String, Optional) - Legacy field
- `chronicConditions` (String, Optional) - Legacy field
- `emergencyContactName` (String, Optional)
- `emergencyContactPhone` (String, Optional)
- `patientType` (PatientType Enum, Default: OUTPATIENT)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Appointments
- Consultations
- Prescriptions
- Lab Tests
- Bills
- Admissions
- Inpatient Bills
- Discharge Summaries
- Structured Allergies (PatientAllergy)
- Structured Conditions (PatientChronicCondition)

---

#### 3. Appointment Table

**Table Name:** `appointments`

**Purpose:** Appointment scheduling

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `doctorId` (String, Foreign Key)
- `date` (DateTime)
- `time` (String)
- `status` (AppointmentStatus Enum, Default: SCHEDULED)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Doctor/User (Many-to-One)
- Consultations (One-to-Many)
- Prescriptions (One-to-Many)

---

#### 4. Consultation Table

**Table Name:** `consultations`

**Purpose:** Doctor consultations and diagnosis

**Fields:**
- `id` (String, Primary Key, CUID)
- `appointmentId` (String, Foreign Key)
- `patientId` (String, Foreign Key)
- `doctorId` (String, Foreign Key)
- `diagnosis` (String) - Legacy field
- `notes` (String, Optional)
- `temperature` (Decimal, Optional)
- `bloodPressure` (String, Optional)
- `followUpDate` (DateTime, Optional)
- `consultationDate` (DateTime, Default: now)
- `createdAt` (DateTime)

**Relations:**
- Appointment (Many-to-One)
- Patient (Many-to-One)
- Doctor/User (Many-to-One)
- Prescriptions (One-to-Many)
- Diagnosis Links (One-to-Many) - Structured diagnosis

---

#### 5. Prescription Table

**Table Name:** `prescriptions`

**Purpose:** Multi-medicine prescriptions

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `doctorId` (String, Foreign Key)
- `appointmentId` (String, Foreign Key, Optional)
- `consultationId` (String, Foreign Key, Optional)
- `prescriptionNumber` (String, Unique)
- `status` (PrescriptionStatus Enum, Default: ACTIVE)
- `notes` (String, Optional)
- `totalAmount` (Decimal, Default: 0)
- `isDispensed` (Boolean, Default: false)
- `dispensedAt` (DateTime, Optional)
- `dispensedBy` (String, Foreign Key, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Doctor/User (Many-to-One)
- Appointment (Many-to-One, Optional)
- Consultation (Many-to-One, Optional)
- Prescription Items (One-to-Many)
- Medicine Transactions (One-to-Many)
- Dispensed By User (Many-to-One, Optional)

---

#### 6. PrescriptionItem Table

**Table Name:** `prescription_items`

**Purpose:** Individual medicine items in prescriptions

**Fields:**
- `id` (String, Primary Key, CUID)
- `prescriptionId` (String, Foreign Key)
- `medicineId` (String, Foreign Key)
- `quantity` (Int)
- `frequency` (String)
- `duration` (Int)
- `instructions` (String, Optional)
- `dosage` (String, Optional)
- `withFood` (String, Optional)
- `startDate` (DateTime, Optional)
- `endDate` (DateTime, Optional)
- `rowOrder` (Int, Default: 0)
- `createdAt` (DateTime)

**Relations:**
- Prescription (Many-to-One)
- Medicine/MedicineCatalog (Many-to-One)

---

#### 7. TestCatalog Table

**Table Name:** `test_catalog`

**Purpose:** Laboratory test catalog with pricing

**Fields:**
- `id` (String, Primary Key, CUID)
- `testName` (String, Unique)
- `description` (String, Optional)
- `category` (String, Optional)
- `price` (Decimal)
- `units` (String, Optional)
- `referenceRange` (String, Optional)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Lab Tests (One-to-Many)
- Technician Selections (One-to-Many)

---

#### 8. LabTest Table

**Table Name:** `lab_tests`

**Purpose:** Laboratory test orders and results

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `orderedBy` (String, Foreign Key)
- `testCatalogId` (String, Foreign Key)
- `testNameSnapshot` (String)
- `priceSnapshot` (Decimal)
- `status` (LabTestStatus Enum, Default: PENDING)
- `scheduledDate` (DateTime, Optional)
- `results` (String, Optional)
- `reportFile` (String, Optional)
- `notes` (String, Optional)
- `performedBy` (String, Foreign Key, Optional)
- `createdAt` (DateTime)
- `completedAt` (DateTime, Optional)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Ordered By User (Many-to-One)
- Performed By User (Many-to-One, Optional)
- Test Catalog (Many-to-One)

---

#### 9. MedicineCatalog Table

**Table Name:** `medicine_catalog`

**Purpose:** Enhanced medicine inventory

**Fields:**
- `id` (String, Primary Key, CUID)
- `code` (String, Unique)
- `name` (String)
- `genericName` (String, Optional)
- `manufacturer` (String, Optional)
- `category` (String)
- `therapeuticClass` (String, Optional)
- `atcCode` (String, Optional)
- `price` (Decimal)
- `stockQuantity` (Int, Default: 0)
- `lowStockThreshold` (Int, Default: 10)
- `expiryDate` (DateTime, Optional)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Medicine Transactions (One-to-Many)
- Order Items (One-to-Many)
- Low Stock Alerts (One-to-Many)
- Prescription Items (One-to-Many)
- Drug Interactions (Many-to-Many, via DrugInteraction)

---

#### 10. MedicineTransaction Table

**Table Name:** `medicine_transactions`

**Purpose:** Medicine dispensing transactions

**Fields:**
- `id` (String, Primary Key, CUID)
- `prescriptionId` (String, Foreign Key)
- `medicineId` (String, Foreign Key)
- `quantityDispensed` (Int)
- `dispensedBy` (String, Foreign Key)
- `dispensedAt` (DateTime, Default: now)

**Relations:**
- Prescription (Many-to-One)
- Medicine/MedicineCatalog (Many-to-One)
- Dispensed By User (Many-to-One)

---

#### 11. Bill Table

**Table Name:** `bills`

**Purpose:** OPD billing and payment management

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `receptionistId` (String, Foreign Key)
- `invoiceNumber` (String, Optional)
- `items` (Json) - JSON array of bill items
- `subtotal` (Decimal)
- `tax` (Decimal)
- `totalAmount` (Decimal)
- `paymentMode` (PaymentMode Enum)
- `paymentStatus` (PaymentStatus Enum, Default: PENDING)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Receptionist/User (Many-to-One)

---

#### 12. AuditLog Table

**Table Name:** `audit_logs`

**Purpose:** System audit trail

**Fields:**
- `id` (String, Primary Key, CUID)
- `userId` (String, Foreign Key)
- `action` (String)
- `tableName` (String)
- `recordId` (String)
- `oldValue` (Json, Optional)
- `newValue` (Json, Optional)
- `timestamp` (DateTime, Default: now)

**Relations:**
- User (Many-to-One)

---

### Phase 2: Medical Catalogs

#### 13. DiagnosisCatalog Table

**Table Name:** `diagnosis_catalog`

**Purpose:** ICD-10 based diagnosis catalog

**Fields:**
- `id` (String, Primary Key, CUID)
- `icdCode` (String, Unique)
- `name` (String)
- `category` (String)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Diagnosis Links (One-to-Many)

---

#### 14. DiagnosisLink Table

**Table Name:** `diagnosis_links`

**Purpose:** Links consultations to diagnosis codes

**Fields:**
- `id` (String, Primary Key, CUID)
- `consultationId` (String, Foreign Key)
- `diagnosisId` (String, Foreign Key)
- `isPrimary` (Boolean, Default: true)

**Unique Constraint:** `[consultationId, diagnosisId]`

**Relations:**
- Consultation (Many-to-One)
- Diagnosis Catalog (Many-to-One)

---

#### 15. AllergyCatalog Table

**Table Name:** `allergy_catalog`

**Purpose:** Allergy master data

**Fields:**
- `id` (String, Primary Key, CUID)
- `code` (String, Unique)
- `name` (String)
- `category` (String)
- `severity` (String)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient Allergies (One-to-Many)

---

#### 16. PatientAllergy Table

**Table Name:** `patient_allergies`

**Purpose:** Patient-specific allergies

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `allergyId` (String, Foreign Key)
- `severity` (String)
- `onsetDate` (DateTime, Optional)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Unique Constraint:** `[patientId, allergyId]`

**Relations:**
- Patient (Many-to-One)
- Allergy Catalog (Many-to-One)

---

#### 17. ChronicConditionCatalog Table

**Table Name:** `chronic_condition_catalog`

**Purpose:** Chronic condition master data

**Fields:**
- `id` (String, Primary Key, CUID)
- `code` (String, Unique)
- `name` (String)
- `category` (String)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient Chronic Conditions (One-to-Many)

---

#### 18. PatientChronicCondition Table

**Table Name:** `patient_chronic_conditions`

**Purpose:** Patient-specific chronic conditions

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `conditionId` (String, Foreign Key)
- `diagnosisDate` (DateTime)
- `currentStatus` (String)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Chronic Condition Catalog (Many-to-One)

---

### Phase 3: IPD Management

#### 19. Ward Table

**Table Name:** `wards`

**Purpose:** Ward management for IPD

**Fields:**
- `id` (String, Primary Key, CUID)
- `name` (String, Unique)
- `type` (WardType Enum)
- `capacity` (Int)
- `currentOccupancy` (Int, Default: 0)
- `isActive` (Boolean, Default: true)
- `description` (String, Optional)
- `floor` (String, Optional)
- `dailyRate` (Decimal, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Beds (One-to-Many)
- Admissions (One-to-Many)

---

#### 20. Bed Table

**Table Name:** `beds`

**Purpose:** Bed management within wards

**Fields:**
- `id` (String, Primary Key, CUID)
- `wardId` (String, Foreign Key)
- `bedNumber` (String)
- `bedType` (BedType Enum)
- `isOccupied` (Boolean, Default: false)
- `isActive` (Boolean, Default: true)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Unique Constraint:** `[wardId, bedNumber]`

**Relations:**
- Ward (Many-to-One)
- Admissions (One-to-Many)

---

#### 21. Admission Table

**Table Name:** `admissions`

**Purpose:** Patient admission management

**Fields:**
- `id` (String, Primary Key, CUID)
- `patientId` (String, Foreign Key)
- `wardId` (String, Foreign Key)
- `bedId` (String, Foreign Key)
- `admissionDate` (DateTime)
- `dischargeDate` (DateTime, Optional)
- `admissionType` (AdmissionType Enum)
- `admissionReason` (String)
- `status` (AdmissionStatus Enum, Default: ADMITTED)
- `notes` (String, Optional)
- `admittedBy` (String, Foreign Key)
- `dischargedBy` (String, Foreign Key, Optional)
- `dischargeNotes` (String, Optional)
- `isDayCare` (Boolean, Default: false)
- `procedureStartTime` (DateTime, Optional)
- `procedureEndTime` (DateTime, Optional)
- `recoveryStartTime` (DateTime, Optional)
- `recoveryEndTime` (DateTime, Optional)
- `expectedDischargeTime` (DateTime, Optional)
- `homeSupportAvailable` (Boolean, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Patient (Many-to-One)
- Ward (Many-to-One)
- Bed (Many-to-One)
- Admitted By User (Many-to-One)
- Discharged By User (Many-to-One, Optional)
- Inpatient Bills (One-to-Many)
- Daily Rounds (One-to-Many)
- Vital Signs (One-to-Many)
- Nursing Shifts (One-to-Many)
- Discharge Summary (One-to-One)

---

#### 22. DailyRound Table

**Table Name:** `daily_rounds`

**Purpose:** Doctor rounds for admitted patients

**Fields:**
- `id` (String, Primary Key, CUID)
- `admissionId` (String, Foreign Key)
- `doctorId` (String, Foreign Key)
- `roundDate` (DateTime)
- `diagnosis` (String)
- `treatment` (String)
- `notes` (String, Optional)
- `nextRoundDate` (DateTime, Optional)
- `isCompleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Admission (Many-to-One)
- Doctor/User (Many-to-One)

---

#### 23. VitalSign Table

**Table Name:** `vital_signs`

**Purpose:** Patient vital signs monitoring

**Fields:**
- `id` (String, Primary Key, CUID)
- `admissionId` (String, Foreign Key)
- `recordedBy` (String, Foreign Key)
- `temperature` (Decimal, Optional)
- `bloodPressure` (String, Optional)
- `heartRate` (Int, Optional)
- `respiratoryRate` (Int, Optional)
- `oxygenSaturation` (Decimal, Optional)
- `weight` (Decimal, Optional)
- `height` (Decimal, Optional)
- `notes` (String, Optional)
- `recordedAt` (DateTime, Default: now)
- `createdAt` (DateTime)

**Relations:**
- Admission (Many-to-One)
- Recorded By User (Many-to-One)

---

#### 24. InpatientBill Table

**Table Name:** `inpatient_bills`

**Purpose:** Billing for IPD patients

**Fields:**
- `id` (String, Primary Key, CUID)
- `admissionId` (String, Foreign Key)
- `patientId` (String, Foreign Key)
- `invoiceNumber` (String, Optional)
- `roomCharges` (Decimal)
- `procedureCharges` (Decimal)
- `medicineCharges` (Decimal)
- `labCharges` (Decimal)
- `otherCharges` (Decimal)
- `totalAmount` (Decimal)
- `status` (PaymentStatus Enum, Default: PENDING)
- `paymentMode` (PaymentMode Enum, Optional)
- `paidAmount` (Decimal, Optional)
- `notes` (String, Optional)
- `createdBy` (String, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Admission (Many-to-One)
- Patient (Many-to-One)
- Created By User (Many-to-One)

---

#### 25. NursingShift Table

**Table Name:** `nursing_shifts`

**Purpose:** Nursing care management

**Fields:**
- `id` (String, Primary Key, CUID)
- `admissionId` (String, Foreign Key)
- `nurseId` (String, Foreign Key)
- `shiftType` (ShiftType Enum)
- `shiftDate` (DateTime)
- `startTime` (DateTime)
- `endTime` (DateTime, Optional)
- `notes` (String, Optional)
- `medications` (Json, Optional)
- `isCompleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Admission (Many-to-One)
- Nurse/User (Many-to-One)

---

#### 26. DischargeSummary Table

**Table Name:** `discharge_summaries`

**Purpose:** Patient discharge documentation

**Fields:**
- `id` (String, Primary Key, CUID)
- `admissionId` (String, Foreign Key, Unique)
- `patientId` (String, Foreign Key)
- `doctorId` (String, Foreign Key)
- `admissionDate` (DateTime)
- `dischargeDate` (DateTime)
- `diagnosis` (String)
- `treatmentGiven` (String)
- `proceduresPerformed` (String, Optional)
- `medicationsPrescribed` (String, Optional)
- `followUpInstructions` (String, Optional)
- `nextAppointmentDate` (DateTime, Optional)
- `notes` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- Admission (One-to-One)
- Patient (Many-to-One)
- Doctor/User (Many-to-One)

---

### Phase 4: Enhanced Features

#### 27. HospitalConfig Table

**Table Name:** `hospital_config`

**Purpose:** Hospital configuration settings

**Fields:**
- `id` (String, Primary Key, CUID)
- `hospitalName` (String)
- `hospitalCode` (String, Unique, Optional)
- `address` (String, Optional)
- `city` (String, Optional)
- `state` (String, Optional)
- `postalCode` (String, Optional)
- `country` (String, Optional)
- `phone` (String, Optional)
- `email` (String, Optional)
- `emergencyContact` (String, Optional)
- `hospitalLicenseNumber` (String, Optional)
- `taxId` (String, Optional)
- `logoUrl` (String, Optional)
- `timezone` (String, Default: "UTC")
- `defaultLanguage` (String, Default: "en")
- `currency` (String, Default: "USD")
- `taxRate` (Decimal, Optional)
- `appointmentSlotDuration` (Int, Default: 30)
- `defaultDoctorConsultationDuration` (Int, Default: 30)
- `workingHours` (Json, Optional)
- `defaultPaymentTerms` (String, Optional)
- `defaultPaymentMode` (PaymentMode Enum, Optional)
- `enableInsurance` (Boolean, Default: false)
- `medicineMarkupPercentage` (Decimal, Default: 0)
- `modulesEnabled` (Json, Optional)
- `labTestsEnabled` (Boolean, Default: true)
- `ipdEnabled` (Boolean, Default: true)
- `billingEnabled` (Boolean, Default: true)
- `patientCustomFields` (Json, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

#### 28-35. Additional Tables

- **Supplier** - Supplier/company management
- **MedicineOrder** - Purchase orders
- **MedicineOrderItem** - Order line items
- **LowStockAlert** - Inventory alerts
- **DrugInteraction** - Drug interaction database
- **PrescriptionTemplate** - Prescription templates
- **PrescriptionAudit** - Prescription audit trail
- **SystemConfig** - System configuration
- **LabTestConfig** - Lab test configuration
- **MedicineConfig** - Medicine configuration
- **TechnicianTestSelection** - Technician-test mapping

---

## 🔗 Relationships

### Key Relationships

1. **User → Multiple Relations**
   - One-to-Many: Appointments, Consultations, Prescriptions, Lab Tests, Bills, etc.

2. **Patient → Multiple Relations**
   - One-to-Many: Appointments, Consultations, Prescriptions, Lab Tests, Bills, Admissions

3. **Prescription → PrescriptionItem**
   - One-to-Many: Multiple medicine items per prescription

4. **Admission → Multiple IPD Relations**
   - One-to-Many: Daily Rounds, Vital Signs, Nursing Shifts
   - One-to-One: Discharge Summary

5. **MedicineCatalog → Multiple Relations**
   - One-to-Many: Transactions, Order Items, Prescription Items

### Cascade Deletes

- Patient deletion → Cascades to appointments, consultations, prescriptions, etc.
- Prescription deletion → Cascades to prescription items
- Admission deletion → Cascades to rounds, vitals, shifts

---

## 📝 Enums

### UserRole Enum

```prisma
enum UserRole {
  ADMIN
  DOCTOR
  LAB_TECH
  PHARMACY
  RECEPTIONIST
  NURSE
  WARD_MANAGER
  NURSING_SUPERVISOR
}
```

### Gender Enum

```prisma
enum Gender {
  MALE
  FEMALE
  OTHER
}
```

### AppointmentStatus Enum

```prisma
enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### LabTestStatus Enum

```prisma
enum LabTestStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### PrescriptionStatus Enum

```prisma
enum PrescriptionStatus {
  ACTIVE
  DISPENSED
  CANCELLED
  EXPIRED
}
```

### PaymentMode Enum

```prisma
enum PaymentMode {
  CASH
  CARD
  UPI
  NET_BANKING
  INSURANCE
}
```

### PaymentStatus Enum

```prisma
enum PaymentStatus {
  PENDING
  PAID
  PARTIAL
  REFUNDED
  CANCELLED
}
```

### PatientType Enum

```prisma
enum PatientType {
  OUTPATIENT
  INPATIENT
  EMERGENCY
}
```

### WardType Enum

```prisma
enum WardType {
  GENERAL
  ICU
  PRIVATE
  EMERGENCY
  PEDIATRIC
  MATERNITY
  SURGICAL
  CARDIAC
  NEUROLOGY
  ORTHOPEDIC
  DAY_CARE
}
```

### BedType Enum

```prisma
enum BedType {
  GENERAL
  ICU
  PRIVATE
  SEMI_PRIVATE
  ISOLATION
}
```

### AdmissionType Enum

```prisma
enum AdmissionType {
  EMERGENCY
  PLANNED
  TRANSFER
  OBSERVATION
  DAY_CARE
}
```

### AdmissionStatus Enum

```prisma
enum AdmissionStatus {
  ADMITTED
  DISCHARGED
  TRANSFERRED
  CANCELLED
  ABSENT_WITHOUT_LEAVE
}
```

### ShiftType Enum

```prisma
enum ShiftType {
  MORNING
  AFTERNOON
  NIGHT
  GENERAL
}
```

### OrderStatus Enum

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## 🔍 Indexes

### Primary Keys

All tables have `id` as primary key (String, CUID)

### Unique Constraints

- `users.username`
- `patients.phone`
- `prescriptions.prescriptionNumber`
- `medicine_catalog.code`
- `test_catalog.testName`
- `wards.name`
- `beds.[wardId, bedNumber]`
- `diagnosis_catalog.icdCode`
- `allergy_catalog.code`
- `chronic_condition_catalog.code`
- `hospital_config.hospitalCode`
- `discharge_summaries.admissionId`

### Foreign Key Indexes

All foreign key relationships are indexed automatically by Prisma.

---

## 🔄 Migrations

### Migration Files

**Location:** `backend/prisma/migrations/`

**Migration Commands:**
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration History

The database includes 18+ migration files tracking schema evolution.

---

## 🌱 Seed Data

### Seed File

**Location:** `backend/prisma/seed.ts`

**Seed Command:**
```bash
npm run prisma:seed
```

### Seed Data Includes

- Default admin user
- Sample test catalog entries
- Sample medicine catalog entries
- Sample diagnosis codes
- Sample allergy catalog
- Sample chronic conditions

---

## 🛠️ Database Operations

### Prisma Client Usage

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Query example
const patients = await prisma.patient.findMany({
  include: {
    appointments: true,
    prescriptions: true,
  },
});
```

### Common Operations

**Create:**
```typescript
const patient = await prisma.patient.create({
  data: {
    name: "John Doe",
    age: 30,
    gender: "MALE",
    phone: "1234567890",
    address: "123 Main St",
  },
});
```

**Read:**
```typescript
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
});
```

**Update:**
```typescript
const patient = await prisma.patient.update({
  where: { id: patientId },
  data: { age: 31 },
});
```

**Delete:**
```typescript
await prisma.patient.delete({
  where: { id: patientId },
});
```

**Transactions:**
```typescript
await prisma.$transaction([
  prisma.patient.create({ data: {...} }),
  prisma.appointment.create({ data: {...} }),
]);
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Schema File](../hms-desktop/backend/prisma/schema.prisma)

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0



