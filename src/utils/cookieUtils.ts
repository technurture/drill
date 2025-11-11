import Cookies from 'js-cookie';

const CUSTOMER_COOKIE_NAME = 'customer_session_id';

/**
 * Get or generate a customer cookie with 30-day expiry
 * @returns The customer cookie value
 */
export const getOrGenerateCustomerCookie = (): string => {
  let cookieValue = Cookies.get(CUSTOMER_COOKIE_NAME);
  
  if (!cookieValue) {
    // Generate a unique session ID for this customer
    cookieValue = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Set cookie with 30-day expiry
    Cookies.set(CUSTOMER_COOKIE_NAME, cookieValue, { expires: 30 });
  }
  
  return cookieValue;
};

/**
 * Get the current customer cookie value (without generating if missing)
 * @returns The customer cookie value or null if not found
 */
export const getCustomerCookie = (): string | null => {
  return Cookies.get(CUSTOMER_COOKIE_NAME) || null;
};

/**
 * Set a customer cookie with 30-day expiry
 * @param value The cookie value to set
 */
export const setCustomerCookie = (value: string): void => {
  Cookies.set(CUSTOMER_COOKIE_NAME, value, { expires: 30 });
};

/**
 * Remove the customer cookie
 */
export const removeCustomerCookie = (): void => {
  Cookies.remove(CUSTOMER_COOKIE_NAME);
};

/**
 * Check if customer cookie exists and is valid
 * @returns True if cookie exists, false otherwise
 */
export const hasValidCustomerCookie = (): boolean => {
  return !!Cookies.get(CUSTOMER_COOKIE_NAME);
};

/**
 * Get cookie expiry date (30 days from now)
 * @returns Date object representing when the cookie will expire
 */
export const getCookieExpiryDate = (): Date => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
};

/**
 * Check if cookie is about to expire (within specified days)
 * @param daysThreshold Number of days before expiry to consider "about to expire" (default: 7)
 * @returns True if cookie will expire within the threshold, false otherwise
 */
export const isCookieExpiringSoon = (daysThreshold: number = 7): boolean => {
  const cookieValue = Cookies.get(CUSTOMER_COOKIE_NAME);
  if (!cookieValue) return false;
  
  // Since js-cookie doesn't provide expiry info, we'll use a timestamp approach
  // We'll store the creation timestamp in the cookie value itself
  const cookieParts = cookieValue.split('_');
  if (cookieParts.length >= 2) {
    const timestamp = parseInt(cookieParts[1]);
    if (!isNaN(timestamp)) {
      const creationDate = new Date(timestamp);
      const expiryDate = new Date(creationDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      const warningDate = new Date(expiryDate.getTime() - (daysThreshold * 24 * 60 * 60 * 1000));
      
      return new Date() >= warningDate;
    }
  }
  
  return false;
};

/**
 * Get days remaining until cookie expires
 * @returns Number of days remaining, or null if cookie doesn't exist
 */
export const getDaysUntilCookieExpiry = (): number | null => {
  const cookieValue = Cookies.get(CUSTOMER_COOKIE_NAME);
  if (!cookieValue) return null;
  
  const cookieParts = cookieValue.split('_');
  if (cookieParts.length >= 2) {
    const timestamp = parseInt(cookieParts[1]);
    if (!isNaN(timestamp)) {
      const creationDate = new Date(timestamp);
      const expiryDate = new Date(creationDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    }
  }
  
  return null;
}; 