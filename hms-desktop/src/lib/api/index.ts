// Export all API services
export { default as authService } from './services/authService';
export { default as patientService } from './services/patientService';
export { default as appointmentService } from './services/appointmentService';
export { default as consultationService } from './services/consultationService';
export { default as prescriptionService } from './services/prescriptionService';
export { default as labTestService } from './services/labTestService';
export { default as medicineService } from './services/medicineService';
export { default as billingService } from './services/billingService';
export { default as userService } from './services/userService';
export { default as catalogService } from './services/catalogService';
export { default as configService } from './services/configService';
export { default as safetyService } from './services/safetyService';
export { default as auditService } from './services/auditService';

// Export API client for direct use if needed
export { default as apiClient } from './config';

// Export all types
export * from './types';
