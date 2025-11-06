// Professional Invoice PDF Generator - Apollo Hospitals Style
// Supports both OPD billing and IPD billing formats

// Convert number to words (Indian numbering system)
function numberToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertHundreds = (num) => {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num >= 10) {
      result += teens[num - 10] + ' ';
      num = 0;
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
    return result.trim();
  };

  const convert = (num) => {
    if (num === 0) return 'Zero';
    let result = '';
    
    if (num >= 10000000) {
      result += convertHundreds(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    if (num >= 100000) {
      result += convertHundreds(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (num > 0) {
      result += convertHundreds(num);
    }
    
    return result.trim();
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let words = convert(integerPart) + ' Rupees';
  if (decimalPart > 0) {
    words += ' and ' + convert(decimalPart) + ' Paise';
  }
  
  return words;
}

// Format date like "30-Nov-2023"
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format time like "10:06 AM"
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Format currency with Indian Rupee symbol
function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

const InvoicePDFGenerator = {
  // Generate OPD Bill/Invoice PDF
  generateOPDBillPDF: (invoiceData) => {
    const printWindow = window.open('', '_blank');
    
    const hospitalConfig = invoiceData.hospitalConfig || {};
    const patient = invoiceData.patient || {};
    const items = invoiceData.items || [];
    
    // Build hospital address
    const addressParts = [
      hospitalConfig.address,
      hospitalConfig.city,
      hospitalConfig.state,
      hospitalConfig.postalCode,
      hospitalConfig.country
    ].filter(Boolean);
    const hospitalAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';
    
    // Calculate totals
    const subtotal = invoiceData.subtotal || 0;
    const discount = invoiceData.discount || 0;
    const tax = invoiceData.tax || 0;
    const totalAmount = invoiceData.totalAmount || 0;
    
    // Build services table rows
    const servicesRows = items.map((item, index) => {
      const amount = (item.quantity || 1) * (item.unitPrice || item.price || 0);
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 10pt;">${item.description || item.name || 'Service'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10pt;">${formatCurrency(amount)}</td>
        </tr>
      `;
    }).join('');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoiceData.billNumber || 'N/A'}</title>
        <meta charset="utf-8" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15mm;
            background: white;
            font-size: 10pt;
            line-height: 1.4;
          }
          .invoice-page {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header-section {
            margin-bottom: 8mm;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5mm;
          }
          .hospital-branding {
            flex: 1;
          }
          .hospital-name {
            font-size: 24pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .hospital-tagline {
            font-size: 9pt;
            color: #666;
            margin-bottom: 3mm;
          }
          .hospital-address {
            font-size: 9pt;
            color: #333;
            line-height: 1.6;
            margin-bottom: 2mm;
          }
          .hospital-contact {
            font-size: 9pt;
            color: #333;
            line-height: 1.6;
          }
          .emergency-box {
            background-color: #dc3545;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            min-width: 120px;
          }
          .invoice-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 5mm 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .details-section {
            border: 1px solid #000;
            padding: 5mm;
            margin-bottom: 5mm;
            display: flex;
            gap: 10mm;
          }
          .patient-details {
            flex: 1;
          }
          .bill-details {
            flex: 1;
          }
          .details-header {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 3mm;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 2mm;
          }
          .detail-row {
            margin-bottom: 2mm;
            font-size: 10pt;
          }
          .detail-label {
            font-weight: bold;
            display: inline-block;
            min-width: 80px;
          }
          .services-section {
            margin-bottom: 5mm;
          }
          .services-header {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 3mm;
            text-transform: uppercase;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
          }
          .services-table th {
            background-color: #f0f0f0;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 2px solid #000;
          }
          .services-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10pt;
          }
          .financial-summary {
            margin-top: 5mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10mm;
          }
          .amount-in-words {
            flex: 1;
            font-size: 10pt;
            font-style: italic;
            color: #333;
            padding: 3mm;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }
          .total-amount {
            text-align: right;
            font-size: 12pt;
            font-weight: bold;
            padding: 3mm;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .total-label {
            margin-bottom: 2mm;
          }
          .total-value {
            font-size: 14pt;
          }
          .disclaimer-section {
            margin-top: 8mm;
            padding-top: 5mm;
            border-top: 1px solid #ddd;
            font-size: 8pt;
            color: #666;
            line-height: 1.6;
          }
          .disclaimer-item {
            margin-bottom: 2mm;
          }
          .footer {
            margin-top: 5mm;
            text-align: center;
            font-size: 8pt;
            color: #666;
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
          }
        </style>
      </head>
      <body>
        <div class="invoice-page">
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-top">
              <div class="hospital-branding">
                <div class="hospital-name">${hospitalConfig.hospitalName || 'HOSPITAL MANAGEMENT SYSTEM'}</div>
                ${hospitalConfig.tagline ? `<div class="hospital-tagline">${hospitalConfig.tagline}</div>` : ''}
                <div class="hospital-address">${hospitalAddress}</div>
                <div class="hospital-contact">
                  ${hospitalConfig.phone ? `For Appointments and Enquiries, Please Call: ${hospitalConfig.phone}` : ''}
                  ${hospitalConfig.email ? `<br>E-mail Us: ${hospitalConfig.email}` : ''}
                </div>
              </div>
              ${hospitalConfig.emergencyContact ? `
                <div class="emergency-box">
                  EMERGENCY ${hospitalConfig.emergencyContact}
                </div>
              ` : ''}
            </div>
            <div class="invoice-title">INPATIENT BILL</div>
          </div>

          <!-- Patient and Bill Details Section -->
          <div class="details-section">
            <div class="patient-details">
              <div class="details-header">PATIENT DETAILS</div>
              <div class="detail-row">
                <span class="detail-label">Patient Name:</span> ${patient.name || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span> ${patient.address || 'N/A'}
              </div>
              ${patient.phone ? `
                <div class="detail-row">
                  <span class="detail-label">Phone:</span> ${patient.phone}
                </div>
              ` : ''}
            </div>
            <div class="bill-details">
              <div class="details-header">BILL INFORMATION</div>
              ${invoiceData.billNumber ? `
                <div class="detail-row">
                  <span class="detail-label">Bill No:</span> ${invoiceData.billNumber}
                </div>
              ` : ''}
              ${invoiceData.ipNumber ? `
                <div class="detail-row">
                  <span class="detail-label">IP No:</span> ${invoiceData.ipNumber}
                </div>
              ` : ''}
              ${invoiceData.idNumber ? `
                <div class="detail-row">
                  <span class="detail-label">ID No:</span> ${invoiceData.idNumber}
                </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Bill Dt/Time:</span> ${formatDate(invoiceData.billDate)} ${formatTime(invoiceData.billDate)}
              </div>
              ${invoiceData.admissionDate ? `
                <div class="detail-row">
                  <span class="detail-label">Admission Dt/Time:</span> ${formatDate(invoiceData.admissionDate)} ${formatTime(invoiceData.admissionDate)}
                </div>
              ` : ''}
              ${invoiceData.dischargeDate ? `
                <div class="detail-row">
                  <span class="detail-label">Discharge Dt/Time:</span> ${formatDate(invoiceData.dischargeDate)} ${formatTime(invoiceData.dischargeDate)}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Services Breakdown Section -->
          <div class="services-section">
            <div class="services-header">DETAILS</div>
            <table class="services-table">
              <thead>
                <tr>
                  <th style="width: 70%;">Service Name</th>
                  <th style="width: 30%; text-align: right;">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                ${servicesRows}
                ${discount > 0 ? `
                  <tr>
                    <td style="text-align: right; font-weight: bold; padding-top: 10px;">Discount:</td>
                    <td style="text-align: right; font-weight: bold; padding-top: 10px;">${formatCurrency(discount)}</td>
                  </tr>
                ` : ''}
                ${tax > 0 ? `
                  <tr>
                    <td style="text-align: right; font-weight: bold;">Tax:</td>
                    <td style="text-align: right; font-weight: bold;">${formatCurrency(tax)}</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <div class="amount-in-words">
              <strong>In Words:</strong> ${numberToWords(totalAmount)}
            </div>
            <div class="total-amount">
              <div class="total-label">Bill Amount</div>
              <div class="total-value">${formatCurrency(totalAmount)}</div>
            </div>
          </div>

          ${invoiceData.refundableDeposit !== undefined ? `
            <div style="margin-top: 5mm; font-size: 10pt;">
              <strong>Refundable Deposit As On ${formatDate(invoiceData.depositDate)} ${formatTime(invoiceData.depositDate)}</strong> ${formatCurrency(invoiceData.refundableDeposit)}
            </div>
          ` : ''}

          <!-- Disclaimers Section -->
          <div class="disclaimer-section">
            <div class="disclaimer-item">
              <strong>Statement Type:</strong> This is a computer generated statement and requires no signature.
            </div>
            ${hospitalConfig.insuranceValidityNote ? `
              <div class="disclaimer-item">
                <strong>Insurance Validity:</strong> ${hospitalConfig.insuranceValidityNote}
              </div>
            ` : ''}
            ${hospitalConfig.billingEmail ? `
              <div class="disclaimer-item">
                For billing and general enquiries, please mail: ${hospitalConfig.billingEmail}
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            © ${hospitalConfig.hospitalName || 'Hospital Management System'} ${new Date().getFullYear()}, All rights reserved
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
  },

  // Generate IPD Bill PDF (Inpatient Bill)
  generateIPDBillPDF: (invoiceData) => {
    const printWindow = window.open('', '_blank');
    
    const hospitalConfig = invoiceData.hospitalConfig || {};
    const patient = invoiceData.patient || {};
    const admission = invoiceData.admission || {};
    
    // Build hospital address
    const addressParts = [
      hospitalConfig.address,
      hospitalConfig.city,
      hospitalConfig.state,
      hospitalConfig.postalCode,
      hospitalConfig.country
    ].filter(Boolean);
    const hospitalAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';
    
    // Build services from IPD bill structure
    const services = [];
    if (invoiceData.roomCharges > 0) {
      services.push({ name: 'ROOM RENT', amount: invoiceData.roomCharges });
    }
    if (invoiceData.medicineCharges > 0) {
      services.push({ name: 'PHARMACY', amount: invoiceData.medicineCharges });
    }
    if (invoiceData.procedureCharges > 0) {
      services.push({ name: 'MEDICAL EQUIPMENT', amount: invoiceData.procedureCharges });
    }
    if (invoiceData.consultationCharges > 0) {
      services.push({ name: 'CONSULTATIONS', amount: invoiceData.consultationCharges });
    }
    if (invoiceData.otherCharges > 0) {
      services.push({ name: 'CONSUMABLES', amount: invoiceData.otherCharges });
    }
    if (invoiceData.labCharges > 0) {
      services.push({ name: 'INVESTIGATIONS', amount: invoiceData.labCharges });
    }
    
    const totalAmount = invoiceData.totalAmount || 0;
    
    // Build services table rows
    const servicesRows = services.map(service => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 10pt;">${service.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10pt;">${formatCurrency(service.amount)}</td>
      </tr>
    `).join('');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inpatient Bill - ${invoiceData.billNumber || 'N/A'}</title>
        <meta charset="utf-8" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15mm;
            background: white;
            font-size: 10pt;
            line-height: 1.4;
          }
          .invoice-page {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header-section {
            margin-bottom: 8mm;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5mm;
          }
          .hospital-branding {
            flex: 1;
          }
          .hospital-name {
            font-size: 24pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .hospital-tagline {
            font-size: 9pt;
            color: #666;
            margin-bottom: 3mm;
          }
          .hospital-address {
            font-size: 9pt;
            color: #333;
            line-height: 1.6;
            margin-bottom: 2mm;
          }
          .hospital-contact {
            font-size: 9pt;
            color: #333;
            line-height: 1.6;
          }
          .emergency-box {
            background-color: #dc3545;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
            min-width: 120px;
          }
          .invoice-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 5mm 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .details-section {
            border: 1px solid #000;
            padding: 5mm;
            margin-bottom: 5mm;
            display: flex;
            gap: 10mm;
          }
          .patient-details {
            flex: 1;
          }
          .bill-details {
            flex: 1;
          }
          .details-header {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 3mm;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 2mm;
          }
          .detail-row {
            margin-bottom: 2mm;
            font-size: 10pt;
          }
          .detail-label {
            font-weight: bold;
            display: inline-block;
            min-width: 100px;
          }
          .services-section {
            margin-bottom: 5mm;
          }
          .services-header {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 3mm;
            text-transform: uppercase;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
          }
          .services-table th {
            background-color: #f0f0f0;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
            border-bottom: 2px solid #000;
          }
          .services-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10pt;
          }
          .financial-summary {
            margin-top: 5mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10mm;
          }
          .amount-in-words {
            flex: 1;
            font-size: 10pt;
            font-style: italic;
            color: #333;
            padding: 3mm;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }
          .total-amount {
            text-align: right;
            font-size: 12pt;
            font-weight: bold;
            padding: 3mm;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .total-label {
            margin-bottom: 2mm;
          }
          .total-value {
            font-size: 14pt;
          }
          .disclaimer-section {
            margin-top: 8mm;
            padding-top: 5mm;
            border-top: 1px solid #ddd;
            font-size: 8pt;
            color: #666;
            line-height: 1.6;
          }
          .disclaimer-item {
            margin-bottom: 2mm;
          }
          .footer {
            margin-top: 5mm;
            text-align: center;
            font-size: 8pt;
            color: #666;
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
          }
        </style>
      </head>
      <body>
        <div class="invoice-page">
          <!-- Header Section -->
          <div class="header-section">
            <div class="header-top">
              <div class="hospital-branding">
                <div class="hospital-name">${hospitalConfig.hospitalName || 'HOSPITAL MANAGEMENT SYSTEM'}</div>
                ${hospitalConfig.tagline ? `<div class="hospital-tagline">${hospitalConfig.tagline}</div>` : ''}
                <div class="hospital-address">${hospitalAddress}</div>
                <div class="hospital-contact">
                  ${hospitalConfig.phone ? `For Appointments and Enquiries, Please Call: ${hospitalConfig.phone}` : ''}
                  ${hospitalConfig.email ? `<br>E-mail Us: ${hospitalConfig.email}` : ''}
                </div>
              </div>
              ${hospitalConfig.emergencyContact ? `
                <div class="emergency-box">
                  EMERGENCY ${hospitalConfig.emergencyContact}
                </div>
              ` : ''}
            </div>
            <div class="invoice-title">INPATIENT BILL</div>
          </div>

          <!-- Patient and Bill Details Section -->
          <div class="details-section">
            <div class="patient-details">
              <div class="details-header">PATIENT DETAILS</div>
              <div class="detail-row">
                <span class="detail-label">Patient Name:</span> ${patient.name || 'N/A'}
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span> ${patient.address || 'N/A'}
              </div>
              ${patient.phone ? `
                <div class="detail-row">
                  <span class="detail-label">Phone:</span> ${patient.phone}
                </div>
              ` : ''}
            </div>
            <div class="bill-details">
              <div class="details-header">BILL INFORMATION</div>
              ${invoiceData.billNumber ? `
                <div class="detail-row">
                  <span class="detail-label">Bill No:</span> ${invoiceData.billNumber}
                </div>
              ` : ''}
              ${invoiceData.ipNumber || admission.id ? `
                <div class="detail-row">
                  <span class="detail-label">IP No:</span> ${invoiceData.ipNumber || admission.id}
                </div>
              ` : ''}
              ${patient.id ? `
                <div class="detail-row">
                  <span class="detail-label">ID No:</span> ${patient.id}
                </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Bill Dt/Time:</span> ${formatDate(invoiceData.billDate)} ${formatTime(invoiceData.billDate)}
              </div>
              ${admission.admissionDate ? `
                <div class="detail-row">
                  <span class="detail-label">Admission Dt/Time:</span> ${formatDate(admission.admissionDate)} ${formatTime(admission.admissionDate)}
                </div>
              ` : ''}
              ${admission.dischargeDate ? `
                <div class="detail-row">
                  <span class="detail-label">Discharge Dt/Time:</span> ${formatDate(admission.dischargeDate)} ${formatTime(admission.dischargeDate)}
                </div>
              ` : `
                <div class="detail-row">
                  <span class="detail-label">Discharge Dt/Time:</span> ---
                </div>
              `}
            </div>
          </div>

          <!-- Services Breakdown Section -->
          <div class="services-section">
            <div class="services-header">DETAILS</div>
            <table class="services-table">
              <thead>
                <tr>
                  <th style="width: 70%;">Service Name</th>
                  <th style="width: 30%; text-align: right;">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                ${servicesRows}
              </tbody>
            </table>
          </div>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <div class="amount-in-words">
              <strong>In Words:</strong> ${numberToWords(totalAmount)}
            </div>
            <div class="total-amount">
              <div class="total-label">Bill Amount</div>
              <div class="total-value">${formatCurrency(totalAmount)}</div>
            </div>
          </div>

          ${invoiceData.refundableDeposit !== undefined ? `
            <div style="margin-top: 5mm; font-size: 10pt;">
              <strong>Refundable Deposit As On ${formatDate(invoiceData.depositDate)} ${formatTime(invoiceData.depositDate)}</strong> ${formatCurrency(invoiceData.refundableDeposit)}
            </div>
          ` : ''}

          <!-- Disclaimers Section -->
          <div class="disclaimer-section">
            <div class="disclaimer-item">
              <strong>Statement Type:</strong> This is a computer generated statement and requires no signature.
            </div>
            ${hospitalConfig.insuranceValidityNote ? `
              <div class="disclaimer-item">
                <strong>Insurance Validity:</strong> ${hospitalConfig.insuranceValidityNote}
              </div>
            ` : `
              <div class="disclaimer-item">
                <strong>Insurance Validity:</strong> This Receipt is valid for an employer or insurer, who contractually obligated to reimburse the medical expenses covered by MediSave and/or MediShield.
              </div>
            `}
            ${hospitalConfig.billingEmail || hospitalConfig.email ? `
              <div class="disclaimer-item">
                For billing and general enquiries, please mail: ${hospitalConfig.billingEmail || hospitalConfig.email}
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            © ${hospitalConfig.hospitalName || 'Hospital Management System'} ${new Date().getFullYear()}, All rights reserved
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
  }
};

export default InvoicePDFGenerator;




