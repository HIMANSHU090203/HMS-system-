# HMS API Documentation

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Base URL:** `http://localhost:3000/api`

---

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
6. [Request/Response Examples](#requestresponse-examples)

---

## 🌐 API Overview

### Base Information

- **Base URL:** `http://localhost:3000/api`
- **Protocol:** HTTP/HTTPS
- **Content-Type:** `application/json`
- **Authentication:** JWT Bearer Token

### API Characteristics

- **RESTful API** design
- **JSON** request/response format
- **JWT** authentication
- **Role-based** access control
- **Zod** validation
- **Error handling** middleware

---

## 🔐 Authentication

### Authentication Method

All protected endpoints require JWT authentication via Bearer token in the Authorization header.

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Getting an Access Token

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin",
      "role": "ADMIN",
      "fullName": "Administrator"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## 📊 Response Format

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

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error detail"
    }
  ]
}
```

---

## 🛣️ API Endpoints

### Authentication Endpoints

#### Login
- **POST** `/api/auth/login`
- **Description:** User login
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- **Description:** Get current authenticated user
- **Auth Required:** Yes

#### Refresh Token
- **POST** `/api/auth/refresh`
- **Description:** Refresh access token
- **Auth Required:** Yes (refresh token)

#### Logout
- **POST** `/api/auth/logout`
- **Description:** User logout
- **Auth Required:** Yes

---

### User Endpoints

#### Get All Users
- **GET** `/api/users`
- **Description:** Get all users
- **Auth Required:** Yes
- **Roles:** ADMIN
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term

#### Get User by ID
- **GET** `/api/users/:id`
- **Description:** Get user by ID
- **Auth Required:** Yes
- **Roles:** ADMIN

#### Create User
- **POST** `/api/users`
- **Description:** Create new user
- **Auth Required:** Yes
- **Roles:** ADMIN
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "DOCTOR",
    "fullName": "string",
    "qualifications": "string (optional)",
    "phone": "string (optional)",
    "email": "string (optional)"
  }
  ```

#### Update User
- **PUT** `/api/users/:id`
- **Description:** Update user
- **Auth Required:** Yes
- **Roles:** ADMIN

#### Delete User
- **DELETE** `/api/users/:id`
- **Description:** Delete user
- **Auth Required:** Yes
- **Roles:** ADMIN

#### Toggle User Status
- **PATCH** `/api/users/:id/status`
- **Description:** Activate/deactivate user
- **Auth Required:** Yes
- **Roles:** ADMIN

---

### Patient Endpoints

#### Get All Patients
- **GET** `/api/patients`
- **Description:** Get all patients
- **Auth Required:** Yes
- **Roles:** All
- **Query Parameters:**
  - `page`, `limit`, `search`

#### Get Patient by ID
- **GET** `/api/patients/:id`
- **Description:** Get patient details
- **Auth Required:** Yes
- **Roles:** All

#### Create Patient
- **POST** `/api/patients`
- **Description:** Register new patient
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST
- **Request Body:**
  ```json
  {
    "name": "string",
    "age": 30,
    "gender": "MALE",
    "phone": "string",
    "address": "string",
    "bloodGroup": "string (optional)",
    "emergencyContactName": "string (optional)",
    "emergencyContactPhone": "string (optional)"
  }
  ```

#### Update Patient
- **PUT** `/api/patients/:id`
- **Description:** Update patient information
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST

#### Delete Patient
- **DELETE** `/api/patients/:id`
- **Description:** Delete patient
- **Auth Required:** Yes
- **Roles:** ADMIN

#### Get Patient Allergies
- **GET** `/api/patients/:id/allergies`
- **Description:** Get patient allergies
- **Auth Required:** Yes
- **Roles:** All

#### Add Patient Allergy
- **POST** `/api/patients/:id/allergies`
- **Description:** Add allergy to patient
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

---

### Appointment Endpoints

#### Get All Appointments
- **GET** `/api/appointments`
- **Description:** Get all appointments
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, RECEPTIONIST

#### Get Appointment by ID
- **GET** `/api/appointments/:id`
- **Description:** Get appointment details
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, RECEPTIONIST

#### Create Appointment
- **POST** `/api/appointments`
- **Description:** Book new appointment
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "doctorId": "string",
    "date": "2025-01-15T10:00:00Z",
    "time": "10:00 AM",
    "status": "SCHEDULED"
  }
  ```

#### Update Appointment
- **PUT** `/api/appointments/:id`
- **Description:** Update appointment
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST

#### Update Appointment Status
- **PATCH** `/api/appointments/:id/status`
- **Description:** Update appointment status
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, RECEPTIONIST

#### Get Doctor's Appointments
- **GET** `/api/appointments/doctor/:doctorId`
- **Description:** Get appointments for specific doctor
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

---

### Consultation Endpoints

#### Get All Consultations
- **GET** `/api/consultations`
- **Description:** Get all consultations
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

#### Get Consultation by ID
- **GET** `/api/consultations/:id`
- **Description:** Get consultation details
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

#### Create Consultation
- **POST** `/api/consultations`
- **Description:** Create new consultation
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "patientId": "string",
    "doctorId": "string",
    "diagnosis": "string",
    "notes": "string (optional)",
    "temperature": 37.5,
    "bloodPressure": "120/80",
    "followUpDate": "2025-01-20T10:00:00Z (optional)"
  }
  ```

