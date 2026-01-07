/**
 * Parse JSONP Data parameter
 * Data format: N'value1',N'value2',N'value3'
 * @param {string} data - JSONP Data parameter
 * @returns {Array<string>} Array of parsed values
 */
export function parseJsonPData(data) {
  if (!data) {
    return [];
  }

  // Remove N' prefix and ' suffix, then split by ','N'
  return data
    .split(',')
    .map((item) => item.replace(/^N'/, '').replace(/'$/, '').trim());
}

/**
 * Build JSONP Data parameter from values
 * @param {Array<string>} values - Array of values
 * @returns {string} JSONP Data string
 */
export function buildJsonPData(values) {
  return values.map((v) => `N'${v}'`).join(',');
}

/**
 * Send JSONP response
 * @param {Object} res - Express response
 * @param {string} callback - Callback function name
 * @param {Object} data - Response data
 */
export function sendJsonPResponse(res, callback, data) {
  const jsonpData = JSON.stringify(data);
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`${callback}(${jsonpData})`);
}

/**
 * Parse JSONP response from string
 * @param {string} response - JSONP response string
 * @returns {Object} Parsed data
 */
export function parseJsonPResponse(response) {
  const match = response.match(/\((.*)\)/s);
  if (!match) {
    throw new Error('Invalid JSONP response format');
  }
  return JSON.parse(match[1]);
}
