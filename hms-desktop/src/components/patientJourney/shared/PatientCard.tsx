import React from 'react';
import type { Patient } from '../../../lib/api/types';

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, compact = false, onClick }) => {
  const content = (
    <div
      style={{
        padding: compact ? '8px 12px' : '12px 16px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        backgroundColor: '#FFF',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={{ fontWeight: 600, fontSize: compact ? '14px' : '16px', marginBottom: compact ? 4 : 6 }}>
        {patient.name}
      </div>
      <div style={{ fontSize: '13px', color: '#6B7280' }}>
        ID: {patient.id} · Phone: {patient.phone}
        {!compact && patient.address && (
          <span> · {patient.address.length > 40 ? patient.address.slice(0, 40) + '…' : patient.address}</span>
        )}
      </div>
    </div>
  );
  return content;
};

export default PatientCard;