#### Add Diagnosis
- **POST** `/api/consultations/:id/diagnosis`
- **Description:** Add diagnosis code to consultation
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

---

### Prescription Endpoints

#### Get All Prescriptions
- **GET** `/api/prescriptions`
- **Description:** Get all prescriptions
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, PHARMACY

#### Get Prescription by ID
- **GET** `/api/prescriptions/:id`
- **Description:** Get prescription details
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, PHARMACY

#### Create Prescription
- **POST** `/api/prescriptions`
- **Description:** Create new prescription
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "appointmentId": "string (optional)",
    "consultationId": "string (optional)",
    "notes": "string (optional)",
    "items": [
      {
        "medicineId": "string",
        "quantity": 10,
        "frequency": "1-0-1",
        "duration": 7,
        "instructions": "After meals",
        "dosage": "500mg",
        "withFood": "After meal"
      }
    ]
  }
  ```

#### Dispense Prescription
- **POST** `/api/prescriptions/:id/dispense`
- **Description:** Dispense prescription
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY

#### Check Drug Interactions
- **GET** `/api/prescriptions/:id/interactions`
- **Description:** Check for drug interactions
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

#### Get Prescription Templates
- **GET** `/api/prescriptions/templates`
- **Description:** Get prescription templates
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

---

### Lab Test Endpoints

#### Get All Lab Tests
- **GET** `/api/lab-tests`
- **Description:** Get all lab tests
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, LAB_TECH

#### Get Lab Test by ID
- **GET** `/api/lab-tests/:id`
- **Description:** Get lab test details
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, LAB_TECH

#### Order Lab Test
- **POST** `/api/lab-tests`
- **Description:** Order new lab test
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "testCatalogId": "string",
    "scheduledDate": "2025-01-15T10:00:00Z (optional)"
  }
  ```

#### Enter Test Results
- **POST** `/api/lab-tests/:id/results`
- **Description:** Enter test results
- **Auth Required:** Yes
- **Roles:** ADMIN, LAB_TECH
- **Request Body:**
  ```json
  {
    "results": "Test results text",
    "notes": "string (optional)"
  }
  ```

#### Upload Test Report
- **POST** `/api/lab-tests/:id/report`
- **Description:** Upload test report file
- **Auth Required:** Yes
- **Roles:** ADMIN, LAB_TECH
- **Content-Type:** `multipart/form-data`
- **Body:** File upload

#### Get Test Catalog
- **GET** `/api/lab-tests/catalog`
- **Description:** Get test catalog
- **Auth Required:** Yes
- **Roles:** All

---

### Medicine Endpoints

#### Get All Medicines
- **GET** `/api/medicines`
- **Description:** Get all medicines
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY, DOCTOR
- **Query Parameters:**
  - `search`: Search term
  - `lowStock`: Filter low stock (true/false)
  - `page`, `limit`

#### Get Medicine by ID
- **GET** `/api/medicines/:id`
- **Description:** Get medicine details
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY, DOCTOR

#### Create Medicine
- **POST** `/api/medicines`
- **Description:** Add new medicine
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY
- **Request Body:**
  ```json
  {
    "name": "Paracetamol 500mg",
    "genericName": "Paracetamol",
    "manufacturer": "ABC Pharma",
    "category": "Analgesic",
    "price": 10.50,
    "quantity": 100,
    "lowStockThreshold": 10
  }
  ```

#### Update Stock
- **PATCH** `/api/medicines/:id/stock`
- **Description:** Update medicine stock
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY
- **Request Body:**
  ```json
  {
    "quantity": 50,
    "operation": "add",
    "reason": "Purchase order received"
  }
  ```

#### Get Low Stock Medicines
- **GET** `/api/medicines/low-stock`
- **Description:** Get medicines with low stock
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY

#### Import Medicine Catalog
- **POST** `/api/medicines/import`
- **Description:** Import medicine catalog from file
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY
- **Content-Type:** `multipart/form-data`
- **Body:** File (Excel, CSV, PDF, Word)

#### Create Purchase Order
- **POST** `/api/medicines/orders`
- **Description:** Create medicine purchase order
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY
- **Request Body:**
  ```json
  {
    "supplierId": "string",
    "orderDate": "2025-01-15T10:00:00Z",
    "expectedDelivery": "2025-01-20T10:00:00Z (optional)",
    "items": [
      {
        "medicineId": "string",
        "quantity": 100,
        "unitPrice": 10.50
      }
    ]
  }
  ```

