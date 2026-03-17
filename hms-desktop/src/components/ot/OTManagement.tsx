import React, { useState, useEffect } from 'react';
import OTDashboard from './OTDashboard';
import OTRooms from './OTRooms';
import SurgeryScheduling from './SurgeryScheduling';
import SurgeryManagement from './SurgeryManagement';
import PreOperativeCare from './PreOperativeCare';
import PostOperativeCare from './PostOperativeCare';
import OTStaffManagement from './OTStaffManagement';
import OTInventory from './OTInventory';
import OTBilling from './OTBilling';
import { hasOTSubModuleAccess, getAvailableOTSubModules } from '../../lib/utils/rolePermissions';
import { UserRole } from '../../types';

const OTManagement = ({ onBack, isAuthenticated, user }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const userRole = user?.role as UserRole;

  const views = {
    dashboard: { component: OTDashboard, title: 'OT Dashboard', icon: '📊' },
    otRooms: { component: OTRooms, title: 'OT Rooms', icon: '🩺' },
    surgeryScheduling: { component: SurgeryScheduling, title: 'Surgery Scheduling', icon: '📅' },
    surgeryManagement: { component: SurgeryManagement, title: 'Surgery Management', icon: '🏥' },
    preOperativeCare: { component: PreOperativeCare, title: 'Pre-Operative Care', icon: '✅' },
    postOperativeCare: { component: PostOperativeCare, title: 'Post-Operative Care', icon: '📋' },
    otStaffManagement: { component: OTStaffManagement, title: 'OT Staff Management', icon: '👥' },
    otInventory: { component: OTInventory, title: 'OT Inventory', icon: '📦' },
    otBilling: { component: OTBilling, title: 'OT Billing', icon: '💰' },
  };

  useEffect(() => {
    if (currentView !== 'dashboard' && !hasOTSubModuleAccess(userRole, currentView)) {
      setCurrentView('dashboard');
    }
  }, [currentView, userRole]);

  const handleViewChange = (view: string) => {
    if (hasOTSubModuleAccess(userRole, view)) {
      setCurrentView(view);
    }
  };

  const CurrentComponent = views[currentView]?.component;
  const availableSubModules = getAvailableOTSubModules(userRole);

  const moduleCards = [
    { key: 'otRooms', icon: '🩺', title: 'OT Rooms', description: 'Manage operation theatres and availability' },
    { key: 'surgeryScheduling', icon: '📅', title: 'Surgery Scheduling', description: 'Schedule and view surgeries' },
    { key: 'surgeryManagement', icon: '🏥', title: 'Surgery Management', description: 'Manage surgical records and status' },
    { key: 'preOperativeCare', icon: '✅', title: 'Pre-Operative Care', description: 'Pre-op checklists before surgery' },
    { key: 'postOperativeCare', icon: '📋', title: 'Post-Operative Care', description: 'Post-op notes and recovery' },
    { key: 'otStaffManagement', icon: '👥', title: 'OT Staff Management', description: 'Assign team to surgeries' },
    { key: 'otInventory', icon: '📦', title: 'OT Inventory', description: 'Track surgical supplies usage' },
    { key: 'otBilling', icon: '💰', title: 'OT Billing', description: 'Surgery billing and reports' },
  ];

  const accessibleModules = moduleCards.filter((card) => availableSubModules.includes(card.key));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: '#F0F0F0', padding: 8 }}>
      {currentView === 'dashboard' && (
        <div style={{ backgroundColor: '#FFF', border: '1px solid #C8C8C8', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #C8C8C8' }}>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>🩺 OT Management</h1>
            <button
              type="button"
              onClick={onBack}
              style={{
                backgroundColor: '#F3F3F3',
                color: '#000',
                border: '1px solid #C8C8C8',
                padding: '4px 12px',
                borderRadius: 2,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← Back to Main Dashboard
            </button>
          </div>
        </div>
      )}

      {currentView === 'dashboard' ? (
        <>
          {accessibleModules.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 8 }}>
              {accessibleModules.map((card) => (
                <div
                  key={card.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewChange(card.key)}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewChange(card.key)}
                  style={{
                    backgroundColor: '#FFF',
                    padding: 20,
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{card.icon}</div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: 16, fontWeight: 600 }}>{card.title}</h3>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>{card.description}</p>
                </div>
              ))}
            </div>
          )}
          <OTDashboard user={user} onBack={onBack} />
        </>
      ) : CurrentComponent ? (
        <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontSize: 14 }}
            >
              ← OT Dashboard
            </button>
          </div>
          <CurrentComponent user={user} onBack={() => setCurrentView('dashboard')} />
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#FFF', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <h2 style={{ color: '#EF4444', marginBottom: 16 }}>Access Denied</h2>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>You do not have permission to access this OT sub-module.</p>
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Back to OT Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default OTManagement;
