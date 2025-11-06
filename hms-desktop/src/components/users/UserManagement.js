import React, { useState, useEffect } from 'react';
import userService from '../../lib/api/services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import { canManageUsers, getRoleDisplayInfo } from '../../lib/utils/rolePermissions';
import { UserRole } from '../../lib/api/types';
import InfoButton from '../common/InfoButton';
import { getInfoContent } from '../../lib/infoContent';

const UserManagement = ({ user: currentUser, isAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'RECEPTIONIST',
    email: '',
    phone: '',
    department: ''
  });
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Get all roles with their display info
  const roles = Object.values(UserRole).map(roleValue => {
    const roleInfo = getRoleDisplayInfo(roleValue);
    return {
      value: roleValue,
      label: roleInfo.label,
      icon: roleInfo.icon
    };
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadStats()
      ]);
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setError('');
      const response = await userService.getUsers({
        search: searchTerm,
        role: filterRole || undefined,
        isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined
      });
      if (response.users) {
        setUsers(response.users || []);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Load users error:', err);
      setError('Error loading users: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordResetChange = (e) => {
    const { name, value } = e.target;
    setPasswordResetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const userData = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.department && { department: formData.department })
      };

      const response = await userService.createUser(userData);
      if (response) {
        console.log('User created:', response);
        setShowAddForm(false);
        setFormData({
          username: '',
          password: '',
          fullName: '',
          role: 'RECEPTIONIST',
          email: '',
          phone: '',
          department: ''
        });
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error('Create user error:', err);
      setError('Error creating user: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (userId) => {
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await userService.resetUserPassword(userId, passwordResetData.newPassword);
      setShowPasswordReset(null);
      setPasswordResetData({ newPassword: '', confirmPassword: '' });
      setError('');
      // Show success message
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Error resetting password: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      await userService.toggleUserStatus(userId);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Toggle status error:', err);
      setError('Error updating user status: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await userService.deleteUser(userId);
      loadUsers();
      loadStats();
      setError('User deleted successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Error deleting user: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || { value: role, label: role, icon: '👤' };
  };

  // Permission checks
  const canCreateUsers = () => {
    return currentUser && canManageUsers(currentUser.role);
  };

  const canDeleteUser = (targetUserId) => {
    // Only admins can delete users, and they cannot delete themselves
    return currentUser && 
           canManageUsers(currentUser.role) && 
           currentUser.id !== targetUserId;
  };

  const canToggleUserStatus = (targetUserId) => {
    // Admins can toggle any user's status, users can only deactivate themselves
    return currentUser && (
      canManageUsers(currentUser.role) || 
      currentUser.id === targetUserId
    );
  };

  const canResetPassword = (targetUserId) => {
    // Admins can reset any password, users can only reset their own
    return currentUser && (
      canManageUsers(currentUser.role) || 
      currentUser.id === targetUserId
    );
  };

  if (loading && users.length === 0) {
    return React.createElement(
      'div',
      { className: 'flex justify-center items-center h-64' },
      React.createElement(LoadingSpinner, { text: 'Loading users...' })
    );
  }

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '0' } },
    
    // Statistics Cards
    stats && React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px', padding: '24px' } },
      React.createElement(
        'div',
        { style: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' } },
        React.createElement(
          'h3',
          { style: { fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '500' } },
          'Total Users'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827' } },
          stats.totalUsers
        )
      ),
      React.createElement(
        'div',
        { style: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' } },
        React.createElement(
          'h3',
          { style: { fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '500' } },
          'Active Users'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827' } },
          stats.activeUsers
        )
      ),
      React.createElement(
        'div',
        { style: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' } },
        React.createElement(
          'h3',
          { style: { fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '500' } },
          'Inactive Users'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827' } },
          stats.inactiveUsers
        )
      ),
      React.createElement(
        'div',
        { style: { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' } },
        React.createElement(
          'h3',
          { style: { fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '500' } },
          'Recent Users'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827' } },
          stats.recentUsers
        )
      )
    ),

    React.createElement(
      'div',
      { style: { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', margin: '0 24px 24px 24px' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #E5E7EB' } },
        React.createElement(
          'h1',
          { style: { fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 } },
          'User Management'
        ),
        canCreateUsers() && React.createElement(
          'button',
          {
            onClick: () => setShowAddForm(!showAddForm),
            style: {
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }
          },
          showAddForm ? 'Cancel' : '+ Add User'
        )
      ),

      // Add User Form
      showAddForm && React.createElement(
        'div',
        { style: { backgroundColor: '#F9FAFB', padding: '16px', borderBottom: '1px solid #E5E7EB' } },
        React.createElement(
          'h3',
          { style: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' } },
          'Add New User'
        ),
        React.createElement(
          'form',
          { onSubmit: handleSubmit, style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Username *'
            ),
            React.createElement('input', {
              type: 'text',
              name: 'username',
              required: true,
              value: formData.username,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Password *'
            ),
            React.createElement('input', {
              type: 'password',
              name: 'password',
              required: true,
              minLength: 6,
              value: formData.password,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Full Name *'
            ),
            React.createElement('input', {
              type: 'text',
              name: 'fullName',
              required: true,
              value: formData.fullName,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Role *'
            ),
            React.createElement(
              'select',
              {
                name: 'role',
                required: true,
                value: formData.role,
                onChange: handleInputChange,
                style: {
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }
              },
              roles.map(role => React.createElement(
                'option',
                { key: role.value, value: role.value },
                `${role.icon} ${role.label}`
              ))
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Email'
            ),
            React.createElement('input', {
              type: 'email',
              name: 'email',
              value: formData.email,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' } },
              'Phone'
            ),
            React.createElement('input', {
              type: 'tel',
              name: 'phone',
              value: formData.phone,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#FFFFFF'
              }
            })
          ),
          React.createElement(
            'div',
            { style: { gridColumn: 'span 2' } },
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: loading,
                style: {
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  padding: '8px 24px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }
              },
              loading ? 'Creating...' : 'Create User'
            )
          )
        )
      ),

      // Search and Filters
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' } },
        React.createElement(
          'input',
          {
            type: 'text',
            placeholder: 'Search users...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            style: {
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#FFFFFF'
            }
          }
        ),
        React.createElement(
          'select',
          {
            value: filterRole,
            onChange: (e) => setFilterRole(e.target.value),
            style: {
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#FFFFFF'
            }
          },
          React.createElement('option', { value: '' }, 'All Roles'),
          roles.map(role => React.createElement(
            'option',
            { key: role.value, value: role.value },
            role.label
          ))
        ),
        React.createElement(
          'select',
          {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            style: {
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#FFFFFF'
            }
          },
          React.createElement('option', { value: '' }, 'All Status'),
          React.createElement('option', { value: 'active' }, 'Active'),
          React.createElement('option', { value: 'inactive' }, 'Inactive')
        ),
        React.createElement(
          'button',
          {
            onClick: handleSearch,
            style: {
              backgroundColor: '#6B7280',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }
          },
          'Search'
        )
      ),

      // Error Display
      error && React.createElement(
        'div',
        { style: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px', margin: '16px 24px', fontSize: '14px' } },
        error
      ),

      // Users Table
      React.createElement(
        'div',
        { style: { overflowX: 'auto' } },
        React.createElement(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement(
            'thead',
            { style: { backgroundColor: '#F9FAFB' } },
            React.createElement(
              'tr',
              null,
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '14px', color: '#111827' } }, 'User'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '14px', color: '#111827' } }, 'Role'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '14px', color: '#111827' } }, 'Status'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '14px', color: '#111827' } }, 'Created'),
              React.createElement('th', { style: { padding: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '14px', color: '#111827' } }, 'Actions')
            )
          ),
          React.createElement(
            'tbody',
            { style: { backgroundColor: '#FFFFFF' } },
            users.length === 0 ? React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                { colSpan: 5, style: { padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '14px' } },
                loading ? 'Loading...' : 'No users found. Click "Add User" to create your first user.'
              )
            ) : users.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              return React.createElement(
                'tr',
                { key: user.id || index, style: { borderBottom: '1px solid #F3F4F6' } },
                React.createElement(
                  'td',
                  { style: { padding: '12px' } },
                  React.createElement(
                    'div',
                    null,
                    React.createElement(
                      'div',
                      { style: { fontSize: '14px', fontWeight: '500', color: '#111827' } },
                      user.fullName || 'N/A'
                    ),
                    React.createElement(
                      'div',
                      { style: { fontSize: '12px', color: '#6B7280' } },
                      user.username || 'N/A'
                    )
                  )
                ),
                React.createElement(
                  'td',
                  { style: { padding: '12px', fontSize: '14px', color: '#111827' } },
                  React.createElement(
                    'span',
                    { style: { padding: '4px 8px', fontSize: '12px', fontWeight: '500', backgroundColor: '#F3F4F6', color: '#111827' } },
                    roleInfo.label
                  )
                ),
                React.createElement(
                  'td',
                  { style: { padding: '12px' } },
                  React.createElement(
                    'span',
                    { style: { padding: '4px 8px', fontSize: '12px', fontWeight: '500', backgroundColor: user.isActive ? '#D1FAE5' : '#FEE2E2', color: user.isActive ? '#065F46' : '#991B1B' } },
                    user.isActive ? 'Active' : 'Inactive'
                  )
                ),
                React.createElement(
                  'td',
                  { style: { padding: '12px', fontSize: '14px', color: '#6B7280' } },
                  new Date(user.createdAt).toLocaleDateString()
                ),
                React.createElement(
                  'td',
                  { style: { padding: '12px' } },
                  React.createElement(
                    'div',
                    { style: { display: 'flex', gap: '8px' } },
                    canResetPassword(user.id) && React.createElement(
                      'button',
                      {
                        onClick: () => setShowPasswordReset(user.id),
                        style: {
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }
                      },
                      'Reset'
                    ),
                    canToggleUserStatus(user.id) && React.createElement(
                      'button',
                      {
                        onClick: () => handleToggleStatus(user.id),
                        style: {
                          backgroundColor: user.isActive ? '#EF4444' : '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }
                      },
                      user.isActive ? 'Deactivate' : 'Activate'
                    ),
                    canDeleteUser(user.id) && React.createElement(
                      'button',
                      {
                        onClick: () => handleDeleteUser(user.id, user.fullName || user.username),
                        style: {
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }
                      },
                      'Delete'
                    )
                  )
                )
              );
            })
          )
        )
      )
    ),

    // Password Reset Modal
    showPasswordReset && React.createElement(
      'div',
      { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' },
      React.createElement(
        'div',
        { className: 'relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white' },
        React.createElement(
          'h3',
          { className: 'text-lg font-bold text-gray-900 mb-4' },
          'Reset Password'
        ),
        React.createElement(
          'div',
          { className: 'space-y-4' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700' },
              'New Password'
            ),
            React.createElement('input', {
              type: 'password',
              name: 'newPassword',
              required: true,
              minLength: 6,
              value: passwordResetData.newPassword,
              onChange: handlePasswordResetChange,
              className: 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700' },
              'Confirm Password'
            ),
            React.createElement('input', {
              type: 'password',
              name: 'confirmPassword',
              required: true,
              minLength: 6,
              value: passwordResetData.confirmPassword,
              onChange: handlePasswordResetChange,
              className: 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            })
          ),
          React.createElement(
            'div',
            { className: 'flex space-x-2' },
            React.createElement(
              'button',
              {
                onClick: () => handlePasswordReset(showPasswordReset),
                className: 'flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              },
              'Reset Password'
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  setShowPasswordReset(null);
                  setPasswordResetData({ newPassword: '', confirmPassword: '' });
                },
                className: 'flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
              },
              'Cancel'
            )
          )
        )
      )
    )
  );
};

export default UserManagement;