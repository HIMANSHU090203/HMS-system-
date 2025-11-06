import { UserRole } from '../api/types';

// Define module permissions for each role
export const rolePermissions = {
  [UserRole.ADMIN]: {
    modules: ['dashboard', 'patients', 'appointments', 'consultations', 'prescriptions', 'labTests', 'medicines', 'billing', 'users', 'config', 'ipd'],
    canManageUsers: true,
    canViewReports: true,
    canManageSystem: true,
    canAccessFinancials: true,
  },
  [UserRole.DOCTOR]: {
    modules: ['dashboard', 'patients', 'appointments', 'consultations', 'prescriptions', 'labTests', 'ipd'],
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
    canAccessFinancials: false,
  },
  [UserRole.RECEPTIONIST]: {
    modules: ['dashboard', 'patients', 'appointments', 'billing'],
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
    canAccessFinancials: true,
  },
  [UserRole.LAB_TECH]: {
    modules: ['dashboard', 'patients', 'labTests'],
    canManageUsers: false,
    canViewReports: false,
    canManageSystem: false,
    canAccessFinancials: false,
  },
  [UserRole.PHARMACY]: {
    modules: ['dashboard', 'patients', 'prescriptions', 'medicines'],
    canManageUsers: false,
    canViewReports: false,
    canManageSystem: false,
    canAccessFinancials: false,
  },
  // IPD-specific roles
  [UserRole.NURSE]: {
    modules: ['dashboard', 'patients', 'ipd'],
    canManageUsers: false,
    canViewReports: false,
    canManageSystem: false,
    canAccessFinancials: false,
  },
  [UserRole.WARD_MANAGER]: {
    modules: ['dashboard', 'patients', 'ipd'],
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
    canAccessFinancials: false,
  },
  [UserRole.NURSING_SUPERVISOR]: {
    modules: ['dashboard', 'patients', 'ipd'],
    canManageUsers: false,
    canViewReports: true,
    canManageSystem: false,
    canAccessFinancials: false,
  },
};

// Get available modules for a role
export const getAvailableModules = (userRole) => {
  return rolePermissions[userRole]?.modules || [];
};

// Check if user has access to a specific module
export const hasModuleAccess = (userRole, module) => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.modules.includes(module) : false;
};

// Check specific permissions
export const canManageUsers = (userRole) => {
  return rolePermissions[userRole]?.canManageUsers || false;
};

export const canViewReports = (userRole) => {
  return rolePermissions[userRole]?.canViewReports || false;
};

export const canManageSystem = (userRole) => {
  return rolePermissions[userRole]?.canManageSystem || false;
};

export const canAccessFinancials = (userRole) => {
  return rolePermissions[userRole]?.canAccessFinancials || false;
};

// Get role-specific module definitions
export const getRoleBasedModules = (userRole) => {
  const allModules = {
    dashboard: { name: 'Dashboard', icon: '🏠', color: 'blue' },
    patients: { name: 'Patients', icon: '👥', color: 'green' },
    appointments: { name: 'Appointments', icon: '📅', color: 'blue' },
    consultations: { name: 'Consultations', icon: '🩺', color: 'purple' },
    prescriptions: { name: 'Prescriptions', icon: '💊', color: 'yellow' },
    labTests: { name: 'Lab Tests', icon: '🧪', color: 'red' },
    medicines: { name: 'Medicines', icon: '💉', color: 'pink' },
    billing: { name: 'Billing', icon: '💰', color: 'indigo' },
    users: { name: 'Users', icon: '👤', color: 'gray' },
    config: { name: 'Settings', icon: '⚙️', color: 'slate' },
    ipd: { name: 'IPD Management', icon: '🏥', color: 'teal' }
  };

  const availableModules = getAvailableModules(userRole);
  const modules = {};

  availableModules.forEach(moduleKey => {
    if (allModules[moduleKey]) {
      modules[moduleKey] = allModules[moduleKey];
    }
  });

  return modules;
};

// Get role display information
export const getRoleDisplayInfo = (role) => {
  const roleInfo = {
    [UserRole.ADMIN]: { label: 'Administrator', icon: '👨‍💼', color: 'red' },
    [UserRole.DOCTOR]: { label: 'Doctor', icon: '👨‍⚕️', color: 'blue' },
    [UserRole.RECEPTIONIST]: { label: 'Receptionist', icon: '👩‍💼', color: 'green' },
    [UserRole.LAB_TECH]: { label: 'Lab Technician', icon: '🧪', color: 'purple' },
    [UserRole.PHARMACY]: { label: 'Pharmacist', icon: '💊', color: 'yellow' },
    [UserRole.NURSE]: { label: 'Nurse', icon: '👩‍⚕️', color: 'pink' },
    [UserRole.WARD_MANAGER]: { label: 'Ward Manager', icon: '🏥', color: 'teal' },
    [UserRole.NURSING_SUPERVISOR]: { label: 'Nursing Supervisor', icon: '👩‍⚕️', color: 'purple' },
  };

  return roleInfo[role] || { label: role, icon: '👤', color: 'gray' };
};

