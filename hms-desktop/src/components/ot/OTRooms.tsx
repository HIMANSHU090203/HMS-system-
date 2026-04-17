import React, { useState, useEffect } from 'react';
import otService from '../../lib/api/services/otService';
import LoadingSpinner from '../common/LoadingSpinner';

const OTRooms = ({ user, onBack }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    otService.getOTRooms({ limit: 50 }).then((res) => {
      if (res?.data?.rooms) setRooms(res.data.rooms);
      setLoading(false);
    }).catch((e) => {
      setError(e?.response?.data?.message || 'Failed to load OT rooms');
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: 16, backgroundColor: '#F0F0F0' }}>
      <h2 style={{ marginBottom: 16 }}>OT Rooms</h2>
      {error && <p style={{ color: '#B91C1C', marginBottom: 12 }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {rooms.map((room) => (
          <div key={room.id} style={{ background: '#FFF', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{room.name}</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>{room.type}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 12,
                backgroundColor: room.status === 'AVAILABLE' ? '#D1FAE5' : room.status === 'OCCUPIED' ? '#FEE2E2' : '#FEF3C7',
                color: room.status === 'AVAILABLE' ? '#065F46' : room.status === 'OCCUPIED' ? '#991B1B' : '#92400E',
              }}>
                {room.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {rooms.length === 0 && !error && <p style={{ color: '#6B7280' }}>No OT rooms configured.</p>}
    </div>
  );
};

export default OTRooms;
