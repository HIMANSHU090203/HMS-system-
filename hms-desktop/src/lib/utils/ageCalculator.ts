/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth as Date object or ISO string
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date | string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}

/**
 * Format age as a readable string
 * @param dateOfBirth - Date of birth as Date object or ISO string
 * @returns Formatted age string (e.g., "25 years")
 */
export function formatAge(dateOfBirth: Date | string): string {
    const age = calculateAge(dateOfBirth);
    return `${age} year${age !== 1 ? 's' : ''}`;
}

/**
 * Validate that a date of birth is reasonable
 * @param dateOfBirth - Date of birth to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateDateOfBirth(dateOfBirth: Date | string): { isValid: boolean; error?: string } {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    // Check if date is valid
    if (isNaN(dob.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
    }

    // Check if date is in the future
    if (dob > today) {
        return { isValid: false, error: 'Date of birth cannot be in the future' };
    }

    // Check if age is reasonable (0-150 years)
    const age = calculateAge(dob);
    if (age < 0 || age > 150) {
        return { isValid: false, error: 'Age must be between 0 and 150 years' };
    }

    return { isValid: true };
}
