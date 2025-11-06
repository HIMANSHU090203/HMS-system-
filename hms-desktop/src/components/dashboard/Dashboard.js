import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PatientManagement from '../patients/PatientManagement';
import AppointmentManagement from '../appointments/AppointmentManagement';
import ConsultationManagement from '../consultations/ConsultationManagement';
import PrescriptionManagement from '../prescriptions/PrescriptionManagement';
import LabTestManagement from '../labTests/LabTestManagement';
import MedicineManagement from '../medicines/MedicineManagement';
import BillingManagement from '../billing/BillingManagement';
import UserManagement from '../users/UserManagement';
import SystemConfig from '../config/SystemConfig';

const Dashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const modules = {
    dashboard: { name: 'Dashboard', icon: '🏠' },
    patients: { name: 'Patients', icon: '👥' },
    appointments: { name: 'Appointments', icon: '📅' },
    consultations: { name: 'Consultations', icon: '🩺' },
    prescriptions: { name: 'Prescriptions', icon: '💊' },
    labTests: { name: 'Lab Tests', icon: '🧪' },
    medicines: { name: 'Medicines', icon: '💉' },
    billing: { name: 'Billing', icon: '💰' },
    users: { name: 'Users', icon: '👤' },
    config: { name: 'Settings', icon: '⚙️' }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'patients':
        return React.createElement(PatientManagement);
      case 'appointments':
        return React.createElement(AppointmentManagement);
      case 'consultations':
        return React.createElement(ConsultationManagement);
      case 'prescriptions':
        return React.createElement(PrescriptionManagement);
      case 'labTests':
        return React.createElement(LabTestManagement);
      case 'medicines':
        return React.createElement(MedicineManagement);
      case 'billing':
        return React.createElement(BillingManagement);
      case 'users':
        return React.createElement(UserManagement);
      case 'config':
        return React.createElement(SystemConfig);
      default:
        return React.createElement(DashboardOverview, { user });
    }
  };

  return React.createElement(
    'div',
    { className: 'flex h-screen bg-gray-100' },
    React.createElement(Sidebar, {
      modules,
      activeModule,
      onModuleChange: setActiveModule,
      collapsed: sidebarCollapsed,
      onToggle: () => setSidebarCollapsed(!sidebarCollapsed)
    }),
    React.createElement(
      'div',
      { className: 'flex-1 flex flex-col overflow-hidden' },
      React.createElement(Header, {
        user,
        onLogout,
        onToggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed)
      }),
      React.createElement(
        'main',
        { className: 'flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6' },
        renderActiveModule()
      )
    )
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ user }) => {
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg shadow p-6' },
      React.createElement(
        'h1',
        { className: 'text-2xl font-bold text-gray-900 mb-4' },
        '🏥 Hospital Management System'
      ),
      React.createElement(
        'p',
        { className: 'text-gray-600 mb-4' },
        `Welcome back, ${user?.fullName || user?.username || 'User'}!`
      ),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        React.createElement(
          'div',
          { className: 'bg-blue-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-blue-900' },
            '👥 Patients'
          ),
          React.createElement(
            'p',
            { className: 'text-blue-700' },
            'Manage patient records and information'
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-green-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-green-900' },
            '📅 Appointments'
          ),
          React.createElement(
            'p',
            { className: 'text-green-700' },
            'Schedule and manage appointments'
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-purple-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-purple-900' },
            '🩺 Consultations'
          ),
          React.createElement(
            'p',
            { className: 'text-purple-700' },
            'Doctor consultations and diagnosis'
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-yellow-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-yellow-900' },
            '💊 Prescriptions'
          ),
          React.createElement(
            'p',
            { className: 'text-yellow-700' },
            'Manage prescriptions and medications'
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-red-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-red-900' },
            '🧪 Lab Tests'
          ),
          React.createElement(
            'p',
            { className: 'text-red-700' },
            'Lab test orders and results'
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-indigo-50 p-4 rounded-lg' },
          React.createElement(
            'h3',
            { className: 'text-lg font-semibold text-indigo-900' },
            '💰 Billing'
          ),
          React.createElement(
            'p',
            { className: 'text-indigo-700' },
            'Billing and payment management'
          )
        )
      )
    )
  );
};

export default Dashboard;
