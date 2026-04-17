import React, { useState, useEffect } from 'react';
import otService from '../../lib/api/services/otService';
import LoadingSpinner from '../common/LoadingSpinner';

const OTInventory = ({ user, onBack }) => {
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    otService.getSurgeries({ status: 'IN_PROGRESS', limit: 20 }).then((res) => {
      if (res?.data?.surgeries) setSurgeries(res.data.surgeries);
      setLoading(false);
    }).catch((e) => {
      setError(e?.response?.data?.message || 'Failed to load surgeries');
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: 16, backgroundColor: '#F0F0F0' }}>
      <h2 style={{ marginBottom: 16 }}>OT Inventory Usage</h2>
      {error && <p style={{ color: '#B91C1C', marginBottom: 12 }}>{error}</p>}
      <p style={{ color: '#6B7280', marginBottom: 16 }}>Record surgical kits, implants, and consumables used during surgery. Select a surgery to view or add usage.</p>
      <div style={{ background: '#FFF', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ textAlign: 'left', padding: 12 }}>Procedure</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Patient</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {surgeries.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: 12 }}>{s.procedureName}</td>
                <td style={{ padding: 12 }}>{s.patient?.name ?? '-'}</td>
                <td style={{ padding: 12 }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {surgeries.length === 0 && !error && <p style={{ color: '#6B7280', padding: 16 }}>No surgeries in progress.</p>}
    </div>
  );
};

export default OTInventory;
