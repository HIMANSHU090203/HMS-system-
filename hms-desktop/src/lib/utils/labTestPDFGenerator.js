import configService from '../api/services/configService';

const LabTestPDFGenerator = {
  // Format date like "27-Apr-2020"
  formatDate: (date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  },

  // Format time like "04:37 PM"
  formatTime: (date) => {
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  },

  // Parse reference range to extract data points (matching the component logic)
  parseReferenceRange: (referenceRange) => {
    if (!referenceRange) return [];
    
    const points = [];
    // Support both pipe-delimited (new format) and comma-delimited (old format)
    const delimiter = referenceRange.includes('|') ? '|' : ',';
    const parts = referenceRange.split(delimiter).map(p => p.trim());
    
    parts.forEach(part => {
      // Support section headers like "BLOOD INDICES:" (no value after colon)
      const headerOnly = part.match(/^([A-Za-z0-9()\s\/\-]+):\s*$/);
      if (headerOnly) {
        points.push({ type: 'section', name: headerOnly[1].trim() });
        return;
      }

      // Match patterns: "Name: range unit" or "Name: range" or "Name: value"
      const match = part.match(/^([^:]+):\s*(.+)$/);
      if (!match) return;

      const name = match[1].trim();
      const rangeUnit = match[2].trim();
      
      // Extract unit if present (extended common units)
      const unitMatch = rangeUnit.match(/(.+?)\s*(g\/dL|mg\/dL|U\/L|μL|cumm|mill\/cumm|%|ng\/mL|pg\/mL|mm\/hr|mg\/L|L|Images|N\/A|fL|pg|mIU\/L|IU\/L|mmol\/L|g\/L|10\^3\/μL|10\^6\/μL|cells\/μL|mEq\/L|mmHg|deg|cm)?$/);
      const value = unitMatch ? (unitMatch[1] || '').trim() : rangeUnit;
      const unit = unitMatch && unitMatch[2] ? unitMatch[2] : '';
      
      // Parse min/max from range (e.g., "13.0-17.0" or "<5.7" or "00-06")
      let minValue = null;
      let maxValue = null;
      const rangeMatch = value.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
      const lessThanMatch = value.match(/^<\s*([\d.]+)$/);
      const greaterThanMatch = value.match(/^>\s*([\d.]+)$/);
      
      if (rangeMatch) {
        minValue = parseFloat(rangeMatch[1]);
        maxValue = parseFloat(rangeMatch[2]);
      } else if (lessThanMatch) {
        maxValue = parseFloat(lessThanMatch[1]);
      } else if (greaterThanMatch) {
        minValue = parseFloat(greaterThanMatch[1]);
      }
      
      points.push({
        type: 'data',
        name: name,
        minValue: minValue,
        maxValue: maxValue,
        unit: unit,
        referenceRange: rangeUnit
      });
    });

    return points;
  },

  // Calculate status for a value (matching the component logic)
  calculateStatus: (value, minValue, maxValue, referenceRange) => {
    if (!value || value.trim() === '') return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    // Handle special cases like "Primary Sample Type"
    if (referenceRange && !referenceRange.includes('-') && !referenceRange.includes('<') && !referenceRange.includes('>')) {
      return null; // No status for non-numeric ranges
    }
    
    if (minValue !== null && maxValue !== null) {
      if (numValue < minValue) return 'Low';
      if (numValue > maxValue) return 'High';
      // Check if borderline (within 5% of limits)
      const range = maxValue - minValue;
      if (numValue <= minValue + (range * 0.05) || numValue >= maxValue - (range * 0.05)) {
        return 'Borderline';
      }
      return 'Normal';
    } else if (maxValue !== null && numValue > maxValue) {
      return 'High';
    } else if (minValue !== null && numValue < minValue) {
      return 'Low';
    }
    
    return 'Normal';
  },

  // Generate PDF for lab test results
  generateLabTestPDF: async (labTest) => {
    try {
      // Fetch hospital config
      const configResponse = await configService.getHospitalConfig();
      const hospitalConfig = configResponse.config || {};

      // Build hospital address
      const addressParts = [
        hospitalConfig.address,
        hospitalConfig.city,
        hospitalConfig.state,
        hospitalConfig.postalCode,
        hospitalConfig.country
      ].filter(Boolean);
      const hospitalAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';

      const testCategory = labTest.testCatalog?.category || 'General';
      const patient = labTest.patient || {};
      const doctor = labTest.orderedByUser || {};
      const technician = labTest.performedByUser || {};

      // Parse results if structured
      let dataPoints = [];
      let parsedResults = {};
      if (labTest.testCatalog?.referenceRange) {
        dataPoints = LabTestPDFGenerator.parseReferenceRange(labTest.testCatalog.referenceRange);
        // Parse actual results
        if (labTest.results) {
          const resultLines = labTest.results.split('\n');
          for (const line of resultLines) {
            const match = line.match(/^([^:]+):\s*(.+)$/);
            if (match) {
              parsedResults[match[1].trim()] = match[2].trim();
            }
          }
        }
      }

      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lab Test Report - ${labTest.testNameSnapshot}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
              background: white;
              font-size: 10pt;
              line-height: 1.4;
            }
            .report-page {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
            }
            .header-section {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10mm;
              margin-bottom: 8mm;
            }
            .hospital-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 5mm;
            }
            .hospital-info {
              flex: 1;
            }
            .hospital-name {
              font-size: 20pt;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 2mm;
            }
            .hospital-details {
              font-size: 9pt;
              color: #666;
              line-height: 1.6;
            }
            .report-title {
              text-align: center;
              font-size: 18pt;
              font-weight: bold;
              color: #111827;
              margin-top: 5mm;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .patient-section {
              margin: 8mm 0;
              padding: 5mm;
              background-color: #f8fafc;
              border-left: 4px solid #2563eb;
              border-radius: 4px;
            }
            .patient-row {
              display: flex;
              margin-bottom: 3mm;
              font-size: 11pt;
            }
            .patient-label {
              font-weight: bold;
              min-width: 120px;
              color: #374151;
            }
            .patient-value {
              color: #111827;
            }
            .test-info-section {
              margin: 8mm 0;
              padding: 5mm;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
            }
            .test-info-row {
              display: flex;
              margin-bottom: 2mm;
              font-size: 10pt;
            }
            .test-info-label {
              font-weight: 600;
              min-width: 140px;
              color: #6b7280;
            }
            .test-info-value {
              color: #111827;
            }
            .results-container {
              margin: 8mm 0;
              max-height: 400mm;
              overflow-y: auto;
            }
            .results-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10pt;
              border: 1px solid #e5e7eb;
            }
            .results-table th {
              background-color: #2563eb;
              color: white;
              padding: 10px 12px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #1e40af;
            }
            .results-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .section-header {
              background-color: #f3f4f6 !important;
              color: #111827 !important;
              font-weight: 700 !important;
              font-size: 11pt !important;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .normal-value {
              background-color: #d1fae5;
              color: #065f46;
              font-weight: 600;
            }
            .high-value {
              background-color: #fee2e2;
              color: #991b1b;
              font-weight: 600;
            }
            .low-value {
              background-color: #dbeafe;
              color: #1e40af;
              font-weight: 600;
            }
            .borderline-value {
              background-color: #fef3c7;
              color: #92400e;
              font-weight: 600;
            }
            .notes-section {
              margin: 8mm 0;
              padding: 5mm;
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .notes-title {
              font-weight: 600;
              font-size: 11pt;
              color: #92400e;
              margin-bottom: 3mm;
            }
            .notes-content {
              font-size: 10pt;
              color: #78350f;
              white-space: pre-wrap;
            }
            .signature-section {
              margin-top: 15mm;
              padding-top: 5mm;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              border-bottom: 2px solid #000;
              margin-bottom: 3mm;
              height: 20mm;
            }
            .signature-label {
              font-weight: 600;
              font-size: 10pt;
              color: #374151;
            }
            .footer {
              margin-top: 10mm;
              padding-top: 5mm;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 8pt;
              color: #6b7280;
            }
            @media print {
              body { 
                margin: 0;
                padding: 5mm;
              }
              @page {
                size: A4;
                margin: 0;
              }
              .results-container {
                max-height: none;
                overflow: visible;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-page">
            <div class="header-section">
              <div class="hospital-header">
                <div class="hospital-info">
                  <div class="hospital-name">${hospitalConfig.hospitalName || 'Hospital Management System'}</div>
                  <div class="hospital-details">
                    ${hospitalAddress}<br>
                    Phone: ${hospitalConfig.phone || 'N/A'} | Email: ${hospitalConfig.email || 'N/A'}
                  </div>
                </div>
              </div>
              <div class="report-title">Laboratory Test Report</div>
            </div>

            <div class="patient-section">
              <div class="patient-row">
                <span class="patient-label">Patient Name:</span>
                <span class="patient-value">${patient.name || 'N/A'}</span>
                <span class="patient-label" style="margin-left: 20mm;">Patient ID:</span>
                <span class="patient-value">${patient.id || 'N/A'}</span>
              </div>
              <div class="patient-row">
                <span class="patient-label">Age:</span>
                <span class="patient-value">${patient.age || 'N/A'} years</span>
                <span class="patient-label" style="margin-left: 20mm;">Gender:</span>
                <span class="patient-value">${patient.gender || 'N/A'}</span>
              </div>
              <div class="patient-row">
                <span class="patient-label">Phone:</span>
                <span class="patient-value">${patient.phone || 'N/A'}</span>
              </div>
            </div>

            <div class="test-info-section">
              <div class="test-info-row">
                <span class="test-info-label">Test Name:</span>
                <span class="test-info-value"><strong>${labTest.testNameSnapshot || 'N/A'}</strong></span>
              </div>
              <div class="test-info-row">
                <span class="test-info-label">Test Category:</span>
                <span class="test-info-value">${testCategory}</span>
                <span class="test-info-label" style="margin-left: 20mm;">Test Date:</span>
                <span class="test-info-value">${LabTestPDFGenerator.formatDate(labTest.completedAt || labTest.createdAt)}</span>
              </div>
              <div class="test-info-row">
                <span class="test-info-label">Ordered By:</span>
                <span class="test-info-value">Dr. ${doctor.fullName || 'N/A'}</span>
                <span class="test-info-label" style="margin-left: 20mm;">Performed By:</span>
                <span class="test-info-value">${technician.fullName || 'N/A'}</span>
              </div>
              ${labTest.testCatalog?.description ? `
                <div class="test-info-row">
                  <span class="test-info-label">Description:</span>
                  <span class="test-info-value">${labTest.testCatalog.description}</span>
                </div>
              ` : ''}
            </div>

            ${dataPoints.length > 0 ? `
              <div class="results-container">
                <table class="results-table">
                  <thead>
                    <tr>
                      <th>Investigation</th>
                      <th>Result</th>
                      <th>Reference Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataPoints.map((point, idx) => {
                      if (point.type === 'section') {
                        return `
                          <tr>
                            <td colspan="4" class="section-header">${point.name}</td>
                          </tr>
                        `;
                      }
                      
                      const value = parsedResults[point.name] || '';
                      const status = LabTestPDFGenerator.calculateStatus(value, point.minValue, point.maxValue, point.referenceRange);
                      let statusClass = '';
                      if (status === 'Normal') statusClass = 'normal-value';
                      else if (status === 'High') statusClass = 'high-value';
                      else if (status === 'Low') statusClass = 'low-value';
                      else if (status === 'Borderline') statusClass = 'borderline-value';
                      
                      return `
                        <tr>
                          <td><strong>${point.name}</strong></td>
                          <td class="${statusClass}">${value || '-'} ${status ? `(${status})` : ''}</td>
                          <td>${point.referenceRange || '-'}</td>
                          <td>${point.unit || '-'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="results-container">
                <div style="padding: 10mm; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
                  <h3 style="margin-bottom: 5mm; color: #374151; font-size: 12pt;">Test Results:</h3>
                  <pre style="font-family: Arial, sans-serif; font-size: 10pt; color: #111827; white-space: pre-wrap; line-height: 1.6;">${labTest.results || 'No results available'}</pre>
                </div>
              </div>
            `}

            ${labTest.notes ? `
              <div class="notes-section">
                <div class="notes-title">Notes / Remarks:</div>
                <div class="notes-content">${labTest.notes}</div>
              </div>
            ` : ''}

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Lab Technician</div>
                <div style="margin-top: 2mm; font-size: 9pt; color: #6b7280;">${technician.fullName || 'N/A'}</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Date & Time</div>
                <div style="margin-top: 2mm; font-size: 9pt; color: #6b7280;">
                  ${LabTestPDFGenerator.formatDate(labTest.completedAt || labTest.createdAt)}, ${LabTestPDFGenerator.formatTime(labTest.completedAt || labTest.createdAt)}
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer-generated report. For any queries, please contact the laboratory.</p>
              <p style="margin-top: 2mm;">Report Generated: ${LabTestPDFGenerator.formatDate(new Date())} ${LabTestPDFGenerator.formatTime(new Date())}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating lab test PDF:', error);
      throw error;
    }
  }
};

export default LabTestPDFGenerator;

