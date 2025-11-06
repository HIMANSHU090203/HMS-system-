import React, { useState } from 'react';
import IPDDashboard from './IPDDashboard';
import WardManagement from './WardManagement';
import BedManagement from './BedManagement';
import AdmissionManagement from './AdmissionManagement';
import PatientCare from './PatientCare';
import NursingCare from './NursingCare';
import DischargeManagement from './DischargeManagement';
import IPDBilling from './IPDBilling';

const IPDManagement = ({ onBack, isAuthenticated, user }) => {
  const [currentView, setCurrentView] = useState('dashboard');

  const views = {
    dashboard: { component: IPDDashboard, title: 'IPD Dashboard', icon: '📊' },
    wards: { component: WardManagement, title: 'Ward Management', icon: '🏥' },
    beds: { component: BedManagement, title: 'Bed Management', icon: '🛏️' },
    admissions: { component: AdmissionManagement, title: 'Admission Management', icon: '👥' },
    patientCare: { component: PatientCare, title: 'Patient Care', icon: '🩺' },
    nursingCare: { component: NursingCare, title: 'Nursing Care', icon: '👩‍⚕️' },
    discharge: { component: DischargeManagement, title: 'Discharge Management', icon: '📋' },
    billing: { component: IPDBilling, title: 'IPD Billing', icon: '💰' }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const CurrentComponent = views[currentView].component;

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#f8f9fa' } },
    
    // Navigation Header
    currentView === 'dashboard' && React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center' } },
        React.createElement(
          'button',
          {
            onClick: onBack,
            style: {
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '15px'
            }
          },
          '← Back to Main Dashboard'
        ),
        React.createElement(
          'span',
          { style: { fontSize: '24px', fontWeight: 'bold', color: '#333' } },
          '🏥 IPD Management'
        )
      )
    ),

    // Main Content
    currentView === 'dashboard' ? React.createElement(
      'div',
      { style: { padding: '20px' } },
      
      // Quick Actions Grid
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }
        },
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('wards'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '🏥'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Ward Management'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Manage hospital wards, capacity, and occupancy'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('beds'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '🛏️'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Bed Management'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Manage bed allocation, types, and availability'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('admissions'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '👥'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Admission Management'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Admit patients, manage stays, and discharge'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('patientCare'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '🩺'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Patient Care'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Vital signs monitoring and daily rounds'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('nursingCare'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '👩‍⚕️'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Nursing Care'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Nursing shift management and care'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('discharge'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '📋'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'Discharge Management'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Create and manage discharge summaries'
          )
        ),
        React.createElement(
          'div',
          {
            onClick: () => setCurrentView('billing'),
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '48px', marginBottom: '15px' } },
            '💰'
          ),
          React.createElement(
            'h3',
            { style: { margin: '0 0 10px 0', color: '#333', fontSize: '20px' } },
            'IPD Billing'
          ),
          React.createElement(
            'p',
            { style: { margin: '0', color: '#666', fontSize: '14px' } },
            'Manage inpatient bills and payments'
          )
        )
      ),

      // Dashboard Component
      React.createElement(IPDDashboard, {
        onBack: onBack,
        isAuthenticated: isAuthenticated
      })
    ) : React.createElement(CurrentComponent, {
      onBack: handleBackToDashboard,
      isAuthenticated: isAuthenticated,
      user: user
    })
  );
};

export default IPDManagement;