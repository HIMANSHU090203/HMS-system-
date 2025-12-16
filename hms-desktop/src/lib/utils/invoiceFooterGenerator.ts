/**
 * Generates invoice footer text from hospital configuration
 * @param {Object} config - Hospital configuration object
 * @returns {string} - Formatted footer text
 */
export const generateInvoiceFooter = (config) => {
  const footer = config?.modulesEnabled?.billingSettings?.invoiceFooter || {};
  const hospitalName = config?.hospitalName || '[HOSPITAL NAME]';
  
  // Build address line
  const addressParts = [
    config?.address,
    config?.city,
    config?.state,
    config?.postalCode,
    config?.country
  ].filter(Boolean);
  const completeAddress = addressParts.length > 0 
    ? addressParts.join(', ') 
    : '[Complete Address]';
  
  // Build contact line
  const phone = config?.phone || '[Number]';
  const emergency = config?.emergencyContact || '[Emergency Number]';
  const email = config?.email || '[Email]';
  const website = footer.website || config?.website || '[URL]';
  
  // Tax Information
  const gstin = footer.gstin || '[GST Number]';
  const pan = footer.pan || '[PAN Number]';
  const tan = footer.tan || '[TAN Number]';
  const hospitalRegNo = footer.hospitalRegistrationNumber || config?.hospitalLicenseNumber || '[Reg. Number]';
  const regIssuedBy = footer.registrationIssuedBy || '[Authority Name]';
  
  // Payment Information
  const bankName = footer.bankName || '[Bank Name]';
  const bankBranch = footer.bankBranch || '[Branch Name]';
  const accountNumber = footer.accountNumber || '[Account Number]';
  const ifscCode = footer.ifscCode || '[IFSC Code]';
  const upiId = footer.upiId || '[UPI ID]';
  const paymentTerms = footer.paymentTerms || config?.defaultPaymentTerms || 'Net 15 days';
  
  // Legal Information
  const jurisdictionCity = footer.jurisdictionCity || config?.city || '[City]';
  const overdueInterest = footer.overdueInterestRate || '2% monthly';
  const billingContact = footer.billingDepartmentContact || config?.phone || '[Billing Department Contact]';
  
  // Certifications
  const certifications = footer.certifications || '[ISO/NABH/NABL Certifications if applicable]';
  
  // Generate footer text
  const footerText = `
═══════════════════════════════════════════════════════════════════



                        ${hospitalName}

${completeAddress} | Phone: ${phone} | Emergency: ${emergency}

Email: ${email} | Website: ${website}

TAX INFORMATION

GSTIN: ${gstin} | PAN: ${pan} | TAN: ${tan}

Hospital Registration No: ${hospitalRegNo} | Issued by: ${regIssuedBy}

PAYMENT INFORMATION

Bank: ${bankName} | Branch: ${bankBranch}

Account Number: ${accountNumber} | IFSC Code: ${ifscCode}

UPI ID: ${upiId} | Payment Terms: ${paymentTerms}

NOTES

• This invoice is subject to ${jurisdictionCity} jurisdiction

• Payments overdue by 30+ days will incur ${overdueInterest} interest

• For insurance claims, attach this invoice with discharge summary

• For billing queries: ${billingContact}

CERTIFICATIONS: ${certifications}

**Thank you for choosing ${hospitalName}**

This is a system-generated document and does not require physical signature

═══════════════════════════════════════════════════════════════════
`.trim();

  return footerText;
};

export default generateInvoiceFooter;





