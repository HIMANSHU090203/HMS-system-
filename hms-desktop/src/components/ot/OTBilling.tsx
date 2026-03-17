import React from 'react';

const OTBilling = ({ user, onBack }) => (
  <div style={{ padding: 16, backgroundColor: '#F0F0F0' }}>
    <h2 style={{ marginBottom: 16 }}>OT Billing</h2>
    <p style={{ color: '#6B7280' }}>
      Surgery charges (OT room, surgeon fee, anesthesia, implants) are integrated with IPD billing when the patient is admitted.
      For standalone day-care surgeries, billing can be generated from the Billing module. This screen will show OT-specific billing reports in a future update.
    </p>
  </div>
);

export default OTBilling;
