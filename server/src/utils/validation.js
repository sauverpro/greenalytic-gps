/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, missing: Array<string> }
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter((field) => !body[field]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Validate IMEI format (typically 15 digits)
 * @param {string} imei - IMEI to validate
 * @returns {boolean}
 */
export function validateIMEI(imei) {
  return /^\d{15}$/.test(imei);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function validatePhone(phone) {
  return /^[\d\s\-+()]+$/.test(phone);
}

/**
 * Validate timestamp (Unix timestamp in milliseconds)
 * @param {number|string} timestamp - Timestamp to validate
 * @returns {boolean}
 */
export function validateTimestamp(timestamp) {
  const ts = parseInt(timestamp, 10);
  return !isNaN(ts) && ts > 0 && ts < Date.now() + 86400000; // Not more than 1 day in future
}

/**
 * Validate latitude
 * @param {number|string} lat - Latitude to validate
 * @returns {boolean}
 */
export function validateLatitude(lat) {
  const latitude = parseFloat(lat);
  return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

/**
 * Validate longitude
 * @param {number|string} lon - Longitude to validate
 * @returns {boolean}
 */
export function validateLongitude(lon) {
  const longitude = parseFloat(lon);
  return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
}

/**
 * Sanitize string input (remove special characters)
 * @param {string} str - String to sanitize
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[<>'"]/g, '').trim();
}

/**
 * Validate and parse numeric value
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number}
 */
export function parseNumeric(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
