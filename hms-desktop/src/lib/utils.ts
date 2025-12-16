import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Handles numeric input changes, allowing empty values for better UX
 * @param {Event} e - The input change event
 * @param {Function} setValue - Function to update the value
 * @param {Object} options - Options for handling the input
 * @param {boolean} options.allowNegative - Whether to allow negative numbers (default: false)
 * @param {number} options.min - Minimum value allowed
 * @param {number} options.max - Maximum value allowed
 * @param {boolean} options.isInteger - Whether to parse as integer instead of float (default: false)
 */
export function handleNumericInput(e, setValue, options = {}) {
  const { allowNegative = false, min, max, isInteger = false } = options;
  const value = e.target.value;
  
  // Allow empty string or minus sign (if negative allowed) for editing
  if (value === '' || (value === '-' && allowNegative)) {
    setValue('');
    return;
  }
  
  // Parse the number
  const numValue = isInteger ? parseInt(value, 10) : parseFloat(value);
  
  // Check if valid number
  if (isNaN(numValue)) {
    return; // Don't update if invalid
  }
  
  // Apply min/max constraints
  let finalValue = numValue;
  if (min !== undefined && finalValue < min) {
    finalValue = min;
  }
  if (max !== undefined && finalValue > max) {
    finalValue = max;
  }
  
  setValue(finalValue);
}

/**
 * Gets the display value for a numeric input, allowing empty string
 * @param {number|string|null|undefined} value - The numeric value
 * @param {number} defaultValue - Default value to show if value is null/undefined (optional)
 * @returns {string|number} - The value to display in the input
 */
export function getNumericInputValue(value, defaultValue = '') {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (value === '') {
    return '';
  }
  return value;
}