// Get role-specific quick actions
export const getRoleQuickActions = (userRole) => {
  const quickActions = {
    [UserRole.ADMIN]: [
      { name: 'Add User', icon: '👤', action: 'addUser', module: 'users' },
      { name: 'System Stats', icon: '📊', action: 'viewStats', module: 'dashboard' },
      { name: 'Backup Data', icon: '💾', action: 'backup', module: 'config' },
    ],
    [UserRole.DOCTOR]: [
      { name: 'Today\'s Appointments', icon: '📅', action: 'todayAppointments', module: 'appointments' },
      { name: 'Pending Consultations', icon: '🩺', action: 'pendingConsultations', module: 'consultations' },
      { name: 'Write Prescription', icon: '💊', action: 'newPrescription', module: 'prescriptions' },
    ],
    [UserRole.RECEPTIONIST]: [
      { name: 'Register Patient', icon: '👥', action: 'addPatient', module: 'patients' },
      { name: 'Book Appointment', icon: '📅', action: 'bookAppointment', module: 'appointments' },
      { name: 'Generate Bill', icon: '💰', action: 'generateBill', module: 'billing' },
    ],
    [UserRole.LAB_TECH]: [
      { name: 'Pending Tests', icon: '🧪', action: 'pendingTests', module: 'labTests' },
      { name: 'Enter Results', icon: '📝', action: 'enterResults', module: 'labTests' },
      { name: 'Test Reports', icon: '📊', action: 'testReports', module: 'labTests' },
    ],
    [UserRole.PHARMACY]: [
      { name: 'Pending Prescriptions', icon: '💊', action: 'pendingPrescriptions', module: 'prescriptions' },
      { name: 'Dispense Medicine', icon: '💉', action: 'dispenseMedicine', module: 'medicines' },
      { name: 'Stock Alert', icon: '⚠️', action: 'stockAlert', module: 'medicines' },
    ],
  };

  return quickActions[userRole] || [];
};

// Get role-specific dashboard widgets
export const getRoleDashboardWidgets = (userRole) => {
  const widgets = {
    [UserRole.ADMIN]: [
      { type: 'stats', title: 'System Overview', data: ['totalUsers', 'totalPatients', 'totalAppointments'] },
      { type: 'chart', title: 'User Activity', data: 'userActivity' },
      { type: 'alerts', title: 'System Alerts', data: 'systemAlerts' },
      { type: 'recent', title: 'Recent Activities', data: 'recentActivities' },
    ],
    [UserRole.DOCTOR]: [
      { type: 'stats', title: 'My Overview', data: ['todayAppointments', 'pendingConsultations', 'totalPatients'] },
      { type: 'schedule', title: 'Today\'s Schedule', data: 'todaySchedule' },
      { type: 'patients', title: 'Recent Patients', data: 'recentPatients' },
      { type: 'alerts', title: 'Medical Alerts', data: 'medicalAlerts' },
    ],
    [UserRole.RECEPTIONIST]: [
      { type: 'stats', title: 'Reception Overview', data: ['todayAppointments', 'newPatients', 'pendingBills'] },
      { type: 'appointments', title: 'Today\'s Appointments', data: 'todayAppointments' },
      { type: 'queue', title: 'Patient Queue', data: 'patientQueue' },
      { type: 'payments', title: 'Payment Status', data: 'paymentStatus' },
      { type: 'revenue', title: 'Revenue Chart', data: 'revenueChart' },
      { type: 'reports', title: 'Financial Reports', data: 'financialReports' },
    ],
    [UserRole.LAB_TECH]: [
      { type: 'stats', title: 'Lab Overview', data: ['pendingTests', 'completedToday', 'totalSamples'] },
      { type: 'tests', title: 'Pending Tests', data: 'pendingTests' },
      { type: 'results', title: 'Recent Results', data: 'recentResults' },
      { type: 'equipment', title: 'Equipment Status', data: 'equipmentStatus' },
    ],
    [UserRole.PHARMACY]: [
      { type: 'stats', title: 'Pharmacy Overview', data: ['pendingPrescriptions', 'lowStock', 'dispensedToday'] },
      { type: 'prescriptions', title: 'Pending Prescriptions', data: 'pendingPrescriptions' },
      { type: 'inventory', title: 'Low Stock Alert', data: 'lowStockItems' },
      { type: 'sales', title: 'Today\'s Sales', data: 'todaySales' },
    ],
  };

  return widgets[userRole] || [];
};
