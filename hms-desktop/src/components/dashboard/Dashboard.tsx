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
import ConfigurationManagement from '../config/ConfigurationManagement';
import { useHospitalConfig } from '../../lib/contexts/HospitalConfigContext';

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
        return React.createElement(ConfigurationManagement, { user });
      default:
        return React.createElement(DashboardOverview, { user });
    }
  };

  return React.createElement(
    'div',
    { style: { display: 'flex', height: '100vh', backgroundColor: '#F0F0F0' } },
    React.createElement(Sidebar, {
      modules,
      activeModule,
      onModuleChange: setActiveModule,
      collapsed: sidebarCollapsed,
      onToggle: () => setSidebarCollapsed(!sidebarCollapsed)
    }),
    React.createElement(
      'div',
      { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
      React.createElement(Header, {
        user,
        onLogout,
        onToggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed)
      }),
      React.createElement(
        'main',
        { style: { flex: 1, overflowX: 'hidden', overflowY: 'auto', backgroundColor: '#F0F0F0', padding: '8px' } },
        renderActiveModule()
      )
    )
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ user }) => {
  const { hospitalName } = useHospitalConfig();
  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    React.createElement(
      'div',
      { style: { backgroundColor: '#FFFFFF', border: '1px solid #C8C8C8', padding: '8px 12px' } },
      React.createElement(
        'h1',
        { style: { fontSize: '16px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
        `🏥 ${hospitalName}`
      ),
      React.createElement(
        'p',
        { style: { fontSize: '13px', color: '#666666', margin: 0, marginBottom: '8px' } },
        `Welcome back, ${user?.fullName || user?.username || 'User'}!`
      ),
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' } },
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '👥 Patients'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Manage patient records and information'
          )
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '📅 Appointments'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Schedule and manage appointments'
          )
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '🩺 Consultations'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Doctor consultations and diagnosis'
          )
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '💊 Prescriptions'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Manage prescriptions and medications'
          )
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '🧪 Lab Tests'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Lab test orders and results'
          )
        ),
        React.createElement(
          'div',
          { style: { backgroundColor: '#F3F3F3', padding: '8px', border: '1px solid #C8C8C8' } },
          React.createElement(
            'h3',
            { style: { fontSize: '13px', fontWeight: '600', color: '#000000', margin: 0, marginBottom: '4px' } },
            '💰 Billing'
          ),
          React.createElement(
            'p',
            { style: { fontSize: '12px', color: '#666666', margin: 0 } },
            'Billing and payment management'
          )
        )
      )
    )
  );
};

export default Dashboard;
