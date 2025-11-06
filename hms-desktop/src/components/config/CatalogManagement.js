import React, { useState, useEffect } from 'react';
import catalogService from '../../lib/api/services/catalogService';

const CatalogManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('allergies'); // allergies, conditions, diagnoses, medicines
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'allergies':
          const allergyData = await catalogService.getAllAllergies();
          setAllergies(allergyData.allergies);
          break;
        case 'conditions':
          const conditionData = await catalogService.getAllChronicConditions();
          setConditions(conditionData.conditions);
          break;
        case 'diagnoses':
          const diagnosisData = await catalogService.getAllDiagnoses();
          setDiagnoses(diagnosisData.diagnoses);
          break;
        case 'medicines':
          const medicineData = await catalogService.getAllMedicines();
          setMedicines(medicineData.medicines);
          break;
      }
    } catch (err) {
      console.error('Load catalog error:', err);
      setError('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      switch (activeTab) {
        case 'allergies':
          await catalogService.addAllergy(formData);
          break;
        case 'conditions':
          await catalogService.addChronicCondition(formData);
          break;
        case 'diagnoses':
          await catalogService.addDiagnosis(formData);
          break;
        case 'medicines':
          await catalogService.addMedicine(formData);
          break;
      }
      setShowAddForm(false);
      setFormData({});
      loadData();
    } catch (err) {
      console.error('Add catalog item error:', err);
      setError('Failed to add catalog item');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { style: { padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' } },
    
    // Header
    React.createElement(
      'h1',
      { style: { fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' } },
      'Catalog Management'
    ),

    // Tabs
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB' } },
      ['allergies', 'conditions', 'diagnoses', 'medicines'].map(tab => React.createElement(
        'button',
        {
          key: tab,
          onClick: () => setActiveTab(tab),
          style: {
            padding: '12px 16px',
            backgroundColor: activeTab === tab ? '#2563EB' : 'transparent',
            color: activeTab === tab ? '#FFFFFF' : '#6B7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            borderBottom: activeTab === tab ? '2px solid #2563EB' : 'none'
          }
        },
        tab.charAt(0).toUpperCase() + tab.slice(1)
      ))
    ),

    // Content Area
    React.createElement(
      'div',
      { style: { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px' } },
      
      error && React.createElement(
        'div',
        { style: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px', marginBottom: '16px', fontSize: '14px' } },
        error
      ),

      loading ? React.createElement(
        'div',
        { style: { textAlign: 'center', padding: '40px', color: '#6B7280' } },
        'Loading...'
      ) : React.createElement('div', null, 
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
          React.createElement(
            'h2',
            { style: { fontSize: '18px', fontWeight: '600', color: '#111827' } },
            `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Catalog`
          ),
          React.createElement(
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
            showAddForm ? 'Cancel' : `+ Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).slice(0, -1)}`
          )
        ),

        // Table content goes here (simplified for now)
        React.createElement(
          'div',
          { style: { color: '#6B7280', fontSize: '14px' } },
          `Catalog management UI for ${activeTab} coming soon...`
        )
      )
    )
  );
};

export default CatalogManagement;

