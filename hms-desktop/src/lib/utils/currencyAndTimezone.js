// Common currencies with their codes and symbols
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
];

// Common timezones organized by region
export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  
  // Europe
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam' },
  { value: 'Europe/Stockholm', label: 'Stockholm' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Europe/Istanbul', label: 'Istanbul' },
  
  // Asia
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { value: 'Asia/Delhi', label: 'India (Delhi)' },
  { value: 'Asia/Mumbai', label: 'India (Mumbai)' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (Dhaka)' },
  { value: 'Asia/Karachi', label: 'Pakistan (Karachi)' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (Colombo)' },
  { value: 'Asia/Kathmandu', label: 'Nepal (Kathmandu)' },
  { value: 'Asia/Dubai', label: 'UAE (Dubai)' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia (Riyadh)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (Kuala Lumpur)' },
  { value: 'Asia/Bangkok', label: 'Thailand (Bangkok)' },
  { value: 'Asia/Jakarta', label: 'Indonesia (Jakarta)' },
  { value: 'Asia/Manila', label: 'Philippines (Manila)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Vietnam (Ho Chi Minh)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Asia/Seoul', label: 'South Korea (Seoul)' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Egypt (Cairo)' },
  { value: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
  { value: 'Africa/Lagos', label: 'Nigeria (Lagos)' },
  { value: 'Africa/Nairobi', label: 'Kenya (Nairobi)' },
  
  // Oceania
  { value: 'Australia/Sydney', label: 'Australia (Sydney)' },
  { value: 'Australia/Melbourne', label: 'Australia (Melbourne)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (Auckland)' },
  
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
];

// Get currency symbol by code
export function getCurrencySymbol(currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : currencyCode;
}

// Format currency amount
export function formatCurrency(amount, currencyCode = 'USD', locale = 'en-US') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }
}

// Format date with timezone
export function formatDate(date, timezone = 'UTC', options = {}) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      ...options,
    }).format(dateObj);
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      ...options,
    }).format(dateObj);
  }
}

// Format date and time with timezone
export function formatDateTime(date, timezone = 'UTC') {
  return formatDate(date, timezone, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date only with timezone
export function formatDateOnly(date, timezone = 'UTC') {
  return formatDate(date, timezone, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

