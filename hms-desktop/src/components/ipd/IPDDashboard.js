import React, { useState, useEffect } from 'react';
import wardService from '../../lib/api/services/wardService';
import bedService from '../../lib/api/services/bedService';
import admissionService from '../../lib/api/services/admissionService';

const IPDDashboard = ({ onBack, isAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    wards: { total: 0, active: 0, totalCapacity: 0, totalOccupancy: 0 },
    beds: { total: 0, occupied: 0, available: 0, active: 0 },
    admissions: { total: 0, current: 0, discharged: 0, emergency: 0 }
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [wardOccupancy, setWardOccupancy] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      setError('Please login to access IPD dashboard');
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all statistics in parallel
      const [wardStats, bedStats, admissionStats, currentAdmissions, wards] = await Promise.all([
        wardService.getWardStats(),
        bedService.getBedStats(),
        admissionService.getAdmissionStats(),
        admissionService.getCurrentAdmissions(),
        wardService.getWards({ page: 1, limit: 100 })
      ]);

      setStats({
        wards: {
          total: wardStats.totalWards || 0,
          active: wardStats.activeWards || 0,
          totalCapacity: wardStats.totalCapacity || 0,
          totalOccupancy: wardStats.totalOccupancy || 0
        },
        beds: {
          total: bedStats.totalBeds || 0,
          occupied: bedStats.occupiedBeds || 0,
          available: bedStats.availableBeds || 0,
          active: bedStats.activeBeds || 0
        },
        admissions: {
          total: admissionStats.totalAdmissions || 0,
          current: admissionStats.currentAdmissions || 0,
          discharged: admissionStats.dischargedToday || 0,
          emergency: admissionStats.admissionsByType?.find(t => t.admissionType === 'EMERGENCY')?._count?.admissionType || 0
        }
      });

      // Set recent admissions (last 5)
      setRecentAdmissions(currentAdmissions.slice(0, 5));

      // Calculate ward occupancy
      const occupancyData = wards.wards.map(ward => ({
        id: ward.id,
        name: ward.name,
        type: ward.type,
        capacity: ward.capacity,
        occupancy: ward.currentOccupancy || 0,
        occupancyRate: ward.capacity > 0 ? Math.round((ward.currentOccupancy / ward.capacity) * 100) : 0
      }));
      setWardOccupancy(occupancyData);

      setError('');
    } catch (err) {
      console.error('IPD Dashboard data loading error:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('❌ Network error - Backend server may not be running. Check console (F12) for details.');
        console.error('Backend connection error:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard data';
        setError(`❌ Failed to load dashboard data: ${errorMsg}`);
        console.error('API error response:', err.response?.data);
      }
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#dc3545'; // Red - Critical
    if (rate >= 75) return '#ffc107'; // Yellow - High
    if (rate >= 50) return '#17a2b8'; // Blue - Medium
    return '#28a745'; // Green - Low
  };

  const getOccupancyStatus = (rate) => {
    if (rate >= 90) return 'Critical';
    if (rate >= 75) return 'High';
    if (rate >= 50) return 'Medium';
    return 'Low';
  };

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#f8f9fa' } },
    
    // Header
    React.createElement(
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
          '← Back to Dashboard'
        ),
        React.createElement(
          'span',
          { style: { fontSize: '24px', fontWeight: 'bold', color: '#333' } },
          '🏥 IPD Dashboard'
        )
      ),
      React.createElement(
        'button',
        {
          onClick: loadDashboardData,
          disabled: loading,
          style: {
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }
        },
        loading ? '🔄 Refreshing...' : '🔄 Refresh'
      )
    ),

    // Content
    React.createElement(
      'div',
      { style: { padding: '20px' } },

      // Error Message
      error && React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }
        },
        error
      ),

      // Main Statistics Cards
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
        // Wards Statistics
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', marginBottom: '15px' } },
            React.createElement(
              'div',
              { style: { fontSize: '32px', marginRight: '15px' } },
              '🏥'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h3',
                { style: { margin: '0', color: '#333', fontSize: '18px' } },
                'Wards'
              ),
              React.createElement(
                'p',
                { style: { margin: '0', color: '#666', fontSize: '14px' } },
                'Hospital Wards Overview'
              )
            )
          ),
          React.createElement(
            'div',
            { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#007bff' } },
                stats.wards.total
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Total Wards'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#28a745' } },
                stats.wards.active
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Active Wards'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' } },
                stats.wards.totalCapacity
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Total Capacity'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#ffc107' } },
                stats.wards.totalOccupancy
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Current Occupancy'
              )
            )
          )
        ),

        // Beds Statistics
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', marginBottom: '15px' } },
            React.createElement(
              'div',
              { style: { fontSize: '32px', marginRight: '15px' } },
              '🛏️'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h3',
                { style: { margin: '0', color: '#333', fontSize: '18px' } },
                'Beds'
              ),
              React.createElement(
                'p',
                { style: { margin: '0', color: '#666', fontSize: '14px' } },
                'Bed Management Overview'
              )
            )
          ),
          React.createElement(
            'div',
            { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#007bff' } },
                stats.beds.total
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Total Beds'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#dc3545' } },
                stats.beds.occupied
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Occupied'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#28a745' } },
                stats.beds.available
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Available'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' } },
                stats.beds.active
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Active Beds'
              )
            )
          )
        ),

        // Admissions Statistics
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', marginBottom: '15px' } },
            React.createElement(
              'div',
              { style: { fontSize: '32px', marginRight: '15px' } },
              '👥'
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'h3',
                { style: { margin: '0', color: '#333', fontSize: '18px' } },
                'Admissions'
              ),
              React.createElement(
                'p',
                { style: { margin: '0', color: '#666', fontSize: '14px' } },
                'Patient Admissions Overview'
              )
            )
          ),
          React.createElement(
            'div',
            { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#007bff' } },
                stats.admissions.total
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Total Admissions'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#ffc107' } },
                stats.admissions.current
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Current Patients'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#28a745' } },
                stats.admissions.discharged
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Discharged Today'
              )
            ),
            React.createElement(
              'div',
              { style: { textAlign: 'center' } },
              React.createElement(
                'div',
                { style: { fontSize: '24px', fontWeight: 'bold', color: '#dc3545' } },
                stats.admissions.emergency
              ),
              React.createElement(
                'div',
                { style: { fontSize: '12px', color: '#666' } },
                'Emergency Cases'
              )
            )
          )
        )
      ),

      // Ward Occupancy Chart
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px',
            border: '1px solid #e9ecef'
          }
        },
        React.createElement(
          'h3',
          { style: { margin: '0 0 20px 0', color: '#333', fontSize: '20px' } },
          '📊 Ward Occupancy Status'
        ),
        wardOccupancy.length === 0 ? React.createElement(
          'div',
          { style: { textAlign: 'center', color: '#666', padding: '40px' } },
          'No ward data available'
        ) : React.createElement(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }
          },
          ...wardOccupancy.map(ward => {
            const occupancyColor = getOccupancyColor(ward.occupancyRate);
            const occupancyStatus = getOccupancyStatus(ward.occupancyRate);
            
            return React.createElement(
              'div',
              {
                key: ward.id,
                style: {
                  padding: '15px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }
              },
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
                React.createElement(
                  'div',
                  { style: { fontWeight: 'bold', color: '#333' } },
                  `🏥 ${ward.name}`
                ),
                React.createElement(
                  'span',
                  {
                    style: {
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: occupancyColor + '20',
                      color: occupancyColor
                    }
                  },
                  `${occupancyStatus} (${ward.occupancyRate}%)`
                )
              ),
              React.createElement(
                'div',
                { style: { marginBottom: '8px' } },
                React.createElement(
                  'div',
                  {
                    style: {
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }
                  },
                  React.createElement(
                    'div',
                    {
                      style: {
                        width: `${ward.occupancyRate}%`,
                        height: '100%',
                        backgroundColor: occupancyColor,
                        transition: 'width 0.3s ease'
                      }
                    }
                  )
                )
              ),
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' } },
                React.createElement('span', null, `${ward.occupancy} / ${ward.capacity} beds`),
                React.createElement('span', null, `${ward.type}`)
              )
            );
          })
        )
      ),

      // Recent Admissions
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }
        },
        React.createElement(
          'h3',
          { style: { margin: '0 0 20px 0', color: '#333', fontSize: '20px' } },
          '🕒 Recent Admissions'
        ),
        recentAdmissions.length === 0 ? React.createElement(
          'div',
          { style: { textAlign: 'center', color: '#666', padding: '40px' } },
          'No recent admissions found'
        ) : React.createElement(
          'div',
          { style: { overflowX: 'auto' } },
          React.createElement(
            'table',
            {
              style: {
                width: '100%',
                borderCollapse: 'collapse'
              }
            },
            React.createElement(
              'thead',
              {
                style: {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }
              },
              React.createElement(
                'tr',
                null,
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Patient'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Ward/Bed'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Admission Type'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Admission Date'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Status')
              )
            ),
            React.createElement(
              'tbody',
              null,
              ...recentAdmissions.map((admission, index) => {
                const admissionDate = admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : '-';
                const typeInfo = {
                  EMERGENCY: { icon: '🚨', label: 'Emergency' },
                  ELECTIVE: { icon: '📅', label: 'Elective' },
                  TRANSFER: { icon: '🔄', label: 'Transfer' },
                  OBSERVATION: { icon: '👁️', label: 'Observation' },
                  SURGICAL: { icon: '⚕️', label: 'Surgical' },
                  MEDICAL: { icon: '🩺', label: 'Medical' }
                }[admission.admissionType] || { icon: '🏥', label: admission.admissionType };
                
                return React.createElement(
                  'tr',
                  {
                    key: admission.id,
                    style: {
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }
                  },
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      { style: { fontWeight: 'bold', color: '#333' } },
                      admission.patient?.name || 'Unknown Patient'
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      null,
                      React.createElement(
                        'div',
                        { style: { fontWeight: 'bold' } },
                        `🏥 ${admission.ward?.name || 'Unknown Ward'}`
                      ),
                      React.createElement(
                        'div',
                        { style: { fontSize: '12px', color: '#666' } },
                        `🛏️ Bed ${admission.bed?.bedNumber || 'Unknown'}`
                      )
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#f8f9fa',
                          color: '#495057',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      },
                      `${typeInfo.icon} ${typeInfo.label}`
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    admissionDate
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: '#007bff20',
                          color: '#007bff'
                        }
                      },
                      '🏥 Admitted'
                    )
                  )
                );
              })
            )
          )
        )
      )
    )
  );
};

export default IPDDashboard;