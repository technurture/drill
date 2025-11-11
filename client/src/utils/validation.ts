/**
 * Validates Nigerian phone numbers
 * @param phoneNumber - The phone number to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateNigerianPhoneNumber = (phoneNumber: string): { isValid: boolean; error?: string } => {
  const cleanPhone = phoneNumber.replace(/\s/g, '').trim();
  
  // Check if it starts with +234 or 0
  if (!cleanPhone.startsWith('+234') && !cleanPhone.startsWith('0')) {
    return {
      isValid: false,
      error: "Phone number must start with +234 or 0"
    };
  }
  
  // Validate length based on prefix
  if (cleanPhone.startsWith('+234')) {
    // +234 format: should be exactly 14 characters (+234 + 10 digits)
    if (cleanPhone.length !== 14) {
      return {
        isValid: false,
        error: "Phone number with +234 must be 14 characters (e.g., +2348012345678)"
      };
    }
    // Check if the part after +234 is exactly 10 digits
    const digitsAfterPrefix = cleanPhone.substring(4);
    if (!/^\d{10}$/.test(digitsAfterPrefix)) {
      return {
        isValid: false,
        error: "Invalid phone number format. After +234, enter exactly 10 digits"
      };
    }
  } else if (cleanPhone.startsWith('0')) {
    // 0 format: should be exactly 11 characters (0 + 10 digits)
    if (cleanPhone.length !== 11) {
      return {
        isValid: false,
        error: "Phone number starting with 0 must be 11 characters (e.g., 08012345678)"
      };
    }
    // Check if the part after 0 is exactly 10 digits
    const digitsAfterPrefix = cleanPhone.substring(1);
    if (!/^\d{10}$/.test(digitsAfterPrefix)) {
      return {
        isValid: false,
        error: "Invalid phone number format. After 0, enter exactly 10 digits"
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Formats a Nigerian phone number to a consistent format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number (always in +234 format)
 */
export const formatNigerianPhoneNumber = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\s/g, '').trim();
  
  if (cleanPhone.startsWith('+234')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('0')) {
    // Convert 0 format to +234 format
    return '+234' + cleanPhone.substring(1);
  }
  
  return cleanPhone; // Return as is if it doesn't match expected formats
};