#### Get Suppliers
- **GET** `/api/medicines/suppliers`
- **Description:** Get all suppliers
- **Auth Required:** Yes
- **Roles:** ADMIN, PHARMACY

---

### IPD Endpoints

#### Get All Admissions
- **GET** `/api/admissions`
- **Description:** Get all admissions
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, NURSE

#### Admit Patient
- **POST** `/api/admissions`
- **Description:** Admit patient to IPD
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "wardId": "string",
    "bedId": "string",
    "admissionDate": "2025-01-15T10:00:00Z",
    "admissionType": "PLANNED",
    "admissionReason": "Surgery required"
  }
  ```

#### Discharge Patient
- **POST** `/api/admissions/:id/discharge`
- **Description:** Discharge patient
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

#### Get All Wards
- **GET** `/api/wards`
- **Description:** Get all wards
- **Auth Required:** Yes
- **Roles:** ADMIN, WARD_MANAGER

#### Get Available Beds
- **GET** `/api/beds/available`
- **Description:** Get available beds
- **Auth Required:** Yes
- **Roles:** ADMIN, WARD_MANAGER

#### Record Vital Signs
- **POST** `/api/vital-signs`
- **Description:** Record patient vital signs
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR, NURSE
- **Request Body:**
  ```json
  {
    "admissionId": "string",
    "temperature": 37.5,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "respiratoryRate": 18,
    "oxygenSaturation": 98.5
  }
  ```

#### Create Daily Round
- **POST** `/api/daily-rounds`
- **Description:** Create doctor round
- **Auth Required:** Yes
- **Roles:** ADMIN, DOCTOR

---

### Billing Endpoints

#### Get All Bills
- **GET** `/api/bills`
- **Description:** Get all OPD bills
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST

#### Create Bill
- **POST** `/api/bills`
- **Description:** Create new bill
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "items": [
      {
        "name": "Consultation",
        "quantity": 1,
        "price": 500
      }
    ],
    "paymentMode": "CASH"
  }
  ```

#### Get IPD Bills
- **GET** `/api/inpatient-bills`
- **Description:** Get all IPD bills
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST

#### Get Billing Statistics
- **GET** `/api/billing/stats`
- **Description:** Get billing statistics
- **Auth Required:** Yes
- **Roles:** ADMIN, RECEPTIONIST

---

### Configuration Endpoints

#### Get Hospital Config
- **GET** `/api/config/hospital`
- **Description:** Get hospital configuration
- **Auth Required:** Yes
- **Roles:** All

#### Update Hospital Config
- **PUT** `/api/config/hospital`
- **Description:** Update hospital configuration
- **Auth Required:** Yes
- **Roles:** ADMIN

#### Upload Hospital Logo
- **POST** `/api/config/hospital/logo`
- **Description:** Upload hospital logo
- **Auth Required:** Yes
- **Roles:** ADMIN
- **Content-Type:** `multipart/form-data`

#### Check Setup Status
- **GET** `/api/config/setup-status`
- **Description:** Check system setup status
- **Auth Required:** No

---

## 📝 Request/Response Examples

### Example 1: Create Patient

**Request:**
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "age": 35,
  "gender": "MALE",
  "phone": "9876543210",
  "address": "123 Main Street, City",
  "bloodGroup": "O+",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "9876543211"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "patient": {
      "id": "clx1234567890",
      "name": "John Doe",
      "age": 35,
      "gender": "MALE",
      "phone": "9876543210",
      "address": "123 Main Street, City",
      "bloodGroup": "O+",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### Example 2: Create Prescription

**Request:**
```http
POST /api/prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "clx1234567890",
  "consultationId": "clx0987654321",
  "notes": "Take with food",
  "items": [
    {
      "medicineId": "med123",
      "quantity": 10,
      "frequency": "1-0-1",
      "duration": 7,
      "dosage": "500mg",
      "withFood": "After meal"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "prescription": {
      "id": "rx1234567890",
      "prescriptionNumber": "RX202501150001",
      "patientId": "clx1234567890",
      "status": "ACTIVE",
      "items": [...],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### Example 3: Error Response

**Request:**
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "",
  "age": -5
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Medicine name is required"
    },
    {
      "field": "age",
      "message": "Age must be positive"
    }
  ]
}
```

---

## 🔒 Rate Limiting

Currently, rate limiting is not implemented. Consider adding rate limiting for production use.

---

## 📚 Additional Resources

- [Backend Documentation](./BACKEND.md)
- [Database Documentation](./DATABASE.md)
- [Frontend Documentation](./FRONTEND.md)

---

**Last Updated:** January 2025  
**Document Version:** 1.0.0



