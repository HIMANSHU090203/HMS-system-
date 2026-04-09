import React, { useState, useEffect } from 'react';
import appointmentService from '../../../lib/api/services/appointmentService';
import type { User } from '../../../types';

interface AppointmentSlotPickerProps {
  patientId: string | null;
  onSelect: (payload: { doctorId: string; date: string; time: string }) => void;
  doctors?: User[];
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const AppointmentSlotPicker: React.FC<AppointmentSlotPickerProps> = ({
  patientId,
  onSelect,
  doctors: doctorsProp,
}) => {
  const [doctors, setDoctors] = useState<User[]>(doctorsProp || []);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctorsProp?.length) return;
    let cancelled = false;
    setLoading(true);
    appointmentService.getAvailableDoctors().then((list) => {
      if (!cancelled) setDoctors(list || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [doctorsProp]);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctorId && date && time) {
      onSelect({ doctorId: selectedDoctorId, date, time });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!patientId && (
        <p style={{ color: '#B45309', fontSize: 14 }}>Complete Step 1 (select or register patient) first.</p>
      )}
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Doctor</label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: 14,
          }}
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.fullName}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: 14,
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Time</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: 14,
          }}
        >
          <option value="">Select time</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!patientId || !selectedDoctorId || !date || !time}
        style={{
          padding: '10px 16px',
          backgroundColor: (!patientId || !selectedDoctorId || !date || !time) ? '#9CA3AF' : '#2563EB',
          color: '#FFF',
          border: 'none',
          borderRadius: '6px',
          cursor: (!patientId || !selectedDoctorId || !date || !time) ? 'not-allowed' : 'pointer',
          fontWeight: 500,
        }}
      >
        Schedule appointment
      </button>
    </form>
  );
};

export default AppointmentSlotPicker;
