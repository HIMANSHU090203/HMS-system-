import React, { useState, useEffect } from 'react';
import IPDDashboard from './IPDDashboard';
import WardManagement from './WardManagement';
import BedManagement from './BedManagement';
import AdmissionManagement from './AdmissionManagement';
import PatientCare from './PatientCare';
import NursingCare from './NursingCare';
import DischargeManagement from './DischargeManagement';
import IPDBilling from './IPDBilling';
import { hasIPDSubModuleAccess, getAvailableIPDSubModules } from '../../lib/utils/rolePermissions';
import { UserRole } from '../../types';

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

  // Get user role
  const userRole = user?.role as UserRole;

  // Check if user has access to current view, if not redirect to dashboard
  useEffect(() => {
    if (currentView !== 'dashboard' && !hasIPDSubModuleAccess(userRole, currentView)) {
      setCurrentView('dashboard');
    }
  }, [currentView, userRole]);

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    // Check access before changing view
    if (hasIPDSubModuleAccess(userRole, view)) {
      setCurrentView(view);
    } else {
      console.warn(`Access denied to IPD sub-module: ${view}`);
    }
  };

  const CurrentComponent = views[currentView]?.component;

  // Get available sub-modules for the user's role
  const availableSubModules = getAvailableIPDSubModules(userRole);

  // Define all module cards with their properties
  const moduleCards = [
    { key: 'wards', icon: '🏥', title: 'Ward Management', description: 'Manage hospital wards, capacity, and occupancy' },
    { key: 'beds', icon: '🛏️', title: 'Bed Management', description: 'Manage bed allocation, types, and availability' },
    { key: 'admissions', icon: '👥', title: 'Admission Management', description: 'Admit patients, manage stays, and discharge' },
    { key: 'patientCare', icon: '🩺', title: 'Patient Care', description: 'Vital signs monitoring and daily rounds' },
    { key: 'nursingCare', icon: '👩‍⚕️', title: 'Nursing Care', description: 'Nursing shift management and care' },
    { key: 'discharge', icon: '📋', title: 'Discharge Management', description: 'Create and manage discharge summaries' },
    { key: 'billing', icon: '💰', title: 'IPD Billing', description: 'Manage inpatient bills and payments' }
  ];

  // Filter modules based on user's role
  const accessibleModules = moduleCards.filter(card => 
    availableSubModules.includes(card.key)
  );

  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F0F0F0', padding: '8px' } },
    
    // Navigation Header
    currentView === 'dashboard' && React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #C8C8C8',
          padding: '8px 12px'
        }
      },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #C8C8C8' } },
        React.createElement(
          'h1',
          { style: { fontSize: '16px', fontWeight: '600', color: '#000000', margin: 0 } },
          '🏥 IPD Management'
        ),
        React.createElement(
          'button',
          {
            onClick: onBack,
            style: {
              backgroundColor: '#F3F3F3',
              color: '#000000',
              border: '1px solid #C8C8C8',
              padding: '4px 12px',
              borderRadius: '2px',
              fontSize: '13px',
              fontWeight: '400',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
            },
            onMouseOver: (e) => {
              e.target.style.backgroundColor = '#E8E8E8';
            },
            onMouseOut: (e) => {
              e.target.style.backgroundColor = '#F3F3F3';
            }
          },
          '← Back to Main Dashboard'
        )
      )
    ),

    // Main Content
    currentView === 'dashboard' ? React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      
      // Quick Actions Grid - Only show modules accessible by user's role
      accessibleModules.length > 0 && React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '8px'
          }
        },
        ...accessibleModules.map(card => 
          React.createElement(
            'div',
            {
              key: card.key,
              onClick: () => handleViewChange(card.key),
              style: {
                backgroundColor: '#FFFFFF',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              },
              onMouseOver: (e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.boxShadow = '0 4px 6px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06)';
              },
              onMouseOut: (e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
              }
            },
            React.createElement(
              'div',
              { style: { fontSize: '40px', marginBottom: '12px' } },
              card.icon
            ),
            React.createElement(
              'h3',
              { style: { margin: '0 0 8px 0', color: '#111827', fontSize: '16px', fontWeight: '600' } },
              card.title
            ),
            React.createElement(
              'p',
              { style: { margin: '0', color: '#6B7280', fontSize: '13px', lineHeight: '1.5' } },
              card.description
            )
          )
        )
      ),

      // Dashboard Component
      React.createElement(IPDDashboard, {
        onBack: onBack,
        isAuthenticated: isAuthenticated,
        user: user
      })
    ) : CurrentComponent ? React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflow: 'hidden'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            padding: '8px 12px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleBackToDashboard,
            style: {
              background: 'none',
              border: 'none',
              color: '#2563EB',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            },
            onMouseOver: (e) => {
              e.currentTarget.style.textDecoration = 'underline';
            },
            onMouseOut: (e) => {
              e.currentTarget.style.textDecoration = 'none';
            }
          },
          '← Back to IPD Dashboard'
        )
      ),
      React.createElement(CurrentComponent, {
        onBack: handleBackToDashboard,
        isAuthenticated: isAuthenticated,
        user: user
      })
    ) : React.createElement(
      'div',
      { 
        style: { 
          padding: '40px', 
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E5E7EB'
        } 
      },
      React.createElement(
        'h2',
        { style: { color: '#EF4444', marginBottom: '16px' } },
        '🚫 Access Denied'
      ),
      React.createElement(
        'p',
        { style: { color: '#6B7280', marginBottom: '24px' } },
        'You do not have permission to access this IPD sub-module.'
      ),
      React.createElement(
        'button',
        {
          onClick: handleBackToDashboard,
          style: {
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          },
          onMouseOver: (e) => {
            e.currentTarget.style.backgroundColor = '#1D4ED8';
          },
          onMouseOut: (e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
          }
        },
        'Back to IPD Dashboard'
      )
    )
  );
};

export default IPDManagement